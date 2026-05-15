import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BookingCreateCard } from "./BookingCreateCard";
import type { ToolInvocation } from "@shared/agent";

function inv(
  response: unknown,
  overrides: Partial<ToolInvocation> = {},
): ToolInvocation {
  return {
    id: "id-1",
    name: "booking_create",
    arguments: {},
    response,
    status: "complete",
    ...overrides,
  };
}

const sampleBooking = {
  title: "Bridal Trial",
  customer_name: "Sara Ali",
  expert_name: "Amira Khan",
  start_time: "2026-06-01T10:00:00Z",
  end_time: "2026-06-01T11:30:00Z",
};

describe("BookingCreateCard — happy path", () => {
  it("renders a loading pill when status is loading", () => {
    render(
      <BookingCreateCard invocation={inv(undefined, { status: "loading" })} />,
    );
    expect(screen.getByText(/Using booking_create…/)).toBeInTheDocument();
  });

  it("accepts the response as a parsed object", () => {
    render(<BookingCreateCard invocation={inv(sampleBooking)} />);
    expect(screen.getByText("Booking confirmed")).toBeInTheDocument();
    expect(screen.getByText("Confirmation")).toBeInTheDocument();
    expect(screen.getByText("Amira Khan")).toBeInTheDocument();
    expect(screen.getByText("Sara Ali")).toBeInTheDocument();
  });

  it("accepts the response as a JSON string", () => {
    render(<BookingCreateCard invocation={inv(JSON.stringify(sampleBooking))} />);
    expect(screen.getByText("Amira Khan")).toBeInTheDocument();
  });

  it("formats ISO times via toLocaleString", () => {
    render(<BookingCreateCard invocation={inv(sampleBooking)} />);
    const expectedStart = new Date(sampleBooking.start_time).toLocaleString();
    expect(screen.getByText(expectedStart)).toBeInTheDocument();
  });

  it("renders raw string when start_time is not parseable", () => {
    render(
      <BookingCreateCard
        invocation={inv({
          expert_name: "Lina",
          customer_name: "Sara",
          start_time: "not-a-date",
        })}
      />,
    );
    expect(screen.getByText("not-a-date")).toBeInTheDocument();
  });

  it("extracts from .booking wrapper", () => {
    render(
      <BookingCreateCard
        invocation={inv({ success: true, booking: sampleBooking })}
      />,
    );
    expect(screen.getByText("Amira Khan")).toBeInTheDocument();
  });

  it("extracts from .result wrapper", () => {
    render(
      <BookingCreateCard invocation={inv({ result: sampleBooking })} />,
    );
    expect(screen.getByText("Amira Khan")).toBeInTheDocument();
  });
});

describe("BookingCreateCard — defensive", () => {
  it("falls back to ThemedGenericCard when response is undefined", () => {
    render(<BookingCreateCard invocation={inv(undefined)} />);
    expect(screen.getAllByText("booking_create").length).toBeGreaterThan(0);
  });

  it("falls back when response is a malformed JSON string", () => {
    render(<BookingCreateCard invocation={inv("not json {{{")} />);
    expect(screen.getAllByText("booking_create").length).toBeGreaterThan(0);
  });

  it("falls back when response is the wrong shape (string)", () => {
    render(<BookingCreateCard invocation={inv(42 as unknown)} />);
    expect(screen.getAllByText("booking_create").length).toBeGreaterThan(0);
  });

  it("falls back when none of the recognized fields are present", () => {
    render(
      <BookingCreateCard invocation={inv({ random: "value", count: 3 })} />,
    );
    expect(screen.getAllByText("booking_create").length).toBeGreaterThan(0);
  });
});
