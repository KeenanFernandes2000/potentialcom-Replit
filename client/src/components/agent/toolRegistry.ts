import type { ComponentType } from "react";
import type { ToolInvocation } from "@shared/agent";

// Every bespoke tool card receives the same prop shape.
export interface ToolCardProps {
  invocation: ToolInvocation;
}

// Maps a tool name to the component that renders it. Tools absent from a
// registry fall back to GenericToolCard (see ToolCard.tsx).
export type ToolRegistry = Record<string, ComponentType<ToolCardProps>>;
