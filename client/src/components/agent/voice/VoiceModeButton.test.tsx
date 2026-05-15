import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VoiceModeButton } from "./VoiceModeButton";

beforeEach(() => {
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia: vi.fn() },
  });
});

describe("VoiceModeButton", () => {
  it("renders nothing when disabled", () => {
    const { container } = render(
      <VoiceModeButton disabled onClick={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when getUserMedia is unavailable", () => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: undefined,
    });
    const { container } = render(<VoiceModeButton onClick={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders a Talk to Ruby button and calls onClick when clicked", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<VoiceModeButton onClick={onClick} />);
    const btn = screen.getByRole("button", { name: /talk to ruby/i });
    await user.click(btn);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is rendered but disabled when busy is true", () => {
    render(<VoiceModeButton onClick={vi.fn()} busy />);
    const btn = screen.getByRole("button", { name: /talk to ruby/i });
    expect(btn).toBeDisabled();
  });
});
