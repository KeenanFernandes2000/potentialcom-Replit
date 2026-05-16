import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScrollToLatestPill } from "./ScrollToLatestPill";

describe("ScrollToLatestPill", () => {
  it("renders a button with the 'Latest message' label", () => {
    render(<ScrollToLatestPill onClick={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: /latest message/i }),
    ).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<ScrollToLatestPill onClick={onClick} />);
    await user.click(screen.getByRole("button", { name: /latest message/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
