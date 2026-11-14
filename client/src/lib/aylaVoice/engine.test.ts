// client/src/lib/aylaVoice/engine.test.ts
import { describe, expect, it } from "vitest";
import { chooseEngine, engineFlag, engineOverride } from "./engine";

describe("the engine", () => {
  it("the build flag is vapi unless it says brain", () => {
    expect(engineFlag(undefined)).toBe("vapi");
    expect(engineFlag("")).toBe("vapi");
    expect(engineFlag("brain")).toBe("brain");
    expect(engineFlag("BRAIN")).toBe("vapi");
  });
  it("?ayla_voice=brain|vapi overrides it (testers on the live site); anything else does not", () => {
    expect(engineOverride("?ayla_voice=brain")).toBe("brain");
    expect(engineOverride("?utm_source=x&ayla_voice=vapi")).toBe("vapi");
    expect(engineOverride("?ayla_voice=other")).toBeNull();
    expect(engineOverride("")).toBeNull();
  });
  it("brain only when the server says it is available; vapi when it says no, fails or is slow", async () => {
    expect(await chooseEngine("vapi", async () => true)).toBe("vapi");
    expect(await chooseEngine("brain", async () => true)).toBe("brain");
    expect(await chooseEngine("brain", async () => false)).toBe("vapi");
    expect(await chooseEngine("brain", async () => { throw new Error("x"); })).toBe("vapi");
  });
});
