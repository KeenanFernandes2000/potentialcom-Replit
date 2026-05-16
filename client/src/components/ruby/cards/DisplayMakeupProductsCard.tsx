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

interface DisplayMakeupProductsCardProps {
  invocation: ToolInvocation;
}

interface Product {
  id: string;
  title: string;
  vendor?: string;
  price?: number | string;
  image_url?: string;
  product_url?: string;
  description?: string;
}

function formatPrice(price: number | string | undefined): string {
  if (price == null || price === "") return "";
  const s = String(price);
  return s.startsWith("$") ? s : `$${s}`;
}

/**
 * Normalize an incoming product object to our internal shape. Accepts
 * either the Shopify-style schema ({id, title, image_url, product_url})
 * or Ruby's curated-list schema ({name, image, description, link}).
 *
 * Returns null when nothing usable can be extracted (no name/title AND
 * no image source).
 */
function normalizeProduct(raw: unknown, index: number): Product | null {
  if (typeof raw !== "object" || raw === null) return null;
  const obj = raw as Record<string, unknown>;

  const title =
    (typeof obj.title === "string" && obj.title) ||
    (typeof obj.name === "string" && obj.name) ||
    "";

  const image_url =
    (typeof obj.image_url === "string" && obj.image_url) ||
    (typeof obj.image === "string" && obj.image) ||
    undefined;

  // Both flavors need at least a title or an image to be worth rendering.
  if (!title && !image_url) return null;

  const product_url =
    (typeof obj.product_url === "string" && obj.product_url) ||
    (typeof obj.link === "string" && obj.link) ||
    undefined;

  const id =
    typeof obj.id === "string" || typeof obj.id === "number"
      ? String(obj.id)
      : `${title || "product"}-${index}`;

  return {
    id,
    title: title || "Product",
    vendor: typeof obj.vendor === "string" ? obj.vendor : undefined,
    price:
      typeof obj.price === "string" || typeof obj.price === "number"
        ? obj.price
        : undefined,
    image_url,
    product_url,
    description:
      typeof obj.description === "string" ? obj.description : undefined,
  };
}

interface Args {
  products: Product[];
  title?: string;
}

/**
 * Pull the products list from either the LLM's tool arguments or the
 * tool's result body. Different callers wrap it differently:
 *   - LLM passes raw args:        { products: [...] }
 *   - LLM passes raw args (titled): { products: [...], title: "..." }
 *   - Tool result echoes args:    { type, status, message, parameters: { products: [...] } }
 *   - Tool result raw:            { products: [...] }
 */
function extractFromCandidate(raw: unknown): Args | null {
  if (typeof raw !== "object" || raw === null) return null;
  const obj = raw as Record<string, unknown>;
  // Direct shape.
  if (Array.isArray(obj.products)) {
    const products = obj.products
      .map((p, i) => normalizeProduct(p, i))
      .filter((p): p is Product => p !== null);
    const dropped = obj.products.length - products.length;
    if (dropped > 0 && import.meta.env.DEV) {
      console.warn(
        `display_makeup_products: skipped ${dropped} malformed item(s)`,
      );
    }
    if (products.length === 0) return null;
    const title = typeof obj.title === "string" ? obj.title : undefined;
    return { products, title };
  }
  // Wrapped under .parameters (potentialTS tool-result envelope).
  if (typeof obj.parameters === "object" && obj.parameters !== null) {
    return extractFromCandidate(obj.parameters);
  }
  return null;
}

function extractArgs(rawArgs: unknown, rawResponse: unknown): Args | null {
  // Prefer args (what the LLM intended to show); fall back to response
  // (what the tool returned — which may echo the args).
  return extractFromCandidate(rawArgs) ?? extractFromCandidate(rawResponse);
}

export function DisplayMakeupProductsCard({
  invocation,
}: DisplayMakeupProductsCardProps) {
  const { status, name, arguments: rawArgs, response } = invocation;

  if (status === "loading") {
    return <ToolLoadingPill name={name} />;
  }

  const args = extractArgs(rawArgs, response);
  if (!args || args.products.length === 0) {
    return <ThemedGenericCard invocation={invocation} />;
  }

  const headerTitle = args.title ?? "Makeup picks for you";

  return (
    <CardShell>
      <CardHeader icon="💄" title={headerTitle} />
      <CardGrid>
        {args.products.map((p) => (
          // `group` activates the CardImage hover-zoom; `hover:-translate-y-1`
          // gives the tile itself a subtle lift; the colored shadow on
          // hover ties it back to the demo's brand palette.
          <div
            key={p.id}
            className="group relative overflow-hidden rounded-xl bg-tool-card-muted ring-1 ring-tool-card-border/60 transition-all duration-300 hover:-translate-y-1 hover:ring-fuchsia-400/50 hover:shadow-[0_18px_40px_-18px_rgba(217,70,239,0.55)]"
          >
            <CardImage src={p.image_url} alt={p.title} aspect="square" />
            <div className="p-2.5">
              <div className="text-sm font-semibold leading-tight">
                {p.title}
              </div>
              <div className="text-xs text-tool-card-muted-foreground mt-0.5">
                {p.vendor ? `${p.vendor} · ` : ""}
                {formatPrice(p.price)}
              </div>
              {p.product_url && (
                <CardCTA href={p.product_url} variant="ghost">
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
