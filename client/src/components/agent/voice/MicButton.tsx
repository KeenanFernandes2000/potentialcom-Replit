import { useCallback, useState } from "react";
import { Mic, Square } from "lucide-react";
import { useVoiceRecorder } from "./useVoiceRecorder";

interface MicButtonProps {
  agentKey: string;
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

function isRecordingSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === "function" &&
    typeof MediaRecorder !== "undefined"
  );
}

function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MicButton({ agentKey, onTranscript, disabled }: MicButtonProps) {
  const recorder = useVoiceRecorder();
  const [uploading, setUploading] = useState(false);

  const onClick = useCallback(async () => {
    if (disabled) return;
    if (recorder.state === "recording") {
      const blob = await recorder.stop();
      if (!blob || blob.size === 0) return;
      setUploading(true);
      try {
        const form = new FormData();
        form.append("audio", blob, "voice.webm");
        const res = await fetch(`/api/agent/${agentKey}/transcribe`, {
          method: "POST",
          body: form,
        });
        if (!res.ok) return;
        const data = (await res.json()) as { text?: string };
        const text = (data.text ?? "").trim();
        if (text) onTranscript(text);
      } finally {
        setUploading(false);
      }
    } else {
      await recorder.start();
    }
  }, [agentKey, disabled, onTranscript, recorder]);

  if (disabled || !isRecordingSupported()) return null;

  const isRecording = recorder.state === "recording";
  const isError = recorder.state === "error";
  const label = isRecording ? "Stop recording" : "Record voice message";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={uploading}
      className={
        "inline-flex h-9 w-9 items-center justify-center rounded-full border " +
        (isRecording
          ? "border-red-500/40 bg-red-500/15 text-red-500 animate-pulse"
          : isError
            ? "border-red-500/40 bg-transparent text-red-500"
            : "border-tool-card-border bg-tool-card text-tool-card-foreground hover:bg-tool-card-muted")
      }
      data-state={recorder.state}
    >
      {isRecording ? (
        <span className="flex items-center gap-1">
          <Square className="h-3.5 w-3.5" />
          <span className="text-[10px] font-mono">
            {formatDuration(recorder.durationMs)}
          </span>
        </span>
      ) : uploading ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </button>
  );
}
