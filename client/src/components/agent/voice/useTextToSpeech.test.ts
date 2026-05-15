import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTextToSpeech } from "./useTextToSpeech";

const audioInstances: FakeAudio[] = [];

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
  constructor() {
    audioInstances.push(this);
  }
}

let createObjectURLSpy: ReturnType<typeof vi.fn>;
let revokeObjectURLSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  audioInstances.length = 0;
  // @ts-expect-error jsdom shim
  globalThis.Audio = FakeAudio;
  createObjectURLSpy = vi.fn().mockReturnValue("blob:fake-url");
  revokeObjectURLSpy = vi.fn();
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: createObjectURLSpy,
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: revokeObjectURLSpy,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function mockFetchAudio() {
  // Fresh Response per call — Response body can only be consumed once,
  // and tests that call play() twice would otherwise share a drained body.
  return vi.fn().mockImplementation(
    async () =>
      new Response(new Uint8Array([1, 2, 3]), {
        status: 200,
        headers: { "Content-Type": "audio/mpeg" },
      }),
  );
}

describe("useTextToSpeech", () => {
  it("starts in idle state", () => {
    const { result } = renderHook(() => useTextToSpeech("ruby"));
    expect(result.current.state).toBe("idle");
  });

  it("POSTs the text to /api/agent/<agentKey>/speak and plays the audio", async () => {
    const fetchMock = mockFetchAudio();
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useTextToSpeech("ruby"));
    await act(async () => {
      await result.current.play("hello");
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/agent/ruby/speak",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      }),
    );
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(String(init.body))).toEqual({ text: "hello" });
    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0].play).toHaveBeenCalled();
    expect(result.current.state).toBe("playing");
  });

  it("transitions to idle when the audio ends and revokes the object URL", async () => {
    vi.stubGlobal("fetch", mockFetchAudio());
    const { result } = renderHook(() => useTextToSpeech("ruby"));
    await act(async () => {
      await result.current.play("hello");
    });
    act(() => {
      audioInstances[0].onended?.();
    });
    expect(result.current.state).toBe("idle");
    expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:fake-url");
  });

  it("stops the prior playback before starting a new one", async () => {
    vi.stubGlobal("fetch", mockFetchAudio());
    const { result } = renderHook(() => useTextToSpeech("ruby"));
    await act(async () => {
      await result.current.play("first");
    });
    const firstAudio = audioInstances[0];
    await act(async () => {
      await result.current.play("second");
    });
    expect(firstAudio.pause).toHaveBeenCalled();
    expect(audioInstances).toHaveLength(2);
    expect(audioInstances[1].play).toHaveBeenCalled();
  });

  it("stop() halts playback and goes back to idle", async () => {
    vi.stubGlobal("fetch", mockFetchAudio());
    const { result } = renderHook(() => useTextToSpeech("ruby"));
    await act(async () => {
      await result.current.play("hello");
    });
    act(() => {
      result.current.stop();
    });
    expect(audioInstances[0].pause).toHaveBeenCalled();
    expect(result.current.state).toBe("idle");
  });

  it("sets error state when the fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("nope", { status: 500 })),
    );
    const { result } = renderHook(() => useTextToSpeech("ruby"));
    await act(async () => {
      await result.current.play("hello");
    });
    expect(result.current.state).toBe("error");
    expect(result.current.errorMessage).toBeTruthy();
  });

  it("isPlayingText is true while playing the most recent text", async () => {
    vi.stubGlobal("fetch", mockFetchAudio());
    const { result } = renderHook(() => useTextToSpeech("ruby"));
    await act(async () => {
      await result.current.play("hello");
    });
    expect(result.current.isPlayingText("hello")).toBe(true);
    expect(result.current.isPlayingText("other")).toBe(false);
  });
});
