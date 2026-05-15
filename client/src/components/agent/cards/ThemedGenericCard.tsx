import ReactMarkdown from "react-markdown";
import type { ToolInvocation } from "@shared/agent";
import { CardShell } from "./CardShell";
import { CardHeader } from "./CardHeader";
import { ToolLoadingPill } from "./ToolLoadingPill";

interface ThemedGenericCardProps {
  invocation: ToolInvocation;
}

function pickTextField(o: Record<string, unknown>): string | null {
  for (const key of ["summary", "text", "content"] as const) {
    const v = o[key];
    if (typeof v === "string") return v;
  }
  return null;
}

function renderPayload(payload: unknown): React.ReactNode {
  if (payload == null) {
    return <span className="text-tool-card-muted-foreground">(no response)</span>;
  }
  if (typeof payload === "string") {
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown>{payload}</ReactMarkdown>
      </div>
    );
  }
  if (typeof payload === "object" && !Array.isArray(payload)) {
    const text = pickTextField(payload as Record<string, unknown>);
    if (text !== null) {
      return (
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>
      );
    }
  }
  // Rules 3 and 4 are added in Tasks 11 and 12. Until then, stringify.
  return <span>{String(payload)}</span>;
}

export function ThemedGenericCard({ invocation }: ThemedGenericCardProps) {
  const { name, status, arguments: args, response } = invocation;

  if (status === "loading") {
    return <ToolLoadingPill name={name} />;
  }

  const payload = response ?? args;

  return (
    <CardShell>
      <CardHeader title={name} pill={name} />
      <div className="text-sm">{renderPayload(payload)}</div>
      <details className="mt-3 text-xs text-tool-card-muted-foreground">
        <summary className="cursor-pointer">Raw response</summary>
        <pre className="mt-1 whitespace-pre-wrap break-words">
          {JSON.stringify({ arguments: args, response }, null, 2)}
        </pre>
      </details>
    </CardShell>
  );
}
