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
      kind: "agent-response-stream";
      // Stable id for the LLM turn. Multiple events with the same
      // turnId update the same chat bubble (text grows token-by-token).
      // A new turnId starts a fresh bubble.
      turnId: string;
      text: string;
    }
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
  clear: () => void;
  regenerate: (messageId: string) => void;
}

export function useAgentChat(agentKey: string): UseAgentChat {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [status, setStatus] = useState<"idle" | "streaming">("idle");
  const [sessionId, setSessionId] = useState<string>(() => newSessionId());
  const abortRef = useRef<AbortController | null>(null);

  // Mirror messages into a ref so callbacks (regenerate) can read the
  // latest array without listing it in their deps. Cheaper than putting
  // messages in the regenerate dep array and re-binding on every render.
  const messagesRef = useRef<AgentMessage[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

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
              createdAt: Date.now(),
            },
          ];
        }
        case "agent-response": {
          // Mirror the user-transcript dedupe: voice workers can publish
          // the same assistant content twice when multiple paths fire
          // (onAgentText/SpeechCreated/ConversationItemAdded). The
          // versions differ in formatting: one carries the raw LLM
          // output (with markdown + emojis), one is the TTS-cleaned
          // string (no emojis, no markdown, line breaks → spaces).
          // Normalize to lowercase alphanumeric to catch both as the
          // same content. Compare against the last agent message only —
          // a genuine repeated reply across a user turn won't match
          // because there'd be a user message in between.
          const lastAgent = prev[prev.length - 1];
          if (lastAgent && lastAgent.role === "agent") {
            const normalize = (s: string) =>
              s.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 200);
            if (normalize(lastAgent.text) === normalize(event.text)) {
              // Keep the LONGER/RICHER text (usually the raw LLM output
              // with markdown) by replacing if incoming is longer.
              if (event.text.length > lastAgent.text.length) {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...lastAgent,
                  text: event.text,
                };
                return updated;
              }
              return prev;
            }
          }
          return [
            ...prev,
            {
              id: nextId("agent"),
              role: "agent",
              text: event.text,
              tools: [],
              status: "complete",
              createdAt: Date.now(),
            },
          ];
        }
        case "agent-response-stream": {
          // Streaming: find the existing agent message with this turnId
          // and replace its text (so the bubble grows token-by-token);
          // create a new agent message if none exists yet.
          const idx = prev.findIndex(
            (m) => m.role === "agent" && m.turnId === event.turnId,
          );
          if (idx === -1) {
            return [
              ...prev,
              {
                id: nextId("agent"),
                role: "agent",
                text: event.text,
                tools: [],
                status: "complete",
                turnId: event.turnId,
                createdAt: Date.now(),
              },
            ];
          }
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            text: event.text,
          };
          return updated;
        }
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
              createdAt: Date.now(),
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

  const clear = useCallback(() => {
    // Abort any in-flight stream so a half-complete agent message doesn't
    // get appended after the reset. The existing send() also clears
    // abortRef in its finally — the dual-write here is intentional: even
    // if send() is mid-await when clear() fires, the abort guarantees the
    // controller is torn down NOW.
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setSessionId(newSessionId());
    setStatus("idle");
  }, []);

  const send = useCallback(
    async (text: string, imageUrl?: string) => {
      if (!text.trim() || status === "streaming") return;

      const now = Date.now();
      const userMessage: AgentMessage = {
        id: nextId("user"),
        role: "user",
        text,
        tools: [],
        imageUrl,
        status: "complete",
        createdAt: now,
      };
      const agentId = nextId("agent");
      const agentMessage: AgentMessage = {
        id: agentId,
        role: "agent",
        text: "",
        tools: [],
        status: "streaming",
        createdAt: now,
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
            sessionId,
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
    [agentKey, status, sessionId, updateAgentMessage],
  );

  const regenerate = useCallback(
    (messageId: string): void => {
      if (status === "streaming") return; // don't allow mid-stream regen
      const current = messagesRef.current;
      const targetIdx = current.findIndex((m) => m.id === messageId);
      if (targetIdx === -1) return;

      // Walk backwards from targetIdx - 1 to find the immediately preceding
      // user message. If none exists, no-op.
      let userIdx = -1;
      for (let i = targetIdx - 1; i >= 0; i--) {
        if (current[i].role === "user") {
          userIdx = i;
          break;
        }
      }
      if (userIdx === -1) return;

      const userMessage = current[userIdx];

      // Trim up to (but NOT including) the preceding user message. send()
      // will re-append a fresh user + agent pair, so we drop the old user
      // turn too to avoid duplicating it.
      setMessages(current.slice(0, userIdx));

      // Re-fire the original send with the same text + imageUrl. send()
      // appends a new user + agent pair and kicks off the stream.
      void send(userMessage.text, userMessage.imageUrl);
    },
    [status, send],
  );

  return { messages, status, sessionId, send, pushExternalEvent, clear, regenerate };
}
