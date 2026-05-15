import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DisplayMakeupExpertsCard } from "./DisplayMakeupExpertsCard";
import type { ToolInvocation } from "@shared/agent";

function inv(
  args: unknown,
  overrides: Partial<ToolInvocation> = {},
): ToolInvocation {
  return {
    id: "id-1",
    name: "display_makeup_experts",
    arguments: args,
    response: undefined,
    status: "complete",
    ...overrides,
  };
}

const sampleExperts = [
  {
    name: "Amira Khan",
    image: "https://cdn.example/amira.jpg",
    specialties: "Bridal, Editorial",
    prices: "From $120",
  },
  {
    name: "Lina Patel",
    image: "https://cdn.example/lina.jpg",
    specialties: "Skincare, Natural",
    prices: "From $80",
  },
];

describe("DisplayMakeupExpertsCard — happy path", () => {
  it("renders a loading pill when status is loading", () => {
    render(
      <DisplayMakeupExpertsCard
        invocation={inv({}, { status: "loading" })}
      />,
    );
    expect(
      screen.getByText(/Using display_makeup_experts…/),
    ).toBeInTheDocument();
  });

  it("renders the header title and pill with count", () => {
    render(
      <DisplayMakeupExpertsCard invocation={inv({ experts: sampleExperts })} />,
    );
    expect(screen.getByText("Meet our makeup experts")).toBeInTheDocument();
    expect(screen.getByText("2 experts")).toBeInTheDocument();
  });

  it("renders each expert's name, specialties, and prices", () => {
    render(
      <DisplayMakeupExpertsCard invocation={inv({ experts: sampleExperts })} />,
    );
    expect(screen.getByText("Amira Khan")).toBeInTheDocument();
    expect(screen.getByText("Lina Patel")).toBeInTheDocument();
    expect(screen.getByText("Bridal, Editorial")).toBeInTheDocument();
    expect(screen.getByText("From $120")).toBeInTheDocument();
  });
});

describe("DisplayMakeupExpertsCard — defensive", () => {
  it("falls back to ThemedGenericCard when arguments is undefined", () => {
    render(<DisplayMakeupExpertsCard invocation={inv(undefined)} />);
    expect(
      screen.getAllByText("display_makeup_experts").length,
    ).toBeGreaterThan(0);
  });

  it("falls back to ThemedGenericCard when arguments is a string", () => {
    render(<DisplayMakeupExpertsCard invocation={inv("oops")} />);
    expect(
      screen.getAllByText("display_makeup_experts").length,
    ).toBeGreaterThan(0);
  });

  it("falls back when experts list is empty", () => {
    render(<DisplayMakeupExpertsCard invocation={inv({ experts: [] })} />);
    expect(
      screen.getAllByText("display_makeup_experts").length,
    ).toBeGreaterThan(0);
  });

  it("omits specialties and prices when missing without rendering undefined", () => {
    const { container } = render(
      <DisplayMakeupExpertsCard
        invocation={inv({ experts: [{ name: "Solo Expert" }] })}
      />,
    );
    expect(screen.getByText("Solo Expert")).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/undefined/);
    expect(container.textContent).not.toMatch(/null/);
  });

  it("skips malformed items and warns once in dev", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <DisplayMakeupExpertsCard
        invocation={inv({
          experts: [
            { name: "Valid Expert" },
            "garbage" as unknown,
            { /* no name */ specialties: "skincare" },
          ],
        })}
      />,
    );
    expect(screen.getByText("Valid Expert")).toBeInTheDocument();
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("skipped 2 malformed item(s)"),
    );
    warnSpy.mockRestore();
  });
});
