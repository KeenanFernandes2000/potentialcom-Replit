import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// IMPORTANT: FakeRoom must be imported and the vi.mock hoisted before
// AgentChat / useLiveKitVoice are resolved. vi.mock is hoisted by Vitest so
// this intercepts livekit-client at module resolution time.
import { installFakeRoom, getLastFakeRoom, FakeRoom } from "../../../test/livekitFakeRoom";
installFakeRoom();

vi.mock("livekit-client", async () => {
  const actual = await vi.importActual<any>("livekit-client");
  return { ...actual, Room: FakeRoom };
});

import { AgentChat } from "../AgentChat";
import { rubyToolRegistry } from "../../ruby/rubyToolRegistry";
import { Toaster } from "@/components/ui/toaster";

beforeEach(() => {
  FakeRoom.instances = [];
  FakeRoom.nextConnectError = null;
  FakeRoom.nextEnableMicError = null;

  if (!Element.prototype.scrollTo) {
    Element.prototype.scrollTo = vi.fn() as unknown as typeof Element.prototype.scrollTo;
  } else {
    vi.spyOn(Element.prototype, "scrollTo").mockImplementation(() => {});
  }

  // VoiceModeButton checks isVoiceSupported() which requires mediaDevices.getUserMedia
  // and WebSocket. jsdom doesn't provide these by default.
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
  it("clicking Talk to Ruby connects via LiveKit and renders voice events as chat messages", async () => {
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
    // Picker opens; pick "Voice only" to mint a voice-only room.
    const voiceOnlyBtn = await screen.findByRole("button", { name: /voice only/i });
    await user.click(voiceOnlyBtn);
    // FakeRoom is constructed once the room is minted and hook connects.
    await waitFor(() => expect(FakeRoom.instances).toHaveLength(1));

    const room = getLastFakeRoom();
    // Verify connect was called with the correct LiveKit URL and token.
    await waitFor(() => expect(room.connect).toHaveBeenCalledOnce());
    expect(room.lastConnectArgs).toEqual({
      url: "wss://livekit.test",
      token: "tok",
    });

    // Drive an aiResponse event and assert the chat renders it.
    act(() => {
      room.triggerDataReceived({ type: "aiResponse", text: "Welcome! How can I help?" });
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

  it("renders <AvatarView> and hides the text input when an anam-* video track arrives", async () => {
    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (typeof url === "string" && url.endsWith("/api/agent/ruby/bot")) {
        return new Response(
          JSON.stringify({
            name: "Ruby",
            greeting: "Hi",
            avatarUrl: "/ruby.png",
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
      return new Response("data: [DONE]\n\n", {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<AgentChat agentKey="ruby" registry={rubyToolRegistry} />);

    const talkBtn = await screen.findByRole("button", { name: /talk to ruby/i });
    await user.click(talkBtn);
    // Pick the avatar option from the picker.
    const avatarBtn = await screen.findByRole("button", { name: /voice \+ avatar/i });
    await user.click(avatarBtn);
    await waitFor(() => expect(FakeRoom.instances).toHaveLength(1));
    const room = getLastFakeRoom();

    // Before the avatar track arrives: text input still visible
    // (voice-only layout while connecting).
    expect(screen.queryByTestId("avatar-view-video")).toBeNull();

    // Simulate the Anam video track joining the room.
    act(() => {
      room.triggerAnamVideoTrack();
    });

    // Now the AvatarView's <video> should be present.
    await waitFor(() => {
      expect(screen.getByTestId("avatar-view-video")).toBeInTheDocument();
    });

    // Text input should be hidden (avatar mode is voice-first).
    expect(screen.queryByPlaceholderText(/message ruby/i)).toBeNull();
  });

  it("shows a toast when the voice room mint fails (e.g., trial exhausted)", async () => {
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
          JSON.stringify({ error: "Voice trial exhausted" }),
          { status: 403, headers: { "Content-Type": "application/json" } },
        );
      }
      return new Response("data: [DONE]\n\n", {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    // Render Toaster alongside AgentChat so the toast viewport is
    // mounted in the document. Without it the portal has no host and
    // toast descriptions never appear in the DOM.
    render(
      <>
        <AgentChat agentKey="ruby" registry={rubyToolRegistry} />
        <Toaster />
      </>,
    );

    await user.click(
      await screen.findByRole("button", { name: /talk to ruby/i }),
    );
    // Picker opens; pick "Voice only" to mint a voice-only room.
    const voiceOnlyBtn = await screen.findByRole("button", { name: /voice only/i });
    await user.click(voiceOnlyBtn);

    // The toast renderer mounts the description text in the DOM —
    // it's the same toast viewport used by the rest of the app.
    expect(
      await screen.findByText(/voice trial exhausted/i),
    ).toBeInTheDocument();

    // After the error, the call bar should be gone and the Talk
    // button should be back (state went idle → connecting → error).
    expect(
      screen.getByRole("button", { name: /talk to ruby/i }),
    ).toBeInTheDocument();
  });
});
