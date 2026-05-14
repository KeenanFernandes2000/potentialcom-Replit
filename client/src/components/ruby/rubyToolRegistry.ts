import type { ToolRegistry } from "@/components/agent/toolRegistry";

// Bespoke tool cards for Ruby. Empty for now — every tool falls back to
// GenericToolCard. Plan 2 adds one entry per tool (get_shopify_products,
// track_order, add_to_cart, ...).
export const rubyToolRegistry: ToolRegistry = {};
