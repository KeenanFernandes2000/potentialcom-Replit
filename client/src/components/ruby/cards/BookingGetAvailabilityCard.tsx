import type { ToolInvocation } from "@shared/agent";
import {
  CardShell,
  CardHeader,
  ToolLoadingPill,
} from "@/components/agent/cards";
import { ThemedGenericCard } from "@/components/agent/cards/ThemedGenericCard";

/**
 * Schema (educated guess — verify against live response):
 *   { slots?: Slot[] }
 *   { availability?: Slot[] }
 *   { days?: Array<{ date: string, slots: Slot[] }> }
 * where Slot = { start_time: string, end_time?: string, expert_name?: string }
 * Adjust here when the live shape is known. Display-only (no CTAs).
 */

interface BookingGetAvailabilityCardProps {
  invocation: ToolInvocation;
}

interface Slot {
  start_time: string;
  end_time?: string;
  expert_name?: string;
}

interface DayGroup {
  date: string;
  slots: Slot[];
}

function isSlot(x: unknown): x is Slot {
  return (
    typeof x === "object" &&
    x !== null &&
    typeof (x as Record<string, unknown>).start_time === "string"
  );
}

function isDayGroup(x: unknown): x is DayGroup {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return typeof o.date === "string" && Array.isArray(o.slots);
}

function isoDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString();
  } catch {
    return iso;
  }
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

interface ExtractResult {
  groups: DayGroup[];
  total: number;
}

function extractAvailability(raw: unknown): ExtractResult | null {
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

  // Try `days` first — already grouped.
  if (Array.isArray(obj.days)) {
    const groups = obj.days
      .filter(isDayGroup)
      .map((d) => ({
        date: d.date,
        slots: d.slots.filter(isSlot),
      }))
      .filter((g) => g.slots.length > 0);
    if (groups.length > 0) {
      const total = groups.reduce((sum, g) => sum + g.slots.length, 0);
      return { groups, total };
    }
  }

  // Otherwise flat slot list under `slots` or `availability`.
  const flatSrc = Array.isArray(obj.slots)
    ? obj.slots
    : Array.isArray(obj.availability)
      ? obj.availability
      : null;
  if (!flatSrc) return null;
  const slots = flatSrc.filter(isSlot);
  if (slots.length === 0) return null;

  // Group by date (derived from start_time).
  const grouped = new Map<string, Slot[]>();
  for (const s of slots) {
    const date = isoDate(s.start_time);
    const bucket = grouped.get(date);
    if (bucket) bucket.push(s);
    else grouped.set(date, [s]);
  }
  const groups: DayGroup[] = Array.from(grouped.entries()).map(([date, s]) => ({
    date,
    slots: s,
  }));
  return { groups, total: slots.length };
}

export function BookingGetAvailabilityCard({
  invocation,
}: BookingGetAvailabilityCardProps) {
  const { status, name, response } = invocation;

  if (status === "loading") {
    return <ToolLoadingPill name={name} />;
  }

  const extracted = extractAvailability(response);
  if (!extracted) {
    return <ThemedGenericCard invocation={invocation} />;
  }

  return (
    <CardShell>
      <CardHeader
        icon="📅"
        title="Available slots"
        pill={`${extracted.total} slots`}
      />
      <div className="flex flex-col gap-3">
        {extracted.groups.map((g) => (
          <div key={g.date}>
            <div className="text-xs font-mono text-tool-card-muted-foreground mb-1">
              {isoDate(g.date)}
            </div>
            <div className="flex flex-col gap-1">
              {g.slots.map((s, idx) => (
                <div
                  key={`${s.start_time}-${idx}`}
                  className="rounded-md bg-tool-card-muted px-2 py-1 text-sm"
                >
                  {formatTime(s.start_time)}
                  {s.expert_name && (
                    <span className="text-xs text-tool-card-muted-foreground ml-2">
                      · {s.expert_name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </CardShell>
  );
}
