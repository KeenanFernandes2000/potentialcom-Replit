import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DisplayMakeupProductsCard } from "./DisplayMakeupProductsCard";
import type { ToolInvocation } from "@shared/agent";

function inv(args: unknown, overrides: Partial<ToolInvocation> = {}): ToolInvocation {
  return {
    id: "id-1",
    name: "display_makeup_products",
    arguments: args,
    response: undefined,
    status: "complete",
    ...overrides,
  };
}

const sampleProducts = [
  {
    id: "p1",
    title: "Velvet Matte Lipstick",
    vendor: "Ruby Red",
    price: 24,
    image_url: "https://cdn.example/lip.jpg",
    product_url: "https://alorabrands.com/lip",
  },
  {
    id: "p2",
    title: "Hydrating Foundation",
    vendor: "Medium",
    price: "32",
    image_url: "https://cdn.example/found.jpg",
    product_url: "https://alorabrands.com/found",
  },
];

describe("DisplayMakeupProductsCard — happy path", () => {
  it("renders a loading pill when status is loading", () => {
    render(<DisplayMakeupProductsCard invocation={inv({}, { status: "loading" })} />);
    expect(screen.getByText(/Using display_makeup_products…/)).toBeInTheDocument();
  });

  it("renders each product's title and price", () => {
    render(
      <DisplayMakeupProductsCard
        invocation={inv({ products: sampleProducts })}
      />,
    );
    expect(screen.getByText("Velvet Matte Lipstick")).toBeInTheDocument();
    expect(screen.getByText("Hydrating Foundation")).toBeInTheDocument();
    expect(screen.getByText(/\$24/)).toBeInTheDocument();
    expect(screen.getByText(/\$32/)).toBeInTheDocument();
  });

  it("renders the vendor inline with the price when present", () => {
    render(
      <DisplayMakeupProductsCard
        invocation={inv({ products: sampleProducts })}
      />,
    );
    expect(screen.getByText(/Ruby Red · \$24/)).toBeInTheDocument();
  });

  it("renders a CTA link for each product with a product_url", () => {
    render(
      <DisplayMakeupProductsCard
        invocation={inv({ products: sampleProducts })}
      />,
    );
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect((links[0] as HTMLAnchorElement).href).toBe("https://alorabrands.com/lip");
    expect((links[1] as HTMLAnchorElement).href).toBe("https://alorabrands.com/found");
  });

  it("uses the args.title for the header when provided", () => {
    render(
      <DisplayMakeupProductsCard
        invocation={inv({ products: sampleProducts, title: "Top picks for you" })}
      />,
    );
    expect(screen.getByText("Top picks for you")).toBeInTheDocument();
  });

  it("falls back to a default header when title is missing", () => {
    render(
      <DisplayMakeupProductsCard
        invocation={inv({ products: sampleProducts })}
      />,
    );
    expect(screen.getByText("Makeup picks for you")).toBeInTheDocument();
  });
});
