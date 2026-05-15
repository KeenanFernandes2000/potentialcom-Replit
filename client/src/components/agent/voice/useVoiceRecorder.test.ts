import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useVoiceRecorder } from "./useVoiceRecorder";

// jsdom doesn't ship MediaRecorder or getUserMedia — install minimal mocks.
class FakeMediaRecorder {
  static instances: FakeMediaRecorder[] = [];
  static isTypeSupported = vi.fn().mockReturnValue(true);
  state: "inactive" | "recording" | "paused" = "inactive";
  ondataavailable: ((e: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: ((e: unknown) => void) | null = null;
  constructor(public stream: unknown, public options?: unknown) {
    FakeMediaRecorder.instances.push(this);
  }
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

const fakeStream = {
  getTracks: () => [{ stop: vi.fn() }],
};

beforeEach(() => {
  FakeMediaRecorder.instances = [];
  // @ts-expect-error jsdom shim
  globalThis.MediaRecorder = FakeMediaRecorder;
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia: vi.fn().mockResolvedValue(fakeStream) },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useVoiceRecorder", () => {
  it("starts in idle state", () => {
    const { result } = renderHook(() => useVoiceRecorder());
    expect(result.current.state).toBe("idle");
    expect(result.current.errorMessage).toBeNull();
  });

  it("transitions to recording on start()", async () => {
    const { result } = renderHook(() => useVoiceRecorder());
    await act(async () => {
      await result.current.start();
    });
    expect(result.current.state).toBe("recording");
    expect(result.current.errorMessage).toBeNull();
  });

  it("returns the audio blob on stop()", async () => {
    const { result } = renderHook(() => useVoiceRecorder());
    await act(async () => {
      await result.current.start();
    });
    let blob: Blob | null = null;
    await act(async () => {
      blob = await result.current.stop();
    });
    expect(blob).toBeInstanceOf(Blob);
    expect(result.current.state).toBe("idle");
  });

  it("sets error state when getUserMedia rejects", async () => {
    (navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>)
      .mockRejectedValueOnce(new Error("Permission denied"));
    const { result } = renderHook(() => useVoiceRecorder());
    await act(async () => {
      await result.current.start();
    });
    expect(result.current.state).toBe("error");
    expect(result.current.errorMessage).toMatch(/permission|denied/i);
  });

  it("stops media stream tracks on stop()", async () => {
    const stopSpy = vi.fn();
    (navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mockResolvedValue({
      getTracks: () => [{ stop: stopSpy }],
    });
    const { result } = renderHook(() => useVoiceRecorder());
    await act(async () => {
      await result.current.start();
    });
    await act(async () => {
      await result.current.stop();
    });
    expect(stopSpy).toHaveBeenCalled();
  });

  it("ticks durationMs while recording", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useVoiceRecorder());
    await act(async () => {
      await result.current.start();
    });
    expect(result.current.durationMs).toBe(0);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.durationMs).toBeGreaterThanOrEqual(500);
    vi.useRealTimers();
  });
});
