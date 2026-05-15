import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SpeakButton } from "./SpeakButton";
import type { UseTextToSpeechResult } from "./useTextToSpeech";

function fakeTts(overrides: Partial<UseTextToSpeechResult> = {}): UseTextToSpeechResult {
  return {
    state: "idle",
    errorMessage: null,
    play: vi.fn(),
    stop: vi.fn(),
    isPlayingText: vi.fn().mockReturnValue(false),
    ...overrides,
  };
}

describe("SpeakButton", () => {
  it("renders nothing when text is empty or whitespace-only", () => {
    const tts = fakeTts();
    const { container, rerender } = render(
      <SpeakButton text="" tts={tts} />,
    );
    expect(container.firstChild).toBeNull();
    rerender(<SpeakButton text="   " tts={tts} />);
    expect(container.firstChild).toBeNull();
  });

  it("calls play with the message text when clicked while idle", async () => {
    const play = vi.fn().mockResolvedValue(undefined);
    const tts = fakeTts({ play });
    const user = userEvent.setup();
    render(<SpeakButton text="hello listener" tts={tts} />);
    await user.click(screen.getByRole("button", { name: /play|speak/i }));
    expect(play).toHaveBeenCalledWith("hello listener");
  });

  it("calls stop when clicked while playing this same text", async () => {
    const stop = vi.fn();
    const tts = fakeTts({
      state: "playing",
      isPlayingText: vi.fn().mockImplementation((t) => t === "hello"),
      stop,
    });
    const user = userEvent.setup();
    render(<SpeakButton text="hello" tts={tts} />);
    await user.click(screen.getByRole("button", { name: /stop|pause/i }));
    expect(stop).toHaveBeenCalled();
  });

  it("shows the playing label when this message is the active player", () => {
    const tts = fakeTts({
      state: "playing",
      isPlayingText: vi.fn().mockReturnValue(true),
    });
    render(<SpeakButton text="hello" tts={tts} />);
    expect(screen.getByRole("button", { name: /stop|pause/i })).toBeInTheDocument();
  });
});
