import React from "react";
import { Info, Lightbulb, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalloutProps {
  type?: "tip" | "note" | "warning";
  children: React.ReactNode;
}

export const Callout: React.FC<CalloutProps> = ({
  type = "note",
  children,
}) => {
  const icons = {
    tip: Lightbulb,
    note: Info,
    warning: AlertTriangle,
  };

  const styles = {
    tip: "bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-500/20 dark:border-emerald-500/40",
    note: "bg-primary/10 border-primary/30 dark:bg-primary/20 dark:border-primary/40",
    warning: "bg-yellow-500/10 border-yellow-500/30 dark:bg-yellow-500/20 dark:border-yellow-500/40",
  };

  const textColors = {
    tip: "text-emerald-600 dark:text-emerald-400",
    note: "text-primary dark:text-primary",
    warning: "text-yellow-600 dark:text-yellow-400",
  };

  const Icon = icons[type];

  return (
    <div
      className={cn(
        "my-6 rounded-lg border p-4 flex gap-3 not-prose",
        styles[type]
      )}
    >
      <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", textColors[type])} />
      <div className={cn("flex-1 text-xs [&>p]:mb-0 [&>p:last-child]:mb-0 [&>p]:text-xs [&>strong]:text-xs [&>*]:text-inherit [&>p>code]:text-inherit", textColors[type])}>
        {children}
      </div>
    </div>
  );
};

