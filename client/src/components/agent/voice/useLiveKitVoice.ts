import { useCallback, useEffect, useRef, useState } from "react";
import type { ExternalVoiceEvent } from "../useAgentChat";

export type VoiceState =
  | "idle"
  | "connecting"
  | "listening"
  | "user-speaking"
  | "agent-speaking"
  | "ending"
  | "error";

export interface UseLiveKitVoiceResult {
  state: VoiceState;
  errorMessage: string | null;
  durationMs: number;
  isMuted: boolean;
  start: () => Promise<void>;
  hangup: () => void;
  toggleMute: () => void;
}

interface RoomCreateResponse {
  roomName: string;
  token?: string;
  wsUrl: string;
  // The proxy synthesizes this so the browser knows where the custom
  // /ws/livekit/... handler lives (potentialTS HTTP host, not the
  // LiveKit native server on wsUrl). Prefer customWsUrl when present.
  customWsUrl?: string;
  botId?: string;
  participantName?: string;
}

interface ServerJsonEvent {
  type: string;
  text?: string;
  toolCall?: { name: string; arguments: unknown; async: boolean };
  toolResult?: { name: string; result: unknown };
}

// Stable id for matching tool_call → tool_result. The server's
// tool_result event carries the tool name but not the call arguments,
// so we key both events by name only. This means two concurrent calls
// to the SAME tool name with different args would collide — acceptable
// for the single-call golden path; revisit if upstream adds a real
// correlation id.
function makeToolId(name: string): string {
  return `voice-${name}`;
}

// Parse tool_result.result, which the server sends as a JSON string.
function parseResult(raw: unknown): unknown {
  if (typeof raw !== "string") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

export function useLiveKitVoice(
  agentKey: string,
  pushExternalEvent: (event: ExternalVoiceEvent) => void,
): UseLiveKitVoiceResult {
  const [state, setState] = useState<VoiceState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const stateRef = useRef<VoiceState>("idle");
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const playerAudioRef = useRef<HTMLAudioElement | null>(null);
  const playerUrlRef = useRef<string | null>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const isMutedRef = useRef(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const sessionIdRef = useRef<string>("");

  const cleanup = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      try {
        wsRef.current.close();
      } catch {
        /* ignore */
      }
    }
    wsRef.current = null;

    workletNodeRef.current?.disconnect();
    workletNodeRef.current = null;

    sourceNodeRef.current?.disconnect();
    sourceNodeRef.current = null;

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    audioCtxRef.current?.close()?.catch(() => {});
    audioCtxRef.current = null;

    if (playerAudioRef.current) {
      playerAudioRef.current.pause();
      playerAudioRef.current = null;
    }
    if (playerUrlRef.current) {
      URL.revokeObjectURL(playerUrlRef.current);
      playerUrlRef.current = null;
    }
    mediaSourceRef.current = null;
    sourceBufferRef.current = null;
    audioQueueRef.current = [];
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const setupPlayer = useCallback(() => {
    if (typeof MediaSource === "undefined") return;
    const ms = new MediaSource();
    const url = URL.createObjectURL(ms);
    const audio = new Audio();
    audio.src = url;
    void audio.play()?.catch(() => {});

    ms.addEventListener("sourceopen", () => {
      try {
        const sb = ms.addSourceBuffer("audio/mpeg");
        sourceBufferRef.current = sb;
        sb.addEventListener("updateend", () => {
          const q = audioQueueRef.current;
          if (q.length > 0 && !sb.updating) {
            const next = q.shift();
            if (next) sb.appendBuffer(next);
          }
        });
      } catch {
        /* sourceopen errors: fallback later */
      }
    });

    mediaSourceRef.current = ms;
    playerAudioRef.current = audio;
    playerUrlRef.current = url;
  }, []);

  const handleBinary = useCallback((data: ArrayBuffer) => {
    const sb = sourceBufferRef.current;
    if (!sb) {
      audioQueueRef.current.push(data);
      return;
    }
    if (sb.updating || audioQueueRef.current.length > 0) {
      audioQueueRef.current.push(data);
    } else {
      try {
        sb.appendBuffer(data);
      } catch {
        // Likely "QuotaExceededError" — drop the chunk and keep playing.
      }
    }
  }, []);

  const handleJson = useCallback(
    (raw: string) => {
      let ev: ServerJsonEvent;
      try {
        ev = JSON.parse(raw) as ServerJsonEvent;
      } catch {
        return;
      }
      switch (ev.type) {
        case "transcript":
          if (typeof ev.text === "string" && ev.text.trim()) {
            pushExternalEvent({ kind: "user-transcript", text: ev.text });
          }
          return;
        case "aiResponse":
        case "ai_response":
          if (typeof ev.text === "string" && ev.text.trim()) {
            pushExternalEvent({ kind: "agent-response", text: ev.text });
          }
          return;
        case "tool_call":
          if (ev.toolCall) {
            pushExternalEvent({
              kind: "tool-call",
              id: makeToolId(ev.toolCall.name),
              name: ev.toolCall.name,
              args: ev.toolCall.arguments,
              async: ev.toolCall.async,
            });
          }
          return;
        case "tool_result":
          if (ev.toolResult) {
            pushExternalEvent({
              kind: "tool-result",
              id: makeToolId(ev.toolResult.name),
              result: parseResult(ev.toolResult.result),
            });
          }
          return;
        case "audio_start":
          setState("agent-speaking");
          return;
        case "audio_end":
          setState("listening");
          return;
        case "KeepAlive":
        default:
          return;
      }
    },
    [pushExternalEvent],
  );

  const start = useCallback(async () => {
    cleanup();
    setErrorMessage(null);
    setState("connecting");

    // 1. Mint a room
    let room: RoomCreateResponse;
    try {
      const sid =
        sessionIdRef.current ||
        `voice-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      sessionIdRef.current = sid;
      const res = await fetch(`/api/agent/${agentKey}/voice/room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid }),
      });
      if (!res.ok) {
        const body = await res.text();
        let msg = `Failed to start voice call (${res.status})`;
        try {
          const j = JSON.parse(body);
          if (j && typeof j.error === "string") msg = j.error;
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }
      room = (await res.json()) as RoomCreateResponse;
    } catch (err) {
      setState("error");
      setErrorMessage(err instanceof Error ? err.message : "Could not start call");
      return;
    }

    // 2. Mic
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
    } catch (err) {
      setState("error");
      setErrorMessage(err instanceof Error ? err.message : "Mic access denied");
      return;
    }
    streamRef.current = stream;

    // 3. WebSocket. The custom WS handler lives on the potentialTS
    // HTTP server (api.potential.com) at /ws/livekit/{roomName}/{botId}/{sessionId}.
    // The proxy synthesizes `customWsUrl` from POTENTIAL_API_BASE so we
    // don't have to derive it client-side. Falls back to `wsUrl` if the
    // proxy didn't include it (older server).
    const sid = sessionIdRef.current;
    const wsBase = (room.customWsUrl ?? room.wsUrl).replace(/\/$/, "");
    const botPathSegment = room.botId ?? agentKey;
    const wsUrl = `${wsBase}/ws/livekit/${room.roomName}/${botPathSegment}/${sid}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    // Wire up WS handlers immediately after construction so they are in
    // place before any async suspension (addModule). FakeWebSocket fires
    // onopen via queueMicrotask, which runs after the current task but
    // can interleave with awaited Promises; assigning here ensures the
    // handler is registered before that microtask fires.
    ws.onopen = () => {
      // The server's WebSocket handler waits for a JSON config message
      // BEFORE it sets up the Deepgram STT connection. Until this is
      // sent, every PCM frame we forward is dropped on the floor.
      // The matching AudioContext is at 16000 Hz (see `new AudioContext`
      // above); the worklet emits Int16 LE PCM at that rate.
      try {
        ws.send(JSON.stringify({ type: "config", sampleRate: 16000 }));
      } catch {
        // If send fails here the socket is likely already closing — the
        // onclose/onerror handlers will surface the failure.
      }
      setState("listening");
      startTimeRef.current = Date.now();
      setDurationMs(0);
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = setInterval(() => {
        setDurationMs(Date.now() - startTimeRef.current);
      }, 1000);
    };
    ws.onmessage = (event: MessageEvent) => {
      if (typeof event.data === "string") {
        handleJson(event.data);
      } else if (event.data instanceof ArrayBuffer) {
        handleBinary(event.data);
      } else if (event.data instanceof Blob) {
        event.data.arrayBuffer().then(handleBinary);
      }
    };
    ws.onerror = () => {
      setState("error");
      setErrorMessage("Voice connection error");
    };
    ws.onclose = () => {
      if (stateRef.current !== "ending" && stateRef.current !== "error") {
        setState("error");
        setErrorMessage("Voice call dropped");
      }
    };

    // 4. AudioContext + worklet
    const ctx = new AudioContext({ sampleRate: 16000 });
    audioCtxRef.current = ctx;

    try {
      // Vite resolves the URL with `import.meta.url`. In tests, the
      // FakeAudioContext.addModule is a no-op mock that returns
      // undefined; this still resolves cleanly.
      const workletUrl = new URL("./pcm-worklet.ts", import.meta.url).href;
      await ctx.audioWorklet.addModule(workletUrl);
    } catch {
      // Fall through — production builds will resolve correctly; tests
      // never reach this branch because the module is mocked.
    }

    const source = ctx.createMediaStreamSource(stream);
    sourceNodeRef.current = source;
    const node = new AudioWorkletNode(ctx, "pcm-worklet");
    workletNodeRef.current = node;
    source.connect(node);

    node.port.onmessage = (ev: MessageEvent) => {
      if (isMutedRef.current) return;
      const buf = ev.data as ArrayBuffer;
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(buf);
      }
    };

    setupPlayer();
  }, [agentKey, cleanup, handleBinary, handleJson, setupPlayer]);

  const hangup = useCallback(() => {
    setState("ending");
    cleanup();
    setState("idle");
    setDurationMs(0);
  }, [cleanup]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      isMutedRef.current = next;
      return next;
    });
  }, []);

  return {
    state,
    errorMessage,
    durationMs,
    isMuted,
    start,
    hangup,
    toggleMute,
  };
}
