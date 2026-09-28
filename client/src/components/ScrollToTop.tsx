import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Restores scroll position on client-side navigation.
 *
 * wouter does not touch the scroll offset when the route changes, so following
 * a link from the footer left the visitor at the old offset on the new page —
 * e.g. "Talk to Ayla" landed ~2900px down /ayla, on an empty band well past
 * the hero and the form.
 *
 * Browsers restore scroll themselves on back/forward, so this only jumps for
 * forward navigation, and a #hash still wins over the top of the page.
 */
export function ScrollToTop() {
  const [pathname] = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const hash = window.location.hash;
    if (hash.length > 1) {
      // Let the new route paint before looking for the anchor.
      const target = document.querySelector(hash);
      if (target) {
        requestAnimationFrame(() =>
          target.scrollIntoView({ behavior: "auto", block: "start" }),
        );
        return;
      }
    }

    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;
