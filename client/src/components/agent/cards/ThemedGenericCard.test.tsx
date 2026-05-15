import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemedGenericCard } from "./ThemedGenericCard";
import type { ToolInvocation } from "@shared/agent";

function inv(overrides: Partial<ToolInvocation> = {}): ToolInvocation {
  return {
    id: "id-1",
    name: "answer_faqs",
    arguments: undefined,
    response: undefined,
    status: "complete",
    ...overrides,
  };
}

describe("ThemedGenericCard — loading & empty", () => {
  it("renders the ToolLoadingPill while loading", () => {
    render(<ThemedGenericCard invocation={inv({ status: "loading" })} />);
    expect(screen.getByText(/Using answer_faqs…/)).toBeInTheDocument();
  });

  it("renders '(no response)' when complete with neither response nor arguments", () => {
    render(<ThemedGenericCard invocation={inv()} />);
    expect(screen.getByText("(no response)")).toBeInTheDocument();
  });

  it("renders the tool name as a pill in the header on the complete branch", () => {
    render(<ThemedGenericCard invocation={inv({ name: "explain_culture" })} />);
    // CardHeader renders the name twice (title + pill), so use getAllByText.
    expect(screen.getAllByText("explain_culture").length).toBeGreaterThan(0);
  });

  it("includes the 'Raw response' details affordance on the complete branch", () => {
    render(<ThemedGenericCard invocation={inv({ response: "hi" })} />);
    expect(screen.getByText(/Raw response/)).toBeInTheDocument();
  });

  it("prefers response over arguments when both exist", () => {
    render(
      <ThemedGenericCard
        invocation={inv({ response: "from-response", arguments: "from-args" })}
      />,
    );
    // The raw-response <pre> also contains the full JSON, so exclude any
    // element inside a <pre> to scope to the visible payload.
    const visibleMatches = screen
      .getAllByText(/from-response/)
      .filter((el) => el.closest("pre") === null);
    expect(visibleMatches.length).toBeGreaterThan(0);
    const visibleArgs = screen
      .queryAllByText(/from-args/)
      .filter((el) => el.closest("pre") === null);
    expect(visibleArgs).toHaveLength(0);
  });

  it("falls back to arguments when response is undefined", () => {
    render(
      <ThemedGenericCard invocation={inv({ arguments: "from-args" })} />,
    );
    // Scope to the visible payload, ignoring the raw-response <pre>.
    const visibleMatches = screen
      .getAllByText(/from-args/)
      .filter((el) => el.closest("pre") === null);
    expect(visibleMatches.length).toBeGreaterThan(0);
  });
});

describe("ThemedGenericCard — string & text-field rules", () => {
  it("renders a string payload as markdown", () => {
    render(<ThemedGenericCard invocation={inv({ response: "**bold**" })} />);
    expect(screen.getByText("bold").tagName).toBe("STRONG");
  });

  it("renders object.summary as markdown when present", () => {
    render(
      <ThemedGenericCard
        invocation={inv({ response: { summary: "**hello**", extra: 1 } })}
      />,
    );
    expect(screen.getByText("hello").tagName).toBe("STRONG");
  });

  it("renders object.text as markdown when summary is absent", () => {
    render(
      <ThemedGenericCard
        invocation={inv({ response: { text: "**hi**" } })}
      />,
    );
    expect(screen.getByText("hi").tagName).toBe("STRONG");
  });

  it("renders object.content as markdown when summary & text are absent", () => {
    render(
      <ThemedGenericCard
        invocation={inv({ response: { content: "**ok**" } })}
      />,
    );
    expect(screen.getByText("ok").tagName).toBe("STRONG");
  });
});

describe("ThemedGenericCard — array rule", () => {
  it("renders one <details> per array entry (plus the Raw response details)", () => {
    const { container } = render(
      <ThemedGenericCard
        invocation={inv({ response: ["alpha", "beta", "gamma"] })}
      />,
    );
    // 3 entries + 1 'Raw response' details
    expect(container.querySelectorAll("details")).toHaveLength(4);
  });

  it("renders Q&A style when entries have question/answer", () => {
    render(
      <ThemedGenericCard
        invocation={inv({
          response: [
            { question: "What is X?", answer: "It is X." },
            { question: "What is Y?", answer: "It is Y." },
          ],
        })}
      />,
    );
    expect(screen.getByText("What is X?")).toBeInTheDocument();
    expect(screen.getByText("It is X.")).toBeInTheDocument();
    expect(screen.getByText("What is Y?")).toBeInTheDocument();
  });

  it("renders non-QA array entries as 'Item N' accordions with JSON body", () => {
    render(
      <ThemedGenericCard
        invocation={inv({ response: [{ foo: "bar" }] })}
      />,
    );
    // "Item 1" is unique to renderArrayEntry's non-QA branch.
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    // The JSON body appears at least twice: once in the accordion, once in the Raw response pre.
    expect(screen.getAllByText(/"foo": "bar"/).length).toBeGreaterThanOrEqual(2);
  });

  it("handles an empty array gracefully", () => {
    render(<ThemedGenericCard invocation={inv({ response: [] })} />);
    expect(screen.getByText(/\(empty list\)/)).toBeInTheDocument();
  });
});

describe("ThemedGenericCard — object key/value rule", () => {
  it("renders a 2-column table for plain object payloads", () => {
    render(
      <ThemedGenericCard
        invocation={inv({ response: { color: "red", size: "M" } })}
      />,
    );
    expect(screen.getByText("color")).toBeInTheDocument();
    expect(screen.getByText("red")).toBeInTheDocument();
    expect(screen.getByText("size")).toBeInTheDocument();
    expect(screen.getByText("M")).toBeInTheDocument();
  });

  it("truncates string values longer than 200 chars behind a 'Show more' toggle", () => {
    const longValue = "x".repeat(250);
    render(
      <ThemedGenericCard
        invocation={inv({ response: { description: longValue } })}
      />,
    );
    expect(screen.queryByText(longValue)).toBeNull();
    expect(screen.getByText(/Show more/)).toBeInTheDocument();
  });

  it("does not truncate values 200 chars or shorter", () => {
    const value = "x".repeat(200);
    render(
      <ThemedGenericCard
        invocation={inv({ response: { description: value } })}
      />,
    );
    expect(screen.getByText(value)).toBeInTheDocument();
    expect(screen.queryByText(/Show more/)).toBeNull();
  });

  it("stringifies nested objects/arrays as JSON inside the row", () => {
    render(
      <ThemedGenericCard
        invocation={inv({ response: { items: ["a", "b"] } })}
      />,
    );
    // Appears twice: once in the kv-row's JSON <pre>, once in the Raw response <pre>.
    expect(screen.getAllByText(/"a"/).length).toBeGreaterThanOrEqual(2);
  });
});
