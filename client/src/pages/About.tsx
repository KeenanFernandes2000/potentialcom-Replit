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
        <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-secondary via-primary to-secondary px-4 pb-16 pt-28 md:pb-20 md:pt-32">
          <div className="absolute inset-0 bg-grid-pattern opacity-20" aria-hidden="true" />
          <div className="absolute -left-16 -top-16 h-80 w-80 rounded-full bg-primary/40 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-fuchsia-500/25 blur-3xl" aria-hidden="true" />
          <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />

          <div className="container relative z-10">
            <div className="mx-auto max-w-4xl text-center">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                About Potential.com
              </span>
              <h1 className="mb-5 text-4xl font-extrabold leading-[1.05] text-white md:text-6xl">
                Building capability that helps organisations{" "}
                <span className="bg-gradient-to-r from-amber-300 via-pink-200 to-white bg-clip-text text-transparent">
                  move forward.
                </span>
              </h1>
              <p className="mx-auto max-w-3xl text-base leading-7 text-white/85 md:text-lg">
                For over 20 years, we have helped governments, enterprises and
                communities build capability, engage people and create measurable progress.
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 items-stretch gap-4 md:grid-cols-2 md:gap-5">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-md md:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="h-10 w-1 rounded-full bg-amber-300" />
                  <h2 className="text-2xl font-bold text-white md:text-3xl">Our Mission</h2>
                </div>
                <p className="mb-5 text-base leading-7 text-white/80 md:text-lg">
                  Driven by innovation and guided by a powerful mission—
                  <span className="font-semibold text-white">
                    Empowering businesses and their stakeholders to thrive,
                    together
                  </span>
                  —we've continuously anticipated change rather than merely
                  adapting to it.
                </p>
                <p className="mb-5 text-base leading-7 text-white/80 md:text-lg">
                  Today, that experience is embedded in an AI-powered Learning &amp;
                  Engagement Platform for governments and enterprises — bringing
                  audience journeys, programme operations and evidence into one dedicated experience.
                </p>
                <p className="text-base font-medium leading-7 text-white md:text-lg">
                  Empowerment remains our mission. The platform helps organisations
                  turn that mission into structured learning, engagement and measurable outcomes.
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-secondary/35 p-6 shadow-2xl backdrop-blur-md md:p-8">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <h3 className="text-2xl font-bold text-white md:text-3xl">Key Highlights</h3>
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/70">
                    Our foundation
                  </span>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-white/85">
                    <Check className="mt-1 h-5 w-5 shrink-0 text-emerald-300" />
                    <span>20+ years empowering organizations globally</span>
                  </li>
                  <li className="flex items-start gap-3 text-white/85">
                    <Check className="mt-1 h-5 w-5 shrink-0 text-emerald-300" />
                    <span>AI-powered learning and engagement journeys</span>
                  </li>
                  <li className="flex items-start gap-3 text-white/85">
                    <Check className="mt-1 h-5 w-5 shrink-0 text-emerald-300" />
                    <span>Worked with Fortune 500 companies and governments</span>
                  </li>
                  <li className="flex items-start gap-3 text-white/85">
                    <Check className="mt-1 h-5 w-5 shrink-0 text-emerald-300" />
                    <span>Continuously innovating to anticipate change</span>
                  </li>
                  <li className="flex items-start gap-3 text-white/85">
                    <Check className="mt-1 h-5 w-5 shrink-0 text-emerald-300" />
                    <span>Committed to sustainable growth and impact</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Our Approach Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">
                Our Approach to Empowerment
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Lessons from 20 years of empowering organizations around the
                world
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-background/60 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-border h-full">
                <div className="p-3 bg-primary/10 rounded-full w-fit mb-6">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Practical Solutions</h3>
                <p className="text-muted-foreground">
                   Effective empowerment starts with clear audience needs,
                   practical journeys and evidence that programme owners can use.
                </p>
              </div>

              <div className="bg-background/60 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-border h-full">
                <div className="p-3 bg-primary/10 rounded-full w-fit mb-6">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">
                  Technology as an Enabler
                </h3>
                <p className="text-muted-foreground">
                  Real success comes from carefully applying technology in a
                  targeted, user-centric manner—not by simply chasing new
                  trends. We leverage technology to enable human potential, not
                  replace it.
                </p>
              </div>

              <div className="bg-background/60 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-border h-full">
                <div className="p-3 bg-primary/10 rounded-full w-fit mb-6">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Incremental Progress</h3>
                <p className="text-muted-foreground">
                  Sustained empowerment needs incremental wins. Continuous,
                  incremental success builds confidence, capability, and
                  momentum, which fuels deeper and more transformative change.
                </p>
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

            <div className="text-center">
              <h3 className="text-2xl font-bold mb-3">
                What mandate is your organisation working on?
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                Tell Ayla about your audience and initiative. She will help identify
                the most relevant path and connect you with our team where there is a fit.
              </p>
              <Button
                size="lg"
                className="rounded-full px-8 gtm-about-partner-with-us"
                 onClick={() => navigateWithUTM("/inquire")}
              >
                 Discuss Your Initiative
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
