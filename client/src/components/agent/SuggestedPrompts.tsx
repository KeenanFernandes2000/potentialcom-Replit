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

// Empty-state suggestions. Minimal: hairline border, neutral hover,
// small emoji used as a typographic accent rather than a centerpiece.
// Tag chip dropped — the labels are short enough to self-categorize.
export function SuggestedPrompts({
  onSelect,
  prompts = DEFAULT_PROMPTS,
}: SuggestedPromptsProps) {
  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center justify-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <Sparkles className="h-3 w-3" />
        <span>Try one of these</span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
        {prompts.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => onSelect(p.prompt)}
            className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-left text-sm transition-colors hover:border-foreground/30 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            data-testid={`suggested-prompt-${p.tag.toLowerCase()}`}
          >
            <span className="text-base leading-none" aria-hidden="true">
              {p.emoji}
            </span>
            <span className="text-foreground/90">{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
