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

function isQAEntry(x: unknown): x is { question: string; answer: string } {
  return (
    typeof x === "object" &&
    x !== null &&
    typeof (x as Record<string, unknown>).question === "string" &&
    typeof (x as Record<string, unknown>).answer === "string"
  );
}

function renderArrayEntry(entry: unknown, idx: number): React.ReactNode {
  if (isQAEntry(entry)) {
    return (
      <details
        key={idx}
        className="rounded-md border border-tool-card-border bg-tool-card-muted p-2"
      >
        <summary className="cursor-pointer text-sm font-medium">
          {entry.question}
        </summary>
        <div className="mt-1 text-sm text-tool-card-muted-foreground">
          {entry.answer}
        </div>
      </details>
    );
  }
  return (
    <details
      key={idx}
      className="rounded-md border border-tool-card-border bg-tool-card-muted p-2"
    >
      <summary className="cursor-pointer text-sm">Item {idx + 1}</summary>
      <pre className="mt-1 text-xs text-tool-card-muted-foreground whitespace-pre-wrap break-words">
        {JSON.stringify(entry, null, 2)}
      </pre>
    </details>
  );
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
  if (Array.isArray(payload)) {
    if (payload.length === 0) {
      return <span className="text-tool-card-muted-foreground">(empty list)</span>;
    }
    return <div className="flex flex-col gap-2">{payload.map(renderArrayEntry)}</div>;
  }
  if (typeof payload === "object") {
    const text = pickTextField(payload as Record<string, unknown>);
    if (text !== null) {
      return (
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>
      );
    }
  }
  // Rule 4 (object → key-value table) is added in Task 12. Until then, stringify.
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
