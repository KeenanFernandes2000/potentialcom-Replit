import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecommendNextLessonCard } from "./RecommendNextLessonCard";
import type { ToolInvocation } from "@shared/agent";

function inv(
  response: unknown,
  overrides: Partial<ToolInvocation> = {},
): ToolInvocation {
  return {
    id: "id-1",
    name: "recommend_next_lesson",
    arguments: {},
    response,
    status: "complete",
    ...overrides,
  };
}

const sampleLesson = {
  lesson: {
    title: "Contouring Fundamentals",
    course: "Bridal Mastery",
    duration: "30 min",
    description: "Learn light and shadow placement.",
    url: "https://learn.example/lesson/1",
  },
};

describe("RecommendNextLessonCard — happy path", () => {
  it("renders a loading pill when status is loading", () => {
    render(
      <RecommendNextLessonCard
        invocation={inv(undefined, { status: "loading" })}
      />,
    );
    expect(
      screen.getByText(/Using recommend_next_lesson…/),
    ).toBeInTheDocument();
  });

  it("renders title, course pill, meta line, description, and CTA", () => {
    render(<RecommendNextLessonCard invocation={inv(sampleLesson)} />);
    expect(screen.getByText("Next lesson")).toBeInTheDocument();
    expect(screen.getByText("Bridal Mastery")).toBeInTheDocument();
    expect(screen.getByText("Contouring Fundamentals")).toBeInTheDocument();
    expect(screen.getByText("Bridal Mastery · 30 min")).toBeInTheDocument();
    expect(
      screen.getByText("Learn light and shadow placement."),
    ).toBeInTheDocument();
    const link = screen.getByRole("link");
    expect((link as HTMLAnchorElement).href).toBe(
      "https://learn.example/lesson/1",
    );
  });

  it("accepts response as a JSON string", () => {
    render(
      <RecommendNextLessonCard invocation={inv(JSON.stringify(sampleLesson))} />,
    );
    expect(screen.getByText("Contouring Fundamentals")).toBeInTheDocument();
  });

  it("extracts top-level lesson without wrapper", () => {
    render(
      <RecommendNextLessonCard
        invocation={inv({ title: "Bare Lesson", duration: "15 min" })}
      />,
    );
    expect(screen.getByText("Bare Lesson")).toBeInTheDocument();
    expect(screen.getByText("15 min")).toBeInTheDocument();
  });

  it("uses 'Up next' pill when course is missing", () => {
    render(
      <RecommendNextLessonCard
        invocation={inv({ lesson: { title: "Lesson", duration: "10 min" } })}
      />,
    );
    expect(screen.getByText("Up next")).toBeInTheDocument();
  });
});

describe("RecommendNextLessonCard — defensive", () => {
  it("falls back to ThemedGenericCard when response is undefined", () => {
    render(<RecommendNextLessonCard invocation={inv(undefined)} />);
    expect(
      screen.getAllByText("recommend_next_lesson").length,
    ).toBeGreaterThan(0);
  });

  it("falls back when response is malformed JSON", () => {
    render(<RecommendNextLessonCard invocation={inv("not json {{{")} />);
    expect(
      screen.getAllByText("recommend_next_lesson").length,
    ).toBeGreaterThan(0);
  });

  it("falls back when no title is extractable", () => {
    render(<RecommendNextLessonCard invocation={inv({ unrelated: true })} />);
    expect(
      screen.getAllByText("recommend_next_lesson").length,
    ).toBeGreaterThan(0);
  });

  it("omits CTA when url is missing", () => {
    render(
      <RecommendNextLessonCard
        invocation={inv({ lesson: { title: "No Link Lesson" } })}
      />,
    );
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("No Link Lesson")).toBeInTheDocument();
  });

  it("omits meta line when both course and duration missing", () => {
    const { container } = render(
      <RecommendNextLessonCard
        invocation={inv({ lesson: { title: "Just Title" } })}
      />,
    );
    expect(container.textContent).not.toMatch(/undefined/);
  });
});
