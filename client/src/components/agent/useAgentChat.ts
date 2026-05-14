import { useCallback, useRef, useState } from "react";
import type { AgentMessage, ToolInvocation } from "@shared/agent";
import { createStreamParser } from "./parseAgentStream";

let idCounter = 0;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

function newSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export interface UseAgentChat {
  messages: AgentMessage[];
  status: "idle" | "streaming";
  send: (text: string, imageUrl?: string) => Promise<void>;
}

export function useAgentChat(agentKey: string): UseAgentChat {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [status, setStatus] = useState<"idle" | "streaming">("idle");
  const sessionIdRef = useRef<string>(newSessionId());

  // Mutates the agent message with the given id via an updater function.
  const updateAgentMessage = useCallback(
    (id: string, updater: (msg: AgentMessage) => AgentMessage) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? updater(m) : m)),
      );
    },
    [],
  );

  const send = useCallback(
    async (text: string, imageUrl?: string) => {
      if (!text.trim() || status === "streaming") return;

      const userMessage: AgentMessage = {
        id: nextId("user"),
        role: "user",
        text,
        tools: [],
        imageUrl,
        status: "complete",
      };
      const agentId = nextId("agent");
      const agentMessage: AgentMessage = {
        id: agentId,
        role: "agent",
        text: "",
        tools: [],
        status: "streaming",
      };
      setMessages((prev) => [...prev, userMessage, agentMessage]);
      setStatus("streaming");

      try {
        const res = await fetch(`/api/agent/${agentKey}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            message: text,
            sessionId: sessionIdRef.current,
          }),
        });

        if (!res.ok || !res.body) {
          updateAgentMessage(agentId, (m) => ({
            ...m,
            text: "Sorry, I couldn't reach the agent. Please try again.",
            status: "error",
          }));
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        const parser = createStreamParser();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const events = parser.push(decoder.decode(value, { stream: true }));

          for (const event of events) {
            if (event.kind === "token") {
              updateAgentMessage(agentId, (m) => ({
                ...m,
                text: m.text + event.content,
              }));
            } else if (event.kind === "toolCall") {
              const invocation: ToolInvocation = {
                id: `${event.name}-${JSON.stringify(event.arguments)}`,
                name: event.name,
                arguments: event.arguments,
                status: "loading",
              };
              updateAgentMessage(agentId, (m) =>
                m.tools.some((t) => t.id === invocation.id)
                  ? m
                  : { ...m, tools: [...m.tools, invocation] },
              );
            } else if (event.kind === "toolResponse") {
              updateAgentMessage(agentId, (m) => {
                // Attach the response to the most recent loading invocation
                // for this tool name.
                const idx = [...m.tools]
                  .map((t, i) => ({ t, i }))
                  .reverse()
                  .find(
                    ({ t }) =>
                      t.name === event.name && t.status === "loading",
                  )?.i;
                if (idx === undefined) return m;
                const tools = m.tools.slice();
                tools[idx] = {
                  ...tools[idx],
                  response: event.content,
                  status: "complete",
                };
                return { ...m, tools };
              });
            } else if (event.kind === "error") {
              updateAgentMessage(agentId, (m) => ({
                ...m,
                text: m.text
                  ? `${m.text}\n\n_Error: ${event.message}_`
                  : `Error: ${event.message}`,
                status: "error",
              }));
            } else if (event.kind === "done") {
              updateAgentMessage(agentId, (m) => ({
                ...m,
                // Prefer the streamed text; fall back to the final response.
                text: m.text || event.response,
                status: m.status === "error" ? "error" : "complete",
              }));
            }
          }
        }

        // Stream ended without an explicit done event — finalize anyway.
        updateAgentMessage(agentId, (m) =>
          m.status === "streaming" ? { ...m, status: "complete" } : m,
        );
      } catch (err) {
        console.error("useAgentChat send error:", err);
        updateAgentMessage(agentId, (m) => ({
          ...m,
          text:
            m.text ||
            "Sorry, something went wrong reaching the agent. Please try again.",
          status: "error",
        }));
      } finally {
        setStatus("idle");
      }
    },
    [agentKey, status, updateAgentMessage],
  );

  return { messages, status, send };
}
