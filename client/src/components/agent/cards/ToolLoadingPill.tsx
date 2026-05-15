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
