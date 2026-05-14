import { describe, it, expect } from "vitest";
import { getAgent, POTENTIAL_API_BASE } from "./agents";

describe("getAgent", () => {
  it("returns the ruby agent config", () => {
    const agent = getAgent("ruby");
    expect(agent).toBeDefined();
    expect(typeof agent!.botId).toBe("string");
    expect(agent!.botId.length).toBeGreaterThan(0);
  });

  it("returns undefined for an unknown agent key", () => {
    expect(getAgent("does-not-exist")).toBeUndefined();
  });
});

describe("POTENTIAL_API_BASE", () => {
  it("points at the production API host", () => {
    expect(POTENTIAL_API_BASE).toBe("https://api.potential.com");
  });
});
