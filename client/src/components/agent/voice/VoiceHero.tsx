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
 * call is active. Minimal version: single subtle ring around the
 * avatar, optional thin waveform during agent-speaking, clean status
 * text, neutral controls.
 *
 * Behavior summary:
 * - One slow pulse ring while idle/listening; speeds up while
 *   agent-speaking (only the timing changes, not the visual weight).
 * - Waveform appears only during agent-speaking — the one bit of
 *   color in the otherwise neutral state.
 * - Mute hidden during agent-speaking; end-call always present.
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
      className="relative mx-auto flex max-w-md flex-col items-center gap-5 px-4 py-10 text-center"
    >
      {/* Avatar with a single quiet pulse ring */}
      <div className="relative flex h-32 w-32 items-center justify-center">
        <span
          aria-hidden="true"
          className={
            "absolute inset-0 rounded-full border border-primary/30 " +
            (isSpeaking
              ? "motion-safe:animate-voice-breathe-fast"
              : "motion-safe:animate-voice-breathe")
          }
        />
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={agentName}
            className="relative h-24 w-24 rounded-full object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="relative h-24 w-24 rounded-full bg-muted"
          />
        )}
      </div>

      {/* Waveform — thin neutral bars, only during agent-speaking. */}
      {isSpeaking && (
        <div
          aria-hidden="true"
          className="flex h-5 items-end gap-1"
          data-testid="voice-hero-waveform"
        >
          {[0, 0.15, 0.3, 0.15, 0].map((delay, i) => (
            <span
              key={i}
              className="block h-full w-1 origin-bottom rounded-full bg-primary motion-safe:animate-sound-bar"
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </div>
      )}

      {/* Status text — single quiet line, no contrast tricks. */}
      <div className="space-y-1">
        <div className="text-base font-medium tracking-tight text-foreground">
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

      {/* Controls — neutral surface buttons; only the end-call gets
          color because it's the irreversible/dangerous action. */}
      <div className="flex items-center gap-3">
        {showMute && (
          <button
            type="button"
            aria-label={isMuted ? "Unmute" : "Mute"}
            title={isMuted ? "Unmute" : "Mute"}
            onClick={onMute}
            data-testid="voice-hero-mute"
            className={
              "inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors " +
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
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600"
        >
          <PhoneOff className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
