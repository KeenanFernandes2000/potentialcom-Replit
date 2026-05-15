import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DisplayUserCourseProgressCard } from "./DisplayUserCourseProgressCard";
import type { ToolInvocation } from "@shared/agent";

function inv(
  response: unknown,
  overrides: Partial<ToolInvocation> = {},
): ToolInvocation {
  return {
    id: "id-1",
    name: "display_user_course_progress",
    arguments: {},
    response,
    status: "complete",
    ...overrides,
  };
}

const sampleResponse = {
  user_name: "Sara",
  courses: [
    { course: "Bridal Mastery", progress_pct: 75 },
    {
      course: "Skincare Basics",
      completed_lessons: 3,
      total_lessons: 12,
      status: "in progress",
    },
  ],
};

describe("DisplayUserCourseProgressCard — happy path", () => {
  it("renders a loading pill when status is loading", () => {
    render(
      <DisplayUserCourseProgressCard
        invocation={inv(undefined, { status: "loading" })}
      />,
    );
    expect(
      screen.getByText(/Using display_user_course_progress…/),
    ).toBeInTheDocument();
  });

  it("renders the user-specific title when user_name is present", () => {
    render(<DisplayUserCourseProgressCard invocation={inv(sampleResponse)} />);
    expect(screen.getByText("Course progress for Sara")).toBeInTheDocument();
    expect(screen.getByText("2 courses")).toBeInTheDocument();
  });

  it("renders a progress bar when progress_pct is a number", () => {
    render(<DisplayUserCourseProgressCard invocation={inv(sampleResponse)} />);
    const bars = screen.getAllByTestId("progress-bar");
    expect(bars.length).toBe(1);
    expect((bars[0] as HTMLElement).style.width).toBe("75%");
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("renders lessons text when progress_pct is absent", () => {
    render(<DisplayUserCourseProgressCard invocation={inv(sampleResponse)} />);
    expect(screen.getByText("3/12 lessons")).toBeInTheDocument();
  });

  it("renders status when provided", () => {
    render(<DisplayUserCourseProgressCard invocation={inv(sampleResponse)} />);
    expect(screen.getByText("in progress")).toBeInTheDocument();
  });

  it("accepts response as a JSON string", () => {
    render(
      <DisplayUserCourseProgressCard
        invocation={inv(JSON.stringify(sampleResponse))}
      />,
    );
    expect(screen.getByText("Bridal Mastery")).toBeInTheDocument();
  });

  it("clamps progress to 0..100", () => {
    render(
      <DisplayUserCourseProgressCard
        invocation={inv({
          courses: [
            { course: "Over", progress_pct: 150 },
            { course: "Under", progress_pct: -10 },
          ],
        })}
      />,
    );
    const bars = screen.getAllByTestId("progress-bar");
    expect((bars[0] as HTMLElement).style.width).toBe("100%");
    expect((bars[1] as HTMLElement).style.width).toBe("0%");
  });

  it("uses the generic title when user_name is missing", () => {
    render(
      <DisplayUserCourseProgressCard
        invocation={inv({ courses: [{ course: "Solo" }] })}
      />,
    );
    expect(screen.getByText("Course progress")).toBeInTheDocument();
  });
});

describe("DisplayUserCourseProgressCard — defensive", () => {
  it("falls back to ThemedGenericCard when response is undefined", () => {
    render(<DisplayUserCourseProgressCard invocation={inv(undefined)} />);
    expect(
      screen.getAllByText("display_user_course_progress").length,
    ).toBeGreaterThan(0);
  });

  it("falls back when response is malformed JSON", () => {
    render(<DisplayUserCourseProgressCard invocation={inv("not json {{{")} />);
    expect(
      screen.getAllByText("display_user_course_progress").length,
    ).toBeGreaterThan(0);
  });

  it("falls back when courses is missing", () => {
    render(<DisplayUserCourseProgressCard invocation={inv({ unrelated: true })} />);
    expect(
      screen.getAllByText("display_user_course_progress").length,
    ).toBeGreaterThan(0);
  });

  it("falls back when courses is empty", () => {
    render(<DisplayUserCourseProgressCard invocation={inv({ courses: [] })} />);
    expect(
      screen.getAllByText("display_user_course_progress").length,
    ).toBeGreaterThan(0);
  });
});
