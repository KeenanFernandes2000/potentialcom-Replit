import { describe, it, expect } from "vitest";
import { createStreamParser } from "./parseAgentStream";

describe("createStreamParser", () => {
  it("parses a single token event", () => {
    const p = createStreamParser();
    const events = p.push('data: {"type":"token","content":"Hi","node":"agent"}\n\n');
    expect(events).toEqual([{ kind: "token", content: "Hi" }]);
  });

  it("buffers a line split across two chunks", () => {
    const p = createStreamParser();
    expect(p.push('data: {"type":"token","con')).toEqual([]);
    expect(p.push('tent":"Hi","node":"agent"}\n')).toEqual([
      { kind: "token", content: "Hi" },
    ]);
  });

  it("parses a toolCall event and defaults async to true", () => {
    const p = createStreamParser();
    const events = p.push(
      'data: {"toolCall":{"name":"get_shopify_products","arguments":{"query":"lipstick"}}}\n',
    );
    expect(events).toEqual([
      {
        kind: "toolCall",
        name: "get_shopify_products",
        arguments: { query: "lipstick" },
        async: true,
      },
    ]);
  });

  it("respects an explicit async:false on a toolCall", () => {
    const p = createStreamParser();
    const events = p.push(
      'data: {"toolCall":{"name":"add_to_cart","arguments":{},"async":false}}\n',
    );
    expect(events).toEqual([
      { kind: "toolCall", name: "add_to_cart", arguments: {}, async: false },
    ]);
  });

  it("parses a toolResponse event", () => {
    const p = createStreamParser();
    const events = p.push(
      'data: {"toolResponse":{"name":"track_order","content":"{\\"id\\":2099}"}}\n',
    );
    expect(events).toEqual([
      { kind: "toolResponse", name: "track_order", content: '{"id":2099}' },
    ]);
  });

  it("parses an error event", () => {
    const p = createStreamParser();
    const events = p.push('data: {"error":"upstream failed"}\n');
    expect(events).toEqual([{ kind: "error", message: "upstream failed" }]);
  });

  it("parses the final done event", () => {
    const p = createStreamParser();
    const events = p.push(
      'data: {"success":true,"response":"All done","toolCalls":null,"bot":{}}\n',
    );
    expect(events).toEqual([{ kind: "done", response: "All done" }]);
  });

  it("skips unparseable lines without throwing", () => {
    const p = createStreamParser();
    const events = p.push(
      'data: {bad json\ndata: {"type":"token","content":"ok","node":"agent"}\n',
    );
    expect(events).toEqual([{ kind: "token", content: "ok" }]);
  });

  it("ignores lines that do not start with 'data: '", () => {
    const p = createStreamParser();
    expect(p.push("\n: keep-alive comment\n")).toEqual([]);
  });

  it("handles multiple events in one chunk", () => {
    const p = createStreamParser();
    const events = p.push(
      'data: {"type":"token","content":"a","node":"agent"}\n' +
        'data: {"type":"token","content":"b","node":"agent"}\n',
    );
    expect(events).toEqual([
      { kind: "token", content: "a" },
      { kind: "token", content: "b" },
    ]);
  });
});
