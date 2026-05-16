import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { AutoGrowTextarea } from "./AutoGrowTextarea";

function Harness({
  onSubmit,
  disabled,
  autoFocusKey,
  initial = "",
}: {
  onSubmit?: () => void;
  disabled?: boolean;
  autoFocusKey?: number;
  initial?: string;
}) {
  const [value, setValue] = useState(initial);
  return (
    <AutoGrowTextarea
      value={value}
      onChange={setValue}
      onSubmit={onSubmit ?? (() => {})}
      placeholder="Message Ruby…"
      disabled={disabled}
      autoFocusKey={autoFocusKey ?? 0}
    />
  );
}

describe("AutoGrowTextarea", () => {
  it("renders a textarea with the placeholder text", () => {
    render(<Harness />);
    expect(screen.getByPlaceholderText(/message ruby/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/message ruby/i).tagName).toBe(
      "TEXTAREA",
    );
  });

  it("reflects the controlled value", () => {
    render(<Harness initial="hello world" />);
    const ta = screen.getByPlaceholderText(/message ruby/i) as HTMLTextAreaElement;
    expect(ta.value).toBe("hello world");
  });

  it("calls onSubmit + prevents default when Enter is pressed without Shift", () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} initial="hi" />);
    const ta = screen.getByPlaceholderText(/message ruby/i);

    const enterEvent = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    });
    ta.dispatchEvent(enterEvent);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(enterEvent.defaultPrevented).toBe(true);
  });

  it("does NOT call onSubmit when Shift+Enter is pressed (allows newline)", () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} initial="hi" />);
    const ta = screen.getByPlaceholderText(/message ruby/i);

    const shiftEnterEvent = new KeyboardEvent("keydown", {
      key: "Enter",
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    ta.dispatchEvent(shiftEnterEvent);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(shiftEnterEvent.defaultPrevented).toBe(false);
  });

  it("blocks Enter when disabled", () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} disabled initial="hi" />);
    const ta = screen.getByPlaceholderText(/message ruby/i);
    fireEvent.keyDown(ta, { key: "Enter" });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("autoFocusKey change refocuses the textarea", async () => {
    function Wrapper() {
      const [k, setK] = useState(0);
      return (
        <>
          <button onClick={() => setK((x) => x + 1)}>bump</button>
          <Harness autoFocusKey={k} />
        </>
      );
    }
    const user = userEvent.setup();
    render(<Wrapper />);
    const ta = screen.getByPlaceholderText(/message ruby/i);

    // Initial mount focuses (autoFocusKey is 0, effect runs once).
    expect(document.activeElement).toBe(ta);

    // Blur it.
    (ta as HTMLTextAreaElement).blur();
    expect(document.activeElement).not.toBe(ta);

    // Bumping autoFocusKey should refocus.
    await user.click(screen.getByText("bump"));
    expect(document.activeElement).toBe(ta);
  });
});
