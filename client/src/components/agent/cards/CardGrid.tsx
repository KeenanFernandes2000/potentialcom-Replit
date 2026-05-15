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
