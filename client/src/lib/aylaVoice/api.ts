// client/src/lib/aylaVoice/api.ts
import type { VoiceForm } from "./form";
import type { CodeResult, Notice, ServerEvent } from "./protocol";
import { createEventParser } from "./sse";

// The voice button's endpoints on agents.potential.com (plan B' Task 19). The
// call token goes only in POST bodies. Errors never throw out of here except
// from events() (the caller decides whether a lost stream matters).

export type StartError = "bad_request" | "rate_limited" | "busy" | "unavailable" | "network";
export type StartResult = { ok: true; answer: string; token: string; maxSeconds: number } | { ok: false; error: StartError };

export interface VoiceApi {
  status(): Promise<boolean>;
  start(i: { sdp: string; form: VoiceForm; page: string }): Promise<StartResult>;
  ready(token: string): Promise<boolean>;
  events(token: string, onEvent: (e: ServerEvent) => void, signal: AbortSignal): Promise<void>;
  code(token: string, code: string): Promise<CodeResult>;
  notice(token: string, notice: Notice): Promise<void>;
  end(token: string): Promise<void>;
  /** For pagehide: a text/plain beacon (no preflight). false when the browser has none or refused it. */
  endBeacon(token: string): boolean;
}

export interface ApiDeps {
  fetch: typeof fetch;
  sendBeacon?: (url: string, data: Blob) => boolean;
  statusTimeoutMs?: number;
}

export function voiceApi(base: string, d: ApiDeps): VoiceApi {
  const url = (p: string) => `${base.replace(/\/+$/, "")}/api/ayla/voice/${p}`;
  const post = (p: string, body: unknown, init: RequestInit = {}) =>
    d.fetch(url(p), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), ...init });
  return {
    async status() {
      try {
        const r = await d.fetch(url("status"), { signal: AbortSignal.timeout(d.statusTimeoutMs ?? 2000) });
        if (!r.ok) return false;
        return (await r.json())?.available === true;
      } catch {
        return false;
      }
    },
    async start(i) {
      let r: Response;
      try {
        r = await post("session", i);
      } catch {
        return { ok: false, error: "network" };
      }
      if (r.status === 201) {
        try {
          const j = await r.json();
          if (typeof j?.answer === "string" && typeof j?.token === "string") return { ok: true, answer: j.answer, token: j.token, maxSeconds: Number(j.maxSeconds) || 600 };
        } catch {
          /* fall through */
        }
        return { ok: false, error: "unavailable" };
      }
      if (r.status === 400 || r.status === 413) return { ok: false, error: "bad_request" };
      if (r.status === 429) return { ok: false, error: "rate_limited" };
      if (r.status === 503) {
        const j = await r.json().catch(() => null);
        return { ok: false, error: j?.error === "busy" ? "busy" : "unavailable" };
      }
      return { ok: false, error: "unavailable" };
    },
    async ready(token) {
      try {
        return (await post("ready", { token })).status === 204;
      } catch {
        return false;
      }
    },
    async events(token, onEvent, signal) {
      const r = await post("events", { token }, { signal });
      if (!r.ok || !r.body) throw new Error(`events ${r.status}`);
      const parser = createEventParser(onEvent);
      const reader = r.body.getReader();
      const dec = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        parser.push(dec.decode(value, { stream: true }));
      }
      parser.end();
    },
    async code(token, code) {
      try {
        const r = await post("code", { token, code });
        if (r.status !== 200) return r.status === 400 ? "failed" : "busy";
        const res = (await r.json())?.result;
        return res === "verified" || res === "failed" || res === "capped" ? res : "busy";
      } catch {
        return "busy";
      }
    },
    async notice(token, notice) {
      try {
        await post("notice", { token, notice });
      } catch {
        /* best effort */
      }
    },
    async end(token) {
      try {
        await post("end", { token }, { keepalive: true });
      } catch {
        /* best effort: the server's limits end the call anyway */
      }
    },
    endBeacon(token) {
      if (!d.sendBeacon) return false;
      return d.sendBeacon(url("end"), new Blob([JSON.stringify({ token })], { type: "text/plain" }));
    },
  };
}
