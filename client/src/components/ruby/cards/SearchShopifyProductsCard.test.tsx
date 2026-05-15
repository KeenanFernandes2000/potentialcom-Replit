import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SearchShopifyProductsCard } from "./SearchShopifyProductsCard";
import type { ToolInvocation } from "@shared/agent";

function inv(
  response: unknown,
  overrides: Partial<ToolInvocation> = {},
): ToolInvocation {
  return {
    id: "id-1",
    name: "search_shopify_products",
    arguments: { query: "lipstick" },
    response,
    status: "complete",
    ...overrides,
  };
}

const sampleResult = {
  type: "search_shopify_products",
  status: "completed",
  result: {
    success: true,
    count: 2,
    query: "lipstick",
    products: [
      {
        id: "gid://shopify/Product/1",
        name: "Velvet Matte Lipstick",
        price: "24.0 USD",
        image: "https://cdn.example/lip.jpg",
        url: "https://alorabrands.com/lip",
        brand: "Ruby Red",
        available: true,
        stockStatus: "In Stock",
      },
      {
        id: "gid://shopify/Product/2",
        name: "Sephora Lipstories Lipstick",
        price: "11.5 USD",
        url: "https://alorabrands.com/sephora",
        brand: "Sephora",
        available: false,
        stockStatus: "Out of Stock",
      },
    ],
    message: 'Found 2 products matching "lipstick"',
  },
};

describe("SearchShopifyProductsCard — happy path", () => {
  it("renders a loading pill when status is loading", () => {
    render(
      <SearchShopifyProductsCard
        invocation={inv(undefined, { status: "loading" })}
      />,
    );
    expect(
      screen.getByText(/Using search_shopify_products…/),
    ).toBeInTheDocument();
  });

  it("accepts the response as a JSON string and parses it correctly", () => {
    render(
      <SearchShopifyProductsCard
        invocation={inv(JSON.stringify(sampleResult))}
      />,
    );
    expect(screen.getByText("Velvet Matte Lipstick")).toBeInTheDocument();
  });

  it("accepts the response as an already-parsed object", () => {
    render(<SearchShopifyProductsCard invocation={inv(sampleResult)} />);
    expect(screen.getByText("Velvet Matte Lipstick")).toBeInTheDocument();
  });

  it("renders the query in the header", () => {
    render(
      <SearchShopifyProductsCard
        invocation={inv(JSON.stringify(sampleResult))}
      />,
    );
    expect(
      screen.getByText('Search results for "lipstick"'),
    ).toBeInTheDocument();
  });

  it("renders the product count in the header pill", () => {
    render(
      <SearchShopifyProductsCard
        invocation={inv(JSON.stringify(sampleResult))}
      />,
    );
    expect(screen.getByText("2 found")).toBeInTheDocument();
  });

  it("renders each product's name, brand, and price", () => {
    render(
      <SearchShopifyProductsCard
        invocation={inv(JSON.stringify(sampleResult))}
      />,
    );
    expect(screen.getByText("Velvet Matte Lipstick")).toBeInTheDocument();
    expect(screen.getByText("Sephora Lipstories Lipstick")).toBeInTheDocument();
    expect(screen.getByText(/Ruby Red · 24\.0 USD/)).toBeInTheDocument();
    expect(screen.getByText(/Sephora · 11\.5 USD/)).toBeInTheDocument();
  });

  it("renders a CTA link per product with a url", () => {
    render(
      <SearchShopifyProductsCard
        invocation={inv(JSON.stringify(sampleResult))}
      />,
    );
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect((links[0] as HTMLAnchorElement).href).toBe(
      "https://alorabrands.com/lip",
    );
    expect((links[1] as HTMLAnchorElement).href).toBe(
      "https://alorabrands.com/sephora",
    );
  });

  it("falls back to a generic header when query is missing", () => {
    const noQuery = {
      result: {
        products: [
          { id: "p1", name: "Some Product", price: "5.0 USD" },
        ],
      },
    };
    render(
      <SearchShopifyProductsCard invocation={inv(JSON.stringify(noQuery))} />,
    );
    expect(screen.getByText("Search results")).toBeInTheDocument();
  });

  it("marks out-of-stock items with the stockStatus text", () => {
    render(
      <SearchShopifyProductsCard
        invocation={inv(JSON.stringify(sampleResult))}
      />,
    );
    expect(screen.getByText("Out of Stock")).toBeInTheDocument();
  });
});

describe("SearchShopifyProductsCard — defensive", () => {
  it("falls back to ThemedGenericCard when response is missing", () => {
    render(<SearchShopifyProductsCard invocation={inv(undefined)} />);
    expect(
      screen.getAllByText("search_shopify_products").length,
    ).toBeGreaterThan(0);
  });

  it("falls back to ThemedGenericCard when response is a malformed JSON string", () => {
    render(<SearchShopifyProductsCard invocation={inv("not json {{{")} />);
    expect(
      screen.getAllByText("search_shopify_products").length,
    ).toBeGreaterThan(0);
  });

  it("falls back when result.products is missing", () => {
    render(
      <SearchShopifyProductsCard
        invocation={inv(JSON.stringify({ result: { query: "x" } }))}
      />,
    );
    expect(
      screen.getAllByText("search_shopify_products").length,
    ).toBeGreaterThan(0);
  });

  it("falls back when result.products is empty", () => {
    render(
      <SearchShopifyProductsCard
        invocation={inv(
          JSON.stringify({ result: { query: "x", products: [] } }),
        )}
      />,
    );
    expect(
      screen.getAllByText("search_shopify_products").length,
    ).toBeGreaterThan(0);
  });

  it("skips items missing id or name and warns once in dev", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <SearchShopifyProductsCard
        invocation={inv(
          JSON.stringify({
            result: {
              query: "x",
              products: [
                {
                  id: "ok",
                  name: "Good Item",
                  price: "1.0 USD",
                  url: "https://x.test/a",
                },
                "garbage" as unknown,
                { /* no id, no name */ price: "2.0 USD" },
              ],
            },
          }),
        )}
      />,
    );
    expect(screen.getByText("Good Item")).toBeInTheDocument();
    // Only one CTA — the malformed entries are skipped.
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("skipped 2 malformed item(s)"),
    );
    warnSpy.mockRestore();
  });

  it("omits the CTA when url is missing", () => {
    render(
      <SearchShopifyProductsCard
        invocation={inv(
          JSON.stringify({
            result: {
              query: "x",
              products: [
                { id: "p1", name: "No Link", price: "5.0 USD" },
              ],
            },
          }),
        )}
      />,
    );
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("No Link")).toBeInTheDocument();
  });
});
