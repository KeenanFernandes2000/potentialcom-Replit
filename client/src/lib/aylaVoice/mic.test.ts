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
  it("once, silently, only for a call that failed before anyone spoke", () => {
    expect(shouldAutoRetry({ failed: true, heardAnything: false, alreadyRetried: false })).toBe(true);
    expect(shouldAutoRetry({ failed: true, heardAnything: true, alreadyRetried: false })).toBe(false);
    expect(shouldAutoRetry({ failed: true, heardAnything: false, alreadyRetried: true })).toBe(false);
    expect(shouldAutoRetry({ failed: false, heardAnything: false, alreadyRetried: false })).toBe(false);
  });
});
