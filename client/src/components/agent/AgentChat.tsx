import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "./MessageBubble";
import { useAgentChat } from "./useAgentChat";
import type { ToolRegistry } from "./toolRegistry";
import type { AgentBotConfig } from "@shared/agent";

interface AgentChatProps {
  agentKey: string;
  registry: ToolRegistry;
}

// Generic, agent-agnostic chat panel. Fetches the agent's bot config (name,
// greeting, avatar) on mount, renders the conversation, and owns the input box.
export function AgentChat({ agentKey, registry }: AgentChatProps) {
  const { messages, status, send } = useAgentChat(agentKey);
  const [input, setInput] = useState("");
  const [bot, setBot] = useState<AgentBotConfig | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/agent/${agentKey}/bot`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data) setBot(data as AgentBotConfig);
      })
      .catch(() => {
        /* greeting is optional — ignore config failures */
      });
    return () => {
      cancelled = true;
    };
  }, [agentKey]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status === "streaming") return;
    const text = input;
    setInput("");
    void send(text);
  };

  return (
    <div className="mx-auto flex h-[600px] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        {bot?.avatarUrl && (
          <img
            src={bot.avatarUrl}
            alt={bot.name}
            className="h-9 w-9 rounded-full object-cover"
          />
        )}
        <div>
          <div className="text-sm font-semibold">{bot?.name ?? "Ruby"}</div>
          <div className="text-xs text-muted-foreground">AI Beauty Concierge</div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && bot?.greeting && (
          <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-muted px-4 py-2 text-sm">
            {bot.greeting}
          </div>
        )}
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            registry={registry}
          />
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-border bg-card p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Ruby anything…"
          className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
          data-testid="agent-chat-input"
        />
        <Button
          type="submit"
          size="icon"
          className="rounded-full"
          disabled={status === "streaming" || !input.trim()}
          data-testid="agent-chat-send"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
