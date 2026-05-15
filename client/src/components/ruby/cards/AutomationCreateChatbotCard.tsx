import type { ToolInvocation } from "@shared/agent";
import {
  CardShell,
  CardHeader,
  ToolLoadingPill,
} from "@/components/agent/cards";
import { ThemedGenericCard } from "@/components/agent/cards/ThemedGenericCard";

interface AutomationCreateChatbotCardProps {
  invocation: ToolInvocation;
}

interface Chatbot {
  name?: string;
  botId?: string;
  email?: string;
  embedCode?: string;
  url?: string;
  message?: string;
}

function pickString(o: Record<string, unknown>, key: string): string | undefined {
  const v = o[key];
  return typeof v === "string" ? v : undefined;
}

function extractChatbot(raw: unknown): Chatbot | null {
  let parsed: unknown = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (typeof parsed !== "object" || parsed === null) return null;

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
    const botId = pickString(o, "botId") ?? pickString(o, "id");
    const email = pickString(o, "email");
    const embedCode = pickString(o, "embedCode");
    const url = pickString(o, "url");
    const message = pickString(o, "message");
    if (name || botId || email || embedCode || url || message) {
      return { name, botId, email, embedCode, url, message };
    }
  }
  return null;
}

export function AutomationCreateChatbotCard({
  invocation,
}: AutomationCreateChatbotCardProps) {
  const { status, name, response } = invocation;

  if (status === "loading") {
    return <ToolLoadingPill name={name} />;
  }

  const bot = extractChatbot(response);
  if (!bot) {
    return <ThemedGenericCard invocation={invocation} />;
  }

  const rows: Array<[string, string]> = [];
  if (bot.name) rows.push(["Name", bot.name]);
  if (bot.botId) rows.push(["Bot ID", bot.botId]);
  if (bot.email) rows.push(["Email", bot.email]);
  if (bot.url) rows.push(["URL", bot.url]);
  if (bot.embedCode) rows.push(["Embed", bot.embedCode]);

  return (
    <CardShell>
      <CardHeader icon="💬" title="Chatbot created" pill="Created" />
      {bot.message && (
        <div className="text-sm text-tool-card-muted-foreground mb-2">
          {bot.message}
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
