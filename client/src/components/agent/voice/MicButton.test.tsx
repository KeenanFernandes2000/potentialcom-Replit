import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MicButton } from "./MicButton";

// Reuse the FakeMediaRecorder / getUserMedia shims from useVoiceRecorder.test.ts.
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

beforeEach(() => {
  // @ts-expect-error jsdom shim
  globalThis.MediaRecorder = FakeMediaRecorder;
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

describe("MicButton", () => {
  it("renders nothing when disabled", () => {
    const { container } = render(
      <MicButton agentKey="ruby" onTranscript={vi.fn()} disabled />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when getUserMedia is unavailable", () => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: undefined,
    });
    const { container } = render(
      <MicButton agentKey="ruby" onTranscript={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("starts recording on click and stops + uploads + emits transcript on second click", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ success: true, text: "find me a lipstick" }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const onTranscript = vi.fn();
    const user = userEvent.setup();

    render(<MicButton agentKey="ruby" onTranscript={onTranscript} />);
    const btn = screen.getByRole("button", { name: /record/i });
    await user.click(btn);
    // While recording, the accessible label flips to "Stop recording"
    expect(screen.getByRole("button", { name: /stop/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /stop/i }));

    // Wait a tick for the async upload to resolve.
    await new Promise((r) => setTimeout(r, 0));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/agent/ruby/transcribe",
      expect.objectContaining({ method: "POST" }),
    );
    expect(onTranscript).toHaveBeenCalledWith("find me a lipstick");
  });

  it("does not emit transcript when text is empty", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ success: true, text: "" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    const onTranscript = vi.fn();
    const user = userEvent.setup();

    render(<MicButton agentKey="ruby" onTranscript={onTranscript} />);
    await user.click(screen.getByRole("button", { name: /record/i }));
    await user.click(screen.getByRole("button", { name: /stop/i }));
    await new Promise((r) => setTimeout(r, 0));

    expect(onTranscript).not.toHaveBeenCalled();
  });
});
