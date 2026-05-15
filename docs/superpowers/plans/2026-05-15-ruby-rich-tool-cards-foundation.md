# Ruby Rich Tool Cards — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the theme-responsive card foundation for Ruby's tool responses — 6 shared primitives, a `ThemedGenericCard` fallback, and one reference bespoke card (`DisplayMakeupProductsCard`) — so the visual language is locked in before scaling to the remaining 9 bespoke cards in a follow-up plan.

**Architecture:** Pure React + Tailwind. Shared primitives live under `client/src/components/agent/cards/` (agent-agnostic). Ruby-specific compositions live under `client/src/components/ruby/cards/`. A new set of `--tool-card-*` HSL CSS variables drives both light and dark themes from one component tree (no `dark:` prefixes in component code). The existing dispatcher `ToolCard.tsx` continues to route by `rubyToolRegistry`; only the fallback flips from `GenericToolCard` to `ThemedGenericCard`.

**Tech Stack:** Vite + React 18 + TypeScript + Tailwind CSS + Vitest. Adds `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, and `jsdom` so React components can be unit-tested (the current Vitest config is node-only and `.test.ts` only).

**Spec:** `docs/superpowers/specs/2026-05-15-ruby-rich-tool-cards-foundation-design.md` (commit `411aa85`).

---

## Task 1: React component test infrastructure

The existing `vitest.config.ts` uses `environment: "node"` and only matches `**/*.test.ts`. This task expands it so `.test.tsx` files run in a jsdom environment with `@testing-library/react` set up.

**Files:**
- Modify: `package.json` (dev deps)
- Modify: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `client/src/components/agent/cards/_smoke.test.tsx` (temporary, deleted in step 6)

- [ ] **Step 1: Install RTL + jsdom dev deps**

Run:
```bash
npm install -D jsdom@^25.0.1 @testing-library/react@^16.1.0 @testing-library/jest-dom@^6.6.3 @testing-library/user-event@^14.5.2
```
Expected: 4 packages added to `devDependencies`, no peer warnings.

- [ ] **Step 2: Update `vitest.config.ts`**

Replace the file with:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules", "dist", ".claude"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
});
```

Rationale: `@vitejs/plugin-react` is already a devDep (it's used by `vite.config.ts`), so no extra install. Switching env to `jsdom` is safe — the only existing test (`parseAgentStream.test.ts`) is pure JS and runs fine in either env.

- [ ] **Step 3: Create `vitest.setup.ts`**

Create `vitest.setup.ts` at the repo root:
```ts
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Clean up DOM between tests so renders don't leak state.
afterEach(() => {
  cleanup();
});
```

- [ ] **Step 4: Write a React smoke test**

Create `client/src/components/agent/cards/_smoke.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

describe("React testing infrastructure smoke test", () => {
  it("mounts a component and queries it", () => {
    render(<div data-testid="smoke">hello</div>);
    expect(screen.getByTestId("smoke")).toHaveTextContent("hello");
  });
});
```

- [ ] **Step 5: Run all tests to verify**

Run: `npm test`
Expected: PASS — both `parseAgentStream.test.ts` (the existing test) and `_smoke.test.tsx` pass.

- [ ] **Step 6: Delete the smoke test and commit**

Run:
```bash
rm client/src/components/agent/cards/_smoke.test.tsx
rmdir client/src/components/agent/cards
git add package.json package-lock.json vitest.config.ts vitest.setup.ts
git commit -m "Add jsdom + @testing-library/react for component tests"
```

---

## Task 2: Tool card theme tokens

Add the 7 new HSL variables (light + dark) and extend `tailwind.config.ts` with the `tool-card` color group. No components yet — just the foundation classes are usable.

**Files:**
- Modify: `client/src/index.css`
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Add light-mode tokens to `:root` in `client/src/index.css`**

Find the `:root` block (starts around line 36, ends at the line with `--radius: 1rem;` and `}`). Add the following lines **immediately before the closing `}` of `:root`**:

```css
  /* Tool card tokens — light = clean minimal */
  --tool-card: 0 0% 100%;
  --tool-card-foreground: 240 6% 10%;
  --tool-card-border: 240 5% 90%;
  --tool-card-muted: 240 5% 96%;
  --tool-card-muted-fg: 240 4% 46%;
  --tool-card-accent: 240 6% 10%;
  --tool-card-accent-fg: 0 0% 100%;
```

- [ ] **Step 2: Add dark-mode tokens to `.dark` in `client/src/index.css`**

Find the `.dark` block that follows `:root`. Add immediately before its closing `}`:

```css
  /* Tool card tokens — dark = brand-matched */
  --tool-card: 273 35% 11%;
  --tool-card-foreground: 0 0% 100%;
  --tool-card-border: 272 27% 24%;
  --tool-card-muted: 273 32% 14%;
  --tool-card-muted-fg: 255 92% 76%;
  --tool-card-accent: 262 83% 58%;
  --tool-card-accent-fg: 0 0% 100%;
```

- [ ] **Step 3: Extend `tailwind.config.ts`**

In `tailwind.config.ts`, locate the `colors:` block inside `theme.extend.colors` (it starts with `background: "hsl(var(--background))",`). Add the following entry **after the existing `card: { ... }` block and before `popover: { ... }`**:

```ts
        "tool-card": {
          DEFAULT: "hsl(var(--tool-card))",
          foreground: "hsl(var(--tool-card-foreground))",
          border: "hsl(var(--tool-card-border))",
          muted: "hsl(var(--tool-card-muted))",
          "muted-foreground": "hsl(var(--tool-card-muted-fg))",
          accent: "hsl(var(--tool-card-accent))",
          "accent-foreground": "hsl(var(--tool-card-accent-fg))",
        },
```

- [ ] **Step 4: Verify the build still type-checks**

Run: `npm run check`
Expected: no TypeScript errors.

- [ ] **Step 5: Commit**

Run:
```bash
git add client/src/index.css tailwind.config.ts
git commit -m "Add tool-card theme tokens (light + dark)"
```

---

## Task 3: `CardShell` primitive

The outer wrapper: rounded themed border, padding, vertical margin.

**Files:**
- Create: `client/src/components/agent/cards/CardShell.tsx`
- Create: `client/src/components/agent/cards/CardShell.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `client/src/components/agent/cards/CardShell.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CardShell } from "./CardShell";

describe("CardShell", () => {
  it("renders children", () => {
    render(<CardShell><span>hello</span></CardShell>);
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("applies the themed base classes", () => {
    const { container } = render(<CardShell>x</CardShell>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toMatch(/bg-tool-card\b/);
    expect(root.className).toMatch(/text-tool-card-foreground\b/);
    expect(root.className).toMatch(/border-tool-card-border\b/);
    expect(root.className).toMatch(/rounded-xl\b/);
  });

  it("appends a custom className", () => {
    const { container } = render(<CardShell className="extra-cls">x</CardShell>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toMatch(/extra-cls/);
    // base theme classes must survive
    expect(root.className).toMatch(/bg-tool-card\b/);
  });

  it("renders identical classes inside and outside .dark", () => {
    const { container: lightC } = render(<CardShell>x</CardShell>);
    const { container: darkC } = render(
      <div className="dark"><CardShell>x</CardShell></div>,
    );
    const lightRoot = lightC.firstElementChild as HTMLElement;
    const darkRoot = (darkC.firstElementChild as HTMLElement)
      .firstElementChild as HTMLElement;
    expect(lightRoot.className).toBe(darkRoot.className);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- client/src/components/agent/cards/CardShell.test.tsx`
Expected: FAIL — `Cannot find module './CardShell'`.

- [ ] **Step 3: Implement `CardShell`**

Create `client/src/components/agent/cards/CardShell.tsx`:
```tsx
import type { ReactNode } from "react";

interface CardShellProps {
  children: ReactNode;
  className?: string;
}

// Outer container for every tool card. Themed border + background;
// vertical margin so consecutive cards have breathing room.
export function CardShell({ children, className }: CardShellProps) {
  const base =
    "rounded-xl border border-tool-card-border bg-tool-card text-tool-card-foreground p-3 my-2";
  return (
    <div className={className ? `${base} ${className}` : base}>{children}</div>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- client/src/components/agent/cards/CardShell.test.tsx`
Expected: PASS — 4 tests passed.

- [ ] **Step 5: Commit**

Run:
```bash
git add client/src/components/agent/cards/CardShell.tsx client/src/components/agent/cards/CardShell.test.tsx
git commit -m "Add CardShell primitive"
```

---

## Task 4: `CardHeader` primitive

Optional icon + bold title + optional right-aligned pill.

**Files:**
- Create: `client/src/components/agent/cards/CardHeader.tsx`
- Create: `client/src/components/agent/cards/CardHeader.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `client/src/components/agent/cards/CardHeader.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CardHeader } from "./CardHeader";

describe("CardHeader", () => {
  it("renders the title", () => {
    render(<CardHeader title="Makeup picks" />);
    expect(screen.getByText("Makeup picks")).toBeInTheDocument();
  });

  it("renders an icon when provided", () => {
    render(<CardHeader icon="💄" title="x" />);
    expect(screen.getByText("💄")).toBeInTheDocument();
  });

  it("omits the icon slot when no icon is provided", () => {
    const { container } = render(<CardHeader title="x" />);
    expect(container.querySelector("[data-testid='card-header-icon']")).toBeNull();
  });

  it("renders a pill when provided", () => {
    render(<CardHeader title="x" pill="display_makeup_products" />);
    expect(screen.getByText("display_makeup_products")).toBeInTheDocument();
  });

  it("uses themed muted classes on the pill", () => {
    render(<CardHeader title="x" pill="tool" />);
    const pill = screen.getByText("tool");
    expect(pill.className).toMatch(/bg-tool-card-muted\b/);
    expect(pill.className).toMatch(/text-tool-card-muted-foreground\b/);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- client/src/components/agent/cards/CardHeader.test.tsx`
Expected: FAIL — `Cannot find module './CardHeader'`.

- [ ] **Step 3: Implement `CardHeader`**

Create `client/src/components/agent/cards/CardHeader.tsx`:
```tsx
import type { ReactNode } from "react";

interface CardHeaderProps {
  icon?: ReactNode;
  title: string;
  pill?: string;
}

// Header row: optional icon, bold title, optional right-aligned pill
// (typically the tool name, for debug visibility).
export function CardHeader({ icon, title, pill }: CardHeaderProps) {
  return (
    <div className="mb-2 flex items-center gap-2">
      {icon != null && (
        <span data-testid="card-header-icon" className="text-base leading-none">
          {icon}
        </span>
      )}
      <span className="text-sm font-semibold">{title}</span>
      {pill && (
        <span className="ml-auto rounded-full bg-tool-card-muted text-tool-card-muted-foreground px-2 py-0.5 text-[10px] font-mono">
          {pill}
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- client/src/components/agent/cards/CardHeader.test.tsx`
Expected: PASS — 5 tests passed.

- [ ] **Step 5: Commit**

Run:
```bash
git add client/src/components/agent/cards/CardHeader.tsx client/src/components/agent/cards/CardHeader.test.tsx
git commit -m "Add CardHeader primitive"
```

---

## Task 5: `CardImage` primitive

Thumbnail with themed gradient fallback on missing/broken `src`.

**Files:**
- Create: `client/src/components/agent/cards/CardImage.tsx`
- Create: `client/src/components/agent/cards/CardImage.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `client/src/components/agent/cards/CardImage.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CardImage } from "./CardImage";

describe("CardImage", () => {
  it("renders an <img> with src and alt when src is provided", () => {
    render(<CardImage src="https://example.com/a.jpg" alt="Lipstick" />);
    const img = screen.getByRole("img") as HTMLImageElement;
    expect(img.src).toBe("https://example.com/a.jpg");
    expect(img.alt).toBe("Lipstick");
  });

  it("renders a gradient placeholder when src is missing", () => {
    render(<CardImage alt="Lipstick" />);
    expect(screen.queryByRole("img")).toBeNull();
    const fallback = screen.getByTestId("card-image-fallback");
    expect(fallback).toBeInTheDocument();
  });

  it("swaps to the gradient placeholder when the image errors", () => {
    render(<CardImage src="https://bad.example/x" alt="x" />);
    const img = screen.getByRole("img");
    fireEvent.error(img);
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByTestId("card-image-fallback")).toBeInTheDocument();
  });

  it("applies the square aspect by default", () => {
    render(<CardImage alt="x" />);
    const fallback = screen.getByTestId("card-image-fallback");
    expect(fallback.className).toMatch(/aspect-square\b/);
  });

  it("applies the video aspect when requested", () => {
    render(<CardImage alt="x" aspect="video" />);
    const fallback = screen.getByTestId("card-image-fallback");
    expect(fallback.className).toMatch(/aspect-video\b/);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- client/src/components/agent/cards/CardImage.test.tsx`
Expected: FAIL — `Cannot find module './CardImage'`.

- [ ] **Step 3: Implement `CardImage`**

Create `client/src/components/agent/cards/CardImage.tsx`:
```tsx
import { useState } from "react";

interface CardImageProps {
  src?: string;
  alt: string;
  aspect?: "square" | "video";
  fallbackGradient?: string;
}

const DEFAULT_GRADIENT = "linear-gradient(135deg, #fbcfe8, #c4b5fd)";

// Thumbnail with a themed gradient fallback. Renders <img> when src loads;
// on missing src or load error, renders a same-aspect gradient block so
// layout never collapses.
export function CardImage({
  src,
  alt,
  aspect = "square",
  fallbackGradient = DEFAULT_GRADIENT,
}: CardImageProps) {
  const [errored, setErrored] = useState(false);
  const aspectClass = aspect === "video" ? "aspect-video" : "aspect-square";
  const showFallback = !src || errored;

  if (showFallback) {
    return (
      <div
        data-testid="card-image-fallback"
        className={`w-full ${aspectClass} rounded-md`}
        style={{ background: fallbackGradient }}
        aria-label={alt}
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErrored(true)}
      className={`w-full ${aspectClass} object-cover rounded-md`}
    />
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- client/src/components/agent/cards/CardImage.test.tsx`
Expected: PASS — 5 tests passed.

Note: the fallback `<div>` deliberately does NOT have `role="img"` — so `queryByRole("img")` returns null in the fallback path and the assertions hold. The fallback carries an `aria-label` for screen readers and is identified in tests via `data-testid`.

- [ ] **Step 5: Commit**

Run:
```bash
git add client/src/components/agent/cards/CardImage.tsx client/src/components/agent/cards/CardImage.test.tsx
git commit -m "Add CardImage primitive with gradient fallback"
```

---

## Task 6: `CardCTA` primitive

External-link button with `http(s):` guard.

**Files:**
- Create: `client/src/components/agent/cards/CardCTA.tsx`
- Create: `client/src/components/agent/cards/CardCTA.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `client/src/components/agent/cards/CardCTA.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CardCTA } from "./CardCTA";

describe("CardCTA", () => {
  it("renders an <a> with target='_blank' and rel='noopener noreferrer'", () => {
    render(<CardCTA href="https://example.com">View</CardCTA>);
    const a = screen.getByRole("link", { name: "View" }) as HTMLAnchorElement;
    expect(a.href).toBe("https://example.com/");
    expect(a.target).toBe("_blank");
    expect(a.rel).toBe("noopener noreferrer");
  });

  it("renders primary variant classes by default", () => {
    render(<CardCTA href="https://example.com">View</CardCTA>);
    const a = screen.getByRole("link");
    expect(a.className).toMatch(/bg-tool-card-accent\b/);
    expect(a.className).toMatch(/text-tool-card-accent-foreground\b/);
  });

  it("renders ghost variant classes when requested", () => {
    render(<CardCTA href="https://example.com" variant="ghost">View</CardCTA>);
    const a = screen.getByRole("link");
    expect(a.className).toMatch(/border-tool-card-border\b/);
    expect(a.className).toMatch(/text-tool-card-accent\b/);
  });

  it("renders nothing for non-http(s) href", () => {
    const { container: c1 } = render(<CardCTA href="javascript:alert(1)">x</CardCTA>);
    expect(c1.firstChild).toBeNull();
    const { container: c2 } = render(<CardCTA href="ftp://example.com">x</CardCTA>);
    expect(c2.firstChild).toBeNull();
    const { container: c3 } = render(<CardCTA href="">x</CardCTA>);
    expect(c3.firstChild).toBeNull();
  });

  it("accepts http (not just https)", () => {
    render(<CardCTA href="http://example.com">View</CardCTA>);
    expect(screen.getByRole("link")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- client/src/components/agent/cards/CardCTA.test.tsx`
Expected: FAIL — `Cannot find module './CardCTA'`.

- [ ] **Step 3: Implement `CardCTA`**

Create `client/src/components/agent/cards/CardCTA.tsx`:
```tsx
import type { ReactNode } from "react";

interface CardCTAProps {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
}

const PRIMARY =
  "inline-block mt-2 rounded-md bg-tool-card-accent text-tool-card-accent-foreground text-xs px-2 py-1";
const GHOST =
  "inline-block mt-2 rounded-md border border-tool-card-border text-tool-card-accent text-xs px-2 py-1";

function isSafeHref(href: string): boolean {
  try {
    const u = new URL(href);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// External-link button. Rejects non-http(s) URLs (XSS guard).
export function CardCTA({ href, children, variant = "primary" }: CardCTAProps) {
  if (!isSafeHref(href)) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={variant === "ghost" ? GHOST : PRIMARY}
    >
      {children}
    </a>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- client/src/components/agent/cards/CardCTA.test.tsx`
Expected: PASS — 5 tests passed.

- [ ] **Step 5: Commit**

Run:
```bash
git add client/src/components/agent/cards/CardCTA.tsx client/src/components/agent/cards/CardCTA.test.tsx
git commit -m "Add CardCTA primitive with http(s) guard"
```

---

## Task 7: `CardGrid` primitive

Responsive auto-fill grid for tile lists.

**Files:**
- Create: `client/src/components/agent/cards/CardGrid.tsx`
- Create: `client/src/components/agent/cards/CardGrid.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `client/src/components/agent/cards/CardGrid.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CardGrid } from "./CardGrid";

describe("CardGrid", () => {
  it("renders all children", () => {
    render(
      <CardGrid>
        <span>a</span>
        <span>b</span>
        <span>c</span>
      </CardGrid>,
    );
    expect(screen.getByText("a")).toBeInTheDocument();
    expect(screen.getByText("b")).toBeInTheDocument();
    expect(screen.getByText("c")).toBeInTheDocument();
  });

  it("uses an auto-fill grid template with default 160px minItemWidth", () => {
    const { container } = render(<CardGrid><span>a</span></CardGrid>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.gridTemplateColumns).toBe(
      "repeat(auto-fill, minmax(160px, 1fr))",
    );
  });

  it("honors a custom minItemWidth", () => {
    const { container } = render(
      <CardGrid minItemWidth="220px"><span>a</span></CardGrid>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.gridTemplateColumns).toBe(
      "repeat(auto-fill, minmax(220px, 1fr))",
    );
  });

  it("applies the gap class", () => {
    const { container } = render(<CardGrid><span>a</span></CardGrid>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toMatch(/grid\b/);
    expect(root.className).toMatch(/gap-2\b/);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- client/src/components/agent/cards/CardGrid.test.tsx`
Expected: FAIL — `Cannot find module './CardGrid'`.

- [ ] **Step 3: Implement `CardGrid`**

Create `client/src/components/agent/cards/CardGrid.tsx`:
```tsx
import type { ReactNode } from "react";

interface CardGridProps {
  children: ReactNode;
  minItemWidth?: string;
}

// Responsive auto-fill grid. Tiles flow into as many columns as the
// container width allows; the inline style is the standard CSS recipe
// for this pattern (Tailwind has no built-in for arbitrary minmax).
export function CardGrid({ children, minItemWidth = "160px" }: CardGridProps) {
  return (
    <div
      className="grid gap-2"
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${minItemWidth}, 1fr))`,
      }}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- client/src/components/agent/cards/CardGrid.test.tsx`
Expected: PASS — 4 tests passed.

- [ ] **Step 5: Commit**

Run:
```bash
git add client/src/components/agent/cards/CardGrid.tsx client/src/components/agent/cards/CardGrid.test.tsx
git commit -m "Add CardGrid primitive"
```

---

## Task 8: `ToolLoadingPill` primitive + barrel

Shared themed loading indicator used by `ThemedGenericCard` and every bespoke card while `invocation.status === "loading"`.

**Files:**
- Create: `client/src/components/agent/cards/ToolLoadingPill.tsx`
- Create: `client/src/components/agent/cards/ToolLoadingPill.test.tsx`
- Create: `client/src/components/agent/cards/index.ts`

- [ ] **Step 1: Write the failing tests**

Create `client/src/components/agent/cards/ToolLoadingPill.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToolLoadingPill } from "./ToolLoadingPill";

describe("ToolLoadingPill", () => {
  it("renders 'Using {name}…' text", () => {
    render(<ToolLoadingPill name="display_makeup_products" />);
    expect(screen.getByText(/Using display_makeup_products…/)).toBeInTheDocument();
  });

  it("uses themed muted classes", () => {
    const { container } = render(<ToolLoadingPill name="x" />);
    const pill = container.firstElementChild as HTMLElement;
    expect(pill.className).toMatch(/bg-tool-card-muted\b/);
    expect(pill.className).toMatch(/text-tool-card-muted-foreground\b/);
  });

  it("renders an animated wrench icon", () => {
    render(<ToolLoadingPill name="x" />);
    const icon = screen.getByTestId("tool-loading-icon");
    expect(icon.className).toMatch(/animate-pulse\b/);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- client/src/components/agent/cards/ToolLoadingPill.test.tsx`
Expected: FAIL — `Cannot find module './ToolLoadingPill'`.

- [ ] **Step 3: Implement `ToolLoadingPill`**

Create `client/src/components/agent/cards/ToolLoadingPill.tsx`:
```tsx
import { Wrench } from "lucide-react";

interface ToolLoadingPillProps {
  name: string;
}

// Themed inline loading indicator. Used by ThemedGenericCard and every
// bespoke card while invocation.status === "loading".
export function ToolLoadingPill({ name }: ToolLoadingPillProps) {
  return (
    <div className="inline-flex items-center gap-2 my-2 rounded-full bg-tool-card-muted text-tool-card-muted-foreground border border-tool-card-border px-3 py-1 text-sm">
      <Wrench
        data-testid="tool-loading-icon"
        className="h-3.5 w-3.5 animate-pulse"
      />
      <span>Using {name}…</span>
    </div>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- client/src/components/agent/cards/ToolLoadingPill.test.tsx`
Expected: PASS — 3 tests passed.

- [ ] **Step 5: Create the barrel**

Create `client/src/components/agent/cards/index.ts`:
```ts
export { CardShell } from "./CardShell";
export { CardHeader } from "./CardHeader";
export { CardImage } from "./CardImage";
export { CardCTA } from "./CardCTA";
export { CardGrid } from "./CardGrid";
export { ToolLoadingPill } from "./ToolLoadingPill";
```

- [ ] **Step 6: Verify the build type-checks**

Run: `npm run check`
Expected: no TypeScript errors.

- [ ] **Step 7: Commit**

Run:
```bash
git add client/src/components/agent/cards/ToolLoadingPill.tsx client/src/components/agent/cards/ToolLoadingPill.test.tsx client/src/components/agent/cards/index.ts
git commit -m "Add ToolLoadingPill primitive + cards barrel"
```

---

## Task 9: `ThemedGenericCard` — skeleton + loading + null payload

Sets up the component shell, loading-state branch, the `payload = response ?? arguments` chooser, and the "(no response)" fallback. No rendering rules yet — rules 1–4 land in Tasks 10–12.

**Files:**
- Create: `client/src/components/agent/cards/ThemedGenericCard.tsx`
- Create: `client/src/components/agent/cards/ThemedGenericCard.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `client/src/components/agent/cards/ThemedGenericCard.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemedGenericCard } from "./ThemedGenericCard";
import type { ToolInvocation } from "@shared/agent";

function inv(overrides: Partial<ToolInvocation> = {}): ToolInvocation {
  return {
    id: "id-1",
    name: "answer_faqs",
    arguments: undefined,
    response: undefined,
    status: "complete",
    ...overrides,
  };
}

describe("ThemedGenericCard — loading & empty", () => {
  it("renders the ToolLoadingPill while loading", () => {
    render(<ThemedGenericCard invocation={inv({ status: "loading" })} />);
    expect(screen.getByText(/Using answer_faqs…/)).toBeInTheDocument();
  });

  it("renders '(no response)' when complete with neither response nor arguments", () => {
    render(<ThemedGenericCard invocation={inv()} />);
    expect(screen.getByText("(no response)")).toBeInTheDocument();
  });

  it("renders the tool name as a pill in the header on the complete branch", () => {
    render(<ThemedGenericCard invocation={inv({ name: "explain_culture" })} />);
    expect(screen.getByText("explain_culture")).toBeInTheDocument();
  });

  it("includes the 'Raw response' details affordance on the complete branch", () => {
    render(<ThemedGenericCard invocation={inv({ response: "hi" })} />);
    expect(screen.getByText(/Raw response/)).toBeInTheDocument();
  });

  it("prefers response over arguments when both exist", () => {
    render(
      <ThemedGenericCard
        invocation={inv({ response: "from-response", arguments: "from-args" })}
      />,
    );
    expect(screen.getByText(/from-response/)).toBeInTheDocument();
    expect(screen.queryByText(/from-args/)).toBeNull();
  });

  it("falls back to arguments when response is undefined", () => {
    render(
      <ThemedGenericCard invocation={inv({ arguments: "from-args" })} />,
    );
    expect(screen.getByText(/from-args/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- client/src/components/agent/cards/ThemedGenericCard.test.tsx`
Expected: FAIL — `Cannot find module './ThemedGenericCard'`.

- [ ] **Step 3: Implement the skeleton**

Create `client/src/components/agent/cards/ThemedGenericCard.tsx`:
```tsx
import type { ToolInvocation } from "@shared/agent";
import { CardShell } from "./CardShell";
import { CardHeader } from "./CardHeader";
import { ToolLoadingPill } from "./ToolLoadingPill";

interface ThemedGenericCardProps {
  invocation: ToolInvocation;
}

// Renders the chosen payload. Tasks 10-12 add rule-based branches; for now
// it just stringifies anything truthy.
function renderPayload(payload: unknown): React.ReactNode {
  if (payload == null) {
    return <span className="text-tool-card-muted-foreground">(no response)</span>;
  }
  return <span>{String(payload)}</span>;
}

// Theme-aware fallback for any tool without a bespoke card. Also handles
// the loading state and exposes a "Raw response" details block in dev.
export function ThemedGenericCard({ invocation }: ThemedGenericCardProps) {
  const { name, status, arguments: args, response } = invocation;

  if (status === "loading") {
    return <ToolLoadingPill name={name} />;
  }

  const payload = response ?? args;

  return (
    <CardShell>
      <CardHeader title={name} pill={name} />
      <div className="text-sm">{renderPayload(payload)}</div>
      <details className="mt-3 text-xs text-tool-card-muted-foreground">
        <summary className="cursor-pointer">Raw response</summary>
        <pre className="mt-1 whitespace-pre-wrap break-words">
          {JSON.stringify({ arguments: args, response }, null, 2)}
        </pre>
      </details>
    </CardShell>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- client/src/components/agent/cards/ThemedGenericCard.test.tsx`
Expected: PASS — 6 tests passed.

- [ ] **Step 5: Commit**

Run:
```bash
git add client/src/components/agent/cards/ThemedGenericCard.tsx client/src/components/agent/cards/ThemedGenericCard.test.tsx
git commit -m "Add ThemedGenericCard skeleton (loading + null payload)"
```

---

## Task 10: `ThemedGenericCard` — string + summary/text/content rules (markdown)

Rule 1: string payload → markdown. Rule 2: object with `summary`/`text`/`content` string field → render that field as markdown.

**Files:**
- Modify: `client/src/components/agent/cards/ThemedGenericCard.tsx`
- Modify: `client/src/components/agent/cards/ThemedGenericCard.test.tsx`

- [ ] **Step 1: Add failing tests**

Append to `client/src/components/agent/cards/ThemedGenericCard.test.tsx`:
```tsx
describe("ThemedGenericCard — string & text-field rules", () => {
  it("renders a string payload as markdown", () => {
    render(<ThemedGenericCard invocation={inv({ response: "**bold**" })} />);
    expect(screen.getByText("bold").tagName).toBe("STRONG");
  });

  it("renders object.summary as markdown when present", () => {
    render(
      <ThemedGenericCard
        invocation={inv({ response: { summary: "**hello**", extra: 1 } })}
      />,
    );
    expect(screen.getByText("hello").tagName).toBe("STRONG");
  });

  it("renders object.text as markdown when summary is absent", () => {
    render(
      <ThemedGenericCard
        invocation={inv({ response: { text: "**hi**" } })}
      />,
    );
    expect(screen.getByText("hi").tagName).toBe("STRONG");
  });

  it("renders object.content as markdown when summary & text are absent", () => {
    render(
      <ThemedGenericCard
        invocation={inv({ response: { content: "**ok**" } })}
      />,
    );
    expect(screen.getByText("ok").tagName).toBe("STRONG");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- client/src/components/agent/cards/ThemedGenericCard.test.tsx`
Expected: FAIL on the 4 new tests (existing 6 still pass).

- [ ] **Step 3: Implement rules 1 & 2**

Replace `client/src/components/agent/cards/ThemedGenericCard.tsx` with:
```tsx
import ReactMarkdown from "react-markdown";
import type { ToolInvocation } from "@shared/agent";
import { CardShell } from "./CardShell";
import { CardHeader } from "./CardHeader";
import { ToolLoadingPill } from "./ToolLoadingPill";

interface ThemedGenericCardProps {
  invocation: ToolInvocation;
}

function pickTextField(o: Record<string, unknown>): string | null {
  for (const key of ["summary", "text", "content"] as const) {
    const v = o[key];
    if (typeof v === "string") return v;
  }
  return null;
}

function renderPayload(payload: unknown): React.ReactNode {
  if (payload == null) {
    return <span className="text-tool-card-muted-foreground">(no response)</span>;
  }
  if (typeof payload === "string") {
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown>{payload}</ReactMarkdown>
      </div>
    );
  }
  if (typeof payload === "object" && !Array.isArray(payload)) {
    const text = pickTextField(payload as Record<string, unknown>);
    if (text !== null) {
      return (
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>
      );
    }
  }
  // Rules 3 and 4 are added in Tasks 11 and 12. Until then, stringify.
  return <span>{String(payload)}</span>;
}

export function ThemedGenericCard({ invocation }: ThemedGenericCardProps) {
  const { name, status, arguments: args, response } = invocation;

  if (status === "loading") {
    return <ToolLoadingPill name={name} />;
  }

  const payload = response ?? args;

  return (
    <CardShell>
      <CardHeader title={name} pill={name} />
      <div className="text-sm">{renderPayload(payload)}</div>
      <details className="mt-3 text-xs text-tool-card-muted-foreground">
        <summary className="cursor-pointer">Raw response</summary>
        <pre className="mt-1 whitespace-pre-wrap break-words">
          {JSON.stringify({ arguments: args, response }, null, 2)}
        </pre>
      </details>
    </CardShell>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- client/src/components/agent/cards/ThemedGenericCard.test.tsx`
Expected: PASS — 10 tests passed.

- [ ] **Step 5: Commit**

Run:
```bash
git add client/src/components/agent/cards/ThemedGenericCard.tsx client/src/components/agent/cards/ThemedGenericCard.test.tsx
git commit -m "ThemedGenericCard: render string + object-text payloads as markdown"
```

---

## Task 11: `ThemedGenericCard` — array → accordion rule

Rule 3: array payload → each entry is a `<details>` accordion. Entries with `question`/`answer` strings render Q&A; other entries stringify into the body.

**Files:**
- Modify: `client/src/components/agent/cards/ThemedGenericCard.tsx`
- Modify: `client/src/components/agent/cards/ThemedGenericCard.test.tsx`

- [ ] **Step 1: Add failing tests**

Append to `client/src/components/agent/cards/ThemedGenericCard.test.tsx`:
```tsx
describe("ThemedGenericCard — array rule", () => {
  it("renders one <details> per array entry (plus the Raw response details)", () => {
    const { container } = render(
      <ThemedGenericCard
        invocation={inv({ response: ["alpha", "beta", "gamma"] })}
      />,
    );
    // 3 entries + 1 'Raw response' details
    expect(container.querySelectorAll("details")).toHaveLength(4);
  });

  it("renders Q&A style when entries have question/answer", () => {
    render(
      <ThemedGenericCard
        invocation={inv({
          response: [
            { question: "What is X?", answer: "It is X." },
            { question: "What is Y?", answer: "It is Y." },
          ],
        })}
      />,
    );
    expect(screen.getByText("What is X?")).toBeInTheDocument();
    expect(screen.getByText("It is X.")).toBeInTheDocument();
    expect(screen.getByText("What is Y?")).toBeInTheDocument();
  });

  it("stringifies non-QA array entries inside the accordion body", () => {
    render(
      <ThemedGenericCard
        invocation={inv({ response: [{ foo: "bar" }] })}
      />,
    );
    expect(screen.getByText(/"foo": "bar"/)).toBeInTheDocument();
  });

  it("handles an empty array gracefully", () => {
    render(<ThemedGenericCard invocation={inv({ response: [] })} />);
    expect(screen.getByText(/\(empty list\)/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- client/src/components/agent/cards/ThemedGenericCard.test.tsx`
Expected: FAIL on the 4 new tests.

- [ ] **Step 3: Implement rule 3**

In `client/src/components/agent/cards/ThemedGenericCard.tsx`, replace the `renderPayload` function with:
```tsx
function isQAEntry(x: unknown): x is { question: string; answer: string } {
  return (
    typeof x === "object" &&
    x !== null &&
    typeof (x as Record<string, unknown>).question === "string" &&
    typeof (x as Record<string, unknown>).answer === "string"
  );
}

function renderArrayEntry(entry: unknown, idx: number): React.ReactNode {
  if (isQAEntry(entry)) {
    return (
      <details
        key={idx}
        className="rounded-md border border-tool-card-border bg-tool-card-muted p-2"
      >
        <summary className="cursor-pointer text-sm font-medium">
          {entry.question}
        </summary>
        <div className="mt-1 text-sm text-tool-card-muted-foreground">
          {entry.answer}
        </div>
      </details>
    );
  }
  return (
    <details
      key={idx}
      className="rounded-md border border-tool-card-border bg-tool-card-muted p-2"
    >
      <summary className="cursor-pointer text-sm">Item {idx + 1}</summary>
      <pre className="mt-1 text-xs text-tool-card-muted-foreground whitespace-pre-wrap break-words">
        {JSON.stringify(entry, null, 2)}
      </pre>
    </details>
  );
}

function renderPayload(payload: unknown): React.ReactNode {
  if (payload == null) {
    return <span className="text-tool-card-muted-foreground">(no response)</span>;
  }
  if (typeof payload === "string") {
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown>{payload}</ReactMarkdown>
      </div>
    );
  }
  if (Array.isArray(payload)) {
    if (payload.length === 0) {
      return <span className="text-tool-card-muted-foreground">(empty list)</span>;
    }
    return <div className="flex flex-col gap-2">{payload.map(renderArrayEntry)}</div>;
  }
  if (typeof payload === "object") {
    const text = pickTextField(payload as Record<string, unknown>);
    if (text !== null) {
      return (
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>
      );
    }
  }
  // Rule 4 (object → key-value table) is added in Task 12. Until then, stringify.
  return <span>{String(payload)}</span>;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- client/src/components/agent/cards/ThemedGenericCard.test.tsx`
Expected: PASS — 14 tests passed.

- [ ] **Step 5: Commit**

Run:
```bash
git add client/src/components/agent/cards/ThemedGenericCard.tsx client/src/components/agent/cards/ThemedGenericCard.test.tsx
git commit -m "ThemedGenericCard: render arrays as Q&A or accordion list"
```

---

## Task 12: `ThemedGenericCard` — object → key/value table with "Show more"

Rule 4: object payload (no text field) → 2-column key/value table. Values over 200 chars truncate behind a "Show more" toggle.

**Files:**
- Modify: `client/src/components/agent/cards/ThemedGenericCard.tsx`
- Modify: `client/src/components/agent/cards/ThemedGenericCard.test.tsx`

- [ ] **Step 1: Add failing tests**

Append to `client/src/components/agent/cards/ThemedGenericCard.test.tsx`:
```tsx
describe("ThemedGenericCard — object key/value rule", () => {
  it("renders a 2-column table for plain object payloads", () => {
    render(
      <ThemedGenericCard
        invocation={inv({ response: { color: "red", size: "M" } })}
      />,
    );
    expect(screen.getByText("color")).toBeInTheDocument();
    expect(screen.getByText("red")).toBeInTheDocument();
    expect(screen.getByText("size")).toBeInTheDocument();
    expect(screen.getByText("M")).toBeInTheDocument();
  });

  it("truncates string values longer than 200 chars behind a 'Show more' toggle", () => {
    const longValue = "x".repeat(250);
    render(
      <ThemedGenericCard
        invocation={inv({ response: { description: longValue } })}
      />,
    );
    expect(screen.queryByText(longValue)).toBeNull();
    expect(screen.getByText(/Show more/)).toBeInTheDocument();
  });

  it("does not truncate values 200 chars or shorter", () => {
    const value = "x".repeat(200);
    render(
      <ThemedGenericCard
        invocation={inv({ response: { description: value } })}
      />,
    );
    expect(screen.getByText(value)).toBeInTheDocument();
    expect(screen.queryByText(/Show more/)).toBeNull();
  });

  it("stringifies nested objects/arrays as JSON inside the row", () => {
    render(
      <ThemedGenericCard
        invocation={inv({ response: { items: ["a", "b"] } })}
      />,
    );
    expect(screen.getByText(/"a"/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- client/src/components/agent/cards/ThemedGenericCard.test.tsx`
Expected: FAIL on the 4 new tests.

- [ ] **Step 3: Implement rule 4**

In `client/src/components/agent/cards/ThemedGenericCard.tsx`, add this helper component above the `ThemedGenericCard` function (it uses `useState`, so include the React import if not already present):

At the top of the file, change the existing import line to:
```tsx
import { useState } from "react";
```

Add this helper component **above** the `ThemedGenericCard` function:
```tsx
function KVRow({ k, v }: { k: string; v: unknown }) {
  const [expanded, setExpanded] = useState(false);
  let display: string;
  let canTruncate = false;
  if (typeof v === "string") {
    display = v;
    canTruncate = v.length > 200;
  } else {
    display = JSON.stringify(v, null, 2);
  }
  const visible =
    canTruncate && !expanded ? display.slice(0, 200) + "…" : display;
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-2 py-1 border-b border-tool-card-border last:border-b-0">
      <div className="text-xs font-mono text-tool-card-muted-foreground break-words">
        {k}
      </div>
      <div className="text-sm break-words">
        {typeof v === "string" ? (
          <span>{visible}</span>
        ) : (
          <pre className="whitespace-pre-wrap break-words text-xs">{visible}</pre>
        )}
        {canTruncate && (
          <button
            type="button"
            className="ml-2 text-xs underline text-tool-card-accent"
            onClick={() => setExpanded((s) => !s)}
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>
    </div>
  );
}
```

Then replace the final `// Rule 4 ...` placeholder + `return <span>{String(payload)}</span>;` lines inside `renderPayload` with:
```tsx
  if (typeof payload === "object") {
    const entries = Object.entries(payload as Record<string, unknown>);
    if (entries.length === 0) {
      return <span className="text-tool-card-muted-foreground">(empty object)</span>;
    }
    return (
      <div className="flex flex-col">
        {entries.map(([k, v]) => (
          <KVRow key={k} k={k} v={v} />
        ))}
      </div>
    );
  }
  return <span>{String(payload)}</span>;
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- client/src/components/agent/cards/ThemedGenericCard.test.tsx`
Expected: PASS — 18 tests passed.

- [ ] **Step 5: Commit**

Run:
```bash
git add client/src/components/agent/cards/ThemedGenericCard.tsx client/src/components/agent/cards/ThemedGenericCard.test.tsx
git commit -m "ThemedGenericCard: render plain objects as key/value table with Show more"
```

---

## Task 13: Wire `ToolCard.tsx` fallback to `ThemedGenericCard`; delete `GenericToolCard.tsx`

Flip the dispatcher's fallback and remove the old component.

**Files:**
- Modify: `client/src/components/agent/ToolCard.tsx`
- Delete: `client/src/components/agent/GenericToolCard.tsx`

- [ ] **Step 1: Update the dispatcher**

Replace `client/src/components/agent/ToolCard.tsx` with:
```tsx
import { ThemedGenericCard } from "./cards/ThemedGenericCard";
import type { ToolRegistry } from "./toolRegistry";
import type { ToolInvocation } from "@shared/agent";

interface ToolCardDispatcherProps {
  invocation: ToolInvocation;
  registry: ToolRegistry;
}

// Looks up the bespoke card for this tool by name; falls back to
// ThemedGenericCard when the registry has no entry. Bespoke cards are
// expected to guard their own payload parsing.
export function ToolCard({ invocation, registry }: ToolCardDispatcherProps) {
  const Bespoke = registry[invocation.name];
  if (Bespoke) {
    return <Bespoke invocation={invocation} />;
  }
  return <ThemedGenericCard invocation={invocation} />;
}
```

- [ ] **Step 2: Delete the old generic card**

Run:
```bash
rm client/src/components/agent/GenericToolCard.tsx
```

- [ ] **Step 3: Verify nothing else imports the deleted file**

Run:
```bash
grep -RIn "GenericToolCard" client/ shared/ server/ 2>/dev/null || echo "no references"
```
Expected: `no references` (or empty output). If anything imports it, update those imports to `ThemedGenericCard` from `./cards/ThemedGenericCard` and re-run until clean.

- [ ] **Step 4: Run the full test suite**

Run: `npm test`
Expected: PASS — all tests including the existing `parseAgentStream` and every `cards/*.test.tsx` file.

- [ ] **Step 5: Verify the build type-checks**

Run: `npm run check`
Expected: no TypeScript errors.

- [ ] **Step 6: Commit**

Run:
```bash
git add client/src/components/agent/ToolCard.tsx client/src/components/agent/GenericToolCard.tsx
git commit -m "Wire ToolCard fallback to ThemedGenericCard; remove old GenericToolCard"
```

---

## Task 14: `DisplayMakeupProductsCard` — happy path

The reference bespoke card. Reads `invocation.arguments.products` (async:true pass-through tool).

**Files:**
- Create: `client/src/components/ruby/cards/DisplayMakeupProductsCard.tsx`
- Create: `client/src/components/ruby/cards/DisplayMakeupProductsCard.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `client/src/components/ruby/cards/DisplayMakeupProductsCard.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DisplayMakeupProductsCard } from "./DisplayMakeupProductsCard";
import type { ToolInvocation } from "@shared/agent";

function inv(args: unknown, overrides: Partial<ToolInvocation> = {}): ToolInvocation {
  return {
    id: "id-1",
    name: "display_makeup_products",
    arguments: args,
    response: undefined,
    status: "complete",
    ...overrides,
  };
}

const sampleProducts = [
  {
    id: "p1",
    title: "Velvet Matte Lipstick",
    vendor: "Ruby Red",
    price: 24,
    image_url: "https://cdn.example/lip.jpg",
    product_url: "https://alorabrands.com/lip",
  },
  {
    id: "p2",
    title: "Hydrating Foundation",
    vendor: "Medium",
    price: "32",
    image_url: "https://cdn.example/found.jpg",
    product_url: "https://alorabrands.com/found",
  },
];

describe("DisplayMakeupProductsCard — happy path", () => {
  it("renders a loading pill when status is loading", () => {
    render(<DisplayMakeupProductsCard invocation={inv({}, { status: "loading" })} />);
    expect(screen.getByText(/Using display_makeup_products…/)).toBeInTheDocument();
  });

  it("renders each product's title and price", () => {
    render(
      <DisplayMakeupProductsCard
        invocation={inv({ products: sampleProducts })}
      />,
    );
    expect(screen.getByText("Velvet Matte Lipstick")).toBeInTheDocument();
    expect(screen.getByText("Hydrating Foundation")).toBeInTheDocument();
    expect(screen.getByText(/\$24/)).toBeInTheDocument();
    expect(screen.getByText(/\$32/)).toBeInTheDocument();
  });

  it("renders the vendor inline with the price when present", () => {
    render(
      <DisplayMakeupProductsCard
        invocation={inv({ products: sampleProducts })}
      />,
    );
    expect(screen.getByText(/Ruby Red · \$24/)).toBeInTheDocument();
  });

  it("renders a CTA link for each product with a product_url", () => {
    render(
      <DisplayMakeupProductsCard
        invocation={inv({ products: sampleProducts })}
      />,
    );
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect((links[0] as HTMLAnchorElement).href).toBe("https://alorabrands.com/lip");
    expect((links[1] as HTMLAnchorElement).href).toBe("https://alorabrands.com/found");
  });

  it("uses the args.title for the header when provided", () => {
    render(
      <DisplayMakeupProductsCard
        invocation={inv({ products: sampleProducts, title: "Top picks for you" })}
      />,
    );
    expect(screen.getByText("Top picks for you")).toBeInTheDocument();
  });

  it("falls back to a default header when title is missing", () => {
    render(
      <DisplayMakeupProductsCard
        invocation={inv({ products: sampleProducts })}
      />,
    );
    expect(screen.getByText("Makeup picks for you")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- client/src/components/ruby/cards/DisplayMakeupProductsCard.test.tsx`
Expected: FAIL — `Cannot find module './DisplayMakeupProductsCard'`.

- [ ] **Step 3: Implement the card (happy path)**

Create `client/src/components/ruby/cards/DisplayMakeupProductsCard.tsx`:
```tsx
import type { ToolInvocation } from "@shared/agent";
import {
  CardShell,
  CardHeader,
  CardImage,
  CardCTA,
  CardGrid,
  ToolLoadingPill,
} from "@/components/agent/cards";

interface DisplayMakeupProductsCardProps {
  invocation: ToolInvocation;
}

interface Product {
  id: string;
  title: string;
  vendor?: string;
  price?: number | string;
  image_url?: string;
  product_url?: string;
  description?: string;
}

function formatPrice(price: number | string | undefined): string {
  if (price == null || price === "") return "";
  const s = String(price);
  return s.startsWith("$") ? s : `$${s}`;
}

function isProduct(x: unknown): x is Product {
  return (
    typeof x === "object" &&
    x !== null &&
    typeof (x as Record<string, unknown>).id === "string" &&
    typeof (x as Record<string, unknown>).title === "string"
  );
}

interface Args {
  products: Product[];
  title?: string;
}

function extractArgs(raw: unknown): Args | null {
  if (typeof raw !== "object" || raw === null) return null;
  const obj = raw as Record<string, unknown>;
  if (!Array.isArray(obj.products)) return null;
  const products = obj.products.filter(isProduct);
  const title = typeof obj.title === "string" ? obj.title : undefined;
  return { products, title };
}

export function DisplayMakeupProductsCard({
  invocation,
}: DisplayMakeupProductsCardProps) {
  const { status, name, arguments: rawArgs } = invocation;

  if (status === "loading") {
    return <ToolLoadingPill name={name} />;
  }

  const args = extractArgs(rawArgs);
  if (!args || args.products.length === 0) {
    // Defensive fallback handled in Task 15. For the happy-path task, this
    // branch is unreachable when callers pass well-formed data.
    return null;
  }

  const headerTitle = args.title ?? "Makeup picks for you";

  return (
    <CardShell>
      <CardHeader icon="💄" title={headerTitle} />
      <CardGrid>
        {args.products.map((p) => (
          <div
            key={p.id}
            className="rounded-lg overflow-hidden bg-tool-card-muted"
          >
            <CardImage src={p.image_url} alt={p.title} aspect="square" />
            <div className="p-2">
              <div className="text-sm font-semibold leading-tight">
                {p.title}
              </div>
              <div className="text-xs text-tool-card-muted-foreground mt-0.5">
                {p.vendor ? `${p.vendor} · ` : ""}
                {formatPrice(p.price)}
              </div>
              {p.product_url && (
                <CardCTA href={p.product_url} variant="ghost">
                  View on store →
                </CardCTA>
              )}
            </div>
          </div>
        ))}
      </CardGrid>
    </CardShell>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- client/src/components/ruby/cards/DisplayMakeupProductsCard.test.tsx`
Expected: PASS — 6 tests passed.

- [ ] **Step 5: Commit**

Run:
```bash
git add client/src/components/ruby/cards/DisplayMakeupProductsCard.tsx client/src/components/ruby/cards/DisplayMakeupProductsCard.test.tsx
git commit -m "Add DisplayMakeupProductsCard — happy path"
```

---

## Task 15: `DisplayMakeupProductsCard` — defensive cases

Bad/missing data must fall back to `ThemedGenericCard`. Individual malformed items get skipped. Missing per-item fields don't break the row.

**Files:**
- Modify: `client/src/components/ruby/cards/DisplayMakeupProductsCard.tsx`
- Modify: `client/src/components/ruby/cards/DisplayMakeupProductsCard.test.tsx`

- [ ] **Step 1: Add failing tests**

Append to `client/src/components/ruby/cards/DisplayMakeupProductsCard.test.tsx`:
```tsx
describe("DisplayMakeupProductsCard — defensive", () => {
  it("falls back to ThemedGenericCard when products is missing", () => {
    render(<DisplayMakeupProductsCard invocation={inv({})} />);
    // Generic card renders the tool name as a pill in its header.
    expect(screen.getByText("display_makeup_products")).toBeInTheDocument();
  });

  it("falls back to ThemedGenericCard when products is empty", () => {
    render(<DisplayMakeupProductsCard invocation={inv({ products: [] })} />);
    expect(screen.getByText("display_makeup_products")).toBeInTheDocument();
  });

  it("falls back to ThemedGenericCard when arguments is not an object", () => {
    render(<DisplayMakeupProductsCard invocation={inv("oops")} />);
    expect(screen.getByText("display_makeup_products")).toBeInTheDocument();
  });

  it("skips malformed items but renders the rest", () => {
    render(
      <DisplayMakeupProductsCard
        invocation={inv({
          products: [
            { id: "ok", title: "Good Item", price: 10, product_url: "https://x.test/a" },
            "garbage" as unknown,
            { /* no id, no title */ price: 5 },
          ],
        })}
      />,
    );
    expect(screen.getByText("Good Item")).toBeInTheDocument();
    // Only one CTA — the malformed entries are skipped.
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  it("omits the CTA when product_url is missing", () => {
    render(
      <DisplayMakeupProductsCard
        invocation={inv({
          products: [{ id: "p1", title: "No Link", price: 5 }],
        })}
      />,
    );
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("No Link")).toBeInTheDocument();
  });

  it("renders only the price (no leading separator) when vendor is missing", () => {
    render(
      <DisplayMakeupProductsCard
        invocation={inv({
          products: [{ id: "p1", title: "No Vendor", price: 7 }],
        })}
      />,
    );
    // Must not contain the " · " separator with no vendor before it.
    expect(screen.queryByText(/^ · \$7$/)).toBeNull();
    expect(screen.getByText(/\$7/)).toBeInTheDocument();
  });

  it("omits the price when price is missing", () => {
    const { container } = render(
      <DisplayMakeupProductsCard
        invocation={inv({
          products: [{ id: "p1", title: "Free", vendor: "Acme" }],
        })}
      />,
    );
    expect(container.textContent).not.toMatch(/\$undefined/);
    expect(container.textContent).not.toMatch(/\$null/);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- client/src/components/ruby/cards/DisplayMakeupProductsCard.test.tsx`
Expected: FAIL on the 7 new tests (the 6 happy-path tests still pass).

- [ ] **Step 3: Add the defensive fallback**

In `client/src/components/ruby/cards/DisplayMakeupProductsCard.tsx`:

1. Add this import near the top, **after** the existing `@/components/agent/cards` import:
```tsx
import { ThemedGenericCard } from "@/components/agent/cards/ThemedGenericCard";
```

2. Replace the early-return block that currently reads:
```tsx
  const args = extractArgs(rawArgs);
  if (!args || args.products.length === 0) {
    // Defensive fallback handled in Task 15. For the happy-path task, this
    // branch is unreachable when callers pass well-formed data.
    return null;
  }
```
with:
```tsx
  const args = extractArgs(rawArgs);
  if (!args || args.products.length === 0) {
    return <ThemedGenericCard invocation={invocation} />;
  }
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- client/src/components/ruby/cards/DisplayMakeupProductsCard.test.tsx`
Expected: PASS — 13 tests passed.

- [ ] **Step 5: Commit**

Run:
```bash
git add client/src/components/ruby/cards/DisplayMakeupProductsCard.tsx client/src/components/ruby/cards/DisplayMakeupProductsCard.test.tsx
git commit -m "DisplayMakeupProductsCard: fall back to ThemedGenericCard on bad payloads"
```

---

## Task 16: Register `display_makeup_products` + integration test

Wire the card into `rubyToolRegistry`, add an integration test that proves the dispatcher routes correctly, and create the ruby cards barrel.

**Files:**
- Modify: `client/src/components/ruby/rubyToolRegistry.ts`
- Create: `client/src/components/ruby/cards/index.ts`
- Create: `client/src/components/agent/ToolCard.test.tsx` (integration test against the dispatcher with a real Ruby registry)

- [ ] **Step 1: Create the ruby cards barrel**

Create `client/src/components/ruby/cards/index.ts`:
```ts
export { DisplayMakeupProductsCard } from "./DisplayMakeupProductsCard";
```

- [ ] **Step 2: Wire the registry**

Replace `client/src/components/ruby/rubyToolRegistry.ts` with:
```ts
import type { ToolRegistry } from "@/components/agent/toolRegistry";
import { DisplayMakeupProductsCard } from "./cards/DisplayMakeupProductsCard";

// Bespoke tool cards for Ruby. Plan 3 will fill in the remaining 9
// visual-heavy tools; the 4 text-heavy tools intentionally stay on the
// ThemedGenericCard fallback.
export const rubyToolRegistry: ToolRegistry = {
  display_makeup_products: DisplayMakeupProductsCard,
};
```

- [ ] **Step 3: Write the integration test**

Create `client/src/components/agent/ToolCard.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToolCard } from "./ToolCard";
import { rubyToolRegistry } from "@/components/ruby/rubyToolRegistry";
import type { ToolInvocation } from "@shared/agent";

function inv(name: string, args: unknown = undefined): ToolInvocation {
  return {
    id: `${name}-id`,
    name,
    arguments: args,
    response: undefined,
    status: "complete",
  };
}

describe("ToolCard dispatcher integration with rubyToolRegistry", () => {
  it("routes display_makeup_products to DisplayMakeupProductsCard", () => {
    render(
      <ToolCard
        invocation={inv("display_makeup_products", {
          products: [
            {
              id: "p1",
              title: "Velvet Matte Lipstick",
              price: 24,
              product_url: "https://example.com/lip",
            },
          ],
        })}
        registry={rubyToolRegistry}
      />,
    );
    // Bespoke layout shows the default header and the product title.
    expect(screen.getByText("Makeup picks for you")).toBeInTheDocument();
    expect(screen.getByText("Velvet Matte Lipstick")).toBeInTheDocument();
  });

  it("falls back to ThemedGenericCard for unregistered tools", () => {
    render(
      <ToolCard
        invocation={inv("answer_faqs", "Some FAQ text")}
        registry={rubyToolRegistry}
      />,
    );
    // ThemedGenericCard shows the tool name as a pill in the header.
    expect(screen.getByText("answer_faqs")).toBeInTheDocument();
    // And renders the string payload as markdown text.
    expect(screen.getByText(/Some FAQ text/)).toBeInTheDocument();
  });

  it("falls back to ThemedGenericCard for display_makeup_products with bad args", () => {
    render(
      <ToolCard
        invocation={inv("display_makeup_products", "garbage")}
        registry={rubyToolRegistry}
      />,
    );
    // Bespoke card delegates to ThemedGenericCard, which puts the tool
    // name in a pill in the header.
    expect(screen.getByText("display_makeup_products")).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run the full test suite**

Run: `npm test`
Expected: PASS — every test file passes, including the new integration test.

- [ ] **Step 5: Verify the build type-checks**

Run: `npm run check`
Expected: no TypeScript errors.

- [ ] **Step 6: Manual smoke (optional but recommended before merging)**

Run the dev server:
```bash
PORT=5001 npm run dev
```
Open `http://localhost:5001/demo` in Chrome. Toggle light/dark mode using the sun/moon button in the header. Verify:
- Greeting bubble still renders.
- Ask Ruby "show me lipsticks" (or similar) → the bespoke `DisplayMakeupProductsCard` renders with the right theme.
- Ask Ruby a culture/FAQ question → `ThemedGenericCard` renders the response.
- Both look correct in both themes (light = clean minimal, dark = brand-matched purple).

- [ ] **Step 7: Commit**

Run:
```bash
git add client/src/components/ruby/rubyToolRegistry.ts client/src/components/ruby/cards/index.ts client/src/components/agent/ToolCard.test.tsx
git commit -m "Register display_makeup_products in rubyToolRegistry + integration tests"
```

---

## Done

After all 16 tasks, the foundation is in place:
- 6 themed primitives ready for Plan 3 to compose.
- `ThemedGenericCard` is the registered fallback for every tool without a bespoke card — and immediately handles the 4 text-heavy tools (`conduct_pre_screening_interview`, `explain_company_culture`, `answer_faqs`, future) much more nicely than the deleted `GenericToolCard` did.
- `DisplayMakeupProductsCard` proves the bespoke-card pattern end-to-end against a real Ruby tool.
- Theme toggle drives both visual modes from one component tree (no `dark:` prefixes anywhere in the new code).

**Plan 3** (a follow-up brainstorm) covers the remaining 9 bespoke cards.
