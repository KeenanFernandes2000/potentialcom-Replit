import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CardHeader } from "./CardHeader";

describe("CardHeader", () => {
  it("renders the title", () => {
    render(<CardHeader title="Makeup picks" />);
    expect(screen.getByText("Makeup picks")).toBeInTheDocument();
  });

  it("renders an icon when provided", () => {
    render(<CardHeader icon="💄" title="x" />);
    expect(screen.getByText("💄")).toBeInTheDocument();
  });

  it("omits the icon slot when no icon is provided", () => {
    const { container } = render(<CardHeader title="x" />);
    expect(container.querySelector("[data-testid='card-header-icon']")).toBeNull();
  });

  it("renders a pill when provided", () => {
    render(<CardHeader title="x" pill="display_makeup_products" />);
    expect(screen.getByText("display_makeup_products")).toBeInTheDocument();
  });

  it("uses themed muted classes on the pill", () => {
    render(<CardHeader title="x" pill="tool" />);
    const pill = screen.getByText("tool");
    expect(pill.className).toMatch(/bg-tool-card-muted\b/);
    expect(pill.className).toMatch(/text-tool-card-muted-foreground\b/);
  });
});
