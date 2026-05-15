import type { AgentStreamEvent } from "@shared/agent";

// Converts one parsed `data:` JSON object into a normalized AgentStreamEvent.
// Returns null for shapes we don't recognize.
function toEvent(obj: any): AgentStreamEvent | null {
  if (obj && obj.type === "token" && typeof obj.content === "string") {
    return { kind: "token", content: obj.content };
  }
  if (obj && obj.toolCall && typeof obj.toolCall.name === "string") {
    return {
      kind: "toolCall",
      name: obj.toolCall.name,
      arguments: obj.toolCall.arguments,
      async: obj.toolCall.async !== false,
    };
  }
  if (obj && obj.toolResponse && typeof obj.toolResponse.name === "string") {
    return {
      kind: "toolResponse",
      name: obj.toolResponse.name,
      content: obj.toolResponse.content,
    };
  }
  if (obj && typeof obj.error === "string") {
    return { kind: "error", message: obj.error };
  }
  if (obj && obj.success === true) {
    return { kind: "done", response: typeof obj.response === "string" ? obj.response : "" };
  }
  return null;
}

export interface StreamParser {
  // Feed a decoded text chunk; returns any complete events found.
  // Incomplete trailing lines are buffered until the next push().
  push(chunk: string): AgentStreamEvent[];
}

export function createStreamParser(): StreamParser {
  let buffer = "";

  return {
    push(chunk: string): AgentStreamEvent[] {
      buffer += chunk;
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? ""; // keep the (possibly incomplete) last line

      const events: AgentStreamEvent[] = [];
      for (const line of lines) {
        const trimmed = line.trimEnd();
        if (!trimmed.startsWith("data: ")) continue;
        const payload = trimmed.slice("data: ".length);
        try {
          const obj = JSON.parse(payload);
          const event = toEvent(obj);
          if (event) events.push(event);
        } catch {
          // ignore unparseable / partial JSON lines
        }
      }
      return events;
    },
  };
}
