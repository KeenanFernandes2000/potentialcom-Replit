# Ruby Voice Buttons (STT + TTS) — Design

**Date:** 2026-05-15
**Scope:** Phase 2a of Ruby's voice work. Adds asynchronous voice input and output to the existing chat — a mic button that transcribes spoken audio into the input field, and per-message speak buttons (plus a global auto-speak toggle) that play Ruby's responses as audio. Real-time voice mode (Phase 2b) — continuous bidirectional conversation with interrupts — is deferred to a future brainstorm.

## Background

Ruby's native chat on `/demo` currently supports text input, image upload, and rich tool cards. Voice was always part of the v2 roadmap. potentialTS already has the providers wired:

- `POST /api/agent/chatbot/:id/voice` performs a full round-trip (audio → Deepgram STT → Ruby chat → ElevenLabs TTS → audio out).
- Environment has `DEEPGRAM_API_KEY` and `ELEVENLABS_API_KEY` configured.
- Bot config carries `audiostt?: boolean` and `audiotts?: boolean` flags.
- The chosen ElevenLabs voice ID for Ruby is `pNInz6obpgDQGcFmaJgB` (consistent with the old embed).

The existing combined endpoint isn't quite right for our two-button UX — it transcribes, chats, and speaks in one round-trip. For separate mic and speaker controls, we need each direction as its own thin endpoint so the frontend can compose them.

## Decisions

| # | Decision | Choice |
|---|---|---|
| 1 | Scope | STT + TTS buttons only. Real-time conversational voice (Phase 2b) is deferred. |
| 2 | STT provider | Deepgram `nova-2` via the existing potentialTS integration. |
| 3 | TTS provider | ElevenLabs `eleven_monolingual_v1` with voice `pNInz6obpgDQGcFmaJgB` via the existing potentialTS integration. |
| 4 | Backend shape | Two new dedicated endpoints in potentialTS (`/transcribe`, `/speak`) — thin wrappers around the existing setup. The combined `/voice` endpoint stays for backward compat. |
| 5 | Express proxy pattern | Two new agent-agnostic routes in this repo (`/api/agent/:agentKey/transcribe`, `/api/agent/:agentKey/speak`) mirroring the existing chat/bot/upload proxies. |
| 6 | Mic button UX | Tap-to-toggle with an explicit stop button. No silence detection. Transcript fills the input box; user reviews and hits send manually. |
| 7 | Speaker button UX | Per-Ruby-message speaker icon for on-demand playback + a global "auto-speak" toggle in the chat header. Auto-speak defaults to OFF, persisted in `localStorage`. |
| 8 | Streaming TTS | Not in this phase — server buffers the full audio buffer and returns it as `audio/mpeg`. Streaming can be added as a fast-follow if latency feels poor in real demos. |
| 9 | Feature gating | Bot config flags `audiostt` and `audiotts` (already in the schema) gate the mic button and speaker buttons respectively. The `/bot` proxy endpoint already returns the bot config; the frontend reads the flags from there. |
| 10 | Tool cards in auto-speak | Speak only the text payload of Ruby's response. Tool-call data is silent (we never read structured JSON aloud). |

## Architecture

### Data flow

```
Frontend (this repo)                Express proxy (this repo)              potentialTS (existing)
─────────────────────               ──────────────────────────             ─────────────────────
Mic tap → MediaRecorder       ─→    POST /api/agent/ruby/transcribe  ─→   POST /api/agent/chatbot/<botId>/transcribe
   (start)                            (multer multipart passthrough)         (Deepgram nova-2)
Mic tap again → stop                                                  ←    { text }
   → upload Blob               ←    { text }
   → fill input                [user reviews, hits send]
   → existing /chat flow

Speaker tap on a Ruby message ─→    POST /api/agent/ruby/speak       ─→   POST /api/agent/chatbot/<botId>/speak
   { text }                          (JSON body forward)                   (ElevenLabs voice pNInz6obpgDQGcFmaJgB)
                              ←     audio/mpeg blob                  ←   audio/mpeg
                              [HTMLAudioElement.play()]

Auto-speak (global toggle on) → same /speak call fired automatically when a new Ruby message reaches status === "complete"
```

### File layout

```
potentialTS/                                         (separate repo, 2 new endpoints)
├── src/routes/agent.ts                              (modify — add 2 routes)
└── src/controllers/agent.controller.ts              (modify — add 2 handlers)

potentialcom-Replit/                                 (this repo)
├── server/routes.ts                                 (modify — add 2 proxy routes)
└── client/src/components/agent/
    ├── AgentChat.tsx                                (modify — wire mic + auto-speak toggle)
    ├── MessageBubble.tsx                            (modify — render <SpeakButton> next to Ruby messages)
    └── voice/                                       NEW directory
        ├── useVoiceRecorder.ts                      hook around MediaRecorder API
        ├── useTextToSpeech.ts                       hook around fetch + HTMLAudioElement
        ├── MicButton.tsx                            tap-to-toggle button with state visualizer
        ├── SpeakButton.tsx                          per-message play/stop button
        ├── AutoSpeakToggle.tsx                      global on/off switch + localStorage
        └── index.ts                                 barrel
```

### No new runtime dependencies

`MediaRecorder` and `HTMLAudioElement` are standard browser APIs. No new npm packages are required. potentialTS already depends on `@deepgram/sdk` and uses ElevenLabs via `fetch`.

## Endpoints

### potentialTS (new)

#### `POST /api/agent/chatbot/:id/transcribe`

- Multer middleware accepts an `audio` field (memory storage, same config as existing `/voice` endpoint).
- Body fields: none required.
- If `req.file` is missing → 400.
- If the bot doesn't exist or `audiostt !== true` → 400 with `{ success: false, error: "STT not enabled for this bot" }`.
- Pipes `audioFile.buffer` through `deepgram.listen.prerecorded.transcribeFile` with `{ model: "nova-2", smart_format: true, language: "en" }`.
- Empty transcription returns 200 `{ success: true, text: "" }` so the frontend can show a "no speech detected" toast.
- Successful transcription returns 200 `{ success: true, text: "<transcript>" }`.
- Errors return 500 `{ success: false, error: "Failed to convert speech to text" }`.

#### `POST /api/agent/chatbot/:id/speak`

- Body: `{ text: string }` (JSON). If `text.length > 4000`, the server truncates to the first 4000 chars and logs a console warn (rather than rejecting — keeps the demo functional on long responses).
- If the bot doesn't exist or `audiotts !== true` → 400 with `{ success: false, error: "TTS not enabled for this bot" }`.
- Empty `text` → 400 with `{ success: false, error: "text is required" }`.
- Calls ElevenLabs `text-to-speech/pNInz6obpgDQGcFmaJgB` with `{ model_id: "eleven_monolingual_v1", voice_settings: { stability: 0.5, similarity_boost: 0.5 } }` (matches existing combined endpoint).
- Buffers the response body and returns it as `audio/mpeg` (200).
- Errors return 500 `{ success: false, error: "Failed to convert text to speech" }`.

Both endpoints use the same auth / sessionId convention as the rest of `/api/agent/chatbot/:id/*`.

### potentialcom-Replit (new proxy routes)

Mirroring the existing `/chat`, `/bot`, `/upload` proxies in `server/routes.ts`:

#### `POST /api/agent/:agentKey/transcribe`

- Looks up `botId` from `AGENTS[agentKey]`. 404 if unknown agentKey.
- Forwards the multipart body to `POTENTIAL_API_BASE/api/agent/chatbot/${botId}/transcribe` via `fetch` with `Readable.toWeb(req)` + `duplex: "half"` (same pattern as the image-upload proxy).
- Relays the JSON response and status code.

#### `POST /api/agent/:agentKey/speak`

- Looks up `botId`. 404 if unknown.
- Forwards the JSON body to `POTENTIAL_API_BASE/api/agent/chatbot/${botId}/speak`.
- On success: sets `Content-Type: audio/mpeg`, streams the response body back to the client.
- On error: relays the JSON error response and status code.

## Frontend components

### Card prop / shared types

`shared/agent.ts` gains:

```ts
// Existing AgentBotConfig grows with two flags returned by the /bot proxy.
export interface AgentBotConfig {
  name: string;
  greeting: string;
  avatarUrl: string;
  audiostt: boolean;   // mic button enabled
  audiotts: boolean;   // speaker buttons enabled
}
```

The `/api/agent/:agentKey/bot` proxy adds `audiostt` and `audiotts` to its whitelist (currently `{name, greeting, avatarUrl}`). If the upstream config omits a flag, the proxy defaults it to `false`.

### `useVoiceRecorder`

```ts
type RecorderState = "idle" | "recording" | "uploading" | "error";

interface UseVoiceRecorderResult {
  state: RecorderState;
  durationMs: number;            // ticks while recording
  errorMessage: string | null;
  start(): Promise<void>;        // requests mic + starts MediaRecorder
  stop(): Promise<Blob | null>;  // resolves with audio Blob or null on error
  cancel(): void;                // stops + discards
}

function useVoiceRecorder(): UseVoiceRecorderResult;
```

Internals:
- Uses `navigator.mediaDevices.getUserMedia({ audio: true })`.
- Wraps `MediaRecorder` with `mimeType: "audio/webm;codecs=opus"` (or `"audio/mp4"` on Safari — feature-detect via `MediaRecorder.isTypeSupported`).
- Collects `dataavailable` chunks; on stop, returns a `Blob` of the chunks.
- Releases the `MediaStream` tracks on stop/cancel so the browser's recording indicator goes away.
- Sets `errorMessage` and `state="error"` for permission denied, no track, MediaRecorder errors.
- Returns `null` from `stop()` if no audio was captured (silent recording).
- `durationMs` ticks every 250ms while recording; reset on stop.

### `useTextToSpeech`

```ts
type PlaybackState = "idle" | "loading" | "playing" | "error";

interface UseTextToSpeechResult {
  state: PlaybackState;
  errorMessage: string | null;
  play(text: string): Promise<void>;
  stop(): void;
  isPlayingText(text: string): boolean;
}

function useTextToSpeech(agentKey: string): UseTextToSpeechResult;
```

Internals:
- Maintains a single `HTMLAudioElement` in a ref.
- `play(text)`:
  - If something is currently playing, `stop()` first.
  - POST to `/api/agent/${agentKey}/speak` with `{ text }`. Set state to `"loading"`.
  - On 200, create a Blob URL from the audio response, set as the audio src, `.play()`. Set state to `"playing"`.
  - On error, set state to `"error"` and `errorMessage`.
  - When `ended` fires, revoke the Blob URL and set state to `"idle"`.
- `stop()` pauses the audio, revokes the Blob URL, resets state to `"idle"`.
- `isPlayingText(text)` compares against the most recent `play(text)` call so a `SpeakButton` knows whether it's the active player.

### `MicButton`

```tsx
interface MicButtonProps {
  onTranscript(text: string): void;
  disabled?: boolean;
}

export function MicButton({ onTranscript, disabled }: MicButtonProps);
```

Behavior:
- Uses `useVoiceRecorder`. Tap toggles `start()` / `stop()`.
- On `stop()`, posts the Blob (if non-empty) to `/api/agent/<agentKey>/transcribe` as `multipart/form-data` with field name `audio`.
- On `{ text }` response with non-empty text → calls `onTranscript(text)`.
- On empty text → toast: "No speech detected — try again."
- Visual states match the UX table in the design (idle 🎤, recording pulsing dot + waveform glyph + timer `0:08`, uploading spinner, error red dot).
- Hidden entirely when:
  - `navigator.mediaDevices.getUserMedia` is unsupported, OR
  - `disabled === true` (the parent passes this when `botConfig.audiostt === false`).

`agentKey` is implicit — the button is only used inside `AgentChat`, which already knows its `agentKey`. We pass it via a small `useAgentKey` context (or as a prop to `MicButton`). Decision: prop drilling stays consistent with how `agentKey` flows today.

### `SpeakButton`

```tsx
interface SpeakButtonProps {
  text: string;
  agentKey: string;
}

export function SpeakButton({ text, agentKey }: SpeakButtonProps);
```

Behavior:
- Uses `useTextToSpeech(agentKey)`.
- Icon: `🔊` (idle) → loading spinner → `⏹` (playing) → red dot (error, briefly, then idle).
- Click while idle → `play(text)`.
- Click while playing → `stop()`.
- Hidden when:
  - `botConfig.audiotts === false`, OR
  - `text` is empty / whitespace-only.

`MessageBubble.tsx` renders `<SpeakButton text={message.text} agentKey={agentKey} />` inline next to the message timestamp on Ruby (agent-role) bubbles only, when the message status is `"complete"` and `text` is non-empty.

### `AutoSpeakToggle`

```tsx
interface AutoSpeakToggleProps {
  onChange?(enabled: boolean): void;
}

export function AutoSpeakToggle({ onChange }: AutoSpeakToggleProps);
```

Behavior:
- Reads initial value from `localStorage["ruby:autoSpeak"]` (default `false`).
- Small toggle switch in the chat header area, label "Auto-speak".
- On change, writes to `localStorage` and calls `onChange?.(next)`.
- Hidden when `botConfig.audiotts === false`.

### `AgentChat.tsx` integration

- Adds a `MicButton` next to the existing image-attach button (so the input row becomes: 📎 image / 🎤 mic / text input / ➤ send).
- Renders `<AutoSpeakToggle>` in the chat header (top-right, near the avatar).
- Reads `autoSpeak` from `localStorage` on mount; subscribes to changes via the `AutoSpeakToggle`'s `onChange` callback (alternatively, a tiny custom hook `useAutoSpeak()` that reads/writes localStorage with a state mirror).
- When a message transitions from `streaming` → `complete` AND it's an agent message AND `autoSpeak` is on AND `text` is non-empty → call `playFromAgentMessage(text)` (the same `useTextToSpeech` hook instance the `SpeakButton`s use).
- The "stop previous on new message" rule is automatic — `useTextToSpeech.play()` already stops any in-flight playback before starting the next one.
- Wires `MicButton`'s `onTranscript` callback to fill the input box (`setInput(text)`). Does NOT auto-send — user reviews and hits the existing send button.

## Error handling

| Case | Behavior |
|---|---|
| Mic permission denied | Toast: "Mic access blocked. Enable in your browser's site settings." Mic button shows red dot for ~3s, then returns to idle. |
| `getUserMedia` unavailable (insecure context, unsupported browser) | Mic button is feature-detected and hidden entirely. |
| MediaRecorder produces an empty audio blob (silent recording) | Skip the upload. Toast: "No speech detected — try again." |
| `/transcribe` returns empty `text` | Same as silent recording — toast + no input change. |
| `/transcribe` HTTP error (4xx/5xx) | Toast: "Could not transcribe — try again." Mic button returns to idle. |
| `/speak` HTTP error | Speaker icon flashes red briefly. Auto-speak toggle stays on; the next message tries again. |
| `botConfig.audiostt === false` | `MicButton` not rendered. |
| `botConfig.audiotts === false` | `SpeakButton` and `AutoSpeakToggle` not rendered. |
| Mic clicked while auto-speak is playing | Auto-speak playback stops; mic recording starts. |
| User reloads while audio is playing | Browser cleans up the `HTMLAudioElement` and the Blob URL. No persistent state. |
| Same `SpeakButton` clicked twice rapidly | First click loads + plays; second click stops. Idempotent. |
| Two `SpeakButton`s clicked in sequence | Second click stops the first's playback before starting its own. The shared `useTextToSpeech` instance enforces this. |

## Testing

### Backend (potentialTS)

The implementation plan that follows this spec is **cross-repo**: it adds the two new endpoints to potentialTS and the proxy + frontend wiring to this repo. potentialTS-side tests will mirror its existing controller-level tests (mocking Deepgram / ElevenLabs clients and asserting routing, body shape, and gating-flag behavior). The spec doesn't prescribe a test framework for potentialTS — it follows whatever convention that repo already uses.

### Backend proxy (this repo)

- `server/routes.agent-transcribe.test.ts` — `vi.mock("fetch")`, supertest the new proxy route, assert:
  - 404 on unknown `agentKey`
  - Multipart body is forwarded to `${POTENTIAL_API_BASE}/api/agent/chatbot/<botId>/transcribe` with the right botId and headers
  - JSON response is relayed verbatim
  - 4xx/5xx upstream errors propagate
- `server/routes.agent-speak.test.ts` — same pattern, assert:
  - JSON `{ text }` body is forwarded
  - On success, `Content-Type: audio/mpeg` is set and the audio bytes are streamed back
  - On error, the JSON error response is relayed with the right status

### Frontend unit (this repo, Vitest + RTL)

One file per new component / hook:

- `useVoiceRecorder.test.ts` — mocks `navigator.mediaDevices.getUserMedia` and `MediaRecorder`; verifies state transitions, blob output on stop, error state on permission denied, mediaStream cleanup.
- `useTextToSpeech.test.ts` — mocks `fetch` and `HTMLAudioElement`; verifies POST body, play/stop transitions, stop-previous-on-new-play, end-of-playback cleanup, error state on HTTP failure.
- `MicButton.test.tsx` — verifies idle / recording / uploading / error visual states, onTranscript wiring, hidden when `disabled`.
- `SpeakButton.test.tsx` — verifies idle / loading / playing visual states, play and stop wiring, hidden when text is empty.
- `AutoSpeakToggle.test.tsx` — verifies initial value from `localStorage`, persistence on change, onChange callback.

### Integration (this repo)

Extend `AgentChat.test.tsx` (or add a focused `voice/AgentChatVoice.test.tsx`) with:
- Mic happy path: click mic → mock MediaRecorder produces blob → click stop → mock `/transcribe` returns text → assert input field is populated with that text.
- Speaker happy path: render an agent message with text, click the `SpeakButton` → mock `/speak` returns an audio blob → assert audio is in `"playing"` state.
- Auto-speak path: enable `AutoSpeakToggle` → mock an agent message arriving with `status="complete"` → assert `/speak` was called with that text.
- Stop-previous: trigger two consecutive `play` calls → assert first audio is stopped before second begins.

### Manual smoke (post-merge)

- Real Chrome, Firefox, Safari (desktop + iOS Safari).
- Real Ruby bot.
- For each browser:
  - Open `/demo`, click mic, say "find me a lipstick", click stop, see transcript appear, hit send, hear Ruby's response start playing (if auto-speak on) or click a speaker icon and hear it.
  - Toggle auto-speak off and on between messages; verify behavior.
  - Toggle theme between light and dark; verify mic / speaker icons match the chat theme.

## Out of scope

- **Streaming TTS** — server buffers the full ElevenLabs response and returns it as one `audio/mpeg` body. Streaming via ElevenLabs WebSocket is a fast-follow if real-world latency on long responses feels poor.
- **Voice mode (Phase 2b)** — real-time bidirectional conversation with interrupts. Separate brainstorm.
- **Voice cloning / multiple voices** — Ruby uses a single fixed voice ID; per-agent voice selection is a future feature.
- **Language detection** — Deepgram is forced to English. Multi-lingual STT is a future feature.
- **Mobile keyboard behavior tweaks** — the mic button works on mobile but the existing chat layout already handles soft-keyboard positioning; no changes there.
- **Audio download / sharing** — speaker button plays only; no save-to-disk affordance.

## Acceptance criteria

1. Two new endpoints exist in potentialTS (`/transcribe`, `/speak`) and are gated by the bot's `audiostt` / `audiotts` flags.
2. Two new Express proxy routes exist in this repo (`/api/agent/:agentKey/transcribe`, `/api/agent/:agentKey/speak`) mirroring the existing proxy pattern.
3. `/api/agent/:agentKey/bot` returns `audiostt` and `audiotts` in its response.
4. A new `MicButton` is rendered to the left of the text input in `AgentChat`, hidden when `audiostt === false` or `getUserMedia` is unavailable.
5. A new `SpeakButton` is rendered next to each completed agent message in `MessageBubble`, hidden when `audiotts === false` or the message text is empty.
6. A new `AutoSpeakToggle` is rendered in the chat header, hidden when `audiotts === false`, default off, value persisted in `localStorage`.
7. Tapping the mic toggles recording; tapping again uploads the audio and fills the input field with the transcript.
8. Tapping a speaker icon plays Ruby's message; tapping it again stops playback; tapping another while one is playing stops the first.
9. With auto-speak on, every newly-completed agent message with non-empty text auto-plays.
10. All unit tests, integration tests, and `npm run check` pass.
