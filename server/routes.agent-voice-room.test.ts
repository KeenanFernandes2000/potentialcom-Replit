import { describe, it, expect, vi, afterEach } from "vitest";
import express from "express";
import request from "supertest";

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

describe("POST /api/agent/:agentKey/voice/room", () => {
  it("returns 404 for an unknown agent", async () => {
    const res = await request(makeApp())
      .post("/api/agent/nope/voice/room")
      .send({ sessionId: "s1" });
    expect(res.status).toBe(404);
  });

  it("forwards botId + sessionId to upstream and relays the response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          roomName: "bot-abc-session-s1-12345",
          token: "fake.jwt.token",
          wsUrl: "wss://livekit.potential.com",
          participantName: "user-12345",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const res = await request(makeApp())
      .post("/api/agent/ruby/voice/room")
      .send({ sessionId: "s1" });

    expect(res.status).toBe(200);
    expect(res.body.roomName).toBe("bot-abc-session-s1-12345");
    expect(res.body.token).toBe("fake.jwt.token");
    expect(res.body.wsUrl).toBe("wss://livekit.potential.com");

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(String(url)).toContain("/api/voice/room/create");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ "Content-Type": "application/json" });
    const body = JSON.parse(String(init.body));
    expect(body.botId).toBe("6a056e4ece71ae96a167f826");
    expect(body.sessionId).toBe("s1");
  });

  it("relays a 403 trial-exhausted upstream error verbatim", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: "Voice disabled: 10-minute voice trial exhausted",
          }),
          { status: 403, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );
    const res = await request(makeApp())
      .post("/api/agent/ruby/voice/room")
      .send({ sessionId: "s1" });
    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      error: "Voice disabled: 10-minute voice trial exhausted",
    });
  });

  it("returns 400 when sessionId is missing", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const res = await request(makeApp())
      .post("/api/agent/ruby/voice/room")
      .send({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: "sessionId is required" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
