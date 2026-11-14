// client/src/lib/aylaVoice/call.test.ts
import { describe, expect, it } from "vitest";
import type { StartResult, VoiceApi } from "./api";
import {
  CONNECT_TIMEOUT_MS, startVoiceCall, type CallDeps, type CallFailure, type CallHandlers, type PeerLike, type SenderLike, type StreamLike, type TrackLike,
} from "./call";
import type { ServerEvent } from "./protocol";

const TOKEN = "t".repeat(43);
const OFFER = "v=0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n";
const FORM = { firstName: "Mona", lastName: "Haddad", email: "mona@example.com", organisation: "Acme", role: "CEO", phone: "+971 544043860" };

class FakeTrack implements TrackLike {
  kind = "audio";
  enabled = true;
  stopped = false;
  constructor(readonly id: string) {}
  stop() { this.stopped = true; }
}
class FakeStream implements StreamLike {
  constructor(readonly tracks: FakeTrack[]) {}
  getTracks() { return this.tracks; }
  getAudioTracks() { return this.tracks; }
}
class FakePeer implements PeerLike {
  connectionState = "new";
  ontrack: PeerLike["ontrack"] = null;
  onconnectionstatechange: PeerLike["onconnectionstatechange"] = null;
  added: FakeTrack[] = [];
  senders: SenderLike[] = [];
  dataChannels = 0;
  closed = false;
  remote: string | null = null;
  addTrack(t: TrackLike) {
    this.added.push(t as FakeTrack);
    const s: SenderLike = { track: t, replaceTrack: async (n) => { s.track = n; } };
    this.senders.push(s);
  }
  getSenders() { return this.senders; }
  createDataChannel() { this.dataChannels++; return {}; }
  async createOffer() { return { type: "offer", sdp: OFFER }; }
  async setLocalDescription() {}
  async setRemoteDescription(d: { type: "answer"; sdp: string }) { this.remote = d.sdp; }
  close() { this.closed = true; this.connectionState = "closed"; }
  /** Media connected: the remote track arrives and the state changes. */
  connect() {
    this.connectionState = "connected";
    this.ontrack?.({ track: new FakeTrack("remote"), streams: [] });
    this.onconnectionstatechange?.();
  }
}

function setup(o: { mic?: "denied"; start?: StartResult } = {}) {
  const order: string[] = [];
  const peers: FakePeer[] = [];
  const timers: Array<{ fn: () => void; ms: number; cancelled: boolean }> = [];
  const calls: Array<[string, unknown]> = [];
  const status: string[] = [];
  const failures: CallFailure[] = [];
  const events: ServerEvent[] = [];
  const micStreams: StreamLike[] = [];
  let push: ((e: ServerEvent) => void) | null = null;
  const mic = new FakeStream([new FakeTrack("mic1")]);
  const api: VoiceApi = {
    status: async () => true,
    start: async (i) => { order.push("start"); calls.push(["start", i]); return o.start ?? { ok: true, answer: "v=0\r\nANSWER", token: TOKEN, maxSeconds: 600 }; },
    ready: async (t) => { calls.push(["ready", t]); return true; },
    events: (t, fn) => { calls.push(["events", t]); push = fn; return new Promise<void>(() => {}); },
    code: async (t, c) => { calls.push(["code", [t, c]]); return "verified"; },
    notice: async (t, n) => { calls.push(["notice", [t, n]]); },
    end: async (t) => { calls.push(["end", t]); },
    endBeacon: (t) => { calls.push(["beacon", t]); return true; },
  };
  const deps: CallDeps = {
    getUserMedia: async (c) => {
      order.push("getUserMedia");
      calls.push(["getUserMedia", c]);
      if (o.mic === "denied") throw Object.assign(new Error("denied"), { name: "NotAllowedError" });
      return (c.audio as { deviceId?: unknown }).deviceId ? new FakeStream([new FakeTrack("mic2")]) : mic;
    },
    createPeer: () => { order.push("createPeer"); const p = new FakePeer(); peers.push(p); return p; },
    api,
    setTimeout: (fn, ms) => { timers.push({ fn, ms, cancelled: false }); return timers.length - 1; },
    clearTimeout: (id) => { timers[id as number]!.cancelled = true; },
    page: "/ayla",
  };
  const handlers: CallHandlers = {
    onStatus: (s) => status.push(s),
    onMicStream: (s) => micStreams.push(s),
    onRemoteTrack: () => {},
    onEvent: (e) => events.push(e),
    onFailure: (f) => failures.push(f),
  };
  return { deps, handlers, order, peers, timers, calls, status, failures, events, micStreams, mic, push: (e: ServerEvent) => push?.(e) };
}
const kinds = (calls: Array<[string, unknown]>) => calls.map(([k]) => k);

describe("startVoiceCall", () => {
  it("asks for the microphone first; a refusal creates no peer and no call", async () => {
    const t = setup({ mic: "denied" });
    expect(await startVoiceCall(t.deps, FORM, t.handlers)).toBeNull();
    expect(t.failures).toEqual([{ kind: "mic", name: "NotAllowedError" }]);
    expect(t.order).toEqual(["getUserMedia"]);
  });
  it("then an audio-only offer (no data channel) with the form; the answer applied; ready and events once media is connected", async () => {
    const t = setup();
    const call = await startVoiceCall(t.deps, FORM, t.handlers);
    expect(call).not.toBeNull();
    expect(t.order).toEqual(["getUserMedia", "createPeer", "start"]);
    expect(t.calls[0]).toEqual(["getUserMedia", { audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }]);
    const p = t.peers[0]!;
    expect(p.added.map((x) => x.id)).toEqual(["mic1"]);
    expect(p.dataChannels).toBe(0);
    expect(t.calls.find(([k]) => k === "start")![1]).toEqual({ sdp: OFFER, form: FORM, page: "/ayla" });
    expect(p.remote).toBe("v=0\r\nANSWER");
    expect(t.status).toEqual(["mic", "connecting"]);
    expect(kinds(t.calls)).not.toContain("ready");
    p.connect();
    expect(t.status.at(-1)).toBe("connected");
    expect(kinds(t.calls).filter((k) => k === "ready" || k === "events")).toEqual(["ready", "events"]);
    expect(t.timers[0]).toMatchObject({ ms: CONNECT_TIMEOUT_MS, cancelled: true });
    t.push({ type: "caption", role: "assistant", text: "Hi Mona" });
    expect(t.events).toEqual([{ type: "caption", role: "assistant", text: "Hi Mona" }]);
  });
  it("no media within 15 s: the server is told, everything stops, the failure is connect", async () => {
    const t = setup();
    await startVoiceCall(t.deps, FORM, t.handlers);
    t.timers[0]!.fn();
    expect(t.failures).toEqual([{ kind: "connect" }]);
    expect(t.calls.filter(([k]) => k === "end")).toEqual([["end", TOKEN]]);
    expect(t.mic.tracks[0]!.stopped).toBe(true);
    expect(t.peers[0]!.closed).toBe(true);
  });
  it("the server refuses the start: failure start with its reason, the microphone released", async () => {
    const t = setup({ start: { ok: false, error: "busy" } });
    expect(await startVoiceCall(t.deps, FORM, t.handlers)).toBeNull();
    expect(t.failures).toEqual([{ kind: "start", error: "busy" }]);
    expect(t.mic.tracks[0]!.stopped).toBe(true);
    expect(t.peers[0]!.closed).toBe(true);
  });
  it("the server's ended event stops everything", async () => {
    const t = setup();
    await startVoiceCall(t.deps, FORM, t.handlers);
    t.peers[0]!.connect();
    t.push({ type: "ended", reason: "ayla_ended" });
    expect(t.status.at(-1)).toBe("ended");
    expect(t.peers[0]!.closed).toBe(true);
    expect(t.mic.tracks[0]!.stopped).toBe(true);
  });
  it("a connection that fails after connecting is a drop; the server is told", async () => {
    const t = setup();
    await startVoiceCall(t.deps, FORM, t.handlers);
    const p = t.peers[0]!;
    p.connect();
    p.connectionState = "failed";
    p.onconnectionstatechange?.();
    expect(t.failures).toEqual([{ kind: "dropped" }]);
    expect(t.calls.filter(([k]) => k === "end")).toEqual([["end", TOKEN]]);
  });
  it("end() posts /end and stops (once); a page hide sends the beacon", async () => {
    const t = setup();
    const call = (await startVoiceCall(t.deps, FORM, t.handlers))!;
    t.peers[0]!.connect();
    await call.end();
    await call.end();
    expect(t.calls.filter(([k]) => k === "end")).toEqual([["end", TOKEN]]);
    expect(t.status.at(-1)).toBe("ended");
    const u = setup();
    const other = (await startVoiceCall(u.deps, FORM, u.handlers))!;
    other.endOnPageHide();
    expect(u.calls.filter(([k]) => k === "beacon")).toEqual([["beacon", TOKEN]]);
    expect(u.peers[0]!.closed).toBe(true);
  });
  it("mute, switching the microphone, the typed code and notices", async () => {
    const t = setup();
    const call = (await startVoiceCall(t.deps, FORM, t.handlers))!;
    t.peers[0]!.connect();
    call.setMuted(true);
    expect(t.mic.tracks[0]!.enabled).toBe(false);
    expect(await call.switchMicrophone("dev-2")).toBe(true);
    expect((t.peers[0]!.senders[0]!.track as FakeTrack).id).toBe("mic2");
    expect(t.mic.tracks[0]!.stopped).toBe(true);
    expect(t.micStreams).toHaveLength(2);
    expect(await call.sendCode("482913")).toBe("verified");
    call.notice("chatbot_ready");
    expect(t.calls.filter(([k]) => k === "code" || k === "notice")).toEqual([["code", [TOKEN, "482913"]], ["notice", [TOKEN, "chatbot_ready"]]]);
  });
  it("a muted call stays muted on the new microphone (deviation from the plan)", async () => {
    const t = setup();
    const call = (await startVoiceCall(t.deps, FORM, t.handlers))!;
    t.peers[0]!.connect();
    call.setMuted(true);
    expect(await call.switchMicrophone("dev-2")).toBe(true);
    expect(t.peers[0]!.senders[0]!.track!.enabled).toBe(false);
  });
});
