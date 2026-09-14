import { useEffect, useState } from "react";
import { SEO } from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { navigateWithUTM } from "@/lib/utm-utils";
import adgmLogo from "@assets/Customer Logos/ADGM logo.png";
import airbusLogo from "@assets/Customer Logos/Airbus Logo.png";
import bankMuscatLogo from "@assets/Customer Logos/Bank mUscat logo.png";
import cartierLogo from "@assets/Customer Logos/Cartier logo.png";
import ciscoLogo from "@assets/Customer Logos/Cisco Logo.png";
import dctLogo from "@assets/Customer Logos/DCT Logo.png";
import dldLogo from "@assets/Customer Logos/DLD Logo.png";
import dellLogo from "@assets/Customer Logos/Dell logo.png";
import edbLogo from "@assets/Customer Logos/EDB logo.png";
import fordLogo from "@assets/Customer Logos/Ford logo.png";
import googleLogo from "@assets/Customer Logos/Google logo.png";
import govAbuDhabiLogo from "@assets/Customer Logos/Government of Abu Dhabi logo.png";
import govDubaiLogo from "@assets/Customer Logos/Government of Dubai logo.png";
import hsbcLogo from "@assets/Customer Logos/HSBC logo.png";
import inditexLogo from "@assets/Customer Logos/Inditex logo.png";
import intelLogo from "@assets/Customer Logos/intel logo.png";
import khalifaFundLogo from "@assets/Customer Logos/Khalifa Fund logo.png";
import mbcLogo from "@assets/Customer Logos/MBC logo.png";
import microsoftLogo from "@assets/Customer Logos/Microsoft logo.png";
import nestleLogo from "@assets/Customer Logos/Nestle Logo.png";
import pepsicoLogo from "@assets/Customer Logos/Pepsico logo.png";
import unWomenLogo from "@assets/Customer Logos/UN Women logo.png";
import unLogo from "@assets/Customer Logos/UN logo.png";
import visaLogo from "@assets/Customer Logos/Visa logo.png";
import wfzoLogo from "@assets/Customer Logos/WFZO logo.png";
import {
  ArrowRight,
  ArrowUpRight,
  Activity,
  AlertCircle,
  BookOpen,
  BrainCircuit,
  Building2,
  Check,
  ChevronRight,
  CircleUserRound,
  Handshake,
  Landmark,
  Layers3,
  LineChart,
  MessageSquare,
  Network,
  PanelsTopLeft,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import platformHeroImage from "@assets/ChatGPT_Image_Sep_10,_2026,_04_17_48_PM_1789042683557.png";

const clientLogos = [
  { name: "ADGM", logo: adgmLogo },
  { name: "Airbus", logo: airbusLogo },
  { name: "Bank Muscat", logo: bankMuscatLogo },
  { name: "Cartier", logo: cartierLogo },
  { name: "Cisco", logo: ciscoLogo },
  { name: "DCT", logo: dctLogo },
  { name: "DLD", logo: dldLogo },
  { name: "Dell", logo: dellLogo },
  { name: "EDB", logo: edbLogo },
  { name: "Ford", logo: fordLogo },
  { name: "Google", logo: googleLogo },
  { name: "Government of Abu Dhabi", logo: govAbuDhabiLogo },
  { name: "Government of Dubai", logo: govDubaiLogo },
  { name: "HSBC", logo: hsbcLogo },
  { name: "Inditex", logo: inditexLogo },
  { name: "Intel", logo: intelLogo },
  { name: "Khalifa Fund", logo: khalifaFundLogo },
  { name: "MBC", logo: mbcLogo },
  { name: "Microsoft", logo: microsoftLogo },
  { name: "Nestle", logo: nestleLogo },
  { name: "PepsiCo", logo: pepsicoLogo },
  { name: "UN Women", logo: unWomenLogo },
  { name: "United Nations", logo: unLogo },
  { name: "Visa", logo: visaLogo },
  { name: "WFZO", logo: wfzoLogo },
];

const impactJourney = [
  {
    stage: "Reach",
    metric: "100%",
    title: "People enter",
    detail: "Interest and intent",
    icon: CircleUserRound,
    status: "Baseline",
  },
  {
    stage: "Learn",
    metric: "82%",
    title: "Learning active",
    detail: "Content and guidance",
    icon: BookOpen,
    status: "Healthy",
  },
  {
    stage: "Practise",
    metric: "68%",
    title: "Practice applied",
    detail: "Role-based action",
    icon: Target,
    status: "Opportunity",
  },
  {
    stage: "Adopt",
    metric: "51%",
    title: "Behaviour sustained",
    detail: "Habit and adoption",
    icon: Route,
    status: "Drop-off",
  },
  {
    stage: "Prove",
    metric: "42%",
    title: "Outcomes evidenced",
    detail: "Impact reporting",
    icon: LineChart,
    status: "Measure",
  },
];

const capabilities = [
  {
    number: "01",
    icon: BookOpen,
    title: "Academy & Courses",
    description:
      "Connect courses, assessments and guided pathways to the skills your audience needs.",
    tags: ["Courses", "Pathways", "Assessments"],
    modalDescription:
      "Connect learning content to the journey people need to complete, with role-based paths, assessments and guided next steps.",
    examples: ["Role-based learning paths", "Assessments", "Guided pathways"],
  },
  {
    number: "02",
    icon: ShieldCheck,
    title: "Certification & Licensing",
    description:
      "Manage eligibility, assessment, qualification and renewal in one participant journey.",
    tags: ["Eligibility", "Credentials", "Renewal"],
    modalDescription:
      "Keep eligibility, assessment, certificates and renewal connected so participants and programme owners always know what comes next.",
    examples: ["Eligibility checks", "Certificates and licences", "Renewal journeys"],
  },
  {
    number: "03",
    icon: Target,
    title: "Competitions & Challenges",
    description:
      "Bring applications, submissions, judging and progression into a clear workflow.",
    tags: ["Applications", "Judging", "Recognition"],
    modalDescription:
      "Move ideas and applications through a clear process from submission and judging to progression and recognition.",
    examples: ["Applications", "Judging workflows", "Progression"],
  },
  {
    number: "04",
    icon: Handshake,
    title: "Mentorship & Coaching",
    description:
      "Support goals, practice and progress through human and AI guidance.",
    tags: ["Mentors", "AI coaching", "Progress"],
    modalDescription:
      "Support each person with goals, practice and progress through a coordinated mix of mentors, human coaching and AI guidance.",
    examples: ["Mentor journeys", "AI coaching", "Goals and progress"],
  },
  {
    number: "05",
    icon: Network,
    title: "Community & Events",
    description:
      "Keep people connected through resources, events, discussion and timely communication.",
    tags: ["Community", "Webinars", "Communication"],
    modalDescription:
      "Give people a consistent place to find resources, join events, participate in discussion and receive timely communication.",
    examples: ["Events", "Resources", "Discussion and communication"],
  },
  {
    number: "06",
    icon: Layers3,
    title: "Innovation & Ideas",
    description:
      "Guide ideas through submission, evaluation and implementation, with recorded progress.",
    tags: ["Ideas", "Evaluation", "Implementation"],
    modalDescription:
      "Guide ideas from submission through evaluation and implementation, with progress recorded for contributors and decision-makers.",
    examples: ["Idea submission", "Evaluation", "Implementation tracking"],
  },
];

const initiativePillars = [
  {
    title: "Dedicated Experience",
    description: "Your branding, audience, roles and journey.",
    icon: PanelsTopLeft,
  },
  {
    title: "Connected Operations",
    description: "Administration, approvals, communication and follow-up in one place.",
    icon: Network,
  },
  {
    title: "Evidence for Decisions",
    description: "Baseline, progress, qualification and agreed outcome measures.",
    icon: LineChart,
  },
];

const platformViews = [
  {
    title: "Participant View",
    description:
      "Give each participant a clear journey from entry and learning through practice, assessment and the next relevant action.",
    stages: ["Entry", "Personalised Pathway", "Practice", "Assessment", "Next Step"],
    icon: CircleUserRound,
  },
  {
    title: "Programme Owner View",
    description:
      "Manage cohorts, approvals, interventions, exceptions and follow-up without losing sight of individual progress.",
    stages: ["Cohorts", "Approval Queues", "Interventions", "Exceptions", "Follow-up"],
    icon: PanelsTopLeft,
  },
  {
    title: "Leadership View",
    description:
      "Turn participation and progress into decision-ready evidence for leadership and programme reporting.",
    stages: ["Baseline", "Progress", "Qualification", "Agreed Outcome Measures"],
    icon: LineChart,
  },
];

const journeys = [
  {
    label: "Participants / Learners",
    title: "Discover, learn, practise, submit, connect and progress.",
    description:
      "People see what matters to them, receive the right prompt at the right time and build momentum through learning, practice and contribution.",
    icon: CircleUserRound,
    accent: "bg-violet-100 text-violet-700",
  },
  {
    label: "Programme Owners / Administrators",
    title: "Configure, manage, communicate, review and intervene.",
    description:
      "Design cohorts, publish content, orchestrate engagement and understand where people are progressing or getting stuck.",
    icon: PanelsTopLeft,
    accent: "bg-amber-100 text-amber-700",
  },
  {
    label: "Leadership",
    title: "See participation, capability, application, outcomes and impact reporting.",
    description:
      "See participation, engagement, capability and outcome signals together, with the context needed for better decisions.",
    icon: LineChart,
    accent: "bg-teal-100 text-teal-700",
  },
];

const deploymentItems = [
  ["Dedicated deployment", "Start from a proven platform foundation configured around your initiative."],
  ["Configurable journeys and roles", "Shape participant pathways, permissions and programme-owner workflows."],
  ["Enterprise administration", "Give programme teams the controls and operating model needed to manage the initiative."],
  ["Integration and deployment options", "Agree language, integration and hosting requirements for the selected deployment."],
  ["Phased launch", "Start with the priority journey, learn from use and expand thoughtfully."],
];

const startSteps = [
  { number: "01", title: "Discover", description: "Define the need, audience and path.", support: true },
  { number: "02", title: "Blueprint", description: "Agree the first journey, roles and success measures." },
  { number: "03", title: "Mockup", description: "Preview a personalised interactive mockup platform." },
  { number: "04", title: "Launch & Prove", description: "Deploy the agreed first phase, measure, improve and expand." },
];

const Platform = () => {
  const [selectedCapability, setSelectedCapability] = useState<(typeof capabilities)[number] | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).AOS) {
      (window as any).AOS.refresh();
    }
  }, []);

  const discussYourInitiative = () => navigateWithUTM("/inquire");

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <SEO
        title="Learning & Engagement Platform | Potential"
        description="Connect learning, certification, coaching, communities and innovation with programme administration and outcome evidence."
        keywords="AI learning platform, enterprise engagement platform, government capability development, Potential.com platform"
        url="https://potential.com/platform"
      />
      <Header />
      <main>
        <section className="relative overflow-hidden border-b border-border/60 bg-[#f6f4fb] pt-32 pb-20 dark:bg-[#10172c] md:pt-40 md:pb-28">
          <div className="absolute inset-0 bg-grid-pattern opacity-40" />
          <div className="absolute -right-40 top-20 h-[30rem] w-[30rem] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-[#f4c98a]/20 blur-3xl" />
          <div className="container relative">
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
              <div data-aos="fade-right">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/75 px-4 py-2 text-sm font-semibold text-primary">
                   <Sparkles className="h-4 w-4" /> Platform
                </div>
                <h1 className="max-w-4xl text-4xl font-bold leading-[1.05] tracking-[-0.04em] text-secondary dark:text-white md:text-6xl lg:text-7xl">
                   One platform around the{" "}
                   <span className="text-primary">journey you need to deliver.</span>
                </h1>
                <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
                   Potential brings learning, practice, certification, coaching, communities,
                   innovation and programme management into one dedicated experience — shaped around
                   your audience, roles and the evidence your initiative needs.
                </p>
                <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Button onClick={discussYourInitiative} size="lg" className="rounded-full px-8 py-6 text-base shadow-lg shadow-primary/20">
                    Discuss Your Initiative <ArrowRight className="h-5 w-5" />
                  </Button>
                   <Button
                     variant="outline"
                     size="lg"
                     onClick={() => navigateWithUTM("/usecases")}
                     className="group rounded-full border-border bg-background/70 px-8 py-6 text-base text-secondary dark:text-white"
                   >
                     Explore Use Cases <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                   </Button>
                </div>
                <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-secondary/10 pt-5 text-sm font-medium text-secondary/70 dark:border-white/15 dark:text-white/80">
                  <span className="flex items-center gap-2"><Landmark className="h-4 w-4 text-primary" /> Public-sector mandates</span>
                  <span className="flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> Enterprise teams</span>
                  <span className="flex items-center gap-2"><BrainCircuit className="h-4 w-4 text-primary" /> AI-supported journeys</span>
                </div>
              </div>
              <div className="relative" data-aos="fade-up" data-aos-delay="150">
                <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary/20 via-transparent to-[#f0b85f]/30 blur-2xl" />
                <div className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-secondary p-2 shadow-2xl">
                  <img
                    src={platformHeroImage}
                    alt="International professionals connected through learning, technology and workforce development"
                    className="aspect-square w-full rounded-[1.25rem] object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="platform-trusted" className="bg-background">
          <div className="relative z-10 w-full">
            <div className="client-logos py-8" data-aos="fade-up" data-aos-delay="100">
              <h3 className="mb-6 text-center text-sm uppercase tracking-wider text-muted-foreground">
                Trusted for over 20 years by leading organizations around the world
              </h3>
              <div className="relative overflow-hidden">
                <div
                  className="flex animate-scroll hover:pause-animation"
                  style={{ width: `${clientLogos.length * 2 * 120}px` }}
                >
                  {clientLogos.map((client, index) => (
                    <div
                      key={`first-${index}`}
                      className="mx-4 flex h-16 w-32 flex-shrink-0 items-center justify-center opacity-70 transition-opacity hover:opacity-100"
                    >
                      <img
                        src={client.logo}
                        alt={`${client.name} logo`}
                        className="max-h-12 max-w-full object-contain dark:brightness-0 dark:invert"
                      />
                    </div>
                  ))}
                  {clientLogos.map((client, index) => (
                    <div
                      key={`second-${index}`}
                      className="mx-4 flex h-16 w-32 flex-shrink-0 items-center justify-center opacity-70 transition-opacity hover:opacity-100"
                    >
                      <img
                        src={client.logo}
                        alt={`${client.name} logo`}
                        className="max-h-12 max-w-full object-contain dark:brightness-0 dark:invert"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-background py-24 md:py-32">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center" data-aos="fade-up">
              <p className="text-sm font-semibold uppercase tracking-[.2em] text-primary">
                Built around the initiative
              </p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-secondary dark:text-white md:text-5xl">
                Configure the experience around your audience and mandate.
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                Start from a proven platform foundation, then configure the journeys, roles, content,
                workflows, reporting and integrations required for your initiative. The goal is not to
                add features for their own sake — it is to create a clear path for participants and a
                manageable operating model for programme owners.
              </p>
            </div>

            <div className="mx-auto mt-14 grid max-w-6xl gap-5 md:grid-cols-3">
              {initiativePillars.map((pillar, index) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 motion-reduce:transition-none"
                    data-aos="fade-up"
                    data-aos-delay={index * 80}
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/40 to-transparent" />
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-7 text-xl font-semibold text-secondary dark:text-white">{pillar.title}</h3>
                    <p className="mt-3 leading-7 text-muted-foreground">{pillar.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-secondary py-20 text-white md:py-24" data-aos="fade-up">
          <div className="container">
            <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
              <div><p className="text-sm font-semibold uppercase tracking-[.2em] text-[#d2b4ff]">Platform overview</p><h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">A platform shaped around your mandate.</h2><p className="mt-5 leading-7 text-white/65">Start with the audience journey that matters now, then combine capabilities as needed. Each platform is dedicated to the client’s brand, audience, roles, workflow, content and success measures.</p></div>
              <div className="grid gap-5 text-base leading-7 text-white/70 sm:grid-cols-3">
                <p><span className="mb-2 block text-2xl font-semibold text-white">Audience experience</span>One clear place to learn, connect, contribute and progress.</p>
                <p><span className="mb-2 block text-2xl font-semibold text-white">Programme owner</span>Manage participation, workflows, communication and intervention.</p>
                <p><span className="mb-2 block text-2xl font-semibold text-white">Leadership evidence</span>See progress, outcomes and impact reporting against the mandate.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-background py-24 md:py-32">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center" data-aos="fade-up">
              <p className="text-sm font-semibold uppercase tracking-[.2em] text-primary">How to Start</p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-secondary dark:text-white md:text-5xl">
                From defined need to measurable first phase.
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                A strong platform journey starts with clarity. Personalised interactive previews are
                prepared for qualified organisations and initiatives.
              </p>
            </div>

            <div className="relative mx-auto mt-16 max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-secondary via-[#18245a] to-primary p-6 shadow-2xl md:p-10" data-aos="fade-up">
              <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
              <div className="absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-primary/30 blur-3xl" aria-hidden="true" />
              <div className="relative grid gap-4 md:grid-cols-4 md:gap-5">
                {startSteps.map((step, index) => (
                  <div
                    key={step.number}
                    className="relative rounded-2xl border border-white/15 bg-white/[.08] p-5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white/[.12] motion-reduce:transition-none md:p-6"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-xl font-bold text-white shadow-lg shadow-black/20">
                      {step.number}
                    </div>
                    <h3 className="mt-6 text-lg font-semibold text-white">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/65">{step.description}</p>
                    {index < startSteps.length - 1 && (
                      <ArrowRight
                        className="absolute -right-4 top-12 z-10 hidden h-8 w-8 rounded-full border border-white/20 bg-[#253475] p-1.5 text-[#d2b4ff] md:block"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f6f4fb] py-24 dark:bg-[#10172c] md:py-32">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center" data-aos="fade-up">
              <p className="text-sm font-semibold uppercase tracking-[.2em] text-primary">One Platform, Three Views</p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-secondary dark:text-white md:text-5xl">
                See the complete initiative — from participant experience to leadership evidence.
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                Use one connected platform to guide participants, keep programme owners in control,
                and give leadership the evidence needed to make decisions.
              </p>
            </div>

            <div className="mx-auto mt-14 grid max-w-7xl gap-5 lg:grid-cols-3">
              {platformViews.map((view, index) => {
                const Icon = view.icon;
                return (
                  <div
                    key={view.title}
                    className="relative overflow-hidden rounded-[1.75rem] border border-border bg-card p-6 shadow-sm"
                    data-aos="fade-up"
                    data-aos-delay={index * 80}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-primary">
                          Demonstration data · Example initiative
                        </p>
                        <h3 className="mt-3 text-2xl font-semibold text-secondary dark:text-white">{view.title}</h3>
                      </div>
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">{view.description}</p>
                    <div className="mt-7 rounded-2xl border border-border bg-muted/50 p-4 dark:bg-secondary/20">
                      <div className="flex flex-wrap items-center gap-2">
                        {view.stages.map((stage, stageIndex) => (
                          <div key={stage} className="flex items-center gap-2">
                            <span className="rounded-full border border-primary/20 bg-background px-3 py-2 text-xs font-semibold text-secondary dark:text-white">
                              {stage}
                            </span>
                            {stageIndex < view.stages.length - 1 && (
                              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary/70" aria-hidden="true" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="capabilities" className="bg-background py-24 md:py-32">
          <div className="container">
            <div className="max-w-3xl" data-aos="fade-up">
              <p className="text-sm font-semibold uppercase tracking-[.2em] text-primary">Core Capabilities</p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-secondary dark:text-white md:text-5xl">
                Six capabilities. One connected experience.
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                Use one capability or combine several into a dedicated platform for your initiative.
              </p>
            </div>
            <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {capabilities.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.number}
                    type="button"
                    onClick={() => setSelectedCapability(item)}
                    className="group flex min-h-[275px] flex-col rounded-2xl border border-border bg-card p-7 text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                    data-aos="fade-up"
                    data-aos-delay={index * 60}
                  >
                    <div className="flex w-full items-start justify-between">
                      <div className="rounded-xl bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="font-mono text-sm text-muted-foreground">{item.number}</span>
                    </div>
                    <h3 className="mt-7 text-xl font-semibold text-secondary dark:text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
                    <div className="mt-auto flex flex-wrap gap-2 pt-6">
                      {item.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-secondary/70 dark:text-white/75">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="mt-5 text-sm font-semibold text-primary">
                      View capability details <ArrowRight className="ml-1 inline h-4 w-4" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#f6f4fb] py-24 dark:bg-[#10172c] md:py-32">
          <div className="container">
            <div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
              <div data-aos="fade-right"><p className="text-sm font-semibold uppercase tracking-[.2em] text-primary">Audience journeys</p><h2 className="mt-4 text-4xl font-bold tracking-tight text-secondary dark:text-white md:text-5xl">Built around the people who use it.</h2><p className="mt-5 text-lg leading-8 text-muted-foreground">A coherent experience for the people participating, the teams operating the initiative and the leaders accountable for progress.</p></div>
              <div className="space-y-4" data-aos="fade-up">{journeys.map((journey) => { const Icon = journey.icon; return <div key={journey.label} className="group grid gap-5 rounded-2xl border border-border bg-background p-6 transition-colors hover:border-primary/30 sm:grid-cols-[auto_1fr]"><div className={`flex h-12 w-12 items-center justify-center rounded-xl ${journey.accent} dark:bg-primary/20 dark:text-[#eadfff]`}><Icon className="h-6 w-6" /></div><div><p className="text-xs font-semibold uppercase tracking-[.15em] text-primary">{journey.label}</p><h3 className="mt-2 text-xl font-semibold text-secondary dark:text-white">{journey.title}</h3><p className="mt-2 leading-7 text-muted-foreground">{journey.description}</p></div></div>; })}</div>
            </div>
          </div>
        </section>

        <section className="bg-[#f6f4fb] py-24 dark:bg-[#10172c] md:py-32">
          <div className="container">
            <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_.9fr]">
              <div data-aos="fade-right"><div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"><BrainCircuit className="h-4 w-4" /> The AI layer</div><h2 className="text-4xl font-bold tracking-tight text-secondary dark:text-white md:text-5xl">AI that supports the journey.</h2><p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">AI is embedded where it adds value rather than treated as the product itself. Capabilities are selected and configured for each deployment.</p><div className="mt-8 grid gap-3 sm:grid-cols-2">{["Personalized learning and guidance", "AI coaches and role-play", "Content and knowledge support", "Role-based practice", "Engagement and progress insights", "Leadership analysis"].map((item) => <div key={item} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm font-medium text-secondary dark:text-white"><Check className="h-4 w-4 shrink-0 text-primary" />{item}</div>)}</div></div>
              <div className="relative" data-aos="fade-left"><div className="absolute inset-5 rounded-full bg-primary/15 blur-3xl" /><div className="relative overflow-hidden rounded-[2rem] border border-border bg-[#f7f3ff] p-5 shadow-xl dark:bg-[#151d38]"><img src={platformHeroImage} alt="Illustrative view of an AI-supported learning and engagement journey" className="w-full rounded-[1.35rem] object-cover" /><div className="absolute bottom-9 left-9 right-9 rounded-xl border border-white/70 bg-background/90 p-4 shadow-lg backdrop-blur"><div className="flex items-center gap-3"><div className="rounded-lg bg-primary p-2 text-white"><MessageSquare className="h-4 w-4" /></div><div><p className="text-xs font-semibold uppercase tracking-wider text-primary">AI-supported journey</p><p className="text-sm font-medium text-secondary dark:text-white">Support where it adds value.</p></div></div></div></div></div>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-[#fcfaf5] py-24 dark:bg-[#10172c] md:py-28">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
              <div data-aos="fade-right"><p className="text-sm font-semibold uppercase tracking-[.2em] text-primary">Measurement and evidence</p><h2 className="mt-4 text-4xl font-bold tracking-tight text-secondary dark:text-white md:text-5xl">Show what changed, and the evidence behind it.</h2><p className="mt-5 text-lg leading-8 text-muted-foreground">Define success before launch, then connect participation and learning with practical milestones, adoption and client-validated outcomes. Leadership gains a clear view of progress and impact reporting without treating reporting as guaranteed causation.</p><div className="mt-7 flex flex-wrap gap-3">{["Participation", "Learning", "Application", "Adoption", "Impact reporting"].map(item => <span key={item} className="rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-secondary dark:text-white">{item}</span>)}</div></div>
              <div className="relative overflow-hidden rounded-2xl border border-border bg-background p-3 shadow-lg" data-aos="fade-up">
                <div className="relative min-h-[440px] overflow-hidden rounded-xl bg-[#f7f3ff] p-5 dark:bg-[#151d38] md:p-7">
                  <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
                  <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-[#f0b85f]/20 blur-3xl" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-primary">Impact journey / illustrative view</p>
                        <h3 className="mt-2 text-xl font-semibold tracking-tight text-secondary dark:text-white">See where momentum builds — and where it needs support.</h3>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary dark:border-white/15 dark:bg-white/10 dark:text-[#eadfff]">
                        <Activity className="h-3.5 w-3.5" /> Journey map
                      </div>
                    </div>

                    <div className="relative mt-8">
                      <svg className="pointer-events-none absolute left-[8%] top-12 hidden h-20 w-[84%] md:block" viewBox="0 0 800 100" fill="none" aria-hidden="true">
                        <path className="journey-path" d="M20 58 C130 8 190 88 300 45 S470 10 570 52 S700 88 780 38" stroke="url(#journey-gradient)" strokeWidth="4" strokeLinecap="round" strokeDasharray="8 14" />
                        <defs>
                          <linearGradient id="journey-gradient" x1="20" y1="50" x2="780" y2="50" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#8844DD" stopOpacity=".3" />
                            <stop offset=".5" stopColor="#8844DD" />
                            <stop offset="1" stopColor="#e9a84e" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="grid gap-3 md:grid-cols-5">
                        {impactJourney.map((step, index) => {
                          const Icon = step.icon;
                          const isDropoff = step.status === "Drop-off";
                          return (
                            <div key={step.stage} className={`relative z-10 rounded-2xl border p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md motion-reduce:transition-none md:pt-4 ${isDropoff ? "border-amber-300 bg-amber-50/90 dark:border-amber-400/40 dark:bg-amber-950/45" : "border-border bg-white/90 dark:bg-[#1a2340]/90"}`}>
                              <div className="flex items-center justify-between gap-2">
                                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${isDropoff ? "bg-amber-200/70 text-amber-700 dark:bg-amber-400/20 dark:text-amber-200" : "bg-primary/10 text-primary"}`}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <span className={`text-[10px] font-semibold uppercase tracking-wider ${isDropoff ? "text-amber-700 dark:text-amber-200" : "text-muted-foreground"}`}>{step.stage}</span>
                              </div>
                              <p className="mt-5 text-2xl font-semibold tracking-tight text-secondary dark:text-white">{step.metric}</p>
                              <p className="mt-1 text-xs font-semibold text-secondary dark:text-white">{step.title}</p>
                              <p className="mt-1 text-[10px] leading-4 text-muted-foreground">{step.detail}</p>
                              <span className={`mt-3 inline-flex rounded-full px-2 py-1 text-[9px] font-semibold uppercase tracking-wider ${isDropoff ? "bg-amber-200/70 text-amber-800 dark:bg-amber-400/20 dark:text-amber-200" : "bg-primary/10 text-primary"}`}>{step.status}</span>
                              {index < impactJourney.length - 1 && <div className="absolute -bottom-3 left-1/2 h-3 w-px bg-primary/25 md:hidden" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-400/30 dark:bg-amber-950/35">
                        <div className="rounded-xl bg-amber-200/70 p-2 text-amber-700 dark:bg-amber-400/20 dark:text-amber-200"><AlertCircle className="h-4 w-4" /></div>
                        <div><p className="text-xs font-semibold text-amber-900 dark:text-amber-100">Drop-off detected</p><p className="mt-1 text-[11px] leading-4 text-amber-800/75 dark:text-amber-100/70">Practise → Adopt is the moment to add reinforcement and coaching.</p></div>
                      </div>
                      <div className="flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4">
                        <div className="rounded-xl bg-primary/10 p-2 text-primary"><Sparkles className="h-4 w-4" /></div>
                        <div><p className="text-xs font-semibold text-secondary dark:text-white">Enhancement opportunity</p><p className="mt-1 text-[11px] leading-4 text-muted-foreground">Use nudges, role-play and peer support before momentum fades.</p></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-secondary py-24 text-white md:py-32">
          <div className="container">
            <div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr]">
              <div data-aos="fade-right"><p className="text-sm font-semibold uppercase tracking-[.2em] text-[#d2b4ff]">Deployment</p><h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">Dedicated to your organisation. Designed to scale.</h2><p className="mt-5 text-lg leading-8 text-white/65">Start from a proven platform foundation, with configuration and any required extensions scoped around your initiative. Language, integration and hosting requirements are agreed for the selected deployment.</p></div>
              <div className="grid gap-3 sm:grid-cols-2" data-aos="fade-up">{deploymentItems.map(([title, description], index) => <div key={title} className="rounded-2xl border border-white/10 bg-white/[.06] p-6"><span className="font-mono text-sm text-[#d2b4ff]">0{index + 1}</span><h3 className="mt-5 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-white/60">{description}</p></div>)}</div>
            </div>
          </div>
        </section>

        <section className="bg-background py-24 md:py-32">
          <div className="container">
            <div className="relative overflow-hidden rounded-[2rem] border border-border bg-[#f6f4fb] p-8 dark:bg-[#10172c] md:p-14">
              <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />
              <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto]">
                <div className="max-w-3xl" data-aos="fade-right">
                  <p className="text-sm font-semibold uppercase tracking-[.2em] text-primary">Personalised Preview</p>
                  <h2 className="mt-4 text-4xl font-bold tracking-tight text-secondary dark:text-white md:text-5xl">
                    See a proposed journey for your initiative before production starts.
                  </h2>
                  <p className="mt-5 text-lg leading-8 text-muted-foreground">
                    For qualified organisations, we prepare an interactive preview around your
                    audience and goals, including a participant experience and programme-owner view.
                    We confirm the brief and delivery time before starting.
                  </p>
                  <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                    <Button onClick={discussYourInitiative} size="lg" className="rounded-full px-8 py-6">
                      Discuss Your Initiative <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <div className="relative mx-auto w-full max-w-sm" data-aos="fade-left">
                  <div className="rounded-[1.5rem] border border-primary/15 bg-background p-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-primary">Demonstration data</p>
                        <p className="mt-2 font-semibold text-secondary dark:text-white">Example initiative</p>
                      </div>
                      <PanelsTopLeft className="h-6 w-6 text-primary" />
                    </div>
                    <div className="mt-5 space-y-3">
                      {["Participant experience", "Programme-owner view", "Evidence and outcomes"].map((item, index) => (
                        <div key={item} className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 p-3 dark:bg-secondary/20">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">0{index + 1}</span>
                          <span className="text-sm font-medium text-secondary dark:text-white">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-background py-24 md:py-32">
          <div className="container">
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-secondary via-[#1c2c70] to-primary p-8 text-white md:p-16" data-aos="fade-up">
              <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/10 blur-3xl" />
              <div className="relative max-w-3xl"><p className="text-sm font-semibold uppercase tracking-[.2em] text-[#d2b4ff]">Ready to discuss your initiative?</p><h2 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">Start with one defined initiative. Expand as needs grow.</h2><p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">Tell us who you need to serve, what they need to achieve and how success should be measured. We’ll help you shape the right first phase and identify where the platform can expand over time.</p><Button onClick={discussYourInitiative} size="lg" className="mt-9 rounded-full bg-white px-8 py-6 text-secondary hover:bg-white/90">Discuss Your Initiative <ArrowRight className="h-5 w-5" /></Button></div>
            </div>
          </div>
        </section>

        <Dialog
          open={selectedCapability !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedCapability(null);
          }}
        >
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            {selectedCapability && (
              <>
                <DialogHeader className="text-left">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <selectedCapability.icon className="h-6 w-6" />
                  </div>
                  <DialogTitle className="text-2xl text-secondary dark:text-white">
                    {selectedCapability.title}
                  </DialogTitle>
                  <DialogDescription className="pt-2 text-base leading-7">
                    {selectedCapability.modalDescription}
                  </DialogDescription>
                </DialogHeader>
                <div className="rounded-2xl border border-border bg-muted/50 p-5 dark:bg-secondary/20">
                  <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">Examples</p>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {selectedCapability.examples.map((example) => (
                      <li key={example} className="flex items-start gap-2 text-sm leading-6 text-secondary dark:text-white">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default Platform;