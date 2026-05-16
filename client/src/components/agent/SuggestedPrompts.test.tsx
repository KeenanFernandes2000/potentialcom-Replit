import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SuggestedPrompts } from "./SuggestedPrompts";

describe("SuggestedPrompts", () => {
  it("renders the default four Ruby-tailored prompts", () => {
    render(<SuggestedPrompts onSelect={vi.fn()} />);
    expect(screen.getByText("Show me lipsticks")).toBeInTheDocument();
    expect(screen.getByText("Active discount codes")).toBeInTheDocument();
    expect(screen.getByText("Find a makeup expert")).toBeInTheDocument();
    expect(screen.getByText("Beauty courses")).toBeInTheDocument();
  });

  it("calls onSelect with the prompt text (not the chip label) when a chip is clicked", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<SuggestedPrompts onSelect={onSelect} />);
    await user.click(screen.getByText("Show me lipsticks"));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith("Show me lipsticks");
  });

  it("emits distinct prompt strings for each chip", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<SuggestedPrompts onSelect={onSelect} />);
    await user.click(screen.getByText("Active discount codes"));
    await user.click(screen.getByText("Find a makeup expert"));
    await user.click(screen.getByText("Beauty courses"));
    expect(onSelect.mock.calls.map((c) => c[0])).toEqual([
      "Show me discount codes",
      "Find me a makeup expert",
      "What courses do you have?",
    ]);
  });

  it("renders a 'Try one of these' header above the chips", () => {
    render(<SuggestedPrompts onSelect={vi.fn()} />);
    expect(screen.getByText(/try one of these/i)).toBeInTheDocument();
  });

  it("accepts a custom prompts prop and renders those instead", () => {
    render(
      <SuggestedPrompts
        onSelect={vi.fn()}
        prompts={[
          { emoji: "🚀", label: "Custom thing", prompt: "do thing", tag: "Test" },
        ]}
      />,
    );
    expect(screen.getByText("Custom thing")).toBeInTheDocument();
    expect(screen.queryByText("Show me lipsticks")).toBeNull();
  });
});
