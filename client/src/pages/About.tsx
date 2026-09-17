import React from "react";
import {
  Globe,
  Users,
  Award,
  BarChart,
  Lightbulb,
  Clock,
  Zap,
  Building,
  Check,
  ArrowRight,
  ChevronRight,
  LineChart,
  Network,
  PanelsTopLeft,
  Route,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AutoSEO } from "@/components/SEO";
import { navigateWithUTM } from "@/lib/utm-utils";

export default function About() {
  return (
    <>
      <AutoSEO />
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border/60 bg-[#f6f4fb] px-4 pb-20 pt-32 dark:bg-[#10172c] md:pb-28 md:pt-40">
          <div className="absolute inset-0 bg-grid-pattern opacity-40" aria-hidden="true" />
          <div className="absolute -right-40 top-16 h-[30rem] w-[30rem] rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />
          <div className="absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-[#f4c98a]/20 blur-3xl" aria-hidden="true" />

          <div className="container relative">
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
              <div data-aos="fade-right">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/75 px-4 py-2 text-sm font-semibold text-primary">
                  <Globe className="h-4 w-4" /> ABOUT POTENTIAL.COM
                </div>
                <h1 className="max-w-3xl text-4xl font-bold leading-[1.05] tracking-[-0.04em] text-secondary dark:text-white md:text-6xl lg:text-7xl">
                  Experience that shapes the platform we deliver today.
                </h1>
                <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
                   Our experience in empowerment programmes informs the learning and engagement platform we deliver today. Each initiative combines a proven foundation with the programme path, audience journey, roles and measures its owner needs.
                </p>
                <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Button onClick={() => navigateWithUTM("/inquire")} size="lg" className="rounded-full px-8 py-6 text-base shadow-lg shadow-primary/20">
                    Discuss Your Initiative <ArrowRight className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigateWithUTM("/platform")}
                    className="group rounded-full border-border bg-background/70 px-8 py-6 text-base text-secondary dark:text-white"
                  >
                    Explore the Platform <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>

              <div className="relative" data-aos="fade-up" data-aos-delay="150">
                <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary/20 via-transparent to-[#f0b85f]/30 blur-2xl" />
                <div className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-secondary p-5 shadow-2xl dark:border-white/10 md:p-7">
                  <div className="absolute inset-0 bg-grid-pattern opacity-20" aria-hidden="true" />
                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#d2b4ff]">Proven foundation · configured journey</p>
                        <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">Experience into platform</h2>
                      </div>
                      <div className="rounded-xl bg-primary p-3 text-white shadow-lg shadow-primary/30">
                        <Network className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
                      <div className="absolute left-[16%] right-[16%] top-8 hidden border-t border-dashed border-[#d2b4ff]/50 sm:block" aria-hidden="true" />
                      {[
                        { title: "Participant journeys", icon: Route },
                        { title: "Programme operations", icon: PanelsTopLeft },
                        { title: "Leadership evidence", icon: LineChart },
                      ].map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <div key={item.title} className="relative rounded-2xl border border-white/15 bg-white/[.08] p-4 backdrop-blur-sm">
                            <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#d2b4ff]">
                              <Icon className="h-5 w-5" />
                            </div>
                            <p className="mt-5 text-sm font-semibold leading-5 text-white">{item.title}</p>
                            <div className="mt-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-white/45">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#f0b85f] animate-pulse" /> Connected
                            </div>
                            <span className="absolute right-4 top-5 font-mono text-[10px] text-white/30">0{index + 1}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.05] p-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#d2b4ff]">Illustrative platform view</p>
                        <p className="mt-1 text-sm text-white/70">Audience, operations and evidence in one experience.</p>
                      </div>
                      <BarChart className="h-5 w-5 text-[#f0b85f]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission and Foundation */}
        <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-primary to-secondary px-4 py-20 text-white md:py-24">
          <div className="absolute inset-0 bg-grid-pattern opacity-20" aria-hidden="true" />
          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-fuchsia-500/25 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-primary/40 blur-3xl" aria-hidden="true" />

          <div className="container relative z-10">
            <div className="grid gap-5 lg:grid-cols-2">
              <div
                className="rounded-2xl border border-white/20 bg-white/[.14] p-7 shadow-xl backdrop-blur-md md:p-8"
                data-aos="fade-right"
              >
                <div className="border-l-2 border-[#f0b85f] pl-4">
                  <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Our Mission</h2>
                </div>
                <div className="mt-6 space-y-5 text-sm leading-6 text-white/80 md:text-base">
                  <p>
                    Driven by innovation and guided by a powerful mission—
                    <strong className="text-white">
                      {" "}
                      Empowering businesses and their stakeholders to thrive, together
                    </strong>
                    —we&apos;ve continuously anticipated change rather than merely adapting to it.
                  </p>
                  <p>
                    Today, that experience is embedded in an AI-powered Learning &amp; Engagement
                    Platform for governments and enterprises — bringing audience journeys, programme
                    operations and evidence into one dedicated experience.
                  </p>
                  <p className="font-semibold text-white">
                    Empowerment remains our mission. The platform helps organisations turn that
                    mission into structured learning, engagement and measurable outcomes.
                  </p>
                </div>
              </div>

              <div
                className="rounded-2xl border border-white/20 bg-secondary/45 p-7 shadow-xl backdrop-blur-md md:p-8"
                data-aos="fade-left"
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Key Highlights</h2>
                  <span className="shrink-0 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.14em] text-white/70">
                    Our foundation
                  </span>
                </div>
                <ul className="mt-7 space-y-4">
                  {[
                    "20+ years empowering organizations globally",
                    "AI-powered learning and engagement journeys",
                    "Worked with Fortune 500 companies and governments",
                    "Continuously innovating to anticipate change",
                    "Committed to sustainable growth and impact",
                  ].map((highlight) => (
                    <li key={highlight} className="flex items-start gap-3 text-sm leading-6 text-white/80 md:text-base">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* From Experience to Platform */}
        <section className="bg-background px-4 py-24 md:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center" data-aos="fade-up">
              <p className="text-sm font-semibold uppercase tracking-[.2em] text-primary">FROM EXPERIENCE TO PLATFORM</p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-secondary dark:text-white md:text-5xl">
                Built from real programme delivery, not from a blank page.
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">Potential.com has supported learning, empowerment, certification, mentorship, innovation and engagement initiatives across governments, enterprises and large-scale programmes. That experience shapes how we design participant journeys, administration workflows and evidence for decision-makers.</p>
            </div>
            <div className="relative mx-auto mt-14 max-w-6xl">
              <div className="absolute left-[16%] right-[16%] top-16 hidden border-t border-dashed border-primary/30 md:block" aria-hidden="true" />
              <div className="grid gap-5 md:grid-cols-3">
                {[
                  {
                    title: "Participant Journeys",
                    description: "Design clear paths that help people enter, learn, practise, qualify, contribute or progress.",
                    icon: Users,
                  },
                  {
                    title: "Programme Operations",
                    description: "Support approvals, cohorts, interventions, follow-up and the day-to-day work required to keep initiatives moving.",
                    icon: PanelsTopLeft,
                  },
                  {
                    title: "Leadership Evidence",
                    description: "Give decision-makers visibility into participation, progress, qualification and agreed outcome measures.",
                    icon: LineChart,
                  },
                ].map((pillar, index) => {
                  const Icon = pillar.icon;
                  return (
                    <div key={pillar.title} className="group relative rounded-2xl border border-border bg-card p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10" data-aos="fade-up" data-aos-delay={index * 90}>
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/40 to-transparent" />
                      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="mt-7 text-xl font-semibold text-secondary dark:text-white">{pillar.title}</h3>
                      <p className="mt-3 leading-7 text-muted-foreground">{pillar.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* How We Deploy */}
        <section className="bg-secondary px-4 py-24 text-white md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
              <div data-aos="fade-right">
                <p className="text-sm font-semibold uppercase tracking-[.2em] text-[#d2b4ff]">HOW WE DEPLOY</p>
                <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">Start from a proven platform foundation.</h2>
                <p className="mt-5 text-lg leading-8 text-white/65">
                  Start from a proven platform foundation, with configuration and any required extensions scoped around your initiative. Language, integration and hosting requirements are agreed for the selected deployment.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2" data-aos="fade-up">
                {[
                  "Proven platform foundation",
                  "Initiative-specific configuration",
                  "Required extensions scoped where needed",
                  "Language, integration and hosting agreed for the deployment",
                ].map((item, index) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[.06] p-5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/80 text-xs font-bold text-white">0{index + 1}</span>
                    <span className="pt-1 text-sm leading-6 text-white/80">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* AI Empowerment Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">
                 AI Embedded Where It Adds Value
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                 AI supports learning, engagement, guidance, personalization and
                 analysis across the platform journey.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h3 className="text-2xl font-bold mb-6">
                   How AI Supports the Platform
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-3 rounded-full mr-4">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">
                         Personalized Learning
                      </h4>
                      <p className="text-muted-foreground">
                         Tailor guidance, content and next steps to role, context
                         and progress where appropriate.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-primary/10 p-3 rounded-full mr-4">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">
                         Coaching and Guidance
                      </h4>
                      <p className="text-muted-foreground">
                         Give participants contextual support, practice and
                         feedback alongside human-led learning and coaching.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-primary/10 p-3 rounded-full mr-4">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                       <h4 className="font-semibold mb-1">Engagement Insights</h4>
                      <p className="text-muted-foreground">
                         Help programme teams understand participation, progress
                         and where timely intervention may be useful.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-primary/10 p-3 rounded-full mr-4">
                      <Lightbulb className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">
                         Leadership Analysis
                      </h4>
                      <p className="text-muted-foreground">
                         Support interpretation of programme evidence, outcome
                         signals and impact reporting for informed decisions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-muted/50 backdrop-blur-sm rounded-lg p-6 shadow-md border border-border text-center">
                  <div className="text-2xl font-bold text-primary mb-2">Learning</div>
                  <p className="text-muted-foreground">
                    Personalised pathways, content support and role-relevant practice.
                  </p>
                </div>

                <div className="bg-muted/50 backdrop-blur-sm rounded-lg p-6 shadow-md border border-border text-center">
                  <div className="text-2xl font-bold text-primary mb-2">Guidance</div>
                  <p className="text-muted-foreground">
                    AI coaching and knowledge support configured around the initiative.
                  </p>
                </div>

                <div className="bg-muted/50 backdrop-blur-sm rounded-lg p-6 shadow-md border border-border text-center">
                  <div className="text-2xl font-bold text-primary mb-2">Engagement</div>
                  <p className="text-muted-foreground">
                    Timely prompts and insights that help programme teams support participation.
                  </p>
                </div>

                <div className="bg-muted/50 backdrop-blur-sm rounded-lg p-6 shadow-md border border-border text-center">
                  <div className="text-2xl font-bold text-primary mb-2">Evidence</div>
                  <p className="text-muted-foreground">
                    Analysis that helps leadership interpret progress, outcomes and impact reporting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Our Global Impact</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Over two decades, Potential.com has worked alongside Fortune 500
                companies, global governments, and impactful organizations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              <div className="bg-background/60 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-border text-center">
                <div className="text-5xl font-bold text-primary mb-4">20+</div>
                <p className="text-lg font-medium">Years of Experience</p>
              </div>

              <div className="bg-background/60 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-border text-center">
                <div className="text-5xl font-bold text-primary mb-4">
                  Millions
                </div>
                <p className="text-lg font-medium">People Empowered</p>
              </div>

              <div className="bg-background/60 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-border text-center">
                <div className="text-5xl font-bold text-primary mb-4">
                  Global
                </div>
                <p className="text-lg font-medium">Reach & Impact</p>
              </div>

              <div className="bg-background/60 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-border text-center">
                <div className="text-5xl font-bold text-primary mb-4">
                  Fortune 500
                </div>
                <p className="text-lg font-medium">Client Partnerships</p>
              </div>
            </div>

            <div className="relative mt-16 overflow-hidden rounded-[2rem] bg-gradient-to-br from-secondary via-[#1c2c70] to-primary p-8 text-left text-white shadow-2xl md:p-16" data-aos="fade-up">
              <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
              <div className="relative max-w-4xl">
                <p className="text-sm font-semibold uppercase tracking-[.2em] text-[#d2b4ff]">READY TO DISCUSS YOUR INITIATIVE?</p>
                <h2 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">
                  Build on proven experience. Shape the right journey for your audience.
                </h2>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
                  Tell us who you need to serve, what they need to achieve and how you need to measure progress.
                </p>
                <Button
                  size="lg"
                  className="mt-9 rounded-full bg-white px-8 py-6 text-secondary hover:bg-white/90 gtm-about-partner-with-us"
                  onClick={() => navigateWithUTM("/inquire")}
                >
                  Discuss Your Initiative <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
