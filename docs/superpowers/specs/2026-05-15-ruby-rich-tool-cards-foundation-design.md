# Ruby Rich Tool Cards — Foundation Design

**Date:** 2026-05-15
**Scope:** Plan 2 of the Ruby native chat work. Establishes the visual and architectural foundation for rich tool cards. Builds the shared card primitives, the themed generic fallback card, and one reference bespoke card (`display_makeup_products`). The remaining 9 bespoke cards are deferred to a follow-up plan.

## Background

Ruby is the AI agent on `/demo`. Plan 1 replaced the old iframe embed with a native React chat that streams responses and handles tool calls. At the moment, every tool response renders through `GenericToolCard.tsx` — a fallback that displays raw JSON. The point of this plan is to give Ruby's tools real visual treatment.

17 tools are attached to Ruby's bot (`6a056e4ece71ae96a167f826`). Of those:
- **10 have visually rich payloads** (products, experts, time slots, courses, photos, jobs, automation confirmations) and warrant bespoke cards.
- **4 are text-heavy** (`conduct_pre_screening_interview`, `explain_company_culture`, `answer_faqs`, future text tools) and look ~90% as good in a themed generic card as they would in bespoke layouts.

To de-risk a design pattern before scaling to 10 components, this plan delivers the foundation only: shared primitives, the themed generic fallback, and one reference bespoke card. Plan 3 will fill in the remaining 9 cards on top of the foundation.

## Decisions

| # | Decision | Choice |
|---|---|---|
| 1 | Visual style | Theme-responsive: light mode = clean minimal (white card, dark text, neutral borders); dark mode = brand-matched (dark purple panel, white text, purple accents). One component tree, two themes via CSS variables. |
| 2 | Scope | 10 bespoke cards + 1 themed generic for the 4 text-heavy tools. This plan delivers the foundation (primitives + themed generic + `display_makeup_products` only). |
| 3 | Interactivity | Display-only. CTAs are external links (`target="_blank"`) — no follow-on tool calls, no cart state. |
| 4 | Phasing | Foundation first. This plan ships primitives + themed generic + 1 reference card. Plan 3 ships the other 9 cards. |
| 5 | Architecture | Shared primitives under `client/src/components/agent/cards/`; Ruby-specific compositions under `client/src/components/ruby/cards/`. Matches the existing agent/ruby split. |

## Architecture

### File layout

```
client/src/components/
├── agent/                          (existing folder)
│   ├── AgentChat.tsx               (existing)
│   ├── MessageBubble.tsx           (existing)
│   ├── ToolCard.tsx                (existing — dispatcher, lightly modified)
│   ├── toolRegistry.ts             (existing — types only)
│   ├── GenericToolCard.tsx         DELETED in this plan
│   └── cards/                      NEW
│       ├── CardShell.tsx
│       ├── CardHeader.tsx
│       ├── CardImage.tsx
│       ├── CardCTA.tsx
│       ├── CardGrid.tsx
│       ├── ToolLoadingPill.tsx
│       ├── ThemedGenericCard.tsx
│       └── index.ts
│
└── ruby/                           (existing folder)
    ├── RubyChat.tsx                (existing)
    ├── rubyToolRegistry.ts         (existing — currently empty, populated by this plan)
    └── cards/                      NEW
        ├── DisplayMakeupProductsCard.tsx
        └── index.ts
```

### Dispatch chain (unchanged shape; only the fallback target changes)

```
useAgentChat → AgentChat → MessageBubble → ToolCard
                                              ↓
                          rubyToolRegistry[toolName] → bespoke card (if registered)
                                              ↓ (otherwise)
                                       ThemedGenericCard
```

`ToolCard.tsx` already dispatches via registry; this plan changes only the fallback import from `GenericToolCard` to `ThemedGenericCard`.

### No new runtime dependencies

Pure React + Tailwind + existing chat plumbing. `react-markdown` is already in the dependency tree and is reused by `ThemedGenericCard`.

## Theme tokens

The repo uses shadcn-style HSL CSS variables with class-based dark mode (`darkMode: ["class"]` in `tailwind.config.ts`). This plan adds **7 new semantic tokens** scoped to tool cards. Light values render the clean-minimal look; dark values render the brand-matched look.

### `client/src/index.css`

```css
:root {
  /* ... existing tokens ... */

  /* Tool card tokens — light = clean minimal */
  --tool-card:              0 0% 100%;
  --tool-card-foreground:   240 6% 10%;
  --tool-card-border:       240 5% 90%;
  --tool-card-muted:        240 5% 96%;
  --tool-card-muted-fg:     240 4% 46%;
  --tool-card-accent:       240 6% 10%;
  --tool-card-accent-fg:    0 0% 100%;
}

.dark {
  /* ... existing dark tokens ... */

  /* Tool card tokens — dark = brand-matched */
  --tool-card:              273 35% 11%;
  --tool-card-foreground:   0 0% 100%;
  --tool-card-border:       272 27% 24%;
  --tool-card-muted:        273 32% 14%;
  --tool-card-muted-fg:     255 92% 76%;
  --tool-card-accent:       262 83% 58%;
  --tool-card-accent-fg:    0 0% 100%;
}
```

### `tailwind.config.ts` (extend `theme.extend.colors`)

```ts
"tool-card": {
  DEFAULT: "hsl(var(--tool-card))",
  foreground:           "hsl(var(--tool-card-foreground))",
  border:               "hsl(var(--tool-card-border))",
  muted:                "hsl(var(--tool-card-muted))",
  "muted-foreground":   "hsl(var(--tool-card-muted-fg))",
  accent:               "hsl(var(--tool-card-accent))",
  "accent-foreground":  "hsl(var(--tool-card-accent-fg))",
}
```

### Usage map

| Element | Tailwind classes |
|---|---|
| Outer card | `bg-tool-card text-tool-card-foreground border border-tool-card-border` |
| Inner item tile | `bg-tool-card-muted` |
| Subtitle / price | `text-tool-card-muted-foreground` |
| Pill | `bg-tool-card-muted text-tool-card-muted-foreground` |
| CTA button | `bg-tool-card-accent text-tool-card-accent-foreground` |

**Invariant:** No primitive component uses a `dark:` Tailwind prefix or hard-coded color. The user's existing light/dark toggle drives `.dark` on `<html>`; CSS variables resolve everything from there. A test (see Testing) enforces this.

## Components

### Card prop contract

Every tool card — bespoke or generic — receives `ToolCardProps`:

```ts
// existing in client/src/components/agent/toolRegistry.ts
export interface ToolCardProps {
  invocation: ToolInvocation;
}
```

Where `ToolInvocation` (existing in `shared/agent.ts`) is:

```ts
{
  id: string;
  name: string;
  arguments: unknown;
  response?: unknown;            // undefined until the toolResponse event arrives
  status: "loading" | "complete";
}
```

This contract is unchanged from Plan 1; bespoke and themed cards just consume it differently.

### Primitives — `components/agent/cards/`

Pure, presentational, stateless. Each takes minimal props and renders one well-defined visual unit. They do **not** know about `ToolInvocation` — that's the card-level concern.

#### `CardShell`

```ts
type Props = { children: ReactNode; className?: string };
```

Renders the outer card container: rounded border, themed background, standard padding and vertical margin. Wraps any tool card.

#### `CardHeader`

```ts
type Props = { icon?: ReactNode; title: string; pill?: string };
```

Renders a flex row with optional icon (string or node), bold title, and an optional right-aligned pill (typically the tool name for debug visibility).

#### `CardImage`

```ts
type Props = {
  src?: string;
  alt: string;
  aspect?: "square" | "video";  // default "square"
  fallbackGradient?: string;    // CSS gradient string, default themed purple/pink
};
```

Renders `<img>` if `src` loads. On error or missing `src`, renders a themed gradient placeholder of the same aspect ratio. Layout never collapses.

#### `CardCTA`

```ts
type Props = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";  // default "primary"
};
```

Renders an external link button: `<a target="_blank" rel="noopener noreferrer">`. URLs that don't parse as `http(s):` are rejected and the CTA is omitted (XSS guard).

Variants:
- `primary` — solid `bg-tool-card-accent`
- `ghost` — transparent, themed border, accent text

#### `CardGrid`

```ts
type Props = { children: ReactNode; minItemWidth?: string };  // default "160px"
```

Responsive auto-fill grid for tile lists: `grid-template-columns: repeat(auto-fill, minmax(<minItemWidth>, 1fr))`.

#### `ToolLoadingPill`

```ts
type Props = { name: string };
```

Themed loading indicator used while `invocation.status === "loading"`. Renders a small rounded pill with a spinning wrench icon and "Using {name}…" text. Both `ThemedGenericCard` and bespoke cards delegate to this so the loading visual stays consistent across every tool.

### `ThemedGenericCard` — `components/agent/cards/ThemedGenericCard.tsx`

Replaces `GenericToolCard.tsx`. Handles arbitrary tool responses with sensible defaults, and acts as the dispatcher's fallback.

**Input:** `{ invocation: ToolInvocation }` (the same `ToolCardProps` shape used by every card — see `client/src/components/agent/toolRegistry.ts`). The component reads `invocation.name`, `invocation.status`, `invocation.arguments`, and `invocation.response`.

**Loading state** (`status === "loading"`):
Render a themed inline pill: small `<CardShell>` variant with a spinning wrench icon and "Using {name}…" text. Mirrors the existing `GenericToolCard` loading pattern, just themed.

**Complete state** (`status === "complete"`): Choose `payload = invocation.response ?? invocation.arguments` (handles both async:false tools that return a response and async:true pass-through tools whose data is in arguments). Then apply the rendering rules below (first match wins):

1. `payload` is a string → render as markdown (via `react-markdown`) inside `<CardShell>` with `<CardHeader pill={name}>`.
2. `payload` is an object with a `summary` / `text` / `content` string field → render that field as markdown.
3. `payload` is an array → render each entry as a `<details>` accordion. If entries are objects with `question`/`answer`, render Q&A style; otherwise stringify entry as the accordion body.
4. `payload` is an object (non-array) → render a 2-column key/value table. Values over 200 chars truncate behind a "Show more" toggle.
5. `payload` is `null` / `undefined` → render "(no response)" muted text.

In all cases, the rendering is wrapped in `<CardShell>` with `<CardHeader pill={name}>` so even the fallback looks themed. A `<details>` block at the bottom labeled "Raw response" preserves the dev-debug affordance.

### Reference bespoke card — `DisplayMakeupProductsCard`

Located at `components/ruby/cards/DisplayMakeupProductsCard.tsx`. Same prop shape as every card: `{ invocation: ToolInvocation }`.

The tool is `async: true` (pass-through) — Ruby's model emits product data directly to the frontend as the tool **arguments**. Therefore this card reads `invocation.arguments` (not `invocation.response`).

**Loading state** (`invocation.status === "loading"`): Render the same themed loading pill that `ThemedGenericCard` uses ("Using display_makeup_products…"). Implemented by delegating to a shared `<ToolLoadingPill name={name} />` helper exported from `components/agent/cards/`.

**Complete state** — expected `invocation.arguments` shape (derived from system prompt + tool definition):

```ts
type Product = {
  id: string;
  title: string;
  vendor?: string;
  price: number | string;
  image_url?: string;
  product_url?: string;
  description?: string;
};
type DisplayMakeupProductsArgs = {
  products: Product[];
  title?: string;
};
```

**Layout:** `<CardShell>` → `<CardHeader icon="💄">` → `<CardGrid>` of product tiles; each tile is `<CardImage>` + name + vendor·price + optional `<CardCTA variant="ghost">` to `product_url`.

**Defensive rendering:**
- `arguments` not an object, or `arguments.products` not an array, or empty → render `<ThemedGenericCard invocation={invocation} />` so the user still sees *something* themed.
- Item missing `product_url` → CTA omitted (no broken link).
- Item missing `image_url` → `<CardImage>` shows gradient fallback.
- Malformed item (not an object, or missing `id`/`title`) → skipped silently; warned to `console.warn` in dev only.
- Price normalization: numbers and numeric strings both accepted; rendered via a `formatPrice` helper that adds `$` if missing.

### Registry — `components/ruby/rubyToolRegistry.ts`

```ts
import type { ToolRegistry } from "@/components/agent/toolRegistry";
import { DisplayMakeupProductsCard } from "./cards/DisplayMakeupProductsCard";

export const rubyToolRegistry: ToolRegistry = {
  display_makeup_products: DisplayMakeupProductsCard,
  // Plan 3 fills in the remaining 9 entries here.
};
```

`ToolCard.tsx` is modified only to:
1. Import `ThemedGenericCard` instead of `GenericToolCard`.
2. Use `ThemedGenericCard` as the fallback when `registry[toolName]` is undefined.

`GenericToolCard.tsx` is deleted.

## Error handling

| Case | Behavior |
|---|---|
| Tool response is `undefined` / `null` | `<ThemedGenericCard>` with "(no response)" |
| Tool response is a malformed JSON string | `<ThemedGenericCard>` renders it as markdown (rule 1) |
| Bespoke card's required field missing | Card returns `null` from a guard; dispatcher fallback renders `<ThemedGenericCard>` |
| Image URL fails to load | `<CardImage>` swaps to themed gradient placeholder |
| External CTA URL is not `http(s):` | CTA is omitted (XSS guard) |
| Theme toggle mid-render | CSS variables update synchronously; no React re-render or remount needed |

## Testing

### Unit tests (Vitest + React Testing Library)

One file per primitive, covering:
- Render contract (correct DOM structure, themed classes applied).
- `className` prop composition (one-off overrides don't blow away theme classes).
- Fallback paths where applicable (`CardImage` gradient on error; `CardCTA` rejection of non-http(s) URLs).

`ThemedGenericCard.test.tsx` covers all 5 rendering rules with representative inputs.

`DisplayMakeupProductsCard.test.tsx` covers:
- Happy path with 3 products, full data.
- Empty `products` array → fallback to `<ThemedGenericCard>`.
- Item missing `product_url` → CTA omitted.
- Item missing `image_url` → `<CardImage>` fallback gradient.
- Malformed item → skipped, others render.
- Price as number, string, and missing.

### Theme invariance test

`themeInvariance.test.tsx` mounts `<CardShell>` once outside a `.dark` wrapper and once inside one; asserts the rendered className strings are identical. Enforces the no-`dark:`-prefix invariant.

### Integration test

Extend the existing `AgentChat` test with a `toolCall` event for `display_makeup_products` carrying a `products` array in its arguments (since it's an `async: true` pass-through tool, the data arrives in arguments, not response). Assert that `DisplayMakeupProductsCard` renders and the generic fallback does not.

### Manual smoke (post-merge)

- Light mode + dark mode `/demo` page, ask Ruby "show me lipsticks" — verify the bespoke card renders correctly in both themes.

## Out of scope

- The other 9 bespoke cards (Plan 3).
- Interactive CTAs that trigger follow-on tool calls (rejected per Decision 3; deferred indefinitely).
- Cart state, booking state, any client-side persistence (rejected per Decision 3).
- Voice mode (Plan 1 v2), avatar mode (Plan 1 v3).
- Backend changes — this is a frontend-only plan.

## Acceptance criteria

1. `client/src/components/agent/GenericToolCard.tsx` is removed.
2. The 6 primitives (`CardShell`, `CardHeader`, `CardImage`, `CardCTA`, `CardGrid`, `ToolLoadingPill`), `ThemedGenericCard`, and `DisplayMakeupProductsCard` exist with the APIs above.
3. `rubyToolRegistry` exports a registry mapping `display_makeup_products` to its card; the dispatcher falls back to `ThemedGenericCard` for unregistered tools.
4. All new components use only `tool-card-*` theme classes; no `dark:` prefixes, no hard-coded colors.
5. All unit tests, the theme invariance test, and the integration test pass.
6. Manual smoke in both light and dark mode shows the bespoke card and themed generic card rendering correctly.
