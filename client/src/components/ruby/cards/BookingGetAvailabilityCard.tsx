import type { ToolInvocation } from "@shared/agent";
import {
  CardShell,
  CardHeader,
  ToolLoadingPill,
} from "@/components/agent/cards";
import { ThemedGenericCard } from "@/components/agent/cards/ThemedGenericCard";

/**
 * Real n8n response (verified live, get_slots webhook):
 *   {
 *     type: "booking_get_availability",
 *     status: "completed",
 *     result: { allOneHourAvailableSlots: Array<{ start: string, end: string }> }
 *   }
 * where start/end are formatted "DD/MM/YYYY, HH:MM" (NOT ISO 8601).
 *
 * The extractor also accepts legacy/alternate shapes for resilience:
 *   { slots?: Slot[] } / { availability?: Slot[] } / { days?: Array<{date, slots}> }
 * where each Slot may use { start_time, end_time } OR { start, end }.
 *
 * Display-only: no CTAs.
 */

interface BookingGetAvailabilityCardProps {
  invocation: ToolInvocation;
}

interface Slot {
  start: string;
  end?: string;
  expert_name?: string;
}

interface DayGroup {
  date: string;
  slots: Slot[];
}

function isSlot(x: unknown): x is Slot {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return typeof o.start === "string" || typeof o.start_time === "string";
}

function normalizeSlot(x: Slot | Record<string, unknown>): Slot {
  const o = x as Record<string, unknown>;
  return {
    start: typeof o.start === "string" ? o.start : (o.start_time as string),
    end:
      typeof o.end === "string"
        ? o.end
        : typeof o.end_time === "string"
          ? (o.end_time as string)
          : undefined,
    expert_name:
      typeof o.expert_name === "string" ? o.expert_name : undefined,
  };
}

function isDayGroup(x: unknown): x is { date: string; slots: unknown[] } {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return typeof o.date === "string" && Array.isArray(o.slots);
}

// "DD/MM/YYYY, HH:MM" or ISO 8601. Returns the date-only string for grouping.
function getDateKey(value: string): string {
  // n8n shape: "15/05/2026, 14:00" → "15/05/2026"
  const ddmmyyyy = /^(\d{2}\/\d{2}\/\d{4})(?:,\s*\d{1,2}:\d{2})?$/.exec(value);
  if (ddmmyyyy) return ddmmyyyy[1];
  // ISO: try parsing.
  const d = new Date(value);
  if (!isNaN(d.getTime())) return d.toLocaleDateString();
  return value;
}

// Format the time portion for display.
function formatTime(value: string): string {
  // n8n shape: "15/05/2026, 14:00" — keep the time portion.
  const m = /^\d{2}\/\d{2}\/\d{4},\s*(\d{1,2}:\d{2})$/.exec(value);
  if (m) return m[1];
  // ISO fallback.
  const d = new Date(value);
  if (!isNaN(d.getTime())) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return value;
}

// Format a slot's time range for display, e.g. "14:00 – 15:00".
function formatRange(s: Slot): string {
  const startTime = formatTime(s.start);
  if (!s.end) return startTime;
  const endTime = formatTime(s.end);
  return `${startTime} – ${endTime}`;
}

interface ExtractResult {
  groups: DayGroup[];
  total: number;
}

function pickFlatSlotArray(obj: Record<string, unknown>): unknown[] | null {
  // Real n8n key first, then legacy guesses.
  for (const key of ["allOneHourAvailableSlots", "slots", "availability"] as const) {
    if (Array.isArray(obj[key])) return obj[key] as unknown[];
  }
  return null;
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

  // Drill into `.result` if present (n8n wraps responses).
  const outer = parsed as Record<string, unknown>;
  const inner =
    outer.result && typeof outer.result === "object" && outer.result !== null
      ? (outer.result as Record<string, unknown>)
      : outer;

  // Pre-grouped `days` shape.
  if (Array.isArray(inner.days)) {
    const groups: DayGroup[] = inner.days
      .filter(isDayGroup)
      .map((d) => ({
        date: d.date,
        slots: d.slots.filter(isSlot).map((s) => normalizeSlot(s as Slot)),
      }))
      .filter((g) => g.slots.length > 0);
    if (groups.length > 0) {
      const total = groups.reduce((sum, g) => sum + g.slots.length, 0);
      return { groups, total };
    }
  }

  // Flat slot list under one of the known keys, on either outer or inner.
  const flatSrc = pickFlatSlotArray(inner) ?? pickFlatSlotArray(outer);
  if (!flatSrc) return null;
  const slots = flatSrc.filter(isSlot).map((s) => normalizeSlot(s as Slot));
  if (slots.length === 0) return null;

  // Group by date.
  const grouped = new Map<string, Slot[]>();
  for (const s of slots) {
    const date = getDateKey(s.start);
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
              {g.date}
            </div>
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
              {g.slots.map((s, idx) => (
                <div
                  key={`${s.start}-${idx}`}
                  className="rounded-md bg-tool-card-muted px-2 py-1 text-sm"
                >
                  {formatRange(s)}
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
