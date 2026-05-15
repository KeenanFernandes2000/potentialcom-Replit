import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BookingGetAvailabilityCard } from "./BookingGetAvailabilityCard";
import type { ToolInvocation } from "@shared/agent";

function inv(
  response: unknown,
  overrides: Partial<ToolInvocation> = {},
): ToolInvocation {
  return {
    id: "id-1",
    name: "booking_get_availability",
    arguments: {},
    response,
    status: "complete",
    ...overrides,
  };
}

const flatResponse = {
  slots: [
    { start_time: "2026-06-01T10:00:00Z", expert_name: "Amira" },
    { start_time: "2026-06-01T14:00:00Z", expert_name: "Lina" },
  ],
};

const groupedResponse = {
  days: [
    {
      date: "2026-06-01",
      slots: [
        { start_time: "2026-06-01T09:00:00Z" },
        { start_time: "2026-06-01T11:00:00Z" },
      ],
    },
  ],
};

describe("BookingGetAvailabilityCard — happy path", () => {
  it("renders a loading pill when status is loading", () => {
    render(
      <BookingGetAvailabilityCard
        invocation={inv(undefined, { status: "loading" })}
      />,
    );
    expect(
      screen.getByText(/Using booking_get_availability…/),
    ).toBeInTheDocument();
  });

  it("renders header with slot count from a flat `slots` array", () => {
    render(<BookingGetAvailabilityCard invocation={inv(flatResponse)} />);
    expect(screen.getByText("Available slots")).toBeInTheDocument();
    expect(screen.getByText("2 slots")).toBeInTheDocument();
  });

  it("accepts response as JSON string with .days grouping", () => {
    render(
      <BookingGetAvailabilityCard
        invocation={inv(JSON.stringify(groupedResponse))}
      />,
    );
    expect(screen.getByText("2 slots")).toBeInTheDocument();
  });

  it("renders formatted start times", () => {
    render(<BookingGetAvailabilityCard invocation={inv(flatResponse)} />);
    const expected = new Date(
      flatResponse.slots[0].start_time,
    ).toLocaleString();
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it("accepts response under `availability` key as a fallback", () => {
    render(
      <BookingGetAvailabilityCard
        invocation={inv({
          availability: [{ start_time: "2026-06-01T10:00:00Z" }],
        })}
      />,
    );
    expect(screen.getByText("1 slots")).toBeInTheDocument();
  });
});

describe("BookingGetAvailabilityCard — defensive", () => {
  it("falls back to ThemedGenericCard when response is undefined", () => {
    render(<BookingGetAvailabilityCard invocation={inv(undefined)} />);
    expect(
      screen.getAllByText("booking_get_availability").length,
    ).toBeGreaterThan(0);
  });

  it("falls back when response is malformed JSON", () => {
    render(<BookingGetAvailabilityCard invocation={inv("not json {{{")} />);
    expect(
      screen.getAllByText("booking_get_availability").length,
    ).toBeGreaterThan(0);
  });

  it("falls back when no slot-like keys are found", () => {
    render(
      <BookingGetAvailabilityCard invocation={inv({ random: "value" })} />,
    );
    expect(
      screen.getAllByText("booking_get_availability").length,
    ).toBeGreaterThan(0);
  });

  it("falls back when slots is empty", () => {
    render(<BookingGetAvailabilityCard invocation={inv({ slots: [] })} />);
    expect(
      screen.getAllByText("booking_get_availability").length,
    ).toBeGreaterThan(0);
  });
});
