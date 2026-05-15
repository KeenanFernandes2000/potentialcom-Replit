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

describe("POST /api/agent/:agentKey/speak", () => {
  it("returns 404 for an unknown agent", async () => {
    const res = await request(makeApp())
      .post("/api/agent/nope/speak")
      .send({ text: "hi" });
    expect(res.status).toBe(404);
  });

  it("forwards the JSON body to the upstream and streams the audio back", async () => {
    const audioBytes = new Uint8Array([0x49, 0x44, 0x33, 0x04]); // "ID3" header
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(audioBytes, {
        status: 200,
        headers: { "Content-Type": "audio/mpeg" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const res = await request(makeApp())
      .post("/api/agent/ruby/speak")
      .send({ text: "hello listener" });

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("audio/mpeg");
    expect(res.body).toEqual(Buffer.from(audioBytes));

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(String(url)).toContain("/agent/chatbot/");
    expect(String(url)).toContain("/speak");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ "Content-Type": "application/json" });
    expect(JSON.parse(String(init.body))).toEqual({ text: "hello listener" });
  });

  it("relays JSON error responses from the upstream", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ success: false, error: "TTS not enabled for this bot" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );
    const res = await request(makeApp())
      .post("/api/agent/ruby/speak")
      .send({ text: "hi" });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      success: false,
      error: "TTS not enabled for this bot",
    });
  });
});
