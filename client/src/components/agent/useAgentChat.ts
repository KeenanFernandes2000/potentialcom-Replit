import { useCallback, useEffect, useRef, useState } from "react";
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

export type ExternalVoiceEvent =
  | { kind: "user-transcript"; text: string }
  | { kind: "agent-response"; text: string }
  | {
      kind: "tool-call";
      id: string;
      name: string;
      args: unknown;
      async: boolean;
    }
  | { kind: "tool-result"; id: string; result: unknown };

export interface UseAgentChat {
  messages: AgentMessage[];
  status: "idle" | "streaming";
  sessionId: string;
  send: (text: string, imageUrl?: string) => Promise<void>;
  pushExternalEvent: (event: ExternalVoiceEvent) => void;
}

export function useAgentChat(agentKey: string): UseAgentChat {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [status, setStatus] = useState<"idle" | "streaming">("idle");
  const sessionIdRef = useRef<string>(newSessionId());
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Mutates the agent message with the given id via an updater function.
  const updateAgentMessage = useCallback(
    (id: string, updater: (msg: AgentMessage) => AgentMessage) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? updater(m) : m)),
      );
    },
    [],
  );

  // Inject events from a parallel channel (e.g., the voice WebSocket).
  // Events follow the same lifecycle conventions as the SSE-driven
  // typed chat — user messages are complete, agent messages start
  // complete (voice TTS is server-side, not streamed token-by-token),
  // and tool calls attach to the most recent agent message.
  const pushExternalEvent = useCallback((event: ExternalVoiceEvent) => {
    setMessages((prev) => {
      switch (event.kind) {
        case "user-transcript": {
          // Voice workers commonly emit the same transcript twice — once
          // from a streaming STT event (e.g. UserInputTranscribed) and once
          // when the conversation item commits (ConversationItemAdded).
          // If the most recent message is already a user message with the
          // same trimmed text, treat the new event as a refresh of that
          // turn rather than a new utterance.
          const last = prev[prev.length - 1];
          const incoming = event.text.trim();
          if (
            last &&
            last.role === "user" &&
            last.text.trim() === incoming
          ) {
            return prev;
          }
          return [
            ...prev,
            {
              id: nextId("user"),
              role: "user",
              text: event.text,
              tools: [],
              status: "complete",
            },
          ];
        }
        case "agent-response":
          return [
            ...prev,
            {
              id: nextId("agent"),
              role: "agent",
              text: event.text,
              tools: [],
              status: "complete",
            },
          ];
        case "tool-call": {
          const invocation: ToolInvocation = {
            id: event.id,
            name: event.name,
            arguments: event.args,
            status: "loading",
          };
          // Attach to the last agent message if one exists; otherwise
          // open a new agent message to host the invocation.
          const lastIdx = prev.length - 1;
          if (lastIdx >= 0 && prev[lastIdx].role === "agent") {
            const last = prev[lastIdx];
            return [
              ...prev.slice(0, lastIdx),
              { ...last, tools: [...last.tools, invocation] },
            ];
          }
          return [
            ...prev,
            {
              id: nextId("agent"),
              role: "agent",
              text: "",
              tools: [invocation],
              status: "complete",
            },
          ];
        }
        case "tool-result":
          return prev.map((m) =>
            m.role === "agent" && m.tools.some((t) => t.id === event.id)
              ? {
                  ...m,
                  tools: m.tools.map((t) =>
                    t.id === event.id
                      ? { ...t, status: "complete", response: event.result }
                      : t,
                  ),
                }
              : m,
          );
      }
    });
  }, []);

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

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(`/api/agent/${agentKey}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          signal: controller.signal,
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
                // Match by tool name only: upstream toolResponse events carry
                // no arguments, so they can't be matched against the toolCall
                // invocation id (which includes the arguments). We attach to
                // the most recent still-loading invocation of this tool name.
                // Limitation: two concurrent calls to the SAME tool with
                // different arguments could mis-attach. Acceptable for the
                // single-call golden path; revisit if upstream adds a
                // correlation id.
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
        if (controller.signal.aborted) return;
        console.error("useAgentChat send error:", err);
        updateAgentMessage(agentId, (m) => ({
          ...m,
          text:
            m.text ||
            "Sorry, something went wrong reaching the agent. Please try again.",
          status: "error",
        }));
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
        setStatus("idle");
      }
    },
    [agentKey, status, updateAgentMessage],
  );

  return { messages, status, sessionId: sessionIdRef.current, send, pushExternalEvent };
}
