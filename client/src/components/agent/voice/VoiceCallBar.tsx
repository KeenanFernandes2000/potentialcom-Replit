import { Mic, MicOff, PhoneOff } from "lucide-react";
import type { VoiceState } from "./useLiveKitVoice";

interface VoiceCallBarProps {
  state: VoiceState;
  durationMs: number;
  isMuted: boolean;
  onMute: () => void;
  onHangup: () => void;
}

function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function stateLabel(state: VoiceState): string {
  switch (state) {
    case "connecting":
      return "Connecting…";
    case "listening":
      return "Listening";
    case "user-speaking":
      return "You're speaking…";
    case "agent-speaking":
      return "Ruby is speaking…";
    case "ending":
      return "Ending…";
    case "error":
      return "Call dropped";
    default:
      return "";
  }
}

// In-call pill that replaces VoiceModeButton in the chat header while a
// call is active. Mute is hidden during state=agent-speaking (it would
// only stop *the user's* mic from sending, which isn't useful while
// Ruby is the one talking).
export function VoiceCallBar({
  state,
  durationMs,
  isMuted,
  onMute,
  onHangup,
}: VoiceCallBarProps) {
  const showMute =
    state !== "agent-speaking" && state !== "connecting" && state !== "ending";
  const showTimer = state === "listening" || state === "user-speaking";

  return (
    <div
      data-state={state}
      className="inline-flex items-center gap-2 rounded-full bg-tool-card-accent text-tool-card-accent-foreground px-3 py-1 text-xs"
    >
      <span
        className="inline-block h-2 w-2 rounded-full bg-current animate-pulse"
        aria-hidden="true"
      />
      <span>{stateLabel(state)}</span>
      {showTimer && (
        <span className="font-mono tabular-nums">
          {formatDuration(durationMs)}
        </span>
      )}
      {showMute && (
        <button
          type="button"
          aria-label={isMuted ? "Unmute" : "Mute"}
          title={isMuted ? "Unmute" : "Mute"}
          onClick={onMute}
          className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15 hover:bg-white/25"
        >
          {isMuted ? (
            <MicOff className="h-3.5 w-3.5" />
          ) : (
            <Mic className="h-3.5 w-3.5" />
          )}
        </button>
      )}
      <button
        type="button"
        aria-label="End call"
        title="End call"
        onClick={onHangup}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500/80 hover:bg-red-500 text-white"
      >
        <PhoneOff className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
