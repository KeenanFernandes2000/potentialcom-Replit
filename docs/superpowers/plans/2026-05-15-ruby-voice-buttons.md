# Ruby Voice Buttons (STT + TTS) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add asynchronous voice input (mic button → Deepgram → transcript in input box) and voice output (per-message speaker buttons + global auto-speak toggle → ElevenLabs → playback) to Ruby's chat on `/demo`.

**Architecture:** Reuse the existing Deepgram + ElevenLabs setup in potentialTS by splitting its combined `chatWithBotVoice` controller into two new dedicated endpoints — `transcribe` (Deepgram only, returns JSON `{text}`) and `speak` (ElevenLabs only, returns `audio/mpeg`). Mirror them with two thin Express proxy routes in this repo, then wire 5 small React files into the existing `AgentChat`. Auth, API keys, voice ID (`pNInz6obpgDQGcFmaJgB`), and per-bot gating flags (`audiostt`/`audiotts`) are all already in place.

**Tech Stack:** React 18 + TypeScript + Vite + Express 4 + Vitest + `@testing-library/react` (this repo); Express + `@deepgram/sdk` + ElevenLabs HTTP API (potentialTS). No new runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-05-15-ruby-voice-buttons-design.md` (commit `5a6906f`).

**Cross-repo notes:**
- This plan touches two repos: `/Users/potdev/Documents/GitHub/potentialTS` (Tasks 1–2) and `/Users/potdev/Documents/GitHub/potentialcom-Replit` (Tasks 3–13).
- `potentialTS` has no test infrastructure — its tasks ship endpoint code only. Validation for those endpoints lives in this repo's proxy tests + manual smoke.
- This repo runs on Node 20 via `PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH`.

---

## Task 1: potentialTS — add `POST /agent/chatbot/:id/transcribe`

A Deepgram-only endpoint that takes an audio upload and returns `{ text }`.

**Repo:** `/Users/potdev/Documents/GitHub/potentialTS`

**Files:**
- Modify: `src/controllers/agent.controller.ts` (add `chatWithBotTranscribe`)
- Modify: `src/routes/agent.ts` (mount the route)

- [ ] **Step 1: Add `chatWithBotTranscribe` to the controller**

In `src/controllers/agent.controller.ts`, immediately above the existing `chatWithBotVoice` method (`grep -n "chatWithBotVoice" src/controllers/agent.controller.ts` returns line 1737), add:

```ts
  // STT-only endpoint: audio upload in, transcript JSON out.
  // Gated by the bot's audiostt flag. Reuses the same Deepgram config
  // as chatWithBotVoice.
  static async chatWithBotTranscribe(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const audioFile = req.file;

      if (!id || !audioFile) {
        res.status(400).json({
          success: false,
          error: "Bot ID and audio file are required",
        });
        return;
      }

      const bot = await Bot.findById(id);
      if (!bot) {
        res.status(404).json({ success: false, error: "Bot not found" });
        return;
      }
      if ((bot as any).audiostt !== true) {
        res.status(400).json({
          success: false,
          error: "STT not enabled for this bot",
        });
        return;
      }

      const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
      if (!deepgramApiKey) {
        res.status(500).json({
          success: false,
          error: "Deepgram API key not configured",
        });
        return;
      }

      const deepgram = createClient(deepgramApiKey);
      const { result, error } =
        await deepgram.listen.prerecorded.transcribeFile(audioFile.buffer, {
          model: "nova-2",
          smart_format: true,
          language: "en",
        });

      if (error) {
        res.status(500).json({
          success: false,
          error: "Failed to convert speech to text",
        });
        return;
      }

      const transcript =
        result?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "";

      res.status(200).json({ success: true, text: transcript });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: "Failed to convert speech to text",
      });
    }
  }
```

- [ ] **Step 2: Mount the route**

In `src/routes/agent.ts`, find the existing voice route and add the transcribe route below it. Currently:

```ts
router.post(
  "/chatbot/:id/voice",
  voiceUpload.single("audio"),
  AgentController.chatWithBotVoice
);
```

Add immediately after:

```ts
router.post(
  "/chatbot/:id/transcribe",
  voiceUpload.single("audio"),
  AgentController.chatWithBotTranscribe
);
```

- [ ] **Step 3: Verify the route compiles**

Run from the potentialTS repo root:
```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npx tsc --noEmit
```
Expected: no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/controllers/agent.controller.ts src/routes/agent.ts
git commit -m "Add /agent/chatbot/:id/transcribe (Deepgram STT only)"
```

---

## Task 2: potentialTS — add `POST /agent/chatbot/:id/speak`

An ElevenLabs-only endpoint that takes JSON `{ text }` and streams back `audio/mpeg`.

**Repo:** `/Users/potdev/Documents/GitHub/potentialTS`

**Files:**
- Modify: `src/controllers/agent.controller.ts` (add `chatWithBotSpeak`)
- Modify: `src/routes/agent.ts` (mount the route)

- [ ] **Step 1: Add `chatWithBotSpeak` to the controller**

In `src/controllers/agent.controller.ts`, immediately after the `chatWithBotTranscribe` method you just added, add:

```ts
  // TTS-only endpoint: JSON {text} in, audio/mpeg out.
  // Gated by the bot's audiotts flag. Uses the same voice ID + model
  // as chatWithBotVoice (Ruby's brand voice).
  static async chatWithBotSpeak(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { text } = req.body ?? {};

      if (!id || typeof text !== "string" || text.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: "Bot ID and non-empty text are required",
        });
        return;
      }

      const bot = await Bot.findById(id);
      if (!bot) {
        res.status(404).json({ success: false, error: "Bot not found" });
        return;
      }
      if ((bot as any).audiotts !== true) {
        res.status(400).json({
          success: false,
          error: "TTS not enabled for this bot",
        });
        return;
      }

      const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
      if (!elevenLabsApiKey) {
        res.status(500).json({
          success: false,
          error: "ElevenLabs API key not configured",
        });
        return;
      }

      // Truncate long inputs (rather than reject) so the demo always
      // speaks something even when Ruby's response is huge.
      let toSpeak = text;
      if (toSpeak.length > 4000) {
        console.warn(
          `chatWithBotSpeak: truncating text from ${toSpeak.length} to 4000 chars`,
        );
        toSpeak = toSpeak.slice(0, 4000);
      }

      const ttsResponse = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB`,
        {
          method: "POST",
          headers: {
            "xi-api-key": elevenLabsApiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: toSpeak,
            model_id: "eleven_monolingual_v1",
            voice_settings: { stability: 0.5, similarity_boost: 0.5 },
          }),
        },
      );

      if (!ttsResponse.ok) {
        res.status(500).json({
          success: false,
          error: "Failed to convert text to speech",
        });
        return;
      }

      res.setHeader("Content-Type", "audio/mpeg");

      const reader = ttsResponse.body?.getReader();
      if (!reader) {
        res.status(500).json({ success: false, error: "No audio data received" });
        return;
      }

      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
      const audioBuffer = Buffer.concat(chunks);
      res.send(audioBuffer);
    } catch (err) {
      res.status(500).json({
        success: false,
        error: "Failed to convert text to speech",
      });
    }
  }
```

- [ ] **Step 2: Mount the route**

In `src/routes/agent.ts`, add immediately after the transcribe route you added in Task 1:

```ts
router.post("/chatbot/:id/speak", AgentController.chatWithBotSpeak);
```

(Note: no multer middleware — body is JSON, parsed by Express's default `json` middleware which is already mounted globally in potentialTS.)

- [ ] **Step 3: Verify the route compiles**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npx tsc --noEmit
```
Expected: no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/controllers/agent.controller.ts src/routes/agent.ts
git commit -m "Add /agent/chatbot/:id/speak (ElevenLabs TTS only)"
```

> **Deployment note:** Tasks 1 and 2 produce changes that need to be deployed before this repo's frontend can verify against live data. The user has been deploying potentialTS via Dokploy on push; coordinate with them after each task ships.

---

## Task 3: Express proxy — `POST /api/agent/:agentKey/transcribe`

Pass-through proxy that forwards a multipart audio upload to potentialTS and relays the JSON response.

**Repo:** `/Users/potdev/Documents/GitHub/potentialcom-Replit` (everything from Task 3 onward)

**Files:**
- Modify: `server/routes.ts` (add the new route)
- Create: `server/routes.agent-transcribe.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `server/routes.agent-transcribe.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test -- server/routes.agent-transcribe.test.ts
```
Expected: FAIL — the route doesn't exist yet, 3 tests fail.

- [ ] **Step 3: Add the proxy route**

In `server/routes.ts`, immediately before `const httpServer = createServer(app);` (around line 755), add:

```ts
  // Proxies a multipart audio upload to the upstream STT endpoint. The
  // raw multipart body is streamed straight through (express.json()
  // ignores non-JSON content types).
  app.post("/api/agent/:agentKey/transcribe", async (req, res) => {
    const agent = getAgent(req.params.agentKey);
    if (!agent) {
      return res.status(404).json({ message: "Unknown agent" });
    }
    try {
      const upstream = await fetch(
        `${POTENTIAL_API_BASE}/agent/chatbot/${agent.botId}/transcribe`,
        {
          method: "POST",
          headers: { "Content-Type": req.headers["content-type"] ?? "" },
          body: Readable.toWeb(req) as any,
          duplex: "half",
        } as any,
      );
      const text = await upstream.text();
      res
        .status(upstream.status)
        .type(upstream.headers.get("content-type") ?? "application/json")
        .send(text);
    } catch (err) {
      console.error("Agent transcribe proxy error:", err);
      res.status(502).json({ message: "Failed to reach agent" });
    }
  });
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test -- server/routes.agent-transcribe.test.ts
```
Expected: PASS — 3 tests pass.

- [ ] **Step 5: Run the full test suite (no regressions)**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test
```
Expected: all prior tests still pass; total count grows by 3.

- [ ] **Step 6: Commit**

```bash
git add server/routes.ts server/routes.agent-transcribe.test.ts
git commit -m "Add /api/agent/:agentKey/transcribe proxy route"
```

---

## Task 4: Express proxy — `POST /api/agent/:agentKey/speak`

Pass-through proxy that forwards a JSON `{ text }` body to potentialTS and relays the `audio/mpeg` (or JSON error) response.

**Files:**
- Modify: `server/routes.ts`
- Create: `server/routes.agent-speak.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `server/routes.agent-speak.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test -- server/routes.agent-speak.test.ts
```
Expected: FAIL — 3 tests fail (route doesn't exist).

- [ ] **Step 3: Add the proxy route**

In `server/routes.ts`, immediately after the transcribe route you added in Task 3, add:

```ts
  // Proxies a text-to-speech request to the upstream TTS endpoint. The
  // upstream replies with audio/mpeg on success or JSON on error.
  app.post("/api/agent/:agentKey/speak", async (req, res) => {
    const agent = getAgent(req.params.agentKey);
    if (!agent) {
      return res.status(404).json({ message: "Unknown agent" });
    }
    try {
      const upstream = await fetch(
        `${POTENTIAL_API_BASE}/agent/chatbot/${agent.botId}/speak`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: req.body?.text }),
        },
      );
      const contentType = upstream.headers.get("content-type") ?? "";
      if (contentType.includes("audio/")) {
        const buffer = Buffer.from(await upstream.arrayBuffer());
        res.status(upstream.status).type(contentType).send(buffer);
        return;
      }
      const text = await upstream.text();
      res
        .status(upstream.status)
        .type(contentType || "application/json")
        .send(text);
    } catch (err) {
      console.error("Agent speak proxy error:", err);
      res.status(502).json({ message: "Failed to reach agent" });
    }
  });
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test -- server/routes.agent-speak.test.ts
```
Expected: PASS — 3 tests pass.

- [ ] **Step 5: Run the full test suite**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test
```
Expected: all prior tests still pass; total count grows by 3.

- [ ] **Step 6: Commit**

```bash
git add server/routes.ts server/routes.agent-speak.test.ts
git commit -m "Add /api/agent/:agentKey/speak proxy route"
```

---

## Task 5: Bot config — expose `audiostt` + `audiotts` flags

Update the shared `AgentBotConfig` type and the `/bot` proxy so the frontend can read the gating flags.

**Files:**
- Modify: `shared/agent.ts` (extend `AgentBotConfig`)
- Modify: `server/routes.ts` (whitelist the new flags in the `/bot` response)
- Modify: `server/routes.agent-bot.test.ts` (assert the flags are returned)

- [ ] **Step 1: Update `shared/agent.ts`**

Replace the `AgentBotConfig` interface in `shared/agent.ts` (currently `{ name, greeting, avatarUrl }`) with:

```ts
// Response from GET /api/agent/:agentKey/bot (whitelisted fields only)
export interface AgentBotConfig {
  name: string;
  greeting: string;
  avatarUrl: string;
  audiostt: boolean;   // true → mic button is allowed
  audiotts: boolean;   // true → speaker buttons + auto-speak are allowed
}
```

- [ ] **Step 2: Update the `/bot` proxy**

In `server/routes.ts`, find the existing `/api/agent/:agentKey/bot` handler (around line 701) and replace the response body construction:

```ts
      res.json({
        name: typeof data.name === "string" ? data.name : "",
        greeting: typeof data.greeting === "string" ? data.greeting : "",
        avatarUrl: data.imageName
          ? `${POTENTIAL_API_BASE}/static/mentors/${data.imageName}`
          : "",
      });
```

with:

```ts
      res.json({
        name: typeof data.name === "string" ? data.name : "",
        greeting: typeof data.greeting === "string" ? data.greeting : "",
        avatarUrl: data.imageName
          ? `${POTENTIAL_API_BASE}/static/mentors/${data.imageName}`
          : "",
        audiostt: data.audiostt === true,
        audiotts: data.audiotts === true,
      });
```

- [ ] **Step 3: Update the existing bot test**

In `server/routes.agent-bot.test.ts`, find the test that asserts the happy-path response shape. Update the mocked upstream response to include the new fields and assert on them. The test should look like:

```ts
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
```

If the existing file has a similar test you can replace, replace it; otherwise add this as a new test alongside the existing ones. Also add a test confirming both flags default to `false` when the upstream omits them:

```ts
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
```

- [ ] **Step 4: Run the bot tests + verify type-check**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test -- server/routes.agent-bot.test.ts
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm run check
```
Expected: all bot tests pass; no TS errors.

- [ ] **Step 5: Commit**

```bash
git add shared/agent.ts server/routes.ts server/routes.agent-bot.test.ts
git commit -m "Expose audiostt + audiotts flags via /bot proxy"
```

---

## Task 6: `useVoiceRecorder` hook

A React hook wrapping `MediaRecorder`. Returns recorder state, duration, and start/stop/cancel controls.

**Files:**
- Create: `client/src/components/agent/voice/useVoiceRecorder.ts`
- Create: `client/src/components/agent/voice/useVoiceRecorder.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `client/src/components/agent/voice/useVoiceRecorder.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useVoiceRecorder } from "./useVoiceRecorder";

// jsdom doesn't ship MediaRecorder or getUserMedia — install minimal mocks.
class FakeMediaRecorder {
  static instances: FakeMediaRecorder[] = [];
  static isTypeSupported = vi.fn().mockReturnValue(true);
  state: "inactive" | "recording" | "paused" = "inactive";
  ondataavailable: ((e: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: ((e: unknown) => void) | null = null;
  constructor(public stream: unknown, public options?: unknown) {
    FakeMediaRecorder.instances.push(this);
  }
  start() {
    this.state = "recording";
  }
  stop() {
    this.state = "inactive";
    queueMicrotask(() => {
      this.ondataavailable?.({ data: new Blob(["audio"], { type: "audio/webm" }) });
      this.onstop?.();
    });
  }
}

const fakeStream = {
  getTracks: () => [{ stop: vi.fn() }],
};

beforeEach(() => {
  FakeMediaRecorder.instances = [];
  // @ts-expect-error jsdom shim
  globalThis.MediaRecorder = FakeMediaRecorder;
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia: vi.fn().mockResolvedValue(fakeStream) },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useVoiceRecorder", () => {
  it("starts in idle state", () => {
    const { result } = renderHook(() => useVoiceRecorder());
    expect(result.current.state).toBe("idle");
    expect(result.current.errorMessage).toBeNull();
  });

  it("transitions to recording on start()", async () => {
    const { result } = renderHook(() => useVoiceRecorder());
    await act(async () => {
      await result.current.start();
    });
    expect(result.current.state).toBe("recording");
    expect(result.current.errorMessage).toBeNull();
  });

  it("returns the audio blob on stop()", async () => {
    const { result } = renderHook(() => useVoiceRecorder());
    await act(async () => {
      await result.current.start();
    });
    let blob: Blob | null = null;
    await act(async () => {
      blob = await result.current.stop();
    });
    expect(blob).toBeInstanceOf(Blob);
    expect(result.current.state).toBe("idle");
  });

  it("sets error state when getUserMedia rejects", async () => {
    (navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>)
      .mockRejectedValueOnce(new Error("Permission denied"));
    const { result } = renderHook(() => useVoiceRecorder());
    await act(async () => {
      await result.current.start();
    });
    expect(result.current.state).toBe("error");
    expect(result.current.errorMessage).toMatch(/permission|denied/i);
  });

  it("stops media stream tracks on stop()", async () => {
    const stopSpy = vi.fn();
    (navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mockResolvedValue({
      getTracks: () => [{ stop: stopSpy }],
    });
    const { result } = renderHook(() => useVoiceRecorder());
    await act(async () => {
      await result.current.start();
    });
    await act(async () => {
      await result.current.stop();
    });
    expect(stopSpy).toHaveBeenCalled();
  });

  it("ticks durationMs while recording", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useVoiceRecorder());
    await act(async () => {
      await result.current.start();
    });
    expect(result.current.durationMs).toBe(0);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.durationMs).toBeGreaterThanOrEqual(500);
    vi.useRealTimers();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test -- client/src/components/agent/voice/useVoiceRecorder.test.ts
```
Expected: FAIL — `Cannot find module './useVoiceRecorder'`.

- [ ] **Step 3: Implement the hook**

Create `client/src/components/agent/voice/useVoiceRecorder.ts`:

```ts
import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderState = "idle" | "recording" | "uploading" | "error";

export interface UseVoiceRecorderResult {
  state: RecorderState;
  durationMs: number;
  errorMessage: string | null;
  start: () => Promise<void>;
  stop: () => Promise<Blob | null>;
  cancel: () => void;
}

function pickMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported?.(c)) return c;
  }
  return "";
}

// Wraps the MediaRecorder API with a React-friendly shape. Owns the
// MediaStream lifecycle so tracks are always released on stop or unmount.
export function useVoiceRecorder(): UseVoiceRecorderResult {
  const [state, setState] = useState<RecorderState>("idle");
  const [durationMs, setDurationMs] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const cleanupTick = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  useEffect(
    () => () => {
      cleanupTick();
      cleanupStream();
    },
    [cleanupStream, cleanupTick],
  );

  const start = useCallback(async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = pickMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        const data = (e as { data: Blob }).data;
        if (data && data.size > 0) chunksRef.current.push(data);
      };

      recorder.onerror = () => {
        setState("error");
        setErrorMessage("Recording failed");
        cleanupStream();
        cleanupTick();
      };

      recorder.start();
      startTimeRef.current = Date.now();
      setDurationMs(0);
      setState("recording");

      cleanupTick();
      tickRef.current = setInterval(() => {
        setDurationMs(Date.now() - startTimeRef.current);
      }, 250);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not access microphone";
      setState("error");
      setErrorMessage(message);
      cleanupStream();
    }
  }, [cleanupStream, cleanupTick]);

  const stop = useCallback((): Promise<Blob | null> => {
    cleanupTick();
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      cleanupStream();
      setState("idle");
      return Promise.resolve(null);
    }

    return new Promise<Blob | null>((resolve) => {
      recorder.onstop = () => {
        const chunks = chunksRef.current;
        const blob =
          chunks.length > 0
            ? new Blob(chunks, { type: chunks[0].type || "audio/webm" })
            : null;
        chunksRef.current = [];
        cleanupStream();
        setState("idle");
        resolve(blob);
      };
      recorder.stop();
    });
  }, [cleanupStream, cleanupTick]);

  const cancel = useCallback(() => {
    cleanupTick();
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = null;
      recorder.stop();
    }
    chunksRef.current = [];
    cleanupStream();
    setState("idle");
  }, [cleanupStream, cleanupTick]);

  return { state, durationMs, errorMessage, start, stop, cancel };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test -- client/src/components/agent/voice/useVoiceRecorder.test.ts
```
Expected: PASS — 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/agent/voice/useVoiceRecorder.ts client/src/components/agent/voice/useVoiceRecorder.test.ts
git commit -m "Add useVoiceRecorder hook wrapping MediaRecorder"
```

---

## Task 7: `useTextToSpeech` hook

A React hook that fetches `/api/agent/<agentKey>/speak` and plays the returned audio in a single shared `HTMLAudioElement`.

**Files:**
- Create: `client/src/components/agent/voice/useTextToSpeech.ts`
- Create: `client/src/components/agent/voice/useTextToSpeech.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `client/src/components/agent/voice/useTextToSpeech.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTextToSpeech } from "./useTextToSpeech";

const audioInstances: FakeAudio[] = [];

class FakeAudio {
  src = "";
  paused = true;
  onended: (() => void) | null = null;
  onerror: ((e: unknown) => void) | null = null;
  play = vi.fn().mockImplementation(async () => {
    this.paused = false;
  });
  pause = vi.fn().mockImplementation(() => {
    this.paused = true;
  });
  constructor() {
    audioInstances.push(this);
  }
}

let createObjectURLSpy: ReturnType<typeof vi.fn>;
let revokeObjectURLSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  audioInstances.length = 0;
  // @ts-expect-error jsdom shim
  globalThis.Audio = FakeAudio;
  createObjectURLSpy = vi.fn().mockReturnValue("blob:fake-url");
  revokeObjectURLSpy = vi.fn();
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: createObjectURLSpy,
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: revokeObjectURLSpy,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function mockFetchAudio() {
  return vi.fn().mockResolvedValue(
    new Response(new Uint8Array([1, 2, 3]), {
      status: 200,
      headers: { "Content-Type": "audio/mpeg" },
    }),
  );
}

describe("useTextToSpeech", () => {
  it("starts in idle state", () => {
    const { result } = renderHook(() => useTextToSpeech("ruby"));
    expect(result.current.state).toBe("idle");
  });

  it("POSTs the text to /api/agent/<agentKey>/speak and plays the audio", async () => {
    const fetchMock = mockFetchAudio();
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useTextToSpeech("ruby"));
    await act(async () => {
      await result.current.play("hello");
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/agent/ruby/speak",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      }),
    );
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(String(init.body))).toEqual({ text: "hello" });
    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0].play).toHaveBeenCalled();
    expect(result.current.state).toBe("playing");
  });

  it("transitions to idle when the audio ends and revokes the object URL", async () => {
    vi.stubGlobal("fetch", mockFetchAudio());
    const { result } = renderHook(() => useTextToSpeech("ruby"));
    await act(async () => {
      await result.current.play("hello");
    });
    act(() => {
      audioInstances[0].onended?.();
    });
    expect(result.current.state).toBe("idle");
    expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:fake-url");
  });

  it("stops the prior playback before starting a new one", async () => {
    vi.stubGlobal("fetch", mockFetchAudio());
    const { result } = renderHook(() => useTextToSpeech("ruby"));
    await act(async () => {
      await result.current.play("first");
    });
    const firstAudio = audioInstances[0];
    await act(async () => {
      await result.current.play("second");
    });
    expect(firstAudio.pause).toHaveBeenCalled();
    expect(audioInstances).toHaveLength(2);
    expect(audioInstances[1].play).toHaveBeenCalled();
  });

  it("stop() halts playback and goes back to idle", async () => {
    vi.stubGlobal("fetch", mockFetchAudio());
    const { result } = renderHook(() => useTextToSpeech("ruby"));
    await act(async () => {
      await result.current.play("hello");
    });
    act(() => {
      result.current.stop();
    });
    expect(audioInstances[0].pause).toHaveBeenCalled();
    expect(result.current.state).toBe("idle");
  });

  it("sets error state when the fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("nope", { status: 500 })),
    );
    const { result } = renderHook(() => useTextToSpeech("ruby"));
    await act(async () => {
      await result.current.play("hello");
    });
    expect(result.current.state).toBe("error");
    expect(result.current.errorMessage).toBeTruthy();
  });

  it("isPlayingText is true while playing the most recent text", async () => {
    vi.stubGlobal("fetch", mockFetchAudio());
    const { result } = renderHook(() => useTextToSpeech("ruby"));
    await act(async () => {
      await result.current.play("hello");
    });
    expect(result.current.isPlayingText("hello")).toBe(true);
    expect(result.current.isPlayingText("other")).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test -- client/src/components/agent/voice/useTextToSpeech.test.ts
```
Expected: FAIL — `Cannot find module './useTextToSpeech'`.

- [ ] **Step 3: Implement the hook**

Create `client/src/components/agent/voice/useTextToSpeech.ts`:

```ts
import { useCallback, useEffect, useRef, useState } from "react";

export type PlaybackState = "idle" | "loading" | "playing" | "error";

export interface UseTextToSpeechResult {
  state: PlaybackState;
  errorMessage: string | null;
  play: (text: string) => Promise<void>;
  stop: () => void;
  isPlayingText: (text: string) => boolean;
}

// Owns a single HTMLAudioElement so two SpeakButtons can't double-play.
// play(text) is async because it has to fetch the audio blob before it
// can hand it to the audio element.
export function useTextToSpeech(agentKey: string): UseTextToSpeechResult {
  const [state, setState] = useState<PlaybackState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentText, setCurrentText] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }, []);

  useEffect(() => () => cleanupAudio(), [cleanupAudio]);

  const stop = useCallback(() => {
    cleanupAudio();
    setCurrentText(null);
    setState("idle");
  }, [cleanupAudio]);

  const play = useCallback(
    async (text: string) => {
      cleanupAudio();
      setErrorMessage(null);
      setState("loading");
      setCurrentText(text);
      try {
        const res = await fetch(`/api/agent/${agentKey}/speak`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (!res.ok) {
          throw new Error(`speak failed: ${res.status}`);
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        urlRef.current = url;

        const audio = new Audio();
        audio.src = url;
        audio.onended = () => {
          cleanupAudio();
          setCurrentText(null);
          setState("idle");
        };
        audio.onerror = () => {
          cleanupAudio();
          setState("error");
          setErrorMessage("Audio playback failed");
        };
        audioRef.current = audio;

        await audio.play();
        setState("playing");
      } catch (err) {
        cleanupAudio();
        setState("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to play audio",
        );
      }
    },
    [agentKey, cleanupAudio],
  );

  const isPlayingText = useCallback(
    (text: string) => state === "playing" && currentText === text,
    [state, currentText],
  );

  return { state, errorMessage, play, stop, isPlayingText };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test -- client/src/components/agent/voice/useTextToSpeech.test.ts
```
Expected: PASS — 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/agent/voice/useTextToSpeech.ts client/src/components/agent/voice/useTextToSpeech.test.ts
git commit -m "Add useTextToSpeech hook wrapping fetch + HTMLAudioElement"
```

---

## Task 8: `MicButton` component

Tap-to-toggle recorder button. On stop, uploads the blob to `/api/agent/<agentKey>/transcribe` and calls `onTranscript(text)`.

**Files:**
- Create: `client/src/components/agent/voice/MicButton.tsx`
- Create: `client/src/components/agent/voice/MicButton.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `client/src/components/agent/voice/MicButton.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MicButton } from "./MicButton";

// Reuse the FakeMediaRecorder / getUserMedia shims from useVoiceRecorder.test.ts.
class FakeMediaRecorder {
  static isTypeSupported = vi.fn().mockReturnValue(true);
  state: "inactive" | "recording" = "inactive";
  ondataavailable: ((e: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: ((e: unknown) => void) | null = null;
  constructor() {}
  start() {
    this.state = "recording";
  }
  stop() {
    this.state = "inactive";
    queueMicrotask(() => {
      this.ondataavailable?.({ data: new Blob(["audio"], { type: "audio/webm" }) });
      this.onstop?.();
    });
  }
}

beforeEach(() => {
  // @ts-expect-error jsdom shim
  globalThis.MediaRecorder = FakeMediaRecorder;
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: {
      getUserMedia: vi.fn().mockResolvedValue({
        getTracks: () => [{ stop: vi.fn() }],
      }),
    },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("MicButton", () => {
  it("renders nothing when disabled", () => {
    const { container } = render(
      <MicButton agentKey="ruby" onTranscript={vi.fn()} disabled />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when getUserMedia is unavailable", () => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: undefined,
    });
    const { container } = render(
      <MicButton agentKey="ruby" onTranscript={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("starts recording on click and stops + uploads + emits transcript on second click", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ success: true, text: "find me a lipstick" }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const onTranscript = vi.fn();
    const user = userEvent.setup();

    render(<MicButton agentKey="ruby" onTranscript={onTranscript} />);
    const btn = screen.getByRole("button", { name: /record/i });
    await user.click(btn);
    // While recording, the accessible label flips to "Stop recording"
    expect(screen.getByRole("button", { name: /stop/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /stop/i }));

    // Wait a tick for the async upload to resolve.
    await new Promise((r) => setTimeout(r, 0));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/agent/ruby/transcribe",
      expect.objectContaining({ method: "POST" }),
    );
    expect(onTranscript).toHaveBeenCalledWith("find me a lipstick");
  });

  it("does not emit transcript when text is empty", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ success: true, text: "" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    const onTranscript = vi.fn();
    const user = userEvent.setup();

    render(<MicButton agentKey="ruby" onTranscript={onTranscript} />);
    await user.click(screen.getByRole("button", { name: /record/i }));
    await user.click(screen.getByRole("button", { name: /stop/i }));
    await new Promise((r) => setTimeout(r, 0));

    expect(onTranscript).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test -- client/src/components/agent/voice/MicButton.test.tsx
```
Expected: FAIL — `Cannot find module './MicButton'`.

- [ ] **Step 3: Implement the component**

Create `client/src/components/agent/voice/MicButton.tsx`:

```tsx
import { useCallback, useState } from "react";
import { Mic, Square } from "lucide-react";
import { useVoiceRecorder } from "./useVoiceRecorder";

interface MicButtonProps {
  agentKey: string;
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

function isRecordingSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === "function" &&
    typeof MediaRecorder !== "undefined"
  );
}

function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MicButton({ agentKey, onTranscript, disabled }: MicButtonProps) {
  const recorder = useVoiceRecorder();
  const [uploading, setUploading] = useState(false);

  const onClick = useCallback(async () => {
    if (disabled) return;
    if (recorder.state === "recording") {
      const blob = await recorder.stop();
      if (!blob || blob.size === 0) return;
      setUploading(true);
      try {
        const form = new FormData();
        form.append("audio", blob, "voice.webm");
        const res = await fetch(`/api/agent/${agentKey}/transcribe`, {
          method: "POST",
          body: form,
        });
        if (!res.ok) return;
        const data = (await res.json()) as { text?: string };
        const text = (data.text ?? "").trim();
        if (text) onTranscript(text);
      } finally {
        setUploading(false);
      }
    } else {
      await recorder.start();
    }
  }, [agentKey, disabled, onTranscript, recorder]);

  if (disabled || !isRecordingSupported()) return null;

  const isRecording = recorder.state === "recording";
  const isError = recorder.state === "error";
  const label = isRecording ? "Stop recording" : "Record voice message";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={uploading}
      className={
        "inline-flex h-9 w-9 items-center justify-center rounded-full border " +
        (isRecording
          ? "border-red-500/40 bg-red-500/15 text-red-500 animate-pulse"
          : isError
            ? "border-red-500/40 bg-transparent text-red-500"
            : "border-tool-card-border bg-tool-card text-tool-card-foreground hover:bg-tool-card-muted")
      }
      data-state={recorder.state}
    >
      {isRecording ? (
        <span className="flex items-center gap-1">
          <Square className="h-3.5 w-3.5" />
          <span className="text-[10px] font-mono">
            {formatDuration(recorder.durationMs)}
          </span>
        </span>
      ) : uploading ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </button>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test -- client/src/components/agent/voice/MicButton.test.tsx
```
Expected: PASS — 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/agent/voice/MicButton.tsx client/src/components/agent/voice/MicButton.test.tsx
git commit -m "Add MicButton component with tap-to-toggle UX"
```

---

## Task 9: `SpeakButton` component

Per-message speaker icon. Click to play that message; click again to stop. Coordinated through a parent-owned `useTextToSpeech` instance passed in via props (so two SpeakButtons can't double-play).

**Files:**
- Create: `client/src/components/agent/voice/SpeakButton.tsx`
- Create: `client/src/components/agent/voice/SpeakButton.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `client/src/components/agent/voice/SpeakButton.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SpeakButton } from "./SpeakButton";
import type { UseTextToSpeechResult } from "./useTextToSpeech";

function fakeTts(overrides: Partial<UseTextToSpeechResult> = {}): UseTextToSpeechResult {
  return {
    state: "idle",
    errorMessage: null,
    play: vi.fn(),
    stop: vi.fn(),
    isPlayingText: vi.fn().mockReturnValue(false),
    ...overrides,
  };
}

describe("SpeakButton", () => {
  it("renders nothing when text is empty or whitespace-only", () => {
    const tts = fakeTts();
    const { container, rerender } = render(
      <SpeakButton text="" tts={tts} />,
    );
    expect(container.firstChild).toBeNull();
    rerender(<SpeakButton text="   " tts={tts} />);
    expect(container.firstChild).toBeNull();
  });

  it("calls play with the message text when clicked while idle", async () => {
    const play = vi.fn().mockResolvedValue(undefined);
    const tts = fakeTts({ play });
    const user = userEvent.setup();
    render(<SpeakButton text="hello listener" tts={tts} />);
    await user.click(screen.getByRole("button", { name: /play|speak/i }));
    expect(play).toHaveBeenCalledWith("hello listener");
  });

  it("calls stop when clicked while playing this same text", async () => {
    const stop = vi.fn();
    const tts = fakeTts({
      state: "playing",
      isPlayingText: vi.fn().mockImplementation((t) => t === "hello"),
      stop,
    });
    const user = userEvent.setup();
    render(<SpeakButton text="hello" tts={tts} />);
    await user.click(screen.getByRole("button", { name: /stop|pause/i }));
    expect(stop).toHaveBeenCalled();
  });

  it("shows the playing label when this message is the active player", () => {
    const tts = fakeTts({
      state: "playing",
      isPlayingText: vi.fn().mockReturnValue(true),
    });
    render(<SpeakButton text="hello" tts={tts} />);
    expect(screen.getByRole("button", { name: /stop|pause/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test -- client/src/components/agent/voice/SpeakButton.test.tsx
```
Expected: FAIL — `Cannot find module './SpeakButton'`.

- [ ] **Step 3: Implement the component**

Create `client/src/components/agent/voice/SpeakButton.tsx`:

```tsx
import { Volume2, Square } from "lucide-react";
import type { UseTextToSpeechResult } from "./useTextToSpeech";

interface SpeakButtonProps {
  text: string;
  tts: UseTextToSpeechResult;
}

// A per-message play/stop button. The parent owns a single useTextToSpeech
// instance and passes it to every SpeakButton, so clicking one stops any
// other that's already playing.
export function SpeakButton({ text, tts }: SpeakButtonProps) {
  const trimmed = text.trim();
  if (trimmed.length === 0) return null;

  const isThisPlaying = tts.isPlayingText(text);
  const isLoading = tts.state === "loading";
  const isError = tts.state === "error";
  const label = isThisPlaying ? "Stop playback" : "Play message";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => {
        if (isThisPlaying) {
          tts.stop();
        } else {
          void tts.play(text);
        }
      }}
      disabled={isLoading && !isThisPlaying}
      className={
        "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs " +
        (isError
          ? "text-red-500"
          : isThisPlaying
            ? "bg-tool-card-accent text-tool-card-accent-foreground"
            : "text-tool-card-muted-foreground hover:bg-tool-card-muted")
      }
      data-state={isThisPlaying ? "playing" : tts.state}
    >
      {isLoading && !isThisPlaying ? (
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : isThisPlaying ? (
        <Square className="h-3.5 w-3.5" />
      ) : (
        <Volume2 className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test -- client/src/components/agent/voice/SpeakButton.test.tsx
```
Expected: PASS — 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/agent/voice/SpeakButton.tsx client/src/components/agent/voice/SpeakButton.test.tsx
git commit -m "Add SpeakButton component"
```

---

## Task 10: `AutoSpeakToggle` component + `useAutoSpeak` hook

Global on/off switch persisted in `localStorage`. Exposes both the toggle UI and the read-state hook so `AgentChat` can read the value without depending on the toggle component.

**Files:**
- Create: `client/src/components/agent/voice/useAutoSpeak.ts`
- Create: `client/src/components/agent/voice/useAutoSpeak.test.ts`
- Create: `client/src/components/agent/voice/AutoSpeakToggle.tsx`
- Create: `client/src/components/agent/voice/AutoSpeakToggle.test.tsx`

- [ ] **Step 1: Write the failing tests for `useAutoSpeak`**

Create `client/src/components/agent/voice/useAutoSpeak.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAutoSpeak } from "./useAutoSpeak";

beforeEach(() => {
  localStorage.clear();
});

describe("useAutoSpeak", () => {
  it("defaults to false when no localStorage value is set", () => {
    const { result } = renderHook(() => useAutoSpeak());
    expect(result.current.enabled).toBe(false);
  });

  it("reads an existing localStorage value on mount", () => {
    localStorage.setItem("ruby:autoSpeak", "true");
    const { result } = renderHook(() => useAutoSpeak());
    expect(result.current.enabled).toBe(true);
  });

  it("setEnabled persists to localStorage", () => {
    const { result } = renderHook(() => useAutoSpeak());
    act(() => {
      result.current.setEnabled(true);
    });
    expect(result.current.enabled).toBe(true);
    expect(localStorage.getItem("ruby:autoSpeak")).toBe("true");
  });

  it("setEnabled(false) clears the localStorage value back to disabled", () => {
    localStorage.setItem("ruby:autoSpeak", "true");
    const { result } = renderHook(() => useAutoSpeak());
    act(() => {
      result.current.setEnabled(false);
    });
    expect(result.current.enabled).toBe(false);
    expect(localStorage.getItem("ruby:autoSpeak")).toBe("false");
  });

  it("syncs across instances via a custom window event", () => {
    const a = renderHook(() => useAutoSpeak());
    const b = renderHook(() => useAutoSpeak());
    expect(a.result.current.enabled).toBe(false);
    expect(b.result.current.enabled).toBe(false);
    act(() => {
      a.result.current.setEnabled(true);
    });
    // Both hook instances must reflect the new value, even though only
    // `a` called setEnabled. This is the load-bearing guarantee that
    // toggling AutoSpeakToggle re-runs AgentChat's auto-speak effect.
    expect(a.result.current.enabled).toBe(true);
    expect(b.result.current.enabled).toBe(true);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test -- client/src/components/agent/voice/useAutoSpeak.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `useAutoSpeak`**

Create `client/src/components/agent/voice/useAutoSpeak.ts`:

```ts
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "ruby:autoSpeak";
const SYNC_EVENT = "ruby:autoSpeakChanged";

export interface UseAutoSpeakResult {
  enabled: boolean;
  setEnabled: (next: boolean) => void;
}

function readInitial(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

// Mirrors a single boolean in localStorage. Multiple hook instances stay
// in sync via a custom window event — browsers don't fire `storage`
// events on the originating tab, so we broadcast our own.
export function useAutoSpeak(): UseAutoSpeakResult {
  const [enabled, setEnabledState] = useState<boolean>(() => readInitial());

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<boolean>).detail;
      setEnabledState(detail === true);
    };
    window.addEventListener(SYNC_EVENT, handler as EventListener);
    return () =>
      window.removeEventListener(SYNC_EVENT, handler as EventListener);
  }, []);

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "true" : "false");
    } catch {
      // ignore quota / unavailable-storage errors
    }
    window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: next }));
  }, []);

  return { enabled, setEnabled };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test -- client/src/components/agent/voice/useAutoSpeak.test.ts
```
Expected: PASS — 5 tests pass.

- [ ] **Step 5: Write the failing tests for `AutoSpeakToggle`**

Create `client/src/components/agent/voice/AutoSpeakToggle.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AutoSpeakToggle } from "./AutoSpeakToggle";

beforeEach(() => {
  localStorage.clear();
});

describe("AutoSpeakToggle", () => {
  it("reflects the localStorage default (off)", () => {
    render(<AutoSpeakToggle />);
    const cb = screen.getByRole("switch", { name: /auto-speak/i });
    expect(cb).toHaveAttribute("aria-checked", "false");
  });

  it("toggles to on and persists to localStorage", async () => {
    const user = userEvent.setup();
    render(<AutoSpeakToggle />);
    const cb = screen.getByRole("switch", { name: /auto-speak/i });
    await user.click(cb);
    expect(cb).toHaveAttribute("aria-checked", "true");
    expect(localStorage.getItem("ruby:autoSpeak")).toBe("true");
  });

  it("fires onChange with the new value", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<AutoSpeakToggle onChange={onChange} />);
    await user.click(screen.getByRole("switch", { name: /auto-speak/i }));
    expect(onChange).toHaveBeenLastCalledWith(true);
  });

  it("reads an existing localStorage value on mount", () => {
    localStorage.setItem("ruby:autoSpeak", "true");
    render(<AutoSpeakToggle />);
    expect(
      screen.getByRole("switch", { name: /auto-speak/i }),
    ).toHaveAttribute("aria-checked", "true");
  });
});
```

- [ ] **Step 6: Run the tests to verify they fail**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test -- client/src/components/agent/voice/AutoSpeakToggle.test.tsx
```
Expected: FAIL — module not found.

- [ ] **Step 7: Implement `AutoSpeakToggle`**

Create `client/src/components/agent/voice/AutoSpeakToggle.tsx`:

```tsx
import { Volume2, VolumeX } from "lucide-react";
import { useAutoSpeak } from "./useAutoSpeak";

interface AutoSpeakToggleProps {
  onChange?: (enabled: boolean) => void;
}

// A small switch displayed in the chat header. Reads/writes
// localStorage via useAutoSpeak; emits onChange so the parent can
// react in real time (e.g., to start auto-speaking the latest message
// immediately when toggled on).
export function AutoSpeakToggle({ onChange }: AutoSpeakToggleProps) {
  const { enabled, setEnabled } = useAutoSpeak();

  const handleClick = () => {
    const next = !enabled;
    setEnabled(next);
    onChange?.(next);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label="Auto-speak"
      title={enabled ? "Auto-speak on" : "Auto-speak off"}
      onClick={handleClick}
      className={
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs " +
        (enabled
          ? "bg-tool-card-accent text-tool-card-accent-foreground"
          : "bg-tool-card-muted text-tool-card-muted-foreground hover:bg-tool-card-muted/80")
      }
    >
      {enabled ? (
        <Volume2 className="h-3.5 w-3.5" />
      ) : (
        <VolumeX className="h-3.5 w-3.5" />
      )}
      <span>Auto-speak</span>
    </button>
  );
}
```

- [ ] **Step 8: Run the tests to verify they pass**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test -- client/src/components/agent/voice/AutoSpeakToggle.test.tsx
```
Expected: PASS — 4 tests pass.

- [ ] **Step 9: Commit**

```bash
git add client/src/components/agent/voice/useAutoSpeak.ts client/src/components/agent/voice/useAutoSpeak.test.ts client/src/components/agent/voice/AutoSpeakToggle.tsx client/src/components/agent/voice/AutoSpeakToggle.test.tsx
git commit -m "Add useAutoSpeak hook + AutoSpeakToggle component"
```

---

## Task 11: Voice module barrel

A barrel file so `AgentChat.tsx` and `MessageBubble.tsx` can import the voice surface area in one line.

**Files:**
- Create: `client/src/components/agent/voice/index.ts`

- [ ] **Step 1: Create the barrel**

Create `client/src/components/agent/voice/index.ts`:

```ts
export { useVoiceRecorder } from "./useVoiceRecorder";
export type { RecorderState, UseVoiceRecorderResult } from "./useVoiceRecorder";
export { useTextToSpeech } from "./useTextToSpeech";
export type { PlaybackState, UseTextToSpeechResult } from "./useTextToSpeech";
export { useAutoSpeak } from "./useAutoSpeak";
export type { UseAutoSpeakResult } from "./useAutoSpeak";
export { MicButton } from "./MicButton";
export { SpeakButton } from "./SpeakButton";
export { AutoSpeakToggle } from "./AutoSpeakToggle";
```

- [ ] **Step 2: Verify the build type-checks**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm run check
```
Expected: no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add client/src/components/agent/voice/index.ts
git commit -m "Add voice/ barrel"
```

---

## Task 12: Wire `MicButton` + `AutoSpeakToggle` + auto-speak into `AgentChat`

Hook the mic button next to the existing image-attach button, render the auto-speak toggle in the header, and make auto-speak fire on each newly-completed agent message.

**Files:**
- Modify: `client/src/components/agent/AgentChat.tsx`

- [ ] **Step 1: Read the current state of `AgentChat.tsx`**

Read `client/src/components/agent/AgentChat.tsx` to understand the current structure. Key features today:
- Imports `useAgentChat`, renders `MessageBubble` per message
- Fetches bot config from `/api/agent/<agentKey>/bot` on mount
- Has an `<input>` and a send button at the bottom
- Has an image attach button to the left of the input

You will:
- Import `MicButton`, `AutoSpeakToggle`, `useTextToSpeech` from `./voice`
- Create a single `useTextToSpeech(agentKey)` instance at the top of the component
- Pass that instance to `MessageBubble` (handled in Task 13)
- Render `<AutoSpeakToggle>` in the header next to the avatar/name (only if `bot?.audiotts === true`)
- Render `<MicButton>` next to the image-attach button (only if `bot?.audiostt === true`)
- Track the previous message-list length; when a new agent message transitions to `status === "complete"` AND auto-speak is on, call `tts.play(message.text)`

- [ ] **Step 2: Apply the edits**

Make these targeted changes:

(a) Add imports near the top alongside the existing `MessageBubble`/`useAgentChat` imports:

```tsx
import { MicButton, AutoSpeakToggle, useTextToSpeech, useAutoSpeak } from "./voice";
```

(b) Inside the `AgentChat` component body, near the top (after `useAgentChat`):

```tsx
  const tts = useTextToSpeech(agentKey);
  const { enabled: autoSpeak } = useAutoSpeak();
  const spokenMessageIds = useRef<Set<string>>(new Set());

  // Auto-speak: when a new agent message completes and auto-speak is on,
  // play it. We dedupe via a per-message-id set so toggling auto-speak
  // mid-conversation doesn't re-speak everything.
  useEffect(() => {
    if (!autoSpeak || !bot?.audiotts) return;
    const last = messages[messages.length - 1];
    if (!last) return;
    if (last.role !== "agent") return;
    if (last.status !== "complete") return;
    if (!last.text || !last.text.trim()) return;
    if (spokenMessageIds.current.has(last.id)) return;
    spokenMessageIds.current.add(last.id);
    void tts.play(last.text);
  }, [autoSpeak, bot, messages, tts]);
```

You will need to add `useEffect` and `useRef` to the existing React imports if they aren't already imported.

(c) In the JSX header area (near where the agent avatar / name is rendered), render the auto-speak toggle inline. Place it on the right side of the header row, conditional on `bot?.audiotts`:

```tsx
{bot?.audiotts && (
  <div className="ml-auto">
    <AutoSpeakToggle />
  </div>
)}
```

If the existing header doesn't have an `ml-auto` slot, wrap the existing avatar/name and the new toggle in a single `<div className="flex items-center">` so the toggle pushes to the right.

(d) In the input row, immediately after the existing image-attach button and before the text input, add:

```tsx
<MicButton
  agentKey={agentKey}
  disabled={!bot?.audiostt}
  onTranscript={(text) => setInput(text)}
/>
```

The `setInput` symbol is the existing `useState` setter for the text input. If the existing state setter is named differently, use that name.

(e) Pass `tts` down to `MessageBubble`. Add `tts={tts}` to the existing `<MessageBubble ...>` JSX. The MessageBubble interface gets updated in Task 13.

- [ ] **Step 3: Verify the build type-checks**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm run check
```
Expected: one TS error from `MessageBubble` not yet accepting a `tts` prop. That gets fixed in Task 13. If you see *other* TS errors, fix them before moving on.

- [ ] **Step 4: Verify the existing test suite still runs**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test
```
Expected: all prior voice tests pass; AgentChat-related tests may fail until Task 13 wires `MessageBubble`. That's expected; the failing tests will resolve in Task 13.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/agent/AgentChat.tsx
git commit -m "Wire MicButton + AutoSpeakToggle + auto-speak into AgentChat"
```

---

## Task 13: Wire `SpeakButton` into `MessageBubble`

Render a `<SpeakButton>` inline with each completed agent message that has non-empty text and `audiotts` is enabled.

**Files:**
- Modify: `client/src/components/agent/MessageBubble.tsx`

- [ ] **Step 1: Update `MessageBubble`**

Replace the contents of `client/src/components/agent/MessageBubble.tsx` with:

```tsx
import ReactMarkdown from "react-markdown";
import { ToolCard } from "./ToolCard";
import type { ToolRegistry } from "./toolRegistry";
import type { AgentMessage } from "@shared/agent";
import { SpeakButton, type UseTextToSpeechResult } from "./voice";

interface MessageBubbleProps {
  message: AgentMessage;
  registry: ToolRegistry;
  tts?: UseTextToSpeechResult;
  ttsEnabled?: boolean;
}

// Renders one chat message: user messages right-aligned and plain; agent
// messages left-aligned with markdown plus any tool cards plus an
// optional speaker button (when tts is supplied and the bot supports it).
export function MessageBubble({
  message,
  registry,
  tts,
  ttsEnabled,
}: MessageBubbleProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-sm text-primary-foreground">
          {message.imageUrl && (
            <img
              src={message.imageUrl}
              alt="Uploaded"
              className="mb-2 max-h-40 rounded-lg"
            />
          )}
          <span>{message.text}</span>
        </div>
      </div>
    );
  }

  const canSpeak =
    !!tts &&
    !!ttsEnabled &&
    message.status === "complete" &&
    !!message.text &&
    message.text.trim().length > 0;

  return (
    <div className="flex flex-col gap-2">
      {message.tools.map((tool) => (
        <ToolCard key={tool.id} invocation={tool} registry={registry} />
      ))}
      {(message.text || message.status === "streaming") && (
        <div className="flex items-start gap-2">
          <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-muted px-4 py-2 text-sm">
            {message.text ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{message.text}</ReactMarkdown>
              </div>
            ) : (
              <span className="inline-flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0.3s]" />
              </span>
            )}
          </div>
          {canSpeak && tts && (
            <SpeakButton text={message.text} tts={tts} />
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update `AgentChat`'s `MessageBubble` usage to pass `ttsEnabled`**

In `client/src/components/agent/AgentChat.tsx`, find the existing `<MessageBubble ...>` rendering inside the messages map and update it to pass the new prop:

```tsx
<MessageBubble
  key={msg.id}
  message={msg}
  registry={registry}
  tts={tts}
  ttsEnabled={!!bot?.audiotts}
/>
```

- [ ] **Step 3: Run the full test suite**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test
```
Expected: all tests pass — the existing voice tests plus the prior proxy + card tests, total roughly the prior count + 32 from the new voice work.

- [ ] **Step 4: Verify the build type-checks**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm run check
```
Expected: no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/agent/MessageBubble.tsx client/src/components/agent/AgentChat.tsx
git commit -m "Render SpeakButton inline with completed agent messages"
```

---

## Done

After Task 13 the feature is functionally complete: a mic button next to the image-attach control, per-message speaker buttons, and a global auto-speak toggle in the chat header. All gated by the bot's `audiostt` / `audiotts` flags. Total new code: 2 thin endpoints (potentialTS), 2 proxy routes + 1 bot-config widening (this repo's server), 5 frontend files + 1 barrel + 2 hook tests + 3 component tests + 2 proxy tests + 1 hook test (this repo's client).

**Before shipping:**

1. Deploy potentialTS so `/transcribe` and `/speak` exist upstream. Verify with curl:
   ```bash
   curl -X POST https://api.potential.com/agent/chatbot/6a056e4ece71ae96a167f826/speak \
     -H "Content-Type: application/json" -d '{"text":"test"}' --output /tmp/test.mp3
   afplay /tmp/test.mp3
   ```
2. Ensure Ruby's bot in MongoDB has `audiostt: true` and `audiotts: true` set on the document.
3. Manual smoke in Chrome + Firefox + Safari per the spec checklist (record a query, hear the reply, toggle auto-speak on/off, click individual speaker buttons).
4. Use the standard finishing-a-development-branch flow to open a PR against `main`.
