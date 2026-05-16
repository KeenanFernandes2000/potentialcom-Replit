import { Mic, MicOff, PhoneOff } from "lucide-react";
import type { VoiceState } from "./useLiveKitVoice";

interface VoiceHeroProps {
  state: VoiceState;
  durationMs: number;
  isMuted: boolean;
  avatarUrl?: string;
  agentName: string;
  onMute: () => void;
  onHangup: () => void;
}

function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function stateLabel(state: VoiceState): { primary: string; secondary: string } {
  switch (state) {
    case "connecting":
      return { primary: "Connecting", secondary: "Setting up your call" };
    case "listening":
      return { primary: "Listening", secondary: "Go ahead — say anything" };
    case "user-speaking":
      return { primary: "I'm listening", secondary: "Got you, keep going" };
    case "agent-speaking":
      return { primary: "Speaking", secondary: "Ruby has something for you" };
    case "ending":
      return { primary: "Ending call", secondary: "Wrapping up…" };
    case "error":
      return { primary: "Call dropped", secondary: "Tap the phone to retry" };
    default:
      return { primary: "On call", secondary: "" };
  }
}

/**
 * Voice call hero overlay — sits inside the messages area whenever a
 * call is active. The visual centerpiece is a stack of three concentric
 * "voice orbs" (radial gradients with breathing pulses) wrapping the
 * agent's avatar, with a five-bar waveform underneath. The whole thing
 * stays calm at idle and tightens up while Ruby is speaking.
 *
 * Why an overlay instead of a header pill: the chat-header pill
 * (VoiceCallBar) is fine for compact status, but the demo wants a
 * "moment" — the kind of screen someone would screenshot. Putting the
 * avatar at center stage with active motion gives the call a presence
 * that the pill alone cannot.
 *
 * Behavior summary:
 * - The orbs breathe slowly (2.4s) when idle; the inner orb's animation
 *   speeds up (1.1s) and the waveform reveals itself only when
 *   state === "agent-speaking" — so the visual energy maps to who is
 *   actually generating audio.
 * - Mute is hidden while Ruby is speaking (muting your own mic mid-Ruby
 *   does nothing useful and only adds button noise).
 * - End-call button is always present so the user can bail out
 *   regardless of state — even mid-error.
 */
export function VoiceHero({
  state,
  durationMs,
  isMuted,
  avatarUrl,
  agentName,
  onMute,
  onHangup,
}: VoiceHeroProps) {
  const { primary, secondary } = stateLabel(state);
  const isSpeaking = state === "agent-speaking";
  const isListening = state === "listening" || state === "user-speaking";
  const showMute = !isSpeaking && state !== "connecting" && state !== "ending";
  const showTimer = state !== "connecting" && state !== "error";

  return (
    <div
      data-state={state}
      data-testid="voice-hero"
      className="relative mx-auto flex max-w-md flex-col items-center gap-5 px-4 py-8 text-center"
    >
      {/* Orb stack */}
      <div className="relative flex h-44 w-44 items-center justify-center">
        {/* Outer orb — widest, slowest pulse */}
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-gradient-to-br from-fuchsia-400/40 via-purple-500/30 to-sky-400/30 blur-2xl motion-safe:animate-voice-breathe"
        />
        {/* Middle orb — punchier, mid pulse */}
        <span
          aria-hidden="true"
          className="absolute inset-3 rounded-full bg-gradient-to-br from-fuchsia-500/55 via-purple-500/45 to-indigo-500/40 blur-xl motion-safe:animate-voice-breathe"
          style={{ animationDelay: "0.4s" }}
        />
        {/* Inner orb — tightest, accelerates while Ruby is speaking */}
        <span
          aria-hidden="true"
          className={
            "absolute inset-6 rounded-full bg-gradient-to-br from-fuchsia-500/70 via-purple-500/60 to-indigo-500/60 blur-lg " +
            (isSpeaking
              ? "motion-safe:animate-voice-breathe-fast"
              : "motion-safe:animate-voice-breathe")
          }
        />

        {/* Avatar at the core — keeps a visual anchor; without it the
            orbs read as decoration rather than "the agent." */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={agentName}
            className="relative h-24 w-24 rounded-full object-cover ring-4 ring-white/40 shadow-[0_0_45px_rgba(168,85,247,0.55)]"
          />
        ) : (
          <div
            aria-hidden="true"
            className="relative h-24 w-24 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-600 ring-4 ring-white/40 shadow-[0_0_45px_rgba(168,85,247,0.55)]"
          />
        )}
      </div>

      {/* Waveform — five bars staggered by delay. Only renders during
          agent-speaking so it doesn't compete with the listening/idle
          states (which have their own quieter signal). */}
      {isSpeaking && (
        <div
          aria-hidden="true"
          className="flex h-7 items-end gap-1.5"
          data-testid="voice-hero-waveform"
        >
          {[0, 0.15, 0.3, 0.15, 0].map((delay, i) => (
            <span
              key={i}
              className="block h-full w-1.5 origin-bottom rounded-full bg-gradient-to-t from-fuchsia-500 to-indigo-500 motion-safe:animate-sound-bar"
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </div>
      )}

      {/* Status text */}
      <div className="space-y-1">
        <div
          className={
            "text-lg font-semibold tracking-tight " +
            (isSpeaking
              ? "text-foreground"
              : isListening
                ? "text-foreground"
                : "text-foreground/80")
          }
        >
          {primary}
          {showTimer && (
            <span className="ml-2 font-mono text-sm font-normal tabular-nums text-muted-foreground">
              {formatDuration(durationMs)}
            </span>
          )}
        </div>
        {secondary && (
          <div className="text-xs text-muted-foreground">{secondary}</div>
        )}
      </div>

      {/* Controls — large, centered, demo-grade */}
      <div className="flex items-center gap-3">
        {showMute && (
          <button
            type="button"
            aria-label={isMuted ? "Unmute" : "Mute"}
            title={isMuted ? "Unmute" : "Mute"}
            onClick={onMute}
            data-testid="voice-hero-mute"
            className={
              "inline-flex h-12 w-12 items-center justify-center rounded-full border transition-all " +
              (isMuted
                ? "border-amber-500/40 bg-amber-500/10 text-amber-600 hover:bg-amber-500/15 dark:text-amber-300"
                : "border-border bg-card/80 backdrop-blur hover:bg-card hover:border-foreground/20")
            }
          >
            {isMuted ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>
        )}
        <button
          type="button"
          aria-label="End call"
          title="End call"
          onClick={onHangup}
          data-testid="voice-hero-hangup"
          className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-[0_8px_28px_rgba(239,68,68,0.45)] transition-all hover:scale-105 hover:bg-red-600 active:scale-95"
        >
          <PhoneOff className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
