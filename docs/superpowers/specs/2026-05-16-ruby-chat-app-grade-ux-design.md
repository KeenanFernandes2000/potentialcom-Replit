# Ruby Chat — App-Grade UX Upgrade

> **Goal:** make the Ruby chat surface on `/demo` feel like a real chat app, not a marketing-page embed, by adding the UX behaviors users subconsciously expect plus a small set of power-user actions.

**Scope:** UX-only. No backend changes, no new dependencies. Replaces the input element, extends the `useAgentChat` hook with two new actions, and adds five small UI components composed into the existing `AgentChat` shell.

**Brand constraint:** Inter font, primary purple `#8844DD`, white card surfaces with hairline borders. Matches Vera/Ayla/Lumi pattern. No new fonts, no off-brand color/motion experiments — the user has already rejected those directions.

---

## Why now

Recent passes shipped the visual chrome (centered hero, brand palette, generous spacing, scrolling shell). What's still missing is the **expected behavior layer** — the things users notice the moment they start typing. Without these, the demo reads as "incomplete chat embed" no matter how polished the visuals are.

The largest gaps today:

- The `<input>` is single-line. Paste a multi-paragraph question and it gets cramped and unreadable.
- Auto-scroll fires on every render, which yanks the user down even when they've scrolled up to read.
- No way to copy an agent reply, regenerate it, or recover from a failed turn.
- No way to clear the conversation and start fresh.
- No timestamps.
- The textarea isn't auto-focused — every user has to click before they can type.

This spec closes those gaps in one coherent pass.

---

## Out of scope

Explicitly NOT in this spec (deferred):

- **Suggested follow-up chips** under agent replies. (Considered; cut to reduce scope.)
- **Conversation history sidebar** / multi-thread support.
- **Message reactions** (👍 / 👎).
- **Share / export** conversation.
- **Streaming-state cosmetic polish** beyond what's already shipped (the bubble already grows token-by-token via `agent-response-stream`).

Each of these is a follow-up pass. None block this one.

---

## Architecture

The existing component tree stays. We add five small components and two new actions on the hook. No file restructuring.

```
AgentChat
  ├── Header
  │     └── ClearConversationMenu                 ← new
  ├── MessageList (flex-1, overflow-y-auto)
  │     ├── EmptyState
  │     ├── messages.map(MessageBubble)
  │     │     ├── ToolCards
  │     │     ├── BubbleBody
  │     │     │     ├── Markdown text OR typing dots
  │     │     │     ├── HoverTimestamp            ← new
  │     │     │     └── MessageActions            ← new
  │     │     └── (no SuggestedFollowUps — cut)
  │     └── ScrollToLatestPill                    ← new (floating, conditional)
  └── InputRow
        ├── AttachButton
        ├── MicButton
        ├── AutoGrowTextarea                      ← new (replaces <input>)
        └── SendButton
```

**New hook:** `useSmartScroll(ref)` — encapsulates the scroll-position tracking and `scrollToBottom` callback.

**Hook extensions in `useAgentChat`:**
- `AgentMessage.createdAt: number` — set at every message creation point (typed send, voice user-transcript, voice agent-response, voice agent-response-stream).
- `regenerate(messageId: string)` — new action.
- `clear()` — new action.

---

## Components

### `useSmartScroll(scrollRef)`

**Purpose:** track whether the user is "near the bottom" of the scrollable element, and expose a programmatic scroll-to-bottom callback.

**Returns:** `{ isNearBottom: boolean, scrollToBottom: (smooth?: boolean) => void }`

**Behavior:**
- "Near bottom" threshold: `scrollHeight - (scrollTop + clientHeight) < 120`.
- Attaches a `scroll` listener to the ref'd element, throttled via `requestAnimationFrame` to avoid layout thrashing.
- Default-permissive: when the ref hasn't attached yet, returns `isNearBottom: true` so the pill doesn't flash on first paint.
- `scrollToBottom(smooth = true)` writes `scrollTop = scrollHeight` with the `behavior` option.

**Used by:** `AgentChat` to decide whether to auto-scroll on a new message and to show/hide `ScrollToLatestPill`.

---

### `<ScrollToLatestPill onClick />`

**Purpose:** when the user has scrolled up and a new message arrives, surface a one-click jump back to the latest.

**Renders only when** the parent passes `isVisible === true` (parent computes from `!isNearBottom && messages.length > 0`).

**Look:** small pill, `bg-primary text-primary-foreground`, `↓ Latest message` label, `absolute bottom-4 left-1/2 -translate-x-1/2 shadow-md rounded-full px-3 py-1.5 text-xs font-medium`. Sits over the message list, pointer-events-auto.

**Click:** calls `onClick` (parent invokes `scrollToBottom(true)`).

---

### `<AutoGrowTextarea value onChange onSubmit placeholder disabled autoFocusKey />`

**Purpose:** replaces the single-line `<input>` with a textarea that grows with content, sends on Enter, and supports multi-line input with Shift+Enter.

**Behavior:**
- Initial `rows={1}`, internally tracks height.
- On every value change: set `el.style.height = "auto"` then `el.style.height = el.scrollHeight + "px"`, capped at `maxHeight: 160px` (~6 rows). Beyond that, the textarea scrolls internally.
- `onKeyDown`:
  - `Enter` alone → call `onSubmit()` and `preventDefault()`. Empty-value submits are caller's responsibility (the parent gates via the existing `(!input.trim() && !pendingImage)` check).
  - `Shift+Enter` → default browser behavior (newline).
- `disabled` blocks both typing and submit.
- `autoFocusKey: string | number` — when its value changes (e.g., after a successful send, or on initial mount), call `el.focus()`. Lets the parent control focus declaratively.

**Look:** same visual styling as the current input (`bg-muted/40 → focus:bg-background` with `ring-2 ring-primary/20` focus ring). `min-h-[44px]` so single-line state matches the current input height.

**Test surface:**
- Placeholder text exposed
- Value prop reflected
- Enter calls onSubmit + preventDefault
- Shift+Enter does NOT call onSubmit
- Disabled blocks both
- autoFocusKey bump refocuses

---

### `<MessageActions message onRegenerate onCopy isLast />`

**Purpose:** per-message actions revealed on hover — copy, regenerate (last completed only), retry (error only).

**Renders:** below the agent bubble (inline, opacity-0 → group-hover:opacity-100 on the bubble row's parent).

**Actions:**

| Button | When | Click |
|---|---|---|
| Copy | Always (agent messages with non-empty text) | `navigator.clipboard.writeText(message.text)`. On success, swap icon `Copy` → `Check` for 1500ms then revert. On failure, no visible change. |
| Regenerate | `isLast === true && message.status === "complete"` | Call `onRegenerate(message.id)`. |
| Retry | `message.status === "error"` | Call `onRegenerate(message.id)` (retry IS regenerate of a failed turn). Button uses `text-destructive` styling. |

**Layout:** horizontal row, `gap-1`, each button `h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted`.

**No tooltip noise:** button has an `aria-label` + native `title` attribute. Hover affordance is the icon-on-muted bg darkening.

---

### `<HoverTimestamp createdAt />`

**Purpose:** show the relative age of a message on hover.

**Renders:** below the bubble, `text-[10px] text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity`.

**Format:** inline `relativeTime(ms: number): string` helper:
- `< 60s` → `"just now"`
- `< 60min` → `"Xm ago"`
- `< 24h` → `"Xh ago"`
- `< 7d` → `"Xd ago"`
- Else → `new Date(ms).toLocaleDateString()`

**Updates:** does NOT need to live-update — re-renders happen often enough during a conversation. Worst case the user sees `"4m ago"` for a few seconds longer than truth. YAGNI on interval timers.

---

### `<ClearConversationMenu onClear />`

**Purpose:** menu in the chat header that lets the user reset the conversation.

**Trigger:** three-dot icon button (`MoreVertical` from lucide), placed to the right of the voice button in the header.

**Menu:** uses the existing `@/components/ui/dropdown-menu`. One item: "Clear conversation".

**Confirm:** click opens an `AlertDialog` (existing `@/components/ui/alert-dialog`):
- Title: "Clear this conversation?"
- Description: "All messages will be removed. This can't be undone."
- Cancel button: closes the dialog.
- Confirm button (destructive): calls `onClear()`.

**No keyboard shortcut** — clearing is rare enough that menu-only is fine.

---

## Hook actions

### `useAgentChat().regenerate(messageId: string): void`

**Algorithm:**
1. Find the index `i` of the agent message with `id === messageId`.
2. If not found, no-op.
3. Walk backwards from `i - 1` to find the immediately preceding user message. If none exists, no-op.
4. Set `messages` to `messages.slice(0, indexOfUserMessage + 1)` — drops the failed/unwanted agent message and anything after it.
5. Call `send(userMessage.text, userMessage.imageUrl)` — same code path as a normal send.

**Edge cases:**
- Mid-stream: `status === "streaming"` → no-op (don't allow regenerate while a turn is in flight; the button is hidden in this state anyway).
- Image included on the original user turn: the regenerate re-uses the same `imageUrl`. The previewUrl on the original message stays valid (it's an object URL, the browser holds the blob).

---

### `useAgentChat().clear(): void`

**Algorithm:**
1. `abortRef.current?.abort()` — kill any in-flight stream.
2. `setMessages([])`.
3. `sessionIdRef.current = newSessionId()` — mint a fresh session ID so server-side ChatHistory starts clean. The new ID flows through to `useLiveKitVoice` via the existing prop pipeline.
4. `setStatus("idle")` — make sure we're not stuck in `"streaming"` if the abort raced.

**Side effects:** Voice mode (if active) is NOT automatically ended. The active voice call continues — the new session ID only applies to future text/voice turns. (Killing a live call from a settings menu would be surprising; the user has the End-Call button for that.)

---

## State changes

### `AgentMessage` shape (`shared/agent.ts`)

```ts
export interface AgentMessage {
  id: string;
  role: "user" | "agent";
  text: string;
  tools: ToolInvocation[];
  imageUrl?: string;
  status: "streaming" | "complete" | "error";
  turnId?: string;
  createdAt: number;   // NEW — Date.now() at message creation
}
```

**Backfill:** every message-creation site in `useAgentChat` (typed send, `user-transcript`, `agent-response`, `agent-response-stream`) sets `createdAt: Date.now()` at creation time. No backward-compat needed — there's no persisted message store; all messages are created in this session.

### `useSmartScroll` in `AgentChat`

Replace the existing scroll effect:

```ts
// BEFORE
useEffect(() => {
  scrollRef.current?.scrollTo({ top: ..., behavior: "smooth" });
}, [messages]);

// AFTER
const { isNearBottom, scrollToBottom } = useSmartScroll(scrollRef);
useEffect(() => {
  if (isNearBottom) scrollToBottom(true);
}, [messages, isNearBottom, scrollToBottom]);
```

The pill renders conditionally:

```tsx
{!isNearBottom && messages.length > 0 && (
  <ScrollToLatestPill onClick={() => scrollToBottom(true)} />
)}
```

### `autoFocusKey` plumbing

`AgentChat` maintains a `focusBumpRef` that increments after every successful `send()`. Pass it as `autoFocusKey={focusBumpRef.current}` to `<AutoGrowTextarea />`. Bump also triggered on `clear()` and on initial mount.

---

## Error handling

| Scenario | Behavior |
|---|---|
| Send fails (network/HTTP error) | Existing `useAgentChat.send` already marks the message `status: "error"` with a fallback string. `MessageActions` shows the **Retry** button. Click → `regenerate(messageId)`. |
| Clipboard copy fails | `navigator.clipboard.writeText` returns a rejected promise. Caught in `MessageActions`; no visible change (icon stays `Copy`). No toast. |
| `regenerate` called with no preceding user message | No-op. Defensive guard. |
| `clear` called mid-stream | `abortRef.current?.abort()` kills the in-flight controller; `setStatus("idle")` clears the streaming flag in case abort races. Messages reset cleanly. |
| Smart-scroll: container ref not yet attached | Hook returns `isNearBottom: true` (default-permissive) and `scrollToBottom` is a no-op. Prevents flash-of-pill on first paint. |
| Auto-grow textarea: paste a giant string | `scrollHeight` caps at `maxHeight: 160px`; the textarea scrolls internally beyond that. Page layout never shifts. |
| Auto-grow textarea: programmatic value clear after send | After `send()`, `value` resets to `""`; the height-adjust effect runs and shrinks back to `min-h-[44px]`. |
| ClearConversationMenu opened during voice call | Menu is enabled. Confirming clears the text history. The active voice call is unaffected (see `clear()` notes above). |

---

## Testing strategy

All new units get vitest + `@testing-library/react` coverage. TDD discipline via `superpowers:test-driven-development` — failing test first, then minimal implementation.

**New test files:**

1. **`useSmartScroll.test.ts`**
   - Returns `isNearBottom: true` when scrolled within 120px of bottom
   - Returns `isNearBottom: false` when scrolled further up
   - `scrollToBottom()` sets `scrollTop = scrollHeight`
   - Returns default-permissive `isNearBottom: true` when ref is null

2. **`AutoGrowTextarea.test.tsx`**
   - Renders textarea with placeholder + value
   - Enter keydown calls `onSubmit` + `preventDefault`
   - Shift+Enter keydown does NOT call `onSubmit`
   - Disabled state blocks typing and submit
   - `autoFocusKey` bump triggers `el.focus()`

3. **`MessageActions.test.tsx`**
   - Copy renders for agent messages with text; click writes to clipboard + swaps to Check icon for 1500ms
   - Regenerate renders only when `isLast && status === "complete"`
   - Retry renders only when `status === "error"`
   - Regenerate / Retry click calls `onRegenerate(message.id)`

4. **`HoverTimestamp.test.tsx`**
   - Renders `"just now"` for `< 60s` old
   - Renders `"Xm ago"` for `< 60min`
   - Renders `"Xh ago"` for `< 24h`
   - Renders `"Xd ago"` for `< 7d`

5. **`ClearConversationMenu.test.tsx`**
   - Menu item click opens the AlertDialog
   - Confirm button calls `onClear`
   - Cancel closes without calling `onClear`

6. **`ScrollToLatestPill.test.tsx`**
   - Renders the button with `↓ Latest message` label
   - Click calls `onClick`

**Existing test file extensions:**

7. **`useAgentChat.test.ts`** — extend
   - `createdAt` is set on user-transcript, agent-response, agent-response-stream pushes
   - `regenerate(id)` removes target + everything after, then re-sends preceding user message
   - `regenerate(id)` no-ops when no preceding user message exists
   - `regenerate(id)` no-ops when status is `"streaming"`
   - `clear()` resets messages to `[]`, mints new sessionId, sets status to `"idle"`
   - `clear()` aborts in-flight controller

8. **`AgentChatVoice.test.tsx`** — extend
   - Textarea has focus after initial mount (replaces existing input-focus assumption if any)
   - Update existing placeholder regex if needed (current is `/message ruby/i` — should still match)

---

## File map

**New files:**
- `client/src/components/agent/hooks/useSmartScroll.ts`
- `client/src/components/agent/hooks/useSmartScroll.test.ts`
- `client/src/components/agent/AutoGrowTextarea.tsx`
- `client/src/components/agent/AutoGrowTextarea.test.tsx`
- `client/src/components/agent/MessageActions.tsx`
- `client/src/components/agent/MessageActions.test.tsx`
- `client/src/components/agent/HoverTimestamp.tsx`
- `client/src/components/agent/HoverTimestamp.test.tsx`
- `client/src/components/agent/ClearConversationMenu.tsx`
- `client/src/components/agent/ClearConversationMenu.test.tsx`
- `client/src/components/agent/ScrollToLatestPill.tsx`
- `client/src/components/agent/ScrollToLatestPill.test.tsx`

**Modified files:**
- `shared/agent.ts` — add `createdAt: number` to `AgentMessage`
- `client/src/components/agent/useAgentChat.ts` — `createdAt` on all message creation sites, add `regenerate` + `clear` actions
- `client/src/components/agent/useAgentChat.test.ts` — extend with regenerate/clear/createdAt tests
- `client/src/components/agent/AgentChat.tsx` — replace input with `AutoGrowTextarea`, integrate `useSmartScroll` + `ScrollToLatestPill` + `ClearConversationMenu`, wire `regenerate` + `clear` to children
- `client/src/components/agent/MessageBubble.tsx` — add `MessageActions` + `HoverTimestamp`, plumb `onRegenerate` + `isLast` props
- `client/src/components/agent/voice/AgentChatVoice.test.tsx` — minor placeholder/focus updates

---

## Risks & decisions

**Risk: smart-scroll pulls users down too eagerly.** Mitigated by the 120px threshold. The user needs to scroll well above the bottom for auto-scroll to disable — small accidental scrolls don't trigger the pill.

**Risk: regenerate on the wrong message.** The algorithm walks backward from the agent message to find the *immediately preceding* user message. Toolish edge case: an agent message that follows another agent message (no user turn in between) would no-op. This is the right default; "regenerate the agent reply" in absence of a user prompt is ambiguous.

**Risk: clipboard API blocked.** Some browsers gate `navigator.clipboard.writeText` on non-secure contexts (HTTP). The demo runs on HTTPS in production. On localhost dev, it works in Chrome/Edge/Firefox without flags. We accept this and let copy silently no-op in non-secure contexts.

**Decision: timestamps don't live-update.** Driving an interval timer for every message to re-render every minute is wasted work. Re-renders happen often enough during real chat use. Worst case the user sees a stale label for a few seconds.

**Decision: clear() does NOT end the voice call.** Calls are explicit user actions; surprising them with a hangup from a "clear messages" menu is the wrong default. They have the End Call button for that.

**Decision: no toast on copy success.** Per-message actions are quiet — the icon swap is enough signal. Toasts here would create per-click noise the user notices for the wrong reasons.

---

## Acceptance criteria (what "done" looks like)

- Open `/demo` → textarea is focused immediately, ready to type.
- Type a multi-line question with Shift+Enter → textarea grows to fit; Enter sends it.
- Scroll up while a reply streams → auto-scroll stops; `↓ Latest message` pill appears at the bottom of the message area. Click it → smoothly snaps to the latest message.
- Hover any message → relative timestamp appears below; on agent messages, action buttons appear.
- Click Copy on an agent message → clipboard receives the text; icon shows ✓ for 1.5s.
- Click Regenerate on the last agent message → the message disappears, the previous user question is re-sent, a fresh reply streams in.
- Network blip while sending → message shows error styling + Retry button → click Retry → message disappears + re-send fires.
- Three-dot menu → Clear conversation → confirm → message list is empty, focus returns to the textarea, a new sessionId is in use.
- All 323 existing tests still pass + new tests for each new component/hook.
