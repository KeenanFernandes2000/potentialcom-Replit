import { useEffect } from "react";
import { SEO } from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
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
import aylaImage from "@assets/2.png";
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
      "Structured learning, microlearning, pathways, assessments and certificates in one guided experience.",
    tags: ["Courses", "Pathways", "Assessments"],
  },
  {
    number: "02",
    icon: ShieldCheck,
    title: "Certification & Licensing",
    description:
      "Manage eligibility, assessment, qualification, certificates or licences, and renewal journeys.",
    tags: ["Eligibility", "Credentials", "Renewal"],
  },
  {
    number: "03",
    icon: Target,
    title: "Competitions & Challenges",
    description:
      "Run applications, submissions, judging, progression and recognition through a connected workflow.",
    tags: ["Applications", "Judging", "Recognition"],
  },
  {
    number: "04",
    icon: Handshake,
    title: "Mentorship & Coaching",
    description:
      "Combine mentor journeys, AI coaches and human coaching with clear goals and progress tracking.",
    tags: ["Mentors", "AI coaching", "Progress"],
  },
  {
    number: "05",
    icon: Network,
    title: "Community & Events",
    description:
      "Support engagement, resources, events, webinars and stakeholder communication in one place.",
    tags: ["Community", "Webinars", "Communication"],
  },
  {
    number: "06",
    icon: Layers3,
    title: "Innovation & Ideas",
    description:
      "Capture ideas, evaluate contributions, collaborate, manage progression and track implementation.",
    tags: ["Ideas", "Evaluation", "Implementation"],
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
  ["Your brand and audience experience", "A dedicated environment shaped around your organisation and the people it serves."],
  ["Arabic and English support", "Create relevant experiences for audiences across languages."],
  ["Configurable roles and workflows", "Align permissions, journeys and administration with the way your teams operate."],
  ["Integration and deployment options", "Assess the systems and deployment approach required for each initiative."],
  ["Phased launch and expansion", "Start with the priority journey, learn from use and expand thoughtfully."],
  ["Enterprise administration and reporting", "Give programme teams the controls and evidence needed to operate at scale."],
];

const startSteps = [
  ["01", "Discover", "Define the need, audience and path."],
  ["02", "Blueprint", "Agree the first journey, roles and success measures."],
  ["03", "Mockup", "Preview a personalised interactive mockup platform."],
  ["04", "Launch & Prove", "Deploy the agreed first phase, measure, improve and expand."],
];

const Platform = () => {
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).AOS) {
      (window as any).AOS.refresh();
    }
  }, []);

  const talkToAyla = () => navigateWithUTM("/ayla");

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <SEO
        title="The Potential Platform | Learning & Engagement at Scale"
        description="A dedicated AI-powered learning and engagement platform for governments, banks and major enterprises."
        keywords="AI learning platform, enterprise engagement platform, government capability development, Potential.com platform"
      />
      <Header />
      <main>
        <section className="relative overflow-hidden border-b border-border/60 bg-[#f6f4fb] pt-32 pb-20 md:pt-40 md:pb-28">
          <div className="absolute inset-0 bg-grid-pattern opacity-40" />
          <div className="absolute -right-40 top-20 h-[30rem] w-[30rem] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-[#f4c98a]/20 blur-3xl" />
          <div className="container relative">
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
              <div data-aos="fade-right">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/75 px-4 py-2 text-sm font-semibold text-primary">
                  <Sparkles className="h-4 w-4" /> AI-powered Learning &amp; Engagement Platform
                </div>
                <h1 className="max-w-4xl text-4xl font-bold leading-[1.05] tracking-[-0.04em] text-secondary md:text-6xl lg:text-7xl">
                  One platform. Many ways to build capability{" "}
                  <span className="text-primary">and engage people.</span>
                </h1>
                <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
                  Potential helps governments and enterprises design dedicated digital experiences
                  for learning, certification, mentorship, communities, innovation and other
                  strategic initiatives — with AI support and evidence built into the journey.
                </p>
                <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Button onClick={talkToAyla} size="lg" className="rounded-full px-8 py-6 text-base shadow-lg shadow-primary/20">
                    Talk to Ayla <ArrowRight className="h-5 w-5" />
                  </Button>
                  <a href="#capabilities" className="group inline-flex items-center justify-center gap-2 px-3 py-3 font-semibold text-secondary transition-colors hover:text-primary">
                    Explore Capabilities <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
                <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
                  Tell Ayla what you are trying to achieve and she will help identify the most relevant path.
                </p>
                <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-secondary/10 pt-5 text-sm font-medium text-secondary/70">
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

        <section id="capabilities" className="bg-background py-24 md:py-32">
          <div className="container">
            <div className="max-w-3xl" data-aos="fade-up"><p className="text-sm font-semibold uppercase tracking-[.2em] text-primary">Core capabilities</p><h2 className="mt-4 text-4xl font-bold tracking-tight text-secondary md:text-5xl">Six capabilities. One connected experience.</h2><p className="mt-5 text-lg leading-8 text-muted-foreground">Use one capability or combine several into a dedicated platform for your initiative.</p></div>
            <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {capabilities.map((item, index) => { const Icon = item.icon; return <article key={item.number} className="group flex min-h-[275px] flex-col rounded-2xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10" data-aos="fade-up" data-aos-delay={index * 60}><div className="flex items-start justify-between"><div className="rounded-xl bg-primary/10 p-3 text-primary"><Icon className="h-6 w-6" /></div><span className="font-mono text-sm text-muted-foreground">{item.number}</span></div><h3 className="mt-7 text-xl font-semibold text-secondary">{item.title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p><div className="mt-auto flex flex-wrap gap-2 pt-6">{item.tags.map(tag => <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-secondary/70">{tag}</span>)}</div></article>; })}
            </div>
          </div>
        </section>

        <section className="bg-[#f6f4fb] py-24 md:py-32">
          <div className="container">
            <div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
              <div data-aos="fade-right"><p className="text-sm font-semibold uppercase tracking-[.2em] text-primary">Audience journeys</p><h2 className="mt-4 text-4xl font-bold tracking-tight text-secondary md:text-5xl">Built around the people who use it.</h2><p className="mt-5 text-lg leading-8 text-muted-foreground">A coherent experience for the people participating, the teams operating the initiative and the leaders accountable for progress.</p></div>
              <div className="space-y-4" data-aos="fade-up">{journeys.map((journey) => { const Icon = journey.icon; return <div key={journey.label} className="group grid gap-5 rounded-2xl border border-border bg-background p-6 transition-colors hover:border-primary/30 sm:grid-cols-[auto_1fr]"><div className={`flex h-12 w-12 items-center justify-center rounded-xl ${journey.accent}`}><Icon className="h-6 w-6" /></div><div><p className="text-xs font-semibold uppercase tracking-[.15em] text-primary">{journey.label}</p><h3 className="mt-2 text-xl font-semibold text-secondary">{journey.title}</h3><p className="mt-2 leading-7 text-muted-foreground">{journey.description}</p></div></div>; })}</div>
            </div>
          </div>
        </section>

        <section className="bg-[#f6f4fb] py-24 md:py-32">
          <div className="container">
            <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_.9fr]">
              <div data-aos="fade-right"><div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"><BrainCircuit className="h-4 w-4" /> The AI layer</div><h2 className="text-4xl font-bold tracking-tight text-secondary md:text-5xl">AI that supports the journey.</h2><p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">AI is embedded where it adds value rather than treated as the product itself. Capabilities are selected and configured for each deployment.</p><div className="mt-8 grid gap-3 sm:grid-cols-2">{["Personalized learning and guidance", "AI coaches and role-play", "Content and knowledge support", "Role-based practice", "Engagement and progress insights", "Leadership analysis"].map((item) => <div key={item} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm font-medium text-secondary"><Check className="h-4 w-4 shrink-0 text-primary" />{item}</div>)}</div></div>
              <div className="relative" data-aos="fade-left"><div className="absolute inset-5 rounded-full bg-primary/15 blur-3xl" /><div className="relative overflow-hidden rounded-[2rem] border border-border bg-[#f7f3ff] p-5 shadow-xl"><img src={aylaImage} alt="Ayla, Potential's AI empowerment advisor" className="w-full rounded-[1.35rem] object-cover" /><div className="absolute bottom-9 left-9 right-9 rounded-xl border border-white/70 bg-background/90 p-4 shadow-lg backdrop-blur"><div className="flex items-center gap-3"><div className="rounded-lg bg-primary p-2 text-white"><MessageSquare className="h-4 w-4" /></div><div><p className="text-xs font-semibold uppercase tracking-wider text-primary">Ayla</p><p className="text-sm font-medium text-secondary">Your challenge is a good place to start.</p></div></div></div></div></div>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-[#fcfaf5] py-24 md:py-28">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
              <div data-aos="fade-right"><p className="text-sm font-semibold uppercase tracking-[.2em] text-primary">Measurement and evidence</p><h2 className="mt-4 text-4xl font-bold tracking-tight text-secondary md:text-5xl">Show what changed, and the evidence behind it.</h2><p className="mt-5 text-lg leading-8 text-muted-foreground">Define success before launch, then connect participation and learning with practical milestones, adoption and client-validated outcomes. Leadership gains a clear view of progress and impact reporting without treating reporting as guaranteed causation.</p><div className="mt-7 flex flex-wrap gap-3">{["Participation", "Learning", "Application", "Adoption", "Impact reporting"].map(item => <span key={item} className="rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-secondary">{item}</span>)}</div></div>
              <div className="relative overflow-hidden rounded-2xl border border-border bg-background p-3 shadow-lg" data-aos="fade-up">
                <div className="relative min-h-[440px] overflow-hidden rounded-xl bg-[#f7f3ff] p-5 md:p-7">
                  <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
                  <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-[#f0b85f]/20 blur-3xl" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-primary">Impact journey / illustrative view</p>
                        <h3 className="mt-2 text-xl font-semibold tracking-tight text-secondary">See where momentum builds — and where it needs support.</h3>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
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
                            <div key={step.stage} className={`relative z-10 rounded-2xl border p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md motion-reduce:transition-none md:pt-4 ${isDropoff ? "border-amber-300 bg-amber-50/90" : "border-border bg-white/90"}`}>
                              <div className="flex items-center justify-between gap-2">
                                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${isDropoff ? "bg-amber-200/70 text-amber-700" : "bg-primary/10 text-primary"}`}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <span className={`text-[10px] font-semibold uppercase tracking-wider ${isDropoff ? "text-amber-700" : "text-muted-foreground"}`}>{step.stage}</span>
                              </div>
                              <p className="mt-5 text-2xl font-semibold tracking-tight text-secondary">{step.metric}</p>
                              <p className="mt-1 text-xs font-semibold text-secondary">{step.title}</p>
                              <p className="mt-1 text-[10px] leading-4 text-muted-foreground">{step.detail}</p>
                              <span className={`mt-3 inline-flex rounded-full px-2 py-1 text-[9px] font-semibold uppercase tracking-wider ${isDropoff ? "bg-amber-200/70 text-amber-800" : "bg-primary/10 text-primary"}`}>{step.status}</span>
                              {index < impactJourney.length - 1 && <div className="absolute -bottom-3 left-1/2 h-3 w-px bg-primary/25 md:hidden" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
                        <div className="rounded-xl bg-amber-200/70 p-2 text-amber-700"><AlertCircle className="h-4 w-4" /></div>
                        <div><p className="text-xs font-semibold text-amber-900">Drop-off detected</p><p className="mt-1 text-[11px] leading-4 text-amber-800/75">Practise → Adopt is the moment to add reinforcement and coaching.</p></div>
                      </div>
                      <div className="flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4">
                        <div className="rounded-xl bg-primary/10 p-2 text-primary"><Sparkles className="h-4 w-4" /></div>
                        <div><p className="text-xs font-semibold text-secondary">Enhancement opportunity</p><p className="mt-1 text-[11px] leading-4 text-muted-foreground">Use nudges, role-play and peer support before momentum fades.</p></div>
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
              <div data-aos="fade-right"><p className="text-sm font-semibold uppercase tracking-[.2em] text-[#d2b4ff]">Deployment</p><h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">Dedicated to your organisation. Designed to scale.</h2><p className="mt-5 text-lg leading-8 text-white/65">The platform is shaped around your teams, audiences, governance and technology landscape. Integration and deployment options are subject to assessment.</p></div>
              <div className="grid gap-3 sm:grid-cols-2" data-aos="fade-up">{deploymentItems.map(([title, description], index) => <div key={title} className="rounded-2xl border border-white/10 bg-white/[.06] p-6"><span className="font-mono text-sm text-[#d2b4ff]">0{index + 1}</span><h3 className="mt-5 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-white/60">{description}</p></div>)}</div>
            </div>
          </div>
        </section>

        <section className="bg-background py-24 md:py-32">
          <div className="container">
             <div className="mx-auto max-w-3xl text-center" data-aos="fade-up"><p className="text-sm font-semibold uppercase tracking-[.2em] text-primary">How to start</p><h2 className="mt-4 text-4xl font-bold tracking-tight text-secondary md:text-5xl">Start with the need, then shape the first release.</h2><p className="mt-5 text-lg leading-8 text-muted-foreground">A strong platform journey starts with clarity. Personalised interactive previews are prepared for qualified organisations and initiatives.</p></div>
             <div className="relative mx-auto mt-16 max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-secondary via-[#18245a] to-primary p-6 shadow-2xl md:p-10" data-aos="fade-up">
               <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
               <div className="absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-primary/30 blur-3xl" aria-hidden="true" />
               <div className="relative grid gap-4 md:grid-cols-4 md:gap-5">
                 {startSteps.map(([number, title, description], index) => (
                   <div key={number} className="relative rounded-2xl border border-white/15 bg-white/[.08] p-5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white/[.12] motion-reduce:transition-none md:p-6">
                     <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-xl font-bold text-white shadow-lg shadow-black/20">
                       {number}
                     </div>
                     <h3 className="mt-6 text-lg font-semibold text-white">{title}</h3>
                     <p className="mt-2 text-sm leading-6 text-white/65">{description}</p>
                     {index < startSteps.length - 1 && <ArrowRight className="absolute -right-4 top-12 z-10 hidden h-8 w-8 rounded-full border border-white/20 bg-[#253475] p-1.5 text-[#d2b4ff] md:block" aria-hidden="true" />}
                   </div>
                 ))}
               </div>
             </div>
          </div>
        </section>

        <section className="bg-background py-24 md:py-32">
          <div className="container">
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-secondary via-[#1c2c70] to-primary p-8 text-white md:p-16" data-aos="fade-up">
              <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/10 blur-3xl" />
              <div className="relative max-w-3xl"><p className="text-sm font-semibold uppercase tracking-[.2em] text-[#d2b4ff]">The next conversation</p><h2 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">What does your organisation need people to do next?</h2><p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">Bring us the mandate, the audience and the challenge. Start with Ayla and explore the most relevant path for your organisation.</p><Button onClick={talkToAyla} size="lg" className="mt-9 rounded-full bg-white px-8 py-6 text-secondary hover:bg-white/90">Talk to Ayla <ArrowRight className="h-5 w-5" /></Button></div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Platform;