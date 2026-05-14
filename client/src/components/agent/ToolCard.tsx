import { GenericToolCard } from "./GenericToolCard";
import type { ToolRegistry } from "./toolRegistry";
import type { ToolInvocation } from "@shared/agent";

interface ToolCardDispatcherProps {
  invocation: ToolInvocation;
  registry: ToolRegistry;
}

// Looks up the bespoke card for this tool by name; falls back to
// GenericToolCard when the registry has no entry. Bespoke cards are expected
// to guard their own payload parsing.
export function ToolCard({ invocation, registry }: ToolCardDispatcherProps) {
  const Bespoke = registry[invocation.name];
  if (Bespoke) {
    return <Bespoke invocation={invocation} />;
  }
  return <GenericToolCard invocation={invocation} />;
}
