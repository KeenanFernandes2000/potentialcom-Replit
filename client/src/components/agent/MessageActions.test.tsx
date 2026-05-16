import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MessageActions } from "./MessageActions";
import type { AgentMessage } from "@shared/agent";

function makeMsg(overrides: Partial<AgentMessage> = {}): AgentMessage {
  return {
    id: "msg-1",
    role: "agent",
    text: "hello world",
    tools: [],
    status: "complete",
    createdAt: Date.now(),
    ...overrides,
  };
}

beforeEach(() => {
  // jsdom-friendly clipboard mock.
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("MessageActions", () => {
  it("renders the Copy button for any agent message with text", () => {
    render(
      <MessageActions
        message={makeMsg()}
        isLast={false}
        onRegenerate={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /copy/i })).toBeInTheDocument();
  });

  it("does NOT render Regenerate when isLast is false", () => {
    render(
      <MessageActions
        message={makeMsg()}
        isLast={false}
        onRegenerate={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button", { name: /regenerate/i })).toBeNull();
  });

  it("renders Regenerate when isLast is true AND status is complete", () => {
    render(
      <MessageActions
        message={makeMsg({ status: "complete" })}
        isLast={true}
        onRegenerate={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /regenerate/i })).toBeInTheDocument();
  });

  it("renders Retry (instead of Regenerate) when status is error", () => {
    render(
      <MessageActions
        message={makeMsg({ status: "error" })}
        isLast={true}
        onRegenerate={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /regenerate/i })).toBeNull();
  });

  it("Copy click writes the message text to the clipboard and shows ✓ for 1500ms", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    // @testing-library/user-event v14 installs its own clipboard stub during
    // setup(), which would shadow the spy from beforeEach. Re-apply the mock
    // here so our toHaveBeenCalledWith assertion still targets a real spy.
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(
      <MessageActions
        message={makeMsg({ text: "the answer is 42" })}
        isLast={false}
        onRegenerate={vi.fn()}
      />,
    );
    const copyBtn = screen.getByRole("button", { name: /copy/i });
    await user.click(copyBtn);

    expect(writeText).toHaveBeenCalledWith("the answer is 42");

    // Icon swap → button accessible name flips to "Copied".
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /copied/i })).toBeInTheDocument(),
    );

    // After 1500ms it reverts.
    vi.advanceTimersByTime(1600);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /^copy$/i })).toBeInTheDocument(),
    );
  });

  it("Regenerate click calls onRegenerate(message.id)", async () => {
    const onRegenerate = vi.fn();
    const user = userEvent.setup();
    render(
      <MessageActions
        message={makeMsg({ id: "abc-123" })}
        isLast={true}
        onRegenerate={onRegenerate}
      />,
    );
    await user.click(screen.getByRole("button", { name: /regenerate/i }));
    expect(onRegenerate).toHaveBeenCalledWith("abc-123");
  });

  it("Retry click calls onRegenerate(message.id)", async () => {
    const onRegenerate = vi.fn();
    const user = userEvent.setup();
    render(
      <MessageActions
        message={makeMsg({ id: "abc-123", status: "error" })}
        isLast={true}
        onRegenerate={onRegenerate}
      />,
    );
    await user.click(screen.getByRole("button", { name: /retry/i }));
    expect(onRegenerate).toHaveBeenCalledWith("abc-123");
  });
});
