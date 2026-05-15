import type { ToolInvocation } from "@shared/agent";
import { CardShell } from "./CardShell";
import { CardHeader } from "./CardHeader";
import { ToolLoadingPill } from "./ToolLoadingPill";

interface ThemedGenericCardProps {
  invocation: ToolInvocation;
}

// Renders the chosen payload. Tasks 10-12 add rule-based branches; for now
// it just stringifies anything truthy.
function renderPayload(payload: unknown): React.ReactNode {
  if (payload == null) {
    return <span className="text-tool-card-muted-foreground">(no response)</span>;
  }
  return <span>{String(payload)}</span>;
}

// Theme-aware fallback for any tool without a bespoke card. Also handles
// the loading state and exposes a "Raw response" details block in dev.
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
