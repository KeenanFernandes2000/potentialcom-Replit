// client/src/lib/aylaVoice/sse.test.ts
import { describe, expect, it } from "vitest";
import type { ServerEvent } from "./protocol";
import { createEventParser } from "./sse";

describe("createEventParser", () => {
  it("reads data frames across chunk boundaries, skips pings and junk, keeps the last frame for end()", () => {
    const got: ServerEvent[] = [];
    const p = createEventParser((e) => got.push(e));
    p.push('data: {"type":"state","panel":null,"code":"idle","bookingUrl":null}\n\n: ping\n\nda');
    p.push('ta: {"type":"caption","role":"assistant","text":"Hi"}\r\n\r\ndata: not json\n\n');
    p.push('data: {"type":"session.update"}\n\ndata: {"type":"ended","reason":"silence"}');
    expect(got.map((e) => e.type)).toEqual(["state", "caption"]);
    p.end();
    expect(got.at(-1)).toEqual({ type: "ended", reason: "silence" });
  });
});
