import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

// IMPORTANT: install the FakeRoom BEFORE importing useLiveKitVoice so the
// hook picks up the mocked Room from livekit-client.
// vi.mock is hoisted by Vitest so it intercepts livekit-client at module
// resolution time, before useLiveKitVoice.ts is evaluated.
import { installFakeRoom, getLastFakeRoom, FakeRoom } from "../../../test/livekitFakeRoom";
installFakeRoom();

vi.mock("livekit-client", async () => {
  const actual = await vi.importActual<any>("livekit-client");
  return { ...actual, Room: FakeRoom };
});

import { useLiveKitVoice } from "./useLiveKitVoice";

function mockFetchRoom(extra: Record<string, unknown> = {}) {
  return vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        success: true,
        roomName: "room-1",
        token: "tok",
        wsUrl: "wss://livekit.test",
        participantName: "user-1",
        useNativeAgent: true,
        ...extra,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    ),
  );
}

beforeEach(() => {
  FakeRoom.instances = [];
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("useLiveKitVoice (LiveKit-native)", () => {
  it("starts in idle state", () => {
    const push = vi.fn();
    const { result } = renderHook(() => useLiveKitVoice("ruby", "test-session", push));
    expect(result.current.state).toBe("idle");
    expect(result.current.isMuted).toBe(false);
  });

  it("fetches the room, connects via livekit-client, and transitions to listening", async () => {
    vi.stubGlobal("fetch", mockFetchRoom());
    const push = vi.fn();
    const { result } = renderHook(() => useLiveKitVoice("ruby", "test-session", push));
    await act(async () => {
      await result.current.start();
    });

    const room = getLastFakeRoom();
    expect(room.connect).toHaveBeenCalledOnce();
    expect(room.lastConnectArgs.url).toBe("wss://livekit.test");
    expect(room.lastConnectArgs.token).toBe("tok");
    expect(room.localParticipant.setMicrophoneEnabled).toHaveBeenCalledOnce();
    await waitFor(() => expect(result.current.state).toBe("listening"));
  });

  it("pushes user-transcript on incoming transcript data message", async () => {
    vi.stubGlobal("fetch", mockFetchRoom());
    const push = vi.fn();
    const { result } = renderHook(() => useLiveKitVoice("ruby", "test-session", push));
    await act(async () => {
      await result.current.start();
    });
    act(() => {
      getLastFakeRoom().triggerDataReceived({ type: "transcript", text: "find me a lipstick" });
    });
    expect(push).toHaveBeenCalledWith({ kind: "user-transcript", text: "find me a lipstick" });
  });

  it("pushes agent-response on ai_response data message", async () => {
    vi.stubGlobal("fetch", mockFetchRoom());
    const push = vi.fn();
    const { result } = renderHook(() => useLiveKitVoice("ruby", "test-session", push));
    await act(async () => {
      await result.current.start();
    });
    act(() => {
      getLastFakeRoom().triggerDataReceived({
        type: "ai_response",
        text: "Here are some lipsticks.",
      });
    });
    expect(push).toHaveBeenCalledWith({
      kind: "agent-response",
      text: "Here are some lipsticks.",
    });
  });

  it("pushes tool-call and tool-result, threading by callId", async () => {
    vi.stubGlobal("fetch", mockFetchRoom());
    const push = vi.fn();
    const { result } = renderHook(() => useLiveKitVoice("ruby", "test-session", push));
    await act(async () => {
      await result.current.start();
    });
    act(() => {
      const room = getLastFakeRoom();
      room.triggerDataReceived({
        type: "tool_call",
        name: "search_shopify_products",
        arguments: { query: "lipstick" },
        callId: "call-42",
      });
      room.triggerDataReceived({
        type: "tool_result",
        name: "search_shopify_products",
        output: JSON.stringify({ count: 3 }),
        callId: "call-42",
        isError: false,
      });
    });
    const calls = push.mock.calls.map((c) => c[0]);
    const call = calls.find((c: any) => c.kind === "tool-call");
    const res = calls.find((c: any) => c.kind === "tool-result");
    expect(call).toMatchObject({
      kind: "tool-call",
      id: "call-42",
      name: "search_shopify_products",
    });
    expect(res).toMatchObject({
      kind: "tool-result",
      id: "call-42",
      result: { count: 3 },
    });
  });

  it("toggles state to agent-speaking on agent_speaking events", async () => {
    vi.stubGlobal("fetch", mockFetchRoom());
    const push = vi.fn();
    const { result } = renderHook(() => useLiveKitVoice("ruby", "test-session", push));
    await act(async () => {
      await result.current.start();
    });
    act(() => {
      getLastFakeRoom().triggerDataReceived({ type: "agent_speaking", speaking: true });
    });
    expect(result.current.state).toBe("agent-speaking");
    act(() => {
      getLastFakeRoom().triggerDataReceived({ type: "agent_speaking", speaking: false });
    });
    expect(result.current.state).toBe("listening");
  });

  it("toggleMute flips isMuted and calls setMicrophoneEnabled with the opposite", async () => {
    vi.stubGlobal("fetch", mockFetchRoom());
    const push = vi.fn();
    const { result } = renderHook(() => useLiveKitVoice("ruby", "test-session", push));
    await act(async () => {
      await result.current.start();
    });
    const room = getLastFakeRoom();
    expect(result.current.isMuted).toBe(false);

    act(() => {
      result.current.toggleMute();
    });
    expect(result.current.isMuted).toBe(true);
    expect(room.localParticipant.setMicrophoneEnabled).toHaveBeenLastCalledWith(false);

    act(() => {
      result.current.toggleMute();
    });
    expect(result.current.isMuted).toBe(false);
    expect(room.localParticipant.setMicrophoneEnabled).toHaveBeenLastCalledWith(true);
  });

  it("hangup disconnects the Room and returns to idle", async () => {
    vi.stubGlobal("fetch", mockFetchRoom());
    const push = vi.fn();
    const { result } = renderHook(() => useLiveKitVoice("ruby", "test-session", push));
    await act(async () => {
      await result.current.start();
    });
    const room = getLastFakeRoom();
    await act(async () => {
      result.current.hangup();
    });
    expect(room.disconnect).toHaveBeenCalledOnce();
    expect(result.current.state).toBe("idle");
  });

  it("transitions to error when /voice/room returns non-2xx", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ error: "Voice trial exhausted" }),
          { status: 403, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );
    const push = vi.fn();
    const { result } = renderHook(() => useLiveKitVoice("ruby", "test-session", push));
    await act(async () => {
      await result.current.start();
    });
    expect(result.current.state).toBe("error");
    expect(result.current.errorMessage).toMatch(/trial|403/i);
  });

  it("transitions to error when Room.connect rejects", async () => {
    vi.stubGlobal("fetch", mockFetchRoom());
    // Signal the next FakeRoom instance to reject on connect.
    FakeRoom.nextConnectError = new Error("connect failed");
    try {
      const push = vi.fn();
      const { result } = renderHook(() => useLiveKitVoice("ruby", "test-session", push));
      await act(async () => {
        await result.current.start();
      });
      expect(result.current.state).toBe("error");
      expect(result.current.errorMessage).toMatch(/connect/i);
    } finally {
      FakeRoom.nextConnectError = null;
    }
  });

  it("transitions to error when setMicrophoneEnabled rejects (mic denied)", async () => {
    vi.stubGlobal("fetch", mockFetchRoom());
    // Signal the next FakeRoom instance to reject on setMicrophoneEnabled.
    FakeRoom.nextEnableMicError = new Error("Permission denied");
    try {
      const push = vi.fn();
      const { result } = renderHook(() => useLiveKitVoice("ruby", "test-session", push));
      await act(async () => {
        await result.current.start();
      });
      expect(result.current.state).toBe("error");
      expect(result.current.errorMessage).toMatch(/permission|denied/i);
    } finally {
      FakeRoom.nextEnableMicError = null;
    }
  });

  it("emits an error when Room emits Disconnected unexpectedly mid-call", async () => {
    vi.stubGlobal("fetch", mockFetchRoom());
    const push = vi.fn();
    const { result } = renderHook(() => useLiveKitVoice("ruby", "test-session", push));
    await act(async () => {
      await result.current.start();
    });
    await waitFor(() => expect(result.current.state).toBe("listening"));
    act(() => {
      getLastFakeRoom().triggerDisconnected();
    });
    expect(result.current.state).toBe("error");
    expect(result.current.errorMessage).toMatch(/dropped|disconnect/i);
  });

  it("forwards the provided sessionId in the /voice/room POST body", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          roomName: "room-1",
          token: "tok",
          wsUrl: "wss://livekit.test",
          useNativeAgent: true,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchSpy);
    const push = vi.fn();
    const { result } = renderHook(() =>
      useLiveKitVoice("ruby", "shared-session-123", push),
    );
    await act(async () => {
      await result.current.start();
    });
    expect(fetchSpy).toHaveBeenCalledOnce();
    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body));
    expect(body.sessionId).toBe("shared-session-123");
  });
});
