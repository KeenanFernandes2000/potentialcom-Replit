import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GetDiscountCodesCard } from "./GetDiscountCodesCard";
import type { ToolInvocation } from "@shared/agent";

function inv(
  response: unknown,
  overrides: Partial<ToolInvocation> = {},
): ToolInvocation {
  return {
    id: "id-1",
    name: "get_discount_codes",
    arguments: {},
    response,
    status: "complete",
    ...overrides,
  };
}

const sampleResponse = {
  success: true,
  codes: [
    {
      code: "WELCOME10",
      value: "10%",
      type: "off",
      description: "New customer discount",
      expires_at: "2026-12-31",
    },
    {
      code: "FREESHIP",
      value: "Free",
      type: "shipping",
    },
  ],
};

describe("GetDiscountCodesCard — happy path", () => {
  it("renders a loading pill when status is loading", () => {
    render(
      <GetDiscountCodesCard
        invocation={inv(undefined, { status: "loading" })}
      />,
    );
    expect(
      screen.getByText(/Using get_discount_codes…/),
    ).toBeInTheDocument();
  });

  it("renders header and codes from `codes` key", () => {
    render(<GetDiscountCodesCard invocation={inv(sampleResponse)} />);
    expect(screen.getByText("Active discount codes")).toBeInTheDocument();
    expect(screen.getByText("2 active")).toBeInTheDocument();
    expect(screen.getByText("WELCOME10")).toBeInTheDocument();
    expect(screen.getByText("FREESHIP")).toBeInTheDocument();
    expect(screen.getByText("10% off")).toBeInTheDocument();
    expect(screen.getByText("New customer discount")).toBeInTheDocument();
  });

  it("accepts response as JSON string", () => {
    render(
      <GetDiscountCodesCard invocation={inv(JSON.stringify(sampleResponse))} />,
    );
    expect(screen.getByText("WELCOME10")).toBeInTheDocument();
  });

  it("falls through to the `discounts` key when `codes` is absent", () => {
    render(
      <GetDiscountCodesCard
        invocation={inv({ discounts: [{ code: "DISC1", value: "5%" }] })}
      />,
    );
    expect(screen.getByText("DISC1")).toBeInTheDocument();
  });
});

describe("GetDiscountCodesCard — defensive", () => {
  it("falls back to ThemedGenericCard when response is undefined", () => {
    render(<GetDiscountCodesCard invocation={inv(undefined)} />);
    expect(
      screen.getAllByText("get_discount_codes").length,
    ).toBeGreaterThan(0);
  });

  it("falls back when response is malformed JSON", () => {
    render(<GetDiscountCodesCard invocation={inv("not json {{{")} />);
    expect(
      screen.getAllByText("get_discount_codes").length,
    ).toBeGreaterThan(0);
  });

  it("falls back when neither codes nor discounts is present", () => {
    render(
      <GetDiscountCodesCard invocation={inv({ success: true, count: 0 })} />,
    );
    expect(
      screen.getAllByText("get_discount_codes").length,
    ).toBeGreaterThan(0);
  });

  it("falls back when codes is empty", () => {
    render(<GetDiscountCodesCard invocation={inv({ codes: [] })} />);
    expect(
      screen.getAllByText("get_discount_codes").length,
    ).toBeGreaterThan(0);
  });

  it("omits description and expires_at when missing", () => {
    const { container } = render(
      <GetDiscountCodesCard
        invocation={inv({ codes: [{ code: "BAREMIN" }] })}
      />,
    );
    expect(screen.getByText("BAREMIN")).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/undefined/);
    expect(container.textContent).not.toMatch(/Expires undefined/);
  });
});
