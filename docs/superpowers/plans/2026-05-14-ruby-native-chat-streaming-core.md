# Ruby Native Chat — Streaming Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the third-party chat embed on `/demo` with a native React chat interface that streams Ruby's responses through a generic Express proxy, rendering all tool calls via a generic fallback card.

**Architecture:** Layered. A pure SSE parser (`parseAgentStream`) feeds a state-owning hook (`useAgentChat`), which drives presentational components (`AgentChat`, `MessageBubble`, `ToolCard`). All API traffic goes through three agent-agnostic Express routes keyed by `agentKey` (never bot ID). Tool rendering uses a registry keyed by tool name; this plan ships only the `GenericToolCard` fallback — bespoke per-tool cards are Plan 2.

**Tech Stack:** React 18 + TypeScript, wouter, Express 4, Node 22 native `fetch`/streams, vitest + supertest for tests, react-markdown for message rendering.

**Companion spec:** [docs/superpowers/specs/2026-05-14-ruby-native-chat-design.md](../specs/2026-05-14-ruby-native-chat-design.md)

**Testing note:** This repo has no existing test infrastructure. Task 1 adds vitest + supertest. Pure logic (`parseAgentStream`, `server/agents.ts`) and the proxy routes get automated tests via TDD. The React layer (`useAgentChat`, components) has no test runner in this plan — it is verified manually in the browser, matching the spec's "manual golden-path" testing approach. Plan 2 adds component render tests.

---

## Task 1: Test infrastructure (vitest + supertest)

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `shared/smoke.test.ts` (temporary smoke test, deleted in Step 6)

- [ ] **Step 1: Install test dependencies**

Run:
```bash
npm install -D vitest@^2.1.8 supertest@^7.0.0 @types/supertest@^6.0.2
```
Expected: packages added to `devDependencies`, no errors.

- [ ] **Step 2: Add test scripts to package.json**

In `package.json`, the `"scripts"` block currently is:
```json
  "scripts": {
    "dev": "tsx server/index.ts",
    "build": "npm run sitemap:generate && vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "check": "tsc",
    "db:push": "drizzle-kit push",
    "sitemap:generate": "tsx scripts/generate-sitemap.ts"
  },
```
Change it to add two test scripts:
```json
  "scripts": {
    "dev": "tsx server/index.ts",
    "build": "npm run sitemap:generate && vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "check": "tsc",
    "db:push": "drizzle-kit push",
    "sitemap:generate": "tsx scripts/generate-sitemap.ts",
    "test": "vitest run",
    "test:watch": "vitest"
  },
```

- [ ] **Step 3: Create vitest.config.ts**

Create `vitest.config.ts` at the repo root:
```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules", "dist", ".claude"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
});
```

- [ ] **Step 4: Write a smoke test**

Create `shared/smoke.test.ts`:
```ts
import { describe, it, expect } from "vitest";

describe("vitest smoke test", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run the smoke test to verify the runner works**

Run: `npm test`
Expected: PASS — 1 test passed (`shared/smoke.test.ts`).

- [ ] **Step 6: Delete the smoke test and commit**

Run:
```bash
rm shared/smoke.test.ts
git add package.json package-lock.json vitest.config.ts
git commit -m "Add vitest + supertest test infrastructure"
```

---

## Task 2: Shared agent types

**Files:**
- Create: `shared/agent.ts`

- [ ] **Step 1: Create the shared types file**

Create `shared/agent.ts`:
```ts
// Normalized events emitted by parseAgentStream from the agent SSE stream.
export type AgentStreamEvent =
  | { kind: "token"; content: string }
  | { kind: "toolCall"; name: string; arguments: unknown; async: boolean }
  | { kind: "toolResponse"; name: string; content: unknown }
  | { kind: "error"; message: string }
  | { kind: "done"; response: string };

// A tool invocation tracked in a message: starts "loading", becomes "complete"
// when its matching toolResponse arrives.
export interface ToolInvocation {
  id: string; // dedupe key: `${name}-${JSON.stringify(arguments)}`
  name: string;
  arguments: unknown;
  response?: unknown; // undefined until the toolResponse event
  status: "loading" | "complete";
}

// One chat message in the conversation.
export interface AgentMessage {
  id: string;
  role: "user" | "agent";
  text: string;
  tools: ToolInvocation[];
  imageUrl?: string; // set on user messages that included an uploaded image
  status: "streaming" | "complete" | "error";
}

// Request body sent to POST /api/agent/:agentKey/chat
export interface AgentChatRequest {
  message: string;
  sessionId: string;
}

// Response from GET /api/agent/:agentKey/bot (whitelisted fields only)
export interface AgentBotConfig {
  name: string;
  greeting: string;
  avatarUrl: string;
}
```

- [ ] **Step 2: Verify it type-checks**

Run: `npm run check`
Expected: PASS — no TypeScript errors.

- [ ] **Step 3: Commit**

Run:
```bash
git add shared/agent.ts
git commit -m "Add shared agent stream and message types"
```

---

## Task 3: parseAgentStream — pure SSE parser

**Files:**
- Create: `client/src/components/agent/parseAgentStream.ts`
- Test: `client/src/components/agent/parseAgentStream.test.ts`

The parser is a stateful factory: `createStreamParser()` returns `{ push(chunk) }`. `push` takes a decoded string chunk and returns the complete `AgentStreamEvent[]` found so far, buffering any incomplete trailing line for the next call.

- [ ] **Step 1: Write the failing tests**

Create `client/src/components/agent/parseAgentStream.test.ts`:
```ts
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- parseAgentStream`
Expected: FAIL — cannot find module `./parseAgentStream` / `createStreamParser is not a function`.

- [ ] **Step 3: Implement the parser**

Create `client/src/components/agent/parseAgentStream.ts`:
```ts
import type { AgentStreamEvent } from "@shared/agent";

// Converts one parsed `data:` JSON object into a normalized AgentStreamEvent.
// Returns null for shapes we don't recognize.
function toEvent(obj: any): AgentStreamEvent | null {
  if (obj && obj.type === "token" && typeof obj.content === "string") {
    return { kind: "token", content: obj.content };
  }
  if (obj && obj.toolCall && typeof obj.toolCall.name === "string") {
    return {
      kind: "toolCall",
      name: obj.toolCall.name,
      arguments: obj.toolCall.arguments,
      async: obj.toolCall.async !== false,
    };
  }
  if (obj && obj.toolResponse && typeof obj.toolResponse.name === "string") {
    return {
      kind: "toolResponse",
      name: obj.toolResponse.name,
      content: obj.toolResponse.content,
    };
  }
  if (obj && typeof obj.error === "string") {
    return { kind: "error", message: obj.error };
  }
  if (obj && obj.success === true) {
    return { kind: "done", response: typeof obj.response === "string" ? obj.response : "" };
  }
  return null;
}

export interface StreamParser {
  // Feed a decoded text chunk; returns any complete events found.
  // Incomplete trailing lines are buffered until the next push().
  push(chunk: string): AgentStreamEvent[];
}

export function createStreamParser(): StreamParser {
  let buffer = "";

  return {
    push(chunk: string): AgentStreamEvent[] {
      buffer += chunk;
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? ""; // keep the (possibly incomplete) last line

      const events: AgentStreamEvent[] = [];
      for (const line of lines) {
        const trimmed = line.trimEnd();
        if (!trimmed.startsWith("data: ")) continue;
        const payload = trimmed.slice("data: ".length);
        try {
          const obj = JSON.parse(payload);
          const event = toEvent(obj);
          if (event) events.push(event);
        } catch {
          // ignore unparseable / partial JSON lines
        }
      }
      return events;
    },
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- parseAgentStream`
Expected: PASS — all 9 tests pass.

- [ ] **Step 5: Commit**

Run:
```bash
git add client/src/components/agent/parseAgentStream.ts client/src/components/agent/parseAgentStream.test.ts
git commit -m "Add pure SSE parser for agent stream events"
```

---

## Task 4: Server agent registry

**Files:**
- Create: `server/agents.ts`
- Test: `server/agents.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `server/agents.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { getAgent, POTENTIAL_API_BASE } from "./agents";

describe("getAgent", () => {
  it("returns the ruby agent config", () => {
    const agent = getAgent("ruby");
    expect(agent).toBeDefined();
    expect(typeof agent!.botId).toBe("string");
    expect(agent!.botId.length).toBeGreaterThan(0);
  });

  it("returns undefined for an unknown agent key", () => {
    expect(getAgent("does-not-exist")).toBeUndefined();
  });
});

describe("POTENTIAL_API_BASE", () => {
  it("points at the production API host", () => {
    expect(POTENTIAL_API_BASE).toBe("https://api.potential.com");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- server/agents`
Expected: FAIL — cannot find module `./agents`.

- [ ] **Step 3: Implement the agent registry**

Create `server/agents.ts`:
```ts
// The single place agent bot IDs live. The browser only ever sends an
// agentKey ("ruby"); bot IDs are resolved here, server-side.
export interface AgentConfig {
  botId: string;
}

export const AGENTS: Record<string, AgentConfig> = {
  ruby: { botId: process.env.RUBY_BOT_ID ?? "6a056e4ece71ae96a167f826" },
  // Future: vera, ayla, lumi — one line each.
};

export function getAgent(key: string): AgentConfig | undefined {
  return AGENTS[key];
}

export const POTENTIAL_API_BASE = "https://api.potential.com";
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- server/agents`
Expected: PASS — all 3 tests pass.

- [ ] **Step 5: Commit**

Run:
```bash
git add server/agents.ts server/agents.test.ts
git commit -m "Add server-side agent registry"
```

---

## Task 5: Chat proxy route

**Files:**
- Modify: `server/routes.ts` (add import at top; add route inside `registerRoutes`)
- Test: `server/routes.agent-chat.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `server/routes.agent-chat.test.ts`:
```ts
import { describe, it, expect, vi, afterEach } from "vitest";
import express from "express";
import request from "supertest";
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- routes.agent-chat`
Expected: FAIL — 404 test passes by accident only if route is absent it returns 404 from Express default... actually Express returns 404 for unmatched routes, so the first test may pass. The second and third tests FAIL (route not implemented — `res.text` will not contain the token, status will be 404 not 200/503).

- [ ] **Step 3: Add the stream import to server/routes.ts**

At the top of `server/routes.ts`, the existing imports begin with:
```ts
import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import path from "path";
```
Add two imports immediately after the `path` import:
```ts
import { Readable } from "node:stream";
import { getAgent, POTENTIAL_API_BASE } from "./agents";
```

- [ ] **Step 4: Add the chat route inside registerRoutes**

In `server/routes.ts`, find the end of `registerRoutes` — it currently ends with:
```ts
  const httpServer = createServer(app);
  return httpServer;
}
```
Insert the chat route immediately before `const httpServer = createServer(app);`:
```ts
  // --- AI Agent proxy (native chat) ---

  // Streams an agent chat response. Browser sends only an agentKey; the bot ID
  // is resolved server-side and never exposed.
  app.post("/api/agent/:agentKey/chat", async (req, res) => {
    const agent = getAgent(req.params.agentKey);
    if (!agent) {
      return res.status(404).json({ message: "Unknown agent" });
    }
    try {
      const upstream = await fetch(
        `${POTENTIAL_API_BASE}/agent/chatbot/${agent.botId}/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: req.body?.message,
            sessionId: req.body?.sessionId,
          }),
        },
      );
      if (!upstream.ok || !upstream.body) {
        return res
          .status(upstream.status || 502)
          .json({ message: "Upstream agent error" });
      }
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      Readable.fromWeb(upstream.body as any).pipe(res);
    } catch (err) {
      console.error("Agent chat proxy error:", err);
      res.status(502).json({ message: "Failed to reach agent" });
    }
  });

```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test -- routes.agent-chat`
Expected: PASS — all 3 tests pass.

- [ ] **Step 6: Commit**

Run:
```bash
git add server/routes.ts server/routes.agent-chat.test.ts
git commit -m "Add streaming chat proxy route for agents"
```

---

## Task 6: Bot config proxy route

**Files:**
- Modify: `server/routes.ts` (add route inside `registerRoutes`)
- Test: `server/routes.agent-bot.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `server/routes.agent-bot.test.ts`:
```ts
import { describe, it, expect, vi, afterEach } from "vitest";
import express from "express";
import request from "supertest";
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- routes.agent-bot`
Expected: FAIL — the whitelist test and upstream-status test fail (route not implemented; Express returns 404).

- [ ] **Step 3: Add the bot config route inside registerRoutes**

In `server/routes.ts`, immediately after the chat route added in Task 5 (after its closing `});` and before `const httpServer = createServer(app);`), insert:
```ts
  // Returns whitelisted bot config — name, greeting, avatar only. The upstream
  // `system` prompt and internal IDs are deliberately stripped.
  app.get("/api/agent/:agentKey/bot", async (req, res) => {
    const agent = getAgent(req.params.agentKey);
    if (!agent) {
      return res.status(404).json({ message: "Unknown agent" });
    }
    try {
      const upstream = await fetch(
        `${POTENTIAL_API_BASE}/api/admin/bot/${agent.botId}`,
      );
      if (!upstream.ok) {
        return res
          .status(upstream.status || 502)
          .json({ message: "Upstream agent error" });
      }
      const data: any = await upstream.json();
      res.json({
        name: typeof data.name === "string" ? data.name : "",
        greeting: typeof data.greeting === "string" ? data.greeting : "",
        avatarUrl: data.imageName
          ? `${POTENTIAL_API_BASE}/static/mentors/${data.imageName}`
          : "",
      });
    } catch (err) {
      console.error("Agent bot config proxy error:", err);
      res.status(502).json({ message: "Failed to reach agent" });
    }
  });

```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- routes.agent-bot`
Expected: PASS — all 3 tests pass.

- [ ] **Step 5: Commit**

Run:
```bash
git add server/routes.ts server/routes.agent-bot.test.ts
git commit -m "Add whitelisted bot config proxy route for agents"
```

---

## Task 7: Image upload proxy route

**Files:**
- Modify: `server/routes.ts` (add route inside `registerRoutes`)
- Test: `server/routes.agent-upload.test.ts`

The route forwards the raw multipart request body straight to the upstream
`/streaming/upload` endpoint. `express.json()` only parses `application/json`,
so a multipart body reaches this handler untouched and is streamed through.

- [ ] **Step 1: Write the failing tests**

Create `server/routes.agent-upload.test.ts`:
```ts
import { describe, it, expect, vi, afterEach } from "vitest";
import express from "express";
import request from "supertest";
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- routes.agent-upload`
Expected: FAIL — the forwarding test fails (route not implemented).

- [ ] **Step 3: Add the upload route inside registerRoutes**

In `server/routes.ts`, immediately after the bot config route added in Task 6 (before `const httpServer = createServer(app);`), insert:
```ts
  // Proxies an image upload to the upstream agent file endpoint. The raw
  // multipart body is streamed straight through — express.json() ignores
  // non-JSON content types, so the body arrives here untouched.
  app.post("/api/agent/:agentKey/upload", async (req, res) => {
    const agent = getAgent(req.params.agentKey);
    if (!agent) {
      return res.status(404).json({ message: "Unknown agent" });
    }
    try {
      const upstream = await fetch(`${POTENTIAL_API_BASE}/streaming/upload`, {
        method: "POST",
        headers: { "Content-Type": req.headers["content-type"] ?? "" },
        body: Readable.toWeb(req) as any,
        duplex: "half",
      } as any);
      const text = await upstream.text();
      res
        .status(upstream.status)
        .type(upstream.headers.get("content-type") ?? "application/json")
        .send(text);
    } catch (err) {
      console.error("Agent upload proxy error:", err);
      res.status(502).json({ message: "Failed to upload" });
    }
  });

```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- routes.agent-upload`
Expected: PASS — both tests pass.

- [ ] **Step 5: Run the full test suite to confirm nothing regressed**

Run: `npm test`
Expected: PASS — all tests across `parseAgentStream`, `server/agents`, and the three route files pass.

- [ ] **Step 6: Commit**

Run:
```bash
git add server/routes.ts server/routes.agent-upload.test.ts
git commit -m "Add image upload proxy route for agents"
```

---

## Task 8: react-markdown dependency + GenericToolCard

**Files:**
- Modify: `package.json` (add `react-markdown`)
- Create: `client/src/components/agent/GenericToolCard.tsx`

`GenericToolCard` is the fallback renderer for any tool with no bespoke card.
It shows a small "Using {tool}" pill while loading, then renders the tool's
response content as text/markdown when complete.

- [ ] **Step 1: Install react-markdown**

Run:
```bash
npm install react-markdown@^9.0.1
```
Expected: `react-markdown` added to `dependencies`, no errors.

- [ ] **Step 2: Create GenericToolCard**

Create `client/src/components/agent/GenericToolCard.tsx`:
```tsx
import ReactMarkdown from "react-markdown";
import { Wrench } from "lucide-react";
import type { ToolInvocation } from "@shared/agent";

interface GenericToolCardProps {
  invocation: ToolInvocation;
}

// Fallback renderer for any tool without a bespoke card.
export function GenericToolCard({ invocation }: GenericToolCardProps) {
  const { name, status, response } = invocation;

  if (status === "loading") {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary border border-primary/20">
        <Wrench className="h-3.5 w-3.5 animate-pulse" />
        <span>Using {name}…</span>
      </div>
    );
  }

  const text =
    typeof response === "string"
      ? response
      : "```json\n" + JSON.stringify(response, null, 2) + "\n```";

  return (
    <div className="rounded-xl border border-border bg-card p-3 text-sm">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Wrench className="h-3.5 w-3.5" />
        <span>{name}</span>
      </div>
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify it type-checks**

Run: `npm run check`
Expected: PASS — no TypeScript errors.

- [ ] **Step 4: Commit**

Run:
```bash
git add package.json package-lock.json client/src/components/agent/GenericToolCard.tsx
git commit -m "Add react-markdown and the GenericToolCard fallback renderer"
```

---

## Task 9: Tool registry type + ToolCard component

**Files:**
- Create: `client/src/components/agent/toolRegistry.ts`
- Create: `client/src/components/agent/ToolCard.tsx`

- [ ] **Step 1: Create the tool registry type**

Create `client/src/components/agent/toolRegistry.ts`:
```ts
import type { ComponentType } from "react";
import type { ToolInvocation } from "@shared/agent";

// Every bespoke tool card receives the same prop shape.
export interface ToolCardProps {
  invocation: ToolInvocation;
}

// Maps a tool name to the component that renders it. Tools absent from a
// registry fall back to GenericToolCard (see ToolCard.tsx).
export type ToolRegistry = Record<string, ComponentType<ToolCardProps>>;
```

- [ ] **Step 2: Create the ToolCard dispatcher**

Create `client/src/components/agent/ToolCard.tsx`:
```tsx
import { GenericToolCard } from "./GenericToolCard";
import type { ToolRegistry } from "./toolRegistry";
import type { ToolInvocation } from "@shared/agent";

interface ToolCardProps {
  invocation: ToolInvocation;
  registry: ToolRegistry;
}

// Looks up the bespoke card for this tool; falls back to GenericToolCard.
// If a bespoke card throws on an unexpected payload shape, this still renders
// the generic card (the bespoke cards themselves guard their own parsing).
export function ToolCard({ invocation, registry }: ToolCardProps) {
  const Bespoke = registry[invocation.name];
  if (Bespoke) {
    return <Bespoke invocation={invocation} />;
  }
  return <GenericToolCard invocation={invocation} />;
}
```

- [ ] **Step 3: Verify it type-checks**

Run: `npm run check`
Expected: PASS — no TypeScript errors.

- [ ] **Step 4: Commit**

Run:
```bash
git add client/src/components/agent/toolRegistry.ts client/src/components/agent/ToolCard.tsx
git commit -m "Add tool registry type and ToolCard dispatcher"
```

---

## Task 10: useAgentChat hook

**Files:**
- Create: `client/src/components/agent/useAgentChat.ts`

The hook owns all chat state: the message list, the streaming status, and a
`sessionId` generated once per page session. `send()` posts to the chat proxy,
reads the streamed response with `createStreamParser`, and updates the current
agent message as `token` / `toolCall` / `toolResponse` / `error` / `done`
events arrive.

- [ ] **Step 1: Create the hook**

Create `client/src/components/agent/useAgentChat.ts`:
```ts
import { useCallback, useRef, useState } from "react";
import type { AgentMessage, ToolInvocation } from "@shared/agent";
import { createStreamParser } from "./parseAgentStream";

let idCounter = 0;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

function newSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export interface UseAgentChat {
  messages: AgentMessage[];
  status: "idle" | "streaming";
  send: (text: string, imageUrl?: string) => Promise<void>;
}

export function useAgentChat(agentKey: string): UseAgentChat {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [status, setStatus] = useState<"idle" | "streaming">("idle");
  const sessionIdRef = useRef<string>(newSessionId());

  // Mutates the agent message with the given id via an updater function.
  const updateAgentMessage = useCallback(
    (id: string, updater: (msg: AgentMessage) => AgentMessage) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? updater(m) : m)),
      );
    },
    [],
  );

  const send = useCallback(
    async (text: string, imageUrl?: string) => {
      if (!text.trim() || status === "streaming") return;

      const userMessage: AgentMessage = {
        id: nextId("user"),
        role: "user",
        text,
        tools: [],
        imageUrl,
        status: "complete",
      };
      const agentId = nextId("agent");
      const agentMessage: AgentMessage = {
        id: agentId,
        role: "agent",
        text: "",
        tools: [],
        status: "streaming",
      };
      setMessages((prev) => [...prev, userMessage, agentMessage]);
      setStatus("streaming");

      try {
        const res = await fetch(`/api/agent/${agentKey}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            message: text,
            sessionId: sessionIdRef.current,
          }),
        });

        if (!res.ok || !res.body) {
          updateAgentMessage(agentId, (m) => ({
            ...m,
            text: "Sorry, I couldn't reach the agent. Please try again.",
            status: "error",
          }));
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        const parser = createStreamParser();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const events = parser.push(decoder.decode(value, { stream: true }));

          for (const event of events) {
            if (event.kind === "token") {
              updateAgentMessage(agentId, (m) => ({
                ...m,
                text: m.text + event.content,
              }));
            } else if (event.kind === "toolCall") {
              const invocation: ToolInvocation = {
                id: `${event.name}-${JSON.stringify(event.arguments)}`,
                name: event.name,
                arguments: event.arguments,
                status: "loading",
              };
              updateAgentMessage(agentId, (m) =>
                m.tools.some((t) => t.id === invocation.id)
                  ? m
                  : { ...m, tools: [...m.tools, invocation] },
              );
            } else if (event.kind === "toolResponse") {
              updateAgentMessage(agentId, (m) => {
                // Attach the response to the most recent loading invocation
                // for this tool name.
                const idx = [...m.tools]
                  .map((t, i) => ({ t, i }))
                  .reverse()
                  .find(
                    ({ t }) =>
                      t.name === event.name && t.status === "loading",
                  )?.i;
                if (idx === undefined) return m;
                const tools = m.tools.slice();
                tools[idx] = {
                  ...tools[idx],
                  response: event.content,
                  status: "complete",
                };
                return { ...m, tools };
              });
            } else if (event.kind === "error") {
              updateAgentMessage(agentId, (m) => ({
                ...m,
                text: m.text
                  ? `${m.text}\n\n_Error: ${event.message}_`
                  : `Error: ${event.message}`,
                status: "error",
              }));
            } else if (event.kind === "done") {
              updateAgentMessage(agentId, (m) => ({
                ...m,
                // Prefer the streamed text; fall back to the final response.
                text: m.text || event.response,
                status: m.status === "error" ? "error" : "complete",
              }));
            }
          }
        }

        // Stream ended without an explicit done event — finalize anyway.
        updateAgentMessage(agentId, (m) =>
          m.status === "streaming" ? { ...m, status: "complete" } : m,
        );
      } catch (err) {
        console.error("useAgentChat send error:", err);
        updateAgentMessage(agentId, (m) => ({
          ...m,
          text:
            m.text ||
            "Sorry, something went wrong reaching the agent. Please try again.",
          status: "error",
        }));
      } finally {
        setStatus("idle");
      }
    },
    [agentKey, status, updateAgentMessage],
  );

  return { messages, status, send };
}
```

- [ ] **Step 2: Verify it type-checks**

Run: `npm run check`
Expected: PASS — no TypeScript errors.

- [ ] **Step 3: Commit**

Run:
```bash
git add client/src/components/agent/useAgentChat.ts
git commit -m "Add useAgentChat streaming hook"
```

---

## Task 11: MessageBubble component

**Files:**
- Create: `client/src/components/agent/MessageBubble.tsx`

- [ ] **Step 1: Create the component**

Create `client/src/components/agent/MessageBubble.tsx`:
```tsx
import ReactMarkdown from "react-markdown";
import { ToolCard } from "./ToolCard";
import type { ToolRegistry } from "./toolRegistry";
import type { AgentMessage } from "@shared/agent";

interface MessageBubbleProps {
  message: AgentMessage;
  registry: ToolRegistry;
}

// Renders one chat message: user messages right-aligned and plain; agent
// messages left-aligned with markdown plus any tool cards.
export function MessageBubble({ message, registry }: MessageBubbleProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-sm text-white">
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

  return (
    <div className="flex flex-col gap-2">
      {message.tools.map((tool) => (
        <ToolCard key={tool.id} invocation={tool} registry={registry} />
      ))}
      {(message.text || message.status === "streaming") && (
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
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify it type-checks**

Run: `npm run check`
Expected: PASS — no TypeScript errors.

- [ ] **Step 3: Commit**

Run:
```bash
git add client/src/components/agent/MessageBubble.tsx
git commit -m "Add MessageBubble component"
```

---

## Task 12: AgentChat component (text chat, no image upload yet)

**Files:**
- Create: `client/src/components/agent/AgentChat.tsx`

This task builds the chat panel with text messaging only. Image upload is
added in Task 13.

- [ ] **Step 1: Create the component**

Create `client/src/components/agent/AgentChat.tsx`:
```tsx
import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "./MessageBubble";
import { useAgentChat } from "./useAgentChat";
import type { ToolRegistry } from "./toolRegistry";
import type { AgentBotConfig } from "@shared/agent";

interface AgentChatProps {
  agentKey: string;
  registry: ToolRegistry;
}

// Generic, agent-agnostic chat panel. Fetches the agent's bot config (name,
// greeting, avatar) on mount, renders the conversation, and owns the input box.
export function AgentChat({ agentKey, registry }: AgentChatProps) {
  const { messages, status, send } = useAgentChat(agentKey);
  const [input, setInput] = useState("");
  const [bot, setBot] = useState<AgentBotConfig | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/agent/${agentKey}/bot`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data) setBot(data as AgentBotConfig);
      })
      .catch(() => {
        /* greeting is optional — ignore config failures */
      });
    return () => {
      cancelled = true;
    };
  }, [agentKey]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status === "streaming") return;
    const text = input;
    setInput("");
    void send(text);
  };

  return (
    <div className="mx-auto flex h-[600px] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        {bot?.avatarUrl && (
          <img
            src={bot.avatarUrl}
            alt={bot.name}
            className="h-9 w-9 rounded-full object-cover"
          />
        )}
        <div>
          <div className="text-sm font-semibold">{bot?.name ?? "Ruby"}</div>
          <div className="text-xs text-muted-foreground">AI Beauty Concierge</div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && bot?.greeting && (
          <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-muted px-4 py-2 text-sm">
            {bot.greeting}
          </div>
        )}
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            registry={registry}
          />
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-border bg-card p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Ruby anything…"
          className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
          data-testid="agent-chat-input"
        />
        <Button
          type="submit"
          size="icon"
          className="rounded-full"
          disabled={status === "streaming" || !input.trim()}
          data-testid="agent-chat-send"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Verify it type-checks**

Run: `npm run check`
Expected: PASS — no TypeScript errors.

- [ ] **Step 3: Commit**

Run:
```bash
git add client/src/components/agent/AgentChat.tsx
git commit -m "Add AgentChat panel component (text chat)"
```

---

## Task 13: Image upload in AgentChat

**Files:**
- Modify: `client/src/components/agent/AgentChat.tsx`

Adds a file-picker button. The selected image is uploaded via the
`/api/agent/:agentKey/upload` proxy; on success its filename is appended to the
next message text (so Ruby's `analyze_product_image` flow can reference it) and
a local preview URL is shown on the user's message bubble.

- [ ] **Step 1: Add image-upload state and handler to AgentChat**

In `client/src/components/agent/AgentChat.tsx`, update the imports — change:
```tsx
import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
```
to:
```tsx
import { useEffect, useRef, useState } from "react";
import { Send, ImagePlus, X } from "lucide-react";
```

Then, immediately after the existing state declarations:
```tsx
  const { messages, status, send } = useAgentChat(agentKey);
  const [input, setInput] = useState("");
  const [bot, setBot] = useState<AgentBotConfig | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
```
add:
```tsx
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImage, setPendingImage] = useState<{
    previewUrl: string;
    filename: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/agent/${agentKey}/upload`, {
        method: "POST",
        credentials: "include",
        body: form,
      });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const data = await res.json();
      const filename = data.filename ?? data.fileName ?? data.name;
      if (!filename) throw new Error("Upload response missing filename");
      setPendingImage({
        previewUrl: URL.createObjectURL(file),
        filename,
      });
    } catch (err) {
      console.error(err);
      alert("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };
```

- [ ] **Step 2: Update handleSubmit to include the uploaded image**

In the same file, replace the existing `handleSubmit`:
```tsx
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status === "streaming") return;
    const text = input;
    setInput("");
    void send(text);
  };
```
with:
```tsx
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "streaming") return;
    const hasText = input.trim().length > 0;
    if (!hasText && !pendingImage) return;

    // When an image is attached, append its uploaded filename to the message
    // so the agent's analyze_product_image flow can reference it.
    const text = pendingImage
      ? `${input} [image: ${pendingImage.filename}]`.trim()
      : input;
    const previewUrl = pendingImage?.previewUrl;
    setInput("");
    setPendingImage(null);
    void send(text, previewUrl);
  };
```

- [ ] **Step 3: Add the image preview and file-picker button to the form**

In the same file, replace the entire `<form>` block:
```tsx
      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-border bg-card p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Ruby anything…"
          className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
          data-testid="agent-chat-input"
        />
        <Button
          type="submit"
          size="icon"
          className="rounded-full"
          disabled={status === "streaming" || !input.trim()}
          data-testid="agent-chat-send"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
```
with:
```tsx
      {/* Input */}
      <div className="border-t border-border bg-card p-3">
        {pendingImage && (
          <div className="mb-2 inline-flex items-center gap-2 rounded-lg border border-border bg-background p-1 pr-2">
            <img
              src={pendingImage.previewUrl}
              alt="Attached"
              className="h-10 w-10 rounded object-cover"
            />
            <span className="text-xs text-muted-foreground">
              Image attached
            </span>
            <button
              type="button"
              onClick={() => setPendingImage(null)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Remove attached image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelected}
            data-testid="agent-chat-file"
          />
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="rounded-full"
            disabled={uploading || status === "streaming"}
            onClick={() => fileInputRef.current?.click()}
            data-testid="agent-chat-upload"
            aria-label="Attach an image"
          >
            <ImagePlus className="h-4 w-4" />
          </Button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Ruby anything…"
            className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
            data-testid="agent-chat-input"
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full"
            disabled={
              status === "streaming" || (!input.trim() && !pendingImage)
            }
            data-testid="agent-chat-send"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
```

- [ ] **Step 4: Verify it type-checks**

Run: `npm run check`
Expected: PASS — no TypeScript errors.

- [ ] **Step 5: Commit**

Run:
```bash
git add client/src/components/agent/AgentChat.tsx
git commit -m "Add image upload to AgentChat panel"
```

---

## Task 14: RubyChat wrapper + Ruby tool registry

**Files:**
- Create: `client/src/components/ruby/rubyToolRegistry.ts`
- Create: `client/src/components/ruby/RubyChat.tsx`

- [ ] **Step 1: Create the Ruby tool registry (empty — Plan 2 fills it)**

Create `client/src/components/ruby/rubyToolRegistry.ts`:
```ts
import type { ToolRegistry } from "@/components/agent/toolRegistry";

// Bespoke tool cards for Ruby. Empty for now — every tool falls back to
// GenericToolCard. Plan 2 adds one entry per tool (get_shopify_products,
// track_order, add_to_cart, ...).
export const rubyToolRegistry: ToolRegistry = {};
```

- [ ] **Step 2: Create the RubyChat wrapper**

Create `client/src/components/ruby/RubyChat.tsx`:
```tsx
import { AgentChat } from "@/components/agent/AgentChat";
import { rubyToolRegistry } from "./rubyToolRegistry";

// Ruby-specific binding of the generic AgentChat panel.
export function RubyChat() {
  return <AgentChat agentKey="ruby" registry={rubyToolRegistry} />;
}
```

- [ ] **Step 3: Verify it type-checks**

Run: `npm run check`
Expected: PASS — no TypeScript errors.

- [ ] **Step 4: Commit**

Run:
```bash
git add client/src/components/ruby/rubyToolRegistry.ts client/src/components/ruby/RubyChat.tsx
git commit -m "Add RubyChat wrapper and Ruby tool registry"
```

---

## Task 15: Swap RubyChat into the Demo page

**Files:**
- Modify: `client/src/pages/Demo.tsx`

This replaces the embed with `<RubyChat />` and removes the now-dead code that
only existed to support the embed and the commented-out Voice/Avatar modes:
the embed-loading `useEffect`, the `#potchat` div, the mode-toggle buttons,
`renderVoiceInterface`, `renderAvatarInterface`, the `useCases` array, and the
unused `messages` / `inputValue` / `handleSendMessage` / `handleUseCaseClick` /
`toggleVoice` state and handlers. The "What Ruby Can Do" accordion and
Integrations sections are untouched.

- [ ] **Step 1: Replace the imports block**

In `client/src/pages/Demo.tsx`, replace the entire top import block (lines 1–42, from `import { useState, useEffect }` through `import { Toaster } from "@/components/ui/toaster";`) with:
```tsx
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { RubyChat } from "@/components/ruby/RubyChat";
import {
  ShoppingCart,
  Briefcase,
  GraduationCap,
  Hospital,
  Users,
  ChevronDown,
  Check,
} from "lucide-react";
import {
  SiShopify,
  SiStripe,
  SiHubspot,
  SiSalesforce,
  SiTwilio,
  SiSlack,
  SiZapier,
  SiNotion,
  SiAmazon,
  SiGooglecloud,
  SiMailchimp,
} from "react-icons/si";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
```

- [ ] **Step 2: Remove dead state, the embed useEffect, and unused handlers**

In `client/src/pages/Demo.tsx`, the component currently opens like this (after the `interface Message` block and `const Demo = () => {`):
```tsx
  const [activeMode, setActiveMode] = useState<InterfaceMode>("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();
```
Replace everything from the start of the file's `type InterfaceMode` line through the end of the `toggleVoice` function (the entire block: the `type InterfaceMode`, `interface Message`, all five `useState` calls, `copyToClipboard`, the embed-loading `useEffect`, `handleUseCaseClick`, `handleSendMessage`, `toggleVoice`) with just:
```tsx
const Demo = () => {
  const { toast } = useToast();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied!", description: "Text copied to clipboard" });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Refresh AOS animations on page load.
    if (typeof window !== "undefined" && (window as any).AOS) {
      (window as any).AOS.refresh();
    }
  }, []);
```

Note: `copyToClipboard` is kept — it is still used by the "What Ruby Can Do" accordion. `useEffect` is kept only for the AOS refresh.

- [ ] **Step 3: Remove the useCases array, renderVoiceInterface, and renderAvatarInterface**

In `client/src/pages/Demo.tsx`, delete these three blocks entirely:
- the `const useCases = [ ... ];` array (the five-item array of shopping/sales/learning/etc. objects)
- the `const renderVoiceInterface = () => ( ... );` function
- the `const renderAvatarInterface = () => ( ... );` function

Leave `const detailedUseCases = [ ... ];` and `const integrations = [ ... ];` in place — those feed the sections that stay.

- [ ] **Step 4: Replace the hero's mode toggles and interface area with RubyChat**

In `client/src/pages/Demo.tsx`, inside the Hero `<section>`, replace this block:
```tsx
          {/* Mode toggles */}
          <div
            className="flex justify-center gap-4 mb-12"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <Button
              variant={activeMode === "chat" ? "default" : "outline"}
              onClick={() => setActiveMode("chat")}
              className="rounded-full"
              data-testid="button-mode-chat"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat 💬
            </Button>
            {/* <Button
              variant={activeMode === "voice" ? "default" : "outline"}
              onClick={() => setActiveMode("voice")}
              className="rounded-full"
              data-testid="button-mode-voice"
            >
              <Mic className="mr-2 h-4 w-4" />
              Voice 🎙️
            </Button>
            <Button
              variant={activeMode === "avatar" ? "default" : "outline"}
              onClick={() => setActiveMode("avatar")}
              className="rounded-full"
              data-testid="button-mode-avatar"
            >
              <User className="mr-2 h-4 w-4" />
              Avatar 🧑‍💻
            </Button> */}
          </div>

          {/* Chat embed - always rendered but hidden when not active */}
          <div
            id="potchat"
            className="w-full min-h-[500px] max-w-3xl mx-auto"
            style={{ display: activeMode === "chat" ? "block" : "none" }}
            data-aos="fade-up"
            data-aos-delay="200"
          ></div>

          {/* Interface rendering */}
          <div data-aos="fade-up" data-aos-delay="200">
            {activeMode === "voice" && renderVoiceInterface()}
            {activeMode === "avatar" && renderAvatarInterface()}
          </div>
```
with:
```tsx
          {/* Native chat interface */}
          <div data-aos="fade-up" data-aos-delay="200">
            <RubyChat />
          </div>
```

- [ ] **Step 5: Verify it type-checks**

Run: `npm run check`
Expected: PASS — no TypeScript errors. (If `tsc` reports an unused import — e.g. `Button` or an unused lucide icon — remove that specific import from the Step 1 block. `Button` is no longer used in `Demo.tsx` after Step 4, so remove `import { Button } from "@/components/ui/button";` if it is still present — it was already excluded in Step 1's replacement block, so this should be clean.)

- [ ] **Step 6: Run the full test suite**

Run: `npm test`
Expected: PASS — all tests pass (no test touches `Demo.tsx`, but this confirms nothing else regressed).

- [ ] **Step 7: Manual browser verification**

Start the dev server: `npm run dev`
Then in a browser open `http://localhost:5001/demo` and verify:
1. The page loads with the "Meet Ruby" hero and a chat panel where the embed used to be.
2. The chat panel header shows Ruby's name and avatar (fetched from `/api/agent/ruby/bot`).
3. Ruby's greeting message appears in the empty conversation.
4. Typing "show me lipsticks" and sending streams a response token-by-token.
5. A message that triggers a tool (e.g. "show me makeup products") renders a `GenericToolCard` — a "Using {tool}…" pill, then the tool's content.
6. The image-attach button opens a file picker; selecting an image shows a preview chip; sending includes it on the user bubble.
7. The "What Ruby Can Do" accordion and the Integrations grid below still render and the accordion's copy-to-clipboard still works.
8. Browser console shows no errors.

If any check fails, fix it before committing.

- [ ] **Step 8: Commit**

Run:
```bash
git add client/src/pages/Demo.tsx
git commit -m "Replace Ruby embed with native RubyChat on the demo page"
```

---

## Self-Review Notes

**Spec coverage:**
- Native chat replacing the embed → Tasks 12–15
- Streaming token-by-token → Tasks 3 (parser), 10 (hook)
- Tool-call rendering (generic fallback this plan; bespoke cards = Plan 2) → Tasks 8, 9
- Image upload → Tasks 7 (proxy), 13 (UI)
- Generic agent-agnostic proxy, bot ID never exposed → Tasks 4–7
- Whitelisted bot config (no `system` leak) → Task 6
- Shared types → Task 2
- Layered architecture (pure parser / hook / presentational components) → Tasks 3, 10, 11, 12
- Error handling (malformed chunks skipped, error events inline, fetch failure) → Tasks 3, 10
- Testing (pure logic + proxy routes automated; UI manual golden-path) → Tasks 1–7, 15 Step 7
- Demo page dead-code removal → Task 15

**Out of scope (Plan 2):** the 19 bespoke tool cards and their per-tool payload extraction; component render tests.

**Type consistency:** `AgentStreamEvent`, `ToolInvocation`, `AgentMessage`, `AgentBotConfig` defined in Task 2 and used unchanged in Tasks 3, 9, 10, 11, 12. `ToolRegistry` / `ToolCardProps` defined in Task 9, used in Tasks 9, 11, 12, 14. `createStreamParser` defined in Task 3, used in Task 10. `getAgent` / `POTENTIAL_API_BASE` defined in Task 4, used in Tasks 5, 6, 7. `useAgentChat` defined in Task 10, used in Task 12. `RubyChat` defined in Task 14, used in Task 15.
