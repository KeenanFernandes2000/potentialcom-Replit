// client/src/lib/aylaVoice/protocol.ts
// What agents.potential.com's voice button sends the page (plan B' Task 19)
// and how the page shows it. The server decides the panels from Ayla's tool
// calls; the page only renders them. Everything from the stream is checked
// here before React sees it.

export type Panel = "code" | "booking" | "chatbot_demo" | "voice_agent_demo" | null;
export type CodeStatus = "idle" | "checking" | "verified" | "failed" | "capped";
export type EndReason = "caller_hung_up" | "time_limit" | "ayla_ended" | "silence" | "error";
export type CodeResult = "verified" | "failed" | "capped" | "busy";
export interface Caption { role: "caller" | "assistant"; text: string }
export type ServerEvent =
  | { type: "state"; panel: Panel; code: CodeStatus; bookingUrl: string | null }
  | ({ type: "caption" } & Caption)
  | { type: "ended"; reason: EndReason };

export const NOTICES = [
  "chatbot_creating", "chatbot_ready", "chatbot_ready_no_scrape", "chatbot_failed", "chatbot_limited",
  "voice_agent_creating", "voice_agent_ready", "voice_agent_ready_no_scrape", "voice_agent_failed", "voice_agent_limited",
] as const;
export type Notice = (typeof NOTICES)[number];

const PANELS = new Set(["code", "booking", "chatbot_demo", "voice_agent_demo"]);
const CODES = new Set(["idle", "checking", "verified", "failed", "capped"]);
const ENDS = new Set(["caller_hung_up", "time_limit", "ayla_ended", "silence", "error"]);

/** Rawzaba's booking page, embedded, with our signed reference. */
export const BOOKING_EMBED_PREFIX = "https://crm.potentiallead.com/book/rawzaba?embed=1&ref=";
/** potential-ai src/web/bookingRef.ts: <conversationId>.<exp>.<43-char base64url HMAC>. */
const REF = /^[A-Za-z0-9_-]{1,100}\.\d{1,12}\.[A-Za-z0-9_-]{43}$/;

/** The URL when it is exactly the CRM's embedded booking page with a signed ref; otherwise null. */
export function safeBookingUrl(url: unknown): string | null {
  if (typeof url !== "string" || !url.startsWith(BOOKING_EMBED_PREFIX)) return null;
  return REF.test(url.slice(BOOKING_EMBED_PREFIX.length)) ? url : null;
}

export function parseServerEvent(raw: unknown): ServerEvent | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const e = raw as Record<string, unknown>;
  if (e.type === "state") {
    const panel = e.panel === null ? null : PANELS.has(String(e.panel)) ? (e.panel as Panel) : undefined;
    if (panel === undefined || !CODES.has(String(e.code))) return null;
    return { type: "state", panel, code: e.code as CodeStatus, bookingUrl: safeBookingUrl(e.bookingUrl) };
  }
  if (e.type === "caption") {
    if ((e.role !== "caller" && e.role !== "assistant") || typeof e.text !== "string") return null;
    return { type: "caption", role: e.role, text: e.text.slice(0, 1000) };
  }
  if (e.type === "ended") return { type: "ended", reason: ENDS.has(String(e.reason)) ? (e.reason as EndReason) : "error" };
  return null;
}

export interface CallView {
  panel: Panel;
  code: CodeStatus;
  bookingUrl: string | null;
  captions: Caption[];
  ended: EndReason | null;
  /** The panel the visitor closed (and its code status): not reopened by the same state. */
  dismissed: { panel: Panel; code: CodeStatus } | null;
}
export const INITIAL_VIEW: CallView = Object.freeze({ panel: null, code: "idle", bookingUrl: null, captions: [], ended: null, dismissed: null }) as CallView;
export const MAX_CAPTIONS = 200;

export function applyEvent(v: CallView, e: ServerEvent): CallView {
  switch (e.type) {
    case "state": {
      const hidden = v.dismissed !== null && v.dismissed.panel === e.panel && v.dismissed.code === e.code;
      // A booking panel needs a safe URL to show anything.
      const panel = e.panel === "booking" && !e.bookingUrl ? v.panel : e.panel;
      return { ...v, panel: hidden ? null : panel, code: e.code, bookingUrl: e.bookingUrl ?? v.bookingUrl, dismissed: hidden ? v.dismissed : null };
    }
    case "caption":
      return { ...v, captions: [...v.captions, { role: e.role, text: e.text }].slice(-MAX_CAPTIONS) };
    case "ended":
      return { ...v, ended: e.reason };
  }
}

/** The visitor closed the panel. */
export function closePanel(v: CallView): CallView {
  return v.panel ? { ...v, panel: null, dismissed: { panel: v.panel, code: v.code } } : v;
}

/** What to tell the visitor when the call ended; null for a goodbye (the modal just closes). */
export function endMessage(reason: EndReason): { title: string; detail: string } | null {
  if (reason === "caller_hung_up" || reason === "ayla_ended") return null;
  if (reason === "time_limit")
    return { title: "We ran out of time on this call.", detail: "Ayla's calls are up to 10 minutes. Start again to carry on, or book a session with a consultant." };
  if (reason === "silence") return { title: "The call ended after a long silence.", detail: "Start again when you're ready, or book a session with a consultant." };
  return { title: "The call ended unexpectedly.", detail: "Sorry — that one is on us. Try again, or book a session with a consultant." };
}
