import { GenericToolCard } from "./GenericToolCard";
import type { ToolRegistry } from "./toolRegistry";
import type { ToolInvocation } from "@shared/agent";

interface ToolCardProps {
  invocation: ToolInvocation;
  registry: ToolRegistry;
}

// Looks up the bespoke card for this tool; falls back to GenericToolCard.
// If a bespoke card throws on an unexpected payload shape, this still renders
// the generic card (the bespoke cards themselves guard their own parsing).
export function ToolCard({ invocation, registry }: ToolCardProps) {
  const Bespoke = registry[invocation.name];
  if (Bespoke) {
    return <Bespoke invocation={invocation} />;
  }
  return <GenericToolCard invocation={invocation} />;
}
