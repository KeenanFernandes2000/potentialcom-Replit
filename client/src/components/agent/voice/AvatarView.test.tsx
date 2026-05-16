import { describe, it, expect, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { AvatarView } from "./AvatarView";

describe("AvatarView", () => {
  it("renders a fallback img with the agent name as alt text when track is null", () => {
    render(
      <AvatarView
        track={null}
        avatarUrl="https://example.com/ruby.png"
        agentName="Ruby"
      />,
    );
    const img = screen.getByAltText("Ruby") as HTMLImageElement;
    expect(img.src).toBe("https://example.com/ruby.png");
  });

  it("renders a 'Connecting' caption alongside the fallback while connecting", () => {
    render(
      <AvatarView
        track={null}
        avatarUrl="https://example.com/ruby.png"
        agentName="Ruby"
      />,
    );
    expect(screen.getByText(/connecting/i)).toBeInTheDocument();
  });

  it("calls track.attach(videoElement) when a track is provided", () => {
    const attach = vi.fn();
    const detach = vi.fn();
    const fakeTrack = { attach, detach } as any;
    render(
      <AvatarView
        track={fakeTrack}
        avatarUrl="https://example.com/ruby.png"
        agentName="Ruby"
      />,
    );
    expect(attach).toHaveBeenCalledTimes(1);
    const arg = attach.mock.calls[0][0];
    expect(arg).toBeInstanceOf(HTMLVideoElement);
  });

  it("calls track.detach() on unmount", () => {
    const attach = vi.fn();
    const detach = vi.fn();
    const fakeTrack = { attach, detach } as any;
    const { unmount } = render(
      <AvatarView
        track={fakeTrack}
        avatarUrl="https://example.com/ruby.png"
        agentName="Ruby"
      />,
    );
    unmount();
    expect(detach).toHaveBeenCalledTimes(1);
  });

  it("does NOT render the fallback img when a track is provided", () => {
    const fakeTrack = { attach: vi.fn(), detach: vi.fn() } as any;
    render(
      <AvatarView
        track={fakeTrack}
        avatarUrl="https://example.com/ruby.png"
        agentName="Ruby"
      />,
    );
    expect(screen.queryByAltText("Ruby")).toBeNull();
  });
});
