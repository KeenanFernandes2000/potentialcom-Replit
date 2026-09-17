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
  HeartHandshake,
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
  href?: string;
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
  isParentCategory?: boolean;
  programmeTitle?: string;
  programmeCards?: SolutionCard[];
  audiences?: string[];
  measurementPoints?: string[];
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
    programmeTitle: "Programme paths for workforce priorities",
    programmeCards: [
      {
        title: "Workforce Performance & Certification",
        description:
          "Connect role standards, assessment, learning, practice, qualification and workplace application.",
        icon: BadgeCheck,
      },
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
          "Support structured learning, assessment and renewal over time for continuously developing roles.",
        icon: GraduationCap,
      },
    ],
    audiences: [
      "Frontline and operational workforces",
      "Professional and regulated roles",
      "People, learning and capability teams",
      "Leaders responsible for workforce readiness",
    ],
    measurementPoints: [
      "Role entry and baseline readiness",
      "Learning, practice and assessment progress",
      "Qualification, application and renewal",
      "Agreed workforce capability evidence",
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
      "Empowerment programmes work best when participants know what to do next and programme teams can see how people are progressing. Potential.com connects learning, mentoring, challenges, practical milestones and follow-up in one dedicated experience.",
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
    isParentCategory: true,
    programmeTitle: "Programme paths within this category",
    programmeCards: [
      {
        title: "Entrepreneurship & SME Development",
        description:
          "Support entrepreneurs and SMEs through assessment, learning, mentoring, practical milestones and follow-up.",
        icon: BriefcaseBusiness,
        href: "/solutions/entrepreneurship-sme-development",
      },
      {
        title: "CSR & Community Impact",
        description:
          "Turn community, stakeholder and CSR priorities into structured participation, learning, action and evidence.",
        icon: HeartHandshake,
        href: "/solutions/csr-community-impact",
      },
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
        icon: UsersRound,
      },
      {
        title: "Innovation & Challenges",
        description:
          "Manage applications, submissions, judging, progression and follow-up within a structured programme.",
        icon: Lightbulb,
      },
    ],
    audiences: [
      "Government and public-sector programme owners",
      "Foundations, NGOs and community organisations",
      "Entrepreneurs, SMEs and aspiring founders",
      "Youth, women and other defined participant groups",
    ],
    measurementPoints: [
      "Participation and progression through the journey",
      "Learning, mentoring and practical milestone activity",
      "Applications, submissions and follow-up",
      "Agreed capability and outcome evidence",
    ],
    leadLabel: "SHARED PROGRAMME FOUNDATION",
    leadTitle: "From mandate to measurable progress",
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
  csrCommunityImpact: {
    slug: "/solutions/csr-community-impact",
    seoTitle: "CSR & Community Impact | Potential.com",
    seoDescription:
      "Turn CSR and community priorities into structured participation, learning, action and evidence with Potential.com.",
    label: "CSR & COMMUNITY IMPACT",
    headline: "Turn community priorities into participation and progress.",
    supportingCopy:
      "Create a dedicated experience for CSR, sustainability and community initiatives that helps people learn, contribute, stay engaged and see what happens next.",
    primaryCta: "Discuss Your CSR Initiative",
    finalLabel: "READY TO DESIGN YOUR COMMUNITY JOURNEY?",
    finalHeadline:
      "Start with a defined community priority and a clear first phase.",
    finalCopy:
      "Tell us who you need to engage, what action or capability you want to enable and what evidence matters. We’ll help shape the right journey.",
    heroCenterLabel: "Illustrative impact journey",
    heroCenterTitle: "Participation to action",
    heroNodes: [
      { label: "Community need", icon: Target },
      { label: "Learning hub", icon: BookOpen },
      { label: "Action", icon: HeartHandshake },
      { label: "Evidence", icon: LineChart },
    ],
    whyLabel: "FROM PRIORITY TO PARTICIPATION",
    whyTitle: "Make it easier for people to learn, contribute and stay involved.",
    whyCopy:
      "CSR and community initiatives are stronger when people know how to participate and programme owners can see what is happening. Potential.com connects communication, learning, action, events and follow-up in one dedicated experience.",
    whyCards: [
      {
        title: "Clear participation",
        description:
          "Give stakeholders a clear way to understand the initiative, join the journey and take the next relevant action.",
        icon: UsersRound,
      },
      {
        title: "Learning into action",
        description:
          "Combine trusted resources, guidance, events and practical activities around the change the programme is trying to enable.",
        icon: BookOpen,
      },
      {
        title: "Evidence for stewardship",
        description:
          "Track participation, activity, progress and agreed evidence for programme owners, partners and leadership.",
        icon: LineChart,
      },
    ],
    programmeTitle: "Programme paths for community impact",
    programmeCards: [
      {
        title: "Community Learning",
        description:
          "Build knowledge, confidence and practical participation around a defined community priority.",
        icon: GraduationCap,
      },
      {
        title: "Employee Engagement",
        description:
          "Connect employees to volunteering, learning, challenges and contribution opportunities.",
        icon: UsersRound,
      },
      {
        title: "Stakeholder & Community Hub",
        description:
          "Bring resources, events, discussion and communication into one consistent experience.",
        icon: Network,
      },
      {
        title: "Sustainability & CSR Challenges",
        description:
          "Guide applications, ideas, activities, recognition and follow-up around a shared priority.",
        icon: Lightbulb,
      },
    ],
    audiences: [
      "CSR, sustainability and ESG teams",
      "Foundations and philanthropic organisations",
      "Community and stakeholder programme owners",
      "Employees, volunteers and defined participant groups",
    ],
    measurementPoints: [
      "Reach, participation and engagement",
      "Learning, confidence and practical activity",
      "Contribution, challenge and milestone progress",
      "Agreed community and programme evidence",
    ],
    leadLabel: "PROGRAMME JOURNEY",
    leadTitle: "Connect communication, learning and action",
    leadCopy:
      "Shape the journey around the people, partners and community priority involved. Bring entry, learning, participation, events, practical action and follow-up into a manageable programme flow.",
    leadStages: [
      "Define the Priority",
      "Invite Participation",
      "Learn & Engage",
      "Take Action",
      "Follow Up",
      "Report Evidence",
    ],
    additionalTitle:
      "Keep audience needs visible without turning them into separate products.",
    additionalCards: [
      {
        title: "Community Members",
        description:
          "Create a clear, accessible path from awareness and participation to practical contribution.",
        icon: CircleUserRound,
      },
      {
        title: "Employees & Volunteers",
        description:
          "Coordinate learning, activity, recognition and follow-up across internal participants.",
        icon: Handshake,
      },
      {
        title: "Partners & Stakeholders",
        description:
          "Give external contributors a shared place for resources, updates, activity and progress.",
        icon: Network,
      },
    ],
    views: [
      {
        title: "Participant View",
        description:
          "Priority, resources, events, actions, contribution and next step.",
        icon: CircleUserRound,
      },
      {
        title: "Programme Owner View",
        description:
          "Participation, communications, activities, partners, interventions and follow-up.",
        icon: Network,
      },
      {
        title: "Leadership View",
        description:
          "Reach, engagement, activity and agreed community impact evidence.",
        icon: ChartNoAxesCombined,
      },
    ],
  },
  entrepreneurshipSmeDevelopment: {
    slug: "/solutions/entrepreneurship-sme-development",
    seoTitle: "Entrepreneurship & SME Development | Potential.com",
    seoDescription:
      "Support entrepreneurs and SMEs through structured assessment, learning, mentoring, challenges and practical milestones.",
    label: "ENTREPRENEURSHIP & SME DEVELOPMENT",
    headline: "Help entrepreneurs and SMEs move from potential to progress.",
    supportingCopy:
      "Create a structured journey that connects assessment, learning, mentoring, challenges, practical milestones and follow-up for entrepreneurs, SMEs and the teams that support them.",
    primaryCta: "Discuss Your Entrepreneurship Programme",
    finalLabel: "READY TO SUPPORT ENTREPRENEURIAL PROGRESS?",
    finalHeadline:
      "Start with the audience, stage and milestone that matter most.",
    finalCopy:
      "Tell us who the programme serves, what progress should look like and what your team needs to see. We’ll help shape the right first journey.",
    heroCenterLabel: "Illustrative enterprise journey",
    heroCenterTitle: "Progress in motion",
    heroNodes: [
      { label: "Entry & needs", icon: CircleUserRound },
      { label: "Learning", icon: BookOpen },
      { label: "Mentoring", icon: Handshake },
      { label: "Milestone", icon: Target },
    ],
    whyLabel: "FROM POTENTIAL TO PROGRESS",
    whyTitle: "Give entrepreneurs a practical path through the next stage.",
    whyCopy:
      "Entrepreneurship programmes work best when support is connected to the stage and context of each participant. Potential.com brings learning, mentoring, challenges, practical milestones and follow-up into one manageable journey.",
    whyCards: [
      {
        title: "Stage-aware support",
        description:
          "Organise entry, needs assessment and next steps around the stage, goals and context of each participant.",
        icon: Route,
      },
      {
        title: "Learning with guidance",
        description:
          "Combine practical learning, mentors, coaching, resources and peer engagement around real business needs.",
        icon: Handshake,
      },
      {
        title: "Milestones that matter",
        description:
          "Track practical activity, challenge progression, follow-up and agreed evidence across cohorts.",
        icon: Target,
      },
    ],
    programmeTitle: "Programme paths for entrepreneurship and SMEs",
    programmeCards: [
      {
        title: "Entrepreneurship Development",
        description:
          "Guide aspiring entrepreneurs through needs assessment, learning, mentoring, challenges and next steps.",
        icon: Lightbulb,
      },
      {
        title: "SME Growth & Capability",
        description:
          "Support established SMEs with practical capability, resources, mentoring and progress milestones.",
        icon: BriefcaseBusiness,
      },
      {
        title: "Innovation & Challenges",
        description:
          "Manage applications, submissions, judging, progression, recognition and follow-up.",
        icon: Target,
      },
      {
        title: "Financial Capability for Enterprise",
        description:
          "Build practical financial knowledge and confidence around business and life-stage needs.",
        icon: WalletCards,
      },
    ],
    audiences: [
      "Entrepreneurs and aspiring founders",
      "Small and medium-sized enterprises",
      "Government and economic development programmes",
      "Mentors, partners and programme teams",
    ],
    measurementPoints: [
      "Eligible participation and needs assessment",
      "Learning, mentoring and challenge activity",
      "Practical milestones and progression",
      "Agreed capability and programme evidence",
    ],
    leadLabel: "PROGRAMME JOURNEY",
    leadTitle: "Connect support to practical enterprise milestones",
    leadCopy:
      "Configure the experience around the people served, the stage they are in and the progress the programme wants to enable. Keep participant support and programme visibility connected from entry through follow-up.",
    leadStages: [
      "Eligible Participation",
      "Needs Assessment",
      "Learning & Support",
      "Mentoring & Practice",
      "Practical Milestones",
      "Follow-up & Evidence",
    ],
    additionalTitle:
      "Keep audience lenses connected to the programme journey.",
    additionalCards: [
      {
        title: "Aspiring Entrepreneurs",
        description:
          "Provide accessible guidance, learning and next steps for people exploring enterprise.",
        icon: CircleUserRound,
      },
      {
        title: "Established SMEs",
        description:
          "Support capability, business practice, connections and milestones for growing organisations.",
        icon: Building2,
      },
      {
        title: "Mentors & Partners",
        description:
          "Coordinate mentor activity, resources, referrals and programme follow-up in one view.",
        icon: Handshake,
      },
    ],
    views: [
      {
        title: "Participant View",
        description:
          "Assessment, learning, mentoring, challenge activity, milestone and next step.",
        icon: CircleUserRound,
      },
      {
        title: "Programme Owner View",
        description:
          "Applications, cohorts, mentor activity, interventions, milestones and follow-up.",
        icon: Network,
      },
      {
        title: "Leadership View",
        description:
          "Participation, capability development, progression and agreed programme measures.",
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
      "Enablement is more effective when people can move from onboarding and product knowledge into practice, qualification and ongoing support. Potential.com connects these steps in one branded experience while programme owners see engagement, progression and adoption evidence.",
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
    isParentCategory: true,
    programmeTitle: "Programme paths within this category",
    programmeCards: [
      {
        title: "Partner & Channel Academy",
        description:
          "Bring onboarding, product learning, practice, qualification and ongoing resources into one partner experience.",
        icon: Building2,
      },
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
    audiences: [
      "Customer success and education teams",
      "Partner, channel and dealer networks",
      "Product and enablement leaders",
      "External audiences adopting products or services",
    ],
    measurementPoints: [
      "Onboarding and learning engagement",
      "Practice, proficiency and qualification",
      "Ongoing resource use and partner activity",
      "Agreed adoption and customer success evidence",
    ],
    leadLabel: "SHARED ENABLEMENT FOUNDATION",
    leadTitle: "From onboarding to ongoing adoption",
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