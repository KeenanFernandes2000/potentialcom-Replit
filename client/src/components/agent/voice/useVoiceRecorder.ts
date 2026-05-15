import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderState = "idle" | "recording" | "uploading" | "error";

export interface UseVoiceRecorderResult {
  state: RecorderState;
  durationMs: number;
  errorMessage: string | null;
  start: () => Promise<void>;
  stop: () => Promise<Blob | null>;
  cancel: () => void;
}

function pickMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported?.(c)) return c;
  }
  return "";
}

// Wraps the MediaRecorder API with a React-friendly shape. Owns the
// MediaStream lifecycle so tracks are always released on stop or unmount.
export function useVoiceRecorder(): UseVoiceRecorderResult {
  const [state, setState] = useState<RecorderState>("idle");
  const [durationMs, setDurationMs] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const cleanupTick = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  useEffect(
    () => () => {
      cleanupTick();
      cleanupStream();
    },
    [cleanupStream, cleanupTick],
  );

  const start = useCallback(async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = pickMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        const data = (e as { data: Blob }).data;
        if (data && data.size > 0) chunksRef.current.push(data);
      };

      recorder.onerror = () => {
        setState("error");
        setErrorMessage("Recording failed");
        cleanupStream();
        cleanupTick();
      };

      recorder.start();
      startTimeRef.current = Date.now();
      setDurationMs(0);
      setState("recording");

      cleanupTick();
      tickRef.current = setInterval(() => {
        setDurationMs(Date.now() - startTimeRef.current);
      }, 250);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not access microphone";
      setState("error");
      setErrorMessage(message);
      cleanupStream();
    }
  }, [cleanupStream, cleanupTick]);

  const stop = useCallback((): Promise<Blob | null> => {
    cleanupTick();
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      cleanupStream();
      setState("idle");
      return Promise.resolve(null);
    }

    return new Promise<Blob | null>((resolve) => {
      recorder.onstop = () => {
        const chunks = chunksRef.current;
        const blob =
          chunks.length > 0
            ? new Blob(chunks, { type: chunks[0].type || "audio/webm" })
            : null;
        chunksRef.current = [];
        cleanupStream();
        setState("idle");
        resolve(blob);
      };
      recorder.stop();
    });
  }, [cleanupStream, cleanupTick]);

  const cancel = useCallback(() => {
    cleanupTick();
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = null;
      recorder.stop();
    }
    chunksRef.current = [];
    cleanupStream();
    setState("idle");
  }, [cleanupStream, cleanupTick]);

  return { state, durationMs, errorMessage, start, stop, cancel };
}
