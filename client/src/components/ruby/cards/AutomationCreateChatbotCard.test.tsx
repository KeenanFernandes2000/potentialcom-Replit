import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AutomationCreateChatbotCard } from "./AutomationCreateChatbotCard";
import type { ToolInvocation } from "@shared/agent";

function inv(
  response: unknown,
  overrides: Partial<ToolInvocation> = {},
): ToolInvocation {
  return {
    id: "id-1",
    name: "automation_create_chatbot",
    arguments: {},
    response,
    status: "complete",
    ...overrides,
  };
}

const sampleBot = {
  name: "Salon Bot",
  botId: "bot_abc123",
  email: "user@example.com",
  url: "https://chat.example/bot_abc123",
};

describe("AutomationCreateChatbotCard — happy path", () => {
  it("renders a loading pill when status is loading", () => {
    render(
      <AutomationCreateChatbotCard
        invocation={inv(undefined, { status: "loading" })}
      />,
    );
    expect(
      screen.getByText(/Using automation_create_chatbot…/),
    ).toBeInTheDocument();
  });

  it("renders the header and key/value rows", () => {
    render(<AutomationCreateChatbotCard invocation={inv(sampleBot)} />);
    expect(screen.getByText("Chatbot created")).toBeInTheDocument();
    expect(screen.getByText("Created")).toBeInTheDocument();
    expect(screen.getByText("Salon Bot")).toBeInTheDocument();
    expect(screen.getByText("bot_abc123")).toBeInTheDocument();
  });

  it("accepts the response as a JSON string", () => {
    render(
      <AutomationCreateChatbotCard
        invocation={inv(JSON.stringify(sampleBot))}
      />,
    );
    expect(screen.getByText("Salon Bot")).toBeInTheDocument();
  });

  it("falls back to id when botId is missing", () => {
    render(
      <AutomationCreateChatbotCard
        invocation={inv({ name: "Bot", id: "fallback" })}
      />,
    );
    expect(screen.getByText("fallback")).toBeInTheDocument();
  });
});

describe("AutomationCreateChatbotCard — defensive", () => {
  it("falls back to ThemedGenericCard when response is undefined", () => {
    render(<AutomationCreateChatbotCard invocation={inv(undefined)} />);
    expect(
      screen.getAllByText("automation_create_chatbot").length,
    ).toBeGreaterThan(0);
  });

  it("falls back when response is malformed JSON", () => {
    render(<AutomationCreateChatbotCard invocation={inv("not json {{{")} />);
    expect(
      screen.getAllByText("automation_create_chatbot").length,
    ).toBeGreaterThan(0);
  });

  it("falls back when response is the wrong shape", () => {
    render(<AutomationCreateChatbotCard invocation={inv(42 as unknown)} />);
    expect(
      screen.getAllByText("automation_create_chatbot").length,
    ).toBeGreaterThan(0);
  });

  it("falls back when no recognizable fields exist", () => {
    render(
      <AutomationCreateChatbotCard invocation={inv({ unrelated: true })} />,
    );
    expect(
      screen.getAllByText("automation_create_chatbot").length,
    ).toBeGreaterThan(0);
  });
});
