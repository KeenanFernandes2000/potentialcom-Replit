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

/**
 * Schema (educated guess — verify against live response):
 * The n8n image-analysis endpoint likely mirrors search_shopify_products:
 *   { result: { products: Product[] } } OR { products: Product[] }
 * Each Product may use `name` OR `title`. Optional fields: image, price, url, brand.
 * Adjust here when the live shape is known.
 */

interface DisplayPersonilizedProductsCardProps {
  invocation: ToolInvocation;
}

interface Product {
  id?: string;
  name?: string;
  title?: string;
  image?: string;
  image_url?: string;
  price?: string | number;
  url?: string;
  product_url?: string;
  brand?: string;
}

function isProduct(x: unknown): x is Product {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return typeof o.name === "string" || typeof o.title === "string";
}

function extractProducts(raw: unknown): Product[] | null {
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

  const sources: unknown[] = [obj.products];
  if (typeof obj.result === "object" && obj.result !== null) {
    sources.push((obj.result as Record<string, unknown>).products);
  }
  if (typeof obj.data === "object" && obj.data !== null) {
    sources.push((obj.data as Record<string, unknown>).products);
  }
  for (const src of sources) {
    if (Array.isArray(src)) {
      return src.filter(isProduct);
    }
  }
  return null;
}

function formatPrice(price: string | number | undefined): string {
  if (price == null || price === "") return "";
  return String(price);
}

export function DisplayPersonilizedProductsCard({
  invocation,
}: DisplayPersonilizedProductsCardProps) {
  const { status, name, response } = invocation;

  if (status === "loading") {
    return <ToolLoadingPill name={name} />;
  }

  const products = extractProducts(response);
  if (!products || products.length === 0) {
    return <ThemedGenericCard invocation={invocation} />;
  }

  return (
    <CardShell>
      <CardHeader
        icon="📸"
        title="Personalized picks based on your photo"
        pill={`${products.length} picks`}
      />
      <CardGrid>
        {products.map((p, idx) => {
          const displayName = p.name ?? p.title ?? "Product";
          const img = p.image ?? p.image_url;
          const link = p.url ?? p.product_url;
          const priceText = formatPrice(p.price);
          return (
            <div
              key={p.id ?? `${displayName}-${idx}`}
              className="rounded-lg overflow-hidden bg-tool-card-muted"
            >
              <CardImage src={img} alt={displayName} aspect="square" />
              <div className="p-2">
                <div className="text-sm font-semibold leading-tight">
                  {displayName}
                </div>
                {(p.brand || priceText) && (
                  <div className="text-xs text-tool-card-muted-foreground mt-0.5">
                    {p.brand ? `${p.brand}${priceText ? " · " : ""}` : ""}
                    {priceText}
                  </div>
                )}
                {link && (
                  <CardCTA href={link} variant="ghost">
                    View on store →
                  </CardCTA>
                )}
              </div>
            </div>
          );
        })}
      </CardGrid>
    </CardShell>
  );
}
