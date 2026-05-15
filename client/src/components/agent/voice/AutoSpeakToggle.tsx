import { Volume2, VolumeX } from "lucide-react";
import { useAutoSpeak } from "./useAutoSpeak";

interface AutoSpeakToggleProps {
  onChange?: (enabled: boolean) => void;
}

// A small switch displayed in the chat header. Reads/writes
// localStorage via useAutoSpeak; emits onChange so the parent can
// react in real time (e.g., to start auto-speaking the latest message
// immediately when toggled on).
export function AutoSpeakToggle({ onChange }: AutoSpeakToggleProps) {
  const { enabled, setEnabled } = useAutoSpeak();

  const handleClick = () => {
    const next = !enabled;
    setEnabled(next);
    onChange?.(next);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label="Auto-speak"
      title={enabled ? "Auto-speak on" : "Auto-speak off"}
      onClick={handleClick}
      className={
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs " +
        (enabled
          ? "bg-tool-card-accent text-tool-card-accent-foreground"
          : "bg-tool-card-muted text-tool-card-muted-foreground hover:bg-tool-card-muted/80")
      }
    >
      {enabled ? (
        <Volume2 className="h-3.5 w-3.5" />
      ) : (
        <VolumeX className="h-3.5 w-3.5" />
      )}
      <span>Auto-speak</span>
    </button>
  );
}
