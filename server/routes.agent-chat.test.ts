import { describe, it, expect, vi, afterEach } from "vitest";
import express from "express";
import request from "supertest";

// Mock heavy server-side dependencies that require env vars or DB connections
vi.mock("./storage", () => ({ storage: {} }));
vi.mock("./db", () => ({}));
vi.mock("@sendgrid/mail", () => ({ default: { setApiKey: vi.fn() } }));
vi.mock("./wp-proxy", () => ({ proxyWordPressRequest: vi.fn() }));

import { registerRoutes } from "./routes";

function makeApp() {
  const app = express();
  app.use(express.json());
  registerRoutes(app);
  return app;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("POST /api/agent/:agentKey/chat", () => {
  it("returns 404 for an unknown agent", async () => {
    const res = await request(makeApp())
      .post("/api/agent/nope/chat")
      .send({ message: "hi", sessionId: "s-1" });
    expect(res.status).toBe(404);
  });

  it("forwards the message and pipes the upstream stream back", async () => {
    const upstreamBody =
      'data: {"type":"token","content":"Hi","node":"agent"}\n\n' +
      'data: {"success":true,"response":"Hi","toolCalls":null,"bot":{}}\n\n';
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(upstreamBody, {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const res = await request(makeApp())
      .post("/api/agent/ruby/chat")
      .send({ message: "hello", sessionId: "s-2" });

    expect(res.status).toBe(200);
    expect(res.text).toContain('"content":"Hi"');
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/agent/chatbot/");
    expect(String(url)).toContain("/chat");
    expect(JSON.parse(init.body as string)).toEqual({
      message: "hello",
      sessionId: "s-2",
    });
  });

  it("returns the upstream status when upstream fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("nope", { status: 503 })),
    );
    const res = await request(makeApp())
      .post("/api/agent/ruby/chat")
      .send({ message: "hello", sessionId: "s-3" });
    expect(res.status).toBe(503);
  });
});
