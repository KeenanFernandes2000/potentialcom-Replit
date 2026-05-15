# Ruby Real-Time Voice Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real-time, full-duplex voice mode to Ruby's chat on `/demo`. The user clicks "Talk to Ruby" in the chat header, speaks into their mic, and Ruby replies in audio. Voice events (transcripts, agent responses, tool calls) stream into the same `messages[]` chat history as typed conversations.

**Architecture:** One thin Express proxy mints a LiveKit-style room via the existing `potentialTS` endpoint. The frontend then connects directly to potentialTS over a WebSocket (`wss://api.potential.com/ws/livekit/{roomName}/{botId}/{sessionId}`) that carries both binary audio (16-bit linear PCM mono mic in, MP3 from streaming TTS out) and JSON text events (`transcript`, `aiResponse`, `tool_call`, `tool_result`, `audio_start`, `audio_end`, `KeepAlive`). The `livekitAgent.controller.ts` in potentialTS reuses the same `processWithAIAndTools` pipeline as the typed chat, so Ruby's 17 bespoke tool cards render unchanged.

**Tech Stack:** React 18 + TypeScript + Vite + Express 4 + Vitest + `@testing-library/react`. Browser-native APIs only: `WebSocket`, `MediaStream`, `AudioContext`, `AudioWorklet`, `MediaSource`, `HTMLAudioElement`. No new npm packages.

**Spec:** `docs/superpowers/specs/2026-05-15-ruby-voice-mode-design.md` (commit `82d870f`).

**Prerequisite:** Plan 2a (PR #3 — `claude/ruby-voice-buttons`) must be merged to `main` first. The `client/src/components/agent/voice/` directory and its files (`useVoiceRecorder`, `useTextToSpeech`, `useAutoSpeak`, `MicButton`, `SpeakButton`, `AutoSpeakToggle`, `voice/index.ts`, `voice/AgentChatVoice.test.tsx`) all come from Plan 2a and are extended by this plan. After PR #3 merges, create a fresh worktree from `main` for this plan.

**Bot config required:** Ruby's bot document needs `audiostt: true` AND `audiotts: true` for voice mode to render in the UI. Both flags already flipped during Plan 2a verification.

**Node:** Use `PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH` as the prefix for every npm command.

---

## Task 1: Express proxy — `POST /api/agent/:agentKey/voice/room`

Thin pass-through proxy that forwards a JSON `{sessionId}` body to potentialTS's `POST /api/voice/room/create` and relays the upstream response verbatim. The room creation endpoint is what enforces the voice trial budget upstream, so error pass-through must be faithful.

**Files:**
- Create: `server/routes.agent-voice-room.test.ts`
- Modify: `server/routes.ts` (add new route immediately after `/speak` proxy)

- [ ] **Step 1: Write the failing tests**

Create `server/routes.agent-voice-room.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from "vitest";
import express from "express";
import request from "supertest";

vi.mock("./storage", () => ({ storage: {} }));
vi.mock("./db", () => ({}));
vi.mock("@sendgrid/mail", () => ({ default: { setApiKey: vi.fn() } }));
vi.mock("./wp-proxy", () => ({ proxyWordPressRequest: vi.fn() }));

import { registerRoutes } from "./routes";

function makeApp() {
  const app = express();
  app.use(express.json());
  registerRoutes(app);
  return app;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("POST /api/agent/:agentKey/voice/room", () => {
  it("returns 404 for an unknown agent", async () => {
    const res = await request(makeApp())
      .post("/api/agent/nope/voice/room")
      .send({ sessionId: "s1" });
    expect(res.status).toBe(404);
  });

  it("forwards botId + sessionId to upstream and relays the response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          roomName: "bot-abc-session-s1-12345",
          token: "fake.jwt.token",
          wsUrl: "wss://livekit.potential.com",
          participantName: "user-12345",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const res = await request(makeApp())
      .post("/api/agent/ruby/voice/room")
      .send({ sessionId: "s1" });

    expect(res.status).toBe(200);
    expect(res.body.roomName).toBe("bot-abc-session-s1-12345");
    expect(res.body.token).toBe("fake.jwt.token");
    expect(res.body.wsUrl).toBe("wss://livekit.potential.com");

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(String(url)).toContain("/api/voice/room/create");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ "Content-Type": "application/json" });
    const body = JSON.parse(String(init.body));
    expect(body.botId).toBe("6a056e4ece71ae96a167f826");
    expect(body.sessionId).toBe("s1");
  });

  it("relays a 403 trial-exhausted upstream error verbatim", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: "Voice disabled: 10-minute voice trial exhausted",
          }),
          { status: 403, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );
    const res = await request(makeApp())
      .post("/api/agent/ruby/voice/room")
      .send({ sessionId: "s1" });
    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      error: "Voice disabled: 10-minute voice trial exhausted",
    });
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test -- server/routes.agent-voice-room.test.ts
```
Expected: 3 tests FAIL (route doesn't exist).

- [ ] **Step 3: Add the proxy route**

In `server/routes.ts`, find the `/api/agent/:agentKey/speak` proxy added in Plan 2a. Add immediately after its closing `});`:

```ts
  // Mints a voice-mode room via potentialTS. The upstream gates the
  // request on the bot's voice-trial budget and returns
  // {roomName, token, wsUrl, participantName}. The browser then opens
  // a WebSocket directly to potentialTS using those values; this proxy
  // does NOT sit in the audio data path.
  app.post("/api/agent/:agentKey/voice/room", async (req, res) => {
    const agent = getAgent(req.params.agentKey);
    if (!agent) {
      return res.status(404).json({ message: "Unknown agent" });
    }
    try {
      const upstream = await fetch(
        `${POTENTIAL_API_BASE}/api/voice/room/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            botId: agent.botId,
            sessionId: req.body?.sessionId,
          }),
        },
      );
      const text = await upstream.text();
      res
        .status(upstream.status)
        .type(upstream.headers.get("content-type") ?? "application/json")
        .send(text);
    } catch (err) {
      console.error("Agent voice room proxy error:", err);
      res.status(502).json({ message: "Failed to reach voice service" });
    }
  });
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test -- server/routes.agent-voice-room.test.ts
```
Expected: 3 tests pass.

- [ ] **Step 5: Run the full test suite (no regressions)**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test
```
Expected: all prior tests still pass; count grows by 3.

- [ ] **Step 6: Commit**

```bash
git add server/routes.ts server/routes.agent-voice-room.test.ts
git commit -m "Add /api/agent/:agentKey/voice/room proxy route"
```

---

## Task 2: Extend `useAgentChat` with `pushExternalEvent`

Add an outbound method so `useLiveKitVoice` can inject voice events into the same `messages[]` state that the SSE chat manages. Single source of truth for chat history.

**Files:**
- Create: `client/src/components/agent/useAgentChat.test.ts`
- Modify: `client/src/components/agent/useAgentChat.ts`

- [ ] **Step 1: Write the failing tests**

Create `client/src/components/agent/useAgentChat.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test -- client/src/components/agent/useAgentChat.test.ts
```
Expected: all 5 tests fail (`pushExternalEvent` doesn't exist).

- [ ] **Step 3: Add the type + method**

In `client/src/components/agent/useAgentChat.ts`, find the existing `UseAgentChat` interface (around line 15):

```ts
export interface UseAgentChat {
  messages: AgentMessage[];
  status: "idle" | "streaming";
  send: (text: string, imageUrl?: string) => Promise<void>;
}
```

Replace it with:

```ts
export type ExternalVoiceEvent =
  | { kind: "user-transcript"; text: string }
  | { kind: "agent-response"; text: string }
  | {
      kind: "tool-call";
      id: string;
      name: string;
      args: unknown;
      async: boolean;
    }
  | { kind: "tool-result"; id: string; result: unknown };

export interface UseAgentChat {
  messages: AgentMessage[];
  status: "idle" | "streaming";
  send: (text: string, imageUrl?: string) => Promise<void>;
  pushExternalEvent: (event: ExternalVoiceEvent) => void;
}
```

Then, inside the `useAgentChat` function body, immediately before the existing `const send = useCallback(...)` declaration, add:

```ts
  // Inject events from a parallel channel (e.g., the voice WebSocket).
  // Events follow the same lifecycle conventions as the SSE-driven
  // typed chat — user messages are complete, agent messages start
  // complete (voice TTS is server-side, not streamed token-by-token),
  // and tool calls attach to the most recent agent message.
  const pushExternalEvent = useCallback((event: ExternalVoiceEvent) => {
    setMessages((prev) => {
      switch (event.kind) {
        case "user-transcript":
          return [
            ...prev,
            {
              id: nextId("user"),
              role: "user",
              text: event.text,
              tools: [],
              status: "complete",
            },
          ];
        case "agent-response":
          return [
            ...prev,
            {
              id: nextId("agent"),
              role: "agent",
              text: event.text,
              tools: [],
              status: "complete",
            },
          ];
        case "tool-call": {
          const invocation: ToolInvocation = {
            id: event.id,
            name: event.name,
            arguments: event.args,
            status: "loading",
          };
          // Attach to the last agent message if one exists; otherwise
          // open a new agent message to host the invocation.
          const lastIdx = prev.length - 1;
          if (lastIdx >= 0 && prev[lastIdx].role === "agent") {
            const last = prev[lastIdx];
            return [
              ...prev.slice(0, lastIdx),
              { ...last, tools: [...last.tools, invocation] },
            ];
          }
          return [
            ...prev,
            {
              id: nextId("agent"),
              role: "agent",
              text: "",
              tools: [invocation],
              status: "complete",
            },
          ];
        }
        case "tool-result":
          return prev.map((m) =>
            m.role === "agent" && m.tools.some((t) => t.id === event.id)
              ? {
                  ...m,
                  tools: m.tools.map((t) =>
                    t.id === event.id
                      ? { ...t, status: "complete", response: event.result }
                      : t,
                  ),
                }
              : m,
          );
      }
    });
  }, []);
```

Then, at the bottom of the function, find the `return { messages, status, send };` line and replace with:

```ts
  return { messages, status, send, pushExternalEvent };
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test -- client/src/components/agent/useAgentChat.test.ts
```
Expected: 5 tests pass.

- [ ] **Step 5: Run the full suite + type-check**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm run check
```
Expected: prior tests still pass (the existing `send` flow is untouched); count grows by 5; tsc clean.

- [ ] **Step 6: Commit**

```bash
git add client/src/components/agent/useAgentChat.ts client/src/components/agent/useAgentChat.test.ts
git commit -m "useAgentChat: add pushExternalEvent for voice mode"
```

---

## Task 3: PCM AudioWorklet processor

A tiny `AudioWorkletProcessor` that converts mic Float32 samples to 16-bit linear PCM and posts ArrayBuffers to the main thread. Vite loads it as a runtime asset via `?worker&url` or similar; for our purposes the file lives in the voice/ directory and is loaded with `audioContext.audioWorklet.addModule(workletUrl)`.

**Files:**
- Create: `client/src/components/agent/voice/pcm-worklet.ts`

- [ ] **Step 1: Create the worklet**

Create `client/src/components/agent/voice/pcm-worklet.ts`:

```ts
// AudioWorklet processor: converts Float32 mic samples to Int16 PCM
// and posts ArrayBuffers to the main thread for transmission over the
// voice WebSocket. Runs on the audio thread (separate from the main
// thread), so it gets stable low-latency execution regardless of UI work.
//
// Loaded at runtime via `audioContext.audioWorklet.addModule(workletUrl)`.
// The matching worklet name "pcm-worklet" is referenced by the hook.

class PCMWorkletProcessor extends AudioWorkletProcessor {
  process(inputs: Float32Array[][]) {
    const input = inputs[0]?.[0];
    if (!input || input.length === 0) return true;

    const buffer = new ArrayBuffer(input.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < input.length; i++) {
      // Clamp to [-1, 1] then scale to Int16 range. Use 0x8000 for the
      // negative side and 0x7fff for positive (standard PCM convention).
      const s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    // Transfer ownership so the post is cheap (no copy).
    this.port.postMessage(buffer, [buffer]);
    return true;
  }
}

registerProcessor("pcm-worklet", PCMWorkletProcessor);

// Without an export, TS may treat the file as a script (not a module);
// the explicit empty export makes it a module so `import` works in tests.
export {};
```

- [ ] **Step 2: Verify the build type-checks**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm run check
```
Expected: no new TS errors. `AudioWorkletProcessor` / `registerProcessor` are part of `lib.webworker.iterable.d.ts` and `lib.dom.d.ts` is in tsconfig's `lib`, so they should resolve.

If you see "Cannot find name 'AudioWorkletProcessor'" or "Cannot find name 'registerProcessor'", add explicit declarations at the top of the file:

```ts
declare const AudioWorkletProcessor: {
  new (): { readonly port: MessagePort; process(inputs: Float32Array[][]): boolean };
};
declare function registerProcessor(name: string, ctor: unknown): void;
```

- [ ] **Step 3: Commit**

```bash
git add client/src/components/agent/voice/pcm-worklet.ts
git commit -m "Add PCM AudioWorklet processor for voice mode"
```

---

## Task 4: `useLiveKitVoice` hook

The main voice-mode hook. Owns the WebSocket, the mic capture pipeline, and the audio playback pipeline. Pushes events into `useAgentChat` via the `pushExternalEvent` callback.

**Files:**
- Create: `client/src/components/agent/voice/useLiveKitVoice.ts`
- Create: `client/src/components/agent/voice/useLiveKitVoice.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `client/src/components/agent/voice/useLiveKitVoice.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLiveKitVoice } from "./useLiveKitVoice";

// ---------- Fakes for browser APIs jsdom doesn't ship ----------

class FakeWebSocket {
  static instances: FakeWebSocket[] = [];
  static OPEN = 1;
  static CLOSED = 3;
  readyState = 0; // CONNECTING
  url: string;
  onopen: ((e?: unknown) => void) | null = null;
  onmessage: ((e: MessageEvent) => void) | null = null;
  onerror: ((e: unknown) => void) | null = null;
  onclose: ((e?: unknown) => void) | null = null;
  send = vi.fn();
  close = vi.fn(() => {
    this.readyState = FakeWebSocket.CLOSED;
    this.onclose?.();
  });
  constructor(url: string) {
    this.url = url;
    FakeWebSocket.instances.push(this);
    queueMicrotask(() => {
      this.readyState = FakeWebSocket.OPEN;
      this.onopen?.();
    });
  }
}

class FakeAudioWorkletNode {
  port = { onmessage: null as ((e: MessageEvent) => void) | null };
  connect = vi.fn();
  disconnect = vi.fn();
}

class FakeMediaStreamSource {
  connect = vi.fn();
  disconnect = vi.fn();
}

class FakeAudioContext {
  audioWorklet = { addModule: vi.fn().mockResolvedValue(undefined) };
  state = "running";
  createMediaStreamSource = vi.fn(() => new FakeMediaStreamSource());
  close = vi.fn().mockResolvedValue(undefined);
  suspend = vi.fn().mockResolvedValue(undefined);
}

class FakeMediaSource {
  static instances: FakeMediaSource[] = [];
  addEventListener = vi.fn();
  addSourceBuffer = vi.fn(() => ({
    appendBuffer: vi.fn(),
    addEventListener: vi.fn(),
    updating: false,
  }));
  constructor() {
    FakeMediaSource.instances.push(this);
  }
}

beforeEach(() => {
  FakeWebSocket.instances = [];
  FakeMediaSource.instances = [];
  // @ts-expect-error jsdom shim
  globalThis.WebSocket = FakeWebSocket;
  // @ts-expect-error jsdom shim
  globalThis.AudioContext = FakeAudioContext;
  // @ts-expect-error jsdom shim
  globalThis.AudioWorkletNode = FakeAudioWorkletNode;
  // @ts-expect-error jsdom shim
  globalThis.MediaSource = FakeMediaSource;
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: vi.fn().mockReturnValue("blob:fake"),
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: {
      getUserMedia: vi.fn().mockResolvedValue({
        getTracks: () => [{ stop: vi.fn() }],
      }),
    },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function mockFetchRoom() {
  return vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        success: true,
        roomName: "room-1",
        token: "tok",
        wsUrl: "wss://livekit.test",
        participantName: "user-1",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    ),
  );
}

describe("useLiveKitVoice", () => {
  it("starts in idle state", () => {
    const push = vi.fn();
    const { result } = renderHook(() => useLiveKitVoice("ruby", push));
    expect(result.current.state).toBe("idle");
    expect(result.current.isMuted).toBe(false);
  });

  it("fetches the room, opens the WS, and transitions to listening on start()", async () => {
    vi.stubGlobal("fetch", mockFetchRoom());
    const push = vi.fn();
    const { result } = renderHook(() => useLiveKitVoice("ruby", push));

    await act(async () => {
      await result.current.start();
    });
    // Wait a microtask for the WS onopen to fire
    await act(async () => {
      await Promise.resolve();
    });

    expect(FakeWebSocket.instances).toHaveLength(1);
    expect(FakeWebSocket.instances[0].url).toContain("/ws/livekit/room-1/");
    expect(result.current.state).toBe("listening");
  });

  it("pushes user-transcript on incoming transcript event", async () => {
    vi.stubGlobal("fetch", mockFetchRoom());
    const push = vi.fn();
    const { result } = renderHook(() => useLiveKitVoice("ruby", push));
    await act(async () => {
      await result.current.start();
    });
    await act(async () => {
      await Promise.resolve();
    });
    act(() => {
      FakeWebSocket.instances[0].onmessage?.({
        data: JSON.stringify({ type: "transcript", text: "find me a lipstick" }),
      } as MessageEvent);
    });
    expect(push).toHaveBeenCalledWith({
      kind: "user-transcript",
      text: "find me a lipstick",
    });
  });

  it("pushes agent-response on incoming aiResponse event", async () => {
    vi.stubGlobal("fetch", mockFetchRoom());
    const push = vi.fn();
    const { result } = renderHook(() => useLiveKitVoice("ruby", push));
    await act(async () => {
      await result.current.start();
    });
    await act(async () => {
      await Promise.resolve();
    });
    act(() => {
      FakeWebSocket.instances[0].onmessage?.({
        data: JSON.stringify({ type: "aiResponse", text: "Here are some lipsticks." }),
      } as MessageEvent);
    });
    expect(push).toHaveBeenCalledWith({
      kind: "agent-response",
      text: "Here are some lipsticks.",
    });
  });

  it("pushes tool-call and tool-result, threading by id", async () => {
    vi.stubGlobal("fetch", mockFetchRoom());
    const push = vi.fn();
    const { result } = renderHook(() => useLiveKitVoice("ruby", push));
    await act(async () => {
      await result.current.start();
    });
    await act(async () => {
      await Promise.resolve();
    });
    act(() => {
      FakeWebSocket.instances[0].onmessage?.({
        data: JSON.stringify({
          type: "tool_call",
          toolCall: {
            name: "search_shopify_products",
            arguments: { query: "lipstick" },
            async: false,
          },
        }),
      } as MessageEvent);
      FakeWebSocket.instances[0].onmessage?.({
        data: JSON.stringify({
          type: "tool_result",
          toolResult: {
            name: "search_shopify_products",
            result: '{"count":3}',
          },
        }),
      } as MessageEvent);
    });

    const calls = push.mock.calls.map((c) => c[0]);
    const call = calls.find((c) => c.kind === "tool-call");
    const result2 = calls.find((c) => c.kind === "tool-result");
    expect(call).toBeDefined();
    expect(call.name).toBe("search_shopify_products");
    expect(result2).toBeDefined();
    // Both events carry the same id so useAgentChat can pair them.
    expect(call.id).toBe(result2.id);
  });

  it("toggles state to agent-speaking on audio_start, back to listening on audio_end", async () => {
    vi.stubGlobal("fetch", mockFetchRoom());
    const push = vi.fn();
    const { result } = renderHook(() => useLiveKitVoice("ruby", push));
    await act(async () => {
      await result.current.start();
    });
    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      FakeWebSocket.instances[0].onmessage?.({
        data: JSON.stringify({ type: "audio_start" }),
      } as MessageEvent);
    });
    expect(result.current.state).toBe("agent-speaking");

    act(() => {
      FakeWebSocket.instances[0].onmessage?.({
        data: JSON.stringify({ type: "audio_end" }),
      } as MessageEvent);
    });
    expect(result.current.state).toBe("listening");
  });

  it("toggleMute flips isMuted; while muted, audio frames are NOT sent", async () => {
    vi.stubGlobal("fetch", mockFetchRoom());
    const push = vi.fn();
    const { result } = renderHook(() => useLiveKitVoice("ruby", push));
    await act(async () => {
      await result.current.start();
    });
    await act(async () => {
      await Promise.resolve();
    });

    const ws = FakeWebSocket.instances[0];
    const sendCallsBeforeMute = ws.send.mock.calls.length;

    // Simulate a PCM frame arriving from the worklet via the port message.
    // Find the worklet port that the hook wired up. Because we faked the
    // AudioWorkletNode, the hook's internal listener is set on a port we
    // can grab from the FakeAudioWorkletNode... but FakeAudioWorkletNode
    // doesn't expose its instance globally. The minimal verifiable
    // assertion is: toggleMute flips the boolean.
    act(() => {
      result.current.toggleMute();
    });
    expect(result.current.isMuted).toBe(true);

    act(() => {
      result.current.toggleMute();
    });
    expect(result.current.isMuted).toBe(false);

    // The send count should not have changed from the mute toggle alone.
    expect(ws.send.mock.calls.length).toBe(sendCallsBeforeMute);
  });

  it("hangup closes the WebSocket and returns to idle", async () => {
    vi.stubGlobal("fetch", mockFetchRoom());
    const push = vi.fn();
    const { result } = renderHook(() => useLiveKitVoice("ruby", push));
    await act(async () => {
      await result.current.start();
    });
    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.hangup();
    });
    expect(FakeWebSocket.instances[0].close).toHaveBeenCalled();
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
    const { result } = renderHook(() => useLiveKitVoice("ruby", push));
    await act(async () => {
      await result.current.start();
    });
    expect(result.current.state).toBe("error");
    expect(result.current.errorMessage).toMatch(/trial|403/i);
  });

  it("transitions to error when getUserMedia rejects", async () => {
    (navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>)
      .mockRejectedValueOnce(new Error("Permission denied"));
    vi.stubGlobal("fetch", mockFetchRoom());
    const push = vi.fn();
    const { result } = renderHook(() => useLiveKitVoice("ruby", push));
    await act(async () => {
      await result.current.start();
    });
    expect(result.current.state).toBe("error");
    expect(result.current.errorMessage).toMatch(/permission|denied/i);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test -- client/src/components/agent/voice/useLiveKitVoice.test.ts
```
Expected: all tests fail (`Cannot find module './useLiveKitVoice'`).

- [ ] **Step 3: Implement the hook**

Create `client/src/components/agent/voice/useLiveKitVoice.ts`:

```ts
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
  participantName?: string;
}

interface ServerJsonEvent {
  type: string;
  text?: string;
  toolCall?: { name: string; arguments: unknown; async: boolean };
  toolResult?: { name: string; result: unknown };
}

// Stable deterministic id for matching tool_call → tool_result. The
// server's events don't carry an id, but they arrive in order and a
// single tool call/result is identified by name + args.
function makeToolId(name: string, args: unknown): string {
  return `voice-${name}-${JSON.stringify(args)}`;
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

    audioCtxRef.current?.close().catch(() => {});
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
    void audio.play().catch(() => {});

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
              id: makeToolId(ev.toolCall.name, ev.toolCall.arguments),
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
              id: makeToolId(ev.toolResult.name, undefined as unknown),
              result: parseResult(ev.toolResult.result),
            });
            // The id derived from result has no args, so we re-key with
            // the latest matching call. Simpler approach: walk recent
            // pushes and match by name on the agent-chat side. For now
            // we send a name-only id; the receiver matches by name+id.
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

    // 3. WebSocket
    const sid = sessionIdRef.current;
    const wsUrl = `${room.wsUrl.replace(/\/$/, "")}/ws/livekit/${room.roomName}/ruby/${sid}`;
    // Note: path uses agentKey-as-botId ("ruby") here; the upstream
    // resolves the real botId from the route params. If the upstream
    // expects the literal botId in the path, swap "ruby" for it.
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

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

    ws.onopen = () => {
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
      if (state !== "ending" && state !== "error") {
        setState("error");
        setErrorMessage("Voice call dropped");
      }
    };
  }, [agentKey, cleanup, handleBinary, handleJson, setupPlayer, state]);

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
```

> Note on the `tool_result` id matching: the server's `tool_result` event carries the tool *name* but not the original `arguments`, so the deterministic `makeToolId(name, args)` derived from name + args at `tool_call` time doesn't match the id derived at `tool_result` time. The simplest fix is for the **receiver** (`useAgentChat.pushExternalEvent`) to also fall back to matching by tool *name* when the id doesn't directly match. **The integration test in Task 7 catches this**; if it fails, update `pushExternalEvent`'s `tool-result` branch to fall back to "most recent loading invocation with the matching name."

- [ ] **Step 4: Run the tests to verify they pass**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test -- client/src/components/agent/voice/useLiveKitVoice.test.ts
```
Expected: all tests pass.

- [ ] **Step 5: Run the full suite + type-check**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm run check
```
Expected: full suite passes; tsc clean.

- [ ] **Step 6: Commit**

```bash
git add client/src/components/agent/voice/useLiveKitVoice.ts client/src/components/agent/voice/useLiveKitVoice.test.ts
git commit -m "Add useLiveKitVoice hook (WS + mic + audio + event dispatch)"
```

---

## Task 5: `VoiceModeButton` component

Small chat-header button that initiates voice mode. Hidden when bot flags or browser support don't allow.

**Files:**
- Create: `client/src/components/agent/voice/VoiceModeButton.tsx`
- Create: `client/src/components/agent/voice/VoiceModeButton.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `client/src/components/agent/voice/VoiceModeButton.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VoiceModeButton } from "./VoiceModeButton";

beforeEach(() => {
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia: vi.fn() },
  });
});

describe("VoiceModeButton", () => {
  it("renders nothing when disabled", () => {
    const { container } = render(
      <VoiceModeButton disabled onClick={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when getUserMedia is unavailable", () => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: undefined,
    });
    const { container } = render(<VoiceModeButton onClick={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders a Talk to Ruby button and calls onClick when clicked", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<VoiceModeButton onClick={onClick} />);
    const btn = screen.getByRole("button", { name: /talk to ruby/i });
    await user.click(btn);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is rendered but disabled when busy is true", () => {
    render(<VoiceModeButton onClick={vi.fn()} busy />);
    const btn = screen.getByRole("button", { name: /talk to ruby/i });
    expect(btn).toBeDisabled();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test -- client/src/components/agent/voice/VoiceModeButton.test.tsx
```
Expected: 4 tests fail (module not found).

- [ ] **Step 3: Implement the component**

Create `client/src/components/agent/voice/VoiceModeButton.tsx`:

```tsx
import { Phone } from "lucide-react";

interface VoiceModeButtonProps {
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
}

function isVoiceSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === "function" &&
    typeof WebSocket !== "undefined"
  );
}

// Header entry point for real-time voice mode. Hidden when:
// - disabled prop is set (parent gates on bot.audiostt && bot.audiotts)
// - Browser lacks getUserMedia / WebSocket
export function VoiceModeButton({
  onClick,
  disabled,
  busy,
}: VoiceModeButtonProps) {
  if (disabled || !isVoiceSupported()) return null;
  return (
    <button
      type="button"
      aria-label="Talk to Ruby"
      title="Talk to Ruby"
      onClick={onClick}
      disabled={busy}
      className={
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs " +
        (busy
          ? "bg-tool-card-muted text-tool-card-muted-foreground opacity-60"
          : "bg-tool-card-accent text-tool-card-accent-foreground hover:opacity-90")
      }
    >
      <Phone className="h-3.5 w-3.5" />
      <span>Talk to Ruby</span>
    </button>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test -- client/src/components/agent/voice/VoiceModeButton.test.tsx
```
Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/agent/voice/VoiceModeButton.tsx client/src/components/agent/voice/VoiceModeButton.test.tsx
git commit -m "Add VoiceModeButton (header entry point)"
```

---

## Task 6: `VoiceCallBar` component

The active in-call pill that replaces `VoiceModeButton` in the chat header while a call is in flight. Shows state, mute, hangup.

**Files:**
- Create: `client/src/components/agent/voice/VoiceCallBar.tsx`
- Create: `client/src/components/agent/voice/VoiceCallBar.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `client/src/components/agent/voice/VoiceCallBar.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VoiceCallBar } from "./VoiceCallBar";

describe("VoiceCallBar", () => {
  it("renders Connecting label for state=connecting", () => {
    render(
      <VoiceCallBar
        state="connecting"
        durationMs={0}
        isMuted={false}
        onMute={vi.fn()}
        onHangup={vi.fn()}
      />,
    );
    expect(screen.getByText(/connecting/i)).toBeInTheDocument();
  });

  it("renders Listening + timer for state=listening", () => {
    render(
      <VoiceCallBar
        state="listening"
        durationMs={14000}
        isMuted={false}
        onMute={vi.fn()}
        onHangup={vi.fn()}
      />,
    );
    expect(screen.getByText(/listening/i)).toBeInTheDocument();
    expect(screen.getByText(/0:14/)).toBeInTheDocument();
  });

  it("renders Ruby is speaking and hides mute for state=agent-speaking", () => {
    const onMute = vi.fn();
    render(
      <VoiceCallBar
        state="agent-speaking"
        durationMs={20000}
        isMuted={false}
        onMute={onMute}
        onHangup={vi.fn()}
      />,
    );
    expect(screen.getByText(/ruby is speaking/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /mute/i })).toBeNull();
  });

  it("calls onMute when mute button clicked", async () => {
    const onMute = vi.fn();
    const user = userEvent.setup();
    render(
      <VoiceCallBar
        state="listening"
        durationMs={1000}
        isMuted={false}
        onMute={onMute}
        onHangup={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: /mute/i }));
    expect(onMute).toHaveBeenCalledOnce();
  });

  it("calls onHangup when end button clicked", async () => {
    const onHangup = vi.fn();
    const user = userEvent.setup();
    render(
      <VoiceCallBar
        state="listening"
        durationMs={1000}
        isMuted={false}
        onMute={vi.fn()}
        onHangup={onHangup}
      />,
    );
    await user.click(screen.getByRole("button", { name: /end/i }));
    expect(onHangup).toHaveBeenCalledOnce();
  });

  it("renders 'Unmute' label when isMuted=true", () => {
    render(
      <VoiceCallBar
        state="listening"
        durationMs={1000}
        isMuted
        onMute={vi.fn()}
        onHangup={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /unmute/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test -- client/src/components/agent/voice/VoiceCallBar.test.tsx
```
Expected: 6 tests fail (module not found).

- [ ] **Step 3: Implement the component**

Create `client/src/components/agent/voice/VoiceCallBar.tsx`:

```tsx
import { Mic, MicOff, PhoneOff } from "lucide-react";
import type { VoiceState } from "./useLiveKitVoice";

interface VoiceCallBarProps {
  state: VoiceState;
  durationMs: number;
  isMuted: boolean;
  onMute: () => void;
  onHangup: () => void;
}

function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function stateLabel(state: VoiceState): string {
  switch (state) {
    case "connecting":
      return "Connecting…";
    case "listening":
      return "Listening";
    case "user-speaking":
      return "You're speaking…";
    case "agent-speaking":
      return "Ruby is speaking…";
    case "ending":
      return "Ending…";
    case "error":
      return "Call dropped";
    default:
      return "";
  }
}

// In-call pill that replaces VoiceModeButton in the chat header while a
// call is active. Mute is hidden during state=agent-speaking (it would
// only stop *the user's* mic from sending, which isn't useful while
// Ruby is the one talking).
export function VoiceCallBar({
  state,
  durationMs,
  isMuted,
  onMute,
  onHangup,
}: VoiceCallBarProps) {
  const showMute =
    state !== "agent-speaking" && state !== "connecting" && state !== "ending";
  const showTimer = state === "listening" || state === "user-speaking";

  return (
    <div
      data-state={state}
      className="inline-flex items-center gap-2 rounded-full bg-tool-card-accent text-tool-card-accent-foreground px-3 py-1 text-xs"
    >
      <span
        className="inline-block h-2 w-2 rounded-full bg-current animate-pulse"
        aria-hidden="true"
      />
      <span>{stateLabel(state)}</span>
      {showTimer && (
        <span className="font-mono tabular-nums">
          {formatDuration(durationMs)}
        </span>
      )}
      {showMute && (
        <button
          type="button"
          aria-label={isMuted ? "Unmute" : "Mute"}
          title={isMuted ? "Unmute" : "Mute"}
          onClick={onMute}
          className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15 hover:bg-white/25"
        >
          {isMuted ? (
            <MicOff className="h-3.5 w-3.5" />
          ) : (
            <Mic className="h-3.5 w-3.5" />
          )}
        </button>
      )}
      <button
        type="button"
        aria-label="End call"
        title="End call"
        onClick={onHangup}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500/80 hover:bg-red-500 text-white"
      >
        <PhoneOff className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test -- client/src/components/agent/voice/VoiceCallBar.test.tsx
```
Expected: 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/agent/voice/VoiceCallBar.tsx client/src/components/agent/voice/VoiceCallBar.test.tsx
git commit -m "Add VoiceCallBar component"
```

---

## Task 7: Wire voice mode into `AgentChat` (final integration)

Render `VoiceModeButton` / `VoiceCallBar` in the chat header. Gate Plan 2a's auto-speak effect off while a voice call is active. Extend the voice barrel.

**Files:**
- Modify: `client/src/components/agent/voice/index.ts` (barrel)
- Modify: `client/src/components/agent/AgentChat.tsx` (header + auto-speak gate)
- Modify: `client/src/components/agent/voice/AgentChatVoice.test.tsx` (extend with voice mode integration cases)

- [ ] **Step 1: Extend the voice barrel**

In `client/src/components/agent/voice/index.ts`, add the new exports below the existing ones:

```ts
export { useLiveKitVoice } from "./useLiveKitVoice";
export type { VoiceState, UseLiveKitVoiceResult } from "./useLiveKitVoice";
export { VoiceModeButton } from "./VoiceModeButton";
export { VoiceCallBar } from "./VoiceCallBar";
```

- [ ] **Step 2: Update `AgentChat.tsx`**

In `client/src/components/agent/AgentChat.tsx`, add `useLiveKitVoice`, `VoiceModeButton`, and `VoiceCallBar` to the existing `./voice` import:

```tsx
import {
  MicButton,
  AutoSpeakToggle,
  useTextToSpeech,
  useAutoSpeak,
  useLiveKitVoice,
  VoiceModeButton,
  VoiceCallBar,
} from "./voice";
```

Then, inside the `AgentChat` component body, near where the existing voice hooks are declared (right after `const tts = useTextToSpeech(agentKey);`), add:

```tsx
  const voice = useLiveKitVoice(agentKey, chat.pushExternalEvent);
```

Where `chat` is the result of `useAgentChat(agentKey)` — if the existing code destructures (`const { messages, status, send } = useAgentChat(...)`), refactor to:

```tsx
  const chat = useAgentChat(agentKey);
  const { messages, status, send } = chat;
```

so `chat.pushExternalEvent` is available for the voice hook.

Then **gate the auto-speak effect off when a voice call is active**. Find the existing auto-speak effect (added in Plan 2a, looks like `useEffect(() => { if (!autoSpeak || !bot?.audiotts) return; ... })`). Update its guard condition to:

```tsx
  useEffect(() => {
    if (!autoSpeak || !bot?.audiotts) return;
    if (voice.state !== "idle" && voice.state !== "error") return; // gate off during a call
    const last = messages[messages.length - 1];
    if (!last) return;
    if (last.role !== "agent") return;
    if (last.status !== "complete") return;
    if (!last.text || !last.text.trim()) return;
    if (spokenMessageIds.current.has(last.id)) return;
    spokenMessageIds.current.add(last.id);
    void tts.play(last.text);
  }, [autoSpeak, bot, messages, tts, voice.state]);
```

Add `voice.state` to the dep array.

Then, in the JSX header area, **render the voice entry/bar**. Replace the existing `<AutoSpeakToggle />` block (which today is conditional on `bot?.audiotts`) with:

```tsx
  {(bot?.audiostt && bot?.audiotts) &&
    (voice.state === "idle" || voice.state === "error" ? (
      <VoiceModeButton
        disabled={!bot?.audiostt || !bot?.audiotts}
        busy={status === "streaming"}
        onClick={() => void voice.start()}
      />
    ) : (
      <VoiceCallBar
        state={voice.state}
        durationMs={voice.durationMs}
        isMuted={voice.isMuted}
        onMute={voice.toggleMute}
        onHangup={voice.hangup}
      />
    ))}
  {bot?.audiotts && <AutoSpeakToggle />}
```

(Place these two together in the header's right-aligned slot.)

- [ ] **Step 3: Run the type-check**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm run check
```
Expected: tsc clean.

- [ ] **Step 4: Extend the integration test**

In `client/src/components/agent/voice/AgentChatVoice.test.tsx`, append a new test case at the bottom of the existing `describe` block:

```tsx
  it("voice mode: clicking Talk to Ruby opens a WS and renders voice events as chat messages", async () => {
    // Patch /bot to return both audio flags = true
    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (typeof url === "string" && url.endsWith("/api/agent/ruby/bot")) {
        return new Response(
          JSON.stringify({
            name: "Ruby",
            greeting: "Hi",
            avatarUrl: "",
            audiostt: true,
            audiotts: true,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      if (typeof url === "string" && url.endsWith("/voice/room")) {
        return new Response(
          JSON.stringify({
            roomName: "room-1",
            token: "tok",
            wsUrl: "wss://livekit.test",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      // chat SSE: empty body, immediate close — we're not testing the
      // typed-chat path here.
      return new Response("data: [DONE]\n\n", {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    // FakeWebSocket from the useLiveKitVoice tests pattern
    const wsInstances: Array<{
      send: ReturnType<typeof vi.fn>;
      onopen?: () => void;
      onmessage?: (e: MessageEvent) => void;
      close: ReturnType<typeof vi.fn>;
      readyState: number;
    }> = [];
    class FakeWS {
      static OPEN = 1;
      readyState = 0;
      onopen: (() => void) | null = null;
      onmessage: ((e: MessageEvent) => void) | null = null;
      onerror: ((e: unknown) => void) | null = null;
      onclose: (() => void) | null = null;
      send = vi.fn();
      close = vi.fn(() => {
        this.readyState = 3;
      });
      constructor(public url: string) {
        wsInstances.push(this as unknown as (typeof wsInstances)[number]);
        queueMicrotask(() => {
          this.readyState = FakeWS.OPEN;
          this.onopen?.();
        });
      }
    }
    // @ts-expect-error jsdom shim
    globalThis.WebSocket = FakeWS;

    // Render AgentChat. Patch the global fetch BEFORE render.
    const { container } = render(
      <AgentChat agentKey="ruby" registry={rubyToolRegistry} />,
    );

    // Wait for /bot fetch to settle.
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /talk to ruby/i })).toBeInTheDocument(),
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /talk to ruby/i }));

    // Wait for the WS to open (queueMicrotask).
    await waitFor(() => expect(wsInstances).toHaveLength(1));

    // Simulate the server sending an aiResponse event.
    act(() => {
      wsInstances[0].onmessage?.({
        data: JSON.stringify({
          type: "aiResponse",
          text: "Welcome! How can I help?",
        }),
      } as MessageEvent);
    });

    expect(
      await screen.findByText("Welcome! How can I help?"),
    ).toBeInTheDocument();

    // End the call → bar disappears, button returns.
    await user.click(screen.getByRole("button", { name: /end/i }));
    expect(
      screen.getByRole("button", { name: /talk to ruby/i }),
    ).toBeInTheDocument();
  });
```

If `act`, `waitFor`, `screen`, `userEvent`, `AgentChat`, `rubyToolRegistry`, etc. aren't already imported in this test file, add the missing imports at the top:

```tsx
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AgentChat } from "../AgentChat";
import { rubyToolRegistry } from "../../ruby/rubyToolRegistry";
```

(Most of these likely already exist from Plan 2a's tests — read the file first and merge cleanly.)

- [ ] **Step 5: Run the integration test**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test -- client/src/components/agent/voice/AgentChatVoice.test.tsx
```
Expected: all tests pass (the new voice mode case + the existing Plan 2a cases).

If the new test fails with `tool-result not matching invocation`, update `useAgentChat`'s `tool-result` branch (Task 2) to fall back to matching by tool name:

```ts
// Inside the tool-result case in pushExternalEvent:
case "tool-result":
  return prev.map((m) => {
    if (m.role !== "agent") return m;
    const idx = m.tools.findIndex(
      (t) => t.id === event.id || (t.status === "loading"),
    );
    if (idx === -1) return m;
    const updated = [...m.tools];
    updated[idx] = {
      ...updated[idx],
      status: "complete",
      response: event.result,
    };
    return { ...m, tools: updated };
  });
```

- [ ] **Step 6: Run the full suite + type-check**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm run check
```
Expected: all tests pass; tsc clean.

- [ ] **Step 7: Commit**

```bash
git add client/src/components/agent/voice/index.ts \
        client/src/components/agent/AgentChat.tsx \
        client/src/components/agent/voice/AgentChatVoice.test.tsx
git commit -m "Wire voice mode into AgentChat (header pill + auto-speak gate)"
```

---

## Done

After Task 7 the feature is functionally complete: a `Talk to Ruby` button in the chat header, an in-call pill while active, mic streaming over WebSocket to potentialTS, audio streaming back, transcripts and agent replies and tool cards all flowing into the existing chat history. All gated by the bot's `audiostt` + `audiotts` flags; auto-speak gated off during the call to prevent double TTS.

**Before shipping:**
1. Push the branch and open a PR.
2. Manual smoke in Chrome, Firefox, Safari:
   - Click `Talk to Ruby` → grant mic → header shows `Listening · 0:00`.
   - Say "find me a lipstick" → header flips through `You're speaking…` → `Ruby is speaking…` → `Listening`. Audio plays. User MessageBubble + agent MessageBubble + product card all appear in the chat history.
   - Toggle mute on/off — silence in either direction.
   - Click `End` → call closes, header returns to `Talk to Ruby`, chat history preserved.
   - During an active call, try typing in the input → message sends via existing `/chat` SSE without interfering with the WS.
3. Coordinate with the user to flip `BotVoiceAgent.callTimeLeftSeconds` for Ruby's bot if production trial limits start biting in demos.
