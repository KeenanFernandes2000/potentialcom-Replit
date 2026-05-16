const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

/**
 * Pure helper. Returns a short human-readable relative time string.
 * Exported for direct testing.
 *
 * - < 1 min  → "just now"
 * - < 1 hour → "Xm ago"
 * - < 1 day  → "Xh ago"
 * - < 1 week → "Xd ago"
 * - >= 1 week → toLocaleDateString()
 */
export function relativeTime(createdAt: number, now: number = Date.now()): string {
  const delta = Math.max(0, now - createdAt);
  if (delta < MINUTE) return "just now";
  if (delta < HOUR) return `${Math.floor(delta / MINUTE)}m ago`;
  if (delta < DAY) return `${Math.floor(delta / HOUR)}h ago`;
  if (delta < WEEK) return `${Math.floor(delta / DAY)}d ago`;
  return new Date(createdAt).toLocaleDateString();
}

interface HoverTimestampProps {
  createdAt: number;
}

/**
 * Tiny text rendered below a message bubble. Hidden by default; the
 * parent uses group-hover:opacity-100 to reveal on hover. Re-renders
 * happen often enough during real chat use that no interval timer is
 * needed; worst-case the label is stale by a few seconds.
 */
export function HoverTimestamp({ createdAt }: HoverTimestampProps) {
  return (
    <div
      className="text-[10px] text-muted-foreground/60 opacity-0 transition-opacity group-hover:opacity-100 mt-1 select-none"
      data-testid="hover-timestamp"
    >
      {relativeTime(createdAt)}
    </div>
  );
}
