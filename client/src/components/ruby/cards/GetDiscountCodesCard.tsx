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
 *   codes?: Array<{ code: string, value?: string, type?: string, description?: string, expires_at?: string }>,
 *   discounts?: Array<{ ...same as above }>,
 * }
 * Either `codes` or `discounts` may hold the items. Adjust here when shape is known.
 */

interface GetDiscountCodesCardProps {
  invocation: ToolInvocation;
}

interface DiscountCode {
  code: string;
  value?: string;
  type?: string;
  description?: string;
  expires_at?: string;
}

function isDiscountCode(x: unknown): x is DiscountCode {
  return (
    typeof x === "object" &&
    x !== null &&
    typeof (x as Record<string, unknown>).code === "string"
  );
}

function extractCodes(raw: unknown): DiscountCode[] | null {
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

  // Try both keys, and also nested under .result.
  const sources: unknown[] = [obj.codes, obj.discounts];
  if (typeof obj.result === "object" && obj.result !== null) {
    const r = obj.result as Record<string, unknown>;
    sources.push(r.codes, r.discounts);
  }
  for (const src of sources) {
    if (Array.isArray(src)) {
      return src.filter(isDiscountCode);
    }
  }
  return null;
}

export function GetDiscountCodesCard({ invocation }: GetDiscountCodesCardProps) {
  const { status, name, response } = invocation;

  if (status === "loading") {
    return <ToolLoadingPill name={name} />;
  }

  const codes = extractCodes(response);
  if (!codes || codes.length === 0) {
    return <ThemedGenericCard invocation={invocation} />;
  }

  return (
    <CardShell>
      <CardHeader
        icon="🎟️"
        title="Active discount codes"
        pill={`${codes.length} active`}
      />
      <div className="flex flex-col gap-2">
        {codes.map((c, idx) => {
          const valueLine = [c.value, c.type]
            .filter((v): v is string => typeof v === "string" && v.length > 0)
            .join(" ");
          return (
            <div
              key={`${c.code}-${idx}`}
              className="rounded-md bg-tool-card-muted p-2"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs bg-tool-card-border rounded px-2 py-0.5">
                  {c.code}
                </span>
                {valueLine && (
                  <span className="text-sm">{valueLine}</span>
                )}
              </div>
              {c.description && (
                <div className="text-xs text-tool-card-muted-foreground mt-1">
                  {c.description}
                </div>
              )}
              {c.expires_at && (
                <div className="text-xs text-tool-card-muted-foreground mt-0.5">
                  Expires {c.expires_at}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </CardShell>
  );
}
