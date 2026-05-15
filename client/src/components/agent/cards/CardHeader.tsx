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
