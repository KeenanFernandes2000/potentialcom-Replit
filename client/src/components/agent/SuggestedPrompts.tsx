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
export function SuggestedPrompts({
  onSelect,
  prompts = DEFAULT_PROMPTS,
}: SuggestedPromptsProps) {
  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Sparkles className="h-3 w-3" />
        <span>Try one of these</span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {prompts.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => onSelect(p.prompt)}
            className="group relative flex flex-col items-start gap-1.5 overflow-hidden rounded-xl border border-border bg-card px-3 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-tool-card-muted hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            data-testid={`suggested-prompt-${p.tag.toLowerCase()}`}
          >
            <span
              className="absolute right-2 top-2 rounded-full bg-tool-card-accent/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-tool-card-accent-foreground/80"
              aria-hidden="true"
            >
              {p.tag}
            </span>
            <span className="text-xl leading-none" aria-hidden="true">
              {p.emoji}
            </span>
            <span className="text-xs font-medium leading-snug text-foreground/90 group-hover:text-foreground">
              {p.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
