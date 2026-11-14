// scripts/ayla-voice-test/main.ts: drives client/src/lib/aylaVoice against agents.potential.com (dev only).
import { voiceApi } from "../../client/src/lib/aylaVoice/api";
import { startVoiceCall, type PeerLike, type StreamLike, type VoiceCall } from "../../client/src/lib/aylaVoice/call";
import { voiceFormFrom } from "../../client/src/lib/aylaVoice/form";
import { micErrorMessage } from "../../client/src/lib/aylaVoice/mic";
import { INITIAL_VIEW, NOTICES, applyEvent, closePanel, type CallView } from "../../client/src/lib/aylaVoice/protocol";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const val = (id: string) => $<HTMLInputElement>(id).value;
const log = (line: string) => {
  $("log").textContent += `${new Date().toISOString().slice(11, 19)} ${line}\n`;
};
let call: VoiceCall | null = null;
let view: CallView = INITIAL_VIEW;
let muted = false;

function render(): void {
  $("panel").textContent = view.panel ?? "none";
  $("code-status").textContent = view.code;
  $("ended").textContent = view.ended ?? "";
  $("code-box").hidden = view.panel !== "code";
  $("demo-box").hidden = view.panel !== "chatbot_demo" && view.panel !== "voice_agent_demo";
  const frame = $<HTMLIFrameElement>("booking");
  frame.hidden = view.panel !== "booking";
  if (view.panel === "booking" && view.bookingUrl && frame.src !== view.bookingUrl) frame.src = view.bookingUrl;
  $("captions").textContent = view.captions.map((c) => `${c.role === "assistant" ? "Ayla" : "You"}: ${c.text}`).join("\n");
}

$("start").onclick = async () => {
  const api = voiceApi(val("api"), { fetch: window.fetch.bind(window), sendBeacon: navigator.sendBeacon.bind(navigator) });
  log(`status endpoint says available: ${await api.status()}`);
  const form = voiceFormFrom({
    firstName: val("firstName"), lastName: val("lastName"), email: val("email"), countryCode: val("countryCode"), phoneNumber: val("phoneNumber"),
    companyName: val("organisation"), companyWebsite: val("website"), role: val("role"),
  });
  view = INITIAL_VIEW;
  render();
  call = await startVoiceCall(
    {
      getUserMedia: (c) => navigator.mediaDevices.getUserMedia(c as MediaStreamConstraints) as unknown as Promise<StreamLike>,
      createPeer: () => new RTCPeerConnection() as unknown as PeerLike,
      api,
      setTimeout: (fn, ms) => window.setTimeout(fn, ms),
      clearTimeout: (id) => window.clearTimeout(id as number),
      page: "/ayla",
    },
    form,
    {
      onStatus: (s) => log(`status: ${s}`),
      onMicStream: () => log("microphone granted"),
      onRemoteTrack: (track, stream) => {
        const audio = $<HTMLAudioElement>("audio");
        audio.srcObject = (stream as unknown as MediaStream | null) ?? new MediaStream([track as unknown as MediaStreamTrack]);
        audio.play().catch(() => log("autoplay blocked: press play on the audio control"));
      },
      onEvent: (e) => {
        log(`event: ${JSON.stringify(e)}`);
        view = applyEvent(view, e);
        render();
      },
      onFailure: (f) => log(`failure: ${JSON.stringify(f)}${f.kind === "mic" ? ` (${micErrorMessage(f.name)})` : ""}`),
    },
  );
};
$("end").onclick = () => void call?.end();
$("mute").onclick = () => {
  muted = !muted;
  call?.setMuted(muted);
  log(muted ? "muted" : "unmuted");
};
$("send-code").onclick = async () => log(`code result: ${await call?.sendCode(val("code").replace(/\D/g, ""))}`);
$("close-panel").onclick = () => {
  view = closePanel(view);
  render();
};
for (const n of NOTICES) {
  const b = document.createElement("button");
  b.textContent = n;
  b.onclick = () => {
    call?.notice(n);
    log(`notice sent: ${n}`);
  };
  $("notices").append(b);
}
window.addEventListener("pagehide", () => call?.endOnPageHide());
render();
