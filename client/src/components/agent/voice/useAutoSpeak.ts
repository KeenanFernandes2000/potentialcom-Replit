import { useCallback, useEffect, useState } from "react";

// Bumped from "ruby:autoSpeak" so existing visitors who toggled it on
// during Plan 2a testing get a fresh OFF default — auto-speak is too
// intrusive as a default behavior for a discovery demo. Per-tab
// preferences still persist normally inside the new key.
const STORAGE_KEY = "ruby:autoSpeak:v2";
const SYNC_EVENT = "ruby:autoSpeakChanged";

export interface UseAutoSpeakResult {
  enabled: boolean;
  setEnabled: (next: boolean) => void;
}

function readInitial(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

// Mirrors a single boolean in localStorage. Multiple hook instances stay
// in sync via a custom window event — browsers don't fire `storage`
// events on the originating tab, so we broadcast our own.
export function useAutoSpeak(): UseAutoSpeakResult {
  const [enabled, setEnabledState] = useState<boolean>(() => readInitial());

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<boolean>).detail;
      setEnabledState(detail === true);
    };
    window.addEventListener(SYNC_EVENT, handler as EventListener);
    return () =>
      window.removeEventListener(SYNC_EVENT, handler as EventListener);
  }, []);

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "true" : "false");
    } catch {
      // ignore quota / unavailable-storage errors
    }
    window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: next }));
  }, []);

  return { enabled, setEnabled };
}
