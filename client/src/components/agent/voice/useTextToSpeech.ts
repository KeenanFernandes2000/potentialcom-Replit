import { useCallback, useEffect, useRef, useState } from "react";

export type PlaybackState = "idle" | "loading" | "playing" | "error";

export interface UseTextToSpeechResult {
  state: PlaybackState;
  errorMessage: string | null;
  play: (text: string) => Promise<void>;
  stop: () => void;
  isPlayingText: (text: string) => boolean;
}

// Owns a single HTMLAudioElement so two SpeakButtons can't double-play.
// play(text) is async because it has to fetch the audio blob before it
// can hand it to the audio element.
export function useTextToSpeech(agentKey: string): UseTextToSpeechResult {
  const [state, setState] = useState<PlaybackState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentText, setCurrentText] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }, []);

  useEffect(() => () => cleanupAudio(), [cleanupAudio]);

  const stop = useCallback(() => {
    cleanupAudio();
    setCurrentText(null);
    setState("idle");
  }, [cleanupAudio]);

  const play = useCallback(
    async (text: string) => {
      cleanupAudio();
      setErrorMessage(null);
      setState("loading");
      setCurrentText(text);
      try {
        const res = await fetch(`/api/agent/${agentKey}/speak`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (!res.ok) {
          throw new Error(`speak failed: ${res.status}`);
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        urlRef.current = url;

        const audio = new Audio();
        audio.src = url;
        audio.onended = () => {
          cleanupAudio();
          setCurrentText(null);
          setState("idle");
        };
        audio.onerror = () => {
          cleanupAudio();
          setState("error");
          setErrorMessage("Audio playback failed");
        };
        audioRef.current = audio;

        await audio.play();
        setState("playing");
      } catch (err) {
        cleanupAudio();
        setState("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to play audio",
        );
      }
    },
    [agentKey, cleanupAudio],
  );

  const isPlayingText = useCallback(
    (text: string) => state === "playing" && currentText === text,
    [state, currentText],
  );

  return { state, errorMessage, play, stop, isPlayingText };
}
