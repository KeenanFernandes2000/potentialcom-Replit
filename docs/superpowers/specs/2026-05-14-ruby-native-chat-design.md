# Ruby Native Chat Interface — Design

**Date:** 2026-05-14
**Status:** Approved
**Page:** `/demo` ([client/src/pages/Demo.tsx](../../../client/src/pages/Demo.tsx))

## Problem

The Ruby page currently embeds a third-party chat widget by injecting
`ai.potential.com/static/embed/ruby-section.js` at runtime. The embed is an
opaque ~38k-line script, renders in a shadow DOM we can't style, and can't be
tested or extended. We want a native, in-app chat interface that talks to
Ruby's agent API directly — with streaming responses and full tool-call
rendering.

## Goals

- Replace the embed with a native React chat interface on `/demo`.
- Stream agent responses token-by-token.
- Render bespoke UI cards for **all 19 of Ruby's tools** (full parity with the
  old embed).
- Support image upload (for `analyze_product_image` / `request_product_image_upload`).
- Route all API traffic through a **generic, agent-agnostic Express proxy** so
  Vera/Ayla/Lumi can reuse the same infrastructure later. The browser never
  sees a bot ID, system prompt, or upstream URL.

## Non-goals (this phase — v1)

- Voice mode / STT / TTS — deferred to **v2** (see Roadmap).
- Avatar mode — deferred to **v3** (see Roadmap).
- Persisting chat history across page reloads — `sessionId` is regenerated per
  page session, matching the embed's behavior.
- Building tool registries for other agents (Vera/Ayla) — only the
  infrastructure is made generic; Ruby is the only agent wired up.
- Changing the rest of the `/demo` page — the "What Ruby Can Do" accordion and
  Integrations grid stay as-is.

## Roadmap

- **v1 (this spec):** native text chat — streaming, full 19-tool rich-card
  parity, image upload, generic Express proxy.
- **v2:** Voice mode — STT for user input and TTS for agent responses. The
  embed already exposes `streaming/audio` and `streaming/texttovoice`
  endpoints to proxy. `AgentChat` is built mode-agnostic so a voice mode
  slots in alongside the text interface.
- **v3:** Avatar mode — interactive talking-head presentation layer over the
  same `useAgentChat` stream.

The layered architecture (generic hook + parser + proxy) is deliberately
chosen so v2 and v3 reuse the streaming core and only add a presentation
layer.

## Decisions (from brainstorming)

| Decision | Choice |
|---|---|
| Tool-call UI depth | **Full rich-card parity** — bespoke card per tool |
| Page layout | **Drop-in replacement** — chat sits where the embed `#potchat` div was; rest of page unchanged |
| API connection | **Express proxy** — not direct browser calls |
| Image upload | **In scope** |
| Endpoint shape | **Generic** — `/api/agent/:agentKey/...`; bot ID resolved server-side, never exposed |
| Implementation architecture | **Layered** — streaming hook + pure parser + tool-renderer registry + presentational components |

## The Ruby API (reverse-engineered from the embed)

Confirmed working against bot `6a056e4ece71ae96a167f826`.

**Bot config** — `GET https://api.potential.com/api/admin/bot/{botId}`
Returns `{ _id, name, imageName, description, greeting, sectionTitle, system }`.
Avatar URL is `https://api.potential.com/static/mentors/{imageName}`.

**Chat** — `POST https://api.potential.com/agent/chatbot/{botId}/chat`
- Body: `{ message: string, sessionId: string }`
- Headers: `Content-Type: application/json`
- Response: a streamed body of SSE-style lines, `data: {...}\n\n`. Event shapes:
  - `{ type: "token", content: string, node: "agent" }` — incremental text
  - `{ toolCall: { name, arguments, async } }` — a tool is being invoked
  - `{ toolResponse: { name, content } }` — tool result; `content` is JSON
    (sometimes a JSON string)
  - `{ error: string }` — an error mid-stream
  - Final line: `{ success: true, response: string, toolCalls, bot }` — stream
    complete

**Image upload** — `POST https://api.potential.com/streaming/upload`
Returns an uploaded filename, which is then referenced in a subsequent chat
message for `analyze_product_image`.

CORS note: the upstream API echoes the request `Origin` and allows
credentials, so direct browser calls *would* work — but we proxy anyway, per
the endpoint decision, to keep bot IDs server-side and insulate against
upstream CORS changes.

## Ruby's tools (19 cards + generic fallback)

Each tool follows a two-state pattern: a `toolCall` event renders a **loading**
card; the matching `toolResponse` swaps it to a **data** card. Exact
`toolResponse.content` shapes are defined in the old embed JS — each card is a
port, not a guess.

| Mode | Tools |
|---|---|
| Shopping | `get_shopify_products`, `analyze_product_image`, `request_product_image_upload`, `add_to_cart`, `track_order`, `get_discount_codes` |
| Booking | `get_makeup_experts`, `get_skincare_experts`, `get_consultation_prices`, `get_slots`, `book_slots`, `send_email_confirmation` |
| Learning | `get_courses`, `get_user_course_progress`, `get_next_lesson`, `get_events` |
| HR / Career | `get_open_job_positions`, `store_candidate_evaluation` |
| Automation | `create_chatbot` |

Any tool name not in the registry renders via `GenericToolCard` — a "🔧 Using
{tool}…" pill plus the response content as text/markdown.

## Architecture

Layered, with each unit independently understandable and testable.

### File layout

```
client/src/components/agent/          ← generic, agent-agnostic
  AgentChat.tsx          — chat panel: message list, input, image upload, greeting
  MessageBubble.tsx      — renders one message (user / agent text)
  useAgentChat.ts        — hook: takes agentKey; owns messages + sessionId + stream lifecycle
  parseAgentStream.ts    — pure function: raw SSE chunks → typed events
  ToolCard.tsx           — takes a toolRegistry prop; renders loading vs data state

client/src/components/ruby/           ← Ruby-specific
  RubyChat.tsx           — thin wrapper: <AgentChat agentKey="ruby" registry={rubyToolRegistry} />
  rubyToolRegistry.ts    — Record<toolName, ToolRenderer>
  tools/
    GetShopifyProductsCard.tsx
    AnalyzeProductImageCard.tsx
    RequestProductImageUploadCard.tsx
    AddToCartCard.tsx
    TrackOrderCard.tsx
    GetDiscountCodesCard.tsx
    GetMakeupExpertsCard.tsx
    GetSkincareExpertsCard.tsx
    GetConsultationPricesCard.tsx
    GetSlotsCard.tsx
    BookSlotsCard.tsx
    SendEmailConfirmationCard.tsx
    GetCoursesCard.tsx
    GetUserCourseProgressCard.tsx
    GetNextLessonCard.tsx
    GetEventsCard.tsx
    GetOpenJobPositionsCard.tsx
    StoreCandidateEvaluationCard.tsx
    CreateChatbotCard.tsx
    GenericToolCard.tsx    — fallback for any unmapped tool

shared/
  agent.ts               — AgentStreamEvent, ToolCall, ToolResponse, AgentMessage types

server/
  agents.ts              — NEW. Server-only agentKey → botId map.
  routes.ts              — + 3 generic agent routes (see below)
```

### Modified files

- `server/routes.ts` — add the three `/api/agent/:agentKey/*` routes.
- `client/src/pages/Demo.tsx` — remove the embed-script `useEffect` and the
  `#potchat` div; render `<RubyChat />` in its place. The mode-toggle buttons,
  `renderVoiceInterface`, `renderAvatarInterface`, the unused `useCases` array,
  and the dead `handleSendMessage` / `handleUseCaseClick` / message-state code
  are removed as part of this (they only existed to support the now-deleted
  custom chat UI and the commented-out Voice/Avatar modes).

### Boundaries

- `parseAgentStream` is pure — no React, no fetch — and is the unit-test
  surface for all streaming edge cases.
- `useAgentChat` owns all state; every component below it is presentational.
- Each tool card knows only its own `toolResponse.content` shape.
- `rubyToolRegistry` is the single place tool-name → component wiring lives.
  Adding a tool = one file + one registry line.
- `server/agents.ts` is the single place bot IDs live.

## Data flow

1. **AgentChat — user sends.** `useAgentChat` appends the user message,
   generates a `sessionId` once per page session, sets status = `streaming`.
2. **Express proxy — `POST /api/agent/:agentKey/chat`.** Resolves
   `AGENTS[agentKey].botId`, forwards `{message, sessionId}` to
   `api.potential.com/agent/chatbot/{botId}/chat`, pipes the response stream
   straight back unbuffered.
3. **api.potential.com — Ruby agent** streams `data: {...}\n\n` lines.
4. **useAgentChat — read & parse.** `response.body.getReader()` feeds chunks to
   `parseAgentStream`, which buffers partial lines and emits typed events:
   - `token` → append text to the current agent bubble
   - `toolCall` → add a `ToolCard` in *loading* state
   - `toolResponse` → swap that `ToolCard` to *data* state (matched by tool
     name + dedupe key)
   - `error` → render an error bubble inline
   - `done` (final `{success, response, ...}`) → finalize message, status =
     `idle`
5. **Render.** `MessageBubble` renders agent/user text as markdown. `ToolCard`
   looks up `toolRegistry[toolName]` and renders the loading then data card;
   unknown tool → `GenericToolCard`.

## The generic server proxy

### `server/agents.ts`

```ts
export const AGENTS = {
  ruby: { botId: process.env.RUBY_BOT_ID ?? "6a056e4ece71ae96a167f826" },
  // vera, ayla, lumi — future, one line each
} as const;

export type AgentKey = keyof typeof AGENTS;
```

### Routes (all keyed by `:agentKey`, never by bot ID)

| Route | Behavior |
|---|---|
| `POST /api/agent/:agentKey/chat` | Resolve botId; forward `{message, sessionId}` to the upstream chat endpoint; pipe the stream back unbuffered. |
| `GET /api/agent/:agentKey/bot` | Fetch upstream bot config; return **only** `{name, greeting, avatarUrl}`. `system` (the prompt), `_id`, and other fields are stripped. |
| `POST /api/agent/:agentKey/upload` | Proxy a multipart image upload to `api.potential.com/streaming/upload`; return the resulting filename. |

Unknown `agentKey` → `404` before any upstream call. The browser only ever
sends `agentKey: "ruby"`; bot ID, system prompt, and upstream URLs stay
server-side.

## Error handling

- `parseAgentStream` buffers partial lines and silently skips unparseable
  chunks — a malformed fragment never crashes the stream.
- Stream `{error}` events render an inline error bubble; the conversation stays
  usable.
- `fetch` failure / network drop → error bubble; the input stays enabled for
  retry.
- Proxy: upstream non-200 → forward the status and error JSON. Unknown
  `agentKey` → 404.
- A tool card whose `toolResponse.content` doesn't match its expected shape
  catches the parse error and falls back to `GenericToolCard` rather than
  throwing.
- Image upload failure → toast + retry; does not block text chat.

## Testing

- **`parseAgentStream`** — pure-function unit tests: token sequences, lines
  split across chunk boundaries, tool call/response pairs, the final
  `{success,...}` event, and garbage chunks.
- **Proxy routes** — integration tests: unknown `agentKey` → 404; valid key
  forwards and streams; `/bot` whitelists fields (no `system` leak).
- **Tool cards** — render tests using sample `toolResponse` payloads captured
  from the old embed JS.
- **Manual golden-path** — in-browser: streaming text, a product search
  rendering a card, an image upload, and a forced error.

## Open questions for implementation

- Exact `toolResponse.content` shape for each of the 19 tools — to be extracted
  from the embed JS (`/tmp/ruby-embed.js`, or re-fetched from
  `ai.potential.com/static/embed/ruby-section.js`) during implementation, one
  card at a time.
- Multipart vs. raw-body forwarding for the `/upload` proxy — confirm against
  what `api.potential.com/streaming/upload` expects.
