# Ruby Avatar Interface — Design Spec

> **Plan 3 of the original `/demo` vision.** `replit.md` records the page was created with "Chat, Voice, and Avatar interfaces"; Chat (Plan 1, app-grade UX upgrade) and Voice (Plan 2c, LiveKit-native) have shipped. This spec defines the third interface: a lifelike video avatar of Ruby powered by Anam, integrated through the existing LiveKit pipeline.

**Goal:** Add an Avatar mode to Ruby's chat surface where the user sees Ruby's actual face talking to them, with lip-sync, while keeping the same shared session, chat history, and tool-calling pipeline that powers Chat and Voice modes.

**Provider:** [Anam](https://anam.ai/) via the official [`@livekit/agents-plugin-anam`](https://www.npmjs.com/package/@livekit/agents-plugin-anam) package.

**Backend repo of record:** `potentialTS` (the single backend going forward — `PotentialBackendLive` is being retired and is not referenced by this spec).

**What potentialTS already has — we consume this, do not rebuild:**
- `models/avatar.model.ts` — `Avatar` Mongoose model (Anam: `avatarId`, `voiceId`, `language`, `avatarQuality`, `voiceEmotion`, `preview_image_url`, `createdBy` user ref, `active`, `interactions`) — 160 lines
- `controllers/avatar.controller.ts` — full CRUD (902 lines)
- `routes/avatar.ts` — REST endpoints for the CRUD
- `routes/livekit.ts` — existing dispatch endpoint we extend with the `withAvatar` flag
- `routes/dashboard.ts` — has `avatarSpeechToText` (other Anam-specific dashboard endpoints like `getSessionToken` / `getAnamVoices` / `getAnamAvatarsList` aren't yet in potentialTS but are also NOT needed by Plan 3 — they power a dashboard avatar-picker UI that's a separate concern, deferred until that UI is migrated)
- Env vars: `ANAM_API_KEY`, `ANAM_AVATAR_ID` in `.env.example`

**What's NOT yet built — this spec adds:**
- The worker-level LiveKit ↔ Anam plug (`@livekit/agents-plugin-anam`)
- The bot → avatar config link: small `avatar: { avatarId, voiceId }` subdocument on `BotVoiceAgent` (in BOTH `potentialTS/src/models/botVoiceAgent.model.ts` AND `LiveKit-agent/src/models/botVoiceAgent.model.ts` — the worker repo owns its own copy of the model)
- The `withAvatar` flag on `POST /api/livekit/room/create` → propagated through agent-dispatch metadata
- The browser-level avatar render (subscribe to `anam-*` video track, render in `<AvatarView>`)
- The mode-pick modal UX on the demo page

The Anam plugin authenticates inside the worker using `ANAM_API_KEY` directly — no session-token round-trip to potentialTS is required, so `getSessionToken` and other admin endpoints aren't on this critical path.

---

## Why now

`replit.md` records:

> *"October 27, 2025. Created interactive AI Agent Demo page at /demo featuring Ruby with **Chat, Voice, and Avatar interfaces**"*

We've shipped two of the three:

| Interface | Status | Plan |
|---|---|---|
| Chat | ✅ | Plan 1 + app-grade UX (May 14, May 16) |
| Voice | ✅ | Plan 2c — LiveKit-native (May 16) |
| **Avatar** | ❌ | **This spec** |

The avatar interface closes the demo loop: "Type to Ruby → talk to Ruby → see Ruby." It's the screenshot moment — a photorealistic agent looking back at you and answering in real time.

It also stretches the platform story for enterprise buyers: same agent, three modalities. The chat is configurable. The voice is configurable. **Now the avatar is configurable too.** Each downstream brand can pick their own face for their own Ruby.

---

## End-to-end behavior (acceptance summary)

1. Open `/demo`. Header shows a single "Talk to Ruby" button next to the three-dot menu (replacing the current Voice-only button).
2. Click "Talk to Ruby" → small modal pops up with two choices: **Voice only** or **Voice + Avatar**.
3. Pick **Voice + Avatar** → modal closes → LiveKit room mints with `withAvatar: true` metadata → worker spawns an Anam `AvatarSession` alongside the voice session → Ruby's video stream appears in the chat panel (avatar dominates ~65% of panel height, message list shrinks to a scrollable ~35% strip below).
4. Speak — Ruby hears you, thinks (typing-dots in the message strip), and answers in voice. Her mouth moves in lip-sync with the audio. Her face reacts (subtle nods, blinks — Anam handles this).
5. Tool calls work: ask for lipsticks, the `display_makeup_products` card renders in the message strip below the video, Ruby narrates ("Here are three I picked").
6. End-call button in the avatar overlay (top-right) drops back to text-mode Chat. The session id is preserved — message history is intact, the next typed message continues the same conversation.
7. Hard-refresh resets the modal back to Chat mode (sessionId regenerates, history clears — same as today).

---

## Out of scope

Explicitly NOT in this spec (deferred):

- **Typed input during Avatar mode.** In Avatar mode the text input is hidden — Avatar is voice-first. If the user wants to type, they switch to Chat mode. (Adding typed-input → worker via data channel is a clean follow-up but doubles the worker's input surface and isn't needed for the demo story.)
- **Multiple avatar selection.** Ruby has one avatar (from her `BotVoiceAgent` MongoDB record). No UI to switch between avatars in this pass.
- **Avatar provider fallback (HeyGen).** Anam-only for this spec. HeyGen integration on the backend is intact but not exposed to the frontend.
- **Avatar in mobile portrait.** The layout is designed for desktop + tablet landscape. Mobile portrait can render the avatar but the proportions will be cramped — out-of-scope polish, follow-up pass.
- **Persistent avatar across page reloads.** Refresh = back to Chat mode (matches existing sessionId regeneration on reload).
- **Avatar customization UI** (background, framing, voice tuning) — backend supports these but exposing them needs its own design pass.
- **Custom avatar upload by end customers.** Out of scope for the demo.

---

## Architecture

The integration sits at three layers, but each touch is small because the LiveKit + Anam plugin handles the heavy lifting (Anam joins the LiveKit room as a separate participant publishing its own audio + video tracks).

### Layer 1 — LiveKit-agent worker (`/Users/potdev/Documents/GitHub/LiveKit-agent`)

Add `@livekit/agents-plugin-anam` (v1.0.30, matching our other plugin versions).

In `src/voiceAgent.ts`, when the job's room metadata contains `withAvatar: true`:

1. Read the bot's avatar config from the already-loaded `BotVoiceAgent` record (`voiceConfig.avatar.avatarId` + `.voiceId` — see Layer 2 schema change below).
2. Spawn `anam.AvatarSession({ persona_config: anam.PersonaConfig({ avatarId, voiceId }), api_key: process.env.ANAM_API_KEY })` and start it against the same room as the voice session.
3. Anam plugin auto-pipes the worker's existing TTS audio to the avatar — no extra wiring needed for lip-sync. **Hard requirement: TTS sample rate must be 16kHz.** Update the existing ElevenLabs config (`createTTS`) to set `sampleRate: 16000` when avatar is active.

**No changes to the existing voice pipeline.** The agent still does STT → CustomLLM → TTS. The only difference is Anam now subscribes to the TTS output and renders it as video + plays through its own audio track in the room.

The avatar joins as a participant with identity prefix `anam-` (default: `anam-avatar-agent`). The browser's existing `useLiveKitVoice` already subscribes to all remote participants' tracks — extending it to render the video track (instead of just audio-attaching it) is the frontend change in Layer 3.

### Layer 2 — potentialTS backend (`/Users/potdev/Documents/GitHub/potentialTS`) + schema change

**Schema change — `BotVoiceAgent` model gains an `avatar` subdocument.**

The existing `Avatar` model (in potentialTS) stores user-owned avatar configs. Bots need their own avatar pointer — the relationship doesn't exist today. Add a minimal inline subdocument so the worker can read avatar config from the bot's `BotVoiceAgent` record directly, without a second collection lookup.

```ts
// In BotVoiceAgent schema:
avatar: {
  avatarId: { type: String, trim: true },     // Anam UUID
  voiceId:  { type: String, trim: true },     // Anam UUID
},
```

Both fields are optional. When either is missing, the worker treats the bot as not having an avatar configured (falls back to voice-only mode — see Error handling).

**The `Avatar` collection (user-owned library) is untouched.** It continues to power the dashboard's avatar-management UI. Long-term, an admin UI could let users assign an Avatar from their library to a bot (copying or referencing `avatarId` + `voiceId` into `BotVoiceAgent.avatar`). For Plan 3 MVP, Ruby's `BotVoiceAgent.avatar` is populated by a manual DB update before testing.

**Endpoint change — `/api/livekit/room/create` accepts `withAvatar`:**

```ts
interface CreateRoomBody {
  sessionId: string;
  withAvatar?: boolean;   // NEW
}
```

When `withAvatar === true`, the agent-dispatch metadata sent to LiveKit Cloud includes the flag:

```ts
const metadata = JSON.stringify({ botId, sessionId, withAvatar: true });
await agentDispatchClient.createDispatch(roomName, "voice-agent", { metadata });
```

The Express proxy in potentialcom-Replit passes the `withAvatar` field through from the browser unchanged.

**No new endpoints.** The existing Anam-related routes in `/api/dashboard/avatars/*` and `/api/avatars/*` are NOT on this critical path — they power the dashboard avatar-management UI separately.

### Layer 3 — potentialcom-Replit frontend (`/Users/potdev/Documents/GitHub/potentialcom-Replit`)

Four small additions:

1. **`<TalkModePicker>` modal** — opens on "Talk to Ruby" click. Two options:
   - **Voice only** → start a LiveKit room with `withAvatar: false`
   - **Voice + Avatar** → start a LiveKit room with `withAvatar: true`
   Uses the existing shadcn `Dialog` primitive. Compact, two large cards side-by-side. Voice icon vs avatar icon. "Cancel" closes without action.

2. **`<AvatarView videoTrack />`** — renders an Anam video track. Wraps a `<video>` element with `playsInline`, `autoPlay`, `muted={false}` (Anam's audio comes through this track too — see "Audio routing" below). Aspect-ratio container so the video fills its slot without squishing. Loading placeholder: Ruby's static `bot.avatarUrl` PNG faded in until the track attaches.

3. **`useLiveKitVoice` extension** — track an `avatarVideoTrack: RemoteVideoTrack | null` in addition to the existing audio attach logic. On `TrackSubscribed`: if the publishing participant's identity starts with `anam-` AND the track is `Track.Kind.Video`, store the track in state. Expose `avatarVideoTrack` in the hook's return shape.

4. **`AgentChat` layout split** — when `voice.state !== "idle"` AND the call was started with `withAvatar=true`, the chat panel restructures:

   ```
   ┌─ Header ────────────────────────────────────┐
   ├─ [Avatar video, 65% panel height] ─────────┤
   │   [End-call button overlay top-right] ─────┤
   ├─ Messages (compact, scrollable, 35%) ──────┤
   │   You: Show me lipsticks                    │
   │   Ruby: Here are three picks ⤵              │
   │   [DisplayMakeupProductsCard]               │
   └─ (text input hidden — voice-first mode) ───┘
   ```

   When the call ends (End Call), the panel returns to its normal Chat layout with full-height message list + text input. SessionId is preserved.

   When the call was started with `withAvatar=false` (voice-only), the existing VoiceHero dock + full message list layout stays as today.

The header's existing single Voice button (rendered when `voice.state === "idle" || "error"`) is replaced by a single button that opens the `TalkModePicker` modal. Currently labeled "Voice Mode" → relabel to "Talk to Ruby" or similar.

---

## Components — detail

### `<TalkModePicker open onOpenChange onPick />`

**Purpose:** present a binary choice (Voice / Voice+Avatar) before starting a LiveKit room.

**Props:**
- `open: boolean` — controlled-dialog open state
- `onOpenChange: (open: boolean) => void` — dialog close handler
- `onPick: (withAvatar: boolean) => void` — fires when user clicks one of the two cards; parent then mints the room with the chosen flag

**Layout:** shadcn `<Dialog>` content with two `<button>` cards side-by-side (stacked on small screens). Each card:
- Icon (Mic for voice, User-circle or similar for avatar)
- Title ("Voice only" / "Voice + Avatar")
- One-line description ("Talk to Ruby" / "Talk to Ruby and see her face")
- Hover: brand-primary border tint

**Tests:**
- Renders both options when `open=true`
- Each card click calls `onPick` with correct boolean
- Cancel/close calls `onOpenChange(false)` without calling `onPick`

---

### `<AvatarView track avatarUrl agentName />`

**Purpose:** render an Anam video track into the AgentChat layout, with a loading placeholder.

**Props:**
- `track: RemoteVideoTrack | null` — the Anam video track from `useLiveKitVoice`; null while connecting
- `avatarUrl?: string` — fallback static image (Ruby's existing PNG) during the connection delay
- `agentName: string` — used as `<video>` aria-label and `<img>` alt

**Behavior:**
- When `track === null`: render the static `avatarUrl` image with a subtle pulsing overlay and "Connecting…" caption
- When `track` is provided: attach via `track.attach(videoElement)`. Cleanup on unmount via `track.detach()`.
- Container uses aspect-ratio (`aspect-video` or `aspect-[4/5]` — pick what Anam's default output is; verify before final implementation)
- Object-fit: `object-cover` so the video fills the container without letterboxing

**Audio routing:** Anam publishes audio as a track on the same participant. The browser's existing `useLiveKitVoice` already attaches all remote audio tracks via `track.attach()`. The video track here renders silently (the `<video>` element's `muted` attribute is `true`) so we don't double-play audio.

**Tests:**
- Renders the fallback img when `track === null`
- Calls `track.attach()` on the video element when track is provided
- Cleans up via `track.detach()` on unmount

---

### `useLiveKitVoice` extension

**Add to the hook's return shape:**
```ts
interface UseLiveKitVoiceResult {
  // ...existing fields...
  avatarVideoTrack: RemoteVideoTrack | null;  // NEW
}
```

**Add to the `TrackSubscribed` handler:**
```ts
rkRoom.on(RoomEvent.TrackSubscribed, (track, _publication, participant) => {
  if (track.kind === Track.Kind.Audio) {
    try { (track as any).attach?.(); } catch { /* ignore */ }
    return;
  }
  if (track.kind === Track.Kind.Video && participant.identity.startsWith("anam-")) {
    setAvatarVideoTrack(track as RemoteVideoTrack);
  }
});
```

And mirror cleanup on `TrackUnsubscribed`:
```ts
rkRoom.on(RoomEvent.TrackUnsubscribed, (track, _publication, participant) => {
  if (
    track.kind === Track.Kind.Video &&
    participant.identity.startsWith("anam-")
  ) {
    setAvatarVideoTrack(null);
  }
});
```

**Add an optional argument to `start()`** so the parent can request avatar mode:
```ts
start: (opts?: { withAvatar?: boolean }) => Promise<void>;
```

When called with `{ withAvatar: true }`, the room-mint POST body includes `withAvatar: true`.

---

### `AgentChat` integration

**State:**
- Replace the existing single `<VoiceModeButton>` in the header with a `<TalkModePicker>`-trigger button.
- Track `pickerOpen: boolean` for the modal.
- The existing `voice` hook exposes `voice.start({ withAvatar })`; the layout switch is gated on `voice.avatarVideoTrack !== null` (i.e. avatar mode is "active" once we have a video track to show).

**Layout switch (Avatar mode):**
- When `voice.avatarVideoTrack !== null`:
  - Hide the existing `VoiceHero` dock (the avatar replaces it as the visual centerpiece)
  - Render `<AvatarView>` as a fixed 65%-height container above the message list
  - Compact the message list to the remaining 35% (use `flex-1`; the avatar's fixed `aspect-video` constrains its height)
  - Hide the text input (`<AutoGrowTextarea>` doesn't render in this mode)
  - End-call button as an overlay on the top-right corner of the avatar video

- When `voice.state !== "idle"` AND `voice.avatarVideoTrack === null` (voice-only mode):
  - Layout stays exactly as today (VoiceHero dock + full message list + text input)

- When `voice.state === "idle"` (no call):
  - Layout is the normal Chat mode (empty state / messages, text input visible)

**Tool cards in Avatar mode:**
Tool cards render in the compact message list below the video, exactly as they do today. Width is now narrower (chat strip is 35% of panel height, full width), but `CardGrid` already adapts. Verify with a screenshot during smoke test.

---

## Backend changes — detail

### `/api/livekit/room/create` (potentialTS)

Request body adds optional `withAvatar`:

```ts
const { sessionId, withAvatar = false } = req.body;
```

Agent-dispatch metadata propagates the flag:

```ts
const metadata = JSON.stringify({
  botId: bot._id.toString(),
  sessionId,
  withAvatar: !!withAvatar,
});
```

No other endpoint changes. The bot's avatar config is read by the worker from MongoDB.

### Express proxy (`potentialcom-Replit/server/routes/agent.ts`)

`/api/agent/:agentKey/voice/room` already forwards the request body verbatim to potentialTS. Verify it doesn't strip unknown fields — if it does, add `withAvatar` to the allowed forwarded fields.

### `BotVoiceAgent` model — schema change

Add an `avatar` subdocument to the schema:

```ts
const botVoiceAgentSchema = new Schema<IBotVoiceAgent>({
  // ...existing fields...
  avatar: {
    avatarId: { type: String, trim: true },
    voiceId:  { type: String, trim: true },
  },
});
```

Update the `IBotVoiceAgent` TypeScript interface:

```ts
export interface IBotVoiceAgent extends Document {
  // ...existing fields...
  avatar?: {
    avatarId?: string;
    voiceId?: string;
  };
}
```

Both `avatar.avatarId` and `avatar.voiceId` are optional. Bots without them simply can't render an avatar — the worker handles this gracefully (logs a warning + falls back to voice-only).

### `BotVoiceAgent` MongoDB document for Ruby

Pre-flight requirement (after the schema change above lands): manually populate Ruby's `BotVoiceAgent` record with real Anam UUIDs from the Anam dashboard:

```js
{
  // ...existing fields...
  avatar: {
    avatarId: "<Anam avatar UUID>",
    voiceId: "<Anam voice UUID, from GET /api/dashboard/avatars/voices>",
  },
}
```

This step is manual (one-off DB update, not code) — documented as a plan prerequisite, not a code task.

---

## Worker changes — detail

### `LiveKit-agent/package.json`

Add dependency:
```json
"@livekit/agents-plugin-anam": "^1.0.30"
```

### `LiveKit-agent/src/voiceAgent.ts`

Inside the existing `entry` function, after `voiceConfig` is loaded and STT/TTS are created, parse the new metadata flag:

```ts
let withAvatar = false;
try {
  if (ctx.job?.metadata) {
    const metadata = JSON.parse(ctx.job.metadata);
    withAvatar = !!metadata.withAvatar;
  }
} catch (_) { /* default false */ }
```

When `withAvatar === true`:

```ts
if (withAvatar && voiceConfig?.avatar?.avatarId && voiceConfig?.avatar?.voiceId) {
  const anam = await import("@livekit/agents-plugin-anam");
  const avatarSession = new anam.AvatarSession({
    persona_config: new anam.PersonaConfig({
      avatarId: voiceConfig.avatar.avatarId,
      voiceId: voiceConfig.avatar.voiceId,
    }),
    api_key: process.env.ANAM_API_KEY!,
  });
  await avatarSession.start(session, ctx.room);
  console.log("[voiceAgent] Anam avatar session started");
}
```

(API shape per the Node.js plugin reference — verify exact import names + start signature in implementation. The Python equivalent is `anam.AvatarSession(persona_config=..., api_key=...)`; the JS port should mirror this.)

### TTS sample rate fix

Anam requires 16kHz audio. Current ElevenLabs config in `createTTS`:

```ts
return new elevenlabs.TTS({
  apiKey,
  voiceId: voiceId || "21m00Tcm4TlvDq8ikWAM",
  model: model || "eleven_flash_v2_5",
});
```

Add `sampleRate: 16000` when an avatar session is also active. (If ElevenLabs Node.js plugin doesn't expose `sampleRate`, fall back to whichever output rate it defaults to and accept that lip-sync quality may be reduced. Verify in implementation.)

---

## Data flow (end-to-end)

```
[User clicks "Talk to Ruby" in header]
   ↓
[TalkModePicker modal opens]
   ↓
[User clicks "Voice + Avatar"]
   ↓
[Browser POSTs /api/agent/ruby/voice/room { sessionId, withAvatar: true }]
   ↓
[Express proxy forwards to potentialTS /api/livekit/room/create]
   ↓
[potentialTS dispatches voice-agent with metadata: { botId, sessionId, withAvatar: true }]
   ↓
[Browser receives { roomName, token, wsUrl } → useLiveKitVoice connects]
   ↓
[LiveKit-agent worker accepts job → spawns voice.AgentSession (STT/LLM/TTS)]
   ↓
[Worker reads metadata.withAvatar → spawns anam.AvatarSession(persona_config) → joins same room]
   ↓
[Anam publishes audio track + video track on participant "anam-avatar-agent"]
   ↓
[Browser TrackSubscribed event:
   - audio tracks → attach to <audio> (existing)
   - video track from anam-* participant → store as avatarVideoTrack (new)]
   ↓
[AgentChat detects avatarVideoTrack !== null → switches to Avatar layout]
   ↓
[<AvatarView> attaches videoTrack to <video> element → user sees Ruby]
   ↓
[User speaks → LiveKit STT → CustomLLM → potentialTS voice-llm SSE → text reply]
   ↓
[Worker's TTS speaks the reply → Anam plugin pipes audio → avatar lip-syncs]
   ↓
[Tool call events still flow via worker → publishData → browser data channel
   → useAgentChat.pushExternalEvent → MessageBubble + ToolCard render in chat list]
```

---

## Error handling

| Scenario | Behavior |
|---|---|
| `ANAM_API_KEY` not set on worker | Worker logs error, skips avatar session, voice still works. Browser sees no avatar video track → falls back to voice-only layout (existing VoiceHero dock). Toast: "Avatar unavailable — continuing in voice mode." |
| Bot has no `avatar.avatarId` configured | Same as above. Worker checks and falls back to voice-only. |
| Anam returns an error or quota exceeded | Worker catches the error in `avatarSession.start()`, logs it, continues with voice. Browser shows voice-only layout. Same toast as above. |
| Video track drops mid-call (network blip) | `TrackUnsubscribed` clears `avatarVideoTrack`. Layout falls back to voice-only. End-call still works because it's the same LiveKit room. |
| User has no camera (we never USE the user's camera; this is irrelevant) | N/A. Anam is one-way video output. |
| User mutes themselves | Same as voice-only — Anam stops getting input until unmuted. Avatar video continues. |
| Modal closed without picking | Nothing happens, user stays in Chat mode. |
| User clicks "Talk to Ruby" while a call is already active | Modal doesn't open (button is hidden when `voice.state !== "idle" && "error"`, per existing logic). |

---

## Testing strategy

### New unit tests

**`TalkModePicker.test.tsx`**
- Renders two option cards when `open=true`
- "Voice only" click calls `onPick(false)`
- "Voice + Avatar" click calls `onPick(true)`
- Cancel/dialog-close calls `onOpenChange(false)`, does NOT call `onPick`

**`AvatarView.test.tsx`**
- Renders fallback img with `avatarUrl` + `alt={agentName}` when `track === null`
- Calls `track.attach()` on the video element when `track` is provided (mock the track object with a spy)
- Calls `track.detach()` on unmount

**`useLiveKitVoice.test.ts`** (existing test file extension; the `FakeRoom` mock already exists at `client/src/test/livekitFakeRoom.ts`)
- After connect, simulating a `TrackSubscribed` event with a video track from an `anam-*` participant sets `result.current.avatarVideoTrack` to the track
- A video track from a non-`anam-*` participant does NOT populate `avatarVideoTrack`
- `TrackUnsubscribed` for the avatar video track resets it to `null`
- `start({ withAvatar: true })` POSTs the room-mint with `withAvatar: true` in the body

**`AgentChat.test.tsx`** (extend `AgentChatVoiceMode.test.tsx`)
- Clicking "Talk to Ruby" opens the picker (assert dialog visible)
- Picking "Voice only" closes the picker and calls `voice.start({ withAvatar: false })`
- Picking "Voice + Avatar" closes the picker and calls `voice.start({ withAvatar: true })`
- When `avatarVideoTrack` is non-null, layout has the AvatarView present and the text input hidden

### Manual smoke test (T-final)

On localhost or staging:
1. Open `/demo`, click "Talk to Ruby" → see modal
2. Pick "Voice only" → confirm existing voice flow works (VoiceHero dock, scrollable messages, text input visible)
3. End call, click "Talk to Ruby" again → pick "Voice + Avatar" → see Ruby's video appear after ~3-5s
4. Speak: "Show me lipsticks" → Ruby answers in voice with lip-sync; product card renders in the compact message list below the video
5. End call → returns to Chat mode with message history intact
6. Verify session id was preserved by typing a new message that references the avatar conversation ("the lipsticks you showed me")

---

## File map

### NEW

- `client/src/components/agent/voice/TalkModePicker.tsx`
- `client/src/components/agent/voice/TalkModePicker.test.tsx`
- `client/src/components/agent/voice/AvatarView.tsx`
- `client/src/components/agent/voice/AvatarView.test.tsx`

### MODIFIED — `potentialcom-Replit`

- `client/src/components/agent/voice/useLiveKitVoice.ts` — add `avatarVideoTrack` state + `withAvatar` arg to `start()`
- `client/src/components/agent/voice/useLiveKitVoice` tests (new file or extend existing voice test) — coverage per Testing Strategy
- `client/src/components/agent/voice/index.ts` — export `TalkModePicker`, `AvatarView`
- `client/src/components/agent/AgentChat.tsx` — header button → TalkModePicker; layout switch on `avatarVideoTrack`
- `server/routes/agent.ts` (Express proxy) — verify `withAvatar` passes through to potentialTS

### MODIFIED — `potentialTS` (separate repo)

- `src/routes/livekit.ts` — accept `withAvatar` in body; pass through to agent-dispatch metadata

### MODIFIED — `potentialTS` (backend of record)

- `src/models/botVoiceAgent.model.ts` — add `avatar: { avatarId, voiceId }` subdocument to schema + interface
- `src/routes/livekit.ts` — accept `withAvatar` in `POST /api/livekit/room/create` body; pass through to agent-dispatch metadata

### MODIFIED — `LiveKit-agent` (worker)

- `package.json` — add `@livekit/agents-plugin-anam`
- `src/voiceAgent.ts` — parse `withAvatar` from metadata, spawn `AvatarSession` when true (reads `voiceConfig.avatar.avatarId` + `.voiceId` from the existing MongoDB query)
- `src/models/botVoiceAgent.model.ts` — add the `avatar` subdocument to the schema + interface (the worker repo keeps its own copy of the model since it queries MongoDB directly)

### DB pre-flight (manual, not code)

- After the `BotVoiceAgent` schema change lands, update Ruby's record to include `avatar.avatarId` and `avatar.voiceId` (Anam UUIDs obtained from the Anam dashboard)

---

## Risks & decisions

**Risk: Anam SDK API shape may differ from the Python plugin docs.** The Node.js plugin is newer and less documented. Mitigation: verify exact import + constructor signature against the npm package readme / TypeScript definitions before writing the plan. If the API differs materially, this spec may need a small revision.

**Risk: ElevenLabs TTS sample rate.** Anam requires 16kHz. The current ElevenLabs config doesn't explicitly set it. If the Node.js plugin doesn't accept `sampleRate` as a constructor option, lip-sync may be poor. Mitigation: try first with default sample rate; if lip-sync is broken, switch to LiveKit Inference TTS (which the healthcare tutorial uses and is known-good at 16kHz).

**Risk: Layout chaos when chat list compacts.** Existing tool cards (DisplayMakeupProductsCard, SearchShopifyProductsCard) expect a wide chat area. Compacting to 35% of panel height may cause visual issues. Mitigation: smoke test with each card type during the implementation pass; if cards look bad, the implementation plan can add small responsive tweaks to the cards themselves.

**Risk: Browser doesn't auto-play video.** Modern browsers block auto-play of unmuted video without user interaction. Anam's video track may need `muted=true` on the video element with a "tap to unmute" prompt — OR rely on the fact that the user just clicked a button to enter avatar mode (which counts as a user gesture). Mitigation: implement with `autoPlay muted={false}` first; if blocked, add a one-time tap-to-start.

**Decision: text input hidden in Avatar mode.** Avatar mode is voice-first. Allowing typed input would require either (a) routing typed messages through the worker via the data channel, or (b) showing typed messages in chat without the avatar speaking them. Both add complexity without clear demo value. If a user wants to type, switching to Chat mode preserves the session and is one click. Revisit if real usage shows this is a pain point.

**Decision: no avatar-only-without-voice mode.** Avatar always implies voice (the avatar reacts to spoken input, the voice pipeline handles STT/LLM). There's no UI option for "Avatar with text-only input" — that would be a separate, more complex integration.

**Decision: end-call button placement.** Top-right corner of the avatar video as an overlay (with subtle dark gradient background for legibility on any avatar). NOT pinned at the bottom of the message list, because the user's eyes are on the video. Matches Zoom / Meet conventions where end-call is in the video controls overlay.

**Decision: no toast notification on avatar connect.** If the avatar appears successfully, the visible video IS the success signal. Adding "Connected!" toast is noise.

---

## Acceptance criteria (what "done" looks like)

- [ ] `replit.md` chart matches reality: Chat ✅, Voice ✅, **Avatar ✅**.
- [ ] "Talk to Ruby" button in the chat header opens a modal with two choices: Voice-only / Voice+Avatar.
- [ ] Clicking Voice+Avatar mints a LiveKit room with `withAvatar: true`, the worker spawns an Anam AvatarSession, and within ~5 seconds the user sees Ruby's video appear in the chat panel.
- [ ] Speaking triggers Ruby's response in voice, with her lips moving in sync with the audio.
- [ ] Tool calls (e.g., "show me lipsticks") still render their rich cards in the compact message list below the video.
- [ ] Ending the call returns to text Chat mode with full message history preserved (same sessionId).
- [ ] Voice-only mode (without avatar) still works exactly as before — no regressions in the existing VoiceHero dock or message list.
- [ ] All existing 361 tests still pass + new tests for `TalkModePicker`, `AvatarView`, `useLiveKitVoice` avatar-track tracking, and `AgentChat` layout switching.
- [ ] If `ANAM_API_KEY` is missing or Ruby has no `avatar` config, the worker logs an error and the user falls back to voice-only mode without crashing.
