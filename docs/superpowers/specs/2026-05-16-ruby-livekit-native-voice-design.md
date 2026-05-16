# Ruby LiveKit-Native Voice Mode — Design Spec

**Date:** 2026-05-16
**Status:** Approved, ready for plan
**Replaces:** the custom WebSocket transport in `2026-05-15-ruby-voice-mode-design.md` (Plan 2b). The frontend hook surface and chat-integration are kept; only the transport flips from custom WS → LiveKit native.

---

## Goal

Move Ruby's real-time voice mode from a hand-rolled WebSocket (`/ws/livekit/{room}/{botId}/{sid}`) that does Deepgram + ElevenLabs inline, to LiveKit's official Agents pipeline. The browser connects via `livekit-client` SDK; a deployed `voice-agent` worker is dispatched into the room and handles STT/TTS/AI. All transport mechanics (PCM encoding, MP3 streaming, frame buffering, sample-rate negotiation) move into LiveKit's plugins. Ruby's existing 17 chat tools continue working unchanged — voice calls the same `processWithAI` code path as typed chat via a new SSE endpoint.

## Background

Plan 2b shipped a working voice mode against a legacy custom WS handler that lives in `potentialTS/src/index.ts` + `livekitAgent.controller.ts`. The transport is brittle: client manages an `AudioContext`, custom `AudioWorklet` for PCM encoding, manual frame buffering, custom `{type:"config", sampleRate}` handshake. We control the byte format end-to-end which is fragile when browser audio behavior varies.

A reference implementation (`PotentialBackendLive`) uses LiveKit's first-party Agents framework: explicit agent dispatch via `AgentDispatchClient`, a long-running worker process that joins rooms via the LiveKit server, and the `@livekit/agents` framework that orchestrates STT/LLM/TTS/VAD plugins inside the worker. The frontend uses `livekit-client` to join the same room as a participant. Audio flows over LiveKit's native data channels; structured events (transcript, tool_call, tool_result, ai_response) flow over LiveKit's data messages.

The voice-agent worker is **already deployed** in production (image to be confirmed via screenshot). What's missing is: (1) explicit dispatch from `potentialTS/routes/livekit.ts`, (2) a new repo for the worker's source so we can iterate on it without touching potentialTS, (3) a `voice-llm` SSE endpoint in potentialTS that the worker calls per turn, and (4) replacing the frontend hook's WS transport with `livekit-client`.

## Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│  Browser (potentialcom-Replit, /demo)                                  │
│                                                                        │
│  AgentChat                                                             │
│    └─ useLiveKitVoice (REWRITTEN)                                      │
│         ├─ fetch  POST /api/agent/ruby/voice/room                      │
│         ├─ livekit-client: new Room().connect(wsUrl, token)            │
│         ├─ enableMicrophone()                                          │
│         ├─ on(TrackSubscribed)        → <audio> auto-plays agent TTS   │
│         └─ on(DataReceived)           → JSON {type, ...} events        │
│                                          → pushExternalEvent (Plan 2b) │
└──────────────────────────────┬─────────────────────────────────────────┘
                               │ HTTP
                               ▼
┌────────────────────────────────────────────────────────────────────────┐
│  potentialcom-Replit Express server                                    │
│    POST /api/agent/:agentKey/voice/room                                │
│      (proxy untouched except simplification — drop customWsUrl)        │
└──────────────────────────────┬─────────────────────────────────────────┘
                               │ HTTP
                               ▼
┌────────────────────────────────────────────────────────────────────────┐
│  potentialTS Express server (api.potential.com)                        │
│                                                                        │
│  POST /api/livekit/room/create  (MODIFIED)                             │
│    1. Validate bot + trial gating (existing)                           │
│    2. RoomServiceClient.createRoom({ name: roomName })                 │
│    3. AgentDispatchClient.createDispatch(roomName, "voice-agent",      │
│         { metadata: JSON.stringify({botId, sessionId}) })              │
│    4. AccessToken (for browser participant)                            │
│    5. Return { roomName, token, wsUrl, useNativeAgent: true }          │
│                                                                        │
│  POST /agent/chatbot/:botId/voice-llm  (NEW SSE endpoint)              │
│    Body: { sessionId, userMessage, trainingContext? }                  │
│    Streams: SSE events identical to existing /chat                     │
│       data: {kind:"token", content:"..."}                              │
│       data: {kind:"toolCall", name, arguments}                         │
│       data: {kind:"toolResponse", name, content}                       │
│       data: {kind:"done", response, totalTokens}                       │
│    Implementation: thin wrapper over AgentController.processWithAI     │
└────────────────┬─────────────────────────────────┬─────────────────────┘
                 │                                 │
                 │ HTTP (per user turn)            │ env LIVEKIT_API_URL,
                 │                                 │ LIVEKIT_API_KEY,
                 │                                 │ LIVEKIT_API_SECRET
                 │                                 ▼
                 │            ┌────────────────────────────────────────┐
                 │            │  LiveKit server (livekit.potential.com)│
                 │            └────────────┬───────────────────────────┘
                 │                         │
                 │   ┌─────────────────────┴─────────────┐
                 │   │ rooms, audio tracks, data channel │
                 │   ▼                                   ▼
                 │ ┌─────────┐                  ┌──────────────────────┐
                 │ │ Browser │                  │  voice-agent worker  │
                 │ │ (above) │                  │  (NEW REPO,          │
                 │ └─────────┘                  │   /LiveKit-agent)    │
                 │   ▲ ▲                        │                      │
                 │   │ │ TTS audio              │  agentServer.ts      │
                 │   │ │ data messages          │    register as       │
                 │   │ └────────────────────────┤    "voice-agent"     │
                 │   │   mic audio              │  voiceAgent.ts       │
                 │   └──────────────────────────┤    Silero VAD        │
                 │                              │    Deepgram STT      │
                 │                              │    CustomLLM (HTTP)  │
                 │                              │    ElevenLabs TTS    │
                 └──────────────────────────────┤    publishData()     │
                       SSE consumed by          │    onConversation    │
                       CustomLLM per turn       │    ItemAdded handler │
                                                └──────────────────────┘
```

## Three repos in scope

### 1. `/Users/potdev/Documents/GitHub/LiveKit-agent` (NEW)

Stripper worker repo. Contains only what's needed for the LiveKit Agents worker to run.

**File layout:**
```
LiveKit-agent/
  package.json              ← @livekit/agents + plugins + ~8 deps total
  tsconfig.json
  .env.example              ← LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET,
                              MONGO_URI, DEEPGRAM_API_KEY, ELEVENLABS_API_KEY,
                              POTENTIAL_API_BASE (where voice-llm lives)
  .gitignore
  README.md                 ← how to run dev/start, env vars, dispatch test
  src/
    agentServer.ts          ← Worker entry. Registers as "voice-agent".
                              Copied from PotentialBackendLive verbatim,
                              minor cleanup (drop unused imports).
    voiceAgent.ts           ← Per-session logic. defineAgent() with:
                              - parseRoomName + metadata parsing
                              - Mongo connect + Bot/BotVoiceAgent fetch
                              - createSTT (Deepgram default, language/model from cfg)
                              - createTTS (ElevenLabs default, voiceId from cfg)
                              - Silero VAD via ctx.proc.userData.vad
                              - voice.Agent with system prompt + chat history
                              - voice.AgentSession with STT/TTS/VAD/CustomLLM
                              - CustomLLM that calls potentialTS /voice-llm endpoint
                              - publishData on transcript / ai_response /
                                tool_call / tool_result / agent_speaking
                              - shutdown callback updates BotVoiceAgent
                                callTimeLeftSeconds
                              - greeting on join (uses bot.greeting)
    customLLM.ts            ← Extracted CustomLLM + CustomLLMStream classes
                              that consume the SSE from /voice-llm.
                              Pure HTTP client, no Mongo, no AgentController.
    chatHistory.ts          ← loadChatHistory(sessionId, botId) returning a
                              voice.ChatContext seeded from the same
                              ChatHistory collection as the typed chat.
    models/
      bot.model.ts          ← Copied verbatim from PotentialBackendLive
      botVoiceAgent.model.ts
      chatHistory.model.ts
```

**Deps (package.json):**
- `@livekit/agents` ^1.0.30
- `@livekit/agents-plugin-silero` ^1.0.30 (VAD)
- `@livekit/agents-plugin-deepgram` ^1.0.30 (STT)
- `@livekit/agents-plugin-elevenlabs` ^1.0.30 (TTS)
- `@livekit/rtc-node` ^0.13.22
- `mongoose` ^8.x (read `Bot` + `BotVoiceAgent` + `ChatHistory`; write `BotVoiceAgent.callTimeLeftSeconds` on shutdown only)
- `dotenv` ^16.x
- Dev: `typescript`, `tsx` (or `bun`), `@types/node`

`fetch` is global in Node ≥18. No `node-fetch` dep.

Total: ~8 runtime deps. Compare to PotentialBackendLive's ~150.

**Run commands:**
- Dev: `bun run src/agentServer.ts dev`
- Prod: `bun run src/agentServer.ts start`

### 2. `potentialTS` (modifications)

**Modified `src/routes/livekit.ts` — `POST /api/livekit/room/create`:**

Add explicit dispatch when `cfg?.type === "livekit"` AND `LIVEKIT_AGENT_ENABLED === "true"`. Direct port of the `PotentialBackendLive` pattern (lines 100–127 of their version). Returns an additional `useNativeAgent: boolean` field in the response so the client can branch (we'll always be true in our deployment; the field exists for parity with the reference repo).

**New file `src/controllers/voiceLlm.controller.ts` (or co-located in `agent.controller.ts`):**

```
POST /agent/chatbot/:botId/voice-llm
  Body: { sessionId, userMessage, trainingContext?: object }
  Auth: none (worker → server, same network; can add API key gate later)
  Response: text/event-stream
    data: {"kind":"token","content":"..."}\n\n   ← repeated, one per token
    data: {"kind":"toolCall","name":"...","arguments":{...}}\n\n
    data: {"kind":"toolResponse","name":"...","content":...}\n\n
    data: {"kind":"done","response":"...","totalTokens":N}\n\n
```

Internally, this is the exact same generator the typed-chat `/chat` endpoint uses — `AgentController.processWithAI(botId, sessionId, userMessage, trainingContext)` — exposed as an SSE stream. Voice and typed chat run the same tools, write the same `ChatHistory` documents, share the same MongoDB session.

If the existing chat endpoint already streams events identically, we may be able to alias it (single endpoint, two consumers) rather than duplicate. Plan task lists both files; the implementer picks based on the actual chat controller shape.

**Env var:** add `LIVEKIT_AGENT_ENABLED` to `src/config/env.ts` REQUIRED_VARS, default-falsey.

**Removed: nothing.** Legacy WS handler at `/ws/livekit/...` stays in `livekitAgent.controller.ts` so we don't break SIP/Twilio paths that also use it. Once we verify native flow works in prod, a follow-up sprint can rip the legacy paths.

### 3. `potentialcom-Replit` (modifications)

**Rewritten `client/src/components/agent/voice/useLiveKitVoice.ts`:**

Same external shape — `useLiveKitVoice(agentKey, pushExternalEvent): {state, errorMessage, durationMs, isMuted, start, hangup, toggleMute}`. Internals are entirely different:

```ts
import { Room, RoomEvent, Track } from "livekit-client";

// start()
const room = new Room();
roomRef.current = room;
room.on(RoomEvent.DataReceived, (payload) => {
  const text = new TextDecoder().decode(payload);
  const ev = JSON.parse(text);
  switch (ev.type) {
    case "transcript":      pushExternalEvent({kind:"user-transcript", text: ev.text}); break;
    case "ai_response":     pushExternalEvent({kind:"agent-response", text: ev.text}); break;
    case "tool_call":       pushExternalEvent({kind:"tool-call", id, name, args, async}); break;
    case "tool_result":     pushExternalEvent({kind:"tool-result", id, result}); break;
    case "agent_speaking":  setState(ev.speaking ? "agent-speaking" : "listening"); break;
  }
});
room.on(RoomEvent.TrackSubscribed, (track) => {
  if (track.kind === Track.Kind.Audio) {
    track.attach(); // implicit <audio> element auto-plays
  }
});
room.on(RoomEvent.Disconnected, () => { /* state cleanup */ });
await room.connect(room.wsUrl, room.token);
await room.localParticipant.enableMicrophone();
setState("listening");

// hangup()
await room.disconnect();

// toggleMute()
await room.localParticipant.setMicrophoneEnabled(!isMuted);
```

**Deleted files:**
- `client/src/components/agent/voice/pcm-worklet.ts` (no longer needed)

**Modified `server/routes.ts`:**

Simplify the `/api/agent/:agentKey/voice/room` proxy — drop the `customWsUrl` synthesis we added during Plan 2b debugging. Relay the upstream response verbatim again. Keep `sessionId` validation.

**Modified tests:**
- `client/src/components/agent/voice/useLiveKitVoice.test.ts` — replace `FakeWebSocket` + `FakeAudioContext` mocks with a `FakeRoom` mock that exposes `connect`, `disconnect`, `on(event, cb)`, `localParticipant.{enableMicrophone, setMicrophoneEnabled}`, and a way for tests to trigger `DataReceived` / `TrackSubscribed` / `Disconnected` events. Same 10 test cases, rewritten against the new mock surface.
- `client/src/components/agent/voice/AgentChatVoiceMode.test.tsx` — replace `FakeWebSocket` with the same `FakeRoom`. Same 3 test cases (happy-path, double-audio guard, error toast).
- `server/routes.agent-voice-room.test.ts` — drop the `customWsUrl` assertion; assert relay verbatim again.

**Added dep:** `livekit-client` ^2.15.10.

**Untouched:**
- `useAgentChat.ts` (`pushExternalEvent` wire format identical)
- `VoiceModeButton.tsx`, `VoiceCallBar.tsx`, `AutoSpeakToggle.tsx`
- `AgentChat.tsx` (header rendering, auto-speak gate, error toast, seed-on-call-end effect — all identical because `voice.state` and `voice.errorMessage` keep the same semantics)
- Mongo gating

## Data flow (end-to-end happy path)

1. **User clicks Talk to Ruby.**
2. Browser `POST /api/agent/ruby/voice/room` with `{sessionId}`.
3. Browser-side proxy forwards to potentialTS `POST /api/livekit/room/create` with `{botId, sessionId}`.
4. potentialTS validates trial budget (existing). Then:
   - `roomService.createRoom({name: roomName})`
   - `dispatchClient.createDispatch(roomName, "voice-agent", {metadata: JSON.stringify({botId, sessionId})})`
   - Generates `AccessToken` for the browser participant
   - Returns `{success, roomName, token, wsUrl, participantName, useNativeAgent: true}`
5. Browser:
   - `new Room()` → `room.connect(wsUrl, token)`
   - `room.localParticipant.enableMicrophone()`
   - Hook state → `connecting` → `listening`.
6. LiveKit server delivers the dispatch to the registered `voice-agent` worker (already deployed).
7. Worker's `voiceAgent.ts` `entry()`:
   - Connects to the room as another participant
   - Parses `botId`/`sessionId` from `ctx.job.metadata`
   - Connects Mongo, fetches `Bot` and `BotVoiceAgent`
   - Initializes Silero VAD + Deepgram STT + ElevenLabs TTS plugins
   - Loads chat history into a `voice.ChatContext`
   - Creates `voice.AgentSession({stt, tts, vad, llm: customLLM})`
   - `session.start({agent, room: ctx.room})`
   - `session.say(bot.greeting)` (TTS plays in the room; user hears greeting)
   - Worker publishes `{type:"ai_response", text: greeting, isGreeting: true}` via `publishData`
   - Worker publishes `{type:"audio_start"}` and `{type:"audio_end"}` around the greeting
8. Browser receives those data messages and `pushExternalEvent` puts them into the chat scroll (user sees Ruby's greeting bubble; their `<audio>` element auto-plays the TTS).
9. **User speaks.** LiveKit + VAD detects speech, Deepgram returns a transcript.
10. Worker fires `UserInputTranscribed` → `publishData({type:"transcript", text})`.
11. Browser receives transcript → `pushExternalEvent({kind:"user-transcript", text})` → user message bubble appears in chat.
12. `voice.AgentSession` invokes `customLLM.chat({chatCtx})` to generate the agent's reply.
13. `CustomLLM.run()` makes `POST https://api.potential.com/agent/chatbot/{botId}/voice-llm` with `{sessionId, userMessage}`. Consumes the SSE stream:
    - `token` events → push chunks into `LLMStream` → LiveKit TTS plugin streams audio back into the room as tokens arrive (low-latency)
    - `toolCall` events → also `publishData({type:"tool_call", ...})` so the browser renders the tool card via Plan 2's `ToolCard`
    - `toolResponse` events → `publishData({type:"tool_result", ...})`
    - `done` event → close the stream
14. Browser hears Ruby reply via the LiveKit audio track. Tool cards appear in the chat.
15. After Ruby finishes speaking, VAD detects silence, session returns to listening.
16. **User clicks End call.** Hook calls `room.disconnect()` → worker's session ends → shutdown callback runs → `BotVoiceAgent.callTimeLeftSeconds -= duration`.

## Wire formats

Data messages (worker → browser, via LiveKit `publishData`):

| `type` | Payload | Triggers in browser |
|---|---|---|
| `transcript` | `{text: string}` | `pushExternalEvent({kind:"user-transcript", text})` → user bubble |
| `ai_response` | `{text: string, isGreeting?: boolean, tokenDetails?: {...}}` | `pushExternalEvent({kind:"agent-response", text})` → agent bubble |
| `tool_call` | `{name, arguments, callId, tokenDetails?}` | `pushExternalEvent({kind:"tool-call", id: callId, name, args: arguments, async: false})` → loading tool card |
| `tool_result` | `{name, output: string, callId, isError, tokenDetails?}` | `pushExternalEvent({kind:"tool-result", id: callId, result: JSON.parse(output)})` → tool card resolves |
| `agent_speaking` | `{speaking: boolean}` | `setState(speaking ? "agent-speaking" : "listening")` |

`callId` is provided by the worker's `CustomLLM` so id-based pairing works without the name-only fallback we needed in Plan 2b.

`tool_result.output` is a string per `voiceAgent.ts` source — the hook must `JSON.parse` it before passing to `pushExternalEvent`.

SSE format (worker ← potentialTS, via `voice-llm`):

```
data: {"kind":"token","content":"Hi"}

data: {"kind":"token","content":" there"}

data: {"kind":"toolCall","name":"display_makeup_products","arguments":{...}}

data: {"kind":"toolResponse","name":"display_makeup_products","content":{...}}

data: {"kind":"done","response":"Hi there, here are some lipsticks.","totalTokens":234}
```

Mirrors the existing typed-chat `/chat` endpoint shape so worker and frontend share parsing patterns. If the existing endpoint already does this exact shape, the new `voice-llm` route can be a 5-line alias.

## Error handling

| Scenario | Behavior |
|---|---|
| `/voice/room` returns 4xx (trial gate, no bot, no mic config) | Hook → `state = "error"`, `errorMessage` from upstream JSON `error` field. AgentChat surfaces toast (Plan 2b code unchanged). |
| Mic permission denied | Hook → `state = "error"`, `errorMessage = "Mic access denied"`. Toast. |
| `room.connect` throws | Hook → `state = "error"`, `errorMessage = "Voice connection failed"`. Toast. |
| Worker dispatch fails (LiveKit server unreachable) | `/voice/room` succeeds because dispatch is fire-and-forget in PotentialBackendLive's pattern, but the worker never joins. Browser is in `listening` with no greeting after ~10s → hook adds a timeout: if no `transcript`/`ai_response`/`agent_speaking` event within 15s, transition to `error` with "Agent unavailable". |
| Worker crashes mid-call | LiveKit fires `Disconnected` on the browser side → hook → `state = "error"`, `errorMessage = "Voice call dropped"`. Toast. |
| `voice-llm` SSE stream errors mid-turn | CustomLLM catches the error, returns a graceful response (`"I encountered an error..."`) — pattern from PotentialBackendLive line 234. Voice continues, call doesn't drop. |
| Network blip during PCM upload | LiveKit SDK handles reconnection automatically (Opus packet loss concealment + automatic re-subscribe). No client-side handling needed. |

## Testing strategy

| Layer | What to test | How |
|---|---|---|
| `useLiveKitVoice` hook | Same 10 cases as Plan 2b, rewritten against `FakeRoom` mock instead of `FakeWebSocket` | Vitest + React Testing Library. The `FakeRoom` exposes the small surface the hook uses (`connect`, `disconnect`, `on`, `localParticipant.enableMicrophone`, `setMicrophoneEnabled`). Tests trigger `DataReceived` events with the wire-format payloads and assert `pushExternalEvent` is called correctly. |
| `useAgentChat.pushExternalEvent` | Plan 2b's 5 cases pass unchanged | No code change to this file. |
| Proxy `/api/agent/:agentKey/voice/room` | 4 cases: 404 unknown agent, 400 missing sessionId, 200 happy relay (no `customWsUrl` assertion), 403 trial-exhausted relay | Vitest + supertest. Drop the `customWsUrl` assertion added during Plan 2b debugging. |
| AgentChat integration (`AgentChatVoiceMode.test.tsx`) | Plan 2b's 3 cases: happy-path, no double-audio, error toast | Replace `FakeWebSocket` setup with `FakeRoom`. Otherwise identical. |
| LiveKit-agent worker | Smoke test: `node --import tsx src/agentServer.ts dev`, run `livekit-cli` dispatch against a local livekit-server with a mock bot. | Deferred — manual smoke for v1; automated test infra for the worker is a separate sprint. |
| Voice-llm SSE endpoint in potentialTS | Vitest + supertest: POST with `{sessionId, userMessage}` returns chunked SSE matching the wire format. Mock `processWithAI` to yield a known stream. | Standard SSE test pattern using `request(app).post(...).buffer().parse(...)`. |

## Acceptance criteria

1. **Talk to Ruby button** in header opens a LiveKit room and dispatches the worker.
2. **No custom WS connection** in DevTools Network panel; only the `/voice/room` HTTP POST + LiveKit server WebSocket(s).
3. **No `pcm-worklet.ts` loaded** in the browser; the file is deleted from the repo.
4. **PCM worklet deleted** from the source tree.
5. **`useLiveKitVoice` hook test count** is at least 10 (the Plan 2b cases ported to new mock).
6. **All Plan 2b acceptance criteria still pass** — auto-speak gate-off during voice, error toast, double-audio prevention, hangup restores button, mid-call typed messaging works.
7. **Ruby's tool cards render in voice** — speaking "show me lipsticks" produces a `display_makeup_products` tool card in the chat scroll, identical to the typed-chat path.
8. **Voice + typed chat share `ChatHistory`** — after a voice exchange, sending a typed message includes the voice turns in the agent's context.
9. **Trial budget decrements** — `BotVoiceAgent.callTimeLeftSeconds` reduces by approximately the call duration after hangup.
10. **`LiveKit-agent` repo runs standalone** — `bun run src/agentServer.ts dev` against a local LiveKit dev server registers as `voice-agent` and accepts dispatches.
11. **`LIVEKIT_AGENT_ENABLED` flag works as a kill switch** — setting it to `false` on potentialTS reverts to the legacy custom-WS path (since we're not deleting the legacy handler in this scope).

## Out of scope (deferred)

- Deleting the legacy `/ws/livekit/...` handler from `potentialTS/src/index.ts` and `livekitAgent.controller.ts`. Stays for SIP/Twilio paths until we audit those.
- Ghost bubble for "user is speaking" interim transcripts. LiveKit `interim_results` works the same way; Plan 2b carried this as deferred and we keep it deferred.
- Recording (call audio archival). PotentialBackendLive has `livekitRecording.controller.ts` for this — we don't port it now.
- Multi-language UI. Deepgram language is configurable per `BotVoiceAgent.stt.language` already.
- Worker auto-restart / health checks beyond what `@livekit/agents` provides.
- Per-user voice subscription enforcement (currently `manualVoiceSubscriptionActive` global).
- Worker repo CI/CD. Push to main + Dokploy auto-deploy is the loop, same as potentialTS today.

## Decision log

| # | Decision | Why |
|---|---|---|
| 1 | Stripper worker in its own repo (`/LiveKit-agent`) | Lets us iterate on voice agent logic without touching potentialTS. Future voice work has a single dedicated home. |
| 2 | HTTP-delegated CustomLLM (worker calls potentialTS `/voice-llm` SSE) | Worker stays under 10 deps. Voice + typed chat share one tool implementation; no drift. Adds one HTTP round-trip per user turn (~50ms LAN, plus SSE streaming latency that already exists in typed chat). TTS plays tokens as they arrive so perceived latency is unchanged. |
| 3 | Rip out legacy custom-WS path eventually, but keep for now | Plan 2b's `/ws/livekit/...` handler also serves SIP/Twilio. Auditing those is out of scope. `LIVEKIT_AGENT_ENABLED=false` reverts cleanly if needed. |
| 4 | Voice and typed chat share `ChatHistory` via `sessionId` | User's voice turn followed by a typed message gets full context. The writes happen inside `AgentController.processWithAI` on potentialTS (the same function the typed `/chat` endpoint uses), so voice and typed turns end up in the same `ChatHistory` document, keyed by sessionId. The worker itself does NOT write to MongoDB for the conversation — it only reads existing history (via `chatHistory.ts`) to seed the LiveKit `voice.ChatContext` and updates `BotVoiceAgent.callTimeLeftSeconds` on shutdown. |
| 5 | One big PR | Cross-repo work is hard to phase. Spec + plan up front; subagent-driven-development executes; single merge. |
| 6 | Hook surface stays identical | Plan 2b's `AgentChat` wiring, `VoiceModeButton`, `VoiceCallBar`, `useAgentChat.pushExternalEvent`, `AutoSpeakToggle` keep working with zero changes. |
| 7 | `useNativeAgent` field in `/voice/room` response | Parity with `PotentialBackendLive`. The browser doesn't branch on it today (we're always native), but it documents intent and gives us a future toggle. |
| 8 | `callId` from worker's `CustomLLM` for tool pairing | Avoids the name-only fallback we added in Plan 2b. Per-call ids work cleanly. |
| 9 | New `voice-llm` SSE endpoint in potentialTS, possibly alias of `/chat` | If the existing `/chat` endpoint already emits the same wire format with the same generator, a 5-line alias suffices. Implementer checks during plan execution. |
| 10 | LiveKit-agent worker repo uses `bun` runtime | PotentialBackendLive's pattern. Faster startup; native TypeScript. Falls back to `node + tsx` if bun isn't available in production. |

## Risk + mitigation

| Risk | Likelihood | Mitigation |
|---|---|---|
| Already-deployed worker uses different agent name than `"voice-agent"` | Medium | User to share deployment screenshot. We can change the dispatch name in `routes/livekit.ts` to match the deployed worker's `agentName`. |
| `livekit-client` browser bundle is too heavy for the chat widget | Low (it's ~150KB gzipped) | Acceptable. Plan 2b already pulled in lucide icons + tools; the addition is in line. |
| Worker can't reach potentialTS `voice-llm` over the network | Low | Worker has internet egress (it reaches Deepgram, ElevenLabs, OpenAI from PotentialBackendLive). Add `POTENTIAL_API_BASE` to worker env; document the value. |
| SSE parsing in CustomLLM is fragile | Medium | Use a small SSE parser. PotentialBackendLive's `AgentController` already produces this shape; we copy the consumer pattern. Test the parser independently. |
| Token streaming → TTS doesn't actually stream (TTS waits for full text) | Low | LiveKit's TTS plugins stream-aware. ElevenLabs supports streaming input. Reference impl works this way. |
| Browser tab in background → mic suspended → no transcripts | Out of scope | Browsers throttle background tabs. Document as a known limitation. |
| User on iOS Safari | Out of scope | LiveKit SDK supports Safari. The Plan 2b code worked on Safari per the manual test plan. We re-test. |

## Estimated effort

- Stripper repo (`LiveKit-agent`): ~3-4 hours including README + .env.example
- `potentialTS` route + voice-llm endpoint: ~2 hours
- Frontend hook rewrite + tests: ~4 hours
- Smoke testing + bugfixes: ~2 hours

Total: ~12 hours of focused work, broken into ~10-12 TDD tasks across the three repos.
