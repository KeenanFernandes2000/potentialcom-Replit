import { useState } from "react";
import { Copy, Check, RotateCcw, AlertCircle } from "lucide-react";
import type { AgentMessage } from "@shared/agent";

interface MessageActionsProps {
  message: AgentMessage;
  /**
   * True when this is the most recent agent message in the conversation.
   * Gates the Regenerate button (we don't allow regenerating an older
   * reply because the user has already moved past it).
   */
  isLast: boolean;
  /**
   * Invoked with the target message id when the user clicks Regenerate
   * or Retry. Maps to useAgentChat.regenerate(id).
   */
  onRegenerate: (messageId: string) => void;
}

/**
 * Hover-revealed row of per-message actions, rendered below an agent
 * bubble. The parent uses `group` + `group-hover:opacity-100` to fade
 * the row in. Buttons themselves are always focusable (so they're
 * keyboard-accessible even without hover).
 *
 * Layout: copy + (regenerate | retry). Each button has an explicit
 * aria-label for screen readers AND a title attribute for hover tooltip.
 */
export function MessageActions({
  message,
  isLast,
  onRegenerate,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const isError = message.status === "error";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Silent failure — clipboard is gated on secure contexts.
    }
  };

  return (
    <div className="flex items-center gap-1 mt-1 opacity-0 transition-opacity group-hover:opacity-100">
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Copied" : "Copy"}
        title={copied ? "Copied" : "Copy message"}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        data-testid="message-actions-copy"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>

      {isLast && isError && (
        <button
          type="button"
          onClick={() => onRegenerate(message.id)}
          aria-label="Retry"
          title="Retry this message"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-destructive transition-colors hover:bg-destructive/10"
          data-testid="message-actions-retry"
        >
          <AlertCircle className="h-3.5 w-3.5" />
        </button>
      )}

      {isLast && !isError && message.status === "complete" && (
        <button
          type="button"
          onClick={() => onRegenerate(message.id)}
          aria-label="Regenerate"
          title="Regenerate response"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          data-testid="message-actions-regenerate"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
