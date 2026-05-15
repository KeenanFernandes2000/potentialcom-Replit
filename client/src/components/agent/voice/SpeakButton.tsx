import { Volume2, Square } from "lucide-react";
import type { UseTextToSpeechResult } from "./useTextToSpeech";

interface SpeakButtonProps {
  text: string;
  tts: UseTextToSpeechResult;
}

// A per-message play/stop button. The parent owns a single useTextToSpeech
// instance and passes it to every SpeakButton, so clicking one stops any
// other that's already playing.
export function SpeakButton({ text, tts }: SpeakButtonProps) {
  const trimmed = text.trim();
  if (trimmed.length === 0) return null;

  const isThisPlaying = tts.isPlayingText(text);
  const isLoading = tts.state === "loading";
  const isError = tts.state === "error";
  const label = isThisPlaying ? "Stop playback" : "Play message";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => {
        if (isThisPlaying) {
          tts.stop();
        } else {
          void tts.play(text);
        }
      }}
      disabled={isLoading && !isThisPlaying}
      className={
        "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs " +
        (isError
          ? "text-red-500"
          : isThisPlaying
            ? "bg-tool-card-accent text-tool-card-accent-foreground"
            : "text-tool-card-muted-foreground hover:bg-tool-card-muted")
      }
      data-state={isThisPlaying ? "playing" : tts.state}
    >
      {isLoading && !isThisPlaying ? (
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : isThisPlaying ? (
        <Square className="h-3.5 w-3.5" />
      ) : (
        <Volume2 className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
