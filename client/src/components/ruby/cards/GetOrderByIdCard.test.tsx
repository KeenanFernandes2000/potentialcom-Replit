import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GetOrderByIdCard } from "./GetOrderByIdCard";
import type { ToolInvocation } from "@shared/agent";

function inv(
  response: unknown,
  overrides: Partial<ToolInvocation> = {},
): ToolInvocation {
  return {
    id: "id-1",
    name: "get_order_by_id",
    arguments: {},
    response,
    status: "complete",
    ...overrides,
  };
}

const sampleOrder = {
  order: {
    id: "gid://shopify/Order/1001",
    orderNumber: "1001",
    status: "fulfilled",
    financial_status: "paid",
    fulfillment_status: "delivered",
    total_price: "120.00",
    currency: "USD",
    line_items: [
      { title: "Velvet Lipstick", quantity: 2, price: "24.00" },
      { title: "Foundation", quantity: 1, price: "72.00" },
    ],
  },
};

describe("GetOrderByIdCard — happy path", () => {
  it("renders a loading pill when status is loading", () => {
    render(
      <GetOrderByIdCard invocation={inv(undefined, { status: "loading" })} />,
    );
    expect(screen.getByText(/Using get_order_by_id…/)).toBeInTheDocument();
  });

  it("renders the order header with orderNumber and status pill", () => {
    render(<GetOrderByIdCard invocation={inv(sampleOrder)} />);
    expect(screen.getByText("Order #1001")).toBeInTheDocument();
    expect(screen.getByText("fulfilled")).toBeInTheDocument();
  });

  it("renders financial status, fulfillment status, and total", () => {
    render(<GetOrderByIdCard invocation={inv(sampleOrder)} />);
    expect(screen.getByText("paid")).toBeInTheDocument();
    expect(screen.getByText("delivered")).toBeInTheDocument();
    expect(screen.getByText("120.00 USD")).toBeInTheDocument();
  });

  it("renders line items with title and quantity", () => {
    render(<GetOrderByIdCard invocation={inv(sampleOrder)} />);
    expect(screen.getByText("Velvet Lipstick × 2")).toBeInTheDocument();
    expect(screen.getByText("Foundation")).toBeInTheDocument();
  });

  it("accepts response as JSON string", () => {
    render(<GetOrderByIdCard invocation={inv(JSON.stringify(sampleOrder))} />);
    expect(screen.getByText("Order #1001")).toBeInTheDocument();
  });

  it("extracts from root level when no .order wrapper", () => {
    render(
      <GetOrderByIdCard
        invocation={inv({ orderNumber: "555", status: "open" })}
      />,
    );
    expect(screen.getByText("Order #555")).toBeInTheDocument();
  });
});

describe("GetOrderByIdCard — defensive", () => {
  it("falls back to ThemedGenericCard when response is undefined", () => {
    render(<GetOrderByIdCard invocation={inv(undefined)} />);
    expect(screen.getAllByText("get_order_by_id").length).toBeGreaterThan(0);
  });

  it("falls back when response is malformed JSON", () => {
    render(<GetOrderByIdCard invocation={inv("not json {{{")} />);
    expect(screen.getAllByText("get_order_by_id").length).toBeGreaterThan(0);
  });

  it("falls back when response has no order-like fields", () => {
    render(<GetOrderByIdCard invocation={inv({ irrelevant: 1 })} />);
    expect(screen.getAllByText("get_order_by_id").length).toBeGreaterThan(0);
  });

  it("omits items section when line_items is empty", () => {
    const { container } = render(
      <GetOrderByIdCard
        invocation={inv({ order: { orderNumber: "12", line_items: [] } })}
      />,
    );
    expect(screen.getByText("Order #12")).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/Items/);
  });
});
