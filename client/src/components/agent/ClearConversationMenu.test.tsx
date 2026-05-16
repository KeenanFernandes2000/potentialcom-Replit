import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClearConversationMenu } from "./ClearConversationMenu";

describe("ClearConversationMenu", () => {
  it("renders a three-dot menu trigger button", () => {
    render(<ClearConversationMenu onClear={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: /chat menu/i }),
    ).toBeInTheDocument();
  });

  it("opens the dropdown menu on trigger click and shows 'Clear conversation' item", async () => {
    const user = userEvent.setup();
    render(<ClearConversationMenu onClear={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /chat menu/i }));
    expect(
      screen.getByRole("menuitem", { name: /clear conversation/i }),
    ).toBeInTheDocument();
  });

  it("clicking the menu item opens a confirm dialog", async () => {
    const user = userEvent.setup();
    render(<ClearConversationMenu onClear={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /chat menu/i }));
    await user.click(
      screen.getByRole("menuitem", { name: /clear conversation/i }),
    );
    expect(
      screen.getByRole("alertdialog", { name: /clear this conversation/i }),
    ).toBeInTheDocument();
  });

  it("dialog Confirm calls onClear", async () => {
    const onClear = vi.fn();
    const user = userEvent.setup();
    render(<ClearConversationMenu onClear={onClear} />);
    await user.click(screen.getByRole("button", { name: /chat menu/i }));
    await user.click(
      screen.getByRole("menuitem", { name: /clear conversation/i }),
    );
    await user.click(screen.getByRole("button", { name: /^clear$/i }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("dialog Cancel does NOT call onClear", async () => {
    const onClear = vi.fn();
    const user = userEvent.setup();
    render(<ClearConversationMenu onClear={onClear} />);
    await user.click(screen.getByRole("button", { name: /chat menu/i }));
    await user.click(
      screen.getByRole("menuitem", { name: /clear conversation/i }),
    );
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClear).not.toHaveBeenCalled();
  });
});
