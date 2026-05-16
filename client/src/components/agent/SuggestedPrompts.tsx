import { Sparkles } from "lucide-react";

interface Prompt {
  emoji: string;
  label: string;
  prompt: string;
  tag: string;
}

interface SuggestedPromptsProps {
  // Called when the user clicks a chip. The parent decides whether to
  // send immediately or pre-fill the input box.
  onSelect: (prompt: string) => void;
  // Optional list override. Defaults to the Ruby-tailored set below.
  prompts?: Prompt[];
}

// Hand-curated to each trigger a different rich tool card so a visitor's
// first few clicks instantly show the agent's range.
// - Show me lipsticks → SearchShopifyProductsCard (real Shopify tiles)
// - Discount codes → GetDiscountCodesCard
// - Makeup experts → DisplayMakeupExpertsCard
// - Courses → DisplayMakeupCoursesCard
const DEFAULT_PROMPTS: Prompt[] = [
  {
    emoji: "💄",
    label: "Show me lipsticks",
    prompt: "Show me lipsticks",
    tag: "Shop",
  },
  {
    emoji: "🎫",
    label: "Active discount codes",
    prompt: "Show me discount codes",
    tag: "Save",
  },
  {
    emoji: "👩‍🎨",
    label: "Find a makeup expert",
    prompt: "Find me a makeup expert",
    tag: "Book",
  },
  {
    emoji: "🎓",
    label: "Beauty courses",
    prompt: "What courses do you have?",
    tag: "Learn",
  },
];

// Empty-state suggestions. Rendered in a responsive grid below the
// greeting bubble. Each chip is keyboard-accessible (it's a real button)
// and discloses its purpose via the `tag` chip.
//
// Demo-polish notes:
// - Each card has a soft gradient glow that intensifies on hover via a
//   pseudo-element (rendered as the first `span` so it sits below the
//   content). This is what makes them feel "alive" rather than flat.
// - Emoji is larger (2xl) and the label is slightly heavier — both
//   targeted at "this is a demo screen people will screenshot."
// - Hover lifts the card and adds a colored shadow that picks up the
//   tag color, reinforcing the category.
export function SuggestedPrompts({
  onSelect,
  prompts = DEFAULT_PROMPTS,
}: SuggestedPromptsProps) {
  return (
    <div className="mt-5">
      <div className="mb-2.5 flex items-center justify-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Sparkles className="h-3 w-3" />
        <span>Try one of these</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {prompts.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => onSelect(p.prompt)}
            className="group relative flex flex-col items-start gap-2 overflow-hidden rounded-2xl border border-border/70 bg-card/80 backdrop-blur px-3 py-3.5 text-left transition-all hover:-translate-y-1 hover:border-fuchsia-400/60 hover:shadow-[0_18px_40px_-18px_rgba(217,70,239,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/50"
            data-testid={`suggested-prompt-${p.tag.toLowerCase()}`}
          >
            {/* Hover glow — sits under the content. Fades in on hover/focus.
                Pointer-events-none so it never blocks the click. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-fuchsia-500/0 via-purple-500/0 to-sky-500/0 opacity-0 transition-opacity duration-300 group-hover:from-fuchsia-500/20 group-hover:via-purple-500/15 group-hover:to-sky-500/15 group-hover:opacity-100"
            />
            <span
              className="absolute right-2 top-2 rounded-full bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/70"
              aria-hidden="true"
            >
              {p.tag}
            </span>
            <span
              className="relative text-2xl leading-none transition-transform duration-300 group-hover:scale-110"
              aria-hidden="true"
            >
              {p.emoji}
            </span>
            <span className="relative text-xs font-semibold leading-snug text-foreground/90 group-hover:text-foreground">
              {p.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
