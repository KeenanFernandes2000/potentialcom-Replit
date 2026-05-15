import { useState } from "react";
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
  if (typeof payload === "object") {
    const entries = Object.entries(payload as Record<string, unknown>);
    if (entries.length === 0) {
      return <span className="text-tool-card-muted-foreground">(empty object)</span>;
    }
    return (
      <div className="flex flex-col">
        {entries.map(([k, v]) => (
          <KVRow key={k} k={k} v={v} />
        ))}
      </div>
    );
  }
  return <span>{String(payload)}</span>;
}

function KVRow({ k, v }: { k: string; v: unknown }) {
  const [expanded, setExpanded] = useState(false);
  let display: string;
  let canTruncate = false;
  if (typeof v === "string") {
    display = v;
    canTruncate = v.length > 200;
  } else {
    display = JSON.stringify(v, null, 2);
  }
  const visible =
    canTruncate && !expanded ? display.slice(0, 200) + "…" : display;
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-2 py-1 border-b border-tool-card-border last:border-b-0">
      <div className="text-xs font-mono text-tool-card-muted-foreground break-words">
        {k}
      </div>
      <div className="text-sm break-words">
        {typeof v === "string" ? (
          <span>{visible}</span>
        ) : (
          <pre className="whitespace-pre-wrap break-words text-xs">{visible}</pre>
        )}
        {canTruncate && (
          <button
            type="button"
            className="ml-2 text-xs underline text-tool-card-accent"
            onClick={() => setExpanded((s) => !s)}
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>
    </div>
  );
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
