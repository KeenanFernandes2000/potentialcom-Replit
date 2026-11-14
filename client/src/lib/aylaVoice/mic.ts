// client/src/lib/aylaVoice/mic.ts
// The microphone lessons from Ayla's Vapi calls (memory notes
// ayla-voice-advisor.md, voice-mic-never-joined.md): the microphone is asked
// for before the call exists; "denied", "no microphone" and "in use" get their
// own words; 10 s under the noise floor on a live call shows a warning and the
// device list; a call that dies before anyone spoke is retried once, silently.

import type { CallFailure } from "./call";
import type { EndReason } from "./protocol";

export const NO_AUDIO_MS = 10_000;
export const NOISE_FLOOR = 0.02;

export function micErrorMessage(name: string): string {
  if (name === "NoApi") return "This browser cannot open a microphone. Try Chrome, Edge or Safari — or book a session with a consultant instead.";
  if (name === "NotFoundError" || name === "OverconstrainedError")
    return "We could not find a microphone on this device. Plug one in and try again, or book a session with a consultant instead.";
  if (name === "NotReadableError") return "Your microphone is in use by another app. Close the other call or recording, then try again.";
  return "Microphone access is required for this call. Allow it in your browser settings, then try again.";
}

/** Root mean square of time-domain samples (-1..1). */
export function rms(samples: ArrayLike<number>): number {
  if (!samples.length) return 0;
  let sum = 0;
  for (let i = 0; i < samples.length; i++) sum += samples[i]! * samples[i]!;
  return Math.sqrt(sum / samples.length);
}

/** Tracks when the microphone was last above the noise floor. */
export function createSilenceWatch(startAt: number, limitMs = NO_AUDIO_MS) {
  let last = startAt;
  return {
    level(l: number, at: number) {
      if (l > NOISE_FLOOR) last = at;
    },
    reset(at: number) {
      last = at;
    },
    silent(at: number) {
      return at - last > limitMs;
    },
  };
}

/** Why the call stopped: a failure from the call runner, or the server's `ended` event. */
export type RetryCause = CallFailure | { kind: "ended"; reason: EndReason };

/**
 * Retried once, silently, only when the connection failed (WebRTC never
 * connected or dropped, /session never reached the server, or the server ended
 * the call with an error) and nobody had spoken yet. Never after the server
 * refused /session (4xx, busy, or an "unavailable" answer): the server
 * already counted that request against the visitor's IP, and asking again
 * at once would only use up more of it.
 */
export function shouldAutoRetry(i: { cause: RetryCause; heardAnything: boolean; alreadyRetried: boolean }): boolean {
  if (i.heardAnything || i.alreadyRetried) return false;
  const c = i.cause;
  if (c.kind === "connect" || c.kind === "dropped") return true;
  if (c.kind === "start") return c.error === "network";
  if (c.kind === "ended") return c.reason === "error";
  return false;
}
