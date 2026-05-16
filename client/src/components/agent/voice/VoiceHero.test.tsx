import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { VoiceHero } from "./VoiceHero";

// Helper: render with sensible defaults so each test only overrides the
// state-affecting props it cares about.
function renderHero(
  override: Partial<React.ComponentProps<typeof VoiceHero>> = {},
) {
  const onMute = vi.fn();
  const onHangup = vi.fn();
  const props = {
    state: "listening" as const,
    durationMs: 12000,
    isMuted: false,
    avatarUrl: "https://example.com/ruby.png",
    agentName: "Ruby",
    onMute,
    onHangup,
    ...override,
  };
  return { ...render(<VoiceHero {...props} />), onMute, onHangup };
}

describe("VoiceHero", () => {
  it("shows 'Listening' + a formatted timer in the listening state", () => {
    renderHero({ state: "listening", durationMs: 67000 });
    expect(screen.getByText("Listening")).toBeInTheDocument();
    // 67000ms → 1:07
    expect(screen.getByText("1:07")).toBeInTheDocument();
  });

  it("shows 'Speaking' and reveals the waveform during agent-speaking", () => {
    renderHero({ state: "agent-speaking" });
    expect(screen.getByText("Speaking")).toBeInTheDocument();
    expect(screen.getByTestId("voice-hero-waveform")).toBeInTheDocument();
  });

  it("does NOT render the waveform when Ruby isn't speaking", () => {
    renderHero({ state: "listening" });
    expect(screen.queryByTestId("voice-hero-waveform")).toBeNull();
  });

  it("hides the mute button while Ruby is speaking (muting your mic mid-Ruby is a no-op)", () => {
    renderHero({ state: "agent-speaking" });
    expect(screen.queryByTestId("voice-hero-mute")).toBeNull();
    // End-call must always be reachable.
    expect(screen.getByTestId("voice-hero-hangup")).toBeInTheDocument();
  });

  it("invokes onMute when the mute button is clicked, with the correct aria label per isMuted state", () => {
    const { onMute, rerender } = renderHero({ state: "listening", isMuted: false });
    const btn = screen.getByTestId("voice-hero-mute");
    expect(btn.getAttribute("aria-label")).toBe("Mute");
    fireEvent.click(btn);
    expect(onMute).toHaveBeenCalledTimes(1);
    rerender(
      <VoiceHero
        state="listening"
        durationMs={0}
        isMuted={true}
        agentName="Ruby"
        onMute={onMute}
        onHangup={vi.fn()}
      />,
    );
    expect(screen.getByTestId("voice-hero-mute").getAttribute("aria-label")).toBe(
      "Unmute",
    );
  });

  it("invokes onHangup when the end-call button is clicked", () => {
    const { onHangup } = renderHero();
    fireEvent.click(screen.getByTestId("voice-hero-hangup"));
    expect(onHangup).toHaveBeenCalledTimes(1);
  });

  it("shows 'Call dropped' and hides the timer in the error state (the duration is meaningless after a drop)", () => {
    renderHero({ state: "error", durationMs: 30000 });
    expect(screen.getByText("Call dropped")).toBeInTheDocument();
    // Timer should not appear in the error state.
    expect(screen.queryByText(/^\d+:\d{2}$/)).toBeNull();
  });

  it("renders an avatar image with the agent's name as alt text when provided", () => {
    renderHero({ avatarUrl: "https://example.com/ruby.png", agentName: "Ruby" });
    const img = screen.getByAltText("Ruby") as HTMLImageElement;
    expect(img.src).toBe("https://example.com/ruby.png");
  });
});
