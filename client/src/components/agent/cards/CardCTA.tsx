import type { ReactNode } from "react";

interface CardCTAProps {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
}

const PRIMARY =
  "inline-block mt-2 rounded-md bg-tool-card-accent text-tool-card-accent-foreground text-xs px-2 py-1";
const GHOST =
  "inline-block mt-2 rounded-md border border-tool-card-border text-tool-card-accent text-xs px-2 py-1";

function isSafeHref(href: string): boolean {
  try {
    const u = new URL(href);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// External-link button. Rejects non-http(s) URLs (XSS guard).
export function CardCTA({ href, children, variant = "primary" }: CardCTAProps) {
  if (!isSafeHref(href)) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={variant === "ghost" ? GHOST : PRIMARY}
    >
      {children}
    </a>
  );
}
