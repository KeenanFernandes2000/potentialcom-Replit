import { describe, it, expect } from "vitest";
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
});
