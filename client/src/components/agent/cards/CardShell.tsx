import type { ReactNode } from "react";

interface CardShellProps {
  children: ReactNode;
  className?: string;
}

// Outer container for every tool card. Hairline border, flat surface,
// no shadow — relies on the bordered cells inside for visual structure.
export function CardShell({ children, className }: CardShellProps) {
  const base =
    "rounded-xl border border-tool-card-border bg-tool-card text-tool-card-foreground p-3 my-2";
  return (
    <div className={className ? `${base} ${className}` : base}>{children}</div>
  );
}
