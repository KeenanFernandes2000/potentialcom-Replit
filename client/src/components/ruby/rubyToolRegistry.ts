import type { ToolRegistry } from "@/components/agent/toolRegistry";
import { DisplayMakeupProductsCard } from "./cards/DisplayMakeupProductsCard";
import { SearchShopifyProductsCard } from "./cards/SearchShopifyProductsCard";
import { DisplayMakeupExpertsCard } from "./cards/DisplayMakeupExpertsCard";
import { DisplayMakeupCoursesCard } from "./cards/DisplayMakeupCoursesCard";
import { DisplayOpenJobPositionsCard } from "./cards/DisplayOpenJobPositionsCard";
import { BookingCreateCard } from "./cards/BookingCreateCard";
import { AutomationCreateVoiceAgentCard } from "./cards/AutomationCreateVoiceAgentCard";
import { AutomationCreateChatbotCard } from "./cards/AutomationCreateChatbotCard";
import { GetDiscountCodesCard } from "./cards/GetDiscountCodesCard";
import { GetOrderByIdCard } from "./cards/GetOrderByIdCard";
import { DisplayPersonilizedProductsCard } from "./cards/DisplayPersonilizedProductsCard";
import { BookingGetAvailabilityCard } from "./cards/BookingGetAvailabilityCard";
import { DisplayUserCourseProgressCard } from "./cards/DisplayUserCourseProgressCard";
import { RecommendNextLessonCard } from "./cards/RecommendNextLessonCard";

// Bespoke tool cards for Ruby. Text-heavy tools intentionally stay on the
// ThemedGenericCard fallback (handled by the dispatcher).
export const rubyToolRegistry: ToolRegistry = {
  display_makeup_products: DisplayMakeupProductsCard,
  search_shopify_products: SearchShopifyProductsCard,
  display_makeup_experts: DisplayMakeupExpertsCard,
  display_makeup_courses: DisplayMakeupCoursesCard,
  display_open_job_positions: DisplayOpenJobPositionsCard,
  booking_create: BookingCreateCard,
  automation_create_voice_agent: AutomationCreateVoiceAgentCard,
  automation_create_chatbot: AutomationCreateChatbotCard,
  get_discount_codes: GetDiscountCodesCard,
  get_order_by_id: GetOrderByIdCard,
  display_personilized_products: DisplayPersonilizedProductsCard,
  booking_get_availability: BookingGetAvailabilityCard,
  display_user_course_progress: DisplayUserCourseProgressCard,
  recommend_next_lesson: RecommendNextLessonCard,
};
