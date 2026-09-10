import { useEffect } from "react";
import { SEO } from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { navigateWithUTM } from "@/lib/utm-utils";
import {
  ArrowRight,
  ArrowUpRight,
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
  Orbit,
  PanelsTopLeft,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
} from "lucide-react";
import aylaImage from "@assets/2.png";
import platformInfographic from "@assets/Pitch_Infographic_2_1770795115206.png";

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
  ["01", "Discover", "Define the need, audience and buying path."],
  ["02", "Shape", "Agree the first journey, roles and success measures."],
  ["03", "Preview", "For qualified initiatives, review a personalised interactive preview."],
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
                    Explore the platform <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
                  <div className="rounded-[1.25rem] border border-white/10 bg-[#161f55] p-5 md:p-7">
                    <div className="mb-8 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold text-white"><Orbit className="h-5 w-5 text-[#cda8ff]" /> Potential / command view</div>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">Illustrative view</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2 rounded-2xl bg-white/10 p-5">
                        <div className="flex items-end justify-between"><div><p className="text-xs uppercase tracking-[.18em] text-white/50">Journey overview</p><p className="mt-2 text-4xl font-semibold text-white">In view</p></div><div className="rounded-xl bg-[#d9c1ff]/15 p-3 text-[#d9c1ff]"><LineChart className="h-6 w-6" /></div></div>
                        <div className="mt-5 flex h-20 items-end gap-2">{[32, 42, 38, 57, 51, 69, 82, 76, 94].map((height, index) => <div key={index} className="flex-1 rounded-t-md bg-gradient-to-t from-primary to-[#d6b8ff]" style={{ height: `${height}%`, opacity: 0.45 + index / 20 }} />)}</div>
                      </div>
                    <div className="rounded-2xl bg-white/10 p-4"><UsersRound className="mb-5 h-5 w-5 text-[#f3c57a]" /><p className="text-2xl font-semibold text-white">Cross-role</p><p className="mt-1 text-xs text-white/50">Participant experience</p></div>
                    <div className="rounded-2xl bg-white/10 p-4"><Route className="mb-5 h-5 w-5 text-[#8ee0d1]" /><p className="text-2xl font-semibold text-white">Connected</p><p className="mt-1 text-xs text-white/50">Programme workflows</p></div>
                    </div>
                    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.06] p-4"><div className="h-9 w-9 rounded-full bg-primary/80 p-2 text-white"><MessageSquare className="h-5 w-5" /></div><div><p className="text-xs text-white/50">Ayla insight</p><p className="text-sm text-white/85">Your next best action is ready to review.</p></div><ArrowUpRight className="ml-auto h-4 w-4 text-white/50" /></div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-border bg-background p-4 shadow-xl sm:block"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Built for</p><p className="mt-1 font-semibold text-secondary">The whole journey</p></div>
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

        <section className="bg-background py-24 md:py-32">
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
              <div className="relative overflow-hidden rounded-2xl border border-border bg-background p-3 shadow-lg" data-aos="fade-up"><img src={platformInfographic} alt="Potential platform ecosystem and impact overview" className="w-full rounded-xl" /><div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-secondary/5" /></div>
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
            <div className="relative mx-auto mt-16 grid max-w-6xl gap-5 md:grid-cols-4" data-aos="fade-up">{startSteps.map(([number, title, description], index) => <div key={number} className="relative rounded-2xl border border-border bg-card p-6"><span className="text-sm font-mono text-primary">{number}</span><h3 className="mt-7 text-lg font-semibold text-secondary">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>{index < startSteps.length - 1 && <ArrowRight className="absolute -right-4 top-12 z-10 hidden h-7 w-7 rounded-full border border-border bg-background p-1 text-primary md:block" />}</div>)}</div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#f2edff] py-20 md:py-24">
          <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
          <div className="container relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div><h2 className="max-w-2xl text-3xl font-bold tracking-tight text-secondary md:text-4xl">Have an initiative in mind?</h2><p className="mt-3 max-w-2xl text-muted-foreground">Tell Ayla about the audience, mandate and challenge. She will help identify the most relevant platform approach and connect you with our team where there is a fit.</p></div>
            <Button onClick={talkToAyla} size="lg" className="shrink-0 rounded-full px-8 py-6">Talk to Ayla <ArrowRight className="h-5 w-5" /></Button>
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