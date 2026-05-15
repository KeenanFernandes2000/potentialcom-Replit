import ReactMarkdown from "react-markdown";
import { ToolCard } from "./ToolCard";
import type { ToolRegistry } from "./toolRegistry";
import type { AgentMessage } from "@shared/agent";
import { SpeakButton, type UseTextToSpeechResult } from "./voice";

interface MessageBubbleProps {
  message: AgentMessage;
  registry: ToolRegistry;
  tts?: UseTextToSpeechResult;
  ttsEnabled?: boolean;
}

// Renders one chat message: user messages right-aligned and plain; agent
// messages left-aligned with markdown plus any tool cards plus an
// optional speaker button (when tts is supplied and the bot supports it).
export function MessageBubble({
  message,
  registry,
  tts,
  ttsEnabled,
}: MessageBubbleProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-sm text-primary-foreground">
          {message.imageUrl && (
            <img
              src={message.imageUrl}
              alt="Uploaded"
              className="mb-2 max-h-40 rounded-lg"
            />
          )}
          <span>{message.text}</span>
        </div>
      </div>
    );
  }

  const canSpeak =
    !!tts &&
    !!ttsEnabled &&
    message.status === "complete" &&
    !!message.text &&
    message.text.trim().length > 0;

  return (
    <div className="flex flex-col gap-2">
      {message.tools.map((tool) => (
        <ToolCard key={tool.id} invocation={tool} registry={registry} />
      ))}
      {(message.text || message.status === "streaming") && (
        <div className="flex items-start gap-2">
          <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-muted px-4 py-2 text-sm">
            {message.text ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{message.text}</ReactMarkdown>
              </div>
            ) : (
              <span className="inline-flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0.3s]" />
              </span>
            )}
          </div>
          {canSpeak && tts && (
            <SpeakButton text={message.text} tts={tts} />
          )}
        </div>
      )}
    </div>
  );
}
