// client/src/lib/aylaVoice/protocol.test.ts
import { describe, expect, it } from "vitest";
import { INITIAL_VIEW, NOTICES, TRANSCRIPT_NOTICE, applyEvent, closePanel, endMessage, parseServerEvent, safeBookingUrl } from "./protocol";

const REF = `voice_abcdefghijklmnopqrstuv.1765706400.${"a".repeat(43)}`;
const URL_OK = `https://crm.potentiallead.com/book/rawzaba?embed=1&ref=${REF}`;

describe("safeBookingUrl", () => {
  it("only the CRM's embedded booking page with a signed ref", () => {
    expect(safeBookingUrl(URL_OK)).toBe(URL_OK);
    for (const bad of [null, "", "https://evil.example/book/rawzaba?embed=1&ref=" + REF, `${URL_OK}&x=1`, "javascript:alert(1)", 42]) expect(safeBookingUrl(bad)).toBeNull();
  });
});

describe("parseServerEvent", () => {
  it("reads the three event types and refuses anything else", () => {
    expect(parseServerEvent({ type: "state", panel: "booking", code: "idle", bookingUrl: URL_OK })).toEqual({ type: "state", panel: "booking", code: "idle", bookingUrl: URL_OK });
    expect(parseServerEvent({ type: "state", panel: null, code: "idle", bookingUrl: "https://evil.example" })).toEqual({ type: "state", panel: null, code: "idle", bookingUrl: null });
    expect(parseServerEvent({ type: "caption", role: "assistant", text: "Hi" })).toEqual({ type: "caption", role: "assistant", text: "Hi" });
    expect(parseServerEvent({ type: "ended", reason: "time_limit" })).toEqual({ type: "ended", reason: "time_limit" });
    expect(parseServerEvent({ type: "ended", reason: "weird" })).toEqual({ type: "ended", reason: "error" });
    for (const bad of [null, "x", { type: "state", panel: "popup", code: "idle" }, { type: "caption", role: "system", text: "x" }, { type: "session.update" }]) expect(parseServerEvent(bad)).toBeNull();
  });
});

describe("the view", () => {
  it("follows the server's panel state and keeps captions", () => {
    let v = applyEvent(INITIAL_VIEW, { type: "state", panel: "code", code: "idle", bookingUrl: null });
    v = applyEvent(v, { type: "caption", role: "assistant", text: "A code is on its way." });
    v = applyEvent(v, { type: "state", panel: "code", code: "verified", bookingUrl: null });
    expect(v).toMatchObject({ panel: "code", code: "verified", captions: [{ role: "assistant", text: "A code is on its way." }], ended: null });
  });
  it("a panel the visitor closed stays closed until the server's state changes", () => {
    let v = applyEvent(INITIAL_VIEW, { type: "state", panel: "chatbot_demo", code: "idle", bookingUrl: null });
    v = closePanel(v);
    expect(v.panel).toBeNull();
    v = applyEvent(v, { type: "state", panel: "chatbot_demo", code: "idle", bookingUrl: null });
    expect(v.panel).toBeNull();
    v = applyEvent(v, { type: "state", panel: "booking", code: "idle", bookingUrl: URL_OK });
    expect(v).toMatchObject({ panel: "booking", bookingUrl: URL_OK });
  });
  it("a booking state without a safe URL opens nothing", () => {
    expect(applyEvent(INITIAL_VIEW, { type: "state", panel: "booking", code: "idle", bookingUrl: null }).panel).toBeNull();
  });
  it("records the end", () => {
    expect(applyEvent(INITIAL_VIEW, { type: "ended", reason: "silence" }).ended).toBe("silence");
  });
});

describe("endMessage and notices", () => {
  it("a goodbye closes quietly; the others explain", () => {
    expect(endMessage("caller_hung_up")).toBeNull();
    expect(endMessage("ayla_ended")).toBeNull();
    expect(endMessage("time_limit")!.title).toBe("We ran out of time on this call.");
    expect(endMessage("silence")!.title).toBe("The call ended after a long silence.");
    expect(endMessage("error")!.title).toBe("The call ended unexpectedly.");
  });
  it("the notices are the server's list", () => {
    expect([...NOTICES]).toEqual([
      "chatbot_creating", "chatbot_ready", "chatbot_ready_no_scrape", "chatbot_failed", "chatbot_limited",
      "voice_agent_creating", "voice_agent_ready", "voice_agent_ready_no_scrape", "voice_agent_failed", "voice_agent_limited",
    ]);
  });
});

describe("the call-start notice (Mamoon, 14 Nov)", () => {
  it("is the approved wording, word for word", () => {
    expect(TRANSCRIPT_NOTICE).toBe("This conversation is transcribed so our team can follow up.");
  });
});
