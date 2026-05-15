import type { ToolInvocation } from "@shared/agent";
import {
  CardShell,
  CardHeader,
  ToolLoadingPill,
} from "@/components/agent/cards";
import { ThemedGenericCard } from "@/components/agent/cards/ThemedGenericCard";

/**
 * Schema (educated guess — verify against live n8n Google Sheets response):
 * {
 *   user_name?: string,
 *   courses?: Array<{
 *     course: string,
 *     progress_pct?: number,   // 0..100
 *     completed_lessons?: number,
 *     total_lessons?: number,
 *     status?: string,
 *   }>
 * }
 * Courses may also live under .result or .data. Adjust here when shape is known.
 */

interface DisplayUserCourseProgressCardProps {
  invocation: ToolInvocation;
}

interface CourseProgress {
  course: string;
  progress_pct?: number;
  completed_lessons?: number;
  total_lessons?: number;
  status?: string;
}

function isCourseProgress(x: unknown): x is CourseProgress {
  return (
    typeof x === "object" &&
    x !== null &&
    typeof (x as Record<string, unknown>).course === "string"
  );
}

interface Extracted {
  user_name?: string;
  courses: CourseProgress[];
}

function extract(raw: unknown): Extracted | null {
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

  const candidates: Array<Record<string, unknown>> = [obj];
  if (typeof obj.result === "object" && obj.result !== null) {
    candidates.push(obj.result as Record<string, unknown>);
  }
  if (typeof obj.data === "object" && obj.data !== null) {
    candidates.push(obj.data as Record<string, unknown>);
  }

  for (const c of candidates) {
    if (Array.isArray(c.courses)) {
      const courses = c.courses.filter(isCourseProgress);
      if (courses.length === 0) continue;
      const user_name =
        typeof c.user_name === "string" ? c.user_name : undefined;
      return { user_name, courses };
    }
  }
  return null;
}

function clampPct(pct: number): number {
  if (pct < 0) return 0;
  if (pct > 100) return 100;
  return pct;
}

export function DisplayUserCourseProgressCard({
  invocation,
}: DisplayUserCourseProgressCardProps) {
  const { status, name, response } = invocation;

  if (status === "loading") {
    return <ToolLoadingPill name={name} />;
  }

  const data = extract(response);
  if (!data) {
    return <ThemedGenericCard invocation={invocation} />;
  }

  const title = data.user_name
    ? `Course progress for ${data.user_name}`
    : "Course progress";

  return (
    <CardShell>
      <CardHeader
        icon="📊"
        title={title}
        pill={`${data.courses.length} courses`}
      />
      <div className="flex flex-col gap-2">
        {data.courses.map((c, idx) => {
          const hasPct = typeof c.progress_pct === "number";
          const pct = hasPct ? clampPct(c.progress_pct as number) : null;
          const lessonsLine =
            typeof c.completed_lessons === "number" &&
            typeof c.total_lessons === "number"
              ? `${c.completed_lessons}/${c.total_lessons} lessons`
              : null;
          return (
            <div
              key={`${c.course}-${idx}`}
              className="rounded-md bg-tool-card-muted p-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold leading-tight">
                  {c.course}
                </div>
                {c.status && (
                  <span className="text-xs text-tool-card-muted-foreground">
                    {c.status}
                  </span>
                )}
              </div>
              {pct !== null ? (
                <div className="mt-2">
                  <div className="h-2 w-full rounded-full bg-tool-card-border overflow-hidden">
                    <div
                      data-testid="progress-bar"
                      className="h-full bg-tool-card-accent"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-xs text-tool-card-muted-foreground mt-1">
                    {pct}%
                  </div>
                </div>
              ) : lessonsLine ? (
                <div className="text-xs text-tool-card-muted-foreground mt-1">
                  {lessonsLine}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </CardShell>
  );
}
