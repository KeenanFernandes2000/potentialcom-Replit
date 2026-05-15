import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToolLoadingPill } from "./ToolLoadingPill";

describe("ToolLoadingPill", () => {
  it("renders 'Using {name}…' text", () => {
    render(<ToolLoadingPill name="display_makeup_products" />);
    expect(screen.getByText(/Using display_makeup_products…/)).toBeInTheDocument();
  });

  it("uses themed muted classes", () => {
    const { container } = render(<ToolLoadingPill name="x" />);
    const pill = container.firstElementChild as HTMLElement;
    expect(pill.className).toMatch(/bg-tool-card-muted\b/);
    expect(pill.className).toMatch(/text-tool-card-muted-foreground\b/);
  });

  it("renders an animated wrench icon", () => {
    render(<ToolLoadingPill name="x" />);
    const icon = screen.getByTestId("tool-loading-icon");
    expect(icon.getAttribute("class")).toMatch(/animate-pulse\b/);
  });
});
