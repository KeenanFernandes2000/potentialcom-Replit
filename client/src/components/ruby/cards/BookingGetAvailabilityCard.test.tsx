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

// Real n8n response shape (verified live).
const n8nResponse = {
  type: "booking_get_availability",
  status: "completed",
  result: {
    allOneHourAvailableSlots: [
      { start: "15/05/2026, 14:00", end: "15/05/2026, 15:00" },
      { start: "15/05/2026, 15:00", end: "15/05/2026, 16:00" },
      { start: "18/05/2026, 08:00", end: "18/05/2026, 09:00" },
    ],
  },
};

// Legacy / alternate shapes the extractor must still handle.
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

  it("renders the real n8n shape (result.allOneHourAvailableSlots, DD/MM/YYYY)", () => {
    render(<BookingGetAvailabilityCard invocation={inv(n8nResponse)} />);
    expect(screen.getByText("Available slots")).toBeInTheDocument();
    expect(screen.getByText("3 slots")).toBeInTheDocument();
    // Date group headers use the DD/MM/YYYY portion.
    expect(screen.getByText("15/05/2026")).toBeInTheDocument();
    expect(screen.getByText("18/05/2026")).toBeInTheDocument();
    // Each slot renders as "HH:MM – HH:MM".
    expect(screen.getByText("14:00 – 15:00")).toBeInTheDocument();
    expect(screen.getByText("15:00 – 16:00")).toBeInTheDocument();
    expect(screen.getByText("08:00 – 09:00")).toBeInTheDocument();
  });

  it("also accepts the response as a JSON-stringified n8n payload", () => {
    render(
      <BookingGetAvailabilityCard invocation={inv(JSON.stringify(n8nResponse))} />,
    );
    expect(screen.getByText("3 slots")).toBeInTheDocument();
    expect(screen.getByText("14:00 – 15:00")).toBeInTheDocument();
  });

  it("renders header with slot count from a flat `slots` array (legacy shape)", () => {
    render(<BookingGetAvailabilityCard invocation={inv(flatResponse)} />);
    expect(screen.getByText("Available slots")).toBeInTheDocument();
    expect(screen.getByText("2 slots")).toBeInTheDocument();
  });

  it("accepts response with `.days` pre-grouping (legacy shape)", () => {
    render(
      <BookingGetAvailabilityCard
        invocation={inv(JSON.stringify(groupedResponse))}
      />,
    );
    expect(screen.getByText("2 slots")).toBeInTheDocument();
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

  it("falls back when result.allOneHourAvailableSlots is empty", () => {
    render(
      <BookingGetAvailabilityCard
        invocation={inv({ result: { allOneHourAvailableSlots: [] } })}
      />,
    );
    expect(
      screen.getAllByText("booking_get_availability").length,
    ).toBeGreaterThan(0);
  });
});
