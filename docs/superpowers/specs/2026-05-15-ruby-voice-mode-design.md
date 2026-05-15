# Ruby Real-Time Voice Mode (Phase 2b) — Design

**Date:** 2026-05-15
**Scope:** Phase 2b of Ruby's voice work. Adds a real-time, full-duplex voice mode that runs alongside the existing typed chat. The user clicks "Talk to Ruby," speaks, and Ruby replies in audio — using the same agent, same tools, and same chat history as typed conversations. Plan 2a (asynchronous mic + speaker buttons) is already merged; this builds on top.

## Background

After Plan 1 (streaming chat), Plan 2 (rich tool cards), and Plan 2a (STT/TTS buttons), the natural next step is conversational voice. `potentialTS` already has a full LiveKit-style voice pipeline at `livekitAgent.controller.ts` (~1000 lines, production-ready, with recording, trial-budget gating, and voice-subscription billing). Critically, it reuses the *exact same* chat function (`processWithAIAndTools` uses `ToolCache`, `AgentFunction`, `createToolFromDBFunction`, `BASE_CHATBOT_TOOLS`) as the typed `chatWithBotById` flow. Ruby's 17 bespoke tool cards work in voice mode with zero backend changes.

The backend wire shape:

- `POST /api/voice/room/create` returns `{roomName, token, wsUrl, participantName}` and enforces the bot's voice-trial budget (`BotVoiceAgent.callTimeLeftSeconds`).
- A single WebSocket at `wss://api.potential.com/ws/livekit/{roomName}/{botId}/{sessionId}` carries everything:
  - **Client → Server:** binary frames of 16-bit linear PCM, mono, mic audio → forwarded to Deepgram live STT.
  - **Server → Client:** binary frames of MP3 from ElevenLabs streaming TTS, plus JSON text frames for events:
    - `{type: "transcript", text}` — final user-speech transcription
    - `{type: "aiResponse", text}` — Ruby's textual reply
    - `{type: "tool_call", toolCall: {name, arguments, async}}`
    - `{type: "tool_result", toolResult: {name, result}}`
    - `{type: "audio_start"}` / `{type: "audio_end"}` — TTS playback boundaries
    - `{type: "KeepAlive"}` — heartbeat (ignored client-side)

This spec covers everything in `potentialcom-Replit` (frontend + one proxy route). Zero changes ship in `potentialTS`.

## Decisions

| # | Decision | Choice |
|---|---|---|
| 1 | Scope | Real-time voice mode alongside the typed chat. Plan 2a (mic/speaker buttons) stays in place; both modes coexist. |
| 2 | Display surface | **Coexist** — voice events stream into the same chat history as typed messages. User-speech transcripts render as user `MessageBubble`s; Ruby's voice replies render as agent `MessageBubble`s; tool calls render as bespoke cards in the same scroll. |
| 3 | Entry + call-bar placement | **Top of chat header** — `[📞 Talk to Ruby]` button when idle, sits next to the existing `Auto-speak` toggle. When active, the same slot morphs into a purple call-bar pill with state + controls. |
| 4 | Backend providers | Deepgram (live STT via WebSocket) + ElevenLabs (streaming TTS) — already wired in `potentialTS`. No new vendors. |
| 5 | Reuse vs new abstractions | Reuse `MessageBubble`, `ToolCard`, `rubyToolRegistry`, every bespoke card. Reuse `useToast`, `AgentMessage` / `ToolInvocation` types. New code is voice-specific only. |
| 6 | `useAgentChat` integration | Add a `pushExternalEvent(event)` method on `useAgentChat` that lets `useLiveKitVoice` inject voice events into the same `messages[]` state. Single source of truth for chat history. |
| 7 | Interim transcripts | Server only forwards Deepgram's final results. Client shows a "ghost bubble" (50% opacity, italic) at the bottom of the chat while the user is speaking; the server-side interim work happens but isn't surfaced as a stream. The ghost bubble updates from a local `isUserSpeaking` flag, not from streaming text. (Server may add interim event streaming later — frontend can subscribe then.) |
| 8 | Mute during Ruby's reply | Hide the mute button while Ruby is speaking. Mute means "stop me sending audio" — Ruby's playback is independent. |
| 9 | Reconnect on dropped WS | **No auto-reconnect.** Voice trial budget is at stake; silent reconnect could burn minutes. Toast "Voice call dropped." Collapse to the entry button; user re-initiates. |
| 10 | Typing during a call | Text input stays usable. Typed messages go via the existing `/chat` SSE path (NOT through the voice WS). Spec'd as the simpler behavior; can disable typing during call later if needed. |
| 11 | Backend changes | **Zero changes to `potentialTS`.** One thin Express proxy in this repo. |

## Architecture

### Data flow

```
[1] User clicks "Talk to Ruby":

  Frontend                          Express proxy                  potentialTS
  ────────                          ─────────────                  ───────────
  POST /api/agent/ruby/voice/room ──▶  POST /api/voice/room/create ──▶  gate trial,
                                                                          mint token
                                  ◀──  {roomName, token, wsUrl}      ◀──

[2] Frontend opens WebSocket directly to potentialTS (proxy not in the data path):

  wss://api.potential.com/ws/livekit/{roomName}/{botId}/{sessionId}

[3] Bidirectional traffic over that single WS:

  Client → Server (binary)     16-bit linear PCM mono, 16kHz mic chunks
  Server → Client (binary)     MP3 chunks from streaming TTS
  Server → Client (text/JSON)  transcript, aiResponse, tool_call, tool_result,
                               audio_start, audio_end, KeepAlive
```

### File layout

```
potentialTS/                                          (NO CHANGES)

potentialcom-Replit/
├── server/routes.ts                                  (modify — add /voice/room proxy)
└── client/src/components/agent/
    ├── AgentChat.tsx                                 (modify — header voice entry/bar + wire voice events)
    ├── useAgentChat.ts                               (modify — expose pushExternalEvent)
    └── voice/                                        (existing Plan 2a directory)
        ├── useLiveKitVoice.ts                        NEW — main hook (WS + mic + audio + event dispatch)
        ├── pcm-worklet.ts                            NEW — AudioWorklet processor converting Float32 mic to Int16 PCM
        ├── VoiceModeButton.tsx                       NEW — "Talk to Ruby" entry button (chat header)
        ├── VoiceCallBar.tsx                          NEW — active call-bar pill (chat header when in call)
        └── index.ts                                  (modify — add new exports)
```

### No new runtime dependencies

`WebSocket`, `MediaStream`, `MediaRecorder`, `AudioContext`, `AudioWorklet`, and `HTMLAudioElement` are all standard browser APIs. No new npm packages (no `livekit-client` — the WS is plain).

## Components

### Card prop / shared types (no change)

The existing `AgentMessage` / `ToolInvocation` shapes in `shared/agent.ts` accommodate everything voice mode needs. Voice transcripts become user `AgentMessage`s; voice replies become agent `AgentMessage`s; tool calls become `ToolInvocation`s on the latest agent message.

### `useAgentChat` (modify)

Currently `useAgentChat` returns `{messages, status, send, sendImage}` and consumes the SSE stream from `/chat`. Add an outbound method:

```ts
type ExternalVoiceEvent =
  | { kind: "user-transcript"; text: string }
  | { kind: "agent-response"; text: string }
  | { kind: "tool-call"; name: string; args: unknown; async: boolean; id: string }
  | { kind: "tool-result"; id: string; result: unknown };

interface UseAgentChatResult {
  messages: AgentMessage[];
  status: ChatStatus;
  send: (text: string) => Promise<void>;
  sendImage: (file: File) => Promise<void>;
  pushExternalEvent: (event: ExternalVoiceEvent) => void;  // NEW
}
```

`pushExternalEvent` updates `messages[]` in the same way the SSE stream does:
- `user-transcript` → appends a new user `AgentMessage` with the given text.
- `agent-response` → appends a new agent `AgentMessage` with the given text, `status: "complete"`.
- `tool-call` → either appends a new agent message with one `loading` invocation OR adds the invocation to the last agent message if it's still streaming. The simple rule: always append to the last agent message if it exists and isn't more than ~3s old; otherwise create a new one. Same heuristic as the existing tool-call handling in `parseAgentStream`.
- `tool-result` → finds the invocation by `id` and marks it `status: "complete"` with the parsed result.

The voice hook fires these in event-arrival order. Plan 2a's auto-speak effect continues to fire for `agent-response` events because they look identical to SSE-driven completions.

### `useLiveKitVoice`

```ts
type VoiceState =
  | "idle"
  | "connecting"
  | "listening"     // call open, mic hot, neither side speaking
  | "user-speaking" // we know the user is talking (VAD or interim transcript)
  | "agent-speaking"// audio_start fired, agent_end not yet
  | "ending"
  | "error";

interface UseLiveKitVoiceResult {
  state: VoiceState;
  errorMessage: string | null;
  durationMs: number;
  isMuted: boolean;
  start: () => Promise<void>;
  hangup: () => void;
  toggleMute: () => void;
}

function useLiveKitVoice(
  agentKey: string,
  pushExternalEvent: (event: ExternalVoiceEvent) => void,
): UseLiveKitVoiceResult;
```

Internals:

- **`start()`** —
  1. `fetch('/api/agent/ruby/voice/room', {method: 'POST', body: '{}'})` → `{roomName, sessionId, botId, wsUrl}`. (The proxy strips `token` since the WS in our setup doesn't seem to validate the LiveKit token in the path-based handler. We forward whatever the upstream returns.)
  2. `getUserMedia({audio: {sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true}})`.
  3. Open `new WebSocket(\`${wsUrl}/ws/livekit/${roomName}/${botId}/${sessionId}\`)` (path-based).
  4. On WS `open`: spin up an `AudioContext` at 16kHz, register the PCM worklet, pipe the mic stream through it, and forward Int16 buffers as `ws.send(buffer)`.
  5. Set state to `"listening"`.

- **WS `onmessage`** —
  - If `event.data instanceof Blob` / `ArrayBuffer`: it's MP3 audio. Append to a `MediaSource` or feed an `HTMLAudioElement` via blob URL. (See "Audio playback" below for the precise approach.)
  - If text: `JSON.parse` and dispatch:
    - `transcript` → `pushExternalEvent({kind: "user-transcript", text})` and set state back from `user-speaking` to `listening`.
    - `aiResponse` → `pushExternalEvent({kind: "agent-response", text})`.
    - `tool_call` → `pushExternalEvent({kind: "tool-call", name, args, async, id: <generated>})`. Each tool call gets a deterministic id (`${name}-${JSON.stringify(args)}`).
    - `tool_result` → match by id → `pushExternalEvent({kind: "tool-result", id, result})`.
    - `audio_start` → state = `"agent-speaking"`.
    - `audio_end` → state = `"listening"`.
    - `KeepAlive` → ignore.

- **`hangup()`** — close the WS cleanly, stop the mic tracks, suspend the AudioContext, set state to `"idle"`.

- **`toggleMute()`** — flips a local boolean. While muted, the PCM forwarder skips `ws.send`. The mic stream stays open (re-muting is instant), and no audio data is sent to Deepgram during mute.

- **Unmount cleanup** — same as `hangup()`.

- **Error paths** —
  - `getUserMedia` rejects → state `"error"`, toast (parent handles).
  - WS errors / closes unexpectedly → state `"error"`, toast, no auto-reconnect.

### `pcm-worklet.ts`

An `AudioWorkletProcessor` that converts incoming Float32 samples (range `-1.0` to `1.0`) to Int16 PCM (range `-32768` to `32767`) and posts ArrayBuffers to the main thread via `port.postMessage`. The main thread forwards those buffers to the WebSocket.

Approximate shape:

```ts
class PCMWorkletProcessor extends AudioWorkletProcessor {
  process(inputs: Float32Array[][]) {
    const input = inputs[0]?.[0];
    if (!input) return true;
    const buffer = new ArrayBuffer(input.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    this.port.postMessage(buffer, [buffer]);
    return true;
  }
}
registerProcessor("pcm-worklet", PCMWorkletProcessor);
```

The worklet ships as a separate `.ts` file that gets URL-loaded at runtime via `audioContext.audioWorklet.addModule(workletUrl)`. Vite handles the bundling.

**Sample rate:** the AudioContext is opened at 16kHz so the mic stream natively matches what Deepgram expects (`sample_rate=16000` per the upstream config). No resampling needed.

### Audio playback (server → client TTS)

Two approaches for stitching MP3 chunks into continuous playback:

- **Approach A: MediaSource + SourceBuffer** — append each MP3 chunk to a `MediaSource` attached to an `HTMLAudioElement`. Gapless, low-latency. Standard for streaming audio. Works in Chrome/Edge/Firefox/Safari (Safari has MSE-in-Worker quirks but the basic path works on the main thread).
- **Approach B: Buffer-and-play** — accumulate chunks until `audio_end`, create a blob, set as `audio.src`, play. Higher latency (waits for full response), simpler, no MSE bugs.

**Choice: A (MediaSource).** Lower latency matters more than implementation simplicity here — voice mode is a real-time UX where a 2-3 second delay between "Ruby starts talking" and the user hearing her would feel broken. The fallback is B if MediaSource fails on a given browser.

```ts
const mediaSource = new MediaSource();
const audio = new Audio(URL.createObjectURL(mediaSource));
mediaSource.addEventListener("sourceopen", () => {
  const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
  // queue chunks as they arrive
});
```

### `VoiceModeButton`

```ts
interface VoiceModeButtonProps {
  agentKey: string;
  disabled?: boolean;
  onClick: () => void;
}
```

Renders a small chat-header pill button: `📞 Talk to Ruby`. Hidden when `disabled` (i.e. `bot.audiostt !== true`) or `getUserMedia` is unavailable.

### `VoiceCallBar`

```ts
interface VoiceCallBarProps {
  state: VoiceState;
  durationMs: number;
  isMuted: boolean;
  onMute: () => void;
  onHangup: () => void;
}
```

Renders the in-call pill in the chat header:

- `connecting` → `[⏳ Connecting…]`
- `listening` → `[🟢 Listening · 0:14] [🔇 Mute] [📞 End]`
- `user-speaking` → `[🎙️ You're speaking…] [🔇 Mute] [📞 End]`
- `agent-speaking` → `[🔊 Ruby is speaking…] [📞 End]` (mute hidden)
- `error` → `[⚠️ Call dropped] [📞 Close]`

Themed with the existing `bg-tool-card-accent` / purple gradient for the active states.

### `AgentChat.tsx` integration

```tsx
const tts = useTextToSpeech(agentKey);
const { enabled: autoSpeak } = useAutoSpeak();
const chat = useAgentChat(agentKey);
const voice = useLiveKitVoice(agentKey, chat.pushExternalEvent);

// existing auto-speak effect, image upload, etc.

return (
  <div>
    <header>
      ... existing avatar / name ...
      {voice.state === "idle" ? (
        <VoiceModeButton
          agentKey={agentKey}
          disabled={!bot?.audiostt}
          onClick={voice.start}
        />
      ) : (
        <VoiceCallBar
          state={voice.state}
          durationMs={voice.durationMs}
          isMuted={voice.isMuted}
          onMute={voice.toggleMute}
          onHangup={voice.hangup}
        />
      )}
      {bot?.audiotts && <AutoSpeakToggle />}
    </header>
    ... existing messages map ...
    ... existing input row with MicButton + image attach + text input ...
  </div>
);
```

Voice mode requires **both** `bot.audiostt === true` AND `bot.audiotts === true`. The feature is bidirectional (user STT in, Ruby TTS out), so either flag off means voice mode is unavailable. The Plan 2a flags carry semantic weight: the bot owner can toggle the entire voice surface (mic button, speaker buttons, auto-speak, voice mode) off by clearing `audiotts`.

While a voice call is active (`voice.state !== "idle"` and `voice.state !== "error"`), the **Plan 2a auto-speak effect is gated off**. Otherwise, every `aiResponse` event from voice mode would land in `messages[]` and trigger Plan 2a's auto-speak `/speak` fetch, producing double TTS (the voice WS already streams Ruby's audio).

## Endpoints

### `POST /api/agent/:agentKey/voice/room` (this repo, new proxy)

- Looks up `botId` from `AGENTS[agentKey]`. 404 if unknown.
- Forwards to `${POTENTIAL_API_BASE}/api/voice/room/create` with body `{botId, sessionId}` (sessionId from request body).
- Relays the upstream JSON response verbatim, including non-2xx statuses (trial exhausted → 403 with `{error}` body).

```ts
app.post("/api/agent/:agentKey/voice/room", async (req, res) => {
  const agent = getAgent(req.params.agentKey);
  if (!agent) {
    return res.status(404).json({ message: "Unknown agent" });
  }
  try {
    const upstream = await fetch(
      `${POTENTIAL_API_BASE}/api/voice/room/create`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botId: agent.botId,
          sessionId: req.body?.sessionId,
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
});
```

## UX states (summary)

| State | Header pill | Mic | Audio |
|---|---|---|---|
| `idle` | `📞 Talk to Ruby` (button) | — | — |
| `connecting` | `⏳ Connecting…` | acquiring | — |
| `listening` | `🟢 Listening · 0:14 · [🔇] [📞]` | hot, sending PCM | silent |
| `user-speaking` | `🎙️ You're speaking… · [🔇] [📞]` | hot, sending PCM | silent |
| `agent-speaking` | `🔊 Ruby is speaking… · [📞]` (mute hidden) | hot, sending PCM | playing MP3 chunks |
| `ending` | `⏳ Ending…` | closing | — |
| `error` | `⚠️ Call dropped · [📞 Close]` | — | — |

## Error handling

| Case | Behavior |
|---|---|
| `bot.audiostt !== true` | `VoiceModeButton` not rendered |
| `getUserMedia` unavailable | Button hidden via feature detect |
| Mic permission denied | Toast "Mic access blocked. Enable in your browser's settings." Button stays available. |
| `/voice/room` returns 403 (trial exhausted) | Toast with the upstream `error` message. Button stays available. |
| WS fails to open after token success | Toast "Could not start voice call." Auto-retry once after 1 second; on second failure stay collapsed. |
| WS drops mid-call | Toast "Voice call dropped." No auto-reconnect. Collapse to entry button. |
| `AudioWorklet` unsupported | Fallback to deprecated `ScriptProcessorNode`. If that also fails, abort with toast. |
| MediaSource unsupported / errors | Fallback to buffer-and-play (Approach B). |
| Mic stream errors mid-call (device unplugged, OS revokes) | Toast "Microphone disconnected." End the call. |
| Audio playback fails | Log to console, skip the chunk. Text bubble still renders. |
| Unknown event type from server | Ignore silently (forward-compat). |
| User navigates away mid-call | `useEffect` cleanup closes WS + releases mic. Server cleans up + deducts time. |
| User types in input mid-call | Sends via existing `/chat` SSE. Voice WS untouched. Ruby may respond via text only (since the voice agent isn't aware of typed-side messages mid-call). |
| User clicks "Talk to Ruby" while a typed message is mid-stream | `VoiceModeButton` `disabled={chat.status === "streaming"}`. The user can click again once the agent finishes responding. |

## Testing

### Backend (Express proxy)

`server/routes.agent-voice-room.test.ts`:
1. 404 on unknown agentKey.
2. Happy path: POST forwards `{sessionId}` to `${POTENTIAL_API_BASE}/api/voice/room/create`, response relayed verbatim.
3. 403 trial-exhausted upstream: status + body relayed.

### Frontend unit tests

- `useLiveKitVoice.test.ts` — mock `WebSocket`, `MediaStream`, `AudioContext`, `Audio`. Cover:
  - `start()` → fetch /voice/room → open WS → state transitions `idle → connecting → listening`.
  - Receives `transcript` → `pushExternalEvent({kind: "user-transcript", text})` called.
  - Receives `aiResponse` → `pushExternalEvent({kind: "agent-response", text})` called.
  - Receives `tool_call` then `tool_result` → invocation lifecycle via `pushExternalEvent`.
  - Receives `audio_start` / `audio_end` → state toggles `agent-speaking` / `listening`.
  - Binary frame → fed into MediaSource (mocked).
  - `toggleMute()` flips `isMuted`; while muted, no audio frames are sent.
  - `hangup()` closes WS, stops mic tracks.
  - Unmount cleanup releases resources.
- `VoiceModeButton.test.tsx` — hidden when `disabled`, hidden when `getUserMedia` unavailable, click invokes `onClick`.
- `VoiceCallBar.test.tsx` — correct label/icon for each state, mute hidden during `agent-speaking`, hangup always available.
- `useAgentChat.test.ts` (extend) — `pushExternalEvent({kind: "user-transcript"})` appends a user message; `tool-call` → `tool-result` lifecycle marks the invocation complete on the latest agent message.

### Integration test

Extend `AgentChatVoice.test.tsx`:
- Mount `<AgentChat agentKey="ruby" />` with `audiostt: true` flags.
- Click `VoiceModeButton` → mock fetch returns room → mock WS opens.
- Fake WS sends `transcript` → user MessageBubble appears in chat.
- Fake WS sends `tool_call` for `display_makeup_products` → `loading` ToolCard renders.
- Fake WS sends `tool_result` → bespoke card renders with the result data.
- Click `VoiceCallBar`'s `📞 End` button → WS closes, header returns to `VoiceModeButton`.

### Manual smoke (post-merge)

- Real Chrome on `/demo`:
  1. Click `Talk to Ruby` → mic prompt → grant → header shows `🟢 Listening`.
  2. Say "find me a lipstick" → header shows `🎙️ You're speaking…` while talking, then user message bubble appears.
  3. Header switches to `🔊 Ruby is speaking…` → Ruby's reply text bubble appears, audio plays through speakers, tool card renders mid-reply.
  4. Click mute → audio stops being sent → silence on Ruby's side.
  5. Click End → call ends cleanly, header returns to `Talk to Ruby`, chat history preserved.
- Repeat in Firefox + Safari.

## Out of scope

- **Streaming interim transcripts** as live text — Ruby's server currently only forwards Deepgram finals. We could pass `is_final: false` events through later as a streaming-text effect for the user bubble; deferred.
- **Voice cloning** of a custom Ruby voice — uses the bot's `voiceId` (set by Plan 2a) which defaults to Rachel.
- **Group / multi-party calls** — single user, single agent.
- **Call recording surfaced to the user** — the backend records (`livekitRecording.controller.ts`) but exposing those recordings to the demo user is a future feature.
- **Cross-browser fallback for AudioWorklet** to a polyfill library — we use `ScriptProcessorNode` as a fallback and degrade if neither is available.
- **Multi-language** — Deepgram is forced to English server-side.
- **Background noise gating on the client** — relies on browser-native `noiseSuppression: true`.

## Acceptance criteria

1. New Express proxy route `POST /api/agent/:agentKey/voice/room` exists, forwards to potentialTS, relays response.
2. New `VoiceModeButton` renders in the chat header next to `Auto-speak`, hidden when **`audiostt !== true` OR `audiotts !== true`** or `getUserMedia` is unavailable. Disabled (greyed) while `chat.status === "streaming"`.
3. Clicking the button initiates the full flow: token fetch → mic permission → WS open → state `listening`.
4. New `VoiceCallBar` replaces the entry button while a call is active; renders the correct label/icon for each `VoiceState`.
5. Plan 2a's auto-speak effect is gated off while a voice call is active (prevents double TTS).
6. Voice events flow into the existing chat history via `useAgentChat.pushExternalEvent`:
   - `transcript` → user `MessageBubble`
   - `aiResponse` → agent `MessageBubble` (auto-speak toggle continues to work because these look identical to SSE-driven agent messages)
   - `tool_call` → `ToolInvocation` with `status: "loading"` on the latest agent message
   - `tool_result` → corresponding invocation marked `status: "complete"`
7. Bespoke tool cards render unchanged (no `rubyToolRegistry` modifications).
8. Mute toggle stops sending audio frames; unmute resumes.
9. Hangup cleanly closes the WS + releases mic + collapses the call-bar.
10. All four error-handling branches from the spec table fire toasts via the existing `useToast`.
11. Full test suite passes; `npm run check` clean.
