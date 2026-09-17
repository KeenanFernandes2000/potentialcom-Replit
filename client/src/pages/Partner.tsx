import React from "react";
import {
  Handshake,
  Award,
  BarChart,
  Users,
  Globe,
  HeartHandshake,
  BadgeCheck,
  GraduationCap,
  Check,
  LucideIcon,
  ArrowRight,
  ChevronRight,
  LineChart,
  Network,
  PanelsTopLeft,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BecomePartner from "@/components/sections/BecomePartner";
import { AutoSEO } from "@/components/SEO";
import { navigateWithUTM } from "@/lib/utm-utils";

// Partner benefit component
interface BenefitProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const Benefit = ({ icon: Icon, title, description }: BenefitProps) => (
  <div className="flex flex-col items-center text-center bg-secondary/20 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-secondary-foreground/10 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl">
    <div className="bg-primary/10 p-4 rounded-full mb-4">
      <Icon className="h-10 w-10 text-primary" />
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default function Partner() {
  return (
    <div className="min-h-screen">
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
                  <Handshake className="h-4 w-4" /> PARTNER WITH POTENTIAL
                </div>
                <h1 className="max-w-3xl text-4xl font-bold leading-[1.05] tracking-[-0.04em] text-secondary dark:text-white md:text-6xl lg:text-7xl">
                  Deliver learning and engagement programmes with Potential.
                </h1>
                <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
                   We work with organisations that bring access to a defined government or enterprise programme, specialist expertise or implementation capability. Together, we shape the participant journey, agree responsibilities and help the client measure progress.
                </p>
                <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Button onClick={() => navigateWithUTM("/inquire")} size="lg" className="rounded-full px-8 py-6 text-base shadow-lg shadow-primary/20 gtm-partner-become-partner">
                    Discuss a Partnership <ArrowRight className="h-5 w-5" />
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
                        <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#d2b4ff]">Shared programme · clear responsibilities</p>
                        <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">A connected partnership</h2>
                      </div>
                      <div className="rounded-xl bg-primary p-3 text-white shadow-lg shadow-primary/30">
                        <Network className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
                      <div className="absolute left-[16%] right-[16%] top-8 hidden border-t border-dashed border-[#d2b4ff]/50 sm:block" aria-hidden="true" />
                      {[
                        { title: "Client mandate", icon: Target },
                        { title: "Partner value", icon: Handshake },
                        { title: "Programme evidence", icon: LineChart },
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
                        <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#d2b4ff]">Illustrative programme view</p>
                        <p className="mt-1 text-sm text-white/70">Participant progress and programme evidence.</p>
                      </div>
                      <BarChart className="h-5 w-5 text-[#f0b85f]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partnership Types */}
        <section className="bg-background px-4 py-24 md:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center" data-aos="fade-up">
              <p className="text-sm font-semibold uppercase tracking-[.2em] text-primary">PARTNERSHIP TYPES</p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-secondary dark:text-white md:text-5xl">Bring the role your organisation is best placed to play.</h2>
            </div>
            <div className="mx-auto mt-14 grid max-w-6xl gap-5 md:grid-cols-3">
              {[
                {
                  title: "Delivery Partners",
                  description: "Support implementation, rollout or delivery around a defined client initiative.",
                  icon: PanelsTopLeft,
                },
                {
                  title: "Programme Specialists",
                  description: "Bring specialist subject-matter or programme expertise that strengthens the participant journey.",
                  icon: GraduationCap,
                },
                {
                  title: "Referral & Opportunity Partners",
                  description: "Introduce relevant government or enterprise opportunities where there is a clear buyer, mandate and need.",
                  icon: Handshake,
                },
              ].map((partnerType, index) => {
                const Icon = partnerType.icon;
                return (
                  <div key={partnerType.title} className="group relative rounded-2xl border border-border bg-card p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10" data-aos="fade-up" data-aos-delay={index * 90}>
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/40 to-transparent" />
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-7 text-xl font-semibold text-secondary dark:text-white">{partnerType.title}</h3>
                    <p className="mt-3 leading-7 text-muted-foreground">{partnerType.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How We Work Together */}
        <section className="bg-[#f6f4fb] px-4 py-24 dark:bg-[#10172c] md:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center" data-aos="fade-up">
              <p className="text-sm font-semibold uppercase tracking-[.2em] text-primary">HOW WE WORK TOGETHER</p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-secondary dark:text-white md:text-5xl">Partnerships support named opportunities and clear client outcomes.</h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                Partnerships are built around defined major-client opportunities. We agree the role of each organisation, shape the participant and programme-owner journey together, and align on what the client needs to measure.
              </p>
            </div>
            <div className="mx-auto mt-14 grid max-w-5xl gap-3 sm:grid-cols-2" data-aos="fade-up">
              {[
                { title: "Defined client mandate", icon: Target },
                { title: "Clear partner responsibilities", icon: PanelsTopLeft },
                { title: "Relevant specialist or delivery value", icon: Award },
                { title: "Shared focus on participant progress and programme evidence", icon: LineChart },
              ].map((point, index) => {
                const Icon = point.icon;
                return (
                  <div key={point.title} className="flex items-start gap-4 rounded-2xl border border-border bg-background p-5 shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="pt-2 text-sm font-semibold text-secondary dark:text-white">{point.title}</p>
                    </div>
                    <span className="pt-2 font-mono text-xs text-muted-foreground">0{index + 1}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="bg-background px-4 py-24 md:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-secondary via-[#1c2c70] to-primary p-8 text-white shadow-2xl md:p-16" data-aos="fade-up">
              <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
              <div className="relative max-w-4xl">
                <p className="text-sm font-semibold uppercase tracking-[.2em] text-[#d2b4ff]">WORK WITH POTENTIAL</p>
                <h2 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">Have a relevant mandate, specialist programme capability or implementation opportunity?</h2>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
                  Tell us about the client, opportunity and role you could play. We’ll review whether there is a strong fit.
                </p>
                <Button onClick={() => navigateWithUTM("/inquire")} size="lg" className="mt-9 rounded-full bg-white px-8 py-6 text-secondary hover:bg-white/90">
                  Discuss a Partnership <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Partner Application Form */}
        <BecomePartner />
      </main>
      <Footer />
    </div>
  );
}
