import type { ToolInvocation } from "@shared/agent";
import {
  CardShell,
  CardHeader,
  CardImage,
  CardCTA,
  CardGrid,
  ToolLoadingPill,
} from "@/components/agent/cards";
import { ThemedGenericCard } from "@/components/agent/cards/ThemedGenericCard";

interface SearchShopifyProductsCardProps {
  invocation: ToolInvocation;
}

interface Product {
  id: string;
  name: string;
  price?: string;
  image?: string;
  description?: string;
  url?: string;
  brand?: string;
  quantity?: number;
  stockStatus?: string;
  available?: boolean;
  variantId?: string;
  productType?: string;
  tags?: string[];
}

interface SearchResult {
  products: Product[];
  query?: string;
  message?: string;
}

function isProduct(x: unknown): x is Product {
  return (
    typeof x === "object" &&
    x !== null &&
    typeof (x as Record<string, unknown>).id === "string" &&
    typeof (x as Record<string, unknown>).name === "string"
  );
}

function extractSearchResult(raw: unknown): SearchResult | null {
  // 1. Accept the response either as a string (JSON-stringified) or already parsed.
  let parsed: unknown = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const obj = parsed as Record<string, unknown>;
  const result = obj.result;
  if (typeof result !== "object" || result === null) return null;
  const r = result as Record<string, unknown>;
  if (!Array.isArray(r.products)) return null;
  const products = r.products.filter(isProduct);
  const dropped = r.products.length - products.length;
  if (dropped > 0 && import.meta.env.DEV) {
    console.warn(
      `search_shopify_products: skipped ${dropped} malformed item(s)`,
    );
  }
  return {
    products,
    query: typeof r.query === "string" ? r.query : undefined,
    message: typeof r.message === "string" ? r.message : undefined,
  };
}

export function SearchShopifyProductsCard({
  invocation,
}: SearchShopifyProductsCardProps) {
  const { status, name, response } = invocation;

  if (status === "loading") {
    return <ToolLoadingPill name={name} />;
  }

  const result = extractSearchResult(response);
  if (!result || result.products.length === 0) {
    return <ThemedGenericCard invocation={invocation} />;
  }

  const headerTitle = result.query
    ? `Search results for "${result.query}"`
    : "Search results";

  return (
    <CardShell>
      <CardHeader
        icon="🛍️"
        title={headerTitle}
        pill={`${result.products.length} found`}
      />
      <CardGrid>
        {result.products.map((p) => (
          // `group` activates CardImage's hover-zoom; the tile itself
          // lifts + glows on hover for a premium product-grid feel.
          <div
            key={p.id}
            className="group relative overflow-hidden rounded-xl bg-tool-card-muted ring-1 ring-tool-card-border/60 transition-all duration-300 hover:-translate-y-1 hover:ring-fuchsia-400/50 hover:shadow-[0_18px_40px_-18px_rgba(217,70,239,0.55)]"
          >
            <CardImage src={p.image} alt={p.name} aspect="square" />
            <div className="p-2.5">
              <div className="text-sm font-semibold leading-tight">
                {p.name}
              </div>
              <div className="text-xs text-tool-card-muted-foreground mt-0.5">
                {p.brand ? `${p.brand} · ` : ""}
                {p.price ?? ""}
              </div>
              {p.available === false && (
                <div className="text-xs text-tool-card-muted-foreground mt-1 italic">
                  {p.stockStatus ?? "Out of stock"}
                </div>
              )}
              {p.url && (
                <CardCTA href={p.url} variant="ghost">
                  View on store →
                </CardCTA>
              )}
            </div>
          </div>
        ))}
      </CardGrid>
    </CardShell>
  );
}
