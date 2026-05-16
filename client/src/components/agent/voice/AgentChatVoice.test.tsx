import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AgentChat } from "../AgentChat";

// Mock useAgentChat so we control the message list directly. The SSE
// path is exercised by useAgentChat's own tests — here we only care
// about the wiring between AgentChat, MicButton, AutoSpeakToggle, and
// the shared tts instance.
const sendMock = vi.fn();
let mockMessages: import("@shared/agent").AgentMessage[] = [];

vi.mock("../useAgentChat", () => ({
  useAgentChat: () => ({
    messages: mockMessages,
    status: "idle" as const,
    send: sendMock,
  }),
}));

// FakeMediaRecorder + getUserMedia shim mirrors useVoiceRecorder.test.ts
// so the mic button is actually mountable and can transition from
// idle → recording → idle.
class FakeMediaRecorder {
  static isTypeSupported = vi.fn().mockReturnValue(true);
  state: "inactive" | "recording" = "inactive";
  ondataavailable: ((e: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: ((e: unknown) => void) | null = null;
  constructor() {}
  start() {
    this.state = "recording";
  }
  stop() {
    this.state = "inactive";
    queueMicrotask(() => {
      this.ondataavailable?.({ data: new Blob(["audio"], { type: "audio/webm" }) });
      this.onstop?.();
    });
  }
}

// FakeAudio shim so useTextToSpeech can construct an audio element.
class FakeAudio {
  src = "";
  paused = true;
  onended: (() => void) | null = null;
  onerror: ((e: unknown) => void) | null = null;
  play = vi.fn().mockImplementation(async () => {
    this.paused = false;
  });
  pause = vi.fn().mockImplementation(() => {
    this.paused = true;
  });
  constructor() {}
}

// Build a fetch mock that routes by URL. Each route is a function so we
// can vary responses per test (e.g., flip /transcribe between success
// and failure) without rebuilding the whole router.
type FetchRoute = (init?: RequestInit) => Response | Promise<Response>;
function buildFetchMock(routes: Record<string, FetchRoute>) {
  return vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
    for (const [pattern, handler] of Object.entries(routes)) {
      if (url.includes(pattern)) {
        return handler(init);
      }
    }
    throw new Error(`Unmocked fetch: ${url}`);
  });
}

beforeEach(() => {
  sendMock.mockReset();
  mockMessages = [];
  // jsdom doesn't implement Element.scrollTo; AgentChat calls it in an
  // effect after every message render.
  if (!Element.prototype.scrollTo) {
    Element.prototype.scrollTo = vi.fn() as unknown as typeof Element.prototype.scrollTo;
  } else {
    vi.spyOn(Element.prototype, "scrollTo").mockImplementation(() => {});
  }
  // @ts-expect-error jsdom shim
  globalThis.MediaRecorder = FakeMediaRecorder;
  // @ts-expect-error jsdom shim
  globalThis.Audio = FakeAudio;
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: {
      getUserMedia: vi.fn().mockResolvedValue({
        getTracks: () => [{ stop: vi.fn() }],
      }),
    },
  });
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: vi.fn().mockReturnValue("blob:fake-url"),
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: vi.fn(),
  });
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const botConfig = {
  name: "Ruby",
  greeting: "Hi!",
  avatarUrl: "/avatar.png",
  audiostt: true,
  audiotts: true,
};

describe("AgentChat voice wiring", () => {
  it("mic button records, posts to /transcribe, and fills the chat input with the transcript", async () => {
    const fetchMock = buildFetchMock({
      "/bot": () =>
        new Response(JSON.stringify(botConfig), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      "/transcribe": () =>
        new Response(
          JSON.stringify({ success: true, text: "find me a lipstick" }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<AgentChat agentKey="ruby" registry={{}} />);

    // Wait until the bot config is loaded (mic button is gated on audiostt).
    const micBtn = await screen.findByRole("button", {
      name: /record voice/i,
    });
    await user.click(micBtn);
    const stopBtn = await screen.findByRole("button", { name: /stop/i });
    await user.click(stopBtn);

    await waitFor(() => {
      const input = screen.getByPlaceholderText(
        /ask ruby/i,
      ) as HTMLInputElement;
      expect(input.value).toBe("find me a lipstick");
    });

    // Verify /transcribe was actually called (and not /speak — the auto-
    // speak path mustn't fire because messages is empty).
    const transcribeCalls = fetchMock.mock.calls.filter((c) =>
      String(c[0]).includes("/transcribe"),
    );
    expect(transcribeCalls).toHaveLength(1);
    const speakCalls = fetchMock.mock.calls.filter((c) =>
      String(c[0]).includes("/speak"),
    );
    expect(speakCalls).toHaveLength(0);
  });

  it("toggling auto-speak ON does not replay an existing completed agent message", async () => {
    // Seed one already-complete agent message so we can prove the
    // backlog isn't auto-spoken when the toggle flips.
    mockMessages = [
      {
        id: "msg-1",
        role: "agent",
        text: "welcome to ruby",
        tools: [],
        status: "complete",
      },
    ];

    const fetchMock = buildFetchMock({
      "/bot": () =>
        new Response(JSON.stringify(botConfig), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      "/speak": () =>
        new Response(new Uint8Array([1, 2, 3]), {
          status: 200,
          headers: { "Content-Type": "audio/mpeg" },
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<AgentChat agentKey="ruby" registry={{}} />);

    // Wait for bot config so the AutoSpeakToggle is mounted.
    const toggle = await screen.findByRole("switch", { name: /auto-speak/i });
    expect(toggle).toHaveAttribute("aria-checked", "false");

    // Before the toggle, /speak has not been called.
    expect(
      fetchMock.mock.calls.some((c) => String(c[0]).includes("/speak")),
    ).toBe(false);

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "true");

    // Give React a tick to flush both auto-speak effects.
    await new Promise((r) => setTimeout(r, 0));

    // The historical message must NOT have triggered /speak. If it had,
    // we'd see a POST to /api/agent/ruby/speak here.
    const speakCalls = fetchMock.mock.calls.filter((c) =>
      String(c[0]).includes("/speak"),
    );
    expect(speakCalls).toHaveLength(0);
  });

  it("dispatching a 'ruby:send' window event sends that prompt through the agent (hero try-this buttons)", async () => {
    const fetchMock = buildFetchMock({
      "/bot": () =>
        new Response(JSON.stringify(botConfig), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<AgentChat agentKey="ruby" registry={{}} />);
    // Wait for bot config so the event listener has been mounted (the
    // useEffect runs after first render and survives subsequent rerenders).
    await screen.findByPlaceholderText(/ask ruby/i);

    window.dispatchEvent(
      new CustomEvent("ruby:send", {
        detail: { prompt: "Show me lipsticks", agentKey: "ruby" },
      }),
    );
    await waitFor(() => {
      expect(sendMock).toHaveBeenCalledWith("Show me lipsticks");
    });
  });

  it("'ruby:send' events targeted at a different agentKey are ignored (no cross-agent crosstalk)", async () => {
    const fetchMock = buildFetchMock({
      "/bot": () =>
        new Response(JSON.stringify(botConfig), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<AgentChat agentKey="ruby" registry={{}} />);
    await screen.findByPlaceholderText(/ask ruby/i);

    window.dispatchEvent(
      new CustomEvent("ruby:send", {
        detail: { prompt: "ignored", agentKey: "different-agent" },
      }),
    );
    // Give React a tick — if the event were going to route through, it
    // would have done so by now.
    await new Promise((r) => setTimeout(r, 10));
    expect(sendMock).not.toHaveBeenCalled();
  });
});
