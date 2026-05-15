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

describe("POST /api/agent/:agentKey/transcribe", () => {
  it("returns 404 for an unknown agent", async () => {
    const res = await request(makeApp())
      .post("/api/agent/nope/transcribe")
      .attach("audio", Buffer.from("fake-audio"), "clip.webm");
    expect(res.status).toBe(404);
  });

  it("forwards the multipart audio to the upstream and returns its JSON", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, text: "hello ruby" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const res = await request(makeApp())
      .post("/api/agent/ruby/transcribe")
      .attach("audio", Buffer.from("fake-audio"), "clip.webm");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, text: "hello ruby" });
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      "/agent/chatbot/",
    );
    expect(String(fetchMock.mock.calls[0][0])).toContain("/transcribe");
  });

  it("returns the upstream status when upstream fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ success: false, error: "STT not enabled for this bot" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );
    const res = await request(makeApp())
      .post("/api/agent/ruby/transcribe")
      .attach("audio", Buffer.from("fake-audio"), "clip.webm");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      success: false,
      error: "STT not enabled for this bot",
    });
  });
});
