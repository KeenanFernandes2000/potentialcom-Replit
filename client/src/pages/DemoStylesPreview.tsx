import { useEffect, useState } from "react";
import { SEO } from "@/components/SEO";
import {
  ShoppingBag,
  Calendar,
  GraduationCap,
  Heart,
  Mic,
  Send,
  Phone,
  ArrowUpRight,
} from "lucide-react";

/**
 * /demo-styles — internal preview page.
 *
 * Three full-width mockup blocks, stacked vertically. Each block is a
 * self-contained "look" for the /demo page (hero + chat snippet + a
 * sample tool card) so you can SEE the typography, color, and
 * composition rendered in real DOM before committing to a redesign.
 *
 * Each direction is a self-contained <section> with hard-coded font /
 * color tokens via inline style + arbitrary Tailwind utilities — so
 * the three identities can't bleed into each other through global
 * CSS. The fonts come from Google Fonts loaded once in index.html.
 *
 * Direction 1 — Editorial Beauty (Vogue / Aesop / Le Labo)
 *   Display: Fraunces (high-contrast serif, optical sizing)
 *   Body:    Manrope (refined geometric sans)
 *   Palette: cream paper, warm graphite, deep ruby accent
 *
 * Direction 2 — Brutalist Tech Couture (Off-White / Issey Miyake)
 *   Display: Archivo Black
 *   Body:    JetBrains Mono
 *   Palette: true black, bone, single chartreuse accent
 *
 * Direction 3 — Modernist Editorial (Swiss / cross-vertical neutral)
 *   Display: Bricolage Grotesque (variable, ultra-wide tracking)
 *   Body:    Manrope
 *   Palette: warm off-white, ink, terracotta accent block
 */
export default function DemoStylesPreview() {
  // Selected card lets you collapse the other two for a focused look.
  const [focused, setFocused] = useState<null | "editorial" | "brutalist" | "modernist">(null);

  // Render-once page title.
  useEffect(() => {
    document.title = "Ruby — Style Preview";
  }, []);

  return (
    <div className="min-h-screen bg-neutral-100">
      <SEO title="Ruby — Style Preview" description="Internal aesthetic preview" />

      {/* Sticky toolbar so you can jump between directions without scrolling. */}
      <div className="sticky top-0 z-50 border-b border-neutral-300 bg-neutral-100/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 text-sm">
          <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">
            Ruby · style preview · internal
          </div>
          <div className="flex gap-2">
            {(["editorial", "brutalist", "modernist"] as const).map((id) => (
              <button
                key={id}
                onClick={() => setFocused(focused === id ? null : id)}
                className={
                  "rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors " +
                  (focused === id
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500")
                }
              >
                {id}
              </button>
            ))}
            <a
              href="/demo"
              className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-700 hover:border-neutral-500"
            >
              back to current /demo →
            </a>
          </div>
        </div>
      </div>

      <main className="space-y-8 px-4 py-8 sm:px-6">
        {(!focused || focused === "editorial") && <EditorialBeauty />}
        {(!focused || focused === "brutalist") && <BrutalistTechCouture />}
        {(!focused || focused === "modernist") && <ModernistEditorial />}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared layout chrome: each direction renders as a "page within a page" so
// the three sit on the gray gutter of the preview shell, clearly bounded.
// ─────────────────────────────────────────────────────────────────────────────
function DirectionCaption({
  number,
  title,
  description,
  fonts,
  palette,
}: {
  number: string;
  title: string;
  description: string;
  fonts: string;
  palette: { label: string; hex: string }[];
}) {
  return (
    <div className="mx-auto mb-3 flex max-w-7xl flex-col gap-3 px-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">
          Direction {number}
        </div>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">
          {title}
        </h2>
        <p className="mt-1 max-w-xl text-sm text-neutral-600">{description}</p>
        <div className="mt-1 font-mono text-xs text-neutral-500">{fonts}</div>
      </div>
      <div className="flex items-center gap-3">
        {palette.map((p) => (
          <div key={p.hex} className="flex items-center gap-1.5">
            <span
              className="h-5 w-5 rounded-full border border-neutral-300"
              style={{ background: p.hex }}
            />
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              {p.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// 1 · EDITORIAL BEAUTY
// ============================================================================
function EditorialBeauty() {
  // Palette tokens scoped to this section only.
  const paper = "#FAF5EE";
  const ink = "#1A1815";
  const ruby = "#7E1A1F";
  const muted = "#8B847A";

  return (
    <section>
      <DirectionCaption
        number="01"
        title="Editorial Beauty"
        description="Spring-issue magazine spread. High-contrast serif headlines, italic captions, numbered sections, hairline rules. The chat reads like a Le Labo apothecary kiosk."
        fonts="Fraunces (display) · Manrope (body)"
        palette={[
          { label: "Paper", hex: paper },
          { label: "Ink", hex: ink },
          { label: "Ruby", hex: ruby },
        ]}
      />
      <div
        className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-neutral-200 shadow-sm"
        style={{ background: paper, color: ink, fontFamily: "'Manrope', sans-serif" }}
      >
        {/* Magazine masthead */}
        <header
          className="flex items-center justify-between border-b px-8 py-4 text-[11px] uppercase tracking-[0.2em]"
          style={{ borderColor: `${ink}22`, color: muted }}
        >
          <span>Edition 01 · The Beauty Issue</span>
          <span className="font-mono">RUBY.ALORA</span>
          <span>Spring 2026</span>
        </header>

        {/* Hero */}
        <div className="grid gap-10 px-8 py-12 lg:grid-cols-[1fr_minmax(0,520px)] lg:gap-16 lg:py-16">
          {/* Left — editorial rail */}
          <div className="flex flex-col justify-center">
            {/* Marginalia: TOC */}
            <div
              className="mb-8 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[11px] uppercase tracking-[0.18em]"
              style={{ color: muted }}
            >
              <span className="font-mono">01</span>
              <span>Shop</span>
              <span className="font-mono">02</span>
              <span>Book</span>
              <span className="font-mono">03</span>
              <span>Learn</span>
              <span className="font-mono">04</span>
              <span>Support</span>
            </div>

            <div
              className="mb-3 inline-flex w-fit items-center gap-2 text-[11px] uppercase tracking-[0.25em]"
              style={{ color: ruby }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: ruby }} />
              In session, now
            </div>

            <h1
              className="text-[64px] leading-[0.92] tracking-tight md:text-[88px]"
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 400,
                fontStyle: "italic",
                fontVariationSettings: '"opsz" 144',
              }}
            >
              Meet
              <br />
              <span style={{ color: ruby, fontStyle: "italic" }}>Ruby.</span>
            </h1>

            <p
              className="mt-5 max-w-md text-[15px] leading-relaxed"
              style={{ color: `${ink}CC` }}
            >
              An AI beauty concierge who shops, books, teaches, and supports —
              over text or live voice. A study in what an enterprise agent
              can become when given personality, taste, and the run of a
              storefront.
            </p>

            {/* Pull-quote */}
            <div
              className="mt-8 max-w-md border-l-2 pl-4 text-sm italic"
              style={{ borderColor: ruby, color: `${ink}AA`, fontFamily: "'Fraunces', serif" }}
            >
              "Tell me what you're getting ready for — I'll find the shade,
              the artist, and the after-care."
              <div
                className="mt-2 font-sans text-[10px] uppercase not-italic tracking-[0.2em]"
                style={{ color: muted, fontFamily: "'Manrope', sans-serif" }}
              >
                — Ruby, on first meeting
              </div>
            </div>

            {/* Try-this */}
            <div className="mt-8">
              <div
                className="mb-3 text-[10px] uppercase tracking-[0.25em]"
                style={{ color: muted }}
              >
                A few openers
              </div>
              <div className="space-y-2">
                {["Show me a wedding-ready lipstick", "Find a makeup artist in Dubai", "Any spring offers?"].map((p) => (
                  <button
                    key={p}
                    className="group flex w-full items-center justify-between border-b py-2 text-left text-sm transition-colors"
                    style={{ borderColor: `${ink}1A` }}
                  >
                    <span className="italic" style={{ fontFamily: "'Fraunces', serif", color: ink }}>
                      "{p}"
                    </span>
                    <ArrowUpRight
                      className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      style={{ color: ruby }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right — chat panel mockup */}
          <div
            className="overflow-hidden rounded-lg border"
            style={{ borderColor: `${ink}1F`, background: "#FFFFFF" }}
          >
            <div
              className="flex items-center gap-3 border-b px-5 py-4"
              style={{ borderColor: `${ink}11` }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-[11px] uppercase tracking-widest"
                style={{ background: ruby, color: paper, fontFamily: "'Fraunces', serif", fontStyle: "italic" }}
              >
                R
              </div>
              <div>
                <div
                  className="text-base"
                  style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
                >
                  Ruby
                </div>
                <div className="text-[11px] uppercase tracking-widest" style={{ color: muted }}>
                  Concierge · live
                </div>
              </div>
              <button
                className="ml-auto inline-flex items-center gap-1.5 border px-3 py-1.5 text-[11px] uppercase tracking-widest transition-colors"
                style={{ borderColor: ink, color: ink }}
              >
                <Phone className="h-3 w-3" />
                Speak
              </button>
            </div>

            <div className="space-y-5 px-5 py-6" style={{ background: paper }}>
              <Msg side="agent" colors={{ bg: "#FFFFFF", border: `${ink}11`, text: ink }}>
                <span style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: 18 }}>
                  Welcome.
                </span>{" "}
                What's the occasion?
              </Msg>
              <Msg side="user" colors={{ bg: ruby, border: "transparent", text: paper }}>
                A spring wedding — I want something soft.
              </Msg>
              <Msg side="agent" colors={{ bg: "#FFFFFF", border: `${ink}11`, text: ink }}>
                Three picks pulled from the Alora rose collection — each
                lasts ten hours with a satin finish.
              </Msg>

              {/* Mini product card */}
              <div
                className="overflow-hidden rounded-md border"
                style={{ borderColor: `${ink}14`, background: "#FFFFFF" }}
              >
                <div className="grid grid-cols-3">
                  {["#E8B4B8", "#B85042", "#8E3B3B"].map((c, i) => (
                    <div key={c} className="flex flex-col items-stretch">
                      <div
                        className="aspect-square"
                        style={{ background: `linear-gradient(135deg, ${c}, #fff)` }}
                      />
                      <div className="p-2">
                        <div
                          className="text-sm"
                          style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
                        >
                          Shade No. {i + 1}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider" style={{ color: muted }}>
                          From $42
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Input */}
            <div
              className="flex items-center gap-3 border-t px-5 py-3"
              style={{ borderColor: `${ink}11`, background: paper }}
            >
              <input
                placeholder="Ask Ruby anything…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:italic"
                style={{
                  fontFamily: "'Fraunces', serif",
                  color: ink,
                }}
              />
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{ background: ink, color: paper }}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer rule */}
        <div
          className="border-t px-8 py-4 text-center text-[10px] uppercase tracking-[0.3em]"
          style={{ borderColor: `${ink}11`, color: muted }}
        >
          Spring 2026 — Ruby × Alora — Available now
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// 2 · BRUTALIST TECH COUTURE
// ============================================================================
function BrutalistTechCouture() {
  const ground = "#0A0A0A";
  const bone = "#F5F2EA";
  const accent = "#D7FF1C"; // chartreuse — single hit
  const dim = "#888378";

  return (
    <section>
      <DirectionCaption
        number="02"
        title="Brutalist Tech Couture"
        description="Off-White / Issey Miyake / COMME. Oversized display type, monospaced labels in brackets, raw rule lines, single chartreuse accent. Aggressive and unapologetic."
        fonts="Archivo Black (display) · JetBrains Mono (body)"
        palette={[
          { label: "Ground", hex: ground },
          { label: "Bone", hex: bone },
          { label: "Accent", hex: accent },
        ]}
      />
      <div
        className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-neutral-900"
        style={{
          background: ground,
          color: bone,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {/* Masthead */}
        <header
          className="flex items-center justify-between border-b px-6 py-3 text-[11px] uppercase tracking-widest"
          style={{ borderColor: `${bone}1F`, color: dim }}
        >
          <span>[ POTENTIAL/RUBY ]</span>
          <span style={{ color: accent }}>● LIVE 00:14:32</span>
          <span>v.2.6.0</span>
        </header>

        {/* Hero */}
        <div className="grid gap-8 px-6 py-10 lg:grid-cols-[1fr_minmax(0,500px)] lg:gap-10 lg:py-16">
          <div>
            <div
              className="mb-6 inline-block px-2 py-1 text-[10px] uppercase tracking-widest"
              style={{ background: accent, color: ground }}
            >
              ⌘ AGENT.001 · BEAUTY VERTICAL
            </div>

            <h1
              className="text-[88px] leading-[0.88] tracking-tighter md:text-[140px]"
              style={{
                fontFamily: "'Archivo Black', sans-serif",
                color: bone,
              }}
            >
              MEET
              <br />
              <span
                className="inline-block -rotate-2 px-3"
                style={{ background: bone, color: ground }}
              >
                RUBY
              </span>
            </h1>

            <p
              className="mt-6 max-w-md text-sm leading-relaxed"
              style={{ color: `${bone}CC` }}
            >
              [ Beauty concierge // shops · books · teaches · supports.
              Text or live voice. Same Potential platform powering
              enterprise agents in production today. ]
            </p>

            {/* Capability tags */}
            <div className="mt-8 flex flex-wrap gap-2">
              {["SHOP", "BOOK", "LEARN", "SUPPORT"].map((c) => (
                <span
                  key={c}
                  className="border px-2 py-1 text-[11px] uppercase tracking-widest"
                  style={{ borderColor: bone, color: bone }}
                >
                  ▸ {c}
                </span>
              ))}
            </div>

            {/* Try-this */}
            <div className="mt-10">
              <div
                className="mb-3 text-[10px] uppercase tracking-widest"
                style={{ color: dim }}
              >
                {">_"} TRY PROMPT:
              </div>
              <div className="space-y-1">
                {[
                  "SHOW ME LIPSTICKS",
                  "FIND ME A MAKEUP EXPERT",
                  "ANY DISCOUNT CODES TODAY",
                ].map((p) => (
                  <button
                    key={p}
                    className="group flex w-full items-center gap-2 border-l-2 border-transparent py-1 pl-2 text-left text-xs uppercase tracking-widest transition-all hover:border-l-2"
                    style={{ color: bone }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = accent)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}
                  >
                    <span style={{ color: accent }}>{">"}</span>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat */}
          <div className="border" style={{ borderColor: `${bone}33`, background: ground }}>
            <div
              className="flex items-center justify-between border-b px-4 py-3 text-[10px] uppercase tracking-widest"
              style={{ borderColor: `${bone}22`, color: dim }}
            >
              <span>RUBY :: ONLINE</span>
              <button
                className="px-2 py-1 text-[10px]"
                style={{ background: accent, color: ground }}
              >
                [ VOICE ]
              </button>
            </div>
            <div className="space-y-3 p-4">
              <div
                className="border-l-2 px-3 py-2 text-sm"
                style={{ borderColor: accent, color: bone }}
              >
                <div className="text-[10px] uppercase tracking-widest" style={{ color: dim }}>
                  &gt; RUBY
                </div>
                Hi. What are you shopping for?
              </div>
              <div
                className="border-l-2 px-3 py-2 text-sm text-right"
                style={{ borderColor: bone, color: bone }}
              >
                <div className="text-[10px] uppercase tracking-widest" style={{ color: dim }}>
                  &gt; YOU
                </div>
                A red lipstick.
              </div>
              <div
                className="border-l-2 px-3 py-2 text-sm"
                style={{ borderColor: accent, color: bone }}
              >
                <div className="text-[10px] uppercase tracking-widest" style={{ color: dim }}>
                  &gt; RUBY
                </div>
                3 RESULTS_
              </div>

              {/* Product tiles */}
              <div className="grid grid-cols-3 gap-1">
                {["#B30000", "#7A0010", "#D0303A"].map((c, i) => (
                  <div
                    key={i}
                    className="border p-2 text-[10px] uppercase tracking-widest"
                    style={{ borderColor: `${bone}33`, color: bone }}
                  >
                    <div
                      className="mb-1 aspect-square"
                      style={{ background: c }}
                    />
                    <div>SKU.{String(i + 1).padStart(3, "0")}</div>
                    <div style={{ color: dim }}>$42</div>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="flex items-center gap-2 border-t p-3"
              style={{ borderColor: `${bone}22` }}
            >
              <span style={{ color: accent }}>{">"}</span>
              <input
                placeholder="TYPE_"
                className="flex-1 bg-transparent text-xs uppercase tracking-widest outline-none placeholder:opacity-50"
                style={{ color: bone }}
              />
              <button
                className="px-2 py-1 text-[10px] uppercase tracking-widest"
                style={{ background: bone, color: ground }}
              >
                SEND
              </button>
            </div>
          </div>
        </div>

        <div
          className="border-t px-6 py-3 text-[10px] uppercase tracking-widest"
          style={{ borderColor: `${bone}1F`, color: dim }}
        >
          [ END OF DEMO // SCROLL FOR CAPABILITIES ▾ ]
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// 3 · MODERNIST EDITORIAL (neutral, cross-vertical)
// ============================================================================
function ModernistEditorial() {
  const paper = "#F4F1EB";
  const ink = "#1F1F1F";
  const accent = "#C25E2A"; // terracotta
  const muted = "#8C887F";

  return (
    <section>
      <DirectionCaption
        number="03"
        title="Modernist Editorial"
        description="Swiss / mid-century. Bricolage Grotesque display type, huge numerals as section markers, geometric terracotta accent block. Industry-neutral so enterprise buyers can imagine their own brand."
        fonts="Bricolage Grotesque (display) · Manrope (body)"
        palette={[
          { label: "Paper", hex: paper },
          { label: "Ink", hex: ink },
          { label: "Terracotta", hex: accent },
        ]}
      />
      <div
        className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-neutral-200 shadow-sm"
        style={{ background: paper, color: ink, fontFamily: "'Manrope', sans-serif" }}
      >
        {/* Top rule */}
        <header
          className="flex items-baseline justify-between border-b px-8 py-5"
          style={{ borderColor: `${ink}1F` }}
        >
          <div
            className="text-[44px] font-bold leading-none"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontVariationSettings: '"opsz" 96' }}
          >
            ↘
          </div>
          <div className="text-[11px] uppercase tracking-widest" style={{ color: muted }}>
            Potential / Demo / 2026
          </div>
        </header>

        {/* Hero */}
        <div className="relative grid gap-10 px-8 py-12 lg:grid-cols-12 lg:gap-12 lg:py-20">
          {/* Decorative terracotta block — geometric accent */}
          <div
            aria-hidden
            className="absolute right-12 top-12 hidden h-24 w-24 lg:block"
            style={{ background: accent }}
          />

          {/* Big numeral marker */}
          <div className="lg:col-span-1">
            <div
              className="text-[120px] leading-none"
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 200,
                color: `${ink}33`,
                fontVariationSettings: '"opsz" 96',
              }}
            >
              01
            </div>
          </div>

          {/* Left content */}
          <div className="lg:col-span-6">
            <div
              className="mb-4 inline-flex items-center gap-2 text-[11px] uppercase tracking-widest"
              style={{ color: muted }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
              The Demo Agent
            </div>

            <h1
              className="text-[64px] leading-[0.92] tracking-tight md:text-[96px]"
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 600,
                fontVariationSettings: '"wdth" 95, "opsz" 96',
              }}
            >
              Meet
              <br />
              Ruby<span style={{ color: accent }}>.</span>
            </h1>

            <p
              className="mt-6 max-w-lg text-base leading-relaxed"
              style={{ color: `${ink}B0` }}
            >
              An AI agent — beauty concierge today, your brand tomorrow.
              She shops, books, teaches, and supports over text or live
              voice. Built on the Potential platform powering enterprise
              agents in production.
            </p>

            {/* Capability grid */}
            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
              {[
                { icon: ShoppingBag, label: "Shop" },
                { icon: Calendar, label: "Book" },
                { icon: GraduationCap, label: "Learn" },
                { icon: Heart, label: "Support" },
              ].map((c, i) => {
                const Icon = c.icon;
                return (
                  <div key={c.label} className="border-t pt-3" style={{ borderColor: `${ink}33` }}>
                    <div
                      className="text-[11px] uppercase tracking-widest"
                      style={{ color: muted }}
                    >
                      0{i + 1}
                    </div>
                    <Icon className="mt-2 h-5 w-5" style={{ color: ink }} strokeWidth={1.5} />
                    <div
                      className="mt-2 text-base"
                      style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500 }}
                    >
                      {c.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Try-this */}
            <div className="mt-10">
              <div
                className="mb-3 text-[11px] uppercase tracking-widest"
                style={{ color: muted }}
              >
                Try one
              </div>
              <div className="flex flex-wrap gap-2">
                {["Show me lipsticks", "Find a makeup expert", "Any discount codes?"].map((p) => (
                  <button
                    key={p}
                    className="border px-3 py-1.5 text-sm transition-colors"
                    style={{ borderColor: ink, color: ink }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat — sits in the right 5 columns */}
          <div className="lg:col-span-5">
            <div
              className="overflow-hidden border"
              style={{ borderColor: `${ink}22`, background: "#FFFFFF" }}
            >
              <div
                className="flex items-center gap-3 border-b px-5 py-4"
                style={{ borderColor: `${ink}11` }}
              >
                <div className="h-9 w-9 rounded-full" style={{ background: accent }} />
                <div>
                  <div
                    className="text-sm font-medium"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    Ruby
                  </div>
                  <div className="text-[11px] uppercase tracking-widest" style={{ color: muted }}>
                    Agent · live
                  </div>
                </div>
                <button
                  className="ml-auto flex items-center gap-1 border px-2.5 py-1 text-[11px] uppercase tracking-widest"
                  style={{ borderColor: ink, color: ink }}
                >
                  <Mic className="h-3 w-3" />
                  Voice
                </button>
              </div>
              <div className="space-y-4 p-5" style={{ background: paper }}>
                <Msg side="agent" colors={{ bg: "#FFFFFF", border: `${ink}11`, text: ink }}>
                  Hi — what are you shopping for today?
                </Msg>
                <Msg side="user" colors={{ bg: ink, border: "transparent", text: paper }}>
                  A red lipstick
                </Msg>
                <Msg side="agent" colors={{ bg: "#FFFFFF", border: `${ink}11`, text: ink }}>
                  Three picks below. Tap any for the full story.
                </Msg>
                <div
                  className="overflow-hidden border"
                  style={{ borderColor: `${ink}14`, background: "#FFFFFF" }}
                >
                  <div className="grid grid-cols-3 divide-x" style={{ borderColor: `${ink}11` }}>
                    {["#B85042", "#7E1A1F", "#D5717D"].map((c, i) => (
                      <div key={c} className="text-[11px]">
                        <div className="aspect-square" style={{ background: c }} />
                        <div className="p-2">
                          <div
                            className="font-medium"
                            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                          >
                            No. {i + 1}
                          </div>
                          <div style={{ color: muted }}>$42</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div
                className="flex items-center gap-2 border-t px-4 py-3"
                style={{ borderColor: `${ink}11`, background: paper }}
              >
                <input
                  placeholder="Ask Ruby anything"
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: ink }}
                />
                <button
                  className="flex h-8 w-8 items-center justify-center"
                  style={{ background: ink, color: paper }}
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared bubble — keeps the three mockups visually consistent in chat shape
// even when the typography + color differ.
// ─────────────────────────────────────────────────────────────────────────────
function Msg({
  side,
  colors,
  children,
}: {
  side: "user" | "agent";
  colors: { bg: string; border: string; text: string };
  children: React.ReactNode;
}) {
  const isUser = side === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          "max-w-[80%] rounded-lg border px-3.5 py-2 text-sm leading-relaxed " +
          (isUser ? "rounded-br-sm" : "rounded-bl-sm")
        }
        style={{
          background: colors.bg,
          borderColor: colors.border,
          color: colors.text,
        }}
      >
        {children}
      </div>
    </div>
  );
}
