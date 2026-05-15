import type { ToolInvocation } from "@shared/agent";
import {
  CardShell,
  CardHeader,
  ToolLoadingPill,
} from "@/components/agent/cards";
import { ThemedGenericCard } from "@/components/agent/cards/ThemedGenericCard";

interface DisplayOpenJobPositionsCardProps {
  invocation: ToolInvocation;
}

interface Position {
  title: string;
  department?: string;
  location?: string;
  type?: string;
}

function isPosition(x: unknown): x is Position {
  return (
    typeof x === "object" &&
    x !== null &&
    typeof (x as Record<string, unknown>).title === "string"
  );
}

interface Args {
  positions: Position[];
}

function extractArgs(raw: unknown): Args | null {
  if (typeof raw !== "object" || raw === null) return null;
  const obj = raw as Record<string, unknown>;
  if (!Array.isArray(obj.positions)) return null;
  const positions = obj.positions.filter(isPosition);
  const dropped = obj.positions.length - positions.length;
  if (dropped > 0 && import.meta.env.DEV) {
    console.warn(
      `display_open_job_positions: skipped ${dropped} malformed item(s)`,
    );
  }
  return { positions };
}

function formatMeta(p: Position): string {
  const parts = [p.department, p.location, p.type].filter(
    (v): v is string => typeof v === "string" && v.length > 0,
  );
  return parts.join(" · ");
}

export function DisplayOpenJobPositionsCard({
  invocation,
}: DisplayOpenJobPositionsCardProps) {
  const { status, name, arguments: rawArgs } = invocation;

  if (status === "loading") {
    return <ToolLoadingPill name={name} />;
  }

  const args = extractArgs(rawArgs);
  if (!args || args.positions.length === 0) {
    return <ThemedGenericCard invocation={invocation} />;
  }

  return (
    <CardShell>
      <CardHeader
        icon="💼"
        title="Open positions"
        pill={`${args.positions.length} open`}
      />
      <div className="flex flex-col gap-2">
        {args.positions.map((p, idx) => {
          const meta = formatMeta(p);
          return (
            <div
              key={`${p.title}-${idx}`}
              className="rounded-md bg-tool-card-muted p-2"
            >
              <div className="text-sm font-semibold leading-tight">
                {p.title}
              </div>
              {meta && (
                <div className="text-xs text-tool-card-muted-foreground mt-0.5">
                  {meta}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </CardShell>
  );
}
