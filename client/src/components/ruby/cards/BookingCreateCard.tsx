import type { ToolInvocation } from "@shared/agent";
import {
  CardShell,
  CardHeader,
  ToolLoadingPill,
} from "@/components/agent/cards";
import { ThemedGenericCard } from "@/components/agent/cards/ThemedGenericCard";

interface BookingCreateCardProps {
  invocation: ToolInvocation;
}

interface Booking {
  title?: string;
  customer_name?: string;
  expert_name?: string;
  start_time?: string;
  end_time?: string;
  message?: string;
}

// Defensive extract: response may be JSON-string or object; data may sit at
// root, .booking, or .result. Accept any object with at least one of
// start_time, expert_name, or customer_name.
function extractBooking(raw: unknown): Booking | null {
  let parsed: unknown = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const candidates: unknown[] = [parsed];
  const root = parsed as Record<string, unknown>;
  if (typeof root.booking === "object" && root.booking !== null) {
    candidates.push(root.booking);
  }
  if (typeof root.result === "object" && root.result !== null) {
    candidates.push(root.result);
  }
  for (const c of candidates) {
    if (typeof c !== "object" || c === null) continue;
    const o = c as Record<string, unknown>;
    const hasKey =
      typeof o.start_time === "string" ||
      typeof o.expert_name === "string" ||
      typeof o.customer_name === "string";
    if (hasKey) {
      return {
        title: typeof o.title === "string" ? o.title : undefined,
        customer_name:
          typeof o.customer_name === "string" ? o.customer_name : undefined,
        expert_name:
          typeof o.expert_name === "string" ? o.expert_name : undefined,
        start_time: typeof o.start_time === "string" ? o.start_time : undefined,
        end_time: typeof o.end_time === "string" ? o.end_time : undefined,
        message: typeof o.message === "string" ? o.message : undefined,
      };
    }
  }
  return null;
}

function formatTime(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

export function BookingCreateCard({ invocation }: BookingCreateCardProps) {
  const { status, name, response } = invocation;

  if (status === "loading") {
    return <ToolLoadingPill name={name} />;
  }

  const booking = extractBooking(response);
  if (!booking) {
    return <ThemedGenericCard invocation={invocation} />;
  }

  const rows: Array<[string, string]> = [];
  if (booking.expert_name) rows.push(["Expert", booking.expert_name]);
  if (booking.customer_name) rows.push(["Customer", booking.customer_name]);
  const start = formatTime(booking.start_time);
  const end = formatTime(booking.end_time);
  if (start) rows.push(["Start", start]);
  if (end) rows.push(["End", end]);

  return (
    <CardShell>
      <CardHeader icon="✅" title="Booking confirmed" pill="Confirmation" />
      {booking.message && (
        <div className="text-sm text-tool-card-muted-foreground mb-2">
          {booking.message}
        </div>
      )}
      <div className="flex flex-col">
        {rows.map(([k, v]) => (
          <div
            key={k}
            className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-2 py-1 border-b border-tool-card-border last:border-b-0"
          >
            <div className="text-xs font-mono text-tool-card-muted-foreground">
              {k}
            </div>
            <div className="text-sm break-words">{v}</div>
          </div>
        ))}
      </div>
    </CardShell>
  );
}
