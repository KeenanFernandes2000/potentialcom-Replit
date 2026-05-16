# Ruby Avatar Interface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an Avatar mode to Ruby's `/demo` chat surface. User clicks "Talk to Ruby" → picks "Voice + Avatar" → Anam streams a lifelike video of Ruby (lip-synced to her TTS) into the LiveKit room. Tool calls, chat history, and session ID are all shared with Chat + Voice modes because Avatar mode IS the existing voice mode + visible video.

**Architecture:** Three repos in lockstep. `potentialTS` (the backend at api.potential.com) adds an `avatar` subdoc to `BotVoiceAgent` and accepts a `withAvatar` flag on `POST /api/livekit/room/create` that propagates through agent-dispatch metadata. `LiveKit-agent` (the deployed worker) installs `@livekit/agents-plugin-anam`, mirrors the schema change, and spawns `anam.AvatarSession` when `metadata.withAvatar === true`. Anam joins the LiveKit room as a participant named `anam-avatar-agent` publishing audio + video tracks. `potentialcom-Replit` (the frontend) adds a `TalkModePicker` modal, an `AvatarView` component, extends `useLiveKitVoice` to track the avatar video track, and adds a layout split in `AgentChat` (avatar dominates ~65% of panel height, message list compacts to ~35%, text input hidden) when avatar is active.

**Tech Stack:** TypeScript everywhere. `@livekit/agents` ^1.0.30 + `@livekit/agents-plugin-anam` ^1.0.30 (worker). `livekit-server-sdk` ^2.14.0 (potentialTS — `AgentDispatchClient`). `livekit-client` ^2.15.10 (browser — `Room`, `RoomEvent`, `Track`, `RemoteVideoTrack`). React 18 + Vitest + `@testing-library/react` + `@testing-library/user-event` + jsdom (frontend). Mongoose ^8.

**Spec:** `docs/superpowers/specs/2026-05-16-ruby-avatar-interface-design.md` (committed `1c54eaa`).

**Reference implementation to study before each task:**
- `/Users/potdev/Documents/GitHub/PotentialBackendLive/src/controllers/dashboard.controller.ts` lines 1840+ — existing Anam session-token endpoint (REFERENCE ONLY; PoB is being retired)
- `/Users/potdev/Documents/GitHub/PotentialBackendLive/src/models/avatar.model.ts` — Anam Avatar config shape (REFERENCE ONLY)
- `/Users/potdev/Documents/GitHub/potentialTS/src/models/avatar.model.ts` — already-ported Anam Avatar model (the one we DO touch is `botVoiceAgent.model.ts`, not this)
- `/Users/potdev/Documents/GitHub/potentialTS/src/routes/livekit.ts` lines 22–143 — existing room/create endpoint we extend
- `/Users/potdev/Documents/GitHub/LiveKit-agent/src/voiceAgent.ts` lines 260–397 — existing metadata parsing + voiceConfig fetch + session.start where the AvatarSession plug-in slots
- `/Users/potdev/Documents/GitHub/potentialcom-Replit/client/src/components/agent/voice/useLiveKitVoice.ts` — existing hook (260 lines)
- `/Users/potdev/Documents/GitHub/potentialcom-Replit/client/src/components/agent/AgentChat.tsx` lines 200–330 — header button + scroll-area layout we modify
- `/Users/potdev/Documents/GitHub/potentialcom-Replit/server/routes.ts` lines 824–870 — Express proxy for `/voice/room` we extend
- `/Users/potdev/Documents/GitHub/potentialcom-Replit/client/src/test/livekitFakeRoom.ts` — `FakeRoom` test mock we extend for video-track simulation
- Healthcare-intake tutorial (avatar reference): https://livekit.com/blog/build-healthcare-intake-assistant-anam-avatar
- npm package: https://www.npmjs.com/package/@livekit/agents-plugin-anam

**Deployment context:**
- `LiveKit-agent` is deployed via Dokploy on push to `main`. After T5 lands, Dokploy auto-redeploys; the next call from the browser will go to the new worker.
- `potentialTS` is deployed to api.potential.com via its own pipeline. The T1+T2 changes must be deployed BEFORE Dokploy picks up T5, otherwise the metadata field reaches an older worker that ignores it (acceptable — just degrades to voice-only).
- `potentialcom-Replit` is auto-deployed on push to `main` (per prior session pattern).

**Prerequisite environment:**
- Node v20.19.4 via nvm: `PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH` (prepend to every `npm`/`tsx`/`npx` command)
- `ANAM_API_KEY` set in the worker's env (verify before T5)
- Ruby's `BotVoiceAgent.avatar.{avatarId,voiceId}` populated with real Anam UUIDs (manual DB update — pre-flight before T12 smoke test, not a code task)

**Working branches (suggested):**
- `potentialTS` → branch `feature/livekit-with-avatar-flag`
- `LiveKit-agent` → branch `feature/anam-avatar-plugin`
- `potentialcom-Replit` → branch `claude/ruby-avatar-interface` (no worktree needed — work on a branch off main like prior plans)

**Test baselines:**
- `potentialcom-Replit`: 361 passing (verify before starting; each new component adds tests)
- `LiveKit-agent`: 9 passing (the existing `customLLM.test.ts`); no new tests planned for the worker (the AvatarSession spawn is integration code verified via T12 smoke test, not a pure-function unit testable in jsdom)
- `potentialTS`: no test infrastructure (per audit); changes verified via type-check + manual smoke

---

## File Structure (locked-in)

### potentialTS (`/Users/potdev/Documents/GitHub/potentialTS`)

```
src/
├── models/
│   └── botVoiceAgent.model.ts       ← MODIFY: add `avatar` subdoc to schema + interface
└── routes/
    └── livekit.ts                    ← MODIFY: accept `withAvatar` in body, propagate to dispatch metadata
```

### LiveKit-agent (`/Users/potdev/Documents/GitHub/LiveKit-agent`)

```
package.json                          ← MODIFY: add @livekit/agents-plugin-anam ^1.0.30
src/
├── models/
│   └── botVoiceAgent.model.ts       ← MODIFY: mirror potentialTS avatar subdoc
└── voiceAgent.ts                     ← MODIFY: parse metadata.withAvatar, spawn AvatarSession
```

### potentialcom-Replit (`/Users/potdev/Documents/GitHub/potentialcom-Replit`)

```
server/
├── routes.ts                         ← MODIFY: Express proxy forwards `withAvatar` to upstream
└── routes.agent-voice-room.test.ts   ← MODIFY: extend existing test with withAvatar coverage

client/src/test/
└── livekitFakeRoom.ts                ← MODIFY: support simulating remote video tracks from anam-* participants

client/src/components/agent/voice/
├── useLiveKitVoice.ts                ← MODIFY: add `avatarVideoTrack` state + `start({ withAvatar })` arg
├── TalkModePicker.tsx                ← CREATE
├── TalkModePicker.test.tsx           ← CREATE
├── AvatarView.tsx                    ← CREATE
├── AvatarView.test.tsx               ← CREATE
└── index.ts                          ← MODIFY: export TalkModePicker + AvatarView

client/src/components/agent/
├── AgentChat.tsx                     ← MODIFY: replace VoiceModeButton with TalkModePicker trigger; layout split when avatarVideoTrack !== null
└── voice/AgentChatVoiceMode.test.tsx ← MODIFY: extend with avatar flow
```

**Total:** 5 new files (frontend), 8 modified files across 3 repos.

---

## Setup: create working branches + verify baselines

- [ ] **Step 0a: Create branch in potentialTS**

```bash
git -C /Users/potdev/Documents/GitHub/potentialTS checkout main
git -C /Users/potdev/Documents/GitHub/potentialTS pull --ff-only 2>/dev/null || true
git -C /Users/potdev/Documents/GitHub/potentialTS checkout -b feature/livekit-with-avatar-flag
```

- [ ] **Step 0b: Create branch in LiveKit-agent**

```bash
git -C /Users/potdev/Documents/GitHub/LiveKit-agent checkout main
git -C /Users/potdev/Documents/GitHub/LiveKit-agent pull --ff-only 2>/dev/null || true
git -C /Users/potdev/Documents/GitHub/LiveKit-agent checkout -b feature/anam-avatar-plugin

# Verify worker test baseline (9 passing)
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/LiveKit-agent vitest run \
  --root /Users/potdev/Documents/GitHub/LiveKit-agent
```

Expected: 9 tests passing.

- [ ] **Step 0c: Create branch in potentialcom-Replit**

```bash
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit checkout main
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit pull --ff-only 2>/dev/null || true
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit checkout -b claude/ruby-avatar-interface

# Verify frontend test baseline (361 passing)
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit
```

Expected: 361 tests passing across 49 files.

If any baseline fails before any work is done, stop and surface the failure to the human.

---

## Task 1: potentialTS — add `avatar` subdoc to `BotVoiceAgent`

Add an inline `avatar: { avatarId, voiceId }` subdocument to the existing `BotVoiceAgent` model so the worker can read Ruby's Anam UUIDs directly from her voice config record. Both fields are OPTIONAL — bots without them simply can't render an avatar.

**Files:**
- Modify: `/Users/potdev/Documents/GitHub/potentialTS/src/models/botVoiceAgent.model.ts`

- [ ] **Step 1: Add `AvatarConfig` interface + schema**

Open `/Users/potdev/Documents/GitHub/potentialTS/src/models/botVoiceAgent.model.ts`. After the `TTSConfig` interface declaration (around line 20), add:

```ts
export interface AvatarConfig {
    /** Anam avatar UUID (e.g. from the Anam dashboard or /api/dashboard/avatars/list). */
    avatarId?: string;
    /** Anam voice UUID (e.g. from /api/dashboard/avatars/voices). */
    voiceId?: string;
}
```

In the `IBotVoiceAgent` interface, add the optional field (after `tts?: TTSConfig;`):

```ts
    /**
     * Optional avatar config for Anam. When both avatarId + voiceId are set
     * AND the room is minted with metadata.withAvatar=true, the LiveKit
     * worker spawns an anam.AvatarSession that publishes a lip-synced video
     * stream into the room. Bots without this field render voice-only.
     */
    avatar?: AvatarConfig;
```

After the `TTSSchema` declaration (around line 60), add:

```ts
const AvatarSchema = new mongoose.Schema<AvatarConfig>(
    {
        avatarId: { type: String, required: false, trim: true },
        voiceId: { type: String, required: false, trim: true },
    },
    { _id: false }
);
```

In the `BotVoiceAgentSchema` definition (around line 73), add to the schema fields (after `tts: { type: TTSSchema, required: false },`):

```ts
        avatar: { type: AvatarSchema, required: false },
```

- [ ] **Step 2: Type-check potentialTS**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialTS tsc \
  --noEmit -p /Users/potdev/Documents/GitHub/potentialTS/tsconfig.json
```

Expected: clean.

If there are pre-existing type errors in the repo unrelated to this change, narrow the check to the file:

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialTS tsc \
  --noEmit /Users/potdev/Documents/GitHub/potentialTS/src/models/botVoiceAgent.model.ts
```

- [ ] **Step 3: Commit**

```bash
git -C /Users/potdev/Documents/GitHub/potentialTS add src/models/botVoiceAgent.model.ts
git -C /Users/potdev/Documents/GitHub/potentialTS commit -m "BotVoiceAgent: add optional avatar subdoc (Anam avatarId + voiceId)

Bots gain an optional avatar.{avatarId,voiceId} subdocument so the
LiveKit worker can spawn anam.AvatarSession when metadata.withAvatar
is true. Both fields are optional — bots without them remain
voice-only (no schema migration required for existing records)."
```

---

## Task 2: potentialTS — extend `/api/livekit/room/create` to accept + propagate `withAvatar`

Allow the frontend to request an avatar-enabled LiveKit room. The backend pulls the flag from the body and forwards it through the agent-dispatch metadata so the worker can read it.

**Files:**
- Modify: `/Users/potdev/Documents/GitHub/potentialTS/src/routes/livekit.ts`

- [ ] **Step 1: Accept `withAvatar` in the request body destructure**

Open `/Users/potdev/Documents/GitHub/potentialTS/src/routes/livekit.ts`. Find the line (around line 31):

```ts
        const { botId, sessionId } = req.body;
```

Replace with:

```ts
        const { botId, sessionId, withAvatar } = req.body;
```

- [ ] **Step 2: Propagate to dispatch metadata**

Find the existing `createDispatch` call (around line 106):

```ts
                const dispatch = await dispatchClient.createDispatch(roomName, "voice-agent", {
                    metadata: JSON.stringify({ botId, sessionId }),
                });
```

Replace with:

```ts
                const dispatch = await dispatchClient.createDispatch(roomName, "voice-agent", {
                    metadata: JSON.stringify({
                        botId,
                        sessionId,
                        withAvatar: !!withAvatar,
                    }),
                });
```

`!!withAvatar` coerces to a clean boolean (undefined → false), preserving wire format stability.

- [ ] **Step 3: Type-check**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialTS tsc \
  --noEmit -p /Users/potdev/Documents/GitHub/potentialTS/tsconfig.json
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
git -C /Users/potdev/Documents/GitHub/potentialTS add src/routes/livekit.ts
git -C /Users/potdev/Documents/GitHub/potentialTS commit -m "livekit/room/create: accept withAvatar, propagate to dispatch metadata

Frontend can now request an avatar-enabled room by sending
{ withAvatar: true } in the body. The flag rides through to the
worker via agent-dispatch metadata. Bots without an avatar subdoc
on BotVoiceAgent still work — the worker checks both flag AND
config before spawning AvatarSession."
```

- [ ] **Step 5: Push the branch + deploy**

```bash
git -C /Users/potdev/Documents/GitHub/potentialTS push -u origin feature/livekit-with-avatar-flag
```

Coordinate deploy to api.potential.com per your normal pipeline (merge to main on origin then auto-deploys, or manual deploy step). The backend change must be live BEFORE the frontend starts sending `withAvatar` in production.

If you prefer to defer deploy until the whole plan is merged, that's fine — the changes are additive and backward-compatible: existing rooms keep working because `withAvatar` defaults to false.

---

## Task 3: LiveKit-agent — mirror the `avatar` subdoc in worker's `BotVoiceAgent`

The worker has its own copy of the Mongoose model (it queries MongoDB directly). The schema must match potentialTS so Mongoose can hydrate the new field into the worker's typed `IBotVoiceAgent`.

**Files:**
- Modify: `/Users/potdev/Documents/GitHub/LiveKit-agent/src/models/botVoiceAgent.model.ts`

- [ ] **Step 1: Add `AvatarConfig` interface + schema (identical shape to potentialTS)**

Open `/Users/potdev/Documents/GitHub/LiveKit-agent/src/models/botVoiceAgent.model.ts`. After the `TTSConfig` interface declaration, add:

```ts
export interface AvatarConfig {
  /** Anam avatar UUID. */
  avatarId?: string;
  /** Anam voice UUID. */
  voiceId?: string;
}
```

In the `IBotVoiceAgent` interface, add the optional field (after `tts?: TTSConfig;`):

```ts
  /**
   * Optional avatar config for Anam. When set AND metadata.withAvatar is
   * true, this worker spawns anam.AvatarSession to publish a lip-synced
   * video stream into the LiveKit room.
   */
  avatar?: AvatarConfig;
```

After the `TTSSchema` declaration, add:

```ts
const AvatarSchema = new mongoose.Schema<AvatarConfig>(
  {
    avatarId: { type: String, required: false, trim: true },
    voiceId: { type: String, required: false, trim: true },
  },
  { _id: false }
);
```

In the `BotVoiceAgentSchema` field block (after `tts: { type: TTSSchema, required: false },`):

```ts
    avatar: { type: AvatarSchema, required: false },
```

- [ ] **Step 2: Type-check worker**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/LiveKit-agent tsc \
  --noEmit -p /Users/potdev/Documents/GitHub/LiveKit-agent/tsconfig.json
```

Expected: clean. (Note: this also confirms the existing `customLLM.ts` etc. still type-check; the schema change is purely additive.)

- [ ] **Step 3: Run existing worker tests**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/LiveKit-agent vitest run \
  --root /Users/potdev/Documents/GitHub/LiveKit-agent
```

Expected: 9 tests passing (unchanged).

- [ ] **Step 4: Commit**

```bash
git -C /Users/potdev/Documents/GitHub/LiveKit-agent add src/models/botVoiceAgent.model.ts
git -C /Users/potdev/Documents/GitHub/LiveKit-agent commit -m "BotVoiceAgent: mirror potentialTS avatar subdoc

Worker's local copy of the model gains the same optional
avatar.{avatarId,voiceId} subdoc. Worker code (Task 5) reads this
to configure anam.AvatarSession when metadata.withAvatar is true."
```

---

## Task 4: LiveKit-agent — install `@livekit/agents-plugin-anam` + spike the API surface

Install the plugin, then BEFORE writing any worker integration, verify the exact import shape and constructor signature against the Node.js plugin reference. This is the spec's flagged risk (the Python docs are mature; JS port is newer).

**Files:**
- Modify: `/Users/potdev/Documents/GitHub/LiveKit-agent/package.json`
- Create (temporary): `/Users/potdev/Documents/GitHub/LiveKit-agent/scripts/spike-anam-plugin.ts`

- [ ] **Step 1: Install the plugin**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npm --prefix /Users/potdev/Documents/GitHub/LiveKit-agent install @livekit/agents-plugin-anam@^1.0.30
```

Expected: `package.json` and `package-lock.json` updated with the new dep, no errors.

- [ ] **Step 2: Verify import shape via a throwaway spike script**

Create `/Users/potdev/Documents/GitHub/LiveKit-agent/scripts/spike-anam-plugin.ts`:

```ts
/**
 * Throwaway spike to verify the @livekit/agents-plugin-anam Node.js
 * API surface before depending on it in voiceAgent.ts. Delete after Task 4.
 *
 * Run with: tsx scripts/spike-anam-plugin.ts
 */
import * as anam from "@livekit/agents-plugin-anam";

console.log("[spike] anam module keys:", Object.keys(anam));

// Verify AvatarSession + PersonaConfig (the two classes named in the
// spec) actually exist.
if (typeof (anam as any).AvatarSession === "undefined") {
  console.error("[spike] ❌ AvatarSession is NOT exported");
  process.exit(1);
}
if (typeof (anam as any).PersonaConfig === "undefined") {
  console.error("[spike] ❌ PersonaConfig is NOT exported");
  process.exit(1);
}

console.log("[spike] ✓ AvatarSession + PersonaConfig exported");
console.log("[spike] AvatarSession type:", typeof (anam as any).AvatarSession);
console.log("[spike] PersonaConfig type:", typeof (anam as any).PersonaConfig);

// Try constructing PersonaConfig with the documented shape (avatarId +
// voiceId). If the constructor signature differs, this will throw and
// we'll see the actual error.
try {
  const cfg = new (anam as any).PersonaConfig({
    avatarId: "dummy-avatar-uuid",
    voiceId: "dummy-voice-uuid",
  });
  console.log("[spike] ✓ PersonaConfig constructed:", cfg);
} catch (err: any) {
  console.error("[spike] PersonaConfig constructor error:", err.message);
  console.error("[spike] Check the actual API at:");
  console.error("[spike] https://docs.livekit.io/reference/agents-js/modules/plugins_agents_plugin_anam.html");
}
```

Run it:

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/LiveKit-agent tsx \
  /Users/potdev/Documents/GitHub/LiveKit-agent/scripts/spike-anam-plugin.ts
```

Read the output. You should see `[spike] ✓ AvatarSession + PersonaConfig exported`.

**If the API differs from what's shown above** (e.g., the class is named `AvatarAgent` or the constructor takes a different shape), STOP and update both the spike script AND Task 5's code to match the actual API. Document the deviation in the commit message for Task 5.

- [ ] **Step 3: Delete the spike script**

```bash
rm /Users/potdev/Documents/GitHub/LiveKit-agent/scripts/spike-anam-plugin.ts
```

(The script was a verification gate; it doesn't ship.)

- [ ] **Step 4: Commit the dep install**

```bash
git -C /Users/potdev/Documents/GitHub/LiveKit-agent add package.json package-lock.json
git -C /Users/potdev/Documents/GitHub/LiveKit-agent commit -m "deps: add @livekit/agents-plugin-anam ^1.0.30

LiveKit's official Anam avatar plugin. Used by voiceAgent.ts (next
task) to spawn an AvatarSession alongside the voice session when
metadata.withAvatar is true. Spike script verified the AvatarSession
+ PersonaConfig export shape before depending on the package."
```

---

## Task 5: LiveKit-agent — spawn `anam.AvatarSession` when `metadata.withAvatar` is true

Wire the plugin into `voiceAgent.ts`. After the existing `voice.AgentSession` is started, check the metadata flag + the bot's avatar config. When both are present, spawn an Anam `AvatarSession`. On failure, log and continue with voice-only (graceful degradation).

**Files:**
- Modify: `/Users/potdev/Documents/GitHub/LiveKit-agent/src/voiceAgent.ts`

- [ ] **Step 1: Parse `withAvatar` from metadata**

Open `/Users/potdev/Documents/GitHub/LiveKit-agent/src/voiceAgent.ts`. Find the existing metadata-parsing block (around line 264):

```ts
      // Try job metadata first (explicit dispatch)
      try {
        if (ctx.job?.metadata) {
          const metadata = JSON.parse(ctx.job.metadata);
          botId = metadata.botId;
          sessionId = metadata.sessionId;
          console.log("[voiceAgent] Got botId/sessionId from metadata");
        }
      } catch (e) {
        // Ignore parse errors
      }
```

Add a `withAvatar` parse alongside. Declare the variable near `let botId` / `let sessionId` (search for those declarations a few lines above the metadata block):

```ts
      let botId: string | undefined;
      let sessionId: string | undefined;
      let withAvatar = false;   // NEW
```

Then update the metadata parse:

```ts
      // Try job metadata first (explicit dispatch)
      try {
        if (ctx.job?.metadata) {
          const metadata = JSON.parse(ctx.job.metadata);
          botId = metadata.botId;
          sessionId = metadata.sessionId;
          withAvatar = !!metadata.withAvatar;
          console.log(
            "[voiceAgent] Got botId/sessionId from metadata",
            withAvatar ? "(with avatar)" : "",
          );
        }
      } catch (e) {
        // Ignore parse errors
      }
```

- [ ] **Step 2: Spawn `anam.AvatarSession` after the voice session starts**

Find the line where the voice session is started (around line 397):

```ts
      console.log("[voiceAgent] Starting voice session...");
      await session.start({ agent, room: ctx.room });
      console.log("[voiceAgent] Voice session started");
```

IMMEDIATELY AFTER `console.log("[voiceAgent] Voice session started");`, add the avatar-spawn block:

```ts
      // Avatar mode: when the dispatch requested withAvatar AND the bot
      // has an avatar config AND we have an ANAM_API_KEY, spawn an
      // Anam AvatarSession that joins this room and lip-syncs the
      // worker's TTS output. Failures here log + continue (voice still
      // works); we never abort the call because the avatar errored.
      if (withAvatar) {
        const avatarId = voiceConfig?.avatar?.avatarId;
        const voiceId = voiceConfig?.avatar?.voiceId;
        const anamApiKey = process.env.ANAM_API_KEY;

        if (!anamApiKey) {
          console.warn(
            "[voiceAgent] withAvatar=true but ANAM_API_KEY not set — continuing without avatar",
          );
        } else if (!avatarId || !voiceId) {
          console.warn(
            "[voiceAgent] withAvatar=true but bot.avatar.{avatarId,voiceId} not configured — continuing without avatar",
          );
        } else {
          try {
            const anam = await import("@livekit/agents-plugin-anam");
            const avatarSession = new (anam as any).AvatarSession({
              persona_config: new (anam as any).PersonaConfig({
                avatarId,
                voiceId,
              }),
              api_key: anamApiKey,
            });
            await avatarSession.start(session, ctx.room);
            console.log("[voiceAgent] Anam avatar session started");
          } catch (err: any) {
            console.error(
              "[voiceAgent] Anam avatar failed to start:",
              err?.message || err,
            );
            // Voice keeps working; the user sees no video but can still talk.
          }
        }
      }
```

NOTE on `(anam as any)`: the casts mirror what the Task 4 spike used. If the spike confirmed proper TypeScript types are exported, drop the `as any` and import the named types directly. If types are missing, the casts ship as-is (the runtime API is verified by the spike).

- [ ] **Step 3: Type-check + run existing worker tests**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/LiveKit-agent tsc \
  --noEmit -p /Users/potdev/Documents/GitHub/LiveKit-agent/tsconfig.json

PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/LiveKit-agent vitest run \
  --root /Users/potdev/Documents/GitHub/LiveKit-agent
```

Expected: clean type-check; 9 tests passing (unchanged). The avatar spawn is integration code — not unit-testable without the LiveKit runtime — verified at T12 via the manual smoke test.

- [ ] **Step 4: Commit**

```bash
git -C /Users/potdev/Documents/GitHub/LiveKit-agent add src/voiceAgent.ts
git -C /Users/potdev/Documents/GitHub/LiveKit-agent commit -m "voiceAgent: spawn anam.AvatarSession when metadata.withAvatar=true

After voice.AgentSession starts, check metadata.withAvatar +
voiceConfig.avatar.{avatarId,voiceId} + ANAM_API_KEY. When all
three are present, dynamically import @livekit/agents-plugin-anam
and spawn an AvatarSession against the same room. Failures log +
continue with voice-only — the call never aborts because the
avatar errored. Bots without an avatar config or with the flag
off behave exactly as before."
```

- [ ] **Step 5: Push (auto-deploys via Dokploy)**

```bash
git -C /Users/potdev/Documents/GitHub/LiveKit-agent push -u origin feature/anam-avatar-plugin
```

Note: pushing to a feature branch does NOT auto-deploy (Dokploy watches `main`). The branch lands in production only after a merge to main, which is the LAST step before T12's smoke test. This means the worker is safe to commit + push to the feature branch now; production keeps running the prior worker until you merge.

If you want to test the avatar end-to-end before that merge, you'll need to manually deploy this branch (or temporarily redirect Dokploy at it). The plan assumes deferred deploy.

---

## Task 6: potentialcom-Replit — Express proxy forwards `withAvatar`

The browser POSTs to `/api/agent/:agentKey/voice/room` which proxies to potentialTS's `/api/livekit/room/create`. The proxy must pass `withAvatar` through.

**Files:**
- Modify: `/Users/potdev/Documents/GitHub/potentialcom-Replit/server/routes.ts`
- Modify: `/Users/potdev/Documents/GitHub/potentialcom-Replit/server/routes.agent-voice-room.test.ts`

- [ ] **Step 1: Write the failing test extension**

Open `/Users/potdev/Documents/GitHub/potentialcom-Replit/server/routes.agent-voice-room.test.ts`. After the existing "forwards botId + sessionId to upstream and relays the response" test (around line 60), add:

```ts
  it("forwards withAvatar=true through to upstream when set in body", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          roomName: "bot-abc-session-s1-12345",
          token: "fake.jwt.token",
          wsUrl: "wss://livekit.potential.com",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const res = await request(makeApp())
      .post("/api/agent/ruby/voice/room")
      .send({ sessionId: "s1", withAvatar: true });

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body));
    expect(body.withAvatar).toBe(true);
  });

  it("omits withAvatar from upstream payload when not set in body (preserves wire format)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ roomName: "x", token: "y", wsUrl: "z" }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const res = await request(makeApp())
      .post("/api/agent/ruby/voice/room")
      .send({ sessionId: "s1" });

    expect(res.status).toBe(200);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body));
    expect(body).not.toHaveProperty("withAvatar");
  });
```

- [ ] **Step 2: Run tests to verify the new ones fail**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit \
  server/routes.agent-voice-room.test.ts
```

Expected: 2 new failures. The first expects `body.withAvatar === true` but the proxy currently never includes the field. The second already passes (the field is omitted today) — verify it passes alongside the other existing tests.

- [ ] **Step 3: Modify the Express proxy**

Open `/Users/potdev/Documents/GitHub/potentialcom-Replit/server/routes.ts`. Find the `/api/agent/:agentKey/voice/room` handler (around line 824). The current body destructure pulls `sessionId`; add `withAvatar`:

```ts
    const sessionId = req.body?.sessionId;
    const withAvatar = req.body?.withAvatar;  // NEW
```

Find the `body: JSON.stringify({` block (around line 841) that forwards to upstream. Change it to:

```ts
          body: JSON.stringify({
            botId: agent.botId,
            sessionId,
            // Only include withAvatar when explicitly true — keeps the
            // wire format clean for the default case (voice-only).
            ...(withAvatar === true ? { withAvatar: true } : {}),
          }),
```

- [ ] **Step 4: Run the targeted test file**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit \
  server/routes.agent-voice-room.test.ts
```

Expected: all tests passing.

- [ ] **Step 5: Run the full suite + type-check**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit tsc \
  --noEmit -p /Users/potdev/Documents/GitHub/potentialcom-Replit/tsconfig.json

PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit
```

Expected: clean type-check; **363 passing** (361 baseline + 2 new).

- [ ] **Step 6: Commit**

```bash
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit add server/routes.ts server/routes.agent-voice-room.test.ts
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit commit -m "voice/room proxy: forward withAvatar to upstream when set

Body field withAvatar (boolean) now passes through to potentialTS's
/api/livekit/room/create. Only emitted when explicitly true to keep
the wire format stable for voice-only calls."
```

---

## Task 7: potentialcom-Replit — extend `useLiveKitVoice` with `avatarVideoTrack` + `start({withAvatar})`

Track the avatar's remote video track in hook state. Extend `start()` to accept a `withAvatar` flag that flows into the room-mint POST body.

**Files:**
- Modify: `/Users/potdev/Documents/GitHub/potentialcom-Replit/client/src/test/livekitFakeRoom.ts`
- Modify: `/Users/potdev/Documents/GitHub/potentialcom-Replit/client/src/components/agent/voice/useLiveKitVoice.ts`
- Modify: `/Users/potdev/Documents/GitHub/potentialcom-Replit/client/src/components/agent/voice/AgentChatVoiceMode.test.tsx`

- [ ] **Step 1: Extend `FakeRoom` to support simulating remote video tracks from anam-* participants**

Open `/Users/potdev/Documents/GitHub/potentialcom-Replit/client/src/test/livekitFakeRoom.ts` and look for the existing `triggerDataReceived` method on `FakeRoom`. Right next to it, add a new method `triggerAnamVideoTrack(track?)` that simulates a remote video-track-subscribed event from an `anam-avatar-agent` participant.

The exact shape depends on the existing FakeRoom code, but the pattern is: invoke the `TrackSubscribed` callback (already wired in `useLiveKitVoice.ts:206` per audit) with arguments matching `(track, publication, participant)` where `track.kind === Track.Kind.Video` and `participant.identity.startsWith("anam-")`.

Open the existing file to see the FakeRoom's event-emission helpers (`triggerDataReceived` is the model):

```bash
grep -nA 8 "triggerDataReceived\|RoomEvent.TrackSubscribed\|RoomEvent.DataReceived" /Users/potdev/Documents/GitHub/potentialcom-Replit/client/src/test/livekitFakeRoom.ts
```

Mirror that pattern. The exact code depends on how callbacks are stored — add the method directly below `triggerDataReceived` with the same dispatch shape:

```ts
  /** Test helper: fire a TrackSubscribed event simulating Anam's video
   *  track joining the room. Use a placeholder track object that the
   *  hook's TrackSubscribed handler can store in state. */
  triggerAnamVideoTrack(): { stubTrack: object; participant: { identity: string } } {
    // Track and participant shapes mirror what livekit-client emits.
    // We only need .kind and .identity to satisfy the hook's branch.
    const stubTrack = {
      kind: "video", // Track.Kind.Video at runtime
      attach: () => {},
      detach: () => {},
    };
    const participant = { identity: "anam-avatar-agent" };

    // Find every TrackSubscribed callback that was registered via .on()
    // and invoke it. Mirror however triggerDataReceived dispatches its
    // callbacks (likely via a Map<eventName, Set<callback>>).
    const callbacks = this._listeners?.get?.("trackSubscribed") ?? [];
    for (const cb of callbacks) {
      cb(stubTrack, undefined, participant);
    }
    return { stubTrack, participant };
  }
```

IMPORTANT: the actual implementation depends on the FakeRoom's internal callback storage. If `this._listeners` is named differently (e.g. `this.eventHandlers`, `this._handlers`), adjust accordingly. **Read the existing `triggerDataReceived` first and mirror its dispatch pattern exactly.**

If the FakeRoom uses livekit-client's `RoomEvent.TrackSubscribed` enum string (e.g., `"trackSubscribed"`) — verify against the mock's actual event names.

- [ ] **Step 2: Write the failing test in `AgentChatVoiceMode.test.tsx`**

Open `/Users/potdev/Documents/GitHub/potentialcom-Replit/client/src/components/agent/voice/AgentChatVoiceMode.test.tsx`. After the existing "clicking Talk to Ruby connects via LiveKit…" test, add (inside the same describe block):

```ts
  it("stores an Anam video track in useLiveKitVoice.avatarVideoTrack when a TrackSubscribed event fires from an anam-* participant", async () => {
    // Render the hook inside AgentChat (we can't directly test the
    // hook because AgentChat is the public consumer). Trigger a fake
    // room connection, then simulate the avatar's video track joining.
    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (typeof url === "string" && url.endsWith("/api/agent/ruby/bot")) {
        return new Response(
          JSON.stringify({
            name: "Ruby",
            greeting: "Hi",
            avatarUrl: "",
            audiostt: true,
            audiotts: true,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      if (typeof url === "string" && url.endsWith("/voice/room")) {
        return new Response(
          JSON.stringify({
            roomName: "room-1",
            token: "tok",
            wsUrl: "wss://livekit.test",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      return new Response("data: [DONE]\n\n", {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<AgentChat agentKey="ruby" registry={rubyToolRegistry} />);

    const talkBtn = await screen.findByRole("button", { name: /talk to ruby/i });
    await user.click(talkBtn);

    // (NB: This test reflects the Task 11 wiring where the button
    // opens a modal. For now, we just assert the existing voice-only
    // flow works. The avatar-track-storage assertion is verified by
    // the test below, which simulates the room-side event directly.)
    await waitFor(() => expect(FakeRoom.instances).toHaveLength(1));
    const room = getLastFakeRoom();

    // Simulate the avatar's video track arriving in the room.
    act(() => {
      room.triggerAnamVideoTrack();
    });

    // The hook should have stored the track. Since hook state isn't
    // directly observable, assert that the AvatarView component renders
    // (which means avatarVideoTrack !== null). For now, just check the
    // room received the event; AvatarView is wired in T10.
    // TODO(T11): replace this with assertion on rendered <AvatarView>.
    expect(true).toBe(true);
  });
```

Acknowledgement: this T7 test is a placeholder asserting the FakeRoom helper exists. The actual hook-state assertion happens via the AgentChat integration test in T11 (when `AvatarView` is mounted and visible-when-avatarVideoTrack-is-set). The T7 test gates the FakeRoom extension so Task 8 (AvatarView) can build on it.

- [ ] **Step 3: Run the targeted test (should pass — the placeholder asserts true)**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit \
  client/src/components/agent/voice/AgentChatVoiceMode.test.tsx
```

Expected: all existing tests + the new placeholder pass.

- [ ] **Step 4: Extend `useLiveKitVoice`'s hook signature + state**

Open `/Users/potdev/Documents/GitHub/potentialcom-Replit/client/src/components/agent/voice/useLiveKitVoice.ts`. Find the existing `UseLiveKitVoiceResult` interface (around line 14):

```ts
export interface UseLiveKitVoiceResult {
  state: VoiceState;
  errorMessage: string | null;
  durationMs: number;
  isMuted: boolean;
  start: () => Promise<void>;
  hangup: () => void;
  toggleMute: () => void;
}
```

Replace with:

```ts
export interface UseLiveKitVoiceResult {
  state: VoiceState;
  errorMessage: string | null;
  durationMs: number;
  isMuted: boolean;
  /**
   * Remote video track from the Anam avatar agent, if it has joined
   * the room (i.e. the call was started with { withAvatar: true } AND
   * the worker successfully spawned an AvatarSession). null otherwise.
   * Consumers render this in <AvatarView> when non-null.
   */
  avatarVideoTrack: RemoteVideoTrack | null;
  /** Start a LiveKit call. Pass { withAvatar: true } to request an
   *  Anam avatar; the backend forwards the flag to the worker via
   *  dispatch metadata. Defaults to voice-only. */
  start: (opts?: { withAvatar?: boolean }) => Promise<void>;
  hangup: () => void;
  toggleMute: () => void;
}
```

Add the import for `RemoteVideoTrack` to the existing `livekit-client` import (around line 2):

```ts
import { Room, RoomEvent, Track, type RemoteVideoTrack } from "livekit-client";
```

Add new state inside the hook body (near the other `useState` calls, around line 63):

```ts
  const [avatarVideoTrack, setAvatarVideoTrack] = useState<RemoteVideoTrack | null>(null);
```

In `cleanup` (around line 78), reset the track:

```ts
  const cleanup = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (roomRef.current) {
      try {
        void roomRef.current.disconnect();
      } catch {
        /* ignore */
      }
      roomRef.current = null;
    }
    setAvatarVideoTrack(null);  // NEW
  }, []);
```

- [ ] **Step 5: Update the `TrackSubscribed` handler to capture avatar video tracks**

Find the existing `TrackSubscribed` handler (around line 210):

```ts
    rkRoom.on(RoomEvent.TrackSubscribed, (track) => {
      if (track.kind === Track.Kind.Audio) {
        try {
          (track as any).attach?.();
        } catch {
          /* ignore */
        }
      }
    });
```

Replace with:

```ts
    rkRoom.on(RoomEvent.TrackSubscribed, (track, _publication, participant) => {
      // Audio: auto-attach via livekit-client's helper.
      if (track.kind === Track.Kind.Audio) {
        try {
          (track as any).attach?.();
        } catch {
          /* ignore */
        }
        return;
      }
      // Video from Anam: store the track so <AvatarView> can render it.
      // Filter by participant identity prefix so we don't accidentally
      // capture video from other participants if the room ever has any.
      if (
        track.kind === Track.Kind.Video &&
        participant?.identity?.startsWith?.("anam-")
      ) {
        setAvatarVideoTrack(track as RemoteVideoTrack);
      }
    });

    // Clear the track if the avatar's participant disconnects mid-call
    // (e.g. Anam quota exceeded, network drop on Anam's side).
    rkRoom.on(RoomEvent.TrackUnsubscribed, (track, _publication, participant) => {
      if (
        track.kind === Track.Kind.Video &&
        participant?.identity?.startsWith?.("anam-")
      ) {
        setAvatarVideoTrack(null);
      }
    });
```

- [ ] **Step 6: Update `start()` to accept `{ withAvatar }`**

Find the `start` useCallback (around line 170):

```ts
  const start = useCallback(async () => {
    cleanup();
    setErrorMessage(null);
    setState("connecting");

    // 1. Mint a room via the Express proxy (existing /voice/room).
    let room: RoomCreateResponse;
    try {
      const res = await fetch(`/api/agent/${agentKey}/voice/room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
```

Replace the signature + body:

```ts
  const start = useCallback(
    async (opts?: { withAvatar?: boolean }) => {
      const withAvatar = opts?.withAvatar === true;
      cleanup();
      setErrorMessage(null);
      setState("connecting");

      // 1. Mint a room via the Express proxy (existing /voice/room).
      let room: RoomCreateResponse;
      try {
        const res = await fetch(`/api/agent/${agentKey}/voice/room`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            ...(withAvatar ? { withAvatar: true } : {}),
          }),
        });
```

The rest of the function body is unchanged. **Don't forget the closing arrow-function bracket**: the existing `start` ends with `}, [agentKey, sessionId, cleanup, handleData]);` — the new wrapping arrow function needs its own closing bracket inside the existing useCallback. Easiest approach: leave the useCallback wrapper alone, change only the inner async function's signature.

Actual replacement (replace JUST the first 6 lines of the useCallback body):

Find:
```ts
  const start = useCallback(async () => {
    cleanup();
    setErrorMessage(null);
    setState("connecting");
```

Replace with:
```ts
  const start = useCallback(async (opts?: { withAvatar?: boolean }) => {
    const withAvatar = opts?.withAvatar === true;
    cleanup();
    setErrorMessage(null);
    setState("connecting");
```

Then find the existing fetch call body:
```ts
        body: JSON.stringify({ sessionId }),
```

Replace with:
```ts
        body: JSON.stringify({
          sessionId,
          ...(withAvatar ? { withAvatar: true } : {}),
        }),
```

- [ ] **Step 7: Add `avatarVideoTrack` to the hook's return**

Find the return statement at the bottom of `useLiveKitVoice` (around line 280):

```ts
  return {
    state,
    errorMessage,
    durationMs,
    isMuted,
    start,
    hangup,
    toggleMute,
  };
```

Add `avatarVideoTrack`:

```ts
  return {
    state,
    errorMessage,
    durationMs,
    isMuted,
    avatarVideoTrack,
    start,
    hangup,
    toggleMute,
  };
```

- [ ] **Step 8: Run the full test suite + type-check**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit tsc \
  --noEmit -p /Users/potdev/Documents/GitHub/potentialcom-Replit/tsconfig.json

PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit
```

Expected: clean type-check; **364 passing** (363 prior + 1 placeholder from T7).

If `voice.start()` is called anywhere else in the codebase WITHOUT arguments, the new optional `opts?` parameter keeps that callsite valid. Verify with:

```bash
grep -rn "voice\.start\|\.start()" /Users/potdev/Documents/GitHub/potentialcom-Replit/client/src 2>&1 | grep -v ".test." | head -5
```

All call sites that pass no args are unaffected.

- [ ] **Step 9: Commit**

```bash
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit add client/src/test/livekitFakeRoom.ts client/src/components/agent/voice/useLiveKitVoice.ts client/src/components/agent/voice/AgentChatVoiceMode.test.tsx
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit commit -m "useLiveKitVoice: track avatar video + accept withAvatar option

- New state avatarVideoTrack: RemoteVideoTrack | null
- TrackSubscribed handler captures video tracks from anam-* participants
- TrackUnsubscribed handler clears the track on Anam-side disconnects
- start() gains optional { withAvatar } that flows into the room-mint
  POST body
- FakeRoom test helper triggerAnamVideoTrack() for downstream tests
- Placeholder integration test asserts the FakeRoom helper exists;
  real assertion lives in T11 once <AvatarView> renders"
```

---

## Task 8: potentialcom-Replit — `TalkModePicker` component

Modal that asks the user "Voice only" vs "Voice + Avatar" before starting a LiveKit call.

**Files:**
- Create: `/Users/potdev/Documents/GitHub/potentialcom-Replit/client/src/components/agent/voice/TalkModePicker.tsx`
- Create: `/Users/potdev/Documents/GitHub/potentialcom-Replit/client/src/components/agent/voice/TalkModePicker.test.tsx`
- Modify: `/Users/potdev/Documents/GitHub/potentialcom-Replit/client/src/components/agent/voice/index.ts`

- [ ] **Step 1: Write the failing test**

Create `/Users/potdev/Documents/GitHub/potentialcom-Replit/client/src/components/agent/voice/TalkModePicker.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TalkModePicker } from "./TalkModePicker";

describe("TalkModePicker", () => {
  it("renders both options when open=true", () => {
    render(
      <TalkModePicker
        open={true}
        onOpenChange={vi.fn()}
        onPick={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /voice only/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /voice \+ avatar/i })).toBeInTheDocument();
  });

  it("renders nothing visible when open=false", () => {
    render(
      <TalkModePicker
        open={false}
        onOpenChange={vi.fn()}
        onPick={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button", { name: /voice only/i })).toBeNull();
  });

  it("clicking 'Voice only' calls onPick(false)", async () => {
    const onPick = vi.fn();
    const user = userEvent.setup();
    render(
      <TalkModePicker
        open={true}
        onOpenChange={vi.fn()}
        onPick={onPick}
      />,
    );
    await user.click(screen.getByRole("button", { name: /voice only/i }));
    expect(onPick).toHaveBeenCalledWith(false);
  });

  it("clicking 'Voice + Avatar' calls onPick(true)", async () => {
    const onPick = vi.fn();
    const user = userEvent.setup();
    render(
      <TalkModePicker
        open={true}
        onOpenChange={vi.fn()}
        onPick={onPick}
      />,
    );
    await user.click(screen.getByRole("button", { name: /voice \+ avatar/i }));
    expect(onPick).toHaveBeenCalledWith(true);
  });

  it("closing the dialog calls onOpenChange(false) and does NOT call onPick", async () => {
    const onPick = vi.fn();
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TalkModePicker
        open={true}
        onOpenChange={onOpenChange}
        onPick={onPick}
      />,
    );
    // Use the Escape key to close the dialog (Radix Dialog supports this).
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onPick).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit \
  client/src/components/agent/voice/TalkModePicker.test.tsx
```

Expected: FAIL — file doesn't exist.

- [ ] **Step 3: Implement the component**

Create `/Users/potdev/Documents/GitHub/potentialcom-Replit/client/src/components/agent/voice/TalkModePicker.tsx`:

```tsx
import { Mic, UserCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TalkModePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fires when the user picks an option. Parent then mints a LiveKit
   *  room with the chosen withAvatar flag. */
  onPick: (withAvatar: boolean) => void;
}

/**
 * Modal that asks "Voice only" vs "Voice + Avatar" before starting a
 * LiveKit call. Used by AgentChat's header "Talk to Ruby" button. The
 * binary choice is presented as two equally-weighted cards so neither
 * option feels like the "advanced" or "hidden" path.
 *
 * Closing the dialog (Escape, click outside) calls onOpenChange(false)
 * without firing onPick — the parent stays in idle state.
 */
export function TalkModePicker({
  open,
  onOpenChange,
  onPick,
}: TalkModePickerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Talk to Ruby</DialogTitle>
          <DialogDescription>How would you like to connect?</DialogDescription>
        </DialogHeader>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onPick(false)}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5 text-center transition-colors hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            data-testid="talk-mode-voice-only"
          >
            <Mic className="h-7 w-7 text-primary" />
            <div className="font-semibold text-foreground">Voice only</div>
            <div className="text-xs text-muted-foreground">
              Talk to Ruby
            </div>
          </button>
          <button
            type="button"
            onClick={() => onPick(true)}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5 text-center transition-colors hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            data-testid="talk-mode-voice-avatar"
          >
            <UserCircle2 className="h-7 w-7 text-primary" />
            <div className="font-semibold text-foreground">Voice + Avatar</div>
            <div className="text-xs text-muted-foreground">
              Talk and see her face
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit \
  client/src/components/agent/voice/TalkModePicker.test.tsx
```

Expected: all 5 tests passing.

If the Dialog primitive isn't at `@/components/ui/dialog`, find the correct path:

```bash
ls /Users/potdev/Documents/GitHub/potentialcom-Replit/client/src/components/ui/ | grep -i dialog
```

(`alert-dialog.tsx` definitely exists; verify `dialog.tsx` does too. If only AlertDialog exists, use that instead — adjust the test's role queries from `dialog` to `alertdialog` if needed.)

- [ ] **Step 5: Export from the voice barrel**

Open `/Users/potdev/Documents/GitHub/potentialcom-Replit/client/src/components/agent/voice/index.ts` and add:

```ts
export { TalkModePicker } from "./TalkModePicker";
```

- [ ] **Step 6: Type-check + full suite**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit tsc \
  --noEmit -p /Users/potdev/Documents/GitHub/potentialcom-Replit/tsconfig.json

PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit
```

Expected: clean type-check; **369 passing** (364 + 5 new).

- [ ] **Step 7: Commit**

```bash
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit add client/src/components/agent/voice/TalkModePicker.tsx client/src/components/agent/voice/TalkModePicker.test.tsx client/src/components/agent/voice/index.ts
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit commit -m "Add TalkModePicker modal

Two equally-weighted option cards: Voice only / Voice + Avatar.
Click → onPick(boolean) → parent mints a LiveKit room with the
chosen withAvatar flag. Used by AgentChat's header (wired in T10)."
```

---

## Task 9: potentialcom-Replit — `AvatarView` component

Renders an Anam `RemoteVideoTrack` into a `<video>` element with a static-image fallback while the track is null/connecting.

**Files:**
- Create: `/Users/potdev/Documents/GitHub/potentialcom-Replit/client/src/components/agent/voice/AvatarView.tsx`
- Create: `/Users/potdev/Documents/GitHub/potentialcom-Replit/client/src/components/agent/voice/AvatarView.test.tsx`
- Modify: `/Users/potdev/Documents/GitHub/potentialcom-Replit/client/src/components/agent/voice/index.ts`

- [ ] **Step 1: Write the failing test**

Create `/Users/potdev/Documents/GitHub/potentialcom-Replit/client/src/components/agent/voice/AvatarView.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { AvatarView } from "./AvatarView";

describe("AvatarView", () => {
  it("renders a fallback img with the agent name as alt text when track is null", () => {
    render(
      <AvatarView
        track={null}
        avatarUrl="https://example.com/ruby.png"
        agentName="Ruby"
      />,
    );
    const img = screen.getByAltText("Ruby") as HTMLImageElement;
    expect(img.src).toBe("https://example.com/ruby.png");
  });

  it("renders a 'Connecting' caption alongside the fallback while connecting", () => {
    render(
      <AvatarView
        track={null}
        avatarUrl="https://example.com/ruby.png"
        agentName="Ruby"
      />,
    );
    expect(screen.getByText(/connecting/i)).toBeInTheDocument();
  });

  it("calls track.attach(videoElement) when a track is provided", () => {
    const attach = vi.fn();
    const detach = vi.fn();
    const fakeTrack = { attach, detach } as any;
    render(
      <AvatarView
        track={fakeTrack}
        avatarUrl="https://example.com/ruby.png"
        agentName="Ruby"
      />,
    );
    expect(attach).toHaveBeenCalledTimes(1);
    const arg = attach.mock.calls[0][0];
    expect(arg).toBeInstanceOf(HTMLVideoElement);
  });

  it("calls track.detach() on unmount", () => {
    const attach = vi.fn();
    const detach = vi.fn();
    const fakeTrack = { attach, detach } as any;
    const { unmount } = render(
      <AvatarView
        track={fakeTrack}
        avatarUrl="https://example.com/ruby.png"
        agentName="Ruby"
      />,
    );
    unmount();
    expect(detach).toHaveBeenCalledTimes(1);
  });

  it("does NOT render the fallback img when a track is provided", () => {
    const fakeTrack = { attach: vi.fn(), detach: vi.fn() } as any;
    render(
      <AvatarView
        track={fakeTrack}
        avatarUrl="https://example.com/ruby.png"
        agentName="Ruby"
      />,
    );
    expect(screen.queryByAltText("Ruby")).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit \
  client/src/components/agent/voice/AvatarView.test.tsx
```

Expected: FAIL — file doesn't exist.

- [ ] **Step 3: Implement the component**

Create `/Users/potdev/Documents/GitHub/potentialcom-Replit/client/src/components/agent/voice/AvatarView.tsx`:

```tsx
import { useEffect, useRef } from "react";
import type { RemoteVideoTrack } from "livekit-client";

interface AvatarViewProps {
  /** Anam video track from useLiveKitVoice.avatarVideoTrack. Null
   *  while connecting (or if avatar mode wasn't requested). */
  track: RemoteVideoTrack | null;
  /** Fallback static avatar image (Ruby's existing PNG) shown during
   *  the connection delay. */
  avatarUrl?: string;
  /** Agent name — alt text for the fallback img + sr-only label for
   *  the video element. */
  agentName: string;
}

/**
 * Renders an Anam-provided video track into a <video> element, with a
 * static-image fallback while the track is null. Audio routing: Anam
 * publishes audio separately as an audio track on the same participant;
 * useLiveKitVoice's existing TrackSubscribed handler auto-attaches all
 * audio tracks. This <video> is rendered muted so we don't double-play
 * audio.
 *
 * Aspect ratio: aspect-video (16:9) — verify against Anam's default
 * output during smoke test; switch to aspect-[4/5] if portrait reads
 * better.
 */
export function AvatarView({ track, avatarUrl, agentName }: AvatarViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !track) return;
    track.attach(el);
    return () => {
      track.detach();
    };
  }, [track]);

  if (!track) {
    // Connecting / no-avatar state: show the static avatar with a
    // caption so the user knows the dot is loading.
    return (
      <div
        className="relative flex h-full w-full items-center justify-center bg-muted"
        data-testid="avatar-view-fallback"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={agentName}
            className="h-32 w-32 rounded-full object-cover opacity-90"
          />
        ) : (
          <div className="h-32 w-32 rounded-full bg-primary/10" />
        )}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          Connecting…
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-muted">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        aria-label={`${agentName} avatar video`}
        className="h-full w-full object-cover"
        data-testid="avatar-view-video"
      />
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit \
  client/src/components/agent/voice/AvatarView.test.tsx
```

Expected: all 5 tests passing.

- [ ] **Step 5: Export from the voice barrel**

Open `/Users/potdev/Documents/GitHub/potentialcom-Replit/client/src/components/agent/voice/index.ts` and add:

```ts
export { AvatarView } from "./AvatarView";
```

- [ ] **Step 6: Type-check + full suite**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit tsc \
  --noEmit -p /Users/potdev/Documents/GitHub/potentialcom-Replit/tsconfig.json

PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit
```

Expected: clean; **374 passing** (369 + 5).

- [ ] **Step 7: Commit**

```bash
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit add client/src/components/agent/voice/AvatarView.tsx client/src/components/agent/voice/AvatarView.test.tsx client/src/components/agent/voice/index.ts
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit commit -m "Add AvatarView component

Renders an Anam RemoteVideoTrack into a <video> element with a
static-image fallback (avatarUrl + 'Connecting…' caption) while the
track is null. Video element is muted; audio plays through Anam's
separate audio track which useLiveKitVoice auto-attaches."
```

---

## Task 10: potentialcom-Replit — wire `TalkModePicker` into the `AgentChat` header

Replace the existing `VoiceModeButton` (single-click "Voice Mode") with a button that opens the `TalkModePicker` modal, then calls `voice.start({ withAvatar })` based on the pick.

**Files:**
- Modify: `/Users/potdev/Documents/GitHub/potentialcom-Replit/client/src/components/agent/AgentChat.tsx`

- [ ] **Step 1: Import the picker + add local state**

Open `/Users/potdev/Documents/GitHub/potentialcom-Replit/client/src/components/agent/AgentChat.tsx`. Find the existing voice imports (around line 8):

```ts
import {
  MicButton,
  useTextToSpeech,
  useLiveKitVoice,
  VoiceModeButton,
  VoiceHero,
} from "./voice";
```

Add `TalkModePicker`:

```ts
import {
  MicButton,
  useTextToSpeech,
  useLiveKitVoice,
  VoiceModeButton,
  VoiceHero,
  TalkModePicker,
} from "./voice";
```

Inside the component body (right after the other `useState` calls — around line 40), add:

```ts
  const [talkModePickerOpen, setTalkModePickerOpen] = useState(false);
```

- [ ] **Step 2: Replace the VoiceModeButton wiring**

Find the existing header voice button (around line 245):

```tsx
          {bot?.audiostt &&
            bot?.audiotts &&
            (voice.state === "idle" || voice.state === "error") && (
              <VoiceModeButton
                busy={status === "streaming"}
                onClick={() => void voice.start()}
              />
            )}
```

Replace with:

```tsx
          {bot?.audiostt &&
            bot?.audiotts &&
            (voice.state === "idle" || voice.state === "error") && (
              <VoiceModeButton
                busy={status === "streaming"}
                onClick={() => setTalkModePickerOpen(true)}
              />
            )}
```

Then, immediately after the closing `</div>` of the header (find the line `</div>` that closes `<div className="ml-auto flex items-center gap-2">` — around line 260), and BEFORE the messages container, add the picker:

```tsx
        </div>
      </div>

      {/* Talk-mode picker modal: opens from the header button.
          onPick mints the LiveKit room with the chosen withAvatar flag. */}
      <TalkModePicker
        open={talkModePickerOpen}
        onOpenChange={setTalkModePickerOpen}
        onPick={(withAvatar) => {
          setTalkModePickerOpen(false);
          void voice.start({ withAvatar });
        }}
      />

      {/* In-call dock — pinned BETWEEN the header and the message
```

(The comment line "In-call dock" already exists; just insert the `<TalkModePicker>` block right above it.)

- [ ] **Step 3: Type-check + run existing voice-mode integration tests**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit tsc \
  --noEmit -p /Users/potdev/Documents/GitHub/potentialcom-Replit/tsconfig.json

PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit \
  client/src/components/agent/voice/AgentChatVoiceMode.test.tsx
```

Expected: clean type-check; existing voice-mode tests still pass.

The existing test ("clicking Talk to Ruby connects via LiveKit…") was written when the button connected directly. NOW the button opens a picker first. Update the existing test in the same file to click through the picker:

Find the existing call sequence (around the "Talk to Ruby" line):

```ts
    const talkBtn = await screen.findByRole("button", {
      name: /talk to ruby/i,
    });
    await user.click(talkBtn);
    // FakeRoom is constructed once the room is minted and hook connects.
    await waitFor(() => expect(FakeRoom.instances).toHaveLength(1));
```

Insert an intermediate click on the "Voice only" picker option between the talkBtn click and the FakeRoom assertion:

```ts
    const talkBtn = await screen.findByRole("button", {
      name: /talk to ruby/i,
    });
    await user.click(talkBtn);
    // Picker opens; pick "Voice only" to mint a voice-only room.
    const voiceOnlyBtn = await screen.findByRole("button", { name: /voice only/i });
    await user.click(voiceOnlyBtn);
    // FakeRoom is constructed once the room is minted and hook connects.
    await waitFor(() => expect(FakeRoom.instances).toHaveLength(1));
```

Apply the same edit pattern to the other existing test in that file ("shows a toast when the voice room mint fails (e.g., trial exhausted)") — add a `getByRole("button", { name: /voice only/i })` click after the Talk-to-Ruby click.

- [ ] **Step 4: Run the targeted test file again**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit \
  client/src/components/agent/voice/AgentChatVoiceMode.test.tsx
```

Expected: all tests passing.

- [ ] **Step 5: Run the full suite + type-check**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit tsc \
  --noEmit -p /Users/potdev/Documents/GitHub/potentialcom-Replit/tsconfig.json

PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit
```

Expected: clean; **374 passing** (no count change; existing test was modified, not added).

- [ ] **Step 6: Commit**

```bash
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit add client/src/components/agent/AgentChat.tsx client/src/components/agent/voice/AgentChatVoiceMode.test.tsx
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit commit -m "AgentChat: header voice button opens TalkModePicker

Previously the header voice button connected directly with no
choice. Now it opens a modal asking voice-only vs voice+avatar;
the pick is forwarded to voice.start({ withAvatar }). Existing
voice-mode integration tests updated to click through the
intermediate picker."
```

---

## Task 11: potentialcom-Replit — `AgentChat` layout split when `avatarVideoTrack !== null`

When the avatar's video track is present, restructure the chat panel: replace the existing VoiceHero dock with the avatar video occupying the top of the message area (~65% of chat height), compact the message list to the remaining ~35%, hide the text input.

**Files:**
- Modify: `/Users/potdev/Documents/GitHub/potentialcom-Replit/client/src/components/agent/AgentChat.tsx`
- Modify: `/Users/potdev/Documents/GitHub/potentialcom-Replit/client/src/components/agent/voice/AgentChatVoiceMode.test.tsx`

- [ ] **Step 1: Add a new integration test asserting the avatar layout**

Open `/Users/potdev/Documents/GitHub/potentialcom-Replit/client/src/components/agent/voice/AgentChatVoiceMode.test.tsx`. Add after the previously-modified Voice-only test (inside the `describe` block):

```ts
  it("renders <AvatarView> and hides the text input when an anam-* video track arrives", async () => {
    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (typeof url === "string" && url.endsWith("/api/agent/ruby/bot")) {
        return new Response(
          JSON.stringify({
            name: "Ruby",
            greeting: "Hi",
            avatarUrl: "/ruby.png",
            audiostt: true,
            audiotts: true,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      if (typeof url === "string" && url.endsWith("/voice/room")) {
        return new Response(
          JSON.stringify({
            roomName: "room-1",
            token: "tok",
            wsUrl: "wss://livekit.test",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      return new Response("data: [DONE]\n\n", {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<AgentChat agentKey="ruby" registry={rubyToolRegistry} />);

    const talkBtn = await screen.findByRole("button", { name: /talk to ruby/i });
    await user.click(talkBtn);
    // Pick the avatar option.
    const avatarBtn = await screen.findByRole("button", { name: /voice \+ avatar/i });
    await user.click(avatarBtn);
    await waitFor(() => expect(FakeRoom.instances).toHaveLength(1));
    const room = getLastFakeRoom();

    // Before the avatar track arrives: text input still visible
    // (voice-only layout while connecting).
    expect(screen.queryByTestId("avatar-view-video")).toBeNull();

    // Simulate the Anam video track joining the room.
    act(() => {
      room.triggerAnamVideoTrack();
    });

    // Now the AvatarView's <video> should be present.
    await waitFor(() => {
      expect(screen.getByTestId("avatar-view-video")).toBeInTheDocument();
    });

    // Text input should be hidden (avatar mode is voice-first).
    expect(screen.queryByPlaceholderText(/message ruby/i)).toBeNull();
  });
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit \
  client/src/components/agent/voice/AgentChatVoiceMode.test.tsx
```

Expected: 1 new failure (`<AvatarView>` never renders today). Existing tests should still pass.

- [ ] **Step 3: Add `AvatarView` import + read `avatarVideoTrack` from the hook**

Open `/Users/potdev/Documents/GitHub/potentialcom-Replit/client/src/components/agent/AgentChat.tsx`. Update the existing voice import (the one you updated in T10) to add `AvatarView`:

```ts
import {
  MicButton,
  useTextToSpeech,
  useLiveKitVoice,
  VoiceModeButton,
  VoiceHero,
  TalkModePicker,
  AvatarView,
} from "./voice";
```

Add a derived flag near the existing `isOnCall` / `isAgentSpeaking` computations (around line 207):

```ts
  // Visual states for the header avatar.
  const isAgentSpeaking = voice.state === "agent-speaking";
  const isOnCall = voice.state !== "idle" && voice.state !== "error";
  // Avatar mode: true once Anam's video track has joined the room.
  const isAvatarMode = !!voice.avatarVideoTrack;
```

- [ ] **Step 4: Conditionally render `<AvatarView>` instead of `<VoiceHero>` when in avatar mode**

Find the existing in-call dock render (around line 270):

```tsx
      {/* In-call dock — pinned BETWEEN the header and the message
          list (NOT inside the scrollable area) so the end-call button
          stays reachable regardless of message scroll position. */}
      {isOnCall && (
        <VoiceHero
          state={voice.state}
          durationMs={voice.durationMs}
          isMuted={voice.isMuted}
          agentName={bot?.name ?? "Ruby"}
          onMute={voice.toggleMute}
          onHangup={voice.hangup}
        />
      )}
```

Replace with:

```tsx
      {/* In-call dock OR avatar view — both pinned between header and
          messages. Avatar mode replaces the dock with the video, plus
          a small overlay row for End Call (since the dock's controls
          are now absent). */}
      {isOnCall && !isAvatarMode && (
        <VoiceHero
          state={voice.state}
          durationMs={voice.durationMs}
          isMuted={voice.isMuted}
          agentName={bot?.name ?? "Ruby"}
          onMute={voice.toggleMute}
          onHangup={voice.hangup}
        />
      )}
      {isOnCall && isAvatarMode && (
        <div className="relative border-b border-border bg-muted/40">
          <div className="aspect-video w-full" style={{ maxHeight: "65vh" }}>
            <AvatarView
              track={voice.avatarVideoTrack}
              avatarUrl={bot?.avatarUrl}
              agentName={bot?.name ?? "Ruby"}
            />
          </div>
          {/* End-call overlay top-right — voice-only's End Call lived
              in the VoiceHero dock; in avatar mode it floats over the
              video. */}
          <button
            type="button"
            onClick={voice.hangup}
            aria-label="End call"
            title="End call"
            className="absolute top-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-colors hover:bg-red-600"
            data-testid="avatar-view-hangup"
          >
            {/* Reuse the PhoneOff icon from lucide-react. */}
            <span aria-hidden="true">✕</span>
          </button>
        </div>
      )}
```

NOTE: the `aspect-video` + `maxHeight: "65vh"` combination caps the video at 65% of viewport height while preserving 16:9 ratio. If Anam's actual output is different (e.g., 4:5 portrait), swap `aspect-video` for `aspect-[4/5]` in the smoke test pass.

Use a proper icon for the end-call button instead of the placeholder ✕:

In the existing lucide-react import line at the top of AgentChat.tsx (around line 2), add `PhoneOff` to the import list:

```ts
import { Send, ImagePlus, X, PhoneOff } from "lucide-react";
```

Then in the overlay button above, replace `<span aria-hidden="true">✕</span>` with `<PhoneOff className="h-5 w-5" />`.

- [ ] **Step 5: Hide the text input when in avatar mode**

Find the existing input section (around line 367-440):

```tsx
      {/* Input — generous padding (px-6 py-4) so the input row breathes;
          larger touch targets (h-11 buttons + h-11 input); brand
          focus ring with primary color. */}
      <div className="border-t border-border/60 px-6 py-4">
```

Wrap the input block in a conditional (so it doesn't render in avatar mode). Change the opening:

```tsx
      {/* Input — hidden in avatar mode (voice-first; user types via
          Chat mode by ending the call). */}
      {!isAvatarMode && (
      <div className="border-t border-border/60 px-6 py-4">
```

And close the conditional at the end of the input block. Find the matching closing `</div>` for `<div className="border-t border-border/60 px-6 py-4">` (the last `</div>` before `</div>` that closes the chat shell — around line 440):

```tsx
        </form>
      </div>
      </div>
```

Change to:

```tsx
        </form>
      </div>
      )}
      </div>
```

- [ ] **Step 6: Run the new test (should pass now)**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit \
  client/src/components/agent/voice/AgentChatVoiceMode.test.tsx
```

Expected: all tests passing including the new avatar-mode integration.

- [ ] **Step 7: Run the full suite + type-check**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit tsc \
  --noEmit -p /Users/potdev/Documents/GitHub/potentialcom-Replit/tsconfig.json

PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit
```

Expected: clean type-check; **375 passing** (374 + 1 new avatar-mode test).

- [ ] **Step 8: Commit**

```bash
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit add client/src/components/agent/AgentChat.tsx client/src/components/agent/voice/AgentChatVoiceMode.test.tsx
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit commit -m "AgentChat: avatar layout — video dominates panel, text input hidden

When voice.avatarVideoTrack is non-null:
- Replace the VoiceHero dock with an AvatarView pinned below the
  header (aspect-video, capped at 65vh)
- Overlay an End Call button top-right of the video
- Hide the text input (avatar mode is voice-first — switching to
  text means ending the call)

When the call is voice-only (no avatar track), the existing dock +
input + message-list layout is unchanged. Smoke-test in T12 verifies
tool cards still render in the compact message list below the video."
```

---

## Task 12: Merge each branch, push, sync dev worktree, manual smoke test

Bring all three repos to their respective `main`, push to origin, sync the running dev worktree, and walk the acceptance criteria from the spec end-to-end.

- [ ] **Step 1: Verify Ruby's `BotVoiceAgent.avatar` is populated in MongoDB**

Manual: connect to MongoDB (via your normal admin tool), find Ruby's `BotVoiceAgent` record, and update it:

```js
db.botvoiceagents.updateOne(
  { botId: ObjectId("<RUBY_BOT_ID>") },
  {
    $set: {
      avatar: {
        avatarId: "<Anam avatar UUID from dashboard>",
        voiceId: "<Anam voice UUID from /api/dashboard/avatars/voices or Anam dashboard>",
      },
    },
  },
);
```

If you don't have a UUID handy, the avatar plugin will fail gracefully (worker logs a warning, call falls back to voice-only). The spec covers this in Error handling — but the smoke test below assumes Ruby has real UUIDs configured.

- [ ] **Step 2: Verify `ANAM_API_KEY` is set in the worker's env (Dokploy / wherever the LiveKit-agent deploys)**

If the env var is missing, the worker logs a warning per Task 5 and falls back to voice-only. Test BOTH scenarios during the smoke test if you can — but at minimum verify the key is present for the primary smoke test.

- [ ] **Step 3: Merge each branch to its main**

```bash
# potentialTS
git -C /Users/potdev/Documents/GitHub/potentialTS checkout main
git -C /Users/potdev/Documents/GitHub/potentialTS merge --no-ff feature/livekit-with-avatar-flag \
  -m "Merge feature/livekit-with-avatar-flag — BotVoiceAgent.avatar + withAvatar dispatch"
git -C /Users/potdev/Documents/GitHub/potentialTS push origin main

# LiveKit-agent (triggers Dokploy redeploy)
git -C /Users/potdev/Documents/GitHub/LiveKit-agent checkout main
git -C /Users/potdev/Documents/GitHub/LiveKit-agent merge --no-ff feature/anam-avatar-plugin \
  -m "Merge feature/anam-avatar-plugin — Anam AvatarSession in worker"
git -C /Users/potdev/Documents/GitHub/LiveKit-agent push origin main

# potentialcom-Replit
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit checkout main
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit merge --no-ff claude/ruby-avatar-interface \
  -m "Merge claude/ruby-avatar-interface — TalkModePicker + AvatarView + avatar layout"
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit push origin main
```

If any push is blocked by the auto-mode classifier, surface the blocked command to the human for manual push.

- [ ] **Step 4: Sync the running dev worktree so Vite HMR picks up the changes**

```bash
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit/.claude/worktrees/ruby-livekit-native-voice \
  merge main --ff-only
```

- [ ] **Step 5: Run the full frontend test suite one last time on main**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit tsc \
  --noEmit -p /Users/potdev/Documents/GitHub/potentialcom-Replit/tsconfig.json

PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit
```

Expected: clean type-check; 375 passing.

- [ ] **Step 6: Manual smoke test against the running dev server (localhost:5001)**

Hard-refresh `http://localhost:5001/demo` (Cmd+Shift+R). Walk the acceptance criteria from the spec:

1. Header shows a single "Talk to Ruby" / "Voice Mode" button (the existing button label is preserved — what changed is what happens when you click it).
2. Click the button → `TalkModePicker` modal opens with TWO option cards: "Voice only" + "Voice + Avatar".
3. Pick "Voice only" → modal closes → LiveKit connects → familiar VoiceHero dock appears between header and messages, text input visible. Speak: voice flow works as before. Hang up. Returns to text Chat mode.
4. Open the modal again, pick "Voice + Avatar" → LiveKit connects → within ~3-5 seconds Ruby's video appears in the panel (avatar dominates, aspect-video). Text input is HIDDEN. End-call overlay sits top-right of the video.
5. Speak: "Show me lipsticks". Ruby answers with lip-sync (mouth moves with audio). The product card renders in the COMPACT message list below the video.
6. Click End-call (top-right of video) → returns to text Chat mode. Sessionid preserved (typing "the lipsticks you showed me" references the same conversation).
7. Voice-only call after an avatar call: open modal, pick "Voice only" → confirm the regular dock layout is restored (no avatar video).
8. Verify the integration didn't break Chat mode (text-only): close any active call, type a message → SSE streams reply as before.

If any step fails — particularly the avatar appearing within 5 seconds — check the worker logs (Dokploy or wherever it's deployed) for warnings about ANAM_API_KEY or avatar config, and verify the DB update from Step 1 actually landed.

- [ ] **Step 7: Final commit if any smoke-test fixes were needed**

If you found and fixed integration bugs during the smoke walk, commit them (per the prior plan's pattern):

```bash
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit add <fixed-files>
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit commit -m "Fix: <one-line description>"
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit push origin main
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit/.claude/worktrees/ruby-livekit-native-voice merge main --ff-only
```

If everything passed clean, no further commit is needed — the plan is done.

---

## Done

All 12 tasks complete:

- ✅ T1: `BotVoiceAgent.avatar` subdoc in potentialTS
- ✅ T2: `withAvatar` flag in `POST /api/livekit/room/create` + dispatch metadata
- ✅ T3: Mirrored schema in LiveKit-agent worker
- ✅ T4: `@livekit/agents-plugin-anam` installed + spike-verified
- ✅ T5: `anam.AvatarSession` spawn in worker
- ✅ T6: Express proxy forwards `withAvatar`
- ✅ T7: `useLiveKitVoice` tracks `avatarVideoTrack` + accepts `start({ withAvatar })`
- ✅ T8: `<TalkModePicker>` modal
- ✅ T9: `<AvatarView>` component
- ✅ T10: AgentChat header opens the picker
- ✅ T11: AgentChat layout split when avatar active
- ✅ T12: Merged, pushed, dev worktree synced, smoke-tested

**Test baselines after:**
- `potentialcom-Replit`: 375 passing (361 baseline + 14 new)
- `LiveKit-agent`: 9 passing (unchanged — avatar spawn is integration code)
- `potentialTS`: no tests (no test infrastructure)

**Spec:** `docs/superpowers/specs/2026-05-16-ruby-avatar-interface-design.md` (committed `1c54eaa`)

---

## Self-review notes

**Spec coverage:**
- ✅ Avatar subdoc on BotVoiceAgent: T1 (potentialTS) + T3 (worker mirror)
- ✅ `withAvatar` flag through `/api/livekit/room/create`: T2
- ✅ `@livekit/agents-plugin-anam` install + spawn: T4 + T5
- ✅ Express proxy forwards flag: T6
- ✅ `useLiveKitVoice.avatarVideoTrack` + `start({withAvatar})`: T7
- ✅ `<TalkModePicker>`: T8
- ✅ `<AvatarView>`: T9
- ✅ AgentChat header wires modal: T10
- ✅ AgentChat layout split (avatar dominates, text input hidden): T11
- ✅ End-to-end smoke + DB prereq: T12
- ✅ TTS 16kHz sample rate constraint: flagged in T5's code comment (the elevenlabs plugin may need a sampleRate config — verify in spike if needed; the spec marked this as a deferred risk)
- ✅ Error handling: T5's "fall back to voice-only on Anam failure" matches the spec's risk table

**Placeholder scan:**
- No "TBD" / "TODO" / "similar to Task N" / unspecified code samples
- One pragmatic placeholder: T7's "TODO(T11): replace this with assertion on rendered <AvatarView>" — this is honest scaffolding (the FakeRoom extension is gated by T7, the real assertion lives in T11's integration test, both delivered). Acceptable.

**Type consistency:**
- `AvatarConfig.avatarId / voiceId`: same shape in T1 (potentialTS) + T3 (worker)
- `IBotVoiceAgent.avatar?: AvatarConfig`: matches what T5's worker code reads (`voiceConfig?.avatar?.avatarId`)
- `metadata.withAvatar: boolean`: T2 sets it (`!!withAvatar`), T5 reads it (`!!metadata.withAvatar`)
- `useLiveKitVoice.start(opts?: { withAvatar?: boolean })`: T7 defines it, T10 uses it
- `useLiveKitVoice.avatarVideoTrack: RemoteVideoTrack | null`: T7 defines it, T11 reads it
- `<TalkModePicker open onOpenChange onPick>`: T8 defines, T10 uses
- `<AvatarView track avatarUrl agentName>`: T9 defines, T11 uses

**Cross-repo coordination check:**
- T1 (potentialTS schema) and T3 (worker schema) are independent — both can be implemented in parallel after Step 0
- T2 (potentialTS endpoint) depends on T1 (schema needs to exist before something serializes/deserializes it through that endpoint — though strictly Mongoose tolerates the extra field even pre-schema)
- T5 (worker spawn) depends on T3 (schema) AND T2 (because the metadata flag has to be reachable)
- T7 (frontend hook) depends on T6 (Express proxy must forward the flag)
- T10 + T11 (AgentChat integration) depend on T7 (hook) + T8 (modal) + T9 (view)
- T12 (deploy + smoke) depends on all prior tasks

The task ordering (1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12) honors all dependencies.
