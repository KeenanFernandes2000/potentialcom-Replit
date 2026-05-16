import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRef } from "react";
import { useSmartScroll } from "./useSmartScroll";

// Helper: a jsdom HTMLElement with controllable scroll metrics + a real
// scroll listener.
function makeScrollEl(): HTMLDivElement {
  const el = document.createElement("div");
  // jsdom doesn't lay out elements — we set the metrics directly.
  Object.defineProperty(el, "scrollHeight", { value: 1000, writable: true });
  Object.defineProperty(el, "clientHeight", { value: 400, writable: true });
  Object.defineProperty(el, "scrollTop", { value: 0, writable: true });
  return el;
}

describe("useSmartScroll", () => {
  it("returns isNearBottom: true when ref is null (default-permissive)", () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      return useSmartScroll(ref);
    });
    expect(result.current.isNearBottom).toBe(true);
  });

  it("returns isNearBottom: true when scrolled within 120px of bottom", () => {
    const el = makeScrollEl();
    // scrollHeight 1000 - (scrollTop 550 + clientHeight 400) = 50 (< 120 → near bottom)
    (el as any).scrollTop = 550;

    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(el);
      return useSmartScroll(ref);
    });

    // Fire a scroll event to trigger recalc.
    act(() => {
      el.dispatchEvent(new Event("scroll"));
    });
    expect(result.current.isNearBottom).toBe(true);
  });

  it("returns isNearBottom: false when scrolled further than 120px from bottom", () => {
    const el = makeScrollEl();
    // scrollHeight 1000 - (scrollTop 100 + clientHeight 400) = 500 (> 120 → NOT near bottom)
    (el as any).scrollTop = 100;

    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(el);
      return useSmartScroll(ref);
    });

    act(() => {
      el.dispatchEvent(new Event("scroll"));
    });
    expect(result.current.isNearBottom).toBe(false);
  });

  it("scrollToBottom() sets scrollTop to scrollHeight on the ref'd element", () => {
    const el = makeScrollEl();
    (el as any).scrollTop = 0;
    // Mock scrollTo since jsdom doesn't implement smooth scrolling.
    const scrollToSpy = vi.fn();
    (el as any).scrollTo = scrollToSpy;

    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(el);
      return useSmartScroll(ref);
    });

    act(() => {
      result.current.scrollToBottom(true);
    });

    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 1000,
      behavior: "smooth",
    });
  });

  it("scrollToBottom(false) uses 'auto' behavior", () => {
    const el = makeScrollEl();
    const scrollToSpy = vi.fn();
    (el as any).scrollTo = scrollToSpy;

    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(el);
      return useSmartScroll(ref);
    });

    act(() => {
      result.current.scrollToBottom(false);
    });

    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 1000,
      behavior: "auto",
    });
  });
});
