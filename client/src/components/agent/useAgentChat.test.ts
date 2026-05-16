import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAgentChat } from "./useAgentChat";

describe("useAgentChat — pushExternalEvent", () => {
  it("appends a user message on user-transcript", () => {
    const { result } = renderHook(() => useAgentChat("ruby"));
    expect(result.current.messages).toHaveLength(0);
    act(() => {
      result.current.pushExternalEvent({
        kind: "user-transcript",
        text: "find me a lipstick",
      });
    });
    expect(result.current.messages).toHaveLength(1);
    const msg = result.current.messages[0];
    expect(msg.role).toBe("user");
    expect(msg.text).toBe("find me a lipstick");
    expect(msg.status).toBe("complete");
  });

  it("dedupes a back-to-back user-transcript with the same text (worker double-publish protection)", () => {
    const { result } = renderHook(() => useAgentChat("ruby"));
    act(() => {
      result.current.pushExternalEvent({
        kind: "user-transcript",
        text: "show me lipsticks",
      });
      result.current.pushExternalEvent({
        kind: "user-transcript",
        text: "show me lipsticks",
      });
    });
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].text).toBe("show me lipsticks");
  });

  it("treats whitespace-only differences as duplicates", () => {
    const { result } = renderHook(() => useAgentChat("ruby"));
    act(() => {
      result.current.pushExternalEvent({
        kind: "user-transcript",
        text: "yes",
      });
      result.current.pushExternalEvent({
        kind: "user-transcript",
        text: "  yes  ",
      });
    });
    expect(result.current.messages).toHaveLength(1);
  });

  it("does NOT dedupe when the user genuinely says the same thing after an agent reply", () => {
    const { result } = renderHook(() => useAgentChat("ruby"));
    act(() => {
      result.current.pushExternalEvent({
        kind: "user-transcript",
        text: "yes",
      });
      result.current.pushExternalEvent({
        kind: "agent-response",
        text: "Got it!",
      });
      result.current.pushExternalEvent({
        kind: "user-transcript",
        text: "yes",
      });
    });
    expect(result.current.messages).toHaveLength(3);
    expect(result.current.messages[0].role).toBe("user");
    expect(result.current.messages[1].role).toBe("agent");
    expect(result.current.messages[2].role).toBe("user");
  });

  it("dedupes a back-to-back agent-response with the same text (worker SpeechCreated + ConversationItemAdded both fire)", () => {
    const { result } = renderHook(() => useAgentChat("ruby"));
    act(() => {
      result.current.pushExternalEvent({
        kind: "agent-response",
        text: "Hi there! How can I help?",
      });
      // Second push from the worker's later ConversationItemAdded — same text.
      result.current.pushExternalEvent({
        kind: "agent-response",
        text: "Hi there! How can I help?",
      });
    });
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].role).toBe("agent");
  });

  it("dedupes agent-response across markdown vs TTS-cleaned formatting (same content, different glyphs)", () => {
    const { result } = renderHook(() => useAgentChat("ruby"));
    const rich = "Love the energy 💖\n\nWhat are we saying yes to?\n\n• 🛍️ Shopping for beauty products";
    const cleaned = "Love the energy What are we saying yes to? * Shopping for beauty products";
    act(() => {
      result.current.pushExternalEvent({ kind: "agent-response", text: rich });
      result.current.pushExternalEvent({ kind: "agent-response", text: cleaned });
    });
    expect(result.current.messages).toHaveLength(1);
    // Should keep the longer/richer text (preserves emoji + bullets).
    expect(result.current.messages[0].text).toBe(rich);
  });

  it("keeps the longer/richer text when two formatted versions of the SAME content arrive (markdown wins over TTS-cleaned)", () => {
    const { result } = renderHook(() => useAgentChat("ruby"));
    // TTS-cleaned arrives first (in practice the order can flip). Both
    // versions normalize identically (alphanumeric-only); the differences
    // are emoji + punctuation + an em-dash, which the dedupe strips.
    const cleaned = "Welcome to Alora let's find your perfect look";
    const rich = "Welcome to Alora — let's find your perfect look ✨";
    act(() => {
      result.current.pushExternalEvent({ kind: "agent-response", text: cleaned });
      result.current.pushExternalEvent({ kind: "agent-response", text: rich });
    });
    expect(result.current.messages).toHaveLength(1);
    // Both normalize identically (alphanumeric-only, first 200 chars).
    // The replace-with-longer rule preserves the prettier rendering.
    expect(result.current.messages[0].text).toBe(rich);
  });

  it("does NOT dedupe an agent-response after a user turn (genuine new reply)", () => {
    const { result } = renderHook(() => useAgentChat("ruby"));
    act(() => {
      result.current.pushExternalEvent({
        kind: "agent-response",
        text: "Sure!",
      });
      result.current.pushExternalEvent({
        kind: "user-transcript",
        text: "great",
      });
      result.current.pushExternalEvent({
        kind: "agent-response",
        text: "Sure!",
      });
    });
    expect(result.current.messages).toHaveLength(3);
  });

  it("appends a complete agent message on agent-response", () => {
    const { result } = renderHook(() => useAgentChat("ruby"));
    act(() => {
      result.current.pushExternalEvent({
        kind: "agent-response",
        text: "Here are some lipsticks 💋",
      });
    });
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toMatchObject({
      role: "agent",
      text: "Here are some lipsticks 💋",
      status: "complete",
    });
  });

  it("adds a loading invocation to the latest agent message on tool-call", () => {
    const { result } = renderHook(() => useAgentChat("ruby"));
    act(() => {
      result.current.pushExternalEvent({
        kind: "agent-response",
        text: "Let me look...",
      });
    });
    act(() => {
      result.current.pushExternalEvent({
        kind: "tool-call",
        id: "call-1",
        name: "display_makeup_products",
        args: { products: [] },
        async: true,
      });
    });
    const lastAgent = result.current.messages[result.current.messages.length - 1];
    expect(lastAgent.role).toBe("agent");
    expect(lastAgent.tools).toHaveLength(1);
    expect(lastAgent.tools[0]).toMatchObject({
      id: "call-1",
      name: "display_makeup_products",
      status: "loading",
    });
  });

  it("creates a new agent message for tool-call when no recent agent message exists", () => {
    const { result } = renderHook(() => useAgentChat("ruby"));
    act(() => {
      result.current.pushExternalEvent({
        kind: "user-transcript",
        text: "show me lipsticks",
      });
    });
    act(() => {
      result.current.pushExternalEvent({
        kind: "tool-call",
        id: "call-1",
        name: "search_shopify_products",
        args: { query: "lipstick" },
        async: false,
      });
    });
    // Two messages: user transcript + a NEW agent message hosting the invocation
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1].role).toBe("agent");
    expect(result.current.messages[1].tools).toHaveLength(1);
    expect(result.current.messages[1].tools[0].status).toBe("loading");
  });

  it("exposes a stable non-empty sessionId for cross-hook sharing", () => {
    const { result } = renderHook(() => useAgentChat("ruby"));
    expect(typeof result.current.sessionId).toBe("string");
    expect(result.current.sessionId.length).toBeGreaterThan(0);
    // Same hook instance should return the same id across renders.
    const first = result.current.sessionId;
    act(() => {
      result.current.pushExternalEvent({ kind: "user-transcript", text: "hi" });
    });
    expect(result.current.sessionId).toBe(first);
  });

  it("creates a new agent message on the first agent-response-stream event for a turn", () => {
    const { result } = renderHook(() => useAgentChat("ruby"));
    act(() => {
      result.current.pushExternalEvent({
        kind: "agent-response-stream",
        turnId: "voice-turn-1",
        text: "Hi",
      });
    });
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toMatchObject({
      role: "agent",
      text: "Hi",
      turnId: "voice-turn-1",
    });
  });

  it("updates the SAME bubble for subsequent agent-response-stream events with the same turnId (token-by-token growth)", () => {
    const { result } = renderHook(() => useAgentChat("ruby"));
    act(() => {
      result.current.pushExternalEvent({
        kind: "agent-response-stream",
        turnId: "voice-turn-1",
        text: "Hi",
      });
      result.current.pushExternalEvent({
        kind: "agent-response-stream",
        turnId: "voice-turn-1",
        text: "Hi there",
      });
      result.current.pushExternalEvent({
        kind: "agent-response-stream",
        turnId: "voice-turn-1",
        text: "Hi there friend",
      });
    });
    // ONE bubble — replaced in-place by each stream event.
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].text).toBe("Hi there friend");
    expect(result.current.messages[0].turnId).toBe("voice-turn-1");
  });

  it("starts a NEW bubble for a different turnId (two consecutive replies)", () => {
    const { result } = renderHook(() => useAgentChat("ruby"));
    act(() => {
      result.current.pushExternalEvent({
        kind: "agent-response-stream",
        turnId: "voice-turn-1",
        text: "First reply",
      });
      result.current.pushExternalEvent({
        kind: "agent-response-stream",
        turnId: "voice-turn-2",
        text: "Second reply",
      });
    });
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0].text).toBe("First reply");
    expect(result.current.messages[0].turnId).toBe("voice-turn-1");
    expect(result.current.messages[1].text).toBe("Second reply");
    expect(result.current.messages[1].turnId).toBe("voice-turn-2");
  });

  it("matches agent-response-stream by turnId even when other messages sit between events (skipping intervening tool calls)", () => {
    const { result } = renderHook(() => useAgentChat("ruby"));
    act(() => {
      result.current.pushExternalEvent({
        kind: "agent-response-stream",
        turnId: "voice-turn-1",
        text: "Let me check",
      });
      // A user transcript lands while the stream is still mid-flight
      // (e.g. user interrupts). The next stream chunk must STILL find
      // the original turn-1 bubble — not append a new one.
      result.current.pushExternalEvent({
        kind: "user-transcript",
        text: "wait",
      });
      result.current.pushExternalEvent({
        kind: "agent-response-stream",
        turnId: "voice-turn-1",
        text: "Let me check the catalog",
      });
    });
    expect(result.current.messages).toHaveLength(2);
    const agentMsg = result.current.messages.find((m) => m.turnId === "voice-turn-1");
    expect(agentMsg?.text).toBe("Let me check the catalog");
    // The user transcript is still present and separate.
    expect(result.current.messages.some((m) => m.role === "user" && m.text === "wait")).toBe(true);
  });

  it("marks the invocation complete on tool-result, matching by id", () => {
    const { result } = renderHook(() => useAgentChat("ruby"));
    act(() => {
      result.current.pushExternalEvent({
        kind: "agent-response",
        text: "Let me look...",
      });
    });
    act(() => {
      result.current.pushExternalEvent({
        kind: "tool-call",
        id: "call-1",
        name: "search_shopify_products",
        args: { query: "lipstick" },
        async: false,
      });
    });
    act(() => {
      result.current.pushExternalEvent({
        kind: "tool-result",
        id: "call-1",
        result: { count: 3, products: [{ name: "Lip A" }] },
      });
    });
    const lastAgent = result.current.messages[result.current.messages.length - 1];
    expect(lastAgent.tools[0].status).toBe("complete");
    expect(lastAgent.tools[0].response).toEqual({
      count: 3,
      products: [{ name: "Lip A" }],
    });
  });

  it("stamps a numeric createdAt on a user-transcript message", () => {
    const { result } = renderHook(() => useAgentChat("ruby"));
    const before = Date.now();
    act(() => {
      result.current.pushExternalEvent({
        kind: "user-transcript",
        text: "hi",
      });
    });
    const after = Date.now();
    const msg = result.current.messages[0];
    expect(typeof msg.createdAt).toBe("number");
    expect(msg.createdAt).toBeGreaterThanOrEqual(before);
    expect(msg.createdAt).toBeLessThanOrEqual(after);
  });

  it("stamps createdAt on agent-response, agent-response-stream, and tool-call-created agent messages", () => {
    const { result } = renderHook(() => useAgentChat("ruby"));
    const before = Date.now();
    act(() => {
      result.current.pushExternalEvent({ kind: "agent-response", text: "hello" });
      result.current.pushExternalEvent({
        kind: "agent-response-stream",
        turnId: "turn-2",
        text: "world",
      });
      result.current.pushExternalEvent({
        kind: "user-transcript",
        text: "another",
      });
      result.current.pushExternalEvent({
        kind: "tool-call",
        id: "t-1",
        name: "fake_tool",
        args: {},
        async: false,
      });
    });
    const after = Date.now();
    for (const m of result.current.messages) {
      expect(typeof m.createdAt).toBe("number");
      expect(m.createdAt).toBeGreaterThanOrEqual(before);
      expect(m.createdAt).toBeLessThanOrEqual(after);
    }
  });

  it("clear() resets messages to [], mints a new sessionId, and sets status idle", () => {
    const { result } = renderHook(() => useAgentChat("ruby"));
    const originalSessionId = result.current.sessionId;
    act(() => {
      result.current.pushExternalEvent({ kind: "user-transcript", text: "one" });
      result.current.pushExternalEvent({ kind: "agent-response", text: "two" });
    });
    expect(result.current.messages.length).toBe(2);

    act(() => {
      result.current.clear();
    });

    expect(result.current.messages).toEqual([]);
    expect(result.current.status).toBe("idle");
    expect(result.current.sessionId).not.toBe(originalSessionId);
    expect(result.current.sessionId.length).toBeGreaterThan(0);
  });

  it("send() after clear() uses the new sessionId (not the stale pre-clear one)", async () => {
    // Return a FRESH Response per call — Response bodies are single-use
    // ReadableStreams, so reusing one Response across two send() calls
    // would throw "ReadableStream is locked" on the second read.
    const fetchMock = vi.fn().mockImplementation(
      async () =>
        new Response("data: [DONE]\n\n", {
          status: 200,
          headers: { "Content-Type": "text/event-stream" },
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useAgentChat("ruby"));
    const originalSessionId = result.current.sessionId;

    // First send uses the original sessionId.
    await act(async () => {
      await result.current.send("first");
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const firstBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(firstBody.sessionId).toBe(originalSessionId);

    // Clear, then send again — must use the NEW sessionId.
    act(() => {
      result.current.clear();
    });
    const newSessionId = result.current.sessionId;
    expect(newSessionId).not.toBe(originalSessionId);

    await act(async () => {
      await result.current.send("second");
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const secondBody = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(secondBody.sessionId).toBe(newSessionId);

    vi.unstubAllGlobals();
  });
});
