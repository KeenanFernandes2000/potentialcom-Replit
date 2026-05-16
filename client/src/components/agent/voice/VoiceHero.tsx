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
 * In-call dock — compact horizontal bar pinned between the chat header
 * and the message list. ALWAYS visible during a call, so end-call and
 * mute are one click away regardless of how far the user has scrolled
 * through the message history.
 *
 * Layout: [avatar] [status + timer + inline waveform] [mute] [end-call].
 *
 * Why a compact dock and not a big modal-style hero: the previous "big
 * VoiceHero overlay" lived INSIDE the scroll container, so the
 * end-call button slid out of view as messages arrived and forced
 * users to scroll up to hang up. Real voice UIs (Zoom, Meet, Discord,
 * iOS Phone) all pin call controls; we do the same here.
 *
 * Behavior preserved from the prior overlay:
 * - Status text + timer per state ("Listening 0:14", etc.)
 * - Inline waveform only during agent-speaking (visual "she's talking")
 * - Mute hidden during agent-speaking (no-op there; reduces button noise)
 * - End-call always present, even in error state (so user can bail)
 * - Avatar gets a subtle breathing border ring that speeds up while
 *   Ruby is actively speaking
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
  const showMute = !isSpeaking && state !== "connecting" && state !== "ending";
  const showTimer = state !== "connecting" && state !== "error";

  return (
    <div
      data-state={state}
      data-testid="voice-hero"
      className="flex items-center gap-4 border-b border-border bg-muted/40 px-5 py-3"
    >
      {/* Avatar with quiet breathing ring */}
      <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center">
        <span
          aria-hidden="true"
          className={
            "absolute inset-0 rounded-full border-2 border-primary/30 " +
            (isSpeaking
              ? "motion-safe:animate-voice-breathe-fast"
              : "motion-safe:animate-voice-breathe")
          }
        />
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={agentName}
            className="relative h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="relative h-10 w-10 rounded-full bg-primary/10"
          />
        )}
      </div>

      {/* Status + timer + inline waveform */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold tracking-tight text-foreground">
            {primary}
          </span>
          {showTimer && (
            <span className="font-mono text-xs font-normal tabular-nums text-muted-foreground">
              {formatDuration(durationMs)}
            </span>
          )}
          {/* Inline waveform — appears only during agent-speaking. Three
              thin bars, primary-tinted, animated via the existing
              sound-bar keyframe. */}
          {isSpeaking && (
            <span
              aria-hidden="true"
              className="ml-1 inline-flex h-3 items-end gap-0.5"
              data-testid="voice-hero-waveform"
            >
              {[0, 0.15, 0.3, 0.15, 0].map((delay, i) => (
                <span
                  key={i}
                  className="block h-full w-0.5 origin-bottom rounded-full bg-primary motion-safe:animate-sound-bar"
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
            </span>
          )}
        </div>
        {secondary && (
          <div className="truncate text-xs text-muted-foreground">
            {secondary}
          </div>
        )}
      </div>

      {/* Controls — pinned right. End-call always present; mute hidden
          during agent-speaking. */}
      <div className="flex flex-shrink-0 items-center gap-2">
        {showMute && (
          <button
            type="button"
            aria-label={isMuted ? "Unmute" : "Mute"}
            title={isMuted ? "Unmute" : "Mute"}
            onClick={onMute}
            data-testid="voice-hero-mute"
            className={
              "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors " +
              (isMuted
                ? "border-foreground/30 bg-muted text-foreground"
                : "border-border bg-background hover:bg-muted")
            }
          >
            {isMuted ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>
        )}
        <button
          type="button"
          aria-label="End call"
          title="End call"
          onClick={onHangup}
          data-testid="voice-hero-hangup"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white shadow-sm transition-colors hover:bg-red-600"
        >
          <PhoneOff className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
