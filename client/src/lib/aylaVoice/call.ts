// client/src/lib/aylaVoice/call.ts
import type { StartError, VoiceApi } from "./api";
import type { CodeResult, Notice, ServerEvent } from "./protocol";

// One voice button call in the browser. The order matters (memory note
// voice-mic-never-joined.md): the microphone is granted FIRST, so a call is
// never created for a visitor who has not answered the permission prompt.
// Then an audio-only RTCPeerConnection with NO data channel (spec D1: only the
// server talks to the OpenAI session), the SDP offer and the intake (the form
// already went to /voice/intake: spec "Form intake", Q2) to our server, the
// answer applied, and once media is connected (connectionState
// "connected" and the remote track) /ready (Ayla greets) and the event stream.
// The browser APIs are injected (CallDeps) so bun can test this without a
// browser; the page passes the real ones.

export interface TrackLike { kind: string; enabled: boolean; stop(): void }
export interface StreamLike { getTracks(): TrackLike[]; getAudioTracks(): TrackLike[] }
export interface SenderLike { track: TrackLike | null; replaceTrack(t: TrackLike | null): Promise<void> }
/** The slice of RTCPeerConnection used here. */
export interface PeerLike {
  connectionState: string;
  ontrack: ((e: { track: TrackLike; streams: readonly StreamLike[] }) => void) | null;
  onconnectionstatechange: (() => void) | null;
  addTrack(track: TrackLike, stream: StreamLike): unknown;
  getSenders(): SenderLike[];
  createOffer(): Promise<{ type: string; sdp?: string }>;
  setLocalDescription(d: { type: string; sdp?: string }): Promise<void>;
  setRemoteDescription(d: { type: "answer"; sdp: string }): Promise<void>;
  close(): void;
}
export interface CallDeps {
  getUserMedia(c: { audio: Record<string, unknown> }): Promise<StreamLike>;
  createPeer(): PeerLike;
  api: VoiceApi;
  setTimeout(fn: () => void, ms: number): unknown;
  clearTimeout(id: unknown): void;
  /** Posts the form to /voice/intake again (the intake expired, or its call already took place); null when that failed. */
  renewIntake(): Promise<string | null>;
}
export type CallStatus = "mic" | "connecting" | "connected" | "ended";
export type CallFailure = { kind: "mic"; name: string } | { kind: "start"; error: StartError } | { kind: "connect" } | { kind: "dropped" };
export interface CallHandlers {
  onStatus(s: CallStatus): void;
  /** The microphone stream in use (at start, and after a device switch): the page's level watch reads it. */
  onMicStream(stream: StreamLike): void;
  onRemoteTrack(track: TrackLike, stream: StreamLike | null): void;
  onEvent(e: ServerEvent): void;
  onFailure(f: CallFailure): void;
}
export interface VoiceCall {
  end(): Promise<void>;
  endOnPageHide(): void;
  setMuted(muted: boolean): void;
  switchMicrophone(deviceId: string): Promise<boolean>;
  sendCode(code: string): Promise<CodeResult>;
  notice(n: Notice): void;
}

/** Media must connect within this after the answer, or the call is given up (the server gives up at 15 s too). */
export const CONNECT_TIMEOUT_MS = 15_000;
export const MIC_CONSTRAINTS = Object.freeze({ echoCancellation: true, noiseSuppression: true, autoGainControl: true });

export async function startVoiceCall(d: CallDeps, intake: string, h: CallHandlers): Promise<VoiceCall | null> {
  h.onStatus("mic");
  let mic: StreamLike;
  try {
    mic = await d.getUserMedia({ audio: { ...MIC_CONSTRAINTS } });
  } catch (e) {
    h.onFailure({ kind: "mic", name: (e as { name?: string } | null)?.name || "NotAllowedError" });
    return null;
  }
  h.onMicStream(mic);
  h.onStatus("connecting");
  const pc = d.createPeer();
  const abort = new AbortController();
  let token = "";
  let ended = false;
  let connected = false;
  let remote = false;
  let muted = false;
  let connectTimer: unknown = null;

  const stopAll = () => {
    if (ended) return;
    ended = true;
    if (connectTimer !== null) d.clearTimeout(connectTimer);
    abort.abort();
    for (const t of mic.getTracks()) t.stop();
    try {
      pc.close();
    } catch {
      /* already closed */
    }
  };
  const fail = (f: CallFailure) => {
    if (ended) return;
    if (token) void d.api.end(token);
    stopAll();
    h.onFailure(f);
  };
  const onEvent = (e: ServerEvent) => {
    if (ended) return;
    h.onEvent(e);
    if (e.type === "ended") {
      stopAll();
      h.onStatus("ended");
    }
  };
  const maybeReady = () => {
    if (connected || ended || !token || !remote || pc.connectionState !== "connected") return;
    connected = true;
    if (connectTimer !== null) d.clearTimeout(connectTimer);
    connectTimer = null;
    h.onStatus("connected");
    void d.api.ready(token);
    // A lost stream only stops the panels; the call itself goes on.
    void d.api.events(token, onEvent, abort.signal).catch(() => {});
  };
  pc.ontrack = (e) => {
    remote = true;
    h.onRemoteTrack(e.track, e.streams[0] ?? null);
    maybeReady();
  };
  pc.onconnectionstatechange = () => {
    if (pc.connectionState === "connected") return maybeReady();
    if ((pc.connectionState === "failed" || pc.connectionState === "closed") && !ended) fail(connected ? { kind: "dropped" } : { kind: "connect" });
  };

  try {
    // Audio only, and no data channel (spec D1).
    for (const t of mic.getAudioTracks()) pc.addTrack(t, mic);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    const sdp = offer.sdp ?? "";
    let r = await d.api.start({ sdp, intake });
    // 404 intake_not_found / 409 intake_used: one fresh intake, then the same offer again (no session was created).
    if (!r.ok && (r.error === "intake_not_found" || r.error === "intake_used")) {
      const fresh = await d.renewIntake();
      if (fresh) r = await d.api.start({ sdp, intake: fresh });
    }
    if (!r.ok) {
      stopAll();
      h.onFailure({ kind: "start", error: r.error });
      return null;
    }
    token = r.token;
    connectTimer = d.setTimeout(() => fail({ kind: "connect" }), CONNECT_TIMEOUT_MS);
    await pc.setRemoteDescription({ type: "answer", sdp: r.answer });
    maybeReady();
  } catch {
    fail({ kind: "connect" });
    return null;
  }

  return {
    async end() {
      if (ended) return;
      const sent = d.api.end(token);
      stopAll();
      await sent;
      h.onStatus("ended");
    },
    endOnPageHide() {
      if (ended) return;
      d.api.endBeacon(token);
      stopAll();
    },
    setMuted(m) {
      muted = m;
      for (const t of mic.getAudioTracks()) t.enabled = !m;
    },
    async switchMicrophone(deviceId) {
      try {
        const next = await d.getUserMedia({ audio: { ...MIC_CONSTRAINTS, deviceId: { exact: deviceId } } });
        const track = next.getAudioTracks()[0];
        const sender = pc.getSenders().find((s) => s.track?.kind === "audio");
        if (!track || !sender || ended) {
          for (const t of next.getTracks()) t.stop();
          return false;
        }
        // The new device keeps the call's mute state.
        track.enabled = !muted;
        await sender.replaceTrack(track);
        for (const t of mic.getTracks()) t.stop();
        mic = next;
        h.onMicStream(next);
        return true;
      } catch {
        return false;
      }
    },
    sendCode: (code) => (token && !ended ? d.api.code(token, code) : Promise.resolve<CodeResult>("busy")),
    notice: (n) => {
      if (token && !ended) void d.api.notice(token, n);
    },
  };
}
