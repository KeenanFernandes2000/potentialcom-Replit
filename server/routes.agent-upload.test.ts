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

describe("POST /api/agent/:agentKey/upload", () => {
  it("returns 404 for an unknown agent", async () => {
    const res = await request(makeApp())
      .post("/api/agent/nope/upload")
      .attach("file", Buffer.from("fake-image"), "photo.png");
    expect(res.status).toBe(404);
  });

  it("forwards the upload to the upstream and returns its response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ filename: "uploaded-123.png" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const res = await request(makeApp())
      .post("/api/agent/ruby/upload")
      .attach("file", Buffer.from("fake-image"), "photo.png");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ filename: "uploaded-123.png" });
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(String(fetchMock.mock.calls[0][0])).toContain("/streaming/upload");
  });
});
