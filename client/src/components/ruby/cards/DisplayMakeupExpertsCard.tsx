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

function isExpert(x: unknown): x is Expert {
  return (
    typeof x === "object" &&
    x !== null &&
    typeof (x as Record<string, unknown>).name === "string"
  );
}

interface Args {
  experts: Expert[];
}

function extractArgs(raw: unknown): Args | null {
  if (typeof raw !== "object" || raw === null) return null;
  const obj = raw as Record<string, unknown>;
  if (!Array.isArray(obj.experts)) return null;
  const experts = obj.experts.filter(isExpert);
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
