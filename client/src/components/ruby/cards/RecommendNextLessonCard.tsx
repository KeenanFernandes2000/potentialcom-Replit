import type { ToolInvocation } from "@shared/agent";
import {
  CardShell,
  CardHeader,
  CardCTA,
  ToolLoadingPill,
} from "@/components/agent/cards";
import { ThemedGenericCard } from "@/components/agent/cards/ThemedGenericCard";

/**
 * Schema (educated guess — verify against live n8n response):
 *   { lesson?: { title: string, course?: string, duration?: string, description?: string, url?: string } }
 *   OR top-level { title, course?, duration?, description?, url? }
 *   OR nested under .result / .data
 * Adjust here when shape is known.
 */

interface RecommendNextLessonCardProps {
  invocation: ToolInvocation;
}

interface Lesson {
  title: string;
  course?: string;
  duration?: string;
  description?: string;
  url?: string;
}

function pickString(o: Record<string, unknown>, key: string): string | undefined {
  const v = o[key];
  return typeof v === "string" ? v : undefined;
}

function isLesson(o: Record<string, unknown>): boolean {
  return typeof o.title === "string";
}

function extractLesson(raw: unknown): Lesson | null {
  let parsed: unknown = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const root = parsed as Record<string, unknown>;

  const candidates: Array<Record<string, unknown>> = [];
  if (typeof root.lesson === "object" && root.lesson !== null) {
    candidates.push(root.lesson as Record<string, unknown>);
  }
  if (typeof root.result === "object" && root.result !== null) {
    const r = root.result as Record<string, unknown>;
    if (typeof r.lesson === "object" && r.lesson !== null) {
      candidates.push(r.lesson as Record<string, unknown>);
    } else {
      candidates.push(r);
    }
  }
  if (typeof root.data === "object" && root.data !== null) {
    candidates.push(root.data as Record<string, unknown>);
  }
  candidates.push(root);

  for (const o of candidates) {
    if (!isLesson(o)) continue;
    return {
      title: o.title as string,
      course: pickString(o, "course"),
      duration: pickString(o, "duration"),
      description: pickString(o, "description"),
      url: pickString(o, "url"),
    };
  }
  return null;
}

export function RecommendNextLessonCard({
  invocation,
}: RecommendNextLessonCardProps) {
  const { status, name, response } = invocation;

  if (status === "loading") {
    return <ToolLoadingPill name={name} />;
  }

  const lesson = extractLesson(response);
  if (!lesson) {
    return <ThemedGenericCard invocation={invocation} />;
  }

  const pill = lesson.course ?? "Up next";
  const metaParts = [lesson.course, lesson.duration].filter(
    (v): v is string => typeof v === "string" && v.length > 0,
  );
  const metaLine = metaParts.join(" · ");

  return (
    <CardShell>
      <CardHeader icon="📖" title="Next lesson" pill={pill} />
      <div className="text-sm font-semibold leading-tight">{lesson.title}</div>
      {metaLine && (
        <div className="text-xs text-tool-card-muted-foreground mt-1">
          {metaLine}
        </div>
      )}
      {lesson.description && (
        <div className="text-sm text-tool-card-muted-foreground mt-2">
          {lesson.description}
        </div>
      )}
      {lesson.url && (
        <CardCTA href={lesson.url} variant="primary">
          Start lesson →
        </CardCTA>
      )}
    </CardShell>
  );
}
