import type { ReactNode } from "react";

interface CardShellProps {
  children: ReactNode;
  className?: string;
}

// Outer container for every tool card. Themed border + background;
// vertical margin so consecutive cards have breathing room. The
// subtle shadow + hover lift is intentional polish that applies to
// every tool card uniformly — keeps the demo feeling premium without
// each card having to opt in.
export function CardShell({ children, className }: CardShellProps) {
  const base =
    "rounded-xl border border-tool-card-border bg-tool-card text-tool-card-foreground p-3 my-2 shadow-[0_4px_18px_-12px_rgba(0,0,0,0.18)] transition-shadow duration-300 hover:shadow-[0_10px_28px_-12px_rgba(99,38,184,0.28)]";
  return (
    <div className={className ? `${base} ${className}` : base}>{children}</div>
  );
}
