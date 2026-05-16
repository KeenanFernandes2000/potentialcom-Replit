// Normalized events emitted by parseAgentStream from the agent SSE stream.
export type AgentStreamEvent =
  | { kind: "token"; content: string }
  | { kind: "toolCall"; name: string; arguments: unknown; async: boolean }
  | { kind: "toolResponse"; name: string; content: unknown }
  | { kind: "error"; message: string }
  | { kind: "done"; response: string };

// A tool invocation tracked in a message: starts "loading", becomes "complete"
// when its matching toolResponse arrives.
export interface ToolInvocation {
  id: string; // dedupe key: `${name}-${JSON.stringify(arguments)}`
  name: string;
  arguments: unknown;
  response?: unknown; // undefined until the toolResponse event
  status: "loading" | "complete";
}

// One chat message in the conversation.
export interface AgentMessage {
  id: string;
  role: "user" | "agent";
  text: string;
  tools: ToolInvocation[];
  imageUrl?: string; // set on user messages that included an uploaded image
  status: "streaming" | "complete" | "error";
  // For voice-streamed agent messages: stable identifier per LLM turn so
  // subsequent ai_response_stream events from the same turn can find and
  // update this message instead of appending a new one. Absent for
  // typed-chat messages and for non-streaming voice paths.
  turnId?: string;
  // Wall-clock time (Date.now()) the message was first created. Used by
  // the UI to render a hover timestamp on each message bubble. Required:
  // every message-creation site in useAgentChat sets this explicitly.
  createdAt: number;
}

// Request body sent to POST /api/agent/:agentKey/chat
export interface AgentChatRequest {
  message: string;
  sessionId: string;
}

// Response from GET /api/agent/:agentKey/bot (whitelisted fields only)
export interface AgentBotConfig {
  name: string;
  greeting: string;
  avatarUrl: string;
  audiostt: boolean;   // true → mic button is allowed
  audiotts: boolean;   // true → speaker buttons + auto-speak are allowed
}
