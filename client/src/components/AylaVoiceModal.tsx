// client/src/components/AylaVoiceModal.tsx
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CalendarClock, ChevronDown, ChevronUp, Mic, MicOff, PhoneOff, RefreshCw, Volume2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MeetingScheduler } from "./MeetingScheduler";
import { CodeEntryPanel } from "./ayla/CodeEntryPanel";
import { ChatbotDemoPanel, VoiceAgentDemoPanel } from "./ayla/DemoAgentPanels";
import { voiceApi } from "@/lib/aylaVoice/api";
import { startVoiceCall, type CallFailure, type CallStatus, type PeerLike, type StreamLike, type VoiceCall } from "@/lib/aylaVoice/call";
import type { VoiceForm } from "@/lib/aylaVoice/form";
import { createSilenceWatch, micErrorMessage, rms, shouldAutoRetry } from "@/lib/aylaVoice/mic";
import { INITIAL_VIEW, TRANSCRIPT_NOTICE, applyEvent, closePanel, endMessage, type CallView, type CodeResult, type ServerEvent } from "@/lib/aylaVoice/protocol";

// Ayla's voice button on her brain (agents.potential.com, WebRTC). The call
// logic is in lib/aylaVoice (tested with bun); this is its UI: the status, the
// microphone and failure cards (the Vapi modal's words and ways out), the
// panels the server opens, the transcript, mute and end.

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Remounts the modal (a fresh attempt after a microphone problem). */
  onRemount: () => void;
  /** The form as Ayla's server received it (the demo panels use it). */
  form: VoiceForm;
  /** The current intake from /voice/intake (the page owns it, so a remount keeps it). */
  getIntake: () => string;
  /** Posts the form to /voice/intake again; the new intake, or null. */
  renewIntake: () => Promise<string | null>;
  /** VITE_AYLA_VOICE_API. */
  apiBase: string;
}

type Card = { title: string; detail: string };
const START_CARDS: Record<string, Card> = {
  busy: { title: "Ayla is busy right now.", detail: "All her lines are in use. Try again in a minute, or book a session with a consultant." },
  rate_limited: { title: "Too many calls from your network.", detail: "Please try again later, or book a session with a consultant." },
  bad_request: { title: "We couldn't start the call.", detail: "Please check your details and try again, or book a session with a consultant." },
  unavailable: { title: "We couldn't start the call.", detail: "Ayla is briefly unavailable. Book a session with a consultant and we'll pick it up from there." },
  network: { title: "We couldn't reach Ayla.", detail: "That is usually the network or a firewall. Try again, or book a session with a consultant." },
  intake_not_found: { title: "We couldn't start the call.", detail: "Please send the form again, or book a session with a consultant." },
  intake_used: { title: "We couldn't start the call.", detail: "Please send the form again, or book a session with a consultant." },
};
function failureCard(f: Exclude<CallFailure, { kind: "mic" }>): Card {
  if (f.kind === "start") return START_CARDS[f.error] ?? START_CARDS.unavailable!;
  if (f.kind === "connect") return { title: "Ayla couldn't connect.", detail: "That is usually a firewall or a flaky network. Try again, or book a session with a consultant." };
  return { title: "The connection dropped.", detail: "This is usually the network. Start the call again, or book a session instead." };
}

export function AylaVoiceModal({ isOpen, onClose, onRemount, form, getIntake, renewIntake, apiBase }: Props) {
  const [status, setStatus] = useState<CallStatus | "idle">("idle");
  const [view, setView] = useState<CallView>(INITIAL_VIEW);
  const [micError, setMicError] = useState<string | null>(null);
  const [card, setCard] = useState<Card | null>(null);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [muted, setMuted] = useState(false);
  const [micWarning, setMicWarning] = useState(false);
  const [micDevices, setMicDevices] = useState<MediaDeviceInfo[]>([]);
  const [showTranscript, setShowTranscript] = useState(false);
  const [bookingOnly, setBookingOnly] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const callRef = useRef<VoiceCall | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const micStreamRef = useRef<StreamLike | null>(null);
  const stopWatchRef = useRef<(() => void) | null>(null);
  const heardRef = useRef(false);
  const retriedRef = useRef(false);
  const mutedRef = useRef(false);
  // Read through refs so the call effect is keyed on isOpen and attempt only (as in the Vapi modal).
  const onCloseRef = useRef(onClose);
  const intakeRef = useRef({ getIntake, renewIntake });
  onCloseRef.current = onClose;
  intakeRef.current = { getIntake, renewIntake };

  /** The microphone's level, every 500 ms: 10 s under the noise floor shows the warning and the device list. */
  const watchMicrophone = () => {
    stopWatchRef.current?.();
    stopWatchRef.current = null;
    const stream = micStreamRef.current as unknown as MediaStream | null;
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!stream || !Ctx) return;
    const ctx = new Ctx();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const buf = new Float32Array(analyser.fftSize);
    const watch = createSilenceWatch(Date.now());
    const id = window.setInterval(() => {
      const now = Date.now();
      if (mutedRef.current) return watch.reset(now);
      // A suspended context (Safari without a recent gesture) reads zeros: never blame the microphone for it.
      if (ctx.state !== "running") {
        void ctx.resume().catch(() => {});
        return watch.reset(now);
      }
      analyser.getFloatTimeDomainData(buf);
      watch.level(rms(buf), now);
      if (watch.silent(now)) {
        setMicWarning(true);
        void navigator.mediaDevices.enumerateDevices().then((d) => setMicDevices(d.filter((x) => x.kind === "audioinput"))).catch(() => {});
      } else setMicWarning(false);
    }, 500);
    stopWatchRef.current = () => {
      window.clearInterval(id);
      void ctx.close().catch(() => {});
    };
  };

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setStatus("mic");
    setView(INITIAL_VIEW);
    setCard(null);
    setMicError(null);
    setAudioBlocked(false);
    setMicWarning(false);
    heardRef.current = false;
    if (!navigator.mediaDevices?.getUserMedia || typeof RTCPeerConnection === "undefined") {
      setStatus("idle");
      setMicError(micErrorMessage("NoApi"));
      return;
    }
    const retry = () => {
      retriedRef.current = true;
      setAttempt((n) => n + 1);
    };
    const onEvent = (e: ServerEvent) => {
      if (cancelled) return;
      if (e.type === "caption") heardRef.current = true;
      setView((v) => applyEvent(v, e));
      if (e.type !== "ended") return;
      stopWatchRef.current?.();
      const msg = endMessage(e.reason);
      if (!msg) return void onCloseRef.current();
      if (e.reason === "error" && shouldAutoRetry({ failed: true, heardAnything: heardRef.current, alreadyRetried: retriedRef.current })) return retry();
      setCard(msg);
    };
    const onFailure = (f: CallFailure) => {
      if (cancelled) return;
      stopWatchRef.current?.();
      if (f.kind === "mic") {
        setStatus("idle");
        setMicError(micErrorMessage(f.name));
        return;
      }
      // A call that fails before anyone spoke is retried once, silently (the cold-start lesson).
      if (shouldAutoRetry({ failed: true, heardAnything: heardRef.current, alreadyRetried: retriedRef.current })) return retry();
      setStatus("ended");
      setCard(failureCard(f));
    };
    const api = voiceApi(apiBase, {
      fetch: window.fetch.bind(window),
      sendBeacon: navigator.sendBeacon ? navigator.sendBeacon.bind(navigator) : undefined,
    });
    void startVoiceCall(
      {
        getUserMedia: (c) => navigator.mediaDevices.getUserMedia(c as MediaStreamConstraints) as unknown as Promise<StreamLike>,
        createPeer: () => new RTCPeerConnection() as unknown as PeerLike,
        api,
        setTimeout: (fn, ms) => window.setTimeout(fn, ms),
        clearTimeout: (id) => window.clearTimeout(id as number),
        renewIntake: () => intakeRef.current.renewIntake(),
      },
      intakeRef.current.getIntake(),
      {
        onStatus: (s) => {
          if (cancelled) return;
          setStatus(s);
          if (s === "connected") watchMicrophone();
          if (s === "ended") stopWatchRef.current?.();
        },
        onMicStream: (s) => {
          micStreamRef.current = s;
        },
        onRemoteTrack: (track, stream) => {
          const audio = audioRef.current;
          if (!audio || cancelled) return;
          audio.srcObject = (stream as unknown as MediaStream | null) ?? new MediaStream([track as unknown as MediaStreamTrack]);
          audio.play().then(() => setAudioBlocked(false)).catch(() => setAudioBlocked(true));
        },
        onEvent,
        onFailure,
      },
    ).then((call) => {
      if (cancelled) void call?.end();
      else callRef.current = call;
    });
    return () => {
      cancelled = true;
      stopWatchRef.current?.();
      const c = callRef.current;
      callRef.current = null;
      void c?.end();
    };
  }, [isOpen, attempt]);

  // The page closing ends the call (a beacon: no preflight, survives unload).
  useEffect(() => {
    const onHide = () => callRef.current?.endOnPageHide();
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, []);

  // Reset when the modal closes.
  useEffect(() => {
    if (isOpen) return;
    setStatus("idle");
    setView(INITIAL_VIEW);
    setCard(null);
    setMicError(null);
    setMuted(false);
    mutedRef.current = false;
    setMicWarning(false);
    setMicDevices([]);
    setBookingOnly(false);
    setShowTranscript(false);
    retriedRef.current = false;
    setAttempt(0);
  }, [isOpen]);

  const endCall = () => {
    const c = callRef.current;
    callRef.current = null;
    void c?.end();
    onClose();
  };
  const toggleMute = () => {
    const m = !muted;
    setMuted(m);
    mutedRef.current = m;
    callRef.current?.setMuted(m);
  };
  const switchMic = async (deviceId: string) => {
    if (await callRef.current?.switchMicrophone(deviceId)) {
      setMicWarning(false);
      watchMicrophone();
    }
  };
  const unblockAudio = () => {
    void audioRef.current?.play().then(() => setAudioBlocked(false)).catch(() => {});
  };
  const showBookingInstead = () => {
    setMicError(null);
    setCard(null);
    setBookingOnly(true);
  };

  const panel = view.panel;
  const showLeft = !!panel || bookingOnly;
  const live = status === "mic" || status === "connecting" || status === "connected";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) endCall(); }} modal={true}>
      <DialogContent className={`${showLeft ? "sm:max-w-6xl" : "sm:max-w-3xl"} max-h-[90vh] overflow-y-auto`} onInteractOutside={(e) => e.preventDefault()}>
        <audio ref={audioRef} autoPlay className="hidden" />

        {(micError || card) && (
          <div className="mb-6 w-full flex flex-col items-center">
            <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-800 rounded-xl px-6 py-4 shadow-md w-full max-w-md">
              <span className="flex-shrink-0 mt-0.5">{micError ? <MicOff className="h-6 w-6 text-red-600" /> : <AlertTriangle className="h-6 w-6 text-amber-600" />}</span>
              <div className="flex-1">
                <p className="font-semibold text-base mb-1">{micError ? "We can't reach your microphone." : card!.title}</p>
                <p className="text-xs text-muted-foreground">{micError ?? card!.detail}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => onRemount()}>
                    <RefreshCw className="h-4 w-4 mr-1.5" /> Try again
                  </Button>
                  {/* Never a dead end: booking needs no microphone. */}
                  <Button variant="ghost" size="sm" onClick={showBookingInstead}>
                    <CalendarClock className="h-4 w-4 mr-1.5" /> Book a session instead
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {micWarning && (
          <div className="mb-4 w-full flex justify-center">
            <div className="flex items-start gap-3 bg-muted/60 border border-border rounded-xl px-5 py-3 w-full max-w-md">
              <Mic className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">We can't hear anything from your microphone. It may be muted, turned down, or the wrong input device.</p>
                {micDevices.length > 1 && (
                  <select className="mt-2 w-full rounded bg-background border border-border p-1 text-xs" defaultValue="" onChange={(e) => void switchMic(e.target.value)}>
                    <option value="" disabled>Choose another microphone</option>
                    {micDevices.map((d) => <option key={d.deviceId} value={d.deviceId}>{d.label || "Microphone"}</option>)}
                  </select>
                )}
              </div>
            </div>
          </div>
        )}

        {audioBlocked && (
          <div className="mb-4 w-full flex justify-center">
            <div className="flex items-start gap-3 bg-muted/60 border border-border rounded-xl px-5 py-3 w-full max-w-md">
              <Volume2 className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Your browser blocked Ayla's voice. Tap to enable audio.</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={unblockAudio}>Tap to enable audio</Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {showLeft && (
            <div className="flex-1 lg:border-r lg:pr-6 border-b lg:border-b-0 pb-6 lg:pb-0 flex flex-col justify-center items-center">
              <div className={`w-full ${panel === "booking" || bookingOnly ? "max-w-full" : "max-w-xs"} mx-auto bg-background/80 rounded-2xl shadow-lg p-4 lg:p-8 flex flex-col items-center`}>
                {panel === "code" && (
                  <CodeEntryPanel status={view.code} onSubmit={(code) => callRef.current?.sendCode(code) ?? Promise.resolve<CodeResult>("busy")} onClose={() => setView(closePanel)} />
                )}
                {panel === "chatbot_demo" && <ChatbotDemoPanel form={form} onNotice={(n) => callRef.current?.notice(n)} onClose={() => setView(closePanel)} />}
                {panel === "voice_agent_demo" && <VoiceAgentDemoPanel form={form} onNotice={(n) => callRef.current?.notice(n)} onClose={() => setView(closePanel)} />}
                {(panel === "booking" || (bookingOnly && !panel)) && (
                  <>
                    <h2 className="text-xl lg:text-2xl font-bold text-primary mb-2 text-center">Book a 30-minute session</h2>
                    <p className="text-sm text-muted-foreground mb-4 text-center">Pick a time with Rawzaba from the Potential team.</p>
                    <MeetingScheduler
                      className="block w-full h-[60vh] min-h-[400px] max-h-[600px] rounded-lg border-0"
                      {...(panel === "booking" && view.bookingUrl ? { src: view.bookingUrl } : {})}
                    />
                    <Button onClick={() => { setBookingOnly(false); setView(closePanel); }} className="w-full mt-4" variant="outline" size="sm">Close</Button>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="flex-1 lg:pl-6 pt-6 lg:pt-0">
            <DialogTitle className="text-xl font-semibold text-center mb-2">Talk to Ayla</DialogTitle>
            <div className="w-full flex items-center justify-center mb-2" role="status">
              {(status === "mic" || status === "connecting") && <span className="text-sm text-muted-foreground animate-pulse">{status === "mic" ? "Waiting for your microphone…" : "Connecting to Ayla..."}</span>}
              {status === "connected" && <span className="text-sm text-green-500">Connected</span>}
            </div>
            {/* The call-start notice (Mamoon, 14 Nov); Ayla also says it. */}
            {live && <p className="text-xs text-muted-foreground text-center mb-2">{TRANSCRIPT_NOTICE}</p>}
            <div className="flex flex-col items-center space-y-4 lg:space-y-6">
              <div className="relative w-24 h-24 lg:w-32 lg:h-32 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg">
                <img src="/assets/images/agents/AylaAvatarCentered.png" alt="Ayla" className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={toggleMute} disabled={status !== "connected"} aria-label={muted ? "Unmute" : "Mute"}>
                  {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
                <Button variant="destructive" onClick={endCall} aria-label="End call">
                  <PhoneOff className="h-5 w-5 mr-1.5" /> End
                </Button>
              </div>
              <div className="w-full">
                <button type="button" onClick={() => setShowTranscript((s) => !s)} className="flex items-center gap-2 text-sm font-medium mx-auto">
                  Conversation Transcript ({view.captions.length} messages)
                  {showTranscript ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {showTranscript && (
                  <div className="mt-2 h-[200px] lg:h-[300px] overflow-y-auto rounded-lg bg-muted/30 p-3 space-y-2 text-sm">
                    {view.captions.length === 0 ? (
                      <p className="text-muted-foreground text-center">The transcript appears here as you talk.</p>
                    ) : (
                      view.captions.map((c, i) => (
                        <p key={i}>
                          <b>{c.role === "assistant" ? "Ayla" : "You"}:</b> {c.text}
                        </p>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
