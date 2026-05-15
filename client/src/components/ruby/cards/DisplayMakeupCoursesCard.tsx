import type { ToolInvocation } from "@shared/agent";
import {
  CardShell,
  CardHeader,
  CardGrid,
  ToolLoadingPill,
} from "@/components/agent/cards";
import { ThemedGenericCard } from "@/components/agent/cards/ThemedGenericCard";

interface DisplayMakeupCoursesCardProps {
  invocation: ToolInvocation;
}

interface Course {
  course: string;
  level?: string;
  duration?: string;
  topics?: string;
}

function isCourse(x: unknown): x is Course {
  return (
    typeof x === "object" &&
    x !== null &&
    typeof (x as Record<string, unknown>).course === "string"
  );
}

interface Args {
  courses: Course[];
}

function extractArgs(raw: unknown): Args | null {
  if (typeof raw !== "object" || raw === null) return null;
  const obj = raw as Record<string, unknown>;
  if (!Array.isArray(obj.courses)) return null;
  const courses = obj.courses.filter(isCourse);
  const dropped = obj.courses.length - courses.length;
  if (dropped > 0 && import.meta.env.DEV) {
    console.warn(
      `display_makeup_courses: skipped ${dropped} malformed item(s)`,
    );
  }
  return { courses };
}

function formatMeta(level?: string, duration?: string): string {
  const parts = [level, duration].filter(
    (p): p is string => typeof p === "string" && p.length > 0,
  );
  return parts.join(" · ");
}

export function DisplayMakeupCoursesCard({
  invocation,
}: DisplayMakeupCoursesCardProps) {
  const { status, name, arguments: rawArgs } = invocation;

  if (status === "loading") {
    return <ToolLoadingPill name={name} />;
  }

  const args = extractArgs(rawArgs);
  if (!args || args.courses.length === 0) {
    return <ThemedGenericCard invocation={invocation} />;
  }

  return (
    <CardShell>
      <CardHeader
        icon="🎓"
        title="Makeup & skincare courses"
        pill={`${args.courses.length} courses`}
      />
      <CardGrid minItemWidth="240px">
        {args.courses.map((c, idx) => {
          const meta = formatMeta(c.level, c.duration);
          return (
            <div
              key={`${c.course}-${idx}`}
              className="rounded-lg bg-tool-card-muted p-3"
            >
              <div className="text-sm font-semibold leading-tight">
                {c.course}
              </div>
              {meta && (
                <div className="text-xs text-tool-card-muted-foreground mt-1">
                  {meta}
                </div>
              )}
              {c.topics && (
                <div className="text-xs text-tool-card-muted-foreground mt-1">
                  {c.topics}
                </div>
              )}
            </div>
          );
        })}
      </CardGrid>
    </CardShell>
  );
}
