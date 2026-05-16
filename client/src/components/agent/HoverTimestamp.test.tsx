import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HoverTimestamp, relativeTime } from "./HoverTimestamp";

describe("relativeTime", () => {
  const NOW = 1_700_000_000_000;

  it("returns 'just now' for ages under 60 seconds", () => {
    expect(relativeTime(NOW - 0, NOW)).toBe("just now");
    expect(relativeTime(NOW - 59_000, NOW)).toBe("just now");
  });

  it("returns 'Xm ago' for ages under 60 minutes", () => {
    expect(relativeTime(NOW - 60_000, NOW)).toBe("1m ago");
    expect(relativeTime(NOW - 5 * 60_000, NOW)).toBe("5m ago");
    expect(relativeTime(NOW - 59 * 60_000, NOW)).toBe("59m ago");
  });

  it("returns 'Xh ago' for ages under 24 hours", () => {
    expect(relativeTime(NOW - 60 * 60_000, NOW)).toBe("1h ago");
    expect(relativeTime(NOW - 3 * 60 * 60_000, NOW)).toBe("3h ago");
    expect(relativeTime(NOW - 23 * 60 * 60_000, NOW)).toBe("23h ago");
  });

  it("returns 'Xd ago' for ages under 7 days", () => {
    expect(relativeTime(NOW - 24 * 60 * 60_000, NOW)).toBe("1d ago");
    expect(relativeTime(NOW - 6 * 24 * 60 * 60_000, NOW)).toBe("6d ago");
  });

  it("returns a localeDateString for ages >= 7 days", () => {
    const result = relativeTime(NOW - 8 * 24 * 60 * 60_000, NOW);
    // Don't assert exact format (locale-dependent), just that it's not the
    // earlier-format strings.
    expect(result).not.toMatch(/ago$/);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("HoverTimestamp", () => {
  it("renders the relative time for the given createdAt", () => {
    const now = Date.now();
    render(<HoverTimestamp createdAt={now - 5 * 60_000} />);
    expect(screen.getByText(/5m ago/i)).toBeInTheDocument();
  });
});
