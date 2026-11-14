// client/src/lib/aylaVoice/api.test.ts
import { describe, expect, it } from "vitest";
import { voiceApi } from "./api";
import type { ServerEvent } from "./protocol";

const BASE = "https://agents.potential.com/";
const TOKEN = "t".repeat(43);
const FORM = { firstName: "Mona", lastName: "Haddad", email: "mona@example.com", organisation: "Acme", role: "CEO" };
const INTAKE = "i".repeat(43);

function fakeFetch(answer: (url: string, init: RequestInit) => Response | Promise<Response>) {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const f = (async (url: string, init: RequestInit = {}) => {
    calls.push({ url, init });
    return answer(url, init);
  }) as unknown as typeof fetch;
  return { f, calls };
}
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

describe("voiceApi", () => {
  it("status: true only for {available:true}; false on any error", async () => {
    expect(await voiceApi(BASE, { fetch: fakeFetch(() => json(200, { available: true })).f }).status()).toBe(true);
    expect(await voiceApi(BASE, { fetch: fakeFetch(() => json(200, { available: false })).f }).status()).toBe(false);
    expect(await voiceApi(BASE, { fetch: fakeFetch(() => { throw new TypeError("offline"); }).f }).status()).toBe(false);
  });
  it("intake (Q2): posts the form and the page; the intake comes back; each failure has its name", async () => {
    const ok = fakeFetch(() => json(201, { intake: INTAKE, expiresInSeconds: 900 }));
    expect(await voiceApi(BASE, { fetch: ok.f }).intake({ form: FORM, page: "/ayla" })).toEqual({ ok: true, intake: INTAKE });
    expect(ok.calls[0]!.url).toBe("https://agents.potential.com/api/ayla/voice/intake");
    expect(ok.calls[0]!.init.method).toBe("POST");
    expect(JSON.parse(String(ok.calls[0]!.init.body))).toEqual({ form: FORM, page: "/ayla" });
    const cases: Array<[Response, string]> = [
      [json(400, { error: "bad_request" }), "bad_request"], [json(403, { error: "origin" }), "origin"], [json(413, { error: "too_large" }), "bad_request"],
      [json(429, { error: "rate_limited" }), "rate_limited"], [json(503, { error: "busy" }), "unavailable"], [json(503, { error: "unavailable" }), "unavailable"],
      [json(201, { nope: true }), "unavailable"], [json(500, {}), "unavailable"],
    ];
    for (const [res, error] of cases) expect(await voiceApi(BASE, { fetch: fakeFetch(() => res).f }).intake({ form: FORM, page: "/ayla" })).toEqual({ ok: false, error });
    expect(await voiceApi(BASE, { fetch: fakeFetch(() => { throw new TypeError("x"); }).f }).intake({ form: FORM, page: "/ayla" })).toEqual({ ok: false, error: "network" });
  });
  it("start: posts the offer and the intake (no form: Q2) as JSON; maps the server's answers", async () => {
    const ok = fakeFetch(() => json(201, { answer: "v=0\r\nA", token: TOKEN, maxSeconds: 600 }));
    expect(await voiceApi(BASE, { fetch: ok.f }).start({ sdp: "v=0", intake: INTAKE })).toEqual({ ok: true, answer: "v=0\r\nA", token: TOKEN, maxSeconds: 600 });
    expect(ok.calls[0]!.url).toBe("https://agents.potential.com/api/ayla/voice/session");
    expect(ok.calls[0]!.init.method).toBe("POST");
    expect(JSON.parse(String(ok.calls[0]!.init.body))).toEqual({ sdp: "v=0", intake: INTAKE });
    for (const c of ok.calls) expect(c.url).not.toContain(INTAKE);
    const cases: Array<[Response, string]> = [
      [json(429, { error: "rate_limited" }), "rate_limited"], [json(503, { error: "busy" }), "busy"], [json(503, { error: "unavailable" }), "unavailable"],
      [json(502, { error: "unavailable" }), "unavailable"], [json(400, { error: "bad_request" }), "bad_request"],
      [json(404, { error: "intake_not_found" }), "intake_not_found"], [json(409, { error: "intake_used" }), "intake_used"],
    ];
    for (const [res, error] of cases) expect(await voiceApi(BASE, { fetch: fakeFetch(() => res).f }).start({ sdp: "v=0", intake: INTAKE })).toEqual({ ok: false, error });
    expect(await voiceApi(BASE, { fetch: fakeFetch(() => { throw new TypeError("x"); }).f }).start({ sdp: "v=0", intake: INTAKE })).toEqual({ ok: false, error: "network" });
  });
  it("events: reads the stream until it ends", async () => {
    const body = 'data: {"type":"state","panel":"code","code":"idle","bookingUrl":null}\n\n: ping\n\ndata: {"type":"ended","reason":"ayla_ended"}\n\n';
    const { f, calls } = fakeFetch(() => new Response(body, { status: 200, headers: { "Content-Type": "text/event-stream" } }));
    const got: ServerEvent[] = [];
    await voiceApi(BASE, { fetch: f }).events(TOKEN, (e) => got.push(e), new AbortController().signal);
    expect(got.map((e) => e.type)).toEqual(["state", "ended"]);
    expect(JSON.parse(String(calls[0]!.init.body))).toEqual({ token: TOKEN });
  });
  it("code, ready, notice and end post the token in the body (never the URL)", async () => {
    const { f, calls } = fakeFetch((url) => (url.endsWith("/code") ? json(200, { result: "verified" }) : new Response(null, { status: 204 })));
    const api = voiceApi(BASE, { fetch: f });
    expect(await api.code(TOKEN, "482913")).toBe("verified");
    expect(await api.ready(TOKEN)).toBe(true);
    await api.notice(TOKEN, "chatbot_ready");
    await api.end(TOKEN);
    expect(calls.map((c) => c.url.replace("https://agents.potential.com/api/ayla/voice/", ""))).toEqual(["code", "ready", "notice", "end"]);
    for (const c of calls) expect(c.url).not.toContain(TOKEN);
    expect(JSON.parse(String(calls[2]!.init.body))).toEqual({ token: TOKEN, notice: "chatbot_ready" });
    expect(calls[3]!.init.keepalive).toBe(true);
  });
  it("code: anything but a clear result is busy", async () => {
    expect(await voiceApi(BASE, { fetch: fakeFetch(() => json(429, {})).f }).code(TOKEN, "482913")).toBe("busy");
    expect(await voiceApi(BASE, { fetch: fakeFetch(() => json(200, { result: "weird" })).f }).code(TOKEN, "482913")).toBe("busy");
  });
  it("endBeacon: a text/plain beacon to /end with the token", async () => {
    const sent: Array<[string, Blob]> = [];
    const api = voiceApi(BASE, { fetch: fakeFetch(() => json(200, {})).f, sendBeacon: (u, d) => (sent.push([u, d]), true) });
    expect(api.endBeacon(TOKEN)).toBe(true);
    expect(sent[0]![0]).toBe("https://agents.potential.com/api/ayla/voice/end");
    expect(sent[0]![1].type).toMatch(/^text\/plain/);
    expect(JSON.parse(await sent[0]![1].text())).toEqual({ token: TOKEN });
  });
});
