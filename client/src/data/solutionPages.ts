import type { LucideIcon } from "lucide-react";
import {
  Award,
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  ChartNoAxesCombined,
  CircleUserRound,
  GraduationCap,
  Handshake,
  Lightbulb,
  LineChart,
  Network,
  Orbit,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
  WalletCards,
} from "lucide-react";

export type SolutionCard = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type SolutionView = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type SolutionPageConfig = {
  slug: string;
  seoTitle: string;
  seoDescription: string;
  label: string;
  headline: string;
  supportingCopy: string;
  primaryCta: string;
  finalLabel: string;
  finalHeadline: string;
  finalCopy: string;
  heroCenterLabel: string;
  heroCenterTitle: string;
  heroNodes: { label: string; icon: LucideIcon }[];
  whyLabel: string;
  whyTitle: string;
  whyCopy: string;
  whyCards: SolutionCard[];
  leadLabel: string;
  leadTitle: string;
  leadCopy: string;
  leadStages: string[];
  additionalTitle: string;
  additionalCards: SolutionCard[];
  views: SolutionView[];
};

export const solutionPages: Record<string, SolutionPageConfig> = {
  workforceCapability: {
    slug: "/solutions/workforce-capability",
    seoTitle: "Workforce Capability | Potential.com",
    seoDescription:
      "Develop workforce capability through learning, practice and certification, with evidence of readiness and application.",
    label: "WORKFORCE CAPABILITY",
    headline: "Develop the capability your workforce needs.",
    supportingCopy:
      "Build a dedicated journey for the roles and standards that matter to your organisation. Connect learning, practice, coaching and certification with a clear view of readiness and application.",
    primaryCta: "Discuss Your Workforce Initiative",
    finalLabel: "READY TO BUILD WORKFORCE CAPABILITY?",
    finalHeadline:
      "Start with one role, one audience and one measurable first phase.",
    finalCopy:
      "Tell us which workforce challenge you need to solve and what readiness should look like. We’ll help you shape the right first journey.",
    heroCenterLabel: "Illustrative capability journey",
    heroCenterTitle: "Role readiness",
    heroNodes: [
      { label: "Role profile", icon: CircleUserRound },
      { label: "Skill pathway", icon: Route },
      { label: "Practice scenario", icon: Target },
      { label: "Certification", icon: BadgeCheck },
    ],
    whyLabel: "WHY WORKFORCE CAPABILITY",
    whyTitle: "Move from training activity to role readiness.",
    whyCopy:
      "Workforce development is most useful when it connects directly to the roles, standards and real situations people face. Potential.com brings learning, practice, guidance, assessment and certification into one structured journey so programme owners can see where people are ready, where support is needed and what should happen next.",
    whyCards: [
      {
        title: "Role-aligned pathways",
        description:
          "Organise learning and practice around the responsibilities and standards that matter to each role.",
        icon: Route,
      },
      {
        title: "Practice before application",
        description:
          "Use guided practice, scenarios, coaching and feedback before capability is assessed in the real world.",
        icon: Target,
      },
      {
        title: "Evidence of readiness",
        description:
          "Track assessment, qualification, progression and agreed evidence for programme and leadership reporting.",
        icon: LineChart,
      },
    ],
    leadLabel: "LEAD CONFIGURATION",
    leadTitle: "Workforce Performance & Certification",
    leadCopy:
      "Create a dedicated capability journey for frontline and operational roles where readiness, standards and qualification matter. Connect role expectations to baseline assessment, learning, practice, certification, workplace application and renewal.",
    leadStages: [
      "Role Standards",
      "Baseline Assessment",
      "Learning & Practice",
      "Qualification",
      "Workplace Application",
      "Measurement",
    ],
    additionalTitle: "Adapt the same foundation to other workforce priorities.",
    additionalCards: [
      {
        title: "Applied AI Skills & Enablement",
        description:
          "Build practical AI capability around real roles, workflows and application rather than awareness alone.",
        icon: Sparkles,
      },
      {
        title: "Employee Onboarding",
        description:
          "Guide new employees through role knowledge, practice, support and early-stage readiness.",
        icon: UsersRound,
      },
      {
        title: "Continuing Professional Development",
        description:
          "Support structured learning, assessment and renewal over time for regulated or continuously developing roles.",
        icon: GraduationCap,
      },
    ],
    views: [
      {
        title: "Participant View",
        description:
          "Role profile, personalised pathway, practice, assessment and next action.",
        icon: CircleUserRound,
      },
      {
        title: "Programme Owner View",
        description:
          "Cohorts, readiness gaps, approvals, interventions and renewal activity.",
        icon: Network,
      },
      {
        title: "Leadership View",
        description:
          "Baseline, progress, qualification and agreed workforce capability measures.",
        icon: ChartNoAxesCombined,
      },
    ],
  },
  nationalCommunityEmpowerment: {
    slug: "/solutions/national-community-empowerment",
    seoTitle: "National & Community Empowerment | Potential.com",
    seoDescription:
      "Deliver entrepreneurship, financial capability and community programmes with connected learning, mentoring and progress reporting.",
    label: "NATIONAL & COMMUNITY EMPOWERMENT",
    headline: "Turn your mandate into measurable progress.",
    supportingCopy:
      "Bring learning, mentoring, challenges and engagement together around a defined public or stakeholder mandate. Help participants progress through practical milestones while programme owners see participation, capability and outcome evidence.",
    primaryCta: "Discuss Your Empowerment Programme",
    finalLabel: "READY TO MOVE YOUR MANDATE FORWARD?",
    finalHeadline:
      "Turn a defined public or community priority into a journey people can follow and your team can measure.",
    finalCopy:
      "Tell us the audience you need to serve, the progress you want to enable and what evidence matters. We’ll help you shape the right first phase.",
    heroCenterLabel: "Illustrative empowerment journey",
    heroCenterTitle: "Progress in motion",
    heroNodes: [
      { label: "Eligibility", icon: ShieldCheck },
      { label: "Mentoring", icon: Handshake },
      { label: "Milestone", icon: Target },
      { label: "Progress", icon: LineChart },
    ],
    whyLabel: "FROM MANDATE TO JOURNEY",
    whyTitle: "Give participants a clear path — and programme owners a clear view.",
    whyCopy:
      "Empowerment programmes work best when participants know what to do next and programme teams can see how people are progressing. Potential connects learning, mentoring, challenges, practical milestones and follow-up in one dedicated experience.",
    whyCards: [
      {
        title: "Structured participation",
        description:
          "Guide eligible participants from entry through assessment, learning, support and practical milestones.",
        icon: UsersRound,
      },
      {
        title: "Targeted support",
        description:
          "Use mentoring, coaching, resources and interventions where participants need them most.",
        icon: Handshake,
      },
      {
        title: "Programme evidence",
        description:
          "Track participation, capability, milestones and agreed outcome measures for decision-making and reporting.",
        icon: LineChart,
      },
    ],
    leadLabel: "LEAD CONFIGURATION",
    leadTitle: "Entrepreneurship & SME Development",
    leadCopy:
      "Support entrepreneurs and SMEs through a structured journey that connects assessment, learning, mentoring, challenges, practical milestones and follow-up — while giving programme owners visibility across cohorts and progress.",
    leadStages: [
      "Eligible Participation",
      "Needs Assessment",
      "Learning & Support",
      "Practical Milestones",
      "Follow-up",
      "Reporting",
    ],
    additionalTitle:
      "Configure the platform around different national and community priorities.",
    additionalCards: [
      {
        title: "Financial Capability",
        description:
          "Build practical financial knowledge and confidence around defined audiences and life stages.",
        icon: WalletCards,
      },
      {
        title: "Youth & Employability",
        description:
          "Guide young people through learning, skills, mentoring, challenges and progression opportunities.",
        icon: GraduationCap,
      },
      {
        title: "Women’s Enterprise Development",
        description:
          "Support women entrepreneurs through learning, mentoring, peer engagement and practical business milestones.",
        icon: BriefcaseBusiness,
      },
      {
        title: "Innovation & Challenges",
        description:
          "Manage applications, submissions, judging, progression and follow-up within a structured programme.",
        icon: Lightbulb,
      },
    ],
    views: [
      {
        title: "Participant View",
        description:
          "Eligibility, assessment, personalised pathway, mentoring, milestone and next step.",
        icon: CircleUserRound,
      },
      {
        title: "Programme Owner View",
        description:
          "Applications, cohorts, mentor activity, interventions, milestone progress and follow-up.",
        icon: Network,
      },
      {
        title: "Leadership View",
        description:
          "Participation, capability development, milestone progression and agreed outcome measures.",
        icon: ChartNoAxesCombined,
      },
    ],
  },
  customerPartnerEnablement: {
    slug: "/solutions/customer-partner-enablement",
    seoTitle: "Customer & Partner Enablement | Potential.com",
    seoDescription:
      "Help customers and partners adopt products and build proficiency through dedicated learning, onboarding and certification journeys.",
    label: "CUSTOMER & PARTNER ENABLEMENT",
    headline: "Help customers and partners put knowledge to work.",
    supportingCopy:
      "Help customers get more from your products and services, and help partners deliver them confidently. Bring onboarding, product learning, qualification and ongoing engagement into one dedicated experience.",
    primaryCta: "Discuss Customer or Partner Enablement",
    finalLabel: "READY TO ENABLE YOUR NETWORK?",
    finalHeadline:
      "Give customers and partners a clearer path from onboarding to confident application.",
    finalCopy:
      "Tell us the audience, products or services you need to support and what proficiency should look like. We’ll help you shape the right first journey.",
    heroCenterLabel: "Illustrative enablement journey",
    heroCenterTitle: "Product proficiency",
    heroNodes: [
      { label: "Product hub", icon: Building2 },
      { label: "Practice", icon: BookOpen },
      { label: "Certification", icon: Award },
      { label: "Resources", icon: Network },
    ],
    whyLabel: "FROM ONBOARDING TO ADOPTION",
    whyTitle: "Give every customer or partner a clear path to proficiency.",
    whyCopy:
      "Enablement is more effective when people can move from onboarding and product knowledge into practice, qualification and ongoing support. Potential connects these steps in one branded experience while programme owners see engagement, progression and adoption evidence.",
    whyCards: [
      {
        title: "Faster understanding",
        description:
          "Help customers and partners find the knowledge, guidance and resources relevant to their role or product.",
        icon: BookOpen,
      },
      {
        title: "Confidence through practice",
        description:
          "Use scenarios, assessments and guidance to build proficiency before qualification or application.",
        icon: Target,
      },
      {
        title: "Ongoing engagement",
        description:
          "Keep audiences connected to updated resources, learning, certification and support after onboarding.",
        icon: Network,
      },
    ],
    leadLabel: "LEAD CONFIGURATION",
    leadTitle: "Partner & Channel Academy",
    leadCopy:
      "Create a dedicated academy for distributors, dealers, partners or channel teams that brings onboarding, product learning, practice, qualification and ongoing resources into one experience.",
    leadStages: [
      "Onboarding",
      "Product Practice",
      "Certification",
      "Ongoing Resources",
      "Adoption Evidence",
    ],
    additionalTitle:
      "Extend the same foundation across different external audiences.",
    additionalCards: [
      {
        title: "Customer Education",
        description:
          "Help customers understand and use products, services or processes more effectively.",
        icon: GraduationCap,
      },
      {
        title: "Dealer Certification",
        description:
          "Structure product knowledge, assessment, qualification and renewal for dealer networks.",
        icon: BadgeCheck,
      },
      {
        title: "Product Adoption",
        description:
          "Connect onboarding, learning, practice and ongoing resources around a defined adoption journey.",
        icon: ChartNoAxesCombined,
      },
    ],
    views: [
      {
        title: "Participant / Partner View",
        description:
          "Onboarding, product pathway, practice, assessment, certification and resources.",
        icon: CircleUserRound,
      },
      {
        title: "Programme Owner View",
        description:
          "Partner cohorts, progress, qualification status, interventions and ongoing engagement.",
        icon: Network,
      },
      {
        title: "Leadership View",
        description:
          "Engagement, proficiency, qualification and agreed adoption measures.",
        icon: ChartNoAxesCombined,
      },
    ],
  },
};