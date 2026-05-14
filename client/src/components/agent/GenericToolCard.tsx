import ReactMarkdown from "react-markdown";
import { Wrench } from "lucide-react";
import type { ToolInvocation } from "@shared/agent";

interface GenericToolCardProps {
  invocation: ToolInvocation;
}

// Fallback renderer for any tool without a bespoke card.
export function GenericToolCard({ invocation }: GenericToolCardProps) {
  const { name, status, response } = invocation;

  if (status === "loading") {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary border border-primary/20">
        <Wrench className="h-3.5 w-3.5 animate-pulse" />
        <span>Using {name}…</span>
      </div>
    );
  }

  const text =
    typeof response === "string"
      ? response
      : "```json\n" + JSON.stringify(response, null, 2) + "\n```";

  return (
    <div className="rounded-xl border border-border bg-card p-3 text-sm">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Wrench className="h-3.5 w-3.5" />
        <span>{name}</span>
      </div>
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    </div>
  );
}
