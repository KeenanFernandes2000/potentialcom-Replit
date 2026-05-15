import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DisplayPersonilizedProductsCard } from "./DisplayPersonilizedProductsCard";
import type { ToolInvocation } from "@shared/agent";

function inv(
  response: unknown,
  overrides: Partial<ToolInvocation> = {},
): ToolInvocation {
  return {
    id: "id-1",
    name: "display_personilized_products",
    arguments: {},
    response,
    status: "complete",
    ...overrides,
  };
}

const sampleProducts = [
  {
    id: "p1",
    name: "Hydrating Foundation",
    brand: "Ruby Red",
    price: "$32",
    image: "https://cdn.example/found.jpg",
    url: "https://alorabrands.com/found",
  },
  {
    id: "p2",
    title: "Coral Blush",
    brand: "Sephora",
    price: "$18",
    image: "https://cdn.example/blush.jpg",
    url: "https://alorabrands.com/blush",
  },
];

describe("DisplayPersonilizedProductsCard — happy path", () => {
  it("renders a loading pill when status is loading", () => {
    render(
      <DisplayPersonilizedProductsCard
        invocation={inv(undefined, { status: "loading" })}
      />,
    );
    expect(
      screen.getByText(/Using display_personilized_products…/),
    ).toBeInTheDocument();
  });

  it("renders the header and product count pill", () => {
    render(
      <DisplayPersonilizedProductsCard
        invocation={inv({ products: sampleProducts })}
      />,
    );
    expect(
      screen.getByText("Personalized picks based on your photo"),
    ).toBeInTheDocument();
    expect(screen.getByText("2 picks")).toBeInTheDocument();
  });

  it("accepts response as JSON string with .result wrapper", () => {
    render(
      <DisplayPersonilizedProductsCard
        invocation={inv(JSON.stringify({ result: { products: sampleProducts } }))}
      />,
    );
    expect(screen.getByText("Hydrating Foundation")).toBeInTheDocument();
  });

  it("renders each product's name (or title) with brand and price", () => {
    render(
      <DisplayPersonilizedProductsCard
        invocation={inv({ products: sampleProducts })}
      />,
    );
    expect(screen.getByText("Hydrating Foundation")).toBeInTheDocument();
    expect(screen.getByText("Coral Blush")).toBeInTheDocument();
    expect(screen.getByText(/Ruby Red · \$32/)).toBeInTheDocument();
    expect(screen.getByText(/Sephora · \$18/)).toBeInTheDocument();
  });

  it("renders a CTA per product with url", () => {
    render(
      <DisplayPersonilizedProductsCard
        invocation={inv({ products: sampleProducts })}
      />,
    );
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
  });
});

describe("DisplayPersonilizedProductsCard — defensive", () => {
  it("falls back to ThemedGenericCard when response is undefined", () => {
    render(<DisplayPersonilizedProductsCard invocation={inv(undefined)} />);
    expect(
      screen.getAllByText("display_personilized_products").length,
    ).toBeGreaterThan(0);
  });

  it("falls back when response is malformed JSON", () => {
    render(
      <DisplayPersonilizedProductsCard invocation={inv("not json {{{")} />,
    );
    expect(
      screen.getAllByText("display_personilized_products").length,
    ).toBeGreaterThan(0);
  });

  it("falls back when response has no products key", () => {
    render(
      <DisplayPersonilizedProductsCard invocation={inv({ unrelated: 1 })} />,
    );
    expect(
      screen.getAllByText("display_personilized_products").length,
    ).toBeGreaterThan(0);
  });

  it("falls back when products is empty", () => {
    render(
      <DisplayPersonilizedProductsCard invocation={inv({ products: [] })} />,
    );
    expect(
      screen.getAllByText("display_personilized_products").length,
    ).toBeGreaterThan(0);
  });

  it("omits CTA when no url is present", () => {
    render(
      <DisplayPersonilizedProductsCard
        invocation={inv({ products: [{ name: "Plain", price: "$5" }] })}
      />,
    );
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("Plain")).toBeInTheDocument();
  });

  it("omits brand prefix when brand is missing", () => {
    render(
      <DisplayPersonilizedProductsCard
        invocation={inv({ products: [{ name: "Solo", price: "$9" }] })}
      />,
    );
    expect(screen.getByText("$9")).toBeInTheDocument();
    expect(screen.queryByText(/^ · /)).toBeNull();
  });
});
