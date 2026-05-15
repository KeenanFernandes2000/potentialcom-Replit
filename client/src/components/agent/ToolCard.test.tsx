import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToolCard } from "./ToolCard";
import { rubyToolRegistry } from "@/components/ruby/rubyToolRegistry";
import type { ToolInvocation } from "@shared/agent";

function inv(name: string, args: unknown = undefined): ToolInvocation {
  return {
    id: `${name}-id`,
    name,
    arguments: args,
    response: undefined,
    status: "complete",
  };
}

describe("ToolCard dispatcher integration with rubyToolRegistry", () => {
  it("routes display_makeup_products to DisplayMakeupProductsCard", () => {
    render(
      <ToolCard
        invocation={inv("display_makeup_products", {
          products: [
            {
              id: "p1",
              title: "Velvet Matte Lipstick",
              price: 24,
              product_url: "https://example.com/lip",
            },
          ],
        })}
        registry={rubyToolRegistry}
      />,
    );
    // Bespoke layout shows the default header and the product title.
    expect(screen.getByText("Makeup picks for you")).toBeInTheDocument();
    expect(screen.getByText("Velvet Matte Lipstick")).toBeInTheDocument();
  });

  it("falls back to ThemedGenericCard for unregistered tools", () => {
    render(
      <ToolCard
        invocation={inv("answer_faqs", "Some FAQ text")}
        registry={rubyToolRegistry}
      />,
    );
    // ThemedGenericCard's CardHeader renders the tool name twice (title +
    // pill), so use getAllByText. The string payload also appears in both
    // the visible markdown and the Raw response pre, so we assert
    // presence rather than uniqueness.
    expect(screen.getAllByText("answer_faqs").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Some FAQ text/).length).toBeGreaterThan(0);
  });

  it("falls back to ThemedGenericCard for display_makeup_products with bad args", () => {
    render(
      <ToolCard
        invocation={inv("display_makeup_products", "garbage")}
        registry={rubyToolRegistry}
      />,
    );
    // Bespoke card delegates to ThemedGenericCard, which puts the tool
    // name in BOTH the title and the pill in the header — use
    // getAllByText to tolerate the duplication.
    expect(
      screen.getAllByText("display_makeup_products").length,
    ).toBeGreaterThan(0);
  });
});
