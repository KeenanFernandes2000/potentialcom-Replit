import { Phone } from "lucide-react";

interface VoiceModeButtonProps {
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
}

function isVoiceSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === "function" &&
    typeof WebSocket !== "undefined"
  );
}

// Header entry point for real-time voice mode. Hidden when:
// - disabled prop is set (parent gates on bot.audiostt && bot.audiotts)
// - Browser lacks getUserMedia / WebSocket
export function VoiceModeButton({
  onClick,
  disabled,
  busy,
}: VoiceModeButtonProps) {
  if (disabled || !isVoiceSupported()) return null;
  return (
    <button
      type="button"
      aria-label="Talk to Ruby"
      title="Talk to Ruby"
      onClick={onClick}
      disabled={busy}
      className={
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs " +
        (busy
          ? "bg-tool-card-muted text-tool-card-muted-foreground opacity-60"
          : "bg-tool-card-accent text-tool-card-accent-foreground hover:opacity-90")
      }
    >
      <Phone className="h-3.5 w-3.5" />
      <span>Talk to Ruby</span>
    </button>
  );
}
