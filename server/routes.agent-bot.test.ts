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

  it("returns only whitelisted fields and never the system prompt", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          _id: "6a056e4ece71ae96a167f826",
          name: "RUBY — AI BEAUTY CONCIERGE",
          imageName: "ruby-avatar.jpeg",
          description: "AI Customer Service bot",
          greeting: "Hi! I'm Ruby.",
          sectionTitle: "Customer Service",
          system: "SECRET SYSTEM PROMPT — must not leak",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const res = await request(makeApp()).get("/api/agent/ruby/bot");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      name: "RUBY — AI BEAUTY CONCIERGE",
      greeting: "Hi! I'm Ruby.",
      avatarUrl:
        "https://api.potential.com/static/mentors/ruby-avatar.jpeg",
    });
    expect(JSON.stringify(res.body)).not.toContain("SECRET SYSTEM PROMPT");
    expect(res.body).not.toHaveProperty("system");
    expect(res.body).not.toHaveProperty("_id");
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
