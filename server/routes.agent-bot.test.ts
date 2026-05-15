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

describe("GET /api/agent/:agentKey/bot", () => {
  it("returns 404 for an unknown agent", async () => {
    const res = await request(makeApp()).get("/api/agent/nope/bot");
    expect(res.status).toBe(404);
  });

  it("forwards the whitelisted fields including audio gating flags", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            name: "RUBY — AI BEAUTY CONCIERGE",
            greeting: "Hi!",
            imageName: "ruby.png",
            audiostt: true,
            audiotts: true,
            system: "should NOT be exposed",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );
    const res = await request(makeApp()).get("/api/agent/ruby/bot");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      name: "RUBY — AI BEAUTY CONCIERGE",
      greeting: "Hi!",
      avatarUrl: expect.stringContaining("/static/mentors/ruby.png"),
      audiostt: true,
      audiotts: true,
    });
    expect(res.body.system).toBeUndefined();
  });

  it("defaults audio flags to false when upstream omits them", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ name: "R", greeting: "G" }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );
    const res = await request(makeApp()).get("/api/agent/ruby/bot");
    expect(res.body.audiostt).toBe(false);
    expect(res.body.audiotts).toBe(false);
  });

  it("returns the upstream status when upstream fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("nope", { status: 500 })),
    );
    const res = await request(makeApp()).get("/api/agent/ruby/bot");
    expect(res.status).toBe(500);
  });
});
