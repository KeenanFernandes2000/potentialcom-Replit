import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

// Heuristic: getUserMedia surfaces permission denial as either a
// NotAllowedError or a SecurityError; both share the same user-visible
// remedy ("turn the mic on in browser settings"). Fall back to a generic
// message for anything else (no device, hardware failure, etc.).
function isPermissionError(message: string | null): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes("permission") ||
    lower.includes("denied") ||
    lower.includes("notallowed") ||
    lower.includes("not allowed") ||
    lower.includes("security")
  );
}

export function MicButton({ agentKey, onTranscript, disabled }: MicButtonProps) {
  const recorder = useVoiceRecorder();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  // Track the last error we toasted so a steady "error" state with the
  // same message doesn't re-fire every render.
  const lastToastedErrorRef = useRef<string | null>(null);

  useEffect(() => {
    if (recorder.state !== "error") {
      lastToastedErrorRef.current = null;
      return;
    }
    const message = recorder.errorMessage ?? "";
    if (lastToastedErrorRef.current === message) return;
    lastToastedErrorRef.current = message;
    if (isPermissionError(message)) {
      toast({
        title: "Mic access blocked. Enable in your browser's site settings.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Recording failed — try again.",
        variant: "destructive",
      });
    }
  }, [recorder.state, recorder.errorMessage, toast]);

  const onClick = useCallback(async () => {
    if (disabled) return;
    // Blur the currently-focused element. macOS Safari doesn't move
    // focus to a button on mouse click by default, so the chat input
    // can remain focused while we record — letting OS-level dictation
    // (Dictation, Voice Control) auto-type the same speech into the
    // input in parallel with our Deepgram round-trip. Explicit blur
    // helps; users with Voice Control may still need to disable it.
    if (
      typeof document !== "undefined" &&
      document.activeElement instanceof HTMLElement
    ) {
      document.activeElement.blur();
    }
    if (recorder.state === "recording") {
      const blob = await recorder.stop();
      if (!blob || blob.size === 0) {
        toast({
          title: "No speech detected — try again.",
          variant: "destructive",
        });
        return;
      }
      setUploading(true);
      try {
        const form = new FormData();
        form.append("audio", blob, "voice.webm");
        const res = await fetch(`/api/agent/${agentKey}/transcribe`, {
          method: "POST",
          body: form,
        });
        if (!res.ok) {
          toast({
            title: "Could not transcribe — try again.",
            variant: "destructive",
          });
          return;
        }
        const data = (await res.json()) as { text?: string };
        const text = (data.text ?? "").trim();
        if (!text) {
          toast({
            title: "No speech detected — try again.",
            variant: "destructive",
          });
          return;
        }
        onTranscript(text);
      } finally {
        setUploading(false);
      }
    } else {
      await recorder.start();
    }
  }, [agentKey, disabled, onTranscript, recorder, toast]);

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
        "inline-flex h-9 items-center justify-center rounded-full border " +
        (isRecording
          ? "px-3 gap-1.5 border-red-500/40 bg-red-500/15 text-red-500 animate-pulse"
          : isError
            ? "w-9 border-red-500/40 bg-transparent text-red-500"
            : "w-9 border-tool-card-border bg-tool-card text-tool-card-foreground hover:bg-tool-card-muted")
      }
      data-state={recorder.state}
    >
      {isRecording ? (
        <>
          <Square className="h-3 w-3 fill-current" />
          <span className="text-xs font-mono tabular-nums">
            {formatDuration(recorder.durationMs)}
          </span>
        </>
      ) : uploading ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </button>
  );
}
