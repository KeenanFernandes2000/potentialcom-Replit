import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DisplayMakeupCoursesCard } from "./DisplayMakeupCoursesCard";
import type { ToolInvocation } from "@shared/agent";

function inv(
  args: unknown,
  overrides: Partial<ToolInvocation> = {},
): ToolInvocation {
  return {
    id: "id-1",
    name: "display_makeup_courses",
    arguments: args,
    response: undefined,
    status: "complete",
    ...overrides,
  };
}

const sampleCourses = [
  {
    course: "Bridal Makeup Mastery",
    level: "Intermediate",
    duration: "6 weeks",
    topics: "Foundation, contouring, lashes",
  },
  {
    course: "Skincare Essentials",
    level: "Beginner",
    duration: "4 weeks",
    topics: "Cleansing, exfoliation, moisturizing",
  },
];

describe("DisplayMakeupCoursesCard — happy path", () => {
  it("renders a loading pill when status is loading", () => {
    render(
      <DisplayMakeupCoursesCard
        invocation={inv({}, { status: "loading" })}
      />,
    );
    expect(
      screen.getByText(/Using display_makeup_courses…/),
    ).toBeInTheDocument();
  });

  it("renders the header title and course count pill", () => {
    render(
      <DisplayMakeupCoursesCard invocation={inv({ courses: sampleCourses })} />,
    );
    expect(screen.getByText("Makeup & skincare courses")).toBeInTheDocument();
    expect(screen.getByText("2 courses")).toBeInTheDocument();
  });

  it("renders course titles, level · duration, and topics", () => {
    render(
      <DisplayMakeupCoursesCard invocation={inv({ courses: sampleCourses })} />,
    );
    expect(screen.getByText("Bridal Makeup Mastery")).toBeInTheDocument();
    expect(screen.getByText("Skincare Essentials")).toBeInTheDocument();
    expect(screen.getByText("Intermediate · 6 weeks")).toBeInTheDocument();
    expect(screen.getByText("Beginner · 4 weeks")).toBeInTheDocument();
    expect(
      screen.getByText("Foundation, contouring, lashes"),
    ).toBeInTheDocument();
  });
});

describe("DisplayMakeupCoursesCard — defensive", () => {
  it("falls back to ThemedGenericCard when arguments is undefined", () => {
    render(<DisplayMakeupCoursesCard invocation={inv(undefined)} />);
    expect(
      screen.getAllByText("display_makeup_courses").length,
    ).toBeGreaterThan(0);
  });

  it("falls back when arguments is not an object", () => {
    render(<DisplayMakeupCoursesCard invocation={inv("bad")} />);
    expect(
      screen.getAllByText("display_makeup_courses").length,
    ).toBeGreaterThan(0);
  });

  it("falls back when courses list is empty", () => {
    render(<DisplayMakeupCoursesCard invocation={inv({ courses: [] })} />);
    expect(
      screen.getAllByText("display_makeup_courses").length,
    ).toBeGreaterThan(0);
  });

  it("omits level when missing without a leading separator", () => {
    render(
      <DisplayMakeupCoursesCard
        invocation={inv({
          courses: [{ course: "Solo Course", duration: "2 weeks" }],
        })}
      />,
    );
    // Just duration with no leading "·"
    expect(screen.getByText("2 weeks")).toBeInTheDocument();
    expect(screen.queryByText(/· 2 weeks/)).toBeNull();
  });

  it("omits duration when missing without a trailing separator", () => {
    render(
      <DisplayMakeupCoursesCard
        invocation={inv({
          courses: [{ course: "Solo Course", level: "Advanced" }],
        })}
      />,
    );
    expect(screen.getByText("Advanced")).toBeInTheDocument();
    expect(screen.queryByText(/Advanced ·/)).toBeNull();
  });

  it("omits the meta line entirely when both level and duration are missing", () => {
    const { container } = render(
      <DisplayMakeupCoursesCard
        invocation={inv({
          courses: [{ course: "Bare Course" }],
        })}
      />,
    );
    expect(screen.getByText("Bare Course")).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/undefined/);
  });

  it("skips malformed items and warns once in dev", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <DisplayMakeupCoursesCard
        invocation={inv({
          courses: [
            { course: "OK Course" },
            "garbage" as unknown,
            { /* no course */ level: "Beginner" },
          ],
        })}
      />,
    );
    expect(screen.getByText("OK Course")).toBeInTheDocument();
    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockRestore();
  });
});
