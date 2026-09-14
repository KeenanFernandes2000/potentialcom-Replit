import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Learn from "@/components/sections/Learn";
import Whitepaper from "@/components/sections/Whitepaper";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { AutoSEO } from "@/components/SEO";
import { navigateWithUTM } from "@/lib/utm-utils";
import {
  ArrowRight,
  Award,
  BookOpen,
  ChartNoAxesCombined,
  CircleUserRound,
  Network,
  Route,
  ShieldCheck,
} from "lucide-react";

const Resources = () => {
  // Case Studies section
  const CaseStudies = () => {
    const caseStudies = [
      {
        title: "Tatawwar: Building Tomorrow's Minds",
        description:
          "Transformative educational initiative with HSBC that connected students, teachers, and businesses to address UN Sustainable Development Goals.",
        imageSrc:
          "https://placehold.co/800x400/e6f7ff/0066cc?text=HSBC+Partnership",
        category: "Education",
        partner: "HSBC",
      },
      {
        title: "The Entrepreneurial Nation",
        description:
          "Revolutionary program that equipped SMEs and startups with AI-powered tools to rapidly scale operations and accelerate business growth.",
        imageSrc:
          "https://placehold.co/800x400/f5f5f5/333333?text=Ministry+of+Economy",
        category: "SME Development",
        partner: "Ministry of Economy",
      },
      {
        title: "Maliyat Financial Literacy",
        description:
          "Groundbreaking CSR initiative with Bank Muscat that empowered youth with essential financial skills for economic independence.",
        imageSrc:
          "https://placehold.co/800x400/f9f9f9/c41230?text=Bank+Muscat+Initiative",
        category: "Financial Education",
        partner: "Bank Muscat",
      },
      {
        title: "Cartier Women's Initiative",
        description:
          "Global entrepreneurship competition that identified and accelerated women-led ventures addressing critical global challenges.",
        imageSrc:
          "https://placehold.co/800x400/000000/ffffff?text=Cartier+Women's+Initiative",
        category: "Women Empowerment",
        partner: "Cartier",
      },
    ];

    return (
      <section id="case-studies" className="py-24 relative">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                Relevant programme experience
            </div>
            <h2 className="text-3xl font-bold mb-6">Delivered initiatives and what they can teach us</h2>
            <p className="text-xl text-muted-foreground">
              Explore existing programme examples across learning, empowerment, financial capability and engagement.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {caseStudies.map((study, idx) => (
              <div
                key={idx}
                className="glass-effect rounded-xl overflow-hidden border border-border shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                data-aos="fade-up"
                data-aos-delay={idx * 100}
              >
                <div className="h-48 relative">
                  <img
                    src={study.imageSrc}
                    alt={study.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 rounded-full bg-primary/80 text-white px-3 py-1 text-xs font-medium">
                    {study.category}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold">{study.title}</h3>
                    <div className="text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded-full">
                      with {study.partner}
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    {study.description}
                  </p>
                  <Button
                    variant="link"
                    className="px-0 text-primary"
                    onClick={() =>
                      window.open(
                        "https://ai.potential.com/voice/42531902-20ad-46c7-a611-3e0ccf721aa1",
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                  >
                    Read full case study
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Refresh AOS animations on route change
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).AOS) {
      (window as any).AOS.refresh();
    }
  }, []);

  return (
    <div className="min-h-screen">
      <AutoSEO />
      <Header />
      <main className="pt-32">
        <section className="relative overflow-hidden border-b border-border/60 bg-[#f6f4fb] px-4 pb-20 pt-8 dark:bg-[#10172c] md:pb-28">
          <div className="absolute inset-0 bg-grid-pattern opacity-40" aria-hidden="true" />
          <div className="absolute -right-40 top-0 h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />
          <div className="absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-[#f4c98a]/20 blur-3xl" aria-hidden="true" />
          <div className="container relative">
            <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr] lg:gap-20">
              <div data-aos="fade-right">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/75 px-4 py-2 text-sm font-semibold text-primary">
                  <BookOpen className="h-4 w-4" /> RESOURCES
                </div>
                <h1 className="max-w-4xl text-4xl font-bold leading-[1.05] tracking-[-0.04em] text-secondary dark:text-white md:text-6xl">
                  Practical guidance for designing capability, certification and empowerment programmes.
                </h1>
                <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
                  Explore delivered initiatives, participant journeys and the evidence programme owners need to make decisions.
                </p>
                <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Button onClick={() => navigateWithUTM("/inquire")} size="lg" className="rounded-full px-8 py-6 text-base shadow-lg shadow-primary/20">
                    Discuss Your Initiative <ArrowRight className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigateWithUTM("/platform")}
                    className="rounded-full border-border bg-background/70 px-8 py-6 text-base text-secondary dark:text-white"
                  >
                    Explore the Platform <ArrowRight className="h-4 w-4" />
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
                        <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#d2b4ff]">Programme planning lens</p>
                        <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">From journey to evidence</h2>
                      </div>
                      <div className="rounded-xl bg-primary p-3 text-white shadow-lg shadow-primary/30">
                        <ChartNoAxesCombined className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
                      <div className="absolute left-[16%] right-[16%] top-8 hidden border-t border-dashed border-[#d2b4ff]/50 sm:block" aria-hidden="true" />
                      {[
                        { title: "Participant journey", icon: CircleUserRound },
                        { title: "Programme operations", icon: Network },
                        { title: "Outcome evidence", icon: Award },
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
                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[.05] p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#d2b4ff]">Use resources to shape the brief</p>
                      <p className="mt-1 text-sm text-white/70">Learn from delivered initiatives, then define the evidence your programme needs.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-background px-4 py-20 md:py-24">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center" data-aos="fade-up">
              <p className="text-sm font-semibold uppercase tracking-[.2em] text-primary">EXPLORE BY PROGRAMME NEED</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-secondary dark:text-white md:text-4xl">Start with the question your programme needs to answer.</h2>
            </div>
            <div className="mx-auto mt-12 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Workforce capability", icon: Route },
                { title: "Certification & licensing", icon: ShieldCheck },
                { title: "National & community empowerment", icon: Users },
                { title: "Participant journeys", icon: CircleUserRound },
                { title: "Programme operations", icon: Network },
                { title: "Outcome evidence", icon: ChartNoAxesCombined },
              ].map((theme, index) => {
                const Icon = theme.icon;
                return (
                  <div key={theme.title} className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg" data-aos="fade-up" data-aos-delay={index * 60}>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-secondary dark:text-white">{theme.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        <Whitepaper />
        <Learn />
        <CaseStudies />

        <section className="bg-background px-4 py-24 md:py-32">
          <div className="container">
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-secondary via-[#1c2c70] to-primary p-8 text-white shadow-2xl md:p-16" data-aos="fade-up">
              <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
              <div className="relative max-w-4xl">
                <p className="text-sm font-semibold uppercase tracking-[.2em] text-[#d2b4ff]">PLANNING AN INITIATIVE?</p>
                <h2 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">Turn what you’re exploring into a clear first journey.</h2>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
                  Tell us about your audience, mandate and intended outcome. We’ll help you identify the most useful next step.
                </p>
                <Button onClick={() => navigateWithUTM("/inquire")} size="lg" className="mt-9 rounded-full bg-white px-8 py-6 text-secondary hover:bg-white/90">
                  Discuss Your Initiative <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer
        newsletterTitle="Stay updated."
        newsletterDescription="Get insights on workforce capability, audience engagement and programme outcomes."
      />
    </div>
  );
};

export default Resources;
