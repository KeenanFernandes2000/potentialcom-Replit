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
}
