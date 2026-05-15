import type { ToolInvocation } from "@shared/agent";
import {
  CardShell,
  CardHeader,
  CardImage,
  CardCTA,
  CardGrid,
  ToolLoadingPill,
} from "@/components/agent/cards";

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

function isProduct(x: unknown): x is Product {
  return (
    typeof x === "object" &&
    x !== null &&
    typeof (x as Record<string, unknown>).id === "string" &&
    typeof (x as Record<string, unknown>).title === "string"
  );
}

interface Args {
  products: Product[];
  title?: string;
}

function extractArgs(raw: unknown): Args | null {
  if (typeof raw !== "object" || raw === null) return null;
  const obj = raw as Record<string, unknown>;
  if (!Array.isArray(obj.products)) return null;
  const products = obj.products.filter(isProduct);
  const title = typeof obj.title === "string" ? obj.title : undefined;
  return { products, title };
}

export function DisplayMakeupProductsCard({
  invocation,
}: DisplayMakeupProductsCardProps) {
  const { status, name, arguments: rawArgs } = invocation;

  if (status === "loading") {
    return <ToolLoadingPill name={name} />;
  }

  const args = extractArgs(rawArgs);
  if (!args || args.products.length === 0) {
    // Defensive fallback handled in Task 15. For the happy-path task, this
    // branch is unreachable when callers pass well-formed data.
    return null;
  }

  const headerTitle = args.title ?? "Makeup picks for you";

  return (
    <CardShell>
      <CardHeader icon="💄" title={headerTitle} />
      <CardGrid>
        {args.products.map((p) => (
          <div
            key={p.id}
            className="rounded-lg overflow-hidden bg-tool-card-muted"
          >
            <CardImage src={p.image_url} alt={p.title} aspect="square" />
            <div className="p-2">
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
