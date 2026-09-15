import type { CSSProperties } from "react";
import { useState } from "react";
import {
  ArrowRight,
  ChevronRight,
  CircleDot,
  Download,
  Maximize2,
  Orbit,
  Sparkles,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { navigateWithUTM } from "@/lib/utm-utils";
import type { SolutionPageConfig } from "@/data/solutionPages";
import participantJourneyVisualImg from "@assets/ChatGPT_Image_Sep_14,_2026,_01_57_54_PM_1789380291902.png";
import programmeOwnerVisualImg from "@assets/ChatGPT_Image_Sep_14,_2026,_02_00_44_PM_1789380387671.png";
import leadershipViewVisualImg from "@assets/ChatGPT_Image_Sep_14,_2026,_02_05_14_PM_1789380407708.png";
import vxAcademyLogo from "@assets/DCT_logo_1782108989381.png";
import vxAcademyPdf from "@assets/DCT_VX_Academy_Case_Study_1782113750466.pdf";

const platformViewImages = [
  participantJourneyVisualImg,
  programmeOwnerVisualImg,
  leadershipViewVisualImg,
] as const;

function SolutionHeroVisual({ config }: { config: SolutionPageConfig }) {
  return (
    <div className="relative min-h-[430px] overflow-hidden rounded-[2rem] border border-white/70 bg-secondary p-4 shadow-2xl dark:border-white/10 sm:min-h-[500px] sm:p-6">
      <div className="absolute inset-0 bg-grid-pattern opacity-20" aria-hidden="true" />
      <div className="absolute -right-24 -top-20 h-72 w-72 rounded-full bg-primary/40 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[#f0b85f]/20 blur-3xl" aria-hidden="true" />

      <div className="relative flex min-h-[398px] items-center justify-center sm:min-h-[452px]">
        <div className="absolute left-[12%] top-[10%] h-2 w-2 rounded-full bg-[#d2b4ff] animate-pulse" aria-hidden="true" />
        <div className="absolute bottom-[14%] right-[12%] h-2 w-2 rounded-full bg-[#f0b85f] animate-pulse" aria-hidden="true" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/30 bg-primary/10 blur-[1px]" aria-hidden="true" />
        <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d2b4ff]/40" aria-hidden="true" />

        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 560 450" fill="none" aria-hidden="true">
          <path d="M115 105 C185 150 190 165 232 190" stroke="url(#solution-line)" strokeWidth="2" strokeDasharray="5 8" className="solution-path" />
          <path d="M445 105 C375 150 370 165 328 190" stroke="url(#solution-line)" strokeWidth="2" strokeDasharray="5 8" className="solution-path" />
          <path d="M115 345 C185 300 190 285 232 260" stroke="url(#solution-line)" strokeWidth="2" strokeDasharray="5 8" className="solution-path" />
          <path d="M445 345 C375 300 370 285 328 260" stroke="url(#solution-line)" strokeWidth="2" strokeDasharray="5 8" className="solution-path" />
          <defs>
            <linearGradient id="solution-line" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#d2b4ff" stopOpacity=".3" />
              <stop offset=".5" stopColor="#a96bee" />
              <stop offset="1" stopColor="#f0b85f" stopOpacity=".8" />
            </linearGradient>
          </defs>
        </svg>

        <div className="relative z-10 w-44 rounded-2xl border border-white/20 bg-white/[.12] p-4 text-center shadow-xl backdrop-blur-md sm:w-52 sm:p-5">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
            <Orbit className="h-6 w-6" />
          </div>
          <p className="mt-4 text-[10px] font-semibold uppercase tracking-[.18em] text-[#d2b4ff]">
            {config.heroCenterLabel}
          </p>
          <p className="mt-2 text-lg font-semibold text-white">{config.heroCenterTitle}</p>
          <div className="mt-4 flex items-center justify-center gap-1.5">
            <span className="h-1.5 w-10 rounded-full bg-primary" />
            <span className="h-1.5 w-6 rounded-full bg-[#d2b4ff]/60" />
            <span className="h-1.5 w-3 rounded-full bg-white/30" />
          </div>
        </div>

        {config.heroNodes.map((node, index) => {
          const Icon = node.icon;
          const placements = [
            "left-[3%] top-[5%]",
            "right-[3%] top-[5%]",
            "left-[3%] bottom-[5%]",
            "right-[3%] bottom-[5%]",
          ];
          return (
            <div
              key={node.label}
              className={`absolute ${placements[index]} solution-node w-32 rounded-xl border border-white/15 bg-white/[.09] p-3 shadow-lg backdrop-blur-sm sm:w-40 sm:p-4`}
              style={{ "--solution-delay": `${index * 180}ms` } as CSSProperties}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#d2b4ff]">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold leading-4 text-white sm:text-sm">{node.label}</span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-wider text-white/45">
                <CircleDot className="h-3 w-3 text-[#f0b85f]" /> Connected
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectionIntro({
  label,
  title,
  copy,
  dark = false,
}: {
  label: string;
  title: string;
  copy?: string;
  dark?: boolean;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center" data-aos="fade-up">
      <p className={`text-sm font-semibold uppercase tracking-[.2em] ${dark ? "text-[#d2b4ff]" : "text-primary"}`}>
        {label}
      </p>
      <h2 className={`mt-4 text-4xl font-bold tracking-tight md:text-5xl ${dark ? "text-white" : "text-secondary dark:text-white"}`}>
        {title}
      </h2>
      {copy && (
        <p className={`mt-5 text-lg leading-8 ${dark ? "text-white/65" : "text-muted-foreground"}`}>
          {copy}
        </p>
      )}
    </div>
  );
}

function SolutionPage({ config }: { config: SolutionPageConfig }) {
  const discuss = () => navigateWithUTM("/inquire");
  const explorePlatform = () => navigateWithUTM("/platform");
  const [expandedView, setExpandedView] = useState<{
    title: string;
    image: string;
  } | null>(null);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <SEO
        title={config.seoTitle}
        description={config.seoDescription}
        keywords={`${config.label.toLowerCase()}, learning platform, Potential.com`}
        url={`https://potential.com${config.slug}`}
      />
      <Header />
      <main>
        <section className="relative overflow-hidden border-b border-border/60 bg-[#f6f4fb] pt-32 pb-20 dark:bg-[#10172c] md:pt-40 md:pb-28">
          <div className="absolute inset-0 bg-grid-pattern opacity-40" aria-hidden="true" />
          <div className="absolute -right-40 top-20 h-[30rem] w-[30rem] rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
          <div className="absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-[#f4c98a]/20 blur-3xl" aria-hidden="true" />
          <div className="container relative">
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
              <div data-aos="fade-right">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/75 px-4 py-2 text-sm font-semibold text-primary">
                  <Sparkles className="h-4 w-4" /> {config.label}
                </div>
                <h1 className="max-w-3xl text-4xl font-bold leading-[1.05] tracking-[-0.04em] text-secondary dark:text-white md:text-6xl lg:text-7xl">
                  {config.headline}
                </h1>
                <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
                  {config.supportingCopy}
                </p>
                <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Button onClick={discuss} size="lg" className="rounded-full px-8 py-6 text-base shadow-lg shadow-primary/20">
                    {config.primaryCta} <ArrowRight className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={explorePlatform}
                    className="group rounded-full border-border bg-background/70 px-8 py-6 text-base text-secondary dark:text-white"
                  >
                    Explore the Platform <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
              <div className="relative" data-aos="fade-up" data-aos-delay="150">
                <SolutionHeroVisual config={config} />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-background py-24 md:py-32">
          <div className="container">
            <SectionIntro label={config.whyLabel} title={config.whyTitle} copy={config.whyCopy} />
            <div className="relative mx-auto mt-14 max-w-6xl">
              <div className="absolute left-[16%] right-[16%] top-16 hidden border-t border-dashed border-primary/30 lg:block" aria-hidden="true" />
              <div className="grid gap-5 md:grid-cols-3">
                {config.whyCards.map((card, index) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={card.title}
                      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 motion-reduce:transition-none"
                      data-aos="fade-up"
                      data-aos-delay={index * 90}
                    >
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/40 to-transparent" />
                      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="mt-7 text-xl font-semibold text-secondary dark:text-white">{card.title}</h3>
                      <p className="mt-3 leading-7 text-muted-foreground">{card.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-secondary py-24 text-white md:py-28">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr] lg:items-center">
              <div data-aos="fade-right">
                <p className="text-sm font-semibold uppercase tracking-[.2em] text-[#d2b4ff]">{config.leadLabel}</p>
                <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">{config.leadTitle}</h2>
                <p className="mt-5 text-lg leading-8 text-white/65">{config.leadCopy}</p>
              </div>
              <div className="relative" data-aos="fade-up">
                <div className="absolute left-5 right-5 top-9 hidden border-t border-dashed border-[#d2b4ff]/50 md:block" aria-hidden="true" />
                <div className="grid gap-3 md:grid-cols-6">
                  {config.leadStages.map((stage, index) => (
                    <div key={stage} className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.07] p-4 md:block md:min-h-[150px] md:p-5">
                      <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white shadow-lg shadow-primary/30">
                        0{index + 1}
                      </span>
                      <div className="md:mt-7">
                        <p className="text-sm font-semibold leading-5 text-white">{stage}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-wider text-white/40">Report progress</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {config.slug === "/solutions/workforce-capability" && (
          <section id="relevant-experience" className="bg-white py-20 text-secondary md:py-28">
            <div className="container">
              <div className="mx-auto mb-12 max-w-4xl text-center" data-aos="fade-up">
                <p className="text-sm font-semibold uppercase tracking-[.2em] text-primary">
                  RELEVANT EXPERIENCE
                </p>
                <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
                  Workforce Capability in Practice{" "}
                  <span className="text-primary">— Case Study</span>
                </h2>
              </div>

              <div
                className="mx-auto max-w-6xl rounded-[2rem] border border-[#e7e2f0] bg-white p-6 shadow-[0_18px_60px_rgba(41,28,78,0.08)] md:p-10"
                data-aos="fade-up"
              >
                <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
                  <div>
                    <div className="mb-6 flex flex-wrap gap-2">
                      <span className="rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
                        Government
                      </span>
                      <span className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Certification
                      </span>
                    </div>
                    <div className="flex h-32 items-center justify-center rounded-2xl border border-border bg-white px-6">
                      <img
                        src={vxAcademyLogo}
                        alt="Department of Culture and Tourism Abu Dhabi"
                        className="max-h-24 max-w-[210px] object-contain"
                      />
                    </div>
                    <h3 className="mt-7 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
                      Visitor Experience (VX) Academy
                    </h3>
                    <p className="mt-4 text-base leading-7 text-muted-foreground">
                      AI-powered frontliner empowerment and certification academy to elevate visitor
                      experience standards in the Emirate.
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[.18em] text-primary">
                      About the programme
                    </p>
                    <p className="mt-4 text-lg leading-8 text-muted-foreground">
                      The Visitor Experience (VX) Academy is Abu Dhabi’s dedicated AI-powered hub
                      for service excellence training, designed to empower the emirate’s workforce.
                      Established by the Department of Culture and Tourism (DCT Abu Dhabi), the
                      Academy equips frontline staff across every touchpoint with the skills,
                      knowledge, and confidence to consistently deliver world-class visitor
                      experiences.
                    </p>
                  </div>
                </div>

                <div className="mt-10 grid gap-3 border-t border-border pt-8 sm:grid-cols-3">
                  {[
                    { value: "100,000", label: "Target Frontliners" },
                    { value: "88.1%", label: "Completion Rate" },
                    { value: "135,205", label: "Hours Delivered So Far" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-2xl bg-[#f8f5fc] p-5">
                      <p className="text-2xl font-bold tracking-tight text-primary md:text-3xl">{stat.value}</p>
                      <p className="mt-2 text-sm leading-5 text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <a
                  href={vxAcademyPdf}
                  download
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-base font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
                >
                  <Download className="h-5 w-5" />
                  Download Case Study
                </a>
              </div>
            </div>
          </section>
        )}

        <section className="bg-[#f6f4fb] py-24 dark:bg-[#10172c] md:py-32">
          <div className="container">
            <SectionIntro label="ADDITIONAL CONFIGURATIONS" title={config.additionalTitle} />
            <div className={`mx-auto mt-14 grid max-w-6xl gap-5 ${config.additionalCards.length === 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3"}`}>
              {config.additionalCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className="group rounded-2xl border border-border bg-background p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 motion-reduce:transition-none"
                    data-aos="fade-up"
                    data-aos-delay={index * 70}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-6 text-lg font-semibold text-secondary dark:text-white">{card.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{card.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-background py-24 md:py-32">
          <div className="container">
            <SectionIntro
              label="ONE PLATFORM, THREE VIEWS"
              title="One sample initiative, seen from every side."
              copy="Connect the participant experience, programme operations and leadership evidence in one dedicated platform."
            />
            <div className="mx-auto mt-14 grid max-w-7xl gap-5 lg:grid-cols-3">
              {config.views.map((view, index) => {
                const Icon = view.icon;
                const image = platformViewImages[index];
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
                          Demonstration data · Sample initiative
                        </p>
                        <h3 className="mt-3 text-2xl font-semibold text-secondary dark:text-white">{view.title}</h3>
                      </div>
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">{view.description}</p>
                    <div className="relative mt-7 overflow-hidden rounded-2xl border border-border bg-muted/50 dark:bg-secondary/20">
                      <img
                        src={image}
                        alt={`${view.title} platform preview`}
                        className="aspect-video w-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-x-0 bottom-0 flex justify-end bg-gradient-to-t from-black/70 via-black/20 to-transparent px-4 pb-4 pt-12">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="gap-2 bg-white/90 text-secondary shadow-lg hover:bg-white"
                          onClick={() => setExpandedView({ title: view.title, image })}
                        >
                          <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Expand view
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Dialog
              open={Boolean(expandedView)}
              onOpenChange={(open) => {
                if (!open) setExpandedView(null);
              }}
            >
              <DialogContent className="max-w-5xl overflow-hidden p-3 sm:p-4">
                {expandedView && (
                  <>
                    <DialogTitle>{expandedView.title}</DialogTitle>
                    <DialogDescription className="sr-only">
                      Enlarged platform preview for {expandedView.title}.
                    </DialogDescription>
                    <img
                      src={expandedView.image}
                      alt={`${expandedView.title} platform preview`}
                      className="max-h-[78vh] w-full rounded-md object-contain"
                    />
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </section>

        <section className="bg-background py-24 md:py-32">
          <div className="container">
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-secondary via-[#1c2c70] to-primary p-8 text-white md:p-16" data-aos="fade-up">
              <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
              <div className="relative max-w-4xl">
                <p className="text-sm font-semibold uppercase tracking-[.2em] text-[#d2b4ff]">{config.finalLabel}</p>
                <h2 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">{config.finalHeadline}</h2>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">{config.finalCopy}</p>
                <Button onClick={discuss} size="lg" className="mt-9 rounded-full bg-white px-8 py-6 text-secondary hover:bg-white/90">
                  {config.primaryCta} <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default SolutionPage;