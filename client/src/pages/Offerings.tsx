import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import UTMLink from "@/components/UTMLink";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Handshake,
  Lightbulb,
  MessageCircle,
  Users,
} from "lucide-react";

const solutionGroups = [
  {
    title: "Workforce Capability",
    intro:
      "Build workforce capability around the roles, standards and operational outcomes that matter to your organisation.",
    programs: [
      "Frontline Readiness",
      "Certification & Licensing",
      "AI & Digital Adoption",
      "Sales & Service Enablement",
      "Leadership & Talent Development",
      "Compliance & Safety Readiness",
    ],
    href: "/solutions/workforce-capability",
    cta: "Explore Workforce Capability",
    icon: BriefcaseBusiness,
  },
  {
    title: "National & Community Empowerment",
    intro:
      "Turn public, social and economic-development mandates into managed programmes with clear participant progress and evidence.",
    programs: [
      "CSR & Community Impact",
      "Entrepreneurship & SME Development",
      "National Talent & Employability",
      "Financial Capability",
    ],
    href: "/solutions/national-community-empowerment",
    cta: "Explore National & Community Empowerment",
    icon: Users,
    priorityLinks: [
      {
        label: "CSR & Community Impact",
        href: "/solutions/csr-community-impact",
      },
      {
        label: "Entrepreneurship & SME Development",
        href: "/solutions/entrepreneurship-sme-development",
      },
    ],
  },
  {
    title: "Customer & Partner Enablement",
    intro:
      "Help customers, partners and suppliers build knowledge, capability and confidence through structured learning and engagement journeys.",
    programs: [
      "Customer Education & Adoption",
      "Partner & Channel Enablement",
      "Supplier Development & Local Content",
    ],
    href: "/solutions/customer-partner-enablement",
    cta: "Explore Customer & Partner Enablement",
    icon: Handshake,
  },
];

const platformCapabilities = [
  { label: "Academy & Courses", icon: BookOpen },
  { label: "Certification & Licensing", icon: GraduationCap },
  { label: "Mentorship & Coaching", icon: Users },
  { label: "Community & Events", icon: MessageCircle },
  { label: "Competitions & Challenges", icon: CheckCircle2 },
  { label: "Innovation & Ideas", icon: Lightbulb },
  { label: "AI", icon: ArrowRight },
];

export default function Offerings() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Solutions | AI-powered Learning & Engagement Platform | Potential"
        description="Design and deliver workforce capability, national and community empowerment, and customer and partner enablement programmes with Potential."
        keywords="workforce capability, community empowerment, customer enablement, partner enablement, learning platform"
      />
      <Header />

      <main className="pt-24">
        <section className="relative overflow-hidden py-20 md:py-28">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="absolute -right-24 top-8 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
          <div className="container relative z-10">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-5 inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Solutions
              </div>
              <h1 className="text-4xl font-bold leading-tight md:text-6xl">
                Programmes built around the outcomes your organisation needs to
                deliver.
              </h1>
              <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl">
                Potential helps governments and enterprises launch dedicated
                learning and engagement programmes around workforce capability,
                national and community empowerment, and customer and partner
                enablement. Start with the initiative, then bring the
                participant journey, programme management and evidence together
                in one platform.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" className="rounded-full px-7">
                  <UTMLink href="/inquire">
                    Discuss Your Initiative
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </UTMLink>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full px-7"
                >
                  <UTMLink href="/platform">Explore the Platform</UTMLink>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-muted/30 py-20 md:py-24">
          <div className="container">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Three ways organisations use Potential
              </p>
              <h2 className="text-3xl font-bold md:text-5xl">
                Start with the programme you need to deliver.
              </h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {solutionGroups.map((group) => {
                const Icon = group.icon;
                return (
                  <article
                    key={group.title}
                    className="flex h-full flex-col rounded-3xl border border-border bg-background p-7 shadow-sm transition-shadow hover:shadow-xl"
                  >
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-2xl font-bold">{group.title}</h3>
                    <p className="mt-4 leading-7 text-muted-foreground">
                      {group.intro}
                    </p>
                    <ul className="mt-6 space-y-3">
                      {group.programs.map((program) => (
                        <li
                          key={program}
                          className="flex items-start gap-3 text-sm"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span>{program}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto pt-8">
                      <Button asChild variant="outline" className="w-full rounded-full">
                        <UTMLink href={group.href}>
                          {group.cta}
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </UTMLink>
                      </Button>
                      {group.priorityLinks && (
                        <div className="mt-5 space-y-2 border-t border-border pt-5">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Priority offers
                          </p>
                          {group.priorityLinks.map((link) => (
                            <UTMLink
                              key={link.href}
                              href={link.href}
                              className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm font-medium text-primary hover:bg-primary/5"
                            >
                              {link.label}
                              <ArrowRight className="h-4 w-4" />
                            </UTMLink>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                From programme to platform
              </p>
              <h2 className="text-3xl font-bold md:text-5xl">
                The programme defines the journey. The platform brings it
                together.
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                Potential combines the capabilities each initiative needs into
                one dedicated participant and programme-management experience.
              </p>
            </div>

            <div className="mx-auto mt-12 max-w-5xl">
              <div className="grid gap-4 md:grid-cols-[1fr_auto_2fr] md:items-center">
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
                  <p className="font-semibold">Programme</p>
                </div>
                <ArrowRight className="mx-auto hidden h-6 w-6 rotate-90 text-primary md:block md:rotate-0" />
                <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
                  <p className="font-semibold">
                    Participant Journey + Programme Management + Leadership
                    Evidence
                  </p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {platformCapabilities.map((capability) => {
                  const Icon = capability.icon;
                  return (
                    <div
                      key={capability.label}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-4 py-2 text-sm"
                    >
                      <Icon className="h-4 w-4 text-primary" />
                      {capability.label}
                    </div>
                  );
                })}
              </div>
              <div className="mt-9 text-center">
                <Button asChild size="lg" className="rounded-full px-7">
                  <UTMLink href="/platform">
                    Explore the Platform
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </UTMLink>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-secondary py-20 text-secondary-foreground md:py-24">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="container relative z-10 text-center">
            <div className="mx-auto max-w-3xl rounded-3xl border border-primary/20 bg-background/10 p-8 shadow-lg backdrop-blur-sm md:p-12">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Start with the right first phase
              </p>
              <h2 className="text-3xl font-bold md:text-5xl">
                What programme does your organisation need to deliver?
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-secondary-foreground/80">
                Tell us about the audience, mandate and outcomes you are
                working toward. We&apos;ll help you shape the right first
                phase.
              </p>
              <Button asChild size="lg" className="mt-8 rounded-full px-8">
                <UTMLink href="/inquire">
                  Discuss Your Initiative
                  <ArrowRight className="ml-2 h-4 w-4" />
                </UTMLink>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}