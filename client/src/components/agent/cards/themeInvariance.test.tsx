import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { CardShell } from "./CardShell";
import { CardHeader } from "./CardHeader";
import { CardImage } from "./CardImage";
import { CardCTA } from "./CardCTA";
import { CardGrid } from "./CardGrid";
import { ToolLoadingPill } from "./ToolLoadingPill";

// Asserts that the rendered className strings of every primitive's root
// element are byte-identical inside and outside a .dark wrapper. This
// guards the design system's load-bearing invariant: theme is driven by
// CSS variables, never by Tailwind's `dark:` prefix in component code.

function rootClassesOutsideAndInsideDark(ui: ReactElement): [string, string] {
  const { container: light } = render(ui);
  const lightRoot = light.firstElementChild as HTMLElement;
  const { container: dark } = render(<div className="dark">{ui}</div>);
  const darkWrapper = dark.firstElementChild as HTMLElement;
  const darkRoot = darkWrapper.firstElementChild as HTMLElement;
  return [lightRoot.className, darkRoot.className];
}

describe("Theme invariance across primitives", () => {
  it("CardShell", () => {
    const [l, d] = rootClassesOutsideAndInsideDark(<CardShell>x</CardShell>);
    expect(l).toBe(d);
  });

  it("CardHeader", () => {
    const [l, d] = rootClassesOutsideAndInsideDark(<CardHeader title="t" pill="p" />);
    expect(l).toBe(d);
  });

  it("CardImage (fallback variant)", () => {
    const [l, d] = rootClassesOutsideAndInsideDark(<CardImage alt="x" />);
    expect(l).toBe(d);
  });

  it("CardCTA (primary variant)", () => {
    const [l, d] = rootClassesOutsideAndInsideDark(
      <CardCTA href="https://example.com">View</CardCTA>,
    );
    expect(l).toBe(d);
  });

  it("CardGrid", () => {
    const [l, d] = rootClassesOutsideAndInsideDark(
      <CardGrid><span>a</span></CardGrid>,
    );
    expect(l).toBe(d);
  });

  it("ToolLoadingPill", () => {
    const [l, d] = rootClassesOutsideAndInsideDark(<ToolLoadingPill name="x" />);
    expect(l).toBe(d);
  });
});
