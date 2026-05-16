import { ArrowDown } from "lucide-react";

interface ScrollToLatestPillProps {
  onClick: () => void;
}

/**
 * Floating pill that surfaces when the user has scrolled up from the
 * bottom of the message list. One-click jump back to the latest.
 * The parent (AgentChat) controls visibility — this component renders
 * unconditionally and assumes the parent only mounts it when needed.
 *
 * Visual: absolute-positioned over the bottom-center of the messages
 * area, primary-tinted pill, with a subtle shadow so it floats above
 * the message text.
 */
export function ScrollToLatestPill({ onClick }: ScrollToLatestPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Scroll to latest message"
      className="absolute bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
      data-testid="scroll-to-latest-pill"
    >
      <ArrowDown className="h-3.5 w-3.5" />
      Latest message
    </button>
  );
}
