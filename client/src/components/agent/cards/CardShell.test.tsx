import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CardShell } from "./CardShell";

describe("CardShell", () => {
  it("renders children", () => {
    render(<CardShell><span>hello</span></CardShell>);
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("applies the themed base classes", () => {
    const { container } = render(<CardShell>x</CardShell>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toMatch(/bg-tool-card\b/);
    expect(root.className).toMatch(/text-tool-card-foreground\b/);
    expect(root.className).toMatch(/border-tool-card-border\b/);
    expect(root.className).toMatch(/rounded-xl\b/);
  });

  it("appends a custom className", () => {
    const { container } = render(<CardShell className="extra-cls">x</CardShell>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toMatch(/extra-cls/);
    // base theme classes must survive
    expect(root.className).toMatch(/bg-tool-card\b/);
  });

  it("renders identical classes inside and outside .dark", () => {
    const { container: lightC } = render(<CardShell>x</CardShell>);
    const { container: darkC } = render(
      <div className="dark"><CardShell>x</CardShell></div>,
    );
    const lightRoot = lightC.firstElementChild as HTMLElement;
    const darkRoot = (darkC.firstElementChild as HTMLElement)
      .firstElementChild as HTMLElement;
    expect(lightRoot.className).toBe(darkRoot.className);
  });
});
