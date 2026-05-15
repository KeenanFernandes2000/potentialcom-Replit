import type { ToolRegistry } from "@/components/agent/toolRegistry";
import { DisplayMakeupProductsCard } from "./cards/DisplayMakeupProductsCard";
import { SearchShopifyProductsCard } from "./cards/SearchShopifyProductsCard";

// Bespoke tool cards for Ruby. Plan 3 will fill in the remaining 9
// visual-heavy tools; the 4 text-heavy tools intentionally stay on the
// ThemedGenericCard fallback.
export const rubyToolRegistry: ToolRegistry = {
  display_makeup_products: DisplayMakeupProductsCard,
  search_shopify_products: SearchShopifyProductsCard,
};
