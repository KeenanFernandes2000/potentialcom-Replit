import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CardCTA } from "./CardCTA";

describe("CardCTA", () => {
  it("renders an <a> with target='_blank' and rel='noopener noreferrer'", () => {
    render(<CardCTA href="https://example.com">View</CardCTA>);
    const a = screen.getByRole("link", { name: "View" }) as HTMLAnchorElement;
    expect(a.href).toBe("https://example.com/");
    expect(a.target).toBe("_blank");
    expect(a.rel).toBe("noopener noreferrer");
  });

  it("renders primary variant classes by default", () => {
    render(<CardCTA href="https://example.com">View</CardCTA>);
    const a = screen.getByRole("link");
    expect(a.className).toMatch(/bg-tool-card-accent\b/);
    expect(a.className).toMatch(/text-tool-card-accent-foreground\b/);
  });

  it("renders ghost variant classes when requested", () => {
    render(<CardCTA href="https://example.com" variant="ghost">View</CardCTA>);
    const a = screen.getByRole("link");
    expect(a.className).toMatch(/border-tool-card-border\b/);
    expect(a.className).toMatch(/text-tool-card-accent\b/);
  });

  it("renders nothing for non-http(s) href", () => {
    const { container: c1 } = render(<CardCTA href="javascript:alert(1)">x</CardCTA>);
    expect(c1.firstChild).toBeNull();
    const { container: c2 } = render(<CardCTA href="ftp://example.com">x</CardCTA>);
    expect(c2.firstChild).toBeNull();
    const { container: c3 } = render(<CardCTA href="">x</CardCTA>);
    expect(c3.firstChild).toBeNull();
  });

  it("accepts http (not just https)", () => {
    render(<CardCTA href="http://example.com">View</CardCTA>);
    expect(screen.getByRole("link")).toBeInTheDocument();
  });
});
