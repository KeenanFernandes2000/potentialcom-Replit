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
