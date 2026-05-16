# Ruby Chat — App-Grade UX Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Ruby chat surface on `/demo` from a marketing embed into a real chat-app surface by adding the behaviors users expect (auto-grow textarea, smart auto-scroll, copy/regenerate/retry/clear, hover timestamps) — staying inside the existing brand language.

**Architecture:** Bottom-up. (1) Extend the shared `AgentMessage` type with `createdAt` and backfill all 5 message-creation sites. (2) Add `clear()` and `regenerate(id)` actions to `useAgentChat`. (3) Build 6 small standalone components + 1 hook, each with its own TDD pass: `useSmartScroll`, `AutoGrowTextarea`, `HoverTimestamp`, `MessageActions`, `ScrollToLatestPill`, `ClearConversationMenu`. (4) Integrate them into `AgentChat` + `MessageBubble`.

**Tech Stack:** React 18 + TypeScript. Tailwind. Vitest + `@testing-library/react` (jsdom). shadcn primitives already in repo: `@/components/ui/dropdown-menu`, `@/components/ui/alert-dialog`, `@/components/ui/button`. Lucide-react icons. No new deps.

**Spec:** `docs/superpowers/specs/2026-05-16-ruby-chat-app-grade-ux-design.md` (committed `607028f`).

**Working repo:** `/Users/potdev/Documents/GitHub/potentialcom-Replit` on branch `main`. Dev server runs at port 5001 from the worktree at `.claude/worktrees/ruby-livekit-native-voice/` — keep it synced after each merge to main so HMR picks up changes.

**Prerequisite environment:**
- Node v20.19.4 via nvm: prepend `PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH` to every `npm` / `npx` command.
- Existing test baseline: **323 passing**. Each task should add new tests without breaking any existing ones.

**Working branch:** `claude/ruby-chat-app-grade-ux`. Commit per task; merge to `main` with `--no-ff` at the end of every task (matches the cadence used for the previous chat-elevation passes).

---

## File Structure (locked-in)

### Modified files

```
shared/agent.ts                                              ← +createdAt on AgentMessage
client/src/components/agent/useAgentChat.ts                  ← +createdAt on 5 sites, +clear(), +regenerate()
client/src/components/agent/useAgentChat.test.ts             ← +tests for clear/regenerate/createdAt
client/src/components/agent/AgentChat.tsx                    ← wire textarea/scroll/menu
client/src/components/agent/MessageBubble.tsx                ← wire MessageActions + HoverTimestamp
client/src/components/agent/voice/AgentChatVoice.test.tsx    ← no changes needed (existing placeholder regex already /message ruby/i)
```

### New files

```
client/src/components/agent/hooks/useSmartScroll.ts
client/src/components/agent/hooks/useSmartScroll.test.ts
client/src/components/agent/AutoGrowTextarea.tsx
client/src/components/agent/AutoGrowTextarea.test.tsx
client/src/components/agent/HoverTimestamp.tsx
client/src/components/agent/HoverTimestamp.test.tsx
client/src/components/agent/MessageActions.tsx
client/src/components/agent/MessageActions.test.tsx
client/src/components/agent/ScrollToLatestPill.tsx
client/src/components/agent/ScrollToLatestPill.test.tsx
client/src/components/agent/ClearConversationMenu.tsx
client/src/components/agent/ClearConversationMenu.test.tsx
```

12 new files. 5 modified.

---

## Setup: create the working branch

- [ ] **Step 0: Create branch + verify clean baseline**

Run:
```bash
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit checkout main
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit pull --ff-only
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit checkout -b claude/ruby-chat-app-grade-ux
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run --root /Users/potdev/Documents/GitHub/potentialcom-Replit
```

Expected: 323 tests passing across 43 files.

If any test fails before any work is done, stop and surface the failure to the human.

---

## Task 1: Add `createdAt` to `AgentMessage` + backfill all creation sites

Add a `createdAt: number` field to the shared message shape, populate it everywhere a message is created. No behavioral change — purely a data field that the UI will start reading in Task 6.

**Files:**
- Modify: `shared/agent.ts`
- Modify: `client/src/components/agent/useAgentChat.ts` (5 creation sites)
- Modify: `client/src/components/agent/useAgentChat.test.ts` (add createdAt assertions)

- [ ] **Step 1: Write the failing tests**

Append to `client/src/components/agent/useAgentChat.test.ts` (inside the existing `describe("useAgentChat — pushExternalEvent", ...)`):

```ts
  it("stamps a numeric createdAt on a user-transcript message", () => {
    const { result } = renderHook(() => useAgentChat("ruby"));
    const before = Date.now();
    act(() => {
      result.current.pushExternalEvent({
        kind: "user-transcript",
        text: "hi",
      });
    });
    const after = Date.now();
    const msg = result.current.messages[0];
    expect(typeof msg.createdAt).toBe("number");
    expect(msg.createdAt).toBeGreaterThanOrEqual(before);
    expect(msg.createdAt).toBeLessThanOrEqual(after);
  });

  it("stamps createdAt on agent-response, agent-response-stream, and tool-call-created agent messages", () => {
    const { result } = renderHook(() => useAgentChat("ruby"));
    const before = Date.now();
    act(() => {
      result.current.pushExternalEvent({ kind: "agent-response", text: "hello" });
      result.current.pushExternalEvent({
        kind: "agent-response-stream",
        turnId: "turn-2",
        text: "world",
      });
      result.current.pushExternalEvent({
        kind: "user-transcript",
        text: "another",
      });
      result.current.pushExternalEvent({
        kind: "tool-call",
        id: "t-1",
        name: "fake_tool",
        args: {},
        async: false,
      });
    });
    const after = Date.now();
    for (const m of result.current.messages) {
      expect(typeof m.createdAt).toBe("number");
      expect(m.createdAt).toBeGreaterThanOrEqual(before);
      expect(m.createdAt).toBeLessThanOrEqual(after);
    }
  });
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit \
  client/src/components/agent/useAgentChat.test.ts
```

Expected: 2 new test failures (both with "expected number, got undefined" or similar).

- [ ] **Step 3: Add `createdAt` to the `AgentMessage` interface**

In `shared/agent.ts`, modify the `AgentMessage` interface to add the field (placed after `turnId` to keep optional fields grouped):

```ts
export interface AgentMessage {
  id: string;
  role: "user" | "agent";
  text: string;
  tools: ToolInvocation[];
  imageUrl?: string;
  status: "streaming" | "complete" | "error";
  turnId?: string;
  // Wall-clock time (Date.now()) the message was first created. Used by
  // the UI to render a hover timestamp on each message bubble. Required:
  // every message-creation site in useAgentChat sets this explicitly.
  createdAt: number;
}
```

- [ ] **Step 4: Backfill all 5 message-creation sites in `useAgentChat.ts`**

Edit `client/src/components/agent/useAgentChat.ts`. Five locations:

**Site A — `user-transcript` case** (currently around line 85):
```ts
return [
  ...prev,
  {
    id: nextId("user"),
    role: "user",
    text: event.text,
    tools: [],
    status: "complete",
    createdAt: Date.now(),
  },
];
```

**Site B — `agent-response` case, "create new" branch** (currently around line 125):
```ts
return [
  ...prev,
  {
    id: nextId("agent"),
    role: "agent",
    text: event.text,
    tools: [],
    status: "complete",
    createdAt: Date.now(),
  },
];
```

**Site C — `agent-response-stream` case, "create new" branch** (currently around line 143):
```ts
return [
  ...prev,
  {
    id: nextId("agent"),
    role: "agent",
    text: event.text,
    tools: [],
    status: "complete",
    turnId: event.turnId,
    createdAt: Date.now(),
  },
];
```

**Site D — `tool-call` case, fallback "no agent message exists" branch** (currently around line 180):
```ts
return [
  ...prev,
  {
    id: nextId("agent"),
    role: "agent",
    text: "",
    tools: [invocation],
    status: "complete",
    createdAt: Date.now(),
  },
];
```

**Site E — typed `send()` (both user + agent messages created in pair)** (currently around line 212):
```ts
const now = Date.now();
const userMessage: AgentMessage = {
  id: nextId("user"),
  role: "user",
  text,
  tools: [],
  imageUrl,
  status: "complete",
  createdAt: now,
};
const agentId = nextId("agent");
const agentMessage: AgentMessage = {
  id: agentId,
  role: "agent",
  text: "",
  tools: [],
  status: "streaming",
  createdAt: now,
};
```

- [ ] **Step 5: Type-check**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit tsc \
  --noEmit -p /Users/potdev/Documents/GitHub/potentialcom-Replit/tsconfig.json
```

Expected: clean.

If type errors point at the existing voice test mocks (the `messages` array seeded in `AgentChatVoice.test.tsx`), add `createdAt: Date.now()` to each mock message there too. There's typically one mock around line 170 — the test that seeds an agent message for the auto-speak removal proof was already deleted, so only the test fixture in the voice tests may need it.

- [ ] **Step 6: Run the full test suite**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit
```

Expected: 325 passing (323 baseline + 2 new).

- [ ] **Step 7: Commit**

```bash
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit add shared/agent.ts client/src/components/agent/useAgentChat.ts client/src/components/agent/useAgentChat.test.ts
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit commit -m "useAgentChat: stamp createdAt on every message creation

Adds required AgentMessage.createdAt (Date.now()) populated at all 5
creation sites (typed send, user-transcript, agent-response,
agent-response-stream, tool-call fallback). UI will read this in the
upcoming HoverTimestamp component. No behavior change."
```

---

## Task 2: Add `clear()` action to `useAgentChat`

Aborts any in-flight stream, resets messages, mints a new sessionId, resets status to idle.

**Files:**
- Modify: `client/src/components/agent/useAgentChat.ts`
- Modify: `client/src/components/agent/useAgentChat.test.ts`

- [ ] **Step 1: Write the failing tests**

Append to `useAgentChat.test.ts`:

```ts
  it("clear() resets messages to [], mints a new sessionId, and sets status idle", () => {
    const { result } = renderHook(() => useAgentChat("ruby"));
    const originalSessionId = result.current.sessionId;
    act(() => {
      result.current.pushExternalEvent({ kind: "user-transcript", text: "one" });
      result.current.pushExternalEvent({ kind: "agent-response", text: "two" });
    });
    expect(result.current.messages.length).toBe(2);

    act(() => {
      result.current.clear();
    });

    expect(result.current.messages).toEqual([]);
    expect(result.current.status).toBe("idle");
    expect(result.current.sessionId).not.toBe(originalSessionId);
    expect(result.current.sessionId.length).toBeGreaterThan(0);
  });
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit \
  client/src/components/agent/useAgentChat.test.ts
```

Expected: FAIL with `clear is not a function` (or similar).

- [ ] **Step 3: Add the `clear` action**

In `useAgentChat.ts`:

**A.** Promote `sessionIdRef` to also drive a `sessionId` state so React re-renders consumers when it changes:

The current code is:
```ts
const sessionIdRef = useRef<string>(newSessionId());
```
and `return { ..., sessionId: sessionIdRef.current, ... }`.

Refactor to:
```ts
const [sessionId, setSessionId] = useState<string>(() => newSessionId());
```
…then replace every `sessionIdRef.current` reference in the file with `sessionId` (one usage in `send()`'s body that includes it in the fetch body). And return `sessionId` (the state value) directly.

**Search-and-replace summary inside `useAgentChat.ts`:**
- Delete the `sessionIdRef` declaration.
- Add `const [sessionId, setSessionId] = useState<string>(() => newSessionId());` near the top of the hook body (after the other useState calls).
- Replace `sessionIdRef.current` → `sessionId` (1 occurrence in the `send()` body's fetch payload).
- Update the return statement: `sessionId: sessionIdRef.current` → `sessionId`.

**B.** Add the `clear` callback (place right after `pushExternalEvent` definition):

```ts
const clear = useCallback(() => {
  // Abort any in-flight stream so a half-complete agent message doesn't
  // get appended after the reset. The existing send() also clears
  // abortRef in its finally — the dual-write here is intentional: even
  // if send() is mid-await when clear() fires, the abort guarantees the
  // controller is torn down NOW.
  abortRef.current?.abort();
  abortRef.current = null;
  setMessages([]);
  setSessionId(newSessionId());
  setStatus("idle");
}, []);
```

**C.** Expose it in the `UseAgentChat` interface:

```ts
export interface UseAgentChat {
  messages: AgentMessage[];
  status: "idle" | "streaming";
  sessionId: string;
  send: (text: string, imageUrl?: string) => Promise<void>;
  pushExternalEvent: (event: ExternalVoiceEvent) => void;
  clear: () => void;
}
```

…and return it from the hook:
```ts
return { messages, status, sessionId, send, pushExternalEvent, clear };
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit \
  client/src/components/agent/useAgentChat.test.ts
```

Expected: all green; 1 new test passing.

- [ ] **Step 5: Run the full test suite + type-check**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit tsc \
  --noEmit -p /Users/potdev/Documents/GitHub/potentialcom-Replit/tsconfig.json
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit
```

Expected: clean type-check; 326 passing.

- [ ] **Step 6: Commit**

```bash
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit add client/src/components/agent/useAgentChat.ts client/src/components/agent/useAgentChat.test.ts
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit commit -m "useAgentChat: add clear() action

Aborts any in-flight stream, resets messages to [], mints a new
sessionId (promoted from ref to state so consumers re-render), sets
status to idle. Powers the upcoming ClearConversationMenu."
```

---

## Task 3: Add `regenerate(messageId)` action to `useAgentChat`

Removes the target agent message + everything after, then re-sends the immediately preceding user message via `send()`. No-ops on missing target, no-ops on no-preceding-user, no-ops while streaming.

**Files:**
- Modify: `client/src/components/agent/useAgentChat.ts`
- Modify: `client/src/components/agent/useAgentChat.test.ts`

- [ ] **Step 1: Write the failing tests**

Append to `useAgentChat.test.ts`:

```ts
  it("regenerate() removes the target agent message and re-sends the preceding user message", async () => {
    // Mock fetch so send() in the implementation completes with a clean
    // empty stream — the assertion below only cares that send was called
    // with the original user text, not what comes back.
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("data: [DONE]\n\n", {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useAgentChat("ruby"));

    // Seed a turn manually via pushExternalEvent (avoids triggering send()
    // for the seed).
    act(() => {
      result.current.pushExternalEvent({ kind: "user-transcript", text: "find me a lipstick" });
      result.current.pushExternalEvent({ kind: "agent-response", text: "old reply" });
    });
    expect(result.current.messages.length).toBe(2);
    const oldAgent = result.current.messages[1];

    await act(async () => {
      result.current.regenerate(oldAgent.id);
    });

    // The old agent message was removed; send() re-emitted both a new
    // user message and a new (streaming) agent message — but for this
    // test what matters is that fetch was called with the original user
    // text in the body.
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const callArgs = fetchMock.mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body.message).toBe("find me a lipstick");

    vi.unstubAllGlobals();
  });

  it("regenerate() no-ops when no preceding user message exists", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useAgentChat("ruby"));
    act(() => {
      // Two agent messages, no user message between or before.
      result.current.pushExternalEvent({ kind: "agent-response", text: "first" });
    });
    const orphanAgent = result.current.messages[0];

    await act(async () => {
      result.current.regenerate(orphanAgent.id);
    });

    expect(fetchMock).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("regenerate() no-ops on unknown messageId", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useAgentChat("ruby"));
    await act(async () => {
      result.current.regenerate("not-a-real-id");
    });
    expect(fetchMock).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit \
  client/src/components/agent/useAgentChat.test.ts
```

Expected: 3 new failures (`regenerate is not a function`).

- [ ] **Step 3: Add the `regenerate` action**

In `useAgentChat.ts`, define the action (place right after the `clear` callback). Note: the implementation captures `messages` from a `useRef` that mirrors state so we can read the latest array inside the callback without re-binding on every render.

First add a sync ref at the top of the hook body (right after `sessionId` state):

```ts
// Mirror messages into a ref so callbacks (regenerate) can read the
// latest array without listing it in their deps. Cheaper than putting
// messages in the regenerate dep array and re-binding on every render.
const messagesRef = useRef<AgentMessage[]>([]);
useEffect(() => {
  messagesRef.current = messages;
}, [messages]);
```

Then the action itself (note: relies on `send` already being defined above — place `regenerate` BELOW the `send` useCallback):

```ts
const regenerate = useCallback(
  (messageId: string): void => {
    if (status === "streaming") return; // don't allow mid-stream regen
    const current = messagesRef.current;
    const targetIdx = current.findIndex((m) => m.id === messageId);
    if (targetIdx === -1) return;

    // Walk backwards from targetIdx - 1 to find the immediately preceding
    // user message. If none exists, no-op.
    let userIdx = -1;
    for (let i = targetIdx - 1; i >= 0; i--) {
      if (current[i].role === "user") {
        userIdx = i;
        break;
      }
    }
    if (userIdx === -1) return;

    const userMessage = current[userIdx];

    // Drop the target agent message and everything after it; keep
    // everything up to AND INCLUDING the preceding user message…
    // …actually NO. send() will re-append both a fresh user + agent pair,
    // so we drop the user message too. Trim up to (but not including)
    // the user message.
    setMessages(current.slice(0, userIdx));

    // Re-fire the original send with the same text + imageUrl. send()
    // appends a new user + agent pair and kicks off the stream.
    void send(userMessage.text, userMessage.imageUrl);
  },
  [status, send],
);
```

Expose it on `UseAgentChat`:

```ts
export interface UseAgentChat {
  messages: AgentMessage[];
  status: "idle" | "streaming";
  sessionId: string;
  send: (text: string, imageUrl?: string) => Promise<void>;
  pushExternalEvent: (event: ExternalVoiceEvent) => void;
  clear: () => void;
  regenerate: (messageId: string) => void;
}
```

…and add it to the return statement:
```ts
return { messages, status, sessionId, send, pushExternalEvent, clear, regenerate };
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit \
  client/src/components/agent/useAgentChat.test.ts
```

Expected: 3 new tests passing.

- [ ] **Step 5: Run the full test suite + type-check**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit tsc \
  --noEmit -p /Users/potdev/Documents/GitHub/potentialcom-Replit/tsconfig.json
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit
```

Expected: clean; 329 passing.

- [ ] **Step 6: Commit**

```bash
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit add client/src/components/agent/useAgentChat.ts client/src/components/agent/useAgentChat.test.ts
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit commit -m "useAgentChat: add regenerate(messageId) action

Walks back from the target agent message to the immediately preceding
user message, trims the array, re-sends via send(). No-ops on
unknown id, no preceding user message, or mid-stream. Powers the
upcoming MessageActions Regenerate + Retry buttons."
```

---

## Task 4: `useSmartScroll(ref)` hook

Tracks whether the user is "near bottom" of the scrollable element. Returns `{ isNearBottom, scrollToBottom }`. Default-permissive when ref is null.

**Files:**
- Create: `client/src/components/agent/hooks/useSmartScroll.ts`
- Create: `client/src/components/agent/hooks/useSmartScroll.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `client/src/components/agent/hooks/useSmartScroll.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRef } from "react";
import { useSmartScroll } from "./useSmartScroll";

// Helper: a jsdom HTMLElement with controllable scroll metrics + a real
// scroll listener.
function makeScrollEl(): HTMLDivElement {
  const el = document.createElement("div");
  // jsdom doesn't lay out elements — we set the metrics directly.
  Object.defineProperty(el, "scrollHeight", { value: 1000, writable: true });
  Object.defineProperty(el, "clientHeight", { value: 400, writable: true });
  Object.defineProperty(el, "scrollTop", { value: 0, writable: true });
  return el;
}

describe("useSmartScroll", () => {
  it("returns isNearBottom: true when ref is null (default-permissive)", () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      return useSmartScroll(ref);
    });
    expect(result.current.isNearBottom).toBe(true);
  });

  it("returns isNearBottom: true when scrolled within 120px of bottom", () => {
    const el = makeScrollEl();
    // scrollHeight 1000 - (scrollTop 550 + clientHeight 400) = 50 (< 120 → near bottom)
    (el as any).scrollTop = 550;

    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(el);
      return useSmartScroll(ref);
    });

    // Fire a scroll event to trigger recalc.
    act(() => {
      el.dispatchEvent(new Event("scroll"));
    });
    expect(result.current.isNearBottom).toBe(true);
  });

  it("returns isNearBottom: false when scrolled further than 120px from bottom", () => {
    const el = makeScrollEl();
    // scrollHeight 1000 - (scrollTop 100 + clientHeight 400) = 500 (> 120 → NOT near bottom)
    (el as any).scrollTop = 100;

    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(el);
      return useSmartScroll(ref);
    });

    act(() => {
      el.dispatchEvent(new Event("scroll"));
    });
    expect(result.current.isNearBottom).toBe(false);
  });

  it("scrollToBottom() sets scrollTop to scrollHeight on the ref'd element", () => {
    const el = makeScrollEl();
    (el as any).scrollTop = 0;
    // Mock scrollTo since jsdom doesn't implement smooth scrolling.
    const scrollToSpy = vi.fn();
    (el as any).scrollTo = scrollToSpy;

    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(el);
      return useSmartScroll(ref);
    });

    act(() => {
      result.current.scrollToBottom(true);
    });

    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 1000,
      behavior: "smooth",
    });
  });

  it("scrollToBottom(false) uses 'auto' behavior", () => {
    const el = makeScrollEl();
    const scrollToSpy = vi.fn();
    (el as any).scrollTo = scrollToSpy;

    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(el);
      return useSmartScroll(ref);
    });

    act(() => {
      result.current.scrollToBottom(false);
    });

    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 1000,
      behavior: "auto",
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit \
  client/src/components/agent/hooks/useSmartScroll.test.ts
```

Expected: FAIL — file doesn't exist.

- [ ] **Step 3: Implement the hook**

Create `client/src/components/agent/hooks/useSmartScroll.ts`:

```ts
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Threshold (in pixels) within which the user is considered "near the
 * bottom" of the scrollable element. Auto-scroll triggers when this is
 * true; the "↓ Latest message" pill renders when it's false.
 */
const NEAR_BOTTOM_THRESHOLD = 120;

export interface UseSmartScrollResult {
  /**
   * True if the user is within NEAR_BOTTOM_THRESHOLD of the bottom of
   * the scrollable element, OR if the ref is not yet attached.
   * Default-permissive: prevents the pill from flashing on first paint
   * before the ref has bound.
   */
  isNearBottom: boolean;
  /**
   * Programmatically scroll the element to its bottom. Pass smooth=true
   * for animated scroll, false for instant.
   */
  scrollToBottom: (smooth?: boolean) => void;
}

/**
 * Tracks whether the user is near the bottom of a scrollable element,
 * and exposes a programmatic scroll-to-bottom callback. Used by
 * AgentChat to decide whether new-message auto-scroll fires, and to
 * show/hide the ScrollToLatestPill.
 *
 * Listens to native 'scroll' events; recomputes on each event but
 * batches state updates via requestAnimationFrame to avoid layout
 * thrashing during fast scrolling.
 */
export function useSmartScroll(
  ref: React.RefObject<HTMLElement>,
): UseSmartScrollResult {
  const [isNearBottom, setIsNearBottom] = useState<boolean>(true);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const recalc = () => {
      const distanceFromBottom =
        el.scrollHeight - (el.scrollTop + el.clientHeight);
      setIsNearBottom(distanceFromBottom < NEAR_BOTTOM_THRESHOLD);
    };

    const onScroll = () => {
      if (rafRef.current !== null) return; // already scheduled
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        recalc();
      });
    };

    // Compute once on mount in case the element starts not-at-bottom.
    recalc();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [ref]);

  const scrollToBottom = useCallback(
    (smooth: boolean = true) => {
      const el = ref.current;
      if (!el) return;
      el.scrollTo({
        top: el.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    },
    [ref],
  );

  return { isNearBottom, scrollToBottom };
}
```

Note: the jsdom test calls `requestAnimationFrame` is wired but the test fires `dispatchEvent` synchronously then checks the result. Because `act()` flushes effects and the test reads the state RIGHT after the scroll event, the rAF may not have fired in time. To make the tests pass without flakiness, the implementation calls `recalc()` synchronously inside `onScroll` when running under test. Cleaner approach: keep it simple and call `recalc()` directly inside `onScroll` (drop the rAF batching since the test asserts synchronously). The user-visible thrashing concern is mild — re-add rAF later if profiling shows it.

**Revised `onScroll` (use this — no rAF):**
```ts
const onScroll = () => {
  recalc();
};
```

And remove the `rafRef` ref + cancelAnimationFrame block; only `removeEventListener` stays in cleanup.

- [ ] **Step 4: Run tests to verify they pass**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit \
  client/src/components/agent/hooks/useSmartScroll.test.ts
```

Expected: all 5 tests passing.

- [ ] **Step 5: Type-check + full suite**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit tsc \
  --noEmit -p /Users/potdev/Documents/GitHub/potentialcom-Replit/tsconfig.json
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit
```

Expected: 334 passing (329 + 5).

- [ ] **Step 6: Commit**

```bash
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit add client/src/components/agent/hooks/useSmartScroll.ts client/src/components/agent/hooks/useSmartScroll.test.ts
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit commit -m "Add useSmartScroll hook

Tracks whether a scrollable element is within 120px of bottom; exposes
scrollToBottom(smooth). Default-permissive when ref is null. Used by
AgentChat to gate auto-scroll + the ScrollToLatestPill."
```

---

## Task 5: `AutoGrowTextarea` component

Replaces the single-line input. Grows with content up to 160px, Enter submits, Shift+Enter newline, autoFocusKey refocuses.

**Files:**
- Create: `client/src/components/agent/AutoGrowTextarea.tsx`
- Create: `client/src/components/agent/AutoGrowTextarea.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `client/src/components/agent/AutoGrowTextarea.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { AutoGrowTextarea } from "./AutoGrowTextarea";

function Harness({
  onSubmit,
  disabled,
  autoFocusKey,
  initial = "",
}: {
  onSubmit?: () => void;
  disabled?: boolean;
  autoFocusKey?: number;
  initial?: string;
}) {
  const [value, setValue] = useState(initial);
  return (
    <AutoGrowTextarea
      value={value}
      onChange={setValue}
      onSubmit={onSubmit ?? (() => {})}
      placeholder="Message Ruby…"
      disabled={disabled}
      autoFocusKey={autoFocusKey ?? 0}
    />
  );
}

describe("AutoGrowTextarea", () => {
  it("renders a textarea with the placeholder text", () => {
    render(<Harness />);
    expect(screen.getByPlaceholderText(/message ruby/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/message ruby/i).tagName).toBe(
      "TEXTAREA",
    );
  });

  it("reflects the controlled value", () => {
    render(<Harness initial="hello world" />);
    const ta = screen.getByPlaceholderText(/message ruby/i) as HTMLTextAreaElement;
    expect(ta.value).toBe("hello world");
  });

  it("calls onSubmit + prevents default when Enter is pressed without Shift", () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} initial="hi" />);
    const ta = screen.getByPlaceholderText(/message ruby/i);

    const enterEvent = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    });
    ta.dispatchEvent(enterEvent);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(enterEvent.defaultPrevented).toBe(true);
  });

  it("does NOT call onSubmit when Shift+Enter is pressed (allows newline)", () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} initial="hi" />);
    const ta = screen.getByPlaceholderText(/message ruby/i);

    const shiftEnterEvent = new KeyboardEvent("keydown", {
      key: "Enter",
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    ta.dispatchEvent(shiftEnterEvent);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(shiftEnterEvent.defaultPrevented).toBe(false);
  });

  it("blocks Enter when disabled", () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} disabled initial="hi" />);
    const ta = screen.getByPlaceholderText(/message ruby/i);
    fireEvent.keyDown(ta, { key: "Enter" });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("autoFocusKey change refocuses the textarea", async () => {
    function Wrapper() {
      const [k, setK] = useState(0);
      return (
        <>
          <button onClick={() => setK((x) => x + 1)}>bump</button>
          <Harness autoFocusKey={k} />
        </>
      );
    }
    const user = userEvent.setup();
    render(<Wrapper />);
    const ta = screen.getByPlaceholderText(/message ruby/i);

    // Initial mount focuses (autoFocusKey is 0, effect runs once).
    expect(document.activeElement).toBe(ta);

    // Blur it.
    (ta as HTMLTextAreaElement).blur();
    expect(document.activeElement).not.toBe(ta);

    // Bumping autoFocusKey should refocus.
    await user.click(screen.getByText("bump"));
    expect(document.activeElement).toBe(ta);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit \
  client/src/components/agent/AutoGrowTextarea.test.tsx
```

Expected: FAIL — file doesn't exist.

- [ ] **Step 3: Implement the component**

Create `client/src/components/agent/AutoGrowTextarea.tsx`:

```tsx
import { useEffect, useRef } from "react";

interface AutoGrowTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  /**
   * When this number/string changes, the textarea receives focus.
   * Parent bumps it on mount, after successful send, and on clear().
   */
  autoFocusKey?: number | string;
  /** Maximum visible height in pixels before the textarea scrolls. */
  maxHeight?: number;
}

const DEFAULT_MAX_HEIGHT = 160;

/**
 * Textarea that auto-resizes with its content up to `maxHeight`.
 * - Enter (no Shift) submits + prevents default newline.
 * - Shift+Enter inserts a newline (default browser behavior).
 * - Disabled blocks both typing and submit.
 * - autoFocusKey lets the parent declaratively trigger focus.
 *
 * Styling matches the prior chat input: muted/40 at rest, focus flips
 * to background + brand primary ring.
 */
export function AutoGrowTextarea({
  value,
  onChange,
  onSubmit,
  placeholder,
  disabled = false,
  autoFocusKey = 0,
  maxHeight = DEFAULT_MAX_HEIGHT,
}: AutoGrowTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Auto-resize: reset height to auto so scrollHeight shrinks back, then
  // set to scrollHeight (capped). Runs on every value change.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const newHeight = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${newHeight}px`;
  }, [value, maxHeight]);

  // autoFocusKey-driven focus.
  useEffect(() => {
    ref.current?.focus();
  }, [autoFocusKey]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          if (disabled) return;
          onSubmit();
        }
      }}
      placeholder={placeholder}
      disabled={disabled}
      rows={1}
      className="flex-1 min-h-[44px] resize-none rounded-2xl border border-border bg-muted/40 px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-all focus:border-primary/60 focus:bg-background focus:ring-2 focus:ring-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
      data-testid="agent-chat-input"
    />
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit \
  client/src/components/agent/AutoGrowTextarea.test.tsx
```

Expected: all 6 tests passing.

- [ ] **Step 5: Type-check**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit tsc \
  --noEmit -p /Users/potdev/Documents/GitHub/potentialcom-Replit/tsconfig.json
```

Expected: clean.

- [ ] **Step 6: Commit**

```bash
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit add client/src/components/agent/AutoGrowTextarea.tsx client/src/components/agent/AutoGrowTextarea.test.tsx
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit commit -m "Add AutoGrowTextarea component

Multi-line chat input: grows with content (cap 160px), Enter submits,
Shift+Enter newline, autoFocusKey-driven focus. Replaces the
single-line <input> in AgentChat (wired in Task 10)."
```

---

## Task 6: `HoverTimestamp` component + `relativeTime` helper

Tiny text under each message bubble showing how long ago it was sent. Inline relativeTime helper (no dep).

**Files:**
- Create: `client/src/components/agent/HoverTimestamp.tsx`
- Create: `client/src/components/agent/HoverTimestamp.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `client/src/components/agent/HoverTimestamp.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HoverTimestamp, relativeTime } from "./HoverTimestamp";

describe("relativeTime", () => {
  const NOW = 1_700_000_000_000;

  it("returns 'just now' for ages under 60 seconds", () => {
    expect(relativeTime(NOW - 0, NOW)).toBe("just now");
    expect(relativeTime(NOW - 59_000, NOW)).toBe("just now");
  });

  it("returns 'Xm ago' for ages under 60 minutes", () => {
    expect(relativeTime(NOW - 60_000, NOW)).toBe("1m ago");
    expect(relativeTime(NOW - 5 * 60_000, NOW)).toBe("5m ago");
    expect(relativeTime(NOW - 59 * 60_000, NOW)).toBe("59m ago");
  });

  it("returns 'Xh ago' for ages under 24 hours", () => {
    expect(relativeTime(NOW - 60 * 60_000, NOW)).toBe("1h ago");
    expect(relativeTime(NOW - 3 * 60 * 60_000, NOW)).toBe("3h ago");
    expect(relativeTime(NOW - 23 * 60 * 60_000, NOW)).toBe("23h ago");
  });

  it("returns 'Xd ago' for ages under 7 days", () => {
    expect(relativeTime(NOW - 24 * 60 * 60_000, NOW)).toBe("1d ago");
    expect(relativeTime(NOW - 6 * 24 * 60 * 60_000, NOW)).toBe("6d ago");
  });

  it("returns a localeDateString for ages >= 7 days", () => {
    const result = relativeTime(NOW - 8 * 24 * 60 * 60_000, NOW);
    // Don't assert exact format (locale-dependent), just that it's not the
    // earlier-format strings.
    expect(result).not.toMatch(/ago$/);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("HoverTimestamp", () => {
  it("renders the relative time for the given createdAt", () => {
    const now = Date.now();
    render(<HoverTimestamp createdAt={now - 5 * 60_000} />);
    expect(screen.getByText(/5m ago/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit \
  client/src/components/agent/HoverTimestamp.test.tsx
```

Expected: FAIL — file doesn't exist.

- [ ] **Step 3: Implement the component**

Create `client/src/components/agent/HoverTimestamp.tsx`:

```tsx
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

/**
 * Pure helper. Returns a short human-readable relative time string.
 * Exported for direct testing.
 *
 * - < 1 min  → "just now"
 * - < 1 hour → "Xm ago"
 * - < 1 day  → "Xh ago"
 * - < 1 week → "Xd ago"
 * - >= 1 week → toLocaleDateString()
 */
export function relativeTime(createdAt: number, now: number = Date.now()): string {
  const delta = Math.max(0, now - createdAt);
  if (delta < MINUTE) return "just now";
  if (delta < HOUR) return `${Math.floor(delta / MINUTE)}m ago`;
  if (delta < DAY) return `${Math.floor(delta / HOUR)}h ago`;
  if (delta < WEEK) return `${Math.floor(delta / DAY)}d ago`;
  return new Date(createdAt).toLocaleDateString();
}

interface HoverTimestampProps {
  createdAt: number;
}

/**
 * Tiny text rendered below a message bubble. Hidden by default; the
 * parent uses group-hover:opacity-100 to reveal on hover. Re-renders
 * happen often enough during real chat use that no interval timer is
 * needed; worst-case the label is stale by a few seconds.
 */
export function HoverTimestamp({ createdAt }: HoverTimestampProps) {
  return (
    <div
      className="text-[10px] text-muted-foreground/60 opacity-0 transition-opacity group-hover:opacity-100 mt-1 select-none"
      data-testid="hover-timestamp"
    >
      {relativeTime(createdAt)}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit \
  client/src/components/agent/HoverTimestamp.test.tsx
```

Expected: all 6 tests passing.

- [ ] **Step 5: Type-check**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit tsc \
  --noEmit -p /Users/potdev/Documents/GitHub/potentialcom-Replit/tsconfig.json
```

Expected: clean.

- [ ] **Step 6: Commit**

```bash
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit add client/src/components/agent/HoverTimestamp.tsx client/src/components/agent/HoverTimestamp.test.tsx
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit commit -m "Add HoverTimestamp + relativeTime helper

Tiny opacity-0 → group-hover:opacity-100 text under message bubbles
showing relative age. Pure relativeTime() helper exported for
testing. No interval timer — re-renders are frequent enough."
```

---

## Task 7: `MessageActions` component (copy / regenerate / retry)

Per-message icon buttons revealed on hover. Copy works on any agent message with text; Regenerate on last completed only; Retry replaces Regenerate when status is "error".

**Files:**
- Create: `client/src/components/agent/MessageActions.tsx`
- Create: `client/src/components/agent/MessageActions.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `client/src/components/agent/MessageActions.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MessageActions } from "./MessageActions";
import type { AgentMessage } from "@shared/agent";

function makeMsg(overrides: Partial<AgentMessage> = {}): AgentMessage {
  return {
    id: "msg-1",
    role: "agent",
    text: "hello world",
    tools: [],
    status: "complete",
    createdAt: Date.now(),
    ...overrides,
  };
}

beforeEach(() => {
  // jsdom-friendly clipboard mock.
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("MessageActions", () => {
  it("renders the Copy button for any agent message with text", () => {
    render(
      <MessageActions
        message={makeMsg()}
        isLast={false}
        onRegenerate={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /copy/i })).toBeInTheDocument();
  });

  it("does NOT render Regenerate when isLast is false", () => {
    render(
      <MessageActions
        message={makeMsg()}
        isLast={false}
        onRegenerate={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button", { name: /regenerate/i })).toBeNull();
  });

  it("renders Regenerate when isLast is true AND status is complete", () => {
    render(
      <MessageActions
        message={makeMsg({ status: "complete" })}
        isLast={true}
        onRegenerate={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /regenerate/i })).toBeInTheDocument();
  });

  it("renders Retry (instead of Regenerate) when status is error", () => {
    render(
      <MessageActions
        message={makeMsg({ status: "error" })}
        isLast={true}
        onRegenerate={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /regenerate/i })).toBeNull();
  });

  it("Copy click writes the message text to the clipboard and shows ✓ for 1500ms", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <MessageActions
        message={makeMsg({ text: "the answer is 42" })}
        isLast={false}
        onRegenerate={vi.fn()}
      />,
    );
    const copyBtn = screen.getByRole("button", { name: /copy/i });
    await user.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("the answer is 42");

    // Icon swap → button accessible name flips to "Copied".
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /copied/i })).toBeInTheDocument(),
    );

    // After 1500ms it reverts.
    vi.advanceTimersByTime(1600);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /^copy$/i })).toBeInTheDocument(),
    );
  });

  it("Regenerate click calls onRegenerate(message.id)", async () => {
    const onRegenerate = vi.fn();
    const user = userEvent.setup();
    render(
      <MessageActions
        message={makeMsg({ id: "abc-123" })}
        isLast={true}
        onRegenerate={onRegenerate}
      />,
    );
    await user.click(screen.getByRole("button", { name: /regenerate/i }));
    expect(onRegenerate).toHaveBeenCalledWith("abc-123");
  });

  it("Retry click calls onRegenerate(message.id)", async () => {
    const onRegenerate = vi.fn();
    const user = userEvent.setup();
    render(
      <MessageActions
        message={makeMsg({ id: "abc-123", status: "error" })}
        isLast={true}
        onRegenerate={onRegenerate}
      />,
    );
    await user.click(screen.getByRole("button", { name: /retry/i }));
    expect(onRegenerate).toHaveBeenCalledWith("abc-123");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit \
  client/src/components/agent/MessageActions.test.tsx
```

Expected: FAIL — file doesn't exist.

- [ ] **Step 3: Implement the component**

Create `client/src/components/agent/MessageActions.tsx`:

```tsx
import { useState } from "react";
import { Copy, Check, RotateCcw, AlertCircle } from "lucide-react";
import type { AgentMessage } from "@shared/agent";

interface MessageActionsProps {
  message: AgentMessage;
  /**
   * True when this is the most recent agent message in the conversation.
   * Gates the Regenerate button (we don't allow regenerating an older
   * reply because the user has already moved past it).
   */
  isLast: boolean;
  /**
   * Invoked with the target message id when the user clicks Regenerate
   * or Retry. Maps to useAgentChat.regenerate(id).
   */
  onRegenerate: (messageId: string) => void;
}

/**
 * Hover-revealed row of per-message actions, rendered below an agent
 * bubble. The parent uses `group` + `group-hover:opacity-100` to fade
 * the row in. Buttons themselves are always focusable (so they're
 * keyboard-accessible even without hover).
 *
 * Layout: copy + (regenerate | retry). Each button has an explicit
 * aria-label for screen readers AND a title attribute for hover tooltip.
 */
export function MessageActions({
  message,
  isLast,
  onRegenerate,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const isError = message.status === "error";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Silent failure — clipboard is gated on secure contexts.
    }
  };

  return (
    <div className="flex items-center gap-1 mt-1 opacity-0 transition-opacity group-hover:opacity-100">
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Copied" : "Copy"}
        title={copied ? "Copied" : "Copy message"}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        data-testid="message-actions-copy"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>

      {isLast && isError && (
        <button
          type="button"
          onClick={() => onRegenerate(message.id)}
          aria-label="Retry"
          title="Retry this message"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-destructive transition-colors hover:bg-destructive/10"
          data-testid="message-actions-retry"
        >
          <AlertCircle className="h-3.5 w-3.5" />
        </button>
      )}

      {isLast && !isError && message.status === "complete" && (
        <button
          type="button"
          onClick={() => onRegenerate(message.id)}
          aria-label="Regenerate"
          title="Regenerate response"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          data-testid="message-actions-regenerate"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit \
  client/src/components/agent/MessageActions.test.tsx
```

Expected: all 7 tests passing.

- [ ] **Step 5: Type-check**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit tsc \
  --noEmit -p /Users/potdev/Documents/GitHub/potentialcom-Replit/tsconfig.json
```

Expected: clean.

- [ ] **Step 6: Commit**

```bash
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit add client/src/components/agent/MessageActions.tsx client/src/components/agent/MessageActions.test.tsx
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit commit -m "Add MessageActions component

Hover-revealed row of per-message actions: Copy (always), Regenerate
(last completed only), Retry (last error only). Copy swaps icon to ✓
for 1500ms on success; silent on failure. Regen/Retry delegate to
the provided onRegenerate(id) — wired to useAgentChat.regenerate in
Task 11."
```

---

## Task 8: `ScrollToLatestPill` component

Small floating pill button that appears when the user has scrolled up from the bottom and new messages arrive.

**Files:**
- Create: `client/src/components/agent/ScrollToLatestPill.tsx`
- Create: `client/src/components/agent/ScrollToLatestPill.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `client/src/components/agent/ScrollToLatestPill.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScrollToLatestPill } from "./ScrollToLatestPill";

describe("ScrollToLatestPill", () => {
  it("renders a button with the 'Latest message' label", () => {
    render(<ScrollToLatestPill onClick={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: /latest message/i }),
    ).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<ScrollToLatestPill onClick={onClick} />);
    await user.click(screen.getByRole("button", { name: /latest message/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit \
  client/src/components/agent/ScrollToLatestPill.test.tsx
```

Expected: FAIL — file doesn't exist.

- [ ] **Step 3: Implement the component**

Create `client/src/components/agent/ScrollToLatestPill.tsx`:

```tsx
import { ArrowDown } from "lucide-react";

interface ScrollToLatestPillProps {
  onClick: () => void;
}

/**
 * Floating pill that surfaces when the user has scrolled up from the
 * bottom of the message list. One-click jump back to the latest.
 * The parent (AgentChat) controls visibility — this component renders
 * unconditionally and assumes the parent only mounts it when needed.
 *
 * Visual: absolute-positioned over the bottom-center of the messages
 * area, primary-tinted pill, with a subtle shadow so it floats above
 * the message text.
 */
export function ScrollToLatestPill({ onClick }: ScrollToLatestPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Scroll to latest message"
      className="absolute bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
      data-testid="scroll-to-latest-pill"
    >
      <ArrowDown className="h-3.5 w-3.5" />
      Latest message
    </button>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit \
  client/src/components/agent/ScrollToLatestPill.test.tsx
```

Expected: both tests passing.

- [ ] **Step 5: Type-check**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit tsc \
  --noEmit -p /Users/potdev/Documents/GitHub/potentialcom-Replit/tsconfig.json
```

Expected: clean.

- [ ] **Step 6: Commit**

```bash
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit add client/src/components/agent/ScrollToLatestPill.tsx client/src/components/agent/ScrollToLatestPill.test.tsx
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit commit -m "Add ScrollToLatestPill component

Floating primary-tinted pill 'Latest message ↓' for jumping back to
the bottom of the message list after scrolling up. Parent controls
when it mounts; component is purely presentational."
```

---

## Task 9: `ClearConversationMenu` component

Three-dot dropdown in the chat header. Menu item opens a confirm dialog; confirm calls `onClear`.

**Files:**
- Create: `client/src/components/agent/ClearConversationMenu.tsx`
- Create: `client/src/components/agent/ClearConversationMenu.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `client/src/components/agent/ClearConversationMenu.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClearConversationMenu } from "./ClearConversationMenu";

describe("ClearConversationMenu", () => {
  it("renders a three-dot menu trigger button", () => {
    render(<ClearConversationMenu onClear={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: /chat menu/i }),
    ).toBeInTheDocument();
  });

  it("opens the dropdown menu on trigger click and shows 'Clear conversation' item", async () => {
    const user = userEvent.setup();
    render(<ClearConversationMenu onClear={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /chat menu/i }));
    expect(
      screen.getByRole("menuitem", { name: /clear conversation/i }),
    ).toBeInTheDocument();
  });

  it("clicking the menu item opens a confirm dialog", async () => {
    const user = userEvent.setup();
    render(<ClearConversationMenu onClear={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /chat menu/i }));
    await user.click(
      screen.getByRole("menuitem", { name: /clear conversation/i }),
    );
    expect(
      screen.getByRole("alertdialog", { name: /clear this conversation/i }),
    ).toBeInTheDocument();
  });

  it("dialog Confirm calls onClear", async () => {
    const onClear = vi.fn();
    const user = userEvent.setup();
    render(<ClearConversationMenu onClear={onClear} />);
    await user.click(screen.getByRole("button", { name: /chat menu/i }));
    await user.click(
      screen.getByRole("menuitem", { name: /clear conversation/i }),
    );
    await user.click(screen.getByRole("button", { name: /^clear$/i }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("dialog Cancel does NOT call onClear", async () => {
    const onClear = vi.fn();
    const user = userEvent.setup();
    render(<ClearConversationMenu onClear={onClear} />);
    await user.click(screen.getByRole("button", { name: /chat menu/i }));
    await user.click(
      screen.getByRole("menuitem", { name: /clear conversation/i }),
    );
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClear).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit \
  client/src/components/agent/ClearConversationMenu.test.tsx
```

Expected: FAIL — file doesn't exist.

- [ ] **Step 3: Implement the component**

Create `client/src/components/agent/ClearConversationMenu.tsx`:

```tsx
import { useState } from "react";
import { MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ClearConversationMenuProps {
  onClear: () => void;
}

/**
 * Three-dot dropdown in the chat header. Single item "Clear
 * conversation" opens a confirm dialog. Confirm fires onClear, cancel
 * closes the dialog with no side effect.
 *
 * Voice-call considerations: this component knows nothing about voice
 * state. The parent (AgentChat) makes the call about whether to even
 * mount the menu (currently: always). onClear's implementation in
 * useAgentChat clears text history WITHOUT ending an active voice call
 * — see spec for the rationale.
 */
export function ClearConversationMenu({ onClear }: ClearConversationMenuProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Chat menu"
            title="Chat menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            data-testid="chat-menu-trigger"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            onSelect={() => setConfirmOpen(true)}
            className="text-destructive focus:text-destructive"
            data-testid="chat-menu-clear-item"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear conversation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear this conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              All messages will be removed. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onClear()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit \
  client/src/components/agent/ClearConversationMenu.test.tsx
```

Expected: all 5 tests passing.

If a test fails because the dropdown / alert dialog primitives aren't found, verify the imports in the implementation file match the paths that exist in `client/src/components/ui/` (e.g., `dropdown-menu.tsx` should export `DropdownMenu`, `DropdownMenuTrigger`, etc — check with `grep -l "DropdownMenuTrigger" client/src/components/ui/`).

- [ ] **Step 5: Type-check**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit tsc \
  --noEmit -p /Users/potdev/Documents/GitHub/potentialcom-Replit/tsconfig.json
```

Expected: clean.

- [ ] **Step 6: Commit**

```bash
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit add client/src/components/agent/ClearConversationMenu.tsx client/src/components/agent/ClearConversationMenu.test.tsx
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit commit -m "Add ClearConversationMenu component

Three-dot dropdown with single 'Clear conversation' item that opens
a confirm AlertDialog. Confirm fires onClear; cancel is a no-op."
```

---

## Task 10: Wire `AutoGrowTextarea` + `useSmartScroll` + `ScrollToLatestPill` into `AgentChat`

Replaces the `<input>` with the new textarea, plugs in the smart-scroll hook, mounts the pill conditionally.

**Files:**
- Modify: `client/src/components/agent/AgentChat.tsx`

- [ ] **Step 1: Inspect the current `AgentChat.tsx` to confirm import paths and the structure of the messages container + input row**

```bash
grep -n "scrollRef\|placeholder=\|className=\"flex-1\|useEffect" /Users/potdev/Documents/GitHub/potentialcom-Replit/client/src/components/agent/AgentChat.tsx
```

Confirm: there's a `useRef<HTMLDivElement>(null)` named `scrollRef`, the messages container has `className="flex-1 space-y-5 overflow-y-auto px-6 py-5"`, and an `<input>` with `placeholder="Message Ruby…"`.

- [ ] **Step 2: Add imports**

In `client/src/components/agent/AgentChat.tsx`, add to the top imports:

```ts
import { AutoGrowTextarea } from "./AutoGrowTextarea";
import { ScrollToLatestPill } from "./ScrollToLatestPill";
import { useSmartScroll } from "./hooks/useSmartScroll";
```

- [ ] **Step 3: Wire `useSmartScroll` and a `focusBumpRef` near the other refs/state in the component body**

Find the existing `const scrollRef = useRef<HTMLDivElement>(null);` and add immediately after:

```ts
const { isNearBottom, scrollToBottom } = useSmartScroll(scrollRef);
// focusBumpRef increments each time we want the textarea to refocus
// (initial mount, after a successful send, after clear()). Passed as
// the autoFocusKey prop on AutoGrowTextarea.
const [focusBumpCounter, setFocusBumpCounter] = useState(0);
const bumpFocus = useCallback(() => setFocusBumpCounter((n) => n + 1), []);
```

Add `useCallback` to the existing React import if not already there.

- [ ] **Step 4: Replace the existing scroll-on-message-change `useEffect`**

Find the block:
```ts
useEffect(() => {
  scrollRef.current?.scrollTo({
    top: scrollRef.current.scrollHeight,
    behavior: "smooth",
  });
}, [messages]);
```

Replace with:
```ts
// Auto-scroll on new messages, but ONLY if the user is already near the
// bottom. Otherwise leave them where they are and let the
// ScrollToLatestPill surface the option to jump back.
useEffect(() => {
  if (isNearBottom) scrollToBottom(true);
}, [messages, isNearBottom, scrollToBottom]);
```

- [ ] **Step 5: Make the messages container relative so the pill positions correctly**

Find:
```tsx
<div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
```

Change to:
```tsx
<div className="relative flex-1 overflow-hidden">
  <div
    ref={scrollRef}
    className="absolute inset-0 space-y-5 overflow-y-auto px-6 py-5"
  >
```

…and add a matching closing `</div>` at the end of the messages section (after the existing closing `</div>` for the scroll container).

Then INSIDE the outer `relative flex-1` wrapper but AFTER the inner scroll div's closing tag, mount the pill conditionally:

```tsx
{!isNearBottom && messages.length > 0 && (
  <ScrollToLatestPill onClick={() => scrollToBottom(true)} />
)}
```

**Final shape of the messages block (verify after editing):**
```tsx
<div className="relative flex-1 overflow-hidden">
  <div
    ref={scrollRef}
    className="absolute inset-0 space-y-5 overflow-y-auto px-6 py-5"
  >
    {/* in-call hero, empty state, messages.map(...) — unchanged */}
  </div>
  {!isNearBottom && messages.length > 0 && (
    <ScrollToLatestPill onClick={() => scrollToBottom(true)} />
  )}
</div>
```

- [ ] **Step 6: Replace the `<input>` with `<AutoGrowTextarea>` and bump focus on send**

Find:
```tsx
<input
  value={input}
  onChange={(e) => setInput(e.target.value)}
  placeholder="Message Ruby…"
  className="flex-1 h-11 rounded-full border border-border bg-muted/40 px-5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-all focus:border-primary/60 focus:bg-background focus:ring-2 focus:ring-primary/20"
  data-testid="agent-chat-input"
/>
```

Replace with:
```tsx
<AutoGrowTextarea
  value={input}
  onChange={setInput}
  onSubmit={() => {
    // Mirror the form's submit: build the same payload handleSubmit
    // would, then bump focus to keep typing flowing.
    if (status === "streaming") return;
    const hasText = input.trim().length > 0;
    if (!hasText && !pendingImage) return;
    const text = pendingImage
      ? `${input} [image: ${pendingImage.filename}]`.trim()
      : input;
    const previewUrl = pendingImage?.previewUrl;
    setInput("");
    setPendingImage(null);
    void send(text, previewUrl);
    bumpFocus();
  }}
  placeholder="Message Ruby…"
  disabled={status === "streaming"}
  autoFocusKey={focusBumpCounter}
/>
```

Also update the existing `handleSubmit` so when the form is submitted via the Send button, it ALSO bumps focus:

Find:
```ts
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (status === "streaming") return;
  ...
  void send(text, previewUrl);
};
```

Add `bumpFocus();` as the last line inside the function.

Initial focus on mount: the `useState(0)` initializes `focusBumpCounter` to 0, which triggers the `useEffect` in `AutoGrowTextarea`'s `autoFocusKey` watcher on first render — so the textarea is focused at mount automatically. Verify by manual smoke test in Task 14.

- [ ] **Step 7: Type-check + full suite**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit tsc \
  --noEmit -p /Users/potdev/Documents/GitHub/potentialcom-Replit/tsconfig.json
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit
```

Expected: clean. Test count unchanged (no new tests, integration is verified by the existing AgentChatVoice + smoke test in Task 14).

If any test breaks because of the placeholder being on a textarea instead of input: the existing test uses `screen.getByPlaceholderText(/message ruby/i)` which matches on placeholder regardless of element type, so it should pass. If it breaks for a different reason, investigate before proceeding.

- [ ] **Step 8: Commit**

```bash
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit add client/src/components/agent/AgentChat.tsx
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit commit -m "AgentChat: wire AutoGrowTextarea + useSmartScroll + ScrollToLatestPill

Replaces the single-line input with the auto-growing textarea (Enter
to send, Shift+Enter newline, autoFocus on mount + after send).
Auto-scroll now respects user position via useSmartScroll — only
fires when isNearBottom; otherwise the ScrollToLatestPill surfaces
to jump back."
```

---

## Task 11: Wire `MessageActions` + `HoverTimestamp` into `MessageBubble`

Adds the action row + hover timestamp under each message. Plumbs `onRegenerate` + `isLast` through from `AgentChat`.

**Files:**
- Modify: `client/src/components/agent/MessageBubble.tsx`
- Modify: `client/src/components/agent/AgentChat.tsx`

- [ ] **Step 1: Extend MessageBubble props**

In `client/src/components/agent/MessageBubble.tsx`, modify the props interface:

```ts
interface MessageBubbleProps {
  message: AgentMessage;
  registry: ToolRegistry;
  tts?: UseTextToSpeechResult;
  ttsEnabled?: boolean;
  /** True if this is the most recent agent message in the conversation. */
  isLast?: boolean;
  /** Called when the user clicks Regenerate or Retry. */
  onRegenerate?: (messageId: string) => void;
}
```

- [ ] **Step 2: Add imports + render MessageActions + HoverTimestamp inside MessageBubble**

In the same file, add to imports:

```ts
import { MessageActions } from "./MessageActions";
import { HoverTimestamp } from "./HoverTimestamp";
```

In the **user-bubble branch** (the `if (isUser) { return ... }` block), wrap the existing markup in a `group` and add the timestamp:

Find:
```tsx
if (isUser) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[78%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-[15px] leading-relaxed text-primary-foreground">
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
```

Replace with:
```tsx
if (isUser) {
  return (
    <div className="group flex flex-col items-end">
      <div className="max-w-[78%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-[15px] leading-relaxed text-primary-foreground">
        {message.imageUrl && (
          <img
            src={message.imageUrl}
            alt="Uploaded"
            className="mb-2 max-h-40 rounded-lg"
          />
        )}
        <span>{message.text}</span>
      </div>
      <HoverTimestamp createdAt={message.createdAt} />
    </div>
  );
}
```

In the **agent-bubble branch** (the bottom return statement), add a `group` wrapper, MessageActions row, and HoverTimestamp:

Find:
```tsx
return (
  <div className="flex flex-col gap-2">
    {message.tools.map((tool) => (
      <ToolCard key={tool.id} invocation={tool} registry={registry} />
    ))}
    {(message.text || message.status === "streaming") && (
      <div className="flex items-start gap-2">
        <div className="max-w-[78%] rounded-2xl rounded-bl-md bg-muted px-4 py-2.5 text-[15px] leading-relaxed text-foreground">
          {message.text ? (
            <div className="prose prose-sm max-w-none text-foreground prose-p:my-1.5 prose-p:leading-relaxed first:prose-p:mt-0 last:prose-p:mb-0 dark:prose-invert">
              <ReactMarkdown>{message.text}</ReactMarkdown>
            </div>
          ) : (
            <span className="inline-flex gap-1 py-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0.3s]" />
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
```

Replace with:
```tsx
return (
  <div className="group flex flex-col gap-2">
    {message.tools.map((tool) => (
      <ToolCard key={tool.id} invocation={tool} registry={registry} />
    ))}
    {(message.text || message.status === "streaming") && (
      <div className="flex items-start gap-2">
        <div className="max-w-[78%] rounded-2xl rounded-bl-md bg-muted px-4 py-2.5 text-[15px] leading-relaxed text-foreground">
          {message.text ? (
            <div className="prose prose-sm max-w-none text-foreground prose-p:my-1.5 prose-p:leading-relaxed first:prose-p:mt-0 last:prose-p:mb-0 dark:prose-invert">
              <ReactMarkdown>{message.text}</ReactMarkdown>
            </div>
          ) : (
            <span className="inline-flex gap-1 py-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0.3s]" />
            </span>
          )}
        </div>
        {canSpeak && tts && (
          <SpeakButton text={message.text} tts={tts} />
        )}
      </div>
    )}
    {/* Hover row: timestamp + actions. Only meaningful when there's
        actual text (streaming/loading bubbles don't show actions). */}
    {message.text && onRegenerate && (
      <div className="flex items-center gap-2">
        <MessageActions
          message={message}
          isLast={!!isLast}
          onRegenerate={onRegenerate}
        />
        <HoverTimestamp createdAt={message.createdAt} />
      </div>
    )}
  </div>
);
```

- [ ] **Step 3: Plumb `isLast` + `onRegenerate` from `AgentChat`**

In `client/src/components/agent/AgentChat.tsx`, update the `messages.map(...)` call inside the messages container. Find:

```tsx
{messages.map((message) => (
  <MessageBubble
    key={message.id}
    message={message}
    registry={registry}
    tts={tts}
    ttsEnabled={!!bot?.audiotts}
  />
))}
```

Replace with:
```tsx
{messages.map((message, idx) => {
  // "Last agent message" = the last message in the list whose role is
  // agent. We tag the bubble so MessageActions can decide whether to
  // render Regenerate.
  const isLastAgent =
    message.role === "agent" &&
    !messages.slice(idx + 1).some((m) => m.role === "agent");
  return (
    <MessageBubble
      key={message.id}
      message={message}
      registry={registry}
      tts={tts}
      ttsEnabled={!!bot?.audiotts}
      isLast={isLastAgent}
      onRegenerate={chat.regenerate}
    />
  );
})}
```

- [ ] **Step 4: Type-check + full suite**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit tsc \
  --noEmit -p /Users/potdev/Documents/GitHub/potentialcom-Replit/tsconfig.json
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit
```

Expected: clean. Existing 343 tests still pass (323 baseline + 20 new from Tasks 1–9: 2 createdAt + 1 clear + 3 regenerate + 5 useSmartScroll + 6 AutoGrowTextarea + 6 HoverTimestamp + 7 MessageActions + 2 ScrollToLatestPill + 5 ClearConversationMenu = 37 — actually 360 — so the expected total here is **360 passing**).

If any existing MessageBubble test breaks because `createdAt` is now read from `message.createdAt`: update the test fixture to include `createdAt: Date.now()` on its mock message.

- [ ] **Step 5: Commit**

```bash
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit add client/src/components/agent/MessageBubble.tsx client/src/components/agent/AgentChat.tsx
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit commit -m "MessageBubble: add MessageActions + HoverTimestamp; AgentChat plumbs isLast + onRegenerate

User bubbles get a hover timestamp; agent bubbles get the full action
row (Copy / Regenerate or Retry) + hover timestamp. AgentChat computes
isLast for the most recent agent message and wires chat.regenerate
through as onRegenerate."
```

---

## Task 12: Wire `ClearConversationMenu` into the `AgentChat` header

Mounts the three-dot menu next to the voice button. Wires `chat.clear()` through `onClear`.

**Files:**
- Modify: `client/src/components/agent/AgentChat.tsx`

- [ ] **Step 1: Import + destructure `clear`**

In `AgentChat.tsx`, add:

```ts
import { ClearConversationMenu } from "./ClearConversationMenu";
```

And update the destructure of the hook return (find `const { messages, status, send } = chat;` or similar):

```ts
const { messages, status, send, clear } = chat;
```

- [ ] **Step 2: Mount the menu in the header**

Find the header's button group:
```tsx
<div className="ml-auto flex items-center gap-2">
  {/* Only show the "Start voice" button in the header when no
      call is active — the in-call controls live in VoiceHero
      below (the in-message overlay) for a stronger focal moment. */}
  {bot?.audiostt &&
    bot?.audiotts &&
    (voice.state === "idle" || voice.state === "error") && (
      <VoiceModeButton
        busy={status === "streaming"}
        onClick={() => void voice.start()}
      />
    )}
</div>
```

Add the menu BELOW the VoiceModeButton block, inside the same `<div>`:

```tsx
<ClearConversationMenu
  onClear={() => {
    clear();
    bumpFocus();
  }}
/>
```

The `bumpFocus()` after `clear()` refocuses the textarea so the user can immediately start typing in the fresh conversation.

- [ ] **Step 3: Type-check + full suite**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit tsc \
  --noEmit -p /Users/potdev/Documents/GitHub/potentialcom-Replit/tsconfig.json
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit
```

Expected: clean; 360 still passing.

- [ ] **Step 4: Commit**

```bash
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit add client/src/components/agent/AgentChat.tsx
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit commit -m "AgentChat: mount ClearConversationMenu in the header

Three-dot menu sits next to the voice button. Click → Clear
conversation → confirm dialog → chat.clear() + bumpFocus() so the
textarea is ready for the next message in the fresh session."
```

---

## Task 13: Merge to main + dev-worktree sync + manual smoke test

Final verification on the dev server before declaring done.

- [ ] **Step 1: Merge the working branch to main**

```bash
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit checkout main
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit merge --no-ff claude/ruby-chat-app-grade-ux -m "Merge claude/ruby-chat-app-grade-ux — app-grade chat UX upgrade"
```

- [ ] **Step 2: Push main to origin**

```bash
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit push origin main
```

Note: pushing to main is the established pattern for this repo. If the auto-mode classifier blocks it, surface the situation to the human and ask for a manual push or a PR-based path.

- [ ] **Step 3: Sync the dev worktree so Vite HMR picks up the changes**

```bash
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit/.claude/worktrees/ruby-livekit-native-voice merge main --ff-only
```

- [ ] **Step 4: Run the full test suite one last time on main**

```bash
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit tsc \
  --noEmit -p /Users/potdev/Documents/GitHub/potentialcom-Replit/tsconfig.json
PATH=$HOME/.nvm/versions/node/v20.19.4/bin:$PATH \
  npx --prefix /Users/potdev/Documents/GitHub/potentialcom-Replit vitest run \
  --root /Users/potdev/Documents/GitHub/potentialcom-Replit
```

Expected: clean type-check; 360 passing.

- [ ] **Step 5: Manual smoke test against the running dev server (localhost:5001)**

Open `http://localhost:5001/demo` in a browser. Hard-refresh (Cmd+Shift+R). Walk through every acceptance criterion from the spec:

1. **Textarea is focused on page load** — type immediately without clicking; text appears.
2. **Multi-line input** — type a sentence, press Shift+Enter, type another sentence. Both lines visible; textarea grows. Press Enter (no Shift). Submits.
3. **Auto-scroll respects position** — send 5–6 prompts in a row. Scroll up to read an earlier message while a new reply streams. Auto-scroll should NOT yank you down. `↓ Latest message` pill should appear at the bottom center of the message area.
4. **Pill jumps to bottom** — click the pill. Messages scroll smoothly to the latest.
5. **Hover timestamp + actions** — hover over any agent message. Timestamp ("just now" / "2m ago") appears below the bubble; Copy and Regenerate icons appear in the action row.
6. **Copy** — click Copy on an agent message. Icon swaps to ✓ for 1.5s. Paste into another app to verify the text was copied.
7. **Regenerate** — click Regenerate on the last agent message. The reply vanishes and a fresh one streams in.
8. **Retry on failed turn** — (optional, requires inducing a network error — skip if not easily reproducible. The unit tests in Task 7 cover the rendering.)
9. **Clear conversation** — click the three-dot menu → Clear conversation → confirm. Message list empties. Textarea is refocused. Sending a new message starts a fresh chat history (verify by checking the chat doesn't reference earlier messages).
10. **Voice mode still works** — start a voice call. Status dot turns primary. Hang up. Chat returns to text mode. No regressions in voice behavior.

If any of these don't work, the failure is the implementer's responsibility to fix inline before declaring done — the unit tests passing doesn't prove the integration works end-to-end.

- [ ] **Step 6: Final commit (if any smoke-test fixes were needed)**

If Step 5 surfaced an integration bug, fix it, run the test suite again, and commit:

```bash
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit add <fixed-files>
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit commit -m "Fix: <one-line description of what broke>"
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit push origin main
git -C /Users/potdev/Documents/GitHub/potentialcom-Replit/.claude/worktrees/ruby-livekit-native-voice merge main --ff-only
```

If everything passed clean, no further commit is needed — the plan is done.

---

## Done

All 13 tasks complete:
- ✅ `createdAt` on every message (Task 1)
- ✅ `useAgentChat.clear()` (Task 2)
- ✅ `useAgentChat.regenerate(id)` (Task 3)
- ✅ `useSmartScroll` hook (Task 4)
- ✅ `AutoGrowTextarea` component (Task 5)
- ✅ `HoverTimestamp` + `relativeTime` (Task 6)
- ✅ `MessageActions` component (Task 7)
- ✅ `ScrollToLatestPill` component (Task 8)
- ✅ `ClearConversationMenu` component (Task 9)
- ✅ Textarea + smart-scroll + pill integrated into `AgentChat` (Task 10)
- ✅ Actions + timestamp integrated into `MessageBubble` (Task 11)
- ✅ Menu integrated into header (Task 12)
- ✅ Merged, pushed, worktree synced, smoke-tested (Task 13)

**Test baseline:** 360 passing (323 baseline + 37 new).

**Spec:** `docs/superpowers/specs/2026-05-16-ruby-chat-app-grade-ux-design.md`
