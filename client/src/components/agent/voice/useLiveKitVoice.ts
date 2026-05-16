import { useCallback, useEffect, useRef, useState } from "react";
import { Room, RoomEvent, Track, type RemoteVideoTrack } from "livekit-client";
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
  /**
   * Remote video track from the Anam avatar agent, if it has joined
   * the room (i.e. the call was started with { withAvatar: true } AND
   * the worker successfully spawned an AvatarSession). null otherwise.
   * Consumers render this in <AvatarView> when non-null.
   */
  avatarVideoTrack: RemoteVideoTrack | null;
  /** Start a LiveKit call. Pass { withAvatar: true } to request an
   *  Anam avatar; the backend forwards the flag to the worker via
   *  dispatch metadata. Defaults to voice-only. */
  start: (opts?: { withAvatar?: boolean }) => Promise<void>;
  hangup: () => void;
  toggleMute: () => void;
}

interface RoomCreateResponse {
  success?: boolean;
  roomName: string;
  token: string;
  wsUrl: string;
  participantName?: string;
  useNativeAgent?: boolean;
}

interface DataMessage {
  type: string;
  text?: string;
  name?: string;
  arguments?: unknown;
  output?: string;
  callId?: string;
  isError?: boolean;
  speaking?: boolean;
  // For type:"ai_response_stream" — stable id across a single LLM turn.
  // Multiple stream messages with the same turnId update the same bubble.
  turnId?: string;
}

/**
 * Real-time voice mode hook. Talks to LiveKit directly via `livekit-client`.
 * A worker registered as "voice-agent" is dispatched into the room by
 * potentialTS; the worker publishes structured events
 * (transcript / ai_response / tool_call / tool_result / agent_speaking)
 * via the room's data channel, which we route to pushExternalEvent so the
 * chat scroll renders them identically to typed conversations.
 *
 * Public surface kept intact for Plan 2b consumers (AgentChat, VoiceCallBar,
 * VoiceModeButton). Internals replaced from the legacy custom-WS transport.
 */
export function useLiveKitVoice(
  agentKey: string,
  sessionId: string,
  pushExternalEvent: (event: ExternalVoiceEvent) => void,
): UseLiveKitVoiceResult {
  const [state, setState] = useState<VoiceState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [avatarVideoTrack, setAvatarVideoTrack] = useState<RemoteVideoTrack | null>(null);

  const roomRef = useRef<Room | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  // Mirror state for use inside non-React callbacks (Disconnected handler)
  // without stale closures.
  const stateRef = useRef<VoiceState>("idle");
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const cleanup = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (roomRef.current) {
      try {
        // Disconnect is idempotent; ignore errors.
        void roomRef.current.disconnect();
      } catch {
        /* ignore */
      }
      roomRef.current = null;
    }
    setAvatarVideoTrack(null);
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const handleData = useCallback(
    (payload: Uint8Array) => {
      let parsed: DataMessage;
      try {
        const text = new TextDecoder().decode(payload);
        parsed = JSON.parse(text) as DataMessage;
      } catch {
        return;
      }

      switch (parsed.type) {
        case "transcript":
          if (typeof parsed.text === "string" && parsed.text.trim()) {
            pushExternalEvent({ kind: "user-transcript", text: parsed.text });
          }
          return;
        case "ai_response":
        case "aiResponse":
          if (typeof parsed.text === "string" && parsed.text.trim()) {
            pushExternalEvent({ kind: "agent-response", text: parsed.text });
          }
          return;
        case "ai_response_stream":
          if (
            typeof parsed.text === "string" &&
            parsed.text.trim() &&
            typeof parsed.turnId === "string" &&
            parsed.turnId
          ) {
            pushExternalEvent({
              kind: "agent-response-stream",
              turnId: parsed.turnId,
              text: parsed.text,
            });
          }
          return;
        case "tool_call":
          if (parsed.callId && parsed.name) {
            pushExternalEvent({
              kind: "tool-call",
              id: parsed.callId,
              name: parsed.name,
              args: parsed.arguments ?? {},
              async: false,
            });
          }
          return;
        case "tool_result":
          if (parsed.callId) {
            let result: unknown = parsed.output;
            if (typeof parsed.output === "string") {
              try {
                result = JSON.parse(parsed.output);
              } catch {
                // Keep as string if not parseable JSON.
              }
            }
            pushExternalEvent({
              kind: "tool-result",
              id: parsed.callId,
              result,
            });
          }
          return;
        case "agent_speaking":
          setState(parsed.speaking ? "agent-speaking" : "listening");
          return;
        default:
          return;
      }
    },
    [pushExternalEvent],
  );

  const start = useCallback(async (opts?: { withAvatar?: boolean }) => {
    const withAvatar = opts?.withAvatar === true;
    cleanup();
    setErrorMessage(null);
    setState("connecting");

    // 1. Mint a room via the Express proxy (existing /voice/room).
    let room: RoomCreateResponse;
    try {
      const res = await fetch(`/api/agent/${agentKey}/voice/room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          ...(withAvatar ? { withAvatar: true } : {}),
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        let msg = `Failed to start voice call (${res.status})`;
        try {
          const j = JSON.parse(body);
          if (j?.error) msg = j.error;
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

    // 2. Construct + wire the Room (handlers registered BEFORE connect so
    //    any synchronous events during connect are caught).
    const rkRoom = new Room();
    roomRef.current = rkRoom;

    rkRoom.on(RoomEvent.DataReceived, (payload: Uint8Array) => {
      handleData(payload);
    });

    rkRoom.on(RoomEvent.TrackSubscribed, (track, _publication, participant) => {
      // Audio: auto-attach via livekit-client's helper.
      if (track.kind === Track.Kind.Audio) {
        // attach() returns the auto-created <audio> element; it auto-plays.
        // We don't keep the reference — the SDK manages lifecycle.
        try {
          (track as any).attach?.();
        } catch {
          /* ignore */
        }
        return;
      }
      // Video from Anam: store the track so <AvatarView> can render it.
      // Filter by participant identity prefix so we don't accidentally
      // capture video from other participants if the room ever has any.
      if (
        track.kind === Track.Kind.Video &&
        participant?.identity?.startsWith?.("anam-")
      ) {
        setAvatarVideoTrack(track as RemoteVideoTrack);
      }
    });

    // Clear the track if the avatar's participant disconnects mid-call
    // (e.g. Anam quota exceeded, network drop on Anam's side).
    rkRoom.on(RoomEvent.TrackUnsubscribed, (track, _publication, participant) => {
      if (
        track.kind === Track.Kind.Video &&
        participant?.identity?.startsWith?.("anam-")
      ) {
        setAvatarVideoTrack(null);
      }
    });

    rkRoom.on(RoomEvent.Disconnected, () => {
      if (stateRef.current !== "ending" && stateRef.current !== "idle") {
        setState("error");
        setErrorMessage("Voice call dropped");
      }
    });

    // 3. Connect, then enable mic. Either step may throw → error state.
    try {
      await rkRoom.connect(room.wsUrl, room.token);
    } catch (err) {
      setState("error");
      setErrorMessage(err instanceof Error ? err.message : "Voice connection error");
      cleanup();
      return;
    }

    try {
      await rkRoom.localParticipant.setMicrophoneEnabled(true);
    } catch (err) {
      setState("error");
      setErrorMessage(err instanceof Error ? err.message : "Mic access denied");
      cleanup();
      return;
    }

    // 4. Active. Tick the duration timer.
    setState("listening");
    startTimeRef.current = Date.now();
    setDurationMs(0);
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      setDurationMs(Date.now() - startTimeRef.current);
    }, 1000);
  }, [agentKey, sessionId, cleanup, handleData]);

  const hangup = useCallback(() => {
    setState("ending");
    cleanup();
    setState("idle");
    setDurationMs(0);
    setIsMuted(false);
  }, [cleanup]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      // Fire-and-forget — the SDK throws only on truly broken rooms.
      try {
        void roomRef.current?.localParticipant.setMicrophoneEnabled(!next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return {
    state,
    errorMessage,
    durationMs,
    isMuted,
    avatarVideoTrack,
    start,
    hangup,
    toggleMute,
  };
}
