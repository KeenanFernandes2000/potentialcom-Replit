import type { ToolInvocation } from "@shared/agent";
import {
  CardShell,
  CardHeader,
  CardImage,
  CardGrid,
  ToolLoadingPill,
} from "@/components/agent/cards";
import { ThemedGenericCard } from "@/components/agent/cards/ThemedGenericCard";

interface DisplayMakeupExpertsCardProps {
  invocation: ToolInvocation;
}

interface Expert {
  name: string;
  image?: string;
  specialties?: string;
  prices?: string;
  services?: string;
}

/**
 * Coerce any shape the LLM might return into a renderable string. The
 * upstream tool used to always return strings for specialties / prices /
 * services, but the model has started passing objects (e.g. prices as
 * `{Bridal: "$300", Party: "$200"}`) and occasionally arrays. Rendering
 * either directly crashes React with "Objects are not valid as a React
 * child."
 *
 * Strategy:
 * - string → trim and return (drop if empty).
 * - number → toString.
 * - array → join non-empty items with ", " (each item coerced recursively).
 * - plain object → render as "key: value · key: value" pairs (drops
 *   entries whose value is itself an object/array so we don't recurse
 *   into ugly nested output).
 * - null / undefined → undefined (caller hides the row).
 */
function coerceToString(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") {
    const s = value.trim();
    return s ? s : undefined;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    const parts = value
      .map((v) => coerceToString(v))
      .filter((s): s is string => !!s);
    return parts.length ? parts.join(", ") : undefined;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => {
        if (v == null) return null;
        // Only keep entries whose value is a simple scalar — otherwise
        // we end up with "[object Object]" or worse.
        if (typeof v === "string" || typeof v === "number") {
          return `${k}: ${v}`;
        }
        return null;
      })
      .filter((s): s is string => s !== null);
    return entries.length ? entries.join(" · ") : undefined;
  }
  return undefined;
}

function normalizeExpert(x: unknown): Expert | null {
  if (typeof x !== "object" || x === null) return null;
  const obj = x as Record<string, unknown>;
  if (typeof obj.name !== "string" || !obj.name.trim()) return null;
  return {
    name: obj.name,
    image: typeof obj.image === "string" ? obj.image : undefined,
    specialties: coerceToString(obj.specialties),
    prices: coerceToString(obj.prices),
    services: coerceToString(obj.services),
  };
}

interface Args {
  experts: Expert[];
}

function extractArgs(raw: unknown): Args | null {
  if (typeof raw !== "object" || raw === null) return null;
  const obj = raw as Record<string, unknown>;
  if (!Array.isArray(obj.experts)) return null;
  const experts = obj.experts
    .map((e) => normalizeExpert(e))
    .filter((e): e is Expert => e !== null);
  const dropped = obj.experts.length - experts.length;
  if (dropped > 0 && import.meta.env.DEV) {
    console.warn(
      `display_makeup_experts: skipped ${dropped} malformed item(s)`,
    );
  }
  return { experts };
}

export function DisplayMakeupExpertsCard({
  invocation,
}: DisplayMakeupExpertsCardProps) {
  const { status, name, arguments: rawArgs } = invocation;

  if (status === "loading") {
    return <ToolLoadingPill name={name} />;
  }

  const args = extractArgs(rawArgs);
  if (!args || args.experts.length === 0) {
    return <ThemedGenericCard invocation={invocation} />;
  }

  return (
    <CardShell>
      <CardHeader
        icon="🧑‍🎨"
        title="Meet our makeup experts"
        pill={`${args.experts.length} experts`}
      />
      <CardGrid>
        {args.experts.map((e, idx) => (
          <div
            key={`${e.name}-${idx}`}
            className="rounded-lg overflow-hidden bg-tool-card-muted"
          >
            <CardImage src={e.image} alt={e.name} aspect="square" />
            <div className="p-2">
              <div className="text-sm font-semibold leading-tight">
                {e.name}
              </div>
              {e.specialties && (
                <div className="text-xs text-tool-card-muted-foreground mt-0.5">
                  {e.specialties}
                </div>
              )}
              {e.services && (
                <div className="text-xs text-tool-card-muted-foreground mt-0.5">
                  {e.services}
                </div>
              )}
              {e.prices && (
                <div className="text-xs text-tool-card-muted-foreground mt-0.5">
                  {e.prices}
                </div>
              )}
            </div>
          </div>
        ))}
      </CardGrid>
    </CardShell>
  );
}
