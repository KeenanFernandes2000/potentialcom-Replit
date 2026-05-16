import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AutoSpeakToggle } from "./AutoSpeakToggle";

beforeEach(() => {
  localStorage.clear();
});

describe("AutoSpeakToggle", () => {
  it("reflects the localStorage default (off)", () => {
    render(<AutoSpeakToggle />);
    const cb = screen.getByRole("switch", { name: /auto-speak/i });
    expect(cb).toHaveAttribute("aria-checked", "false");
  });

  it("toggles to on and persists to localStorage", async () => {
    const user = userEvent.setup();
    render(<AutoSpeakToggle />);
    const cb = screen.getByRole("switch", { name: /auto-speak/i });
    await user.click(cb);
    expect(cb).toHaveAttribute("aria-checked", "true");
    expect(localStorage.getItem("ruby:autoSpeak:v2")).toBe("true");
  });

  it("fires onChange with the new value", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<AutoSpeakToggle onChange={onChange} />);
    await user.click(screen.getByRole("switch", { name: /auto-speak/i }));
    expect(onChange).toHaveBeenLastCalledWith(true);
  });

  it("reads an existing localStorage value on mount", () => {
    localStorage.setItem("ruby:autoSpeak:v2", "true");
    render(<AutoSpeakToggle />);
    expect(
      screen.getByRole("switch", { name: /auto-speak/i }),
    ).toHaveAttribute("aria-checked", "true");
  });
});
