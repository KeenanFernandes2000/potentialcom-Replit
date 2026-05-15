import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CardGrid } from "./CardGrid";

describe("CardGrid", () => {
  it("renders all children", () => {
    render(
      <CardGrid>
        <span>a</span>
        <span>b</span>
        <span>c</span>
      </CardGrid>,
    );
    expect(screen.getByText("a")).toBeInTheDocument();
    expect(screen.getByText("b")).toBeInTheDocument();
    expect(screen.getByText("c")).toBeInTheDocument();
  });

  it("uses an auto-fill grid template with default 160px minItemWidth", () => {
    const { container } = render(<CardGrid><span>a</span></CardGrid>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.gridTemplateColumns).toBe(
      "repeat(auto-fill, minmax(160px, 1fr))",
    );
  });

  it("honors a custom minItemWidth", () => {
    const { container } = render(
      <CardGrid minItemWidth="220px"><span>a</span></CardGrid>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.gridTemplateColumns).toBe(
      "repeat(auto-fill, minmax(220px, 1fr))",
    );
  });

  it("applies the gap class", () => {
    const { container } = render(<CardGrid><span>a</span></CardGrid>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toMatch(/grid\b/);
    expect(root.className).toMatch(/gap-2\b/);
  });
});
