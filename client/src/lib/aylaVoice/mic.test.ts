// client/src/lib/aylaVoice/mic.test.ts
import { describe, expect, it } from "vitest";
import { NO_AUDIO_MS, createSilenceWatch, micErrorMessage, rms, shouldAutoRetry } from "./mic";

describe("micErrorMessage", () => {
  it("tells denied, missing and busy microphones apart (the existing modal's words)", () => {
    expect(micErrorMessage("NotFoundError")).toMatch(/could not find a microphone/);
    expect(micErrorMessage("OverconstrainedError")).toMatch(/could not find a microphone/);
    expect(micErrorMessage("NotReadableError")).toMatch(/in use by another app/);
    expect(micErrorMessage("NotAllowedError")).toMatch(/Allow it in your browser settings/);
    expect(micErrorMessage("NoApi")).toMatch(/cannot open a microphone/);
  });
});

describe("the level watch", () => {
  it("rms of silence is 0, of a full-scale square wave 1", () => {
    expect(rms([0, 0, 0])).toBe(0);
    expect(rms([1, -1, 1, -1])).toBe(1);
    expect(rms([])).toBe(0);
  });
  it("warns after NO_AUDIO_MS under the noise floor; a sound or a reset starts it again", () => {
    const w = createSilenceWatch(0);
    w.level(0.001, 5_000);
    expect(w.silent(NO_AUDIO_MS)).toBe(false);
    expect(w.silent(NO_AUDIO_MS + 1)).toBe(true);
    w.level(0.2, 11_000);
    expect(w.silent(20_000)).toBe(false);
    w.reset(30_000);
    expect(w.silent(39_000)).toBe(false);
  });
});

describe("shouldAutoRetry", () => {
  const fresh = { heardAnything: false, alreadyRetried: false };
  it("once, silently, only for a call that failed before anyone spoke", () => {
    expect(shouldAutoRetry({ cause: { kind: "connect" }, ...fresh })).toBe(true);
    expect(shouldAutoRetry({ cause: { kind: "connect" }, heardAnything: true, alreadyRetried: false })).toBe(false);
    expect(shouldAutoRetry({ cause: { kind: "connect" }, heardAnything: false, alreadyRetried: true })).toBe(false);
  });
  it("retries a connection failure: WebRTC never connected or dropped, the network failed, or the server ended the call with an error", () => {
    expect(shouldAutoRetry({ cause: { kind: "connect" }, ...fresh })).toBe(true);
    expect(shouldAutoRetry({ cause: { kind: "dropped" }, ...fresh })).toBe(true);
    expect(shouldAutoRetry({ cause: { kind: "start", error: "network" }, ...fresh })).toBe(true);
    expect(shouldAutoRetry({ cause: { kind: "ended", reason: "error" }, ...fresh })).toBe(true);
  });
  it("retries a 502 from /session once (the brain's OpenAI call-create failing transiently: the cold start)", () => {
    expect(shouldAutoRetry({ cause: { kind: "start", error: "upstream" }, ...fresh })).toBe(true);
    expect(shouldAutoRetry({ cause: { kind: "start", error: "upstream" }, heardAnything: false, alreadyRetried: true })).toBe(false);
  });
  it("never retries a server refusal of /session (4xx or busy): a second post only burns the visitor's IP allowance", () => {
    for (const error of ["rate_limited", "bad_request", "busy", "intake_not_found", "intake_used", "unavailable"] as const) {
      expect(shouldAutoRetry({ cause: { kind: "start", error }, ...fresh })).toBe(false);
    }
  });
  it("never retries a microphone problem or a call that ended normally", () => {
    expect(shouldAutoRetry({ cause: { kind: "mic", name: "NotAllowedError" }, ...fresh })).toBe(false);
    for (const reason of ["caller_hung_up", "time_limit", "ayla_ended", "silence"] as const) {
      expect(shouldAutoRetry({ cause: { kind: "ended", reason }, ...fresh })).toBe(false);
    }
  });
});
