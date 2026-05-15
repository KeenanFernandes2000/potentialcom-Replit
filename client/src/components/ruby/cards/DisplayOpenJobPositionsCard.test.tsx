import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DisplayOpenJobPositionsCard } from "./DisplayOpenJobPositionsCard";
import type { ToolInvocation } from "@shared/agent";

function inv(
  args: unknown,
  overrides: Partial<ToolInvocation> = {},
): ToolInvocation {
  return {
    id: "id-1",
    name: "display_open_job_positions",
    arguments: args,
    response: undefined,
    status: "complete",
    ...overrides,
  };
}

const samplePositions = [
  {
    title: "Senior Makeup Artist",
    department: "Studio",
    location: "Dubai",
    type: "Full-time",
  },
  {
    title: "Salon Manager",
    department: "Operations",
    location: "Riyadh",
    type: "Full-time",
  },
];

describe("DisplayOpenJobPositionsCard — happy path", () => {
  it("renders a loading pill when status is loading", () => {
    render(
      <DisplayOpenJobPositionsCard
        invocation={inv({}, { status: "loading" })}
      />,
    );
    expect(
      screen.getByText(/Using display_open_job_positions…/),
    ).toBeInTheDocument();
  });

  it("renders the header title and count pill", () => {
    render(
      <DisplayOpenJobPositionsCard
        invocation={inv({ positions: samplePositions })}
      />,
    );
    expect(screen.getByText("Open positions")).toBeInTheDocument();
    expect(screen.getByText("2 open")).toBeInTheDocument();
  });

  it("renders each position's title and combined meta line", () => {
    render(
      <DisplayOpenJobPositionsCard
        invocation={inv({ positions: samplePositions })}
      />,
    );
    expect(screen.getByText("Senior Makeup Artist")).toBeInTheDocument();
    expect(screen.getByText("Salon Manager")).toBeInTheDocument();
    expect(
      screen.getByText("Studio · Dubai · Full-time"),
    ).toBeInTheDocument();
  });
});

describe("DisplayOpenJobPositionsCard — defensive", () => {
  it("falls back to ThemedGenericCard when arguments is undefined", () => {
    render(<DisplayOpenJobPositionsCard invocation={inv(undefined)} />);
    expect(
      screen.getAllByText("display_open_job_positions").length,
    ).toBeGreaterThan(0);
  });

  it("falls back when arguments is a string", () => {
    render(<DisplayOpenJobPositionsCard invocation={inv("bad")} />);
    expect(
      screen.getAllByText("display_open_job_positions").length,
    ).toBeGreaterThan(0);
  });

  it("falls back when positions list is empty", () => {
    render(
      <DisplayOpenJobPositionsCard invocation={inv({ positions: [] })} />,
    );
    expect(
      screen.getAllByText("display_open_job_positions").length,
    ).toBeGreaterThan(0);
  });

  it("renders only available meta fields without orphan separators", () => {
    render(
      <DisplayOpenJobPositionsCard
        invocation={inv({
          positions: [
            { title: "Designer", location: "Remote" },
            { title: "Coordinator", department: "HR", type: "Contract" },
          ],
        })}
      />,
    );
    expect(screen.getByText("Remote")).toBeInTheDocument();
    expect(screen.getByText("HR · Contract")).toBeInTheDocument();
    // No leading or doubled separator
    expect(screen.queryByText(/^ · /)).toBeNull();
    expect(screen.queryByText(/ ·  · /)).toBeNull();
  });

  it("omits the meta line entirely when no department/location/type", () => {
    const { container } = render(
      <DisplayOpenJobPositionsCard
        invocation={inv({ positions: [{ title: "Lone Role" }] })}
      />,
    );
    expect(screen.getByText("Lone Role")).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/undefined/);
  });

  it("skips malformed items and warns once in dev", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <DisplayOpenJobPositionsCard
        invocation={inv({
          positions: [
            { title: "Valid Role" },
            "garbage" as unknown,
            { /* no title */ department: "Sales" },
          ],
        })}
      />,
    );
    expect(screen.getByText("Valid Role")).toBeInTheDocument();
    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockRestore();
  });
});
