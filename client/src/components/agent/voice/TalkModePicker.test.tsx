import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TalkModePicker } from "./TalkModePicker";

describe("TalkModePicker", () => {
  it("renders both options when open=true", () => {
    render(
      <TalkModePicker
        open={true}
        onOpenChange={vi.fn()}
        onPick={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /voice only/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /voice \+ avatar/i })).toBeInTheDocument();
  });

  it("renders nothing visible when open=false", () => {
    render(
      <TalkModePicker
        open={false}
        onOpenChange={vi.fn()}
        onPick={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button", { name: /voice only/i })).toBeNull();
  });

  it("clicking 'Voice only' calls onPick(false)", async () => {
    const onPick = vi.fn();
    const user = userEvent.setup();
    render(
      <TalkModePicker
        open={true}
        onOpenChange={vi.fn()}
        onPick={onPick}
      />,
    );
    await user.click(screen.getByRole("button", { name: /voice only/i }));
    expect(onPick).toHaveBeenCalledWith(false);
  });

  it("clicking 'Voice + Avatar' calls onPick(true)", async () => {
    const onPick = vi.fn();
    const user = userEvent.setup();
    render(
      <TalkModePicker
        open={true}
        onOpenChange={vi.fn()}
        onPick={onPick}
      />,
    );
    await user.click(screen.getByRole("button", { name: /voice \+ avatar/i }));
    expect(onPick).toHaveBeenCalledWith(true);
  });

  it("closing the dialog calls onOpenChange(false) and does NOT call onPick", async () => {
    const onPick = vi.fn();
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TalkModePicker
        open={true}
        onOpenChange={onOpenChange}
        onPick={onPick}
      />,
    );
    // Use the Escape key to close the dialog (Radix Dialog supports this).
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onPick).not.toHaveBeenCalled();
  });
});
