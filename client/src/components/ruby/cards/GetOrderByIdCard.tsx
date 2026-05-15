import type { ToolInvocation } from "@shared/agent";
import {
  CardShell,
  CardHeader,
  ToolLoadingPill,
} from "@/components/agent/cards";
import { ThemedGenericCard } from "@/components/agent/cards/ThemedGenericCard";

/**
 * Schema (educated guess — verify against live response):
 * {
 *   success?: boolean,
 *   order?: {
 *     id?: string,
 *     name?: string,
 *     orderNumber?: string,
 *     status?: string,
 *     financial_status?: string,
 *     fulfillment_status?: string,
 *     total_price?: string,
 *     currency?: string,
 *     line_items?: Array<{ title: string, quantity?: number, price?: string }>,
 *     shipping_address?: unknown,
 *   }
 * }
 * The order object may also live at the root, in .result, or in .data.
 */

interface GetOrderByIdCardProps {
  invocation: ToolInvocation;
}

interface LineItem {
  title: string;
  quantity?: number;
  price?: string;
}

interface Order {
  id?: string;
  name?: string;
  orderNumber?: string;
  status?: string;
  financial_status?: string;
  fulfillment_status?: string;
  total_price?: string;
  currency?: string;
  line_items?: LineItem[];
}

function isLineItem(x: unknown): x is LineItem {
  return (
    typeof x === "object" &&
    x !== null &&
    typeof (x as Record<string, unknown>).title === "string"
  );
}

function pickString(o: Record<string, unknown>, key: string): string | undefined {
  const v = o[key];
  return typeof v === "string" ? v : undefined;
}

function looksLikeOrder(o: Record<string, unknown>): boolean {
  return (
    typeof o.id === "string" ||
    typeof o.name === "string" ||
    typeof o.orderNumber === "string" ||
    typeof o.status === "string" ||
    typeof o.total_price === "string" ||
    Array.isArray(o.line_items)
  );
}

function extractOrder(raw: unknown): Order | null {
  let parsed: unknown = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const root = parsed as Record<string, unknown>;

  const candidates: Array<Record<string, unknown>> = [];
  if (typeof root.order === "object" && root.order !== null) {
    candidates.push(root.order as Record<string, unknown>);
  }
  if (typeof root.result === "object" && root.result !== null) {
    const r = root.result as Record<string, unknown>;
    if (typeof r.order === "object" && r.order !== null) {
      candidates.push(r.order as Record<string, unknown>);
    } else {
      candidates.push(r);
    }
  }
  if (typeof root.data === "object" && root.data !== null) {
    candidates.push(root.data as Record<string, unknown>);
  }
  candidates.push(root);

  for (const o of candidates) {
    if (!looksLikeOrder(o)) continue;
    const lineItemsRaw = o.line_items;
    const line_items = Array.isArray(lineItemsRaw)
      ? lineItemsRaw.filter(isLineItem)
      : undefined;
    return {
      id: pickString(o, "id"),
      name: pickString(o, "name"),
      orderNumber: pickString(o, "orderNumber"),
      status: pickString(o, "status"),
      financial_status: pickString(o, "financial_status"),
      fulfillment_status: pickString(o, "fulfillment_status"),
      total_price: pickString(o, "total_price"),
      currency: pickString(o, "currency"),
      line_items,
    };
  }
  return null;
}

export function GetOrderByIdCard({ invocation }: GetOrderByIdCardProps) {
  const { status, name, response } = invocation;

  if (status === "loading") {
    return <ToolLoadingPill name={name} />;
  }

  const order = extractOrder(response);
  if (!order) {
    return <ThemedGenericCard invocation={invocation} />;
  }

  const idLabel = order.orderNumber ?? order.name ?? order.id ?? "unknown";
  const totalLine = [order.total_price, order.currency]
    .filter((v): v is string => typeof v === "string" && v.length > 0)
    .join(" ");

  return (
    <CardShell>
      <CardHeader
        icon="📦"
        title={`Order #${idLabel}`}
        pill={order.status ?? "Order"}
      />
      <div className="flex flex-col gap-1 text-sm">
        {order.financial_status && (
          <div>
            <span className="text-tool-card-muted-foreground">Payment: </span>
            {order.financial_status}
          </div>
        )}
        {order.fulfillment_status && (
          <div>
            <span className="text-tool-card-muted-foreground">
              Fulfillment:{" "}
            </span>
            {order.fulfillment_status}
          </div>
        )}
        {totalLine && (
          <div>
            <span className="text-tool-card-muted-foreground">Total: </span>
            {totalLine}
          </div>
        )}
      </div>
      {order.line_items && order.line_items.length > 0 && (
        <div className="mt-2 flex flex-col gap-1">
          <div className="text-xs font-mono text-tool-card-muted-foreground">
            Items
          </div>
          {order.line_items.map((item, idx) => {
            const qty = typeof item.quantity === "number" ? item.quantity : 1;
            return (
              <div
                key={`${item.title}-${idx}`}
                className="flex items-center gap-2 rounded-md bg-tool-card-muted px-2 py-1 text-sm"
              >
                <span className="flex-1 truncate">
                  {item.title}
                  {qty > 1 ? ` × ${qty}` : ""}
                </span>
                {item.price && (
                  <span className="text-xs text-tool-card-muted-foreground">
                    {item.price}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </CardShell>
  );
}
