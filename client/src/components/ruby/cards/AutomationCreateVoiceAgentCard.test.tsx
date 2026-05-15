import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AutomationCreateVoiceAgentCard } from "./AutomationCreateVoiceAgentCard";
import type { ToolInvocation } from "@shared/agent";

function inv(
  response: unknown,
  overrides: Partial<ToolInvocation> = {},
): ToolInvocation {
  return {
    id: "id-1",
    name: "automation_create_voice_agent",
    arguments: {},
    response,
    status: "complete",
    ...overrides,
  };
}

const sampleAgent = {
  name: "Booking Bot",
  assistantId: "vapi_abc123",
  email: "user@example.com",
  message: "Your voice agent is live.",
};

describe("AutomationCreateVoiceAgentCard — happy path", () => {
  it("renders a loading pill when status is loading", () => {
    render(
      <AutomationCreateVoiceAgentCard
        invocation={inv(undefined, { status: "loading" })}
      />,
    );
    expect(
      screen.getByText(/Using automation_create_voice_agent…/),
    ).toBeInTheDocument();
  });

  it("renders the header and key/value rows", () => {
    render(<AutomationCreateVoiceAgentCard invocation={inv(sampleAgent)} />);
    expect(screen.getByText("Voice agent created")).toBeInTheDocument();
    expect(screen.getByText("Created")).toBeInTheDocument();
    expect(screen.getByText("Booking Bot")).toBeInTheDocument();
    expect(screen.getByText("vapi_abc123")).toBeInTheDocument();
    expect(screen.getByText("user@example.com")).toBeInTheDocument();
    expect(screen.getByText("Your voice agent is live.")).toBeInTheDocument();
  });

  it("accepts response as a JSON string", () => {
    render(
      <AutomationCreateVoiceAgentCard
        invocation={inv(JSON.stringify(sampleAgent))}
      />,
    );
    expect(screen.getByText("Booking Bot")).toBeInTheDocument();
  });

  it("falls back to `id` when `assistantId` is missing", () => {
    render(
      <AutomationCreateVoiceAgentCard
        invocation={inv({ name: "Bot", id: "fallback_id" })}
      />,
    );
    expect(screen.getByText("fallback_id")).toBeInTheDocument();
  });

  it("extracts data from .result wrapper", () => {
    render(
      <AutomationCreateVoiceAgentCard
        invocation={inv({ result: sampleAgent })}
      />,
    );
    expect(screen.getByText("Booking Bot")).toBeInTheDocument();
  });
});

describe("AutomationCreateVoiceAgentCard — defensive", () => {
  it("falls back to ThemedGenericCard when response is undefined", () => {
    render(<AutomationCreateVoiceAgentCard invocation={inv(undefined)} />);
    expect(
      screen.getAllByText("automation_create_voice_agent").length,
    ).toBeGreaterThan(0);
  });

  it("falls back when response is malformed JSON", () => {
    render(<AutomationCreateVoiceAgentCard invocation={inv("not json {{{")} />);
    expect(
      screen.getAllByText("automation_create_voice_agent").length,
    ).toBeGreaterThan(0);
  });

  it("falls back when response is the wrong shape", () => {
    render(<AutomationCreateVoiceAgentCard invocation={inv(42 as unknown)} />);
    expect(
      screen.getAllByText("automation_create_voice_agent").length,
    ).toBeGreaterThan(0);
  });

  it("falls back when no recognizable fields exist", () => {
    render(
      <AutomationCreateVoiceAgentCard invocation={inv({ unrelated: true })} />,
    );
    expect(
      screen.getAllByText("automation_create_voice_agent").length,
    ).toBeGreaterThan(0);
  });
});
