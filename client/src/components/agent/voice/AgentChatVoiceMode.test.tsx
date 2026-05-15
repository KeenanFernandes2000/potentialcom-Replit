import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AgentChat } from "../AgentChat";
import { rubyToolRegistry } from "../../ruby/rubyToolRegistry";

// FakeWebSocket — same shape as useLiveKitVoice.test.ts. Captures
// instances so the test can drive incoming messages.
class FakeWebSocket {
  static instances: FakeWebSocket[] = [];
  static OPEN = 1;
  static CLOSED = 3;
  readyState = 0;
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
  addEventListener = vi.fn();
  addSourceBuffer = vi.fn(() => ({
    appendBuffer: vi.fn(),
    addEventListener: vi.fn(),
    updating: false,
  }));
}

beforeEach(() => {
  FakeWebSocket.instances = [];
  if (!Element.prototype.scrollTo) {
    Element.prototype.scrollTo = vi.fn() as unknown as typeof Element.prototype.scrollTo;
  } else {
    vi.spyOn(Element.prototype, "scrollTo").mockImplementation(() => {});
  }
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

describe("AgentChat voice mode integration", () => {
  it("clicking Talk to Ruby opens a WS and renders voice events as chat messages", async () => {
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
      // The typed-chat SSE path isn't exercised here; return an empty
      // stream-shaped body so any incidental call settles cleanly.
      return new Response("data: [DONE]\n\n", {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<AgentChat agentKey="ruby" registry={rubyToolRegistry} />);

    // Bot config loads → Talk to Ruby button mounts.
    const talkBtn = await screen.findByRole("button", {
      name: /talk to ruby/i,
    });
    await user.click(talkBtn);

    // WebSocket constructed once the room mints.
    await waitFor(() => expect(FakeWebSocket.instances).toHaveLength(1));

    // Drive an aiResponse event and assert the chat renders it.
    act(() => {
      FakeWebSocket.instances[0].onmessage?.({
        data: JSON.stringify({
          type: "aiResponse",
          text: "Welcome! How can I help?",
        }),
      } as MessageEvent);
    });

    expect(
      await screen.findByText("Welcome! How can I help?"),
    ).toBeInTheDocument();

    // Hang up → call bar goes away, Talk to Ruby button returns.
    await user.click(screen.getByRole("button", { name: /end call/i }));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /talk to ruby/i }),
      ).toBeInTheDocument(),
    );
  });
});
