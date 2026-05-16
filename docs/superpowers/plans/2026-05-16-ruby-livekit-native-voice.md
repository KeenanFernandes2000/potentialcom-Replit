# Ruby LiveKit-Native Voice Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Ruby's hand-rolled WebSocket voice transport (Plan 2b) with LiveKit's official Agents pipeline. The browser connects via `livekit-client` SDK, a deployed `voice-agent` worker is dispatched into the room, and STT/TTS/AI flow through LiveKit's plugins.

**Architecture:** Three repos. A new stripper worker repo (`/Users/potdev/Documents/GitHub/LiveKit-agent`) holds only the LiveKit Agents worker code. `potentialTS` gets explicit agent dispatch in `routes/livekit.ts` plus a new SSE `/agent/chatbot/:botId/voice-llm` endpoint that the worker calls per turn. `potentialcom-Replit`'s `useLiveKitVoice` hook is rewritten internally to use `livekit-client`; its public surface (the `start/hangup/toggleMute/state/...` shape) stays identical so `VoiceModeButton`, `VoiceCallBar`, `AgentChat`, and `useAgentChat.pushExternalEvent` keep working unchanged.

**Tech Stack:** TypeScript everywhere. `@livekit/agents` ^1.0.30 + plugins (silero / deepgram / elevenlabs / openai). `@livekit/rtc-node` ^0.13.22 (worker). `livekit-server-sdk` ^2.14.0 (potentialTS — `RoomServiceClient`, `AgentDispatchClient`). `livekit-client` ^2.15.10 (browser — `Room`, `RoomEvent`, `Track`). `mongoose` ^8 + `dotenv` ^16. Node 20+ (global `fetch`).

**Spec:** `docs/superpowers/specs/2026-05-16-ruby-livekit-native-voice-design.md` (committed `a14526b`).

**Reference implementation to study before each task:**
- `/Users/potdev/Documents/GitHub/PotentialBackendLive/src/agents/agentServer.ts` (134 lines) — worker entry
- `/Users/potdev/Documents/GitHub/PotentialBackendLive/src/agents/voiceAgent.ts` (821 lines) — per-session agent
- `/Users/potdev/Documents/GitHub/PotentialBackendLive/src/routes/livekit.ts` (lines 38–143) — dispatch endpoint
- `/Users/potdev/Documents/GitHub/PotentialBackendLive/src/models/botVoiceAgent.model.ts`
- `/Users/potdev/Documents/GitHub/potentialTS/src/controllers/agent.controller.ts` lines 366–540 — existing `/chat` SSE shape we mirror in `voice-llm`

**Deployment context:** A `voice-agent` worker is already running in production (image deployed from `PotentialBackendLive` or equivalent — confirmed by the user). Today's dispatch goes to that worker. **The new `/LiveKit-agent` repo we build here is for FUTURE deploy.** The dispatch in `routes/livekit.ts` just names the agent — it doesn't care which worker codebase responds, as long as the name matches. We use `"voice-agent"` (PotentialBackendLive's name) so the existing deployed worker keeps answering until the user swaps it out for the stripper repo's build.

**Prerequisite environment:**
- Node v20.19.4 via nvm: `PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH` (prepend to every `npm`/`tsx` command)
- Mongo creds + LiveKit creds available in `.env` files (existing, untouched)
- `manualVoiceSubscriptionActive: true` already set on Ruby's bot owner (Plan 2b debug step — keep it)

**Working branches (suggested):**
- `potentialcom-Replit` → branch `claude/ruby-livekit-native-voice` (worktree at `.claude/worktrees/ruby-livekit-native-voice/`)
- `potentialTS` → branch `feature/livekit-native-dispatch` (changes are small, no worktree needed — commit on a branch directly)
- `LiveKit-agent` → new repo, initial commit on `main`

---

## File Structure (locked-in)

### NEW repo: `/Users/potdev/Documents/GitHub/LiveKit-agent`

```
LiveKit-agent/
├── package.json              ← deps + scripts (dev, start)
├── tsconfig.json
├── .gitignore                ← node_modules, .env, dist
├── .env.example              ← required env vars documented
├── README.md                 ← how to run + dispatch test
└── src/
    ├── agentServer.ts        ← worker entry; registers "voice-agent"
    ├── voiceAgent.ts         ← per-session orchestration
    ├── customLLM.ts          ← HTTP-delegated LLM (SSE consumer)
    ├── chatHistory.ts        ← loads ChatHistory into voice.ChatContext
    └── models/
        ├── bot.model.ts
        ├── botVoiceAgent.model.ts
        └── chatHistory.model.ts
```

### `potentialTS` modifications

- **Modify** `src/config/env.ts` — add `LIVEKIT_AGENT_ENABLED` to REQUIRED_VARS
- **Modify** `src/routes/livekit.ts` (specifically the `POST /room/create` handler) — add `RoomServiceClient.createRoom` + `AgentDispatchClient.createDispatch` when `cfg?.type === "livekit"` AND `LIVEKIT_AGENT_ENABLED === "true"`; include `useNativeAgent: true` in response
- **Modify** `src/controllers/agent.controller.ts` — add `chatVoiceLlm` static method (SSE wrapper around `processWithAI`)
- **Modify** `src/routes/agent.ts` — register `POST /chatbot/:id/voice-llm → AgentController.chatVoiceLlm`

### `potentialcom-Replit` modifications

- **Modify** `client/src/components/agent/voice/useLiveKitVoice.ts` — replace WS + AudioContext + AudioWorklet internals with `livekit-client` `Room`
- **Modify** `client/src/components/agent/voice/useLiveKitVoice.test.ts` — replace `FakeWebSocket` + `FakeAudioContext` with `FakeRoom`
- **Modify** `client/src/components/agent/voice/AgentChatVoiceMode.test.tsx` — same swap
- **Modify** `server/routes.ts` — drop `customWsUrl`/`botId` synthesis in the `/voice/room` proxy; relay verbatim
- **Modify** `server/routes.agent-voice-room.test.ts` — drop the `customWsUrl` + `botId` assertions
- **Delete** `client/src/components/agent/voice/pcm-worklet.ts`
- **Add dep** `livekit-client@^2.15.10` to `package.json`

### Files that **do NOT change** in `potentialcom-Replit`

- `client/src/components/agent/AgentChat.tsx`
- `client/src/components/agent/voice/VoiceModeButton.tsx` + test
- `client/src/components/agent/voice/VoiceCallBar.tsx` + test
- `client/src/components/agent/voice/AutoSpeakToggle.tsx` + test
- `client/src/components/agent/voice/MicButton.tsx` + test
- `client/src/components/agent/voice/SpeakButton.tsx` + test
- `client/src/components/agent/voice/useAutoSpeak.ts` + test
- `client/src/components/agent/voice/useTextToSpeech.ts` + test
- `client/src/components/agent/voice/useVoiceRecorder.ts` + test
- `client/src/components/agent/voice/index.ts` (barrel — the `useLiveKitVoice` named export survives the internal rewrite)
- `client/src/components/agent/useAgentChat.ts` + test
- All Plan 2 tool cards (`client/src/components/ruby/cards/*` + tests)

---

## Task 1: Initialize `LiveKit-agent` repo

Create the directory, initialize git, write `package.json`, `tsconfig.json`, `.gitignore`, `.env.example`, and a small `README.md`. No application code yet — just scaffolding.

**Files:**
- Create: `/Users/potdev/Documents/GitHub/LiveKit-agent/package.json`
- Create: `/Users/potdev/Documents/GitHub/LiveKit-agent/tsconfig.json`
- Create: `/Users/potdev/Documents/GitHub/LiveKit-agent/.gitignore`
- Create: `/Users/potdev/Documents/GitHub/LiveKit-agent/.env.example`
- Create: `/Users/potdev/Documents/GitHub/LiveKit-agent/README.md`

- [ ] **Step 1: Create the directory and init git**

```bash
mkdir -p /Users/potdev/Documents/GitHub/LiveKit-agent
cd /Users/potdev/Documents/GitHub/LiveKit-agent
git init -b main
```

- [ ] **Step 2: Write `package.json`**

Create `/Users/potdev/Documents/GitHub/LiveKit-agent/package.json`:

```json
{
  "name": "livekit-agent",
  "version": "0.1.0",
  "private": true,
  "description": "Stripped LiveKit Agents worker for Potential voice bots (Ruby, Ayla, Vera, ...).",
  "type": "module",
  "engines": {
    "node": ">=20"
  },
  "scripts": {
    "dev": "tsx src/agentServer.ts dev",
    "start": "tsx src/agentServer.ts start",
    "check": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@livekit/agents": "^1.0.30",
    "@livekit/agents-plugin-silero": "^1.0.30",
    "@livekit/agents-plugin-deepgram": "^1.0.30",
    "@livekit/agents-plugin-elevenlabs": "^1.0.30",
    "@livekit/agents-plugin-openai": "^1.0.30",
    "@livekit/rtc-node": "^0.13.22",
    "mongoose": "^8.10.0",
    "dotenv": "^16.4.7"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "tsx": "^4.19.0",
    "typescript": "^5.5.4",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 3: Write `tsconfig.json`**

Create `/Users/potdev/Documents/GitHub/LiveKit-agent/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": false
  },
  "include": ["src/**/*.ts"]
}
```

- [ ] **Step 4: Write `.gitignore`**

Create `/Users/potdev/Documents/GitHub/LiveKit-agent/.gitignore`:

```
node_modules/
.env
.env.local
dist/
.DS_Store
*.log
```

- [ ] **Step 5: Write `.env.example`**

Create `/Users/potdev/Documents/GitHub/LiveKit-agent/.env.example`:

```bash
# LiveKit server connection (the worker connects here to receive job dispatches)
LIVEKIT_URL=wss://livekit.potential.com
# Optional: in-cluster URL when running inside Dokploy / k8s
# LIVEKIT_INTERNAL_URL=ws://livekit:7880
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=

# Where the worker calls back for LLM + tools (potentialTS deployment)
POTENTIAL_API_BASE=https://api.potential.com

# MongoDB — read bot config + chat history; write call duration on shutdown
MONGO_URI=mongodb://...

# Provider keys (used by Deepgram + ElevenLabs LiveKit plugins)
DEEPGRAM_API_KEY=
ELEVENLABS_API_KEY=

# Worker tuning (optional)
MAX_CONCURRENT_JOBS=10
LOAD_THRESHOLD=0.95
```

- [ ] **Step 6: Write `README.md`**

Create `/Users/potdev/Documents/GitHub/LiveKit-agent/README.md`:

```markdown
# LiveKit Agent — Potential voice worker

Stripped LiveKit Agents worker. Registers as `voice-agent` against a LiveKit
server, waits for explicit dispatches from potentialTS's
`POST /api/livekit/room/create`, joins the room, runs Silero VAD + Deepgram
STT + ElevenLabs TTS, and delegates LLM + tool calling to potentialTS via
`POST /agent/chatbot/:botId/voice-llm` (SSE).

## Run

```bash
cp .env.example .env
# Fill in LIVEKIT_*, MONGO_URI, DEEPGRAM_API_KEY, ELEVENLABS_API_KEY,
# POTENTIAL_API_BASE.
npm install
npm run dev     # dev mode (auto-reload)
npm run start   # production mode
```

## Test a dispatch end-to-end

With the worker running, in another terminal:

```bash
# Mint a room + dispatch the worker via potentialTS
curl -X POST https://api.potential.com/api/livekit/room/create \
  -H 'Content-Type: application/json' \
  -d '{"botId":"<botId>","sessionId":"test-session"}'
```

The worker's logs should show:
- `📥 Job received: voice-agent`
- `✅ Connected to room: bot-...`
- `✅ Got botId/sessionId from metadata`
- `🎙️ Starting voice session...`
- `✅ Voice session started`

## Deployment

This repo is meant to deploy as its own Dokploy service. Entry point:
`tsx src/agentServer.ts start`. Set the env vars from `.env.example`.

The deployed worker today is built from PotentialBackendLive. Switching to
this stripper is a deployment swap — the dispatch name (`voice-agent`)
matches, so cutover is atomic.
```

- [ ] **Step 7: Install deps and verify tsc baseline**

```bash
cd /Users/potdev/Documents/GitHub/LiveKit-agent && \
  PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm install
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npx tsc --noEmit
```

Expected: `npm install` succeeds with ~140 packages installed (LiveKit's framework pulls in audio/codec deps). `tsc --noEmit` exits 0 (no source files yet).

- [ ] **Step 8: Initial commit**

```bash
cd /Users/potdev/Documents/GitHub/LiveKit-agent && \
  git add . && \
  git commit -m "Initial scaffolding: package.json, tsconfig, env example, README"
```

---

## Task 2: Mongo models in `LiveKit-agent`

The worker reads `Bot` + `BotVoiceAgent` and writes to `BotVoiceAgent` on shutdown. It also reads `ChatHistory` to seed conversation context. Copy these three Mongoose model files verbatim from `PotentialBackendLive`.

**Files:**
- Create: `/Users/potdev/Documents/GitHub/LiveKit-agent/src/models/bot.model.ts`
- Create: `/Users/potdev/Documents/GitHub/LiveKit-agent/src/models/botVoiceAgent.model.ts`
- Create: `/Users/potdev/Documents/GitHub/LiveKit-agent/src/models/chatHistory.model.ts`

- [ ] **Step 1: Copy `bot.model.ts` verbatim**

```bash
cp /Users/potdev/Documents/GitHub/PotentialBackendLive/src/models/bot.model.ts \
   /Users/potdev/Documents/GitHub/LiveKit-agent/src/models/bot.model.ts
```

- [ ] **Step 2: Copy `botVoiceAgent.model.ts` verbatim**

```bash
cp /Users/potdev/Documents/GitHub/PotentialBackendLive/src/models/botVoiceAgent.model.ts \
   /Users/potdev/Documents/GitHub/LiveKit-agent/src/models/botVoiceAgent.model.ts
```

- [ ] **Step 3: Copy `chatHistory.model.ts` verbatim**

```bash
cp /Users/potdev/Documents/GitHub/PotentialBackendLive/src/models/chatHistory.model.ts \
   /Users/potdev/Documents/GitHub/LiveKit-agent/src/models/chatHistory.model.ts
```

- [ ] **Step 4: Verify tsc is clean**

```bash
cd /Users/potdev/Documents/GitHub/LiveKit-agent && \
  PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npx tsc --noEmit
```

Expected: exits 0. If any imports in the copied models reference paths that don't exist (e.g. shared utils), open the failing file, find the offending import, and adjust to remove the dependency (these are pure model files — they should not depend on application code). If the import is something like `import logger from "../utils/logger"`, replace with `console`.

- [ ] **Step 5: Commit**

```bash
cd /Users/potdev/Documents/GitHub/LiveKit-agent && \
  git add src/models && \
  git commit -m "Add Bot, BotVoiceAgent, ChatHistory models (verbatim from PotentialBackendLive)"
```

---

## Task 3: `agentServer.ts` — worker entry point

Direct port of `PotentialBackendLive/src/agents/agentServer.ts`. Registers the worker against the LiveKit server with `agentName: "voice-agent"`, points it at `src/voiceAgent.ts`, sets up graceful error handling.

**Files:**
- Create: `/Users/potdev/Documents/GitHub/LiveKit-agent/src/agentServer.ts`

- [ ] **Step 1: Create `agentServer.ts`**

Create `/Users/potdev/Documents/GitHub/LiveKit-agent/src/agentServer.ts`:

```ts
/**
 * LiveKit Agent Server
 *
 * Registers as a worker against the configured LiveKit server with
 * agentName "voice-agent". Explicit dispatch only — the worker stays
 * idle until potentialTS calls AgentDispatchClient.createDispatch().
 *
 * Run:
 *   npm run dev      (auto-reload)
 *   npm run start    (production)
 */

import { ServerOptions, cli, AgentServer } from "@livekit/agents";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

dotenv.config();

function getLiveKitUrl(): string {
  const internal = process.env.LIVEKIT_INTERNAL_URL;
  const external = process.env.LIVEKIT_URL;
  if (internal) return internal;
  if (external) return external;
  throw new Error("LIVEKIT_URL or LIVEKIT_INTERNAL_URL must be set");
}

function validateEnv(): void {
  const required = ["LIVEKIT_API_KEY", "LIVEKIT_API_SECRET", "MONGO_URI", "POTENTIAL_API_BASE"];
  const missing = required.filter((k) => !process.env[k]);
  if (!process.env.LIVEKIT_URL && !process.env.LIVEKIT_INTERNAL_URL) {
    missing.push("LIVEKIT_URL or LIVEKIT_INTERNAL_URL");
  }
  if (missing.length) {
    console.error(`❌ Missing env: ${missing.join(", ")}`);
    process.exit(1);
  }
}

// Framework-tracked job count, no external state.
function createLoadFunction(maxJobs: number) {
  return async (server: AgentServer): Promise<number> => {
    const active = server.activeJobs?.length || 0;
    return Math.min(active / maxJobs, 0.95);
  };
}

async function main(): Promise<void> {
  console.log("🚀 [agentServer] Starting…");
  validateEnv();

  const wsUrl = getLiveKitUrl();
  const maxJobs = parseInt(process.env.MAX_CONCURRENT_JOBS || "10", 10);
  const loadThreshold = parseFloat(process.env.LOAD_THRESHOLD || "0.95");
  const agentPath = fileURLToPath(new URL("./voiceAgent.ts", import.meta.url));

  console.log(`[agentServer] agentName=voice-agent  url=${wsUrl}  maxJobs=${maxJobs}  loadThreshold=${loadThreshold}`);

  process.on("uncaughtException", (err) => console.error("[agentServer] uncaughtException:", err.message));
  process.on("unhandledRejection", (reason) => console.error("[agentServer] unhandledRejection:", reason));

  const options = new ServerOptions({
    agent: agentPath,
    agentName: "voice-agent",
    wsURL: wsUrl,
    loadThreshold,
    loadFunc: createLoadFunction(maxJobs),
  });

  cli.runApp(options);
}

main().catch((err) => {
  console.error("❌ [agentServer] fatal:", err);
  process.exit(1);
});
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/potdev/Documents/GitHub/LiveKit-agent && \
  PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npx tsc --noEmit
```

Expected: exits 0. If `@livekit/agents` types complain about `ServerOptions` constructor signature, double-check against `PotentialBackendLive/src/agents/agentServer.ts` lines 110–117 — the API can vary across `@livekit/agents` minor versions. Match whatever shape the reference uses.

- [ ] **Step 3: Smoke run (fails because `voiceAgent.ts` doesn't exist yet)**

```bash
cd /Users/potdev/Documents/GitHub/LiveKit-agent && \
  PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm run dev
```

Expected: process starts, prints `🚀 [agentServer] Starting…` and `[agentServer] agentName=voice-agent ...`, then errors when it tries to load `./voiceAgent.ts` (which we haven't written). Kill with Ctrl+C. This is enough to confirm `agentServer.ts` itself parses and validates env.

If env is missing locally, the script exits early with `❌ Missing env: ...` — that's the correct behavior. You don't need real LiveKit creds for this smoke; populate `.env` with placeholders just enough to satisfy `validateEnv`.

- [ ] **Step 4: Commit**

```bash
cd /Users/potdev/Documents/GitHub/LiveKit-agent && \
  git add src/agentServer.ts && \
  git commit -m "Add agentServer.ts worker entry (registers voice-agent)"
```

---

## Task 4: `customLLM.ts` — HTTP-delegated LLM

This is the **NEW** piece — replaces the in-process `AgentController.processWithAI` integration that `PotentialBackendLive/src/agents/voiceAgent.ts` uses. Our `CustomLLM` posts to `${POTENTIAL_API_BASE}/agent/chatbot/:botId/voice-llm` and consumes its SSE stream. Tokens flow into LiveKit's `LLMStream` for TTS playback; `toolCall` / `toolResponse` events bubble out via callbacks so `voiceAgent.ts` can `publishData` them to the browser.

**Files:**
- Create: `/Users/potdev/Documents/GitHub/LiveKit-agent/src/customLLM.ts`

- [ ] **Step 1: Create `customLLM.ts`**

Create `/Users/potdev/Documents/GitHub/LiveKit-agent/src/customLLM.ts`:

```ts
/**
 * HTTP-delegated LLM: shells out to potentialTS's voice-llm SSE endpoint
 * per user turn. Keeps this worker repo tiny by reusing the existing
 * AgentController.processWithAI on the server (same code path as typed chat).
 *
 * SSE wire format (one event per `data:` line, blank line terminator):
 *   data: {"content":"Hi"}\n\n
 *   data: {"toolCall":{"name":"...","arguments":{...}}}\n\n
 *   data: {"toolResponse":{"name":"...","content":"..."}}\n\n
 *
 * The stream ends with res.end() — no explicit "done" event. We detect end
 * by the body stream closing.
 */

import { llm } from "@livekit/agents";
import type { APIConnectOptions } from "@livekit/agents";

type LLMStream = llm.LLMStream;
type ChatChunk = llm.ChatChunk;
type ChoiceDelta = llm.ChoiceDelta;
type ToolContext = llm.ToolContext;

// Token details type passed back to voiceAgent.ts via onToolCall / onToolResult
// so it can be relayed to the browser alongside the data message. Optional —
// the endpoint may not always include token counts per chunk.
export type TokenDetails = {
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
};

export type ToolCallEvent = { name: string; arguments: any; callId: string };
export type ToolResultEvent = {
  name: string;
  output: string;
  callId: string;
  isError: boolean;
};

export type CustomLLMOptions = {
  botId: string;
  sessionId: string;
  apiBase: string; // POTENTIAL_API_BASE
  onToolCall?: (call: ToolCallEvent, tokens?: TokenDetails) => Promise<void> | void;
  onToolResult?: (res: ToolResultEvent, tokens?: TokenDetails) => Promise<void> | void;
};

export class CustomLLM extends llm.LLM {
  constructor(private readonly opts: CustomLLMOptions) {
    super();
  }

  label(): string {
    return "PotentialCustomLLM";
  }

  get model(): string {
    // Display string only; potentialTS chooses the actual model.
    return "potential-voice-llm";
  }

  chat({
    chatCtx,
    toolCtx,
    connOptions,
  }: {
    chatCtx: llm.ChatContext;
    toolCtx?: ToolContext;
    connOptions?: APIConnectOptions;
    parallelToolCalls?: boolean;
    toolChoice?: llm.ToolChoice;
    extraKwargs?: Record<string, unknown>;
  }): LLMStream {
    return new CustomLLMStream(this, {
      chatCtx,
      toolCtx,
      connOptions: connOptions || { maxRetry: 3, retryIntervalMs: 1000, timeoutMs: 60000 },
      opts: this.opts,
    });
  }
}

class CustomLLMStream extends llm.LLMStream {
  private readonly opts: CustomLLMOptions;
  private isRunning = false;
  private callCounter = 0;

  constructor(
    parent: CustomLLM,
    args: {
      chatCtx: llm.ChatContext;
      toolCtx?: ToolContext;
      connOptions: APIConnectOptions;
      opts: CustomLLMOptions;
    },
  ) {
    super(parent, { chatCtx: args.chatCtx, toolCtx: args.toolCtx, connOptions: args.connOptions });
    this.opts = args.opts;
  }

  protected async run(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      // Pull the latest user message from chat context.
      const items = this.chatCtx.items;
      const last = items[items.length - 1];
      if (!last || last.type !== "message") {
        throw new Error("CustomLLM: no user message in chat context");
      }
      const message = last as llm.ChatMessage;
      if (message.role !== "user") {
        throw new Error(`CustomLLM: last message role is ${message.role}, expected user`);
      }
      const userMessage = (message.textContent || "").trim();
      if (!userMessage) {
        throw new Error("CustomLLM: empty user message");
      }

      const url = `${this.opts.apiBase.replace(/\/$/, "")}/agent/chatbot/${this.opts.botId}/voice-llm`;
      const body = JSON.stringify({
        sessionId: this.opts.sessionId,
        userMessage,
      });

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        body,
      });

      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => "");
        throw new Error(`voice-llm HTTP ${res.status}: ${text.slice(0, 200)}`);
      }

      await this.consumeSse(res.body);
    } catch (err: any) {
      // Graceful fallback so the call doesn't drop — agent says something
      // and the user can retry.
      const errMsg = err?.message || "Unknown error";
      console.error("[CustomLLM] error:", errMsg);
      const fallback = `Sorry, I hit an error: ${errMsg}. Please try again.`;
      await this.pushToken(fallback);
    } finally {
      this.queue.close();
    }
  }

  /**
   * Parse the SSE stream — for each `data: <json>` line, dispatch to either
   * the token push (for streaming text), a tool-call callback, or a
   * tool-response callback. Other unknown shapes are ignored.
   */
  private async consumeSse(stream: ReadableStream<Uint8Array>): Promise<void> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // Each event ends with a blank line (\n\n).
      let idx = buffer.indexOf("\n\n");
      while (idx !== -1) {
        const event = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        await this.dispatchEventBlock(event);
        idx = buffer.indexOf("\n\n");
      }
    }
    // Flush any tail (rare, but a server that ends without trailing \n\n).
    if (buffer.trim()) {
      await this.dispatchEventBlock(buffer);
    }
  }

  private async dispatchEventBlock(block: string): Promise<void> {
    for (const line of block.split("\n")) {
      const trimmed = line.replace(/^data:\s?/, "").trim();
      if (!trimmed) continue;
      let parsed: any;
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        continue;
      }

      if (typeof parsed.content === "string") {
        await this.pushToken(parsed.content);
      } else if (parsed.toolCall) {
        const callId = `voice-call-${++this.callCounter}`;
        await this.opts.onToolCall?.(
          {
            name: parsed.toolCall.name,
            arguments: parsed.toolCall.arguments,
            callId,
          },
          parsed.toolCall.tokenDetails,
        );
      } else if (parsed.toolResponse) {
        const callId = `voice-result-${this.callCounter}`;
        const output =
          typeof parsed.toolResponse.content === "string"
            ? parsed.toolResponse.content
            : JSON.stringify(parsed.toolResponse.content);
        await this.opts.onToolResult?.(
          {
            name: parsed.toolResponse.name,
            output,
            callId,
            isError: false,
          },
          parsed.toolResponse.tokenDetails,
        );
      }
      // Silently skip unknown event shapes — forward-compat.
    }
  }

  /** Push a streaming text token into the LiveKit LLM output queue. */
  private async pushToken(content: string): Promise<void> {
    const delta: ChoiceDelta = { role: "assistant", content };
    const chunk: ChatChunk = {
      id: `chunk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      delta,
    };
    this.queue.put(chunk);
  }
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/potdev/Documents/GitHub/LiveKit-agent && \
  PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npx tsc --noEmit
```

Expected: exits 0. If `@livekit/agents` type names differ (e.g. `LLMStream` is exported under a different name in your installed version), align with the reference at `PotentialBackendLive/src/agents/voiceAgent.ts` lines 16–38.

- [ ] **Step 3: Write a unit test for the SSE parser**

Create `/Users/potdev/Documents/GitHub/LiveKit-agent/src/customLLM.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";

// We test the SSE-parsing behavior by stubbing fetch and observing the
// callbacks. The LiveKit `llm.LLM` base requires its own runtime — we don't
// instantiate CustomLLM here; instead we exercise the dispatch logic by
// re-creating the parser in the test. (Spec: customLLM.test.ts treats SSE
// parsing as a pure function; integration with the LiveKit pipeline is
// covered by the dispatched-worker smoke test in Task 6.)

import type { ToolCallEvent, ToolResultEvent } from "./customLLM";

// Minimal re-implementation of the dispatch logic so we can test it in
// isolation. If customLLM.ts changes its parser, update this in lock-step.
async function dispatch(
  blocks: string[],
  onToken: (s: string) => void,
  onToolCall: (e: ToolCallEvent) => void,
  onToolResult: (e: ToolResultEvent) => void,
): Promise<void> {
  let callCounter = 0;
  for (const block of blocks) {
    for (const line of block.split("\n")) {
      const trimmed = line.replace(/^data:\s?/, "").trim();
      if (!trimmed) continue;
      let parsed: any;
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        continue;
      }
      if (typeof parsed.content === "string") onToken(parsed.content);
      else if (parsed.toolCall) {
        const callId = `voice-call-${++callCounter}`;
        onToolCall({
          name: parsed.toolCall.name,
          arguments: parsed.toolCall.arguments,
          callId,
        });
      } else if (parsed.toolResponse) {
        const callId = `voice-result-${callCounter}`;
        const output =
          typeof parsed.toolResponse.content === "string"
            ? parsed.toolResponse.content
            : JSON.stringify(parsed.toolResponse.content);
        onToolResult({
          name: parsed.toolResponse.name,
          output,
          callId,
          isError: false,
        });
      }
    }
  }
}

describe("customLLM SSE parser", () => {
  it("emits one token per content event", async () => {
    const tokens: string[] = [];
    await dispatch(
      [
        `data: ${JSON.stringify({ content: "Hi " })}`,
        `data: ${JSON.stringify({ content: "there!" })}`,
      ],
      (t) => tokens.push(t),
      vi.fn(),
      vi.fn(),
    );
    expect(tokens).toEqual(["Hi ", "there!"]);
  });

  it("pairs tool call and response with a deterministic callId", async () => {
    const calls: ToolCallEvent[] = [];
    const results: ToolResultEvent[] = [];
    await dispatch(
      [
        `data: ${JSON.stringify({
          toolCall: { name: "search_shopify_products", arguments: { q: "lipstick" } },
        })}`,
        `data: ${JSON.stringify({
          toolResponse: { name: "search_shopify_products", content: { count: 3 } },
        })}`,
      ],
      vi.fn(),
      (c) => calls.push(c),
      (r) => results.push(r),
    );
    expect(calls).toHaveLength(1);
    expect(results).toHaveLength(1);
    expect(calls[0].callId).toBe("voice-call-1");
    expect(results[0].callId).toBe("voice-result-1");
    expect(results[0].output).toBe(JSON.stringify({ count: 3 }));
  });

  it("ignores malformed JSON without throwing", async () => {
    const tokens: string[] = [];
    await dispatch(
      [
        `data: not-json`,
        `data: ${JSON.stringify({ content: "kept" })}`,
      ],
      (t) => tokens.push(t),
      vi.fn(),
      vi.fn(),
    );
    expect(tokens).toEqual(["kept"]);
  });
});
```

- [ ] **Step 4: Run the tests**

```bash
cd /Users/potdev/Documents/GitHub/LiveKit-agent && \
  PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test
```

Expected: 3 tests pass. If the test file fails to find `vitest`, ensure step 1 of Task 1 ran `npm install` and that `vitest` is in `devDependencies`.

- [ ] **Step 5: Commit**

```bash
cd /Users/potdev/Documents/GitHub/LiveKit-agent && \
  git add src/customLLM.ts src/customLLM.test.ts && \
  git commit -m "Add CustomLLM (SSE consumer that delegates to potentialTS /voice-llm)"
```

---

## Task 5: `chatHistory.ts` — load conversation context

The worker needs to seed the LiveKit `voice.ChatContext` with prior turns so the bot remembers what happened in earlier exchanges (typed or voice — same session id). This is a small file that reads `ChatHistory` from Mongo and converts to LiveKit chat items.

**Files:**
- Create: `/Users/potdev/Documents/GitHub/LiveKit-agent/src/chatHistory.ts`

- [ ] **Step 1: Inspect the reference**

Open `/Users/potdev/Documents/GitHub/PotentialBackendLive/src/agents/voiceAgent.ts` and search for `loadChatHistory`. Read the function (~30 lines). Replicate its shape in our stripper. The function takes `(sessionId, botId)` and returns a `voice.ChatContext`. It reads the latest N `ChatHistory` document(s) for that sessionId, iterates message pairs, and uses `chatCtx.add({...})` to seed.

- [ ] **Step 2: Create `chatHistory.ts`**

Create `/Users/potdev/Documents/GitHub/LiveKit-agent/src/chatHistory.ts`:

```ts
/**
 * Seeds a voice.ChatContext with prior turns from the ChatHistory
 * collection. Voice + typed chat share the same sessionId, so this gives
 * the bot full continuity across modalities.
 */

import { voice } from "@livekit/agents";
import ChatHistory from "./models/chatHistory.model.ts";

const MAX_HISTORY_TURNS = 20;

export async function loadChatHistory(
  sessionId: string,
  botId: string,
): Promise<voice.ChatContext> {
  const chatCtx = new voice.ChatContext();

  try {
    // Use lean() — we only need the plain object shape.
    const records = await ChatHistory.find({ sessionId, botId })
      .sort({ createdAt: -1 })
      .limit(MAX_HISTORY_TURNS * 2)
      .lean();

    // Sort chronologically (we fetched DESC, flip back).
    records.reverse();

    for (const record of records) {
      // Adjust field names if the model uses different keys. Reference:
      // PotentialBackendLive/src/agents/voiceAgent.ts loadChatHistory().
      const userMsg = (record as any).message || (record as any).userMessage;
      const aiMsg = (record as any).response || (record as any).aiResponse;
      if (typeof userMsg === "string" && userMsg.trim()) {
        chatCtx.addMessage({ role: "user", content: userMsg });
      }
      if (typeof aiMsg === "string" && aiMsg.trim()) {
        chatCtx.addMessage({ role: "assistant", content: aiMsg });
      }
    }

    console.log(`[chatHistory] seeded ${records.length} prior records for session ${sessionId}`);
  } catch (err) {
    console.error("[chatHistory] failed to load — continuing with empty context:", err);
  }

  return chatCtx;
}
```

- [ ] **Step 3: Reconcile field names**

If `tsc --noEmit` complains about `addMessage` not existing on `voice.ChatContext`, check the `@livekit/agents` version. Some versions use `chatCtx.append()` or `chatCtx.add({...})` instead. Mirror the call the reference at `PotentialBackendLive/src/agents/voiceAgent.ts` uses inside its `loadChatHistory()`.

Also reconcile the `ChatHistory` field names with what the model actually exports. Open `src/models/chatHistory.model.ts` and verify whether the field is `message`/`response`, `userMessage`/`aiResponse`, or something else. Update the assignments in `chatHistory.ts` to match.

- [ ] **Step 4: Type-check**

```bash
cd /Users/potdev/Documents/GitHub/LiveKit-agent && \
  PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npx tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 5: Commit**

```bash
cd /Users/potdev/Documents/GitHub/LiveKit-agent && \
  git add src/chatHistory.ts && \
  git commit -m "Add chatHistory loader (seeds voice.ChatContext from Mongo)"
```

---

## Task 6: `voiceAgent.ts` — per-session orchestration

The main worker handler. `defineAgent({ entry })` registers the per-session lifecycle:

1. Connect to room
2. Connect to Mongo
3. Parse `botId`/`sessionId` from job metadata
4. Fetch `Bot` + `BotVoiceAgent`
5. Initialize VAD (Silero) + STT (Deepgram) + TTS (ElevenLabs) plugins
6. Load chat history into `voice.ChatContext`
7. Construct `CustomLLM` (from Task 4) with `publishToChat` callbacks
8. Build voice prompt + `voice.Agent` + `voice.AgentSession`
9. Speak greeting on join (`session.say(bot.greeting)`)
10. Wire up session events → `publishData` to the browser
11. Register shutdown callback that decrements `BotVoiceAgent.callTimeLeftSeconds`

This is the biggest file. Most of it is a port of `PotentialBackendLive/src/agents/voiceAgent.ts` lines 522–820. The only **substantial** change: replace the in-process `CustomLLM` definition (lines 60–490) with an `import { CustomLLM } from "./customLLM"` and wire it with the existing callback shapes.

**Files:**
- Create: `/Users/potdev/Documents/GitHub/LiveKit-agent/src/voiceAgent.ts`

- [ ] **Step 1: Inspect the reference end-to-end**

Read `/Users/potdev/Documents/GitHub/PotentialBackendLive/src/agents/voiceAgent.ts` lines 510–820. Specifically:
- `prewarm` callback (loads Silero VAD into `ctx.proc.userData.vad`)
- `entry: async (ctx) =>` — the main per-session body
- `createSTT` and `createTTS` helpers
- `parseRoomName` helper
- All `publishToChat` callsites (transcript, ai_response, tool_call, tool_result, agent_speaking)
- Session event handlers (ConversationItemAdded, UserInputTranscribed, AgentStateChanged, Error, Close)
- Shutdown callback that updates BotVoiceAgent

- [ ] **Step 2: Create `voiceAgent.ts`**

Create `/Users/potdev/Documents/GitHub/LiveKit-agent/src/voiceAgent.ts`. Start by copying the entire reference file verbatim, then apply these **two diffs**:

**Diff A — drop the inline `CustomLLM` + `CustomLLMStream` class definitions:**
- Delete lines 60–490 of the reference (`class CustomLLM extends llm.LLM { ... }` and `class CustomLLMStream extends llm.LLMStream { ... }`)
- Delete the `getAgentController()` dynamic-import helper (lines ~44–54)
- Delete the `AgentControllerModule` variable
- Delete the `Bot` model import if it's only used by the deleted classes (keep it for the `bot` fetch in `entry`)
- Replace with: `import { CustomLLM, type TokenDetails } from "./customLLM";`
- Replace the `loadChatHistory(...)` import / inline definition with: `import { loadChatHistory } from "./chatHistory";`

**Diff B — construct `CustomLLM` with our HTTP-delegated options:**

Find where the reference instantiates `CustomLLM`:

```ts
const customLLM = new CustomLLM(
  botId,
  sessionId,
  async (toolCall, tokenDetails) => publishToChat("tool_call", { ...toolCall, tokenDetails }),
  async (toolResult, tokenDetails) => publishToChat("tool_result", { ...toolResult, tokenDetails }),
  (tokenDetails) => { latestTokenDetails = tokenDetails; },
);
```

Replace with:

```ts
const customLLM = new CustomLLM({
  botId,
  sessionId,
  apiBase: process.env.POTENTIAL_API_BASE!,
  onToolCall: async (toolCall, tokenDetails) =>
    publishToChat("tool_call", { ...toolCall, tokenDetails }),
  onToolResult: async (toolResult, tokenDetails) =>
    publishToChat("tool_result", { ...toolResult, tokenDetails }),
});
```

(The token-details-tracking lambda goes away — our stripper doesn't surface token counts mid-stream; if you want them, the SSE payload from `voice-llm` can include them and you can add a callback later. YAGNI.)

The rest of the file — `defineAgent`, `prewarm`, `entry`, session event wiring, greeting, shutdown — copies verbatim.

- [ ] **Step 3: Replace any remaining cross-imports**

Verify the file's import statements only reference:
- `@livekit/agents` and its plugins
- `./customLLM`
- `./chatHistory`
- `./models/bot.model.ts`
- `./models/botVoiceAgent.model.ts`
- Node builtins / `mongoose` / `dotenv`

If the reference imported anything else (e.g. `../controllers/agent.controller.js`), remove it — those code paths went away with Diff A.

- [ ] **Step 4: Type-check**

```bash
cd /Users/potdev/Documents/GitHub/LiveKit-agent && \
  PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npx tsc --noEmit
```

Expected: exits 0. Typical issues if not:
- Missing `mongoose` import — add `import mongoose from "mongoose";`
- `voice.Agent` API mismatch — check installed `@livekit/agents` version and align field names with the reference.
- `ctx.proc.userData.vad` typed as `unknown` — cast: `as silero.VAD | null`.

- [ ] **Step 5: Smoke run**

```bash
cd /Users/potdev/Documents/GitHub/LiveKit-agent && \
  PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm run dev
```

Expected: process starts and prints registration logs (`agentName=voice-agent ...`). It will block waiting for jobs. Kill with Ctrl+C.

**If your `.env` does not have real LiveKit creds**, the worker fails to register against the LiveKit server (connection refused / unauthorized). That's OK for now — type-check + boot is the goal of this task. Real dispatch testing happens in Task 15.

- [ ] **Step 6: Commit**

```bash
cd /Users/potdev/Documents/GitHub/LiveKit-agent && \
  git add src/voiceAgent.ts && \
  git commit -m "Add voiceAgent.ts (session orchestration, HTTP-delegated LLM)"
```

---

## Task 7: `LIVEKIT_AGENT_ENABLED` env in `potentialTS`

Add the env var to `potentialTS`'s validation list so we have a documented, type-checked toggle. Worker dispatch in Task 8 reads this flag.

**Files:**
- Modify: `/Users/potdev/Documents/GitHub/potentialTS/src/config/env.ts`

- [ ] **Step 1: Read the existing env file**

Open `/Users/potdev/Documents/GitHub/potentialTS/src/config/env.ts`. Find the `REQUIRED_VARS` array (the reference file at PotentialBackendLive has the same shape — see `PotentialBackendLive/src/config/env.ts` line ~28). It's a `const` tuple of strings.

- [ ] **Step 2: Add `LIVEKIT_AGENT_ENABLED` to the list**

Open the file in your editor. Find the line:

```ts
"LIVEKIT_API_SECRET",
```

After it, add:

```ts
"LIVEKIT_AGENT_ENABLED",
```

- [ ] **Step 3: Type-check + run existing tests**

```bash
cd /Users/potdev/Documents/GitHub/potentialTS && \
  PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npx tsc --noEmit
```

Expected: exits 0. No test suite changes — this is purely a validation-list addition.

If potentialTS has tests:
```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test
```
Expected: all pass. If there's no test infra, skip.

- [ ] **Step 4: Commit**

```bash
cd /Users/potdev/Documents/GitHub/potentialTS && \
  git checkout -b feature/livekit-native-dispatch 2>/dev/null || git checkout feature/livekit-native-dispatch && \
  git add src/config/env.ts && \
  git commit -m "env: require LIVEKIT_AGENT_ENABLED"
```

---

## Task 8: Explicit agent dispatch in `routes/livekit.ts`

Update `potentialTS`'s `POST /api/livekit/room/create` to: (1) when `cfg?.type === "livekit"` AND `LIVEKIT_AGENT_ENABLED === "true"`, create the room and dispatch the `voice-agent` worker; (2) include `useNativeAgent` in the response.

This is a port of `PotentialBackendLive/src/routes/livekit.ts` lines 100–143. The trial-gating logic stays unchanged.

**Files:**
- Modify: `/Users/potdev/Documents/GitHub/potentialTS/src/routes/livekit.ts`

- [ ] **Step 1: Read the existing handler**

Open `/Users/potdev/Documents/GitHub/potentialTS/src/routes/livekit.ts` lines 12–96. Note the current shape: it validates bot + user + trial, generates a `roomName` and `participantName`, calls `LiveKitAgentController.generateToken`, and responds with `{success, roomName, token, wsUrl, participantName}`.

- [ ] **Step 2: Add `AgentDispatchClient` import**

At the top of `src/routes/livekit.ts`, find:

```ts
import { LiveKitAgentController } from "../controllers/livekitAgent.controller.js";
```

Just above or below it (matching the existing import style), add:

```ts
import { RoomServiceClient, AgentDispatchClient } from "livekit-server-sdk";
```

Verify `livekit-server-sdk` is already a dependency (it is — `RoomServiceClient` is used by `livekitAgent.controller.ts`). If a logger utility exists (`import logger from "../utils/logger.ts"` or similar), reuse it; otherwise use `console.log` / `console.error` consistently with the rest of the file.

- [ ] **Step 3: Add a `getLiveKitApiUrl()` helper near the top of the file**

After the imports and any existing helpers, add:

```ts
/**
 * URL used for server-to-server LiveKit RPC (RoomServiceClient,
 * AgentDispatchClient). Distinct from LIVEKIT_WS_URL which the browser uses.
 */
function getLiveKitApiUrl(): string {
  return (
    process.env.LIVEKIT_API_URL ||
    process.env.LIVEKIT_INTERNAL_URL ||
    process.env.LIVEKIT_URL ||
    ""
  );
}
```

(If the file already has a similar helper, reuse instead of duplicating.)

- [ ] **Step 4: Insert dispatch logic before the `LiveKitAgentController.generateToken(...)` call**

Find the section in the `/room/create` handler that looks like:

```ts
const roomName = `bot-${botId}-session-${sessionId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
const participantName = `user-${Date.now()}`;

const token = await LiveKitAgentController.generateToken(roomName, participantName);
```

(The reference is at lines ~73–80 of the existing file.) Replace it with:

```ts
const roomName = `bot-${botId}-session-${sessionId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
const participantName = `user-${Date.now()}`;

const apiUrl = getLiveKitApiUrl();
const apiKey = process.env.LIVEKIT_API_KEY || "";
const apiSecret = process.env.LIVEKIT_API_SECRET || "";

// Gate the native-agent dispatch on the per-bot voice provider type AND
// the global LIVEKIT_AGENT_ENABLED flag. When this is off, the legacy
// custom-WS handler at /ws/livekit/... still serves the call (kept for
// SIP/Twilio paths until those are migrated separately).
const useNativeAgent =
  cfg?.type === "livekit" &&
  process.env.LIVEKIT_AGENT_ENABLED === "true";

if (useNativeAgent && apiUrl && apiKey && apiSecret) {
  // 1. Pre-create the room so the agent worker has somewhere to join.
  //    LiveKit auto-creates rooms on first participant, but pre-creating
  //    gives us a deterministic moment to fail fast on bad creds.
  try {
    const roomService = new RoomServiceClient(apiUrl, apiKey, apiSecret);
    await roomService.createRoom({ name: roomName });
  } catch (roomError: any) {
    if (!String(roomError?.message ?? "").includes("already exists")) {
      console.warn("[livekit] room creation warning:", roomError?.message);
    }
  }

  // 2. Explicit dispatch — sends the job (with metadata) to the registered
  //    "voice-agent" worker. The worker's voiceAgent.ts entry() reads
  //    botId/sessionId out of ctx.job.metadata.
  try {
    const dispatchClient = new AgentDispatchClient(apiUrl, apiKey, apiSecret);
    const dispatch = await dispatchClient.createDispatch(roomName, "voice-agent", {
      metadata: JSON.stringify({ botId, sessionId }),
    });
    console.log(`[dispatch] dispatched voice-agent: ${dispatch.id}`);
  } catch (dispatchError: any) {
    console.error("[dispatch] failed:", dispatchError?.message);
    // Continue to issue the user token — the call still has a chance to
    // recover if the worker joins via room-name parsing.
  }
}

const token = await LiveKitAgentController.generateToken(roomName, participantName);
```

- [ ] **Step 5: Add `useNativeAgent` to the response**

Find the existing `res.json({ ... })` block at the end of the handler — it currently returns:

```ts
res.json({
  success: true,
  roomName,
  participantName,
  token,
  wsUrl,
});
```

Replace with:

```ts
res.json({
  success: true,
  roomName,
  participantName,
  token,
  wsUrl,
  useNativeAgent,
});
```

- [ ] **Step 6: Type-check**

```bash
cd /Users/potdev/Documents/GitHub/potentialTS && \
  PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npx tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 7: Manual smoke (against local potentialTS dev server if you can run one)**

If a local potentialTS dev server runs (with `.env` populated):

```bash
curl -s -X POST http://localhost:<port>/api/livekit/room/create \
  -H 'Content-Type: application/json' \
  -d '{"botId":"6a056e4ece71ae96a167f826","sessionId":"smoke-dispatch"}'
```

Expected (when `LIVEKIT_AGENT_ENABLED=true` in env):
```json
{"success":true,"roomName":"bot-...","token":"...","wsUrl":"ws://...","useNativeAgent":true}
```

Server logs should show:
```
[dispatch] dispatched voice-agent: <jobId>
```

When `LIVEKIT_AGENT_ENABLED` is unset / falsey, `useNativeAgent:false` and no dispatch happens.

If you can't run potentialTS locally, skip the smoke — Task 15 covers production validation.

- [ ] **Step 8: Commit**

```bash
cd /Users/potdev/Documents/GitHub/potentialTS && \
  git add src/routes/livekit.ts && \
  git commit -m "routes/livekit: explicit voice-agent dispatch when LIVEKIT_AGENT_ENABLED"
```

---

## Task 9: `POST /agent/chatbot/:botId/voice-llm` SSE endpoint

The worker's `CustomLLM` (Task 4) calls this endpoint per user turn. Wire format mirrors the existing `POST /agent/chatbot/:id/chat` exactly so we can lift the implementation.

**Files:**
- Modify: `/Users/potdev/Documents/GitHub/potentialTS/src/controllers/agent.controller.ts`
- Modify: `/Users/potdev/Documents/GitHub/potentialTS/src/routes/agent.ts`

- [ ] **Step 1: Inspect the existing chat handler**

Open `/Users/potdev/Documents/GitHub/potentialTS/src/controllers/agent.controller.ts`. Find `static async chatWithBotById(req, res)` (around line 818). Read its body — note how it:
- Reads `req.body.message` and `req.body.sessionId`
- Builds `messageHistory`
- Calls `agent.stream(...)`
- Writes SSE events (`{content}`, `{toolCall}`, `{toolResponse}`)
- Ends with `res.end()`

The voice endpoint differs from `chatWithBotById` only in: (a) request body keys (`userMessage` instead of `message`), (b) it never reads cookies / sessions, (c) it's called server-to-server so no auth middleware. The streaming + tool-call SSE shape is identical.

- [ ] **Step 2: Add the new handler `chatVoiceLlm`**

In `src/controllers/agent.controller.ts`, immediately AFTER the `chatWithBotById` method (find its closing `}` near line ~580 — read carefully, this method is long), add:

```ts
  /**
   * Voice-LLM SSE endpoint. Called by the LiveKit-agent worker per user
   * turn. Same wire format as chatWithBotById; differs only in request
   * shape (server-to-server: takes `userMessage` instead of `message`).
   *
   * Body: { sessionId: string, userMessage: string, trainingContext?: object }
   * Streams: text/event-stream with `data: <json>\n\n` blocks:
   *   data: {"content":"..."}\n\n
   *   data: {"toolCall":{"name":"...","arguments":{...}}}\n\n
   *   data: {"toolResponse":{"name":"...","content":...}}\n\n
   */
  static async chatVoiceLlm(req: Request, res: Response): Promise<void> {
    try {
      const botId = req.params.id;
      const { sessionId, userMessage, trainingContext } = req.body || {};

      if (!botId || typeof sessionId !== "string" || typeof userMessage !== "string") {
        res.status(400).json({ error: "botId, sessionId, userMessage required" });
        return;
      }

      // Reuse the same generator the typed chat uses, by calling chatWithBotById
      // with a faked request shape. The original method reads from req.params.id
      // and req.body.{message, sessionId}, so we adapt and delegate.
      const adaptedReq = Object.assign({}, req, {
        params: { ...req.params, id: botId },
        body: {
          message: userMessage,
          sessionId,
          ...(trainingContext ? { trainingContext } : {}),
        },
      }) as unknown as Request;

      await AgentController.chatWithBotById(adaptedReq, res);
    } catch (err: any) {
      console.error("[chatVoiceLlm] error:", err?.message || err);
      if (!res.headersSent) {
        res.status(500).json({ error: "voice-llm failed" });
      }
    }
  }
```

**Why this shape:** `chatWithBotById` is large and battle-tested. Forking it for voice would double the maintenance surface. By adapting the request and delegating, voice + typed chat use the exact same generator, the exact same `messageHistory` writes, the exact same tool calling. If the typed chat ever changes its SSE event shape, voice picks up the change for free.

If `chatWithBotById` checks `req.session` or auth middleware in a way that breaks when called server-to-server, you'll need to factor the streaming body out into a private helper that both methods call. Inspect first; refactor only if needed.

- [ ] **Step 3: Register the route**

Open `/Users/potdev/Documents/GitHub/potentialTS/src/routes/agent.ts`. Find:

```ts
router.post("/chatbot/:id/speak", AgentController.chatWithBotSpeak);
```

Immediately after, add:

```ts
router.post("/chatbot/:id/voice-llm", AgentController.chatVoiceLlm);
```

- [ ] **Step 4: Type-check**

```bash
cd /Users/potdev/Documents/GitHub/potentialTS && \
  PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npx tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 5: Smoke test against a local potentialTS server (if available)**

```bash
curl -N -X POST http://localhost:<port>/agent/chatbot/6a056e4ece71ae96a167f826/voice-llm \
  -H 'Content-Type: application/json' \
  -d '{"sessionId":"smoke","userMessage":"Hello"}'
```

Expected: a stream of `data: {...}\n\n` lines, content matching whatever Ruby would normally say. The connection stays open until the agent finishes responding, then closes.

If you don't have a local potentialTS server, defer to Task 15 (deploy + production smoke).

- [ ] **Step 6: Commit**

```bash
cd /Users/potdev/Documents/GitHub/potentialTS && \
  git add src/controllers/agent.controller.ts src/routes/agent.ts && \
  git commit -m "Add /agent/chatbot/:id/voice-llm SSE endpoint for voice worker"
```

---

## Task 10: Set up `livekit-client` + `FakeRoom` mock in `potentialcom-Replit`

Add the browser SDK dep and a shared `FakeRoom` test helper that subsequent tests can import. This avoids duplicating ~50 lines of mock setup across multiple test files.

**Working directory for all remaining tasks:**
`/Users/potdev/Documents/GitHub/potentialcom-Replit/.claude/worktrees/ruby-livekit-native-voice` (create via the `using-git-worktrees` skill before starting Task 10).

**Files:**
- Modify: `package.json`
- Create: `client/src/test/livekitFakeRoom.ts` (new shared test helper)

- [ ] **Step 1: Create the worktree from main**

```bash
cd /Users/potdev/Documents/GitHub/potentialcom-Replit && \
  git worktree add .claude/worktrees/ruby-livekit-native-voice \
    -b claude/ruby-livekit-native-voice main
```

Then add `.claude/worktrees/ruby-livekit-native-voice/` to `.gitignore` and commit (pattern matches Plans 1, 2, 2a, 2b):

```bash
echo ".claude/worktrees/ruby-livekit-native-voice/" >> .gitignore && \
  git add .gitignore && \
  git commit -m "Gitignore Plan 2c (LiveKit-native voice) worktree path"
```

- [ ] **Step 2: Install `livekit-client`**

```bash
cd /Users/potdev/Documents/GitHub/potentialcom-Replit/.claude/worktrees/ruby-livekit-native-voice && \
  PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm install livekit-client@^2.15.10
```

Expected: `npm install` succeeds. `package.json` gains:
```json
"livekit-client": "^2.15.10"
```

- [ ] **Step 3: Create the `FakeRoom` test helper**

Create `/Users/potdev/Documents/GitHub/potentialcom-Replit/.claude/worktrees/ruby-livekit-native-voice/client/src/test/livekitFakeRoom.ts`:

```ts
import { vi } from "vitest";

/**
 * Test double for `livekit-client`'s `Room`. Exposes only the surface the
 * hook actually uses: connect, disconnect, on(event, cb), and
 * localParticipant.{enableMicrophone, setMicrophoneEnabled}. Tests trigger
 * events via the helper methods (`triggerDataReceived`, `triggerTrackSubscribed`,
 * `triggerDisconnected`).
 *
 * Usage in a test:
 *
 *   import { installFakeRoom, getLastFakeRoom } from "./test/livekitFakeRoom";
 *
 *   beforeEach(() => { installFakeRoom(); });
 *   // ... render the hook, click start ...
 *   const room = getLastFakeRoom();
 *   room.triggerDataReceived({ type: "transcript", text: "hi" });
 */

type Listener = (...args: any[]) => void;

export class FakeRoom {
  static instances: FakeRoom[] = [];

  private listeners: Record<string, Listener[]> = {};

  // Public mocks (vitest stubs the hook can spy on).
  connect = vi.fn().mockResolvedValue(undefined);
  disconnect = vi.fn().mockResolvedValue(undefined);

  localParticipant = {
    enableMicrophone: vi.fn().mockResolvedValue(undefined),
    setMicrophoneEnabled: vi.fn().mockResolvedValue(undefined),
  };

  // The hook spies on this URL to assert the connect target.
  lastConnectArgs: { url?: string; token?: string } = {};

  constructor() {
    FakeRoom.instances.push(this);
    // Capture connect arguments for assertions.
    const origConnect = this.connect.bind(this);
    this.connect = vi.fn(async (url: string, token: string) => {
      this.lastConnectArgs = { url, token };
      return origConnect();
    });
  }

  on(event: string, cb: Listener): this {
    (this.listeners[event] ||= []).push(cb);
    return this;
  }

  off(event: string, cb: Listener): this {
    this.listeners[event] = (this.listeners[event] || []).filter((l) => l !== cb);
    return this;
  }

  // ---- helpers tests use to fire events ------------------------------

  triggerDataReceived(payload: object): void {
    const bytes = new TextEncoder().encode(JSON.stringify(payload));
    for (const l of this.listeners["dataReceived"] || []) l(bytes);
  }

  triggerTrackSubscribed(kind: "audio" | "video" = "audio"): void {
    const track = {
      kind,
      attach: vi.fn(),
      detach: vi.fn(),
    };
    for (const l of this.listeners["trackSubscribed"] || []) l(track);
  }

  triggerDisconnected(): void {
    for (const l of this.listeners["disconnected"] || []) l();
  }
}

/**
 * Install FakeRoom in place of livekit-client's Room. Call inside beforeEach
 * so each test gets a fresh instances list.
 */
export function installFakeRoom(): void {
  FakeRoom.instances = [];
  vi.doMock("livekit-client", async () => {
    const actual = await vi.importActual<any>("livekit-client");
    return {
      ...actual,
      Room: FakeRoom,
      // Re-export the enums the hook references. The hook uses string
      // values directly (RoomEvent.DataReceived → "dataReceived"), so the
      // real enums work in tests too — no replacement needed.
    };
  });
}

export function getLastFakeRoom(): FakeRoom {
  const last = FakeRoom.instances[FakeRoom.instances.length - 1];
  if (!last) throw new Error("No FakeRoom instances yet — did you call installFakeRoom() and trigger a connect?");
  return last;
}
```

- [ ] **Step 4: Type-check**

```bash
cd /Users/potdev/Documents/GitHub/potentialcom-Replit/.claude/worktrees/ruby-livekit-native-voice && \
  PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm run check
```

Expected: tsc exits 0.

- [ ] **Step 5: Verify baseline (Plan 2b tests still pass before we modify anything)**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test 2>&1 | tail -5
```

Expected: 298 tests pass (the count after Plan 2b's last commit + the cumulative fixes from the debugging session). If you see a different count, it just means more tests landed between when this plan was written and now — record the new baseline.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json client/src/test/livekitFakeRoom.ts && \
  git commit -m "Add livekit-client dep + FakeRoom test helper"
```

---

## Task 11: TDD — rewrite `useLiveKitVoice` tests against `FakeRoom`

Write the failing tests first. Each test exercises the new `livekit-client`-based hook through the FakeRoom mock. Same 10 cases as Plan 2b (which we keep) plus the config-on-open test gets retired (no config message in native mode).

**Files:**
- Modify: `client/src/components/agent/voice/useLiveKitVoice.test.ts`

- [ ] **Step 1: Replace the entire test file**

Replace the contents of `/Users/potdev/Documents/GitHub/potentialcom-Replit/.claude/worktrees/ruby-livekit-native-voice/client/src/components/agent/voice/useLiveKitVoice.test.ts` with:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

// IMPORTANT: install the FakeRoom BEFORE importing useLiveKitVoice so the
// hook picks up the mocked Room from livekit-client.
import { installFakeRoom, getLastFakeRoom, FakeRoom } from "../../../test/livekitFakeRoom";
installFakeRoom();

import { useLiveKitVoice } from "./useLiveKitVoice";

function mockFetchRoom(extra: Record<string, unknown> = {}) {
  return vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        success: true,
        roomName: "room-1",
        token: "tok",
        wsUrl: "wss://livekit.test",
        participantName: "user-1",
        useNativeAgent: true,
        ...extra,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    ),
  );
}

beforeEach(() => {
  FakeRoom.instances = [];
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("useLiveKitVoice (LiveKit-native)", () => {
  it("starts in idle state", () => {
    const push = vi.fn();
    const { result } = renderHook(() => useLiveKitVoice("ruby", push));
    expect(result.current.state).toBe("idle");
    expect(result.current.isMuted).toBe(false);
  });

  it("fetches the room, connects via livekit-client, and transitions to listening", async () => {
    vi.stubGlobal("fetch", mockFetchRoom());
    const push = vi.fn();
    const { result } = renderHook(() => useLiveKitVoice("ruby", push));
    await act(async () => {
      await result.current.start();
    });

    const room = getLastFakeRoom();
    expect(room.connect).toHaveBeenCalledOnce();
    expect(room.lastConnectArgs.url).toBe("wss://livekit.test");
    expect(room.lastConnectArgs.token).toBe("tok");
    expect(room.localParticipant.enableMicrophone).toHaveBeenCalledOnce();
    await waitFor(() => expect(result.current.state).toBe("listening"));
  });

  it("pushes user-transcript on incoming transcript data message", async () => {
    vi.stubGlobal("fetch", mockFetchRoom());
    const push = vi.fn();
    const { result } = renderHook(() => useLiveKitVoice("ruby", push));
    await act(async () => {
      await result.current.start();
    });
    act(() => {
      getLastFakeRoom().triggerDataReceived({ type: "transcript", text: "find me a lipstick" });
    });
    expect(push).toHaveBeenCalledWith({ kind: "user-transcript", text: "find me a lipstick" });
  });

  it("pushes agent-response on ai_response data message", async () => {
    vi.stubGlobal("fetch", mockFetchRoom());
    const push = vi.fn();
    const { result } = renderHook(() => useLiveKitVoice("ruby", push));
    await act(async () => {
      await result.current.start();
    });
    act(() => {
      getLastFakeRoom().triggerDataReceived({
        type: "ai_response",
        text: "Here are some lipsticks.",
      });
    });
    expect(push).toHaveBeenCalledWith({
      kind: "agent-response",
      text: "Here are some lipsticks.",
    });
  });

  it("pushes tool-call and tool-result, threading by callId", async () => {
    vi.stubGlobal("fetch", mockFetchRoom());
    const push = vi.fn();
    const { result } = renderHook(() => useLiveKitVoice("ruby", push));
    await act(async () => {
      await result.current.start();
    });
    act(() => {
      const room = getLastFakeRoom();
      room.triggerDataReceived({
        type: "tool_call",
        name: "search_shopify_products",
        arguments: { query: "lipstick" },
        callId: "call-42",
      });
      room.triggerDataReceived({
        type: "tool_result",
        name: "search_shopify_products",
        output: JSON.stringify({ count: 3 }),
        callId: "call-42",
        isError: false,
      });
    });
    const calls = push.mock.calls.map((c) => c[0]);
    const call = calls.find((c: any) => c.kind === "tool-call");
    const res = calls.find((c: any) => c.kind === "tool-result");
    expect(call).toMatchObject({
      kind: "tool-call",
      id: "call-42",
      name: "search_shopify_products",
    });
    expect(res).toMatchObject({
      kind: "tool-result",
      id: "call-42",
      result: { count: 3 },
    });
  });

  it("toggles state to agent-speaking on agent_speaking events", async () => {
    vi.stubGlobal("fetch", mockFetchRoom());
    const push = vi.fn();
    const { result } = renderHook(() => useLiveKitVoice("ruby", push));
    await act(async () => {
      await result.current.start();
    });
    act(() => {
      getLastFakeRoom().triggerDataReceived({ type: "agent_speaking", speaking: true });
    });
    expect(result.current.state).toBe("agent-speaking");
    act(() => {
      getLastFakeRoom().triggerDataReceived({ type: "agent_speaking", speaking: false });
    });
    expect(result.current.state).toBe("listening");
  });

  it("toggleMute flips isMuted and calls setMicrophoneEnabled with the opposite", async () => {
    vi.stubGlobal("fetch", mockFetchRoom());
    const push = vi.fn();
    const { result } = renderHook(() => useLiveKitVoice("ruby", push));
    await act(async () => {
      await result.current.start();
    });
    const room = getLastFakeRoom();
    expect(result.current.isMuted).toBe(false);

    act(() => {
      result.current.toggleMute();
    });
    expect(result.current.isMuted).toBe(true);
    expect(room.localParticipant.setMicrophoneEnabled).toHaveBeenLastCalledWith(false);

    act(() => {
      result.current.toggleMute();
    });
    expect(result.current.isMuted).toBe(false);
    expect(room.localParticipant.setMicrophoneEnabled).toHaveBeenLastCalledWith(true);
  });

  it("hangup disconnects the Room and returns to idle", async () => {
    vi.stubGlobal("fetch", mockFetchRoom());
    const push = vi.fn();
    const { result } = renderHook(() => useLiveKitVoice("ruby", push));
    await act(async () => {
      await result.current.start();
    });
    const room = getLastFakeRoom();
    await act(async () => {
      result.current.hangup();
    });
    expect(room.disconnect).toHaveBeenCalledOnce();
    expect(result.current.state).toBe("idle");
  });

  it("transitions to error when /voice/room returns non-2xx", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ error: "Voice trial exhausted" }),
          { status: 403, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );
    const push = vi.fn();
    const { result } = renderHook(() => useLiveKitVoice("ruby", push));
    await act(async () => {
      await result.current.start();
    });
    expect(result.current.state).toBe("error");
    expect(result.current.errorMessage).toMatch(/trial|403/i);
  });

  it("transitions to error when Room.connect rejects", async () => {
    vi.stubGlobal("fetch", mockFetchRoom());
    // Make every new FakeRoom's connect reject once.
    const origCtor = FakeRoom.prototype.connect;
    FakeRoom.prototype.connect = vi.fn().mockRejectedValueOnce(new Error("connect failed"));
    try {
      const push = vi.fn();
      const { result } = renderHook(() => useLiveKitVoice("ruby", push));
      await act(async () => {
        await result.current.start();
      });
      expect(result.current.state).toBe("error");
      expect(result.current.errorMessage).toMatch(/connect/i);
    } finally {
      FakeRoom.prototype.connect = origCtor;
    }
  });

  it("transitions to error when enableMicrophone rejects (mic denied)", async () => {
    vi.stubGlobal("fetch", mockFetchRoom());
    const origEnable = FakeRoom.prototype.localParticipant?.enableMicrophone;
    // Patch the prototype's localParticipant.enableMicrophone for the next instance.
    const realInit = FakeRoom.prototype.constructor;
    // Simplest path: spy on the next-created instance via instances[].
    const push = vi.fn();
    const { result } = renderHook(() => useLiveKitVoice("ruby", push));
    // Kick off start, then patch the just-created room's mic to reject.
    const startPromise = result.current.start();
    await Promise.resolve(); // let the hook create the Room
    if (FakeRoom.instances.length) {
      FakeRoom.instances[FakeRoom.instances.length - 1].localParticipant.enableMicrophone =
        vi.fn().mockRejectedValueOnce(new Error("Permission denied"));
    }
    await act(async () => {
      await startPromise;
    });
    expect(result.current.state).toBe("error");
    expect(result.current.errorMessage).toMatch(/permission|denied/i);
  });

  it("emits an error when Room emits Disconnected unexpectedly mid-call", async () => {
    vi.stubGlobal("fetch", mockFetchRoom());
    const push = vi.fn();
    const { result } = renderHook(() => useLiveKitVoice("ruby", push));
    await act(async () => {
      await result.current.start();
    });
    await waitFor(() => expect(result.current.state).toBe("listening"));
    act(() => {
      getLastFakeRoom().triggerDisconnected();
    });
    expect(result.current.state).toBe("error");
    expect(result.current.errorMessage).toMatch(/dropped|disconnect/i);
  });
});
```

- [ ] **Step 2: Run the tests — expect all to fail**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test -- client/src/components/agent/voice/useLiveKitVoice.test.ts
```

Expected: all 12 tests fail. Most will fail at module load because `useLiveKitVoice.ts` still imports the deleted WS/AudioContext machinery. Task 12 makes them pass.

- [ ] **Step 3: Commit the failing tests**

```bash
git add client/src/components/agent/voice/useLiveKitVoice.test.ts && \
  git commit -m "useLiveKitVoice: failing tests for livekit-client native transport"
```

---

## Task 12: Rewrite `useLiveKitVoice` hook against `livekit-client`

Make the failing tests pass. Replace the entire hook body. The public surface — `state, errorMessage, durationMs, isMuted, start, hangup, toggleMute` — stays identical so `AgentChat.tsx` doesn't change.

**Files:**
- Modify: `client/src/components/agent/voice/useLiveKitVoice.ts`

- [ ] **Step 1: Replace the entire file**

Replace the contents of `/Users/potdev/Documents/GitHub/potentialcom-Replit/.claude/worktrees/ruby-livekit-native-voice/client/src/components/agent/voice/useLiveKitVoice.ts` with:

```ts
import { useCallback, useEffect, useRef, useState } from "react";
import { Room, RoomEvent, Track } from "livekit-client";
import type { ExternalVoiceEvent } from "../useAgentChat";

export type VoiceState =
  | "idle"
  | "connecting"
  | "listening"
  | "user-speaking"
  | "agent-speaking"
  | "ending"
  | "error";

export interface UseLiveKitVoiceResult {
  state: VoiceState;
  errorMessage: string | null;
  durationMs: number;
  isMuted: boolean;
  start: () => Promise<void>;
  hangup: () => void;
  toggleMute: () => void;
}

interface RoomCreateResponse {
  success?: boolean;
  roomName: string;
  token: string;
  wsUrl: string;
  participantName?: string;
  useNativeAgent?: boolean;
}

interface DataMessage {
  type: string;
  text?: string;
  name?: string;
  arguments?: unknown;
  output?: string;
  callId?: string;
  isError?: boolean;
  speaking?: boolean;
}

/**
 * Real-time voice mode hook. Talks to LiveKit directly via `livekit-client`.
 * A worker registered as "voice-agent" is dispatched into the room by
 * potentialTS; the worker publishes structured events
 * (transcript / ai_response / tool_call / tool_result / agent_speaking)
 * via the room's data channel, which we route to pushExternalEvent so the
 * chat scroll renders them identically to typed conversations.
 *
 * Public surface kept intact for Plan 2b consumers (AgentChat, VoiceCallBar,
 * VoiceModeButton). Internals replaced from the legacy custom-WS transport.
 */
export function useLiveKitVoice(
  agentKey: string,
  pushExternalEvent: (event: ExternalVoiceEvent) => void,
): UseLiveKitVoiceResult {
  const [state, setState] = useState<VoiceState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const roomRef = useRef<Room | null>(null);
  const sessionIdRef = useRef<string>("");
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  // Mirror state for use inside non-React callbacks (Disconnected handler)
  // without stale closures.
  const stateRef = useRef<VoiceState>("idle");
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const cleanup = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (roomRef.current) {
      try {
        // Disconnect is idempotent; ignore errors.
        void roomRef.current.disconnect();
      } catch {
        /* ignore */
      }
      roomRef.current = null;
    }
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const handleData = useCallback(
    (payload: Uint8Array) => {
      let parsed: DataMessage;
      try {
        const text = new TextDecoder().decode(payload);
        parsed = JSON.parse(text) as DataMessage;
      } catch {
        return;
      }

      switch (parsed.type) {
        case "transcript":
          if (typeof parsed.text === "string" && parsed.text.trim()) {
            pushExternalEvent({ kind: "user-transcript", text: parsed.text });
          }
          return;
        case "ai_response":
        case "aiResponse":
          if (typeof parsed.text === "string" && parsed.text.trim()) {
            pushExternalEvent({ kind: "agent-response", text: parsed.text });
          }
          return;
        case "tool_call":
          if (parsed.callId && parsed.name) {
            pushExternalEvent({
              kind: "tool-call",
              id: parsed.callId,
              name: parsed.name,
              args: parsed.arguments ?? {},
              async: false,
            });
          }
          return;
        case "tool_result":
          if (parsed.callId) {
            let result: unknown = parsed.output;
            if (typeof parsed.output === "string") {
              try {
                result = JSON.parse(parsed.output);
              } catch {
                // Keep as string if not parseable JSON.
              }
            }
            pushExternalEvent({
              kind: "tool-result",
              id: parsed.callId,
              result,
            });
          }
          return;
        case "agent_speaking":
          setState(parsed.speaking ? "agent-speaking" : "listening");
          return;
        default:
          return;
      }
    },
    [pushExternalEvent],
  );

  const start = useCallback(async () => {
    cleanup();
    setErrorMessage(null);
    setState("connecting");

    // 1. Mint a room via the Express proxy (existing /voice/room).
    let room: RoomCreateResponse;
    try {
      const sid =
        sessionIdRef.current ||
        `voice-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      sessionIdRef.current = sid;
      const res = await fetch(`/api/agent/${agentKey}/voice/room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid }),
      });
      if (!res.ok) {
        const body = await res.text();
        let msg = `Failed to start voice call (${res.status})`;
        try {
          const j = JSON.parse(body);
          if (j?.error) msg = j.error;
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }
      room = (await res.json()) as RoomCreateResponse;
    } catch (err) {
      setState("error");
      setErrorMessage(err instanceof Error ? err.message : "Could not start call");
      return;
    }

    // 2. Construct + wire the Room (handlers registered BEFORE connect so
    //    any synchronous events during connect are caught).
    const rkRoom = new Room();
    roomRef.current = rkRoom;

    rkRoom.on(RoomEvent.DataReceived, (payload: Uint8Array) => {
      handleData(payload);
    });

    rkRoom.on(RoomEvent.TrackSubscribed, (track) => {
      if (track.kind === Track.Kind.Audio) {
        // attach() returns the auto-created <audio> element; it auto-plays.
        // We don't keep the reference — the SDK manages lifecycle.
        try {
          (track as any).attach?.();
        } catch {
          /* ignore */
        }
      }
    });

    rkRoom.on(RoomEvent.Disconnected, () => {
      if (stateRef.current !== "ending" && stateRef.current !== "idle") {
        setState("error");
        setErrorMessage("Voice call dropped");
      }
    });

    // 3. Connect, then enable mic. Either step may throw → error state.
    try {
      await rkRoom.connect(room.wsUrl, room.token);
    } catch (err) {
      setState("error");
      setErrorMessage(err instanceof Error ? err.message : "Voice connection error");
      cleanup();
      return;
    }

    try {
      await rkRoom.localParticipant.enableMicrophone();
    } catch (err) {
      setState("error");
      setErrorMessage(err instanceof Error ? err.message : "Mic access denied");
      cleanup();
      return;
    }

    // 4. Active. Tick the duration timer.
    setState("listening");
    startTimeRef.current = Date.now();
    setDurationMs(0);
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      setDurationMs(Date.now() - startTimeRef.current);
    }, 1000);
  }, [agentKey, cleanup, handleData]);

  const hangup = useCallback(() => {
    setState("ending");
    cleanup();
    setState("idle");
    setDurationMs(0);
    setIsMuted(false);
  }, [cleanup]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      // Fire-and-forget — the SDK throws only on truly broken rooms.
      try {
        void roomRef.current?.localParticipant.setMicrophoneEnabled(!next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return {
    state,
    errorMessage,
    durationMs,
    isMuted,
    start,
    hangup,
    toggleMute,
  };
}
```

- [ ] **Step 2: Run the targeted tests**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test -- client/src/components/agent/voice/useLiveKitVoice.test.ts
```

Expected: all 12 tests pass. If any fail:

- "connect failed" test failing because `FakeRoom.prototype.connect` patch leaks → wrap in try/finally to restore (already shown above; verify).
- "enableMicrophone rejects" timing-sensitive — if it doesn't reliably win the race, swap to monkey-patching `FakeRoom.prototype.localParticipant.enableMicrophone` before render instead of after.
- `agent_speaking` test failing → ensure the hook's `handleData` switch case for `agent_speaking` uses strict equality with the wire string (not `"agentSpeaking"`).

Iterate until green.

- [ ] **Step 3: Run the full suite + type-check**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test 2>&1 | tail -10
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm run check 2>&1 | tail -3
```

Expected: full suite green. Some legacy tests in `AgentChatVoiceMode.test.tsx` may still fail because they use the old `FakeWebSocket` setup — that's fixed in Task 13. Don't fix them here.

If `npm run check` complains about unused imports (`AudioContext`, `MediaStream`, etc.) — confirm you removed them; the rewritten hook should only import from `react`, `livekit-client`, and `../useAgentChat`.

- [ ] **Step 4: Commit**

```bash
git add client/src/components/agent/voice/useLiveKitVoice.ts && \
  git commit -m "useLiveKitVoice: rewrite internals on livekit-client (native transport)"
```

---

## Task 13: Update `AgentChatVoiceMode.test.tsx` integration test

Same idea as Task 11 — swap `FakeWebSocket` setup for `FakeRoom`. The three existing test cases (happy-path WS open, no double-audio after call end, error toast on /voice/room failure) keep their assertion shape; only the mock setup changes.

**Files:**
- Modify: `client/src/components/agent/voice/AgentChatVoiceMode.test.tsx`

- [ ] **Step 1: Replace the entire file**

Replace the contents of `/Users/potdev/Documents/GitHub/potentialcom-Replit/.claude/worktrees/ruby-livekit-native-voice/client/src/components/agent/voice/AgentChatVoiceMode.test.tsx` with:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { installFakeRoom, getLastFakeRoom, FakeRoom } from "../../../test/livekitFakeRoom";
installFakeRoom();

import { AgentChat } from "../AgentChat";
import { rubyToolRegistry } from "../../ruby/rubyToolRegistry";
import { Toaster } from "@/components/ui/toaster";

const botConfig = {
  name: "Ruby",
  greeting: "Hi",
  avatarUrl: "",
  audiostt: true,
  audiotts: true,
};

function makeFetch(extra: Record<string, (init?: RequestInit) => Response | Promise<Response>> = {}) {
  return vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
    if (typeof url === "string" && url.endsWith("/api/agent/ruby/bot")) {
      return new Response(JSON.stringify(botConfig), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (typeof url === "string" && url.endsWith("/voice/room")) {
      return new Response(
        JSON.stringify({
          success: true,
          roomName: "room-1",
          token: "tok",
          wsUrl: "wss://livekit.test",
          useNativeAgent: true,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
    for (const [pattern, handler] of Object.entries(extra)) {
      if (typeof url === "string" && url.includes(pattern)) {
        return handler(init);
      }
    }
    return new Response("data: [DONE]\n\n", {
      status: 200,
      headers: { "Content-Type": "text/event-stream" },
    });
  });
}

beforeEach(() => {
  FakeRoom.instances = [];
  if (!Element.prototype.scrollTo) {
    Element.prototype.scrollTo = vi.fn() as unknown as typeof Element.prototype.scrollTo;
  } else {
    vi.spyOn(Element.prototype, "scrollTo").mockImplementation(() => {});
  }
  // navigator.mediaDevices isn't called directly anymore (livekit-client wraps it),
  // but the VoiceModeButton's `isVoiceSupported()` check still requires it.
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: {
      getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [] }),
    },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("AgentChat voice mode integration (LiveKit-native)", () => {
  it("clicking Talk to Ruby connects to LiveKit and renders an ai_response as a chat bubble", async () => {
    vi.stubGlobal("fetch", makeFetch());

    const user = userEvent.setup();
    render(<AgentChat agentKey="ruby" registry={rubyToolRegistry} />);

    const talkBtn = await screen.findByRole("button", { name: /talk to ruby/i });
    await user.click(talkBtn);

    await waitFor(() => expect(FakeRoom.instances).toHaveLength(1));
    const room = getLastFakeRoom();
    expect(room.connect).toHaveBeenCalledWith("wss://livekit.test", "tok");

    act(() => {
      room.triggerDataReceived({
        type: "ai_response",
        text: "Welcome! How can I help?",
      });
    });

    expect(
      await screen.findByText("Welcome! How can I help?"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /end call/i }));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /talk to ruby/i }),
      ).toBeInTheDocument(),
    );
  });

  it("does not re-speak voice-mode messages via /speak after call ends (auto-speak ON)", async () => {
    const speakCalls: string[] = [];
    vi.stubGlobal(
      "fetch",
      makeFetch({
        "/speak": () => {
          speakCalls.push("/speak");
          return new Response(new Uint8Array([1, 2, 3]), {
            status: 200,
            headers: { "Content-Type": "audio/mpeg" },
          });
        },
      }),
    );

    const user = userEvent.setup();
    render(<AgentChat agentKey="ruby" registry={rubyToolRegistry} />);

    const toggle = await screen.findByRole("switch", { name: /auto-speak/i });
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "true");

    await user.click(screen.getByRole("button", { name: /talk to ruby/i }));
    await waitFor(() => expect(FakeRoom.instances).toHaveLength(1));

    act(() => {
      getLastFakeRoom().triggerDataReceived({
        type: "ai_response",
        text: "Here are some lipsticks.",
      });
    });
    expect(await screen.findByText("Here are some lipsticks.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /end call/i }));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /talk to ruby/i }),
      ).toBeInTheDocument(),
    );

    await new Promise((r) => setTimeout(r, 0));
    expect(speakCalls).toHaveLength(0);
  });

  it("shows a toast when the voice room mint fails (e.g. trial exhausted)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async (url: string) => {
        if (typeof url === "string" && url.endsWith("/api/agent/ruby/bot")) {
          return new Response(JSON.stringify(botConfig), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
        if (typeof url === "string" && url.endsWith("/voice/room")) {
          return new Response(
            JSON.stringify({ error: "Voice trial exhausted" }),
            { status: 403, headers: { "Content-Type": "application/json" } },
          );
        }
        return new Response("data: [DONE]\n\n", {
          status: 200,
          headers: { "Content-Type": "text/event-stream" },
        });
      }),
    );

    const user = userEvent.setup();
    render(
      <>
        <AgentChat agentKey="ruby" registry={rubyToolRegistry} />
        <Toaster />
      </>,
    );

    await user.click(
      await screen.findByRole("button", { name: /talk to ruby/i }),
    );

    expect(
      await screen.findByText(/voice trial exhausted/i),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /talk to ruby/i }),
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the integration test**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test -- client/src/components/agent/voice/AgentChatVoiceMode.test.tsx
```

Expected: 3 tests pass.

- [ ] **Step 3: Commit**

```bash
git add client/src/components/agent/voice/AgentChatVoiceMode.test.tsx && \
  git commit -m "AgentChatVoiceMode test: port to FakeRoom integration mocks"
```

---

## Task 14: Simplify the `/voice/room` proxy + delete `pcm-worklet.ts`

Drop the `customWsUrl` + `botId` synthesis we added during Plan 2b debugging (it's no longer needed — the hook connects to `room.wsUrl` directly with the LiveKit token). Update the proxy test. Delete the AudioWorklet processor file.

**Files:**
- Modify: `server/routes.ts`
- Modify: `server/routes.agent-voice-room.test.ts`
- Delete: `client/src/components/agent/voice/pcm-worklet.ts`

- [ ] **Step 1: Restore the proxy to verbatim relay**

In `/Users/potdev/Documents/GitHub/potentialcom-Replit/.claude/worktrees/ruby-livekit-native-voice/server/routes.ts`, find the `POST /api/agent/:agentKey/voice/room` handler (around line 824 in the merged main). Replace its `try { ... }` body with:

```ts
    try {
      const upstream = await fetch(
        `${POTENTIAL_API_BASE}/api/livekit/room/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            botId: agent.botId,
            sessionId,
          }),
        },
      );
      const text = await upstream.text();
      res
        .status(upstream.status)
        .type(upstream.headers.get("content-type") ?? "application/json")
        .send(text);
    } catch (err) {
      console.error("Agent voice room proxy error:", err);
      res.status(502).json({ message: "Failed to reach voice service" });
    }
```

The `sessionId` validation guard (added during Plan 2b debugging) at the top of the handler **stays** — it's still useful for early failure.

- [ ] **Step 2: Update the proxy test**

In `/Users/potdev/Documents/GitHub/potentialcom-Replit/.claude/worktrees/ruby-livekit-native-voice/server/routes.agent-voice-room.test.ts`, find the test case `"forwards botId + sessionId to upstream and relays the response"`. Remove these two assertions:

```ts
expect(typeof res.body.customWsUrl).toBe("string");
expect(res.body.customWsUrl).toMatch(/^wss?:\/\//);
expect(res.body.botId).toBe("6a056e4ece71ae96a167f826");
```

(The first two were added during Plan 2b debugging; `botId` synthesis is also gone. The route still preserves the upstream's response body, which DOES include the upstream-generated `roomName`/`token`/`wsUrl`.)

The rest of the test stays.

- [ ] **Step 3: Delete the AudioWorklet**

```bash
cd /Users/potdev/Documents/GitHub/potentialcom-Replit/.claude/worktrees/ruby-livekit-native-voice && \
  git rm client/src/components/agent/voice/pcm-worklet.ts
```

- [ ] **Step 4: Run the proxy test**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test -- server/routes.agent-voice-room.test.ts
```

Expected: 4 tests pass.

- [ ] **Step 5: Run the full suite + type-check**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm test 2>&1 | tail -8
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH npm run check 2>&1 | tail -3
```

Expected: all tests pass; tsc clean. Total test count should be the Plan 2b baseline (298) **minus** the config-on-open test we retired implicitly (it's gone because the new hook doesn't send a config message) **minus** the deleted pcm-worklet file (no test impact) = approximately 297.

If `npm run check` complains about `pcm-worklet` references anywhere, the only remaining one would be a hypothetical type import — `useLiveKitVoice.ts` after Task 12 doesn't reference it. Grep to confirm:

```bash
grep -rn "pcm-worklet" client/src
```

Should print nothing.

- [ ] **Step 6: Commit**

```bash
git add server/routes.ts server/routes.agent-voice-room.test.ts && \
  git commit -m "voice/room proxy: relay verbatim, drop customWsUrl + delete pcm-worklet"
```

---

## Task 15: End-to-end smoke test (manual, post-deploy)

After all code is committed and merged, validate the full flow against production.

**Pre-flight (must be true before smoke):**

- [ ] `potentialcom-Replit` main pushed; Dokploy redeploy completed
- [ ] `potentialTS` `feature/livekit-native-dispatch` merged + deployed; `LIVEKIT_AGENT_ENABLED=true` set in prod env
- [ ] Confirm `voice-agent` worker is up:
  ```bash
  # If you have access to LiveKit dashboard: check worker count > 0
  # OR check the deployed worker process logs for "registered" / "joined cluster"
  ```
- [ ] Mongo: `users.<rubyOwner>.manualVoiceSubscriptionActive === true` (kept from Plan 2b debug)
- [ ] Mongo: `botvoiceagents.{botId, userId}.callTimeLeftSeconds > 0` (kept from Plan 2b debug)

- [ ] **Step 1: Curl the production endpoint**

```bash
curl -s -X POST https://api.potential.com/api/livekit/room/create \
  -H 'Content-Type: application/json' \
  -d '{"botId":"6a056e4ece71ae96a167f826","sessionId":"smoke-native"}'
```

Expected: HTTP 200 with `useNativeAgent: true` in the body:
```json
{
  "success": true,
  "roomName": "bot-6a056...-session-smoke-native-...",
  "token": "eyJhbGc...",
  "wsUrl": "wss://livekit.potential.com",
  "useNativeAgent": true,
  "participantName": "user-..."
}
```

If `useNativeAgent: false`, `LIVEKIT_AGENT_ENABLED` isn't set on the deployed potentialTS. Fix env and redeploy before continuing.

- [ ] **Step 2: Open `/demo` and click Talk to Ruby**

Hard-reload the deployed `/demo` page in your browser, click `📞 Talk to Ruby`, grant mic when prompted.

Expected behavior:
1. Header pill transitions **idle → connecting → listening**
2. Ruby's greeting **plays through your speakers** (not via /speak — via the LiveKit audio track)
3. Greeting also **renders as an agent bubble in the chat scroll** (the worker `publishData`s `ai_response` immediately on greeting)

If audio plays but no chat bubble appears, the worker's `publishToChat("ai_response", ...)` isn't firing for greetings, or the hook's `handleData` is mis-routing the type. Inspect `__voice_observed__` (the patch from earlier debugging, or set up a fresh one) to see what data messages arrived.

- [ ] **Step 3: Say "Show me lipsticks"**

Wait for Ruby to finish greeting. Speak clearly. Wait ~2s after you stop.

Expected:
1. A **user bubble appears** with your transcript (Deepgram → worker → `transcript` data message → `pushExternalEvent`)
2. Ruby's **reply renders as an agent bubble** (token-stream via voice-llm SSE → worker → `ai_response` data message)
3. Her reply **plays through your speakers** (LiveKit TTS streams MP3 into the audio track)
4. A **`display_makeup_products` tool card appears in the chat scroll** with 5 lipsticks (tool execution via processWithAI in potentialTS → SSE `toolResponse` → worker `publishData("tool_result", ...)` → hook routes to `pushExternalEvent` → ToolCard renders)

- [ ] **Step 4: Hangup**

Click the red phone icon. Pill collapses; `Talk to Ruby` returns.

Expected:
- Audio stops
- Chat history is preserved
- DevTools Network panel shows the `/voice/room` POST returned 200, and one open WebSocket to LiveKit (now closed)
- DevTools Console has no errors

- [ ] **Step 5: Voice + typed chat share history**

After the call, type a message: "what was the second product you mentioned?"

Expected: Ruby's reply references the second lipstick from the tool card she rendered during voice. (This proves the worker's HTTP-delegated CustomLLM wrote turns into the same `ChatHistory` document, via `processWithAI`'s existing persistence.)

- [ ] **Step 6: Toggle Plan 2b acceptance checks**

- [ ] Click Talk to Ruby, immediately try the **mute** button → speak silently → unmute → Ruby's next response shouldn't reference what you said while muted
- [ ] During a call, **type a message** in the chat input → it sends normally via SSE without disrupting the voice call
- [ ] **Refresh** mid-call → worktree cleans up (no console errors)

- [ ] **Step 7: Mark task complete**

If all of steps 1–6 pass, Plan 2c is shipped. Mark this task done in your TodoWrite list.

If any step fails, debug from the layer that fails. The diagnostic patch from Plan 2b debugging (`window.__voice_observed__` — see earlier conversation) is reusable here by adapting it to LiveKit's data events.

---

## Final Notes

**Order of operations when shipping:**

1. Land `potentialcom-Replit` changes first (Tasks 10–14). The new hook will return a 403 from the deployed potentialTS until Task 8 ships, but the build still passes locally.
2. Land `potentialTS` changes (Tasks 7–9). Set `LIVEKIT_AGENT_ENABLED=true` in prod env.
3. Land `LiveKit-agent` (Tasks 1–6) — only matters for future deploy swap. Today's calls go to the already-deployed PotentialBackendLive worker, which serves the same `"voice-agent"` name.
4. Run Task 15 against production.

**Rollback plan:**

If something blows up post-deploy:
- Frontend: revert the `useLiveKitVoice` rewrite commit; Plan 2b's transport returns. Requires undoing the `pcm-worklet` deletion too.
- potentialTS: unset `LIVEKIT_AGENT_ENABLED` env var. Dispatch logic shorts; legacy custom-WS path serves traffic.
- LiveKit-agent repo: take no action (nothing deployed from it yet).

**What's intentionally not changed:**

- The legacy `/ws/livekit/...` handler in `potentialTS/src/index.ts` + `livekitAgent.controller.ts` stays. SIP/Twilio voice paths still go through it. Deletion is a separate audit.
- `BotVoiceAgent.type === "vapi"` and `"ws"` paths are unaffected — the `useNativeAgent` gate is `livekit`-only.
- Recording, ghost bubble, interim transcripts, multi-language UI — out of scope per spec.

---

## Self-review notes

- **Spec coverage:**
  - LiveKit-agent stripper repo → Tasks 1–6 ✓
  - potentialTS dispatch + env → Tasks 7, 8 ✓
  - potentialTS voice-llm endpoint → Task 9 ✓
  - Frontend hook rewrite → Tasks 10–12 ✓
  - Frontend integration test → Task 13 ✓
  - Proxy simplification → Task 14 ✓
  - End-to-end smoke → Task 15 ✓
  - Acceptance criteria 1–11 from spec → all covered by Task 15 manual smoke
  - Out-of-scope items → explicitly not implemented (legacy WS handler, recording, ghost bubble)
- **Type consistency:** `useLiveKitVoice`'s public type (`UseLiveKitVoiceResult`) is identical to Plan 2b's; `ExternalVoiceEvent` union (from `useAgentChat.ts`) is unchanged. `CustomLLM` options interface is internal to the worker; same shape in customLLM.ts and voiceAgent.ts.
- **Placeholder scan:** No "TBD", no "implement later". Every code step contains the full code or an exact diff against a named reference file.
