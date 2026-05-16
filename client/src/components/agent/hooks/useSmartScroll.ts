import { useCallback, useEffect, useState } from "react";

/**
 * Threshold (in pixels) within which the user is considered "near the
 * bottom" of the scrollable element. Auto-scroll triggers when this is
 * true; the "↓ Latest message" pill renders when it's false.
 */
const NEAR_BOTTOM_THRESHOLD = 120;

export interface UseSmartScrollResult {
  /**
   * True if the user is within NEAR_BOTTOM_THRESHOLD of the bottom of
   * the scrollable element, OR if the ref is not yet attached.
   * Default-permissive: prevents the pill from flashing on first paint
   * before the ref has bound.
   */
  isNearBottom: boolean;
  /**
   * Programmatically scroll the element to its bottom. Pass smooth=true
   * for animated scroll, false for instant.
   */
  scrollToBottom: (smooth?: boolean) => void;
}

/**
 * Tracks whether the user is near the bottom of a scrollable element,
 * and exposes a programmatic scroll-to-bottom callback. Used by
 * AgentChat to decide whether new-message auto-scroll fires, and to
 * show/hide the ScrollToLatestPill.
 *
 * Listens to native 'scroll' events; recomputes synchronously on each
 * event for test-friendliness. If profiling shows scroll thrashing we
 * can wrap in requestAnimationFrame later.
 */
export function useSmartScroll(
  ref: React.RefObject<HTMLElement>,
): UseSmartScrollResult {
  const [isNearBottom, setIsNearBottom] = useState<boolean>(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const recalc = () => {
      const distanceFromBottom =
        el.scrollHeight - (el.scrollTop + el.clientHeight);
      setIsNearBottom(distanceFromBottom < NEAR_BOTTOM_THRESHOLD);
    };

    // Compute once on mount in case the element starts not-at-bottom.
    recalc();
    el.addEventListener("scroll", recalc, { passive: true });
    return () => {
      el.removeEventListener("scroll", recalc);
    };
  }, [ref]);

  const scrollToBottom = useCallback(
    (smooth: boolean = true) => {
      const el = ref.current;
      if (!el) return;
      el.scrollTo({
        top: el.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    },
    [ref],
  );

  return { isNearBottom, scrollToBottom };
}
