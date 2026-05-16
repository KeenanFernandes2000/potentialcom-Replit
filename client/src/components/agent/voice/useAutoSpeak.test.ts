import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAutoSpeak } from "./useAutoSpeak";

beforeEach(() => {
  localStorage.clear();
});

describe("useAutoSpeak", () => {
  it("defaults to false when no localStorage value is set", () => {
    const { result } = renderHook(() => useAutoSpeak());
    expect(result.current.enabled).toBe(false);
  });

  it("reads an existing localStorage value on mount", () => {
    localStorage.setItem("ruby:autoSpeak:v2", "true");
    const { result } = renderHook(() => useAutoSpeak());
    expect(result.current.enabled).toBe(true);
  });

  it("setEnabled persists to localStorage", () => {
    const { result } = renderHook(() => useAutoSpeak());
    act(() => {
      result.current.setEnabled(true);
    });
    expect(result.current.enabled).toBe(true);
    expect(localStorage.getItem("ruby:autoSpeak:v2")).toBe("true");
  });

  it("setEnabled(false) clears the localStorage value back to disabled", () => {
    localStorage.setItem("ruby:autoSpeak:v2", "true");
    const { result } = renderHook(() => useAutoSpeak());
    act(() => {
      result.current.setEnabled(false);
    });
    expect(result.current.enabled).toBe(false);
    expect(localStorage.getItem("ruby:autoSpeak:v2")).toBe("false");
  });

  it("syncs across instances via a custom window event", () => {
    const a = renderHook(() => useAutoSpeak());
    const b = renderHook(() => useAutoSpeak());
    expect(a.result.current.enabled).toBe(false);
    expect(b.result.current.enabled).toBe(false);
    act(() => {
      a.result.current.setEnabled(true);
    });
    // Both hook instances must reflect the new value, even though only
    // `a` called setEnabled. This is the load-bearing guarantee that
    // toggling AutoSpeakToggle re-runs AgentChat's auto-speak effect.
    expect(a.result.current.enabled).toBe(true);
    expect(b.result.current.enabled).toBe(true);
  });
});
