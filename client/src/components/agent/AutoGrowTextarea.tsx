import { useEffect, useRef } from "react";

interface AutoGrowTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  /**
   * When this number/string changes, the textarea receives focus.
   * Parent bumps it on mount, after successful send, and on clear().
   */
  autoFocusKey?: number | string;
  /** Maximum visible height in pixels before the textarea scrolls. */
  maxHeight?: number;
}

const DEFAULT_MAX_HEIGHT = 160;

/**
 * Textarea that auto-resizes with its content up to `maxHeight`.
 * - Enter (no Shift) submits + prevents default newline.
 * - Shift+Enter inserts a newline (default browser behavior).
 * - Disabled blocks both typing and submit.
 * - autoFocusKey lets the parent declaratively trigger focus.
 *
 * Styling matches the prior chat input: muted/40 at rest, focus flips
 * to background + brand primary ring.
 */
export function AutoGrowTextarea({
  value,
  onChange,
  onSubmit,
  placeholder,
  disabled = false,
  autoFocusKey = 0,
  maxHeight = DEFAULT_MAX_HEIGHT,
}: AutoGrowTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Auto-resize: reset height to auto so scrollHeight shrinks back, then
  // set to scrollHeight (capped). Runs on every value change.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const newHeight = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${newHeight}px`;
  }, [value, maxHeight]);

  // autoFocusKey-driven focus.
  useEffect(() => {
    ref.current?.focus();
  }, [autoFocusKey]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          if (disabled) return;
          onSubmit();
        }
      }}
      placeholder={placeholder}
      disabled={disabled}
      rows={1}
      className="flex-1 min-h-[44px] resize-none rounded-2xl border border-border bg-muted/40 px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-all focus:border-primary/60 focus:bg-background focus:ring-2 focus:ring-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
      data-testid="agent-chat-input"
    />
  );
}
