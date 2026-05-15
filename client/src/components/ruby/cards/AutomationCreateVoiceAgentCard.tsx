import type { ToolInvocation } from "@shared/agent";
import {
  CardShell,
  CardHeader,
  ToolLoadingPill,
} from "@/components/agent/cards";
import { ThemedGenericCard } from "@/components/agent/cards/ThemedGenericCard";

interface AutomationCreateVoiceAgentCardProps {
  invocation: ToolInvocation;
}

interface VoiceAgent {
  name?: string;
  assistantId?: string;
  email?: string;
  message?: string;
  description?: string;
}

function pickString(o: Record<string, unknown>, key: string): string | undefined {
  const v = o[key];
  return typeof v === "string" ? v : undefined;
}

function extractAgent(raw: unknown): VoiceAgent | null {
  let parsed: unknown = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (typeof parsed !== "object" || parsed === null) return null;

  // Try root first, then common wrappers.
  const candidates: Array<Record<string, unknown>> = [
    parsed as Record<string, unknown>,
  ];
  const root = parsed as Record<string, unknown>;
  if (typeof root.result === "object" && root.result !== null) {
    candidates.push(root.result as Record<string, unknown>);
  }
  if (typeof root.data === "object" && root.data !== null) {
    candidates.push(root.data as Record<string, unknown>);
  }

  for (const o of candidates) {
    const name = pickString(o, "name");
    const assistantId =
      pickString(o, "assistantId") ?? pickString(o, "id");
    const email = pickString(o, "email");
    const message = pickString(o, "message");
    const description = pickString(o, "description");
    if (name || assistantId || email || message || description) {
      return { name, assistantId, email, message, description };
    }
  }
  return null;
}

export function AutomationCreateVoiceAgentCard({
  invocation,
}: AutomationCreateVoiceAgentCardProps) {
  const { status, name, response } = invocation;

  if (status === "loading") {
    return <ToolLoadingPill name={name} />;
  }

  const agent = extractAgent(response);
  if (!agent) {
    return <ThemedGenericCard invocation={invocation} />;
  }

  const rows: Array<[string, string]> = [];
  if (agent.name) rows.push(["Name", agent.name]);
  if (agent.assistantId) rows.push(["Assistant ID", agent.assistantId]);
  if (agent.email) rows.push(["Email", agent.email]);
  if (agent.description) rows.push(["Description", agent.description]);

  return (
    <CardShell>
      <CardHeader icon="🎙️" title="Voice agent created" pill="Created" />
      {agent.message && (
        <div className="text-sm text-tool-card-muted-foreground mb-2">
          {agent.message}
        </div>
      )}
      <div className="flex flex-col">
        {rows.map(([k, v]) => (
          <div
            key={k}
            className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-2 py-1 border-b border-tool-card-border last:border-b-0"
          >
            <div className="text-xs font-mono text-tool-card-muted-foreground">
              {k}
            </div>
            <div className="text-sm break-words">{v}</div>
          </div>
        ))}
      </div>
    </CardShell>
  );
}
