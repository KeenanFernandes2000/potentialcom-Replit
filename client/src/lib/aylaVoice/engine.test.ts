// client/src/lib/aylaVoice/engine.test.ts
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { chooseEngine, engineChoice, engineOverride, STATUS_TIMEOUT_MS, wantedEngine } from "./engine";

const never = () => new Promise<boolean>(() => {});
const counted = (answer: () => Promise<boolean>) => {
  let calls = 0;
  return {
    status: () => {
      calls++;
      return answer();
    },
    calls: () => calls,
  };
};

describe("the engine", () => {
  it("?ayla_voice=brain|vapi is a tester's override; anything else is none", () => {
    expect(engineOverride("?ayla_voice=brain")).toBe("brain");
    expect(engineOverride("?utm_source=x&ayla_voice=vapi")).toBe("vapi");
    expect(engineOverride("?ayla_voice=other")).toBeNull();
    expect(engineOverride("")).toBeNull();
  });

  it("the page wants the brain by default; only ?ayla_voice=vapi wants Vapi", () => {
    expect(wantedEngine("")).toBe("brain");
    expect(wantedEngine("?utm_source=x")).toBe("brain");
    expect(wantedEngine("?ayla_voice=other")).toBe("brain");
    expect(wantedEngine("?ayla_voice=brain")).toBe("brain");
    expect(wantedEngine("?ayla_voice=vapi")).toBe("vapi");
  });

  it("default: the brain when Ayla's server says it is available", async () => {
    expect(await chooseEngine(wantedEngine(""), async () => true)).toBe("brain");
  });

  it("default: Vapi when the server says no, fails, or is slow", async () => {
    expect(await chooseEngine(wantedEngine(""), async () => false)).toBe("vapi");
    expect(await chooseEngine(wantedEngine(""), async () => { throw new Error("x"); })).toBe("vapi");
    expect(await chooseEngine(wantedEngine(""), () => { throw new Error("sync"); })).toBe("vapi");
    const t0 = Date.now();
    expect(await chooseEngine(wantedEngine(""), never, 30)).toBe("vapi");
    expect(Date.now() - t0).toBeLessThan(1000);
  });

  it("the status check gives up after about 2.5 s by default", () => {
    expect(STATUS_TIMEOUT_MS).toBe(2500);
  });

  it("?ayla_voice=vapi forces Vapi without asking the server", async () => {
    const s = counted(async () => true);
    expect(await chooseEngine(wantedEngine("?ayla_voice=vapi"), s.status)).toBe("vapi");
    expect(s.calls()).toBe(0);
  });

  it("?ayla_voice=brain still needs the server to say available", async () => {
    expect(await chooseEngine(wantedEngine("?ayla_voice=brain"), async () => true)).toBe("brain");
    expect(await chooseEngine(wantedEngine("?ayla_voice=brain"), async () => false)).toBe("vapi");
    expect(await chooseEngine(wantedEngine("?ayla_voice=brain"), never, 30)).toBe("vapi");
  });

  it("engineChoice is lazy (no request until asked) and asks the server once per page", async () => {
    const s = counted(async () => true);
    const choice = engineChoice("", s.status);
    expect(s.calls()).toBe(0);
    const [a, b] = await Promise.all([choice(), choice()]);
    expect(await choice()).toBe("brain");
    expect([a, b]).toEqual(["brain", "brain"]);
    expect(s.calls()).toBe(1);
  });

  it("no build-time engine flag: Replit does not pass Secrets into the Vite build", () => {
    for (const f of ["./engine.ts", "../../pages/Ayla.tsx"]) {
      expect(readFileSync(fileURLToPath(new URL(f, import.meta.url)), "utf8")).not.toContain("VITE_AYLA_VOICE_ENGINE");
    }
  });
});
