import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { navigateWithUTM } from "@/lib/utm-utils";
import useCasesHeroImage from "@assets/ChatGPT_Image_Sep_10,_2026,_04_09_31_PM_1789042210041.png";
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
  Award,
  Banknote,
  BookOpen,
  Building2,
  ChevronRight,
  ClipboardCheck,
  GraduationCap,
  Handshake,
  HeartPulse,
  Lightbulb,
  Network,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
} from "lucide-react";

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

const useCases = [
  {
    number: "01",
    title: "AI Skills & Enablement",
    description:
      "Assess readiness, build role-relevant capability, practise on real tasks and support workplace application, with evidence of adoption and outcomes for leadership.",
    icon: Sparkles,
    tint: "bg-[#e9e2ff] text-[#6941b5]",
    signal: "AI capability",
  },
  {
    number: "02",
    title: "Certification & Licensing",
    description:
      "Manage learning, eligibility, assessment, certification and renewal journeys in one dedicated experience.",
    icon: Award,
    tint: "bg-[#dff4ef] text-[#087b70]",
    signal: "Credentials",
  },
  {
    number: "03",
    title: "Innovation Management",
    description:
      "Capture ideas, guide evaluation, support progression and provide visibility from submission through implementation and validated benefit.",
    icon: Lightbulb,
    tint: "bg-[#fff0d8] text-[#a36018]",
    signal: "Innovation",
  },
  {
    number: "04",
    title: "Workforce Capability",
    description:
      "Build role-based learning and development journeys with assessment, practice, coaching and evidence of readiness.",
    icon: UsersRound,
    tint: "bg-[#e5edff] text-[#315aa8]",
    signal: "Workforce",
  },
  {
    number: "05",
    title: "Partner & Channel Academy",
    description:
      "Onboard, train, certify and continuously engage partners, distributors or external networks.",
    icon: Building2,
    tint: "bg-[#fce4ed] text-[#a13b68]",
    signal: "Partner enablement",
  },
  {
    number: "06",
    title: "Financial Wellbeing",
    description:
      "Deliver structured financial education programmes with learning, engagement, applied activities and reporting.",
    icon: Banknote,
    tint: "bg-[#e9f2df] text-[#4f7a2c]",
    signal: "Financial capability",
  },
  {
    number: "07",
    title: "Women Empowerment",
    description:
      "Combine learning, mentorship, coaching, events and milestone tracking around women-focused development programmes.",
    icon: HeartPulse,
    tint: "bg-[#f8e3de] text-[#a44f3d]",
    signal: "Development",
  },
  {
    number: "08",
    title: "Youth & National Talent",
    description:
      "Deliver learning, challenges, assessments, selection journeys, recognition and progression for youth or national talent programmes.",
    icon: GraduationCap,
    tint: "bg-[#fff3c9] text-[#8a6a00]",
    signal: "Talent",
  },
  {
    number: "09",
    title: "Mentorship & Coaching",
    description:
      "Manage mentor and mentee journeys, onboarding, matching, goals, sessions, progress and feedback, with AI coaching where relevant.",
    icon: Handshake,
    tint: "bg-[#dff2e8] text-[#26734f]",
    signal: "Guidance",
  },
  {
    number: "10",
    title: "Awards & Challenges",
    description:
      "Manage applications, submissions, judging, evaluation, progression, recognition and participant communications.",
    icon: Target,
    tint: "bg-[#e8e9fb] text-[#4e55a0]",
    signal: "Recognition",
  },
  {
    number: "11",
    title: "Stakeholder & Community Engagement",
    description:
      "Create dedicated engagement hubs for communities, stakeholders or programme audiences with content, events, discussion and participation tracking.",
    icon: Network,
    tint: "bg-[#f7e7d7] text-[#9a5a2a]",
    signal: "Community",
  },
  {
    number: "12",
    title: "Customer Education",
    description:
      "Help customers use products and services effectively through structured learning, guidance, certification and engagement.",
    icon: BookOpen,
    tint: "bg-[#e0eef5] text-[#2d6d88]",
    signal: "Customer success",
  },
  {
    number: "13",
    title: "Employability",
    description:
      "Combine learning, coaching, mentorship, events, applications and employability milestones in one participant journey.",
    icon: Rocket,
    tint: "bg-[#f1e4f9] text-[#82469a]",
    signal: "Employability",
  },
];

const capabilities = [
  ["Academy & Courses", "Structured learning, pathways, assessments and certificates.", BookOpen],
  ["Certification & Licensing", "Eligibility, credentials, compliance and renewal journeys.", ShieldCheck],
  ["Competitions & Challenges", "Applications, submissions, judging and recognition.", ClipboardCheck],
  ["Mentorship & Coaching", "Human mentors, AI coaches, goals and progress.", Handshake],
  ["Community & Events", "Resources, events, webinars and stakeholder communication.", Network],
  ["Innovation & Ideas", "Capture, evaluate, collaborate and track implementation.", Lightbulb],
] as const;

const UseCases = () => {
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).AOS) {
      (window as any).AOS.refresh();
    }
  }, []);

  const talkToAyla = () => navigateWithUTM("/ayla");

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <SEO
        title="Use Cases | Potential Learning & Engagement Platform"
        description="Explore the initiatives governments, banks and major enterprises can deliver with Potential's AI-powered learning and engagement platform."
        keywords="government capability development, enterprise learning platform, financial literacy, workforce upskilling, Potential use cases"
      />
      <Header />
      <main>
        <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-secondary via-primary to-secondary pb-16 pt-28 md:pb-20 md:pt-32">
          <div className="absolute inset-0 bg-grid-pattern opacity-20" aria-hidden="true" />
          <div className="absolute -left-16 -top-16 h-80 w-80 rounded-full bg-primary/40 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-fuchsia-500/25 blur-3xl" aria-hidden="true" />
          <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
          <div className="container relative z-10">
            <div className="grid items-center gap-14 lg:grid-cols-[1fr_.82fr] lg:gap-20">
              <div data-aos="fade-right">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Use Cases
                </div>
                <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-[-0.045em] text-white md:text-6xl lg:text-7xl">
                  Built around the outcomes your organisation{" "}
                  <span className="bg-gradient-to-r from-amber-300 via-pink-200 to-white bg-clip-text text-transparent">
                    needs to deliver.
                  </span>
                </h1>
                <p className="mt-7 max-w-2xl text-lg leading-8 text-white/85 md:text-xl">
                  Potential helps governments and enterprises create dedicated learning and
                  engagement platforms around specific mandates — from AI capability and
                  certification to innovation, mentorship, workforce development and community programmes.
                </p>
                <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Button onClick={talkToAyla} size="lg" className="rounded-full bg-white px-8 py-6 text-base font-semibold text-secondary shadow-lg shadow-black/10 hover:bg-white/90">
                    Talk to Ayla <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </Button>
                  <a href="#library" className="group inline-flex items-center justify-center gap-2 px-3 py-3 font-semibold text-white transition-colors hover:text-white/75">
                    Explore the use cases <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </a>
                </div>
                <p className="mt-4 max-w-xl text-sm leading-6 text-white/60">
                  Tell Ayla what you are trying to achieve. She will help identify the most relevant path.
                </p>
              </div>
              <div className="relative" data-aos="fade-up" data-aos-delay="140">
                <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-primary/40 via-transparent to-[#e6b86e]/30 blur-2xl" aria-hidden="true" />
                <div className="relative overflow-hidden rounded-[1.8rem] border border-white/15 bg-secondary/80 p-2 shadow-2xl">
                  <img
                    src={useCasesHeroImage}
                    alt="People from different backgrounds connected across learning, work, technology and global communities"
                    className="aspect-square w-full rounded-[1.35rem] object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="library" className="bg-background py-24 md:py-32">
          <div className="container">
            <div className="max-w-3xl" data-aos="fade-up">
              <p className="text-sm font-semibold uppercase tracking-[.2em] text-primary">Use-case library</p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-secondary dark:text-white md:text-5xl">What organisations use Potential for</h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                Start with the mandate, audience and outcome. Configure the platform around the journey required to deliver it.
              </p>
            </div>
            <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {useCases.map((item, index) => {
                const Icon = item.icon;
                return (
                  <article key={item.number} className="group flex min-h-[250px] flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10" data-aos="fade-up" data-aos-delay={Math.min(index * 35, 240)}>
                    <div className="flex items-start justify-between">
                      <div className={`rounded-xl p-3 ${item.tint} dark:bg-primary/20 dark:text-[#eadfff]`}><Icon className="h-6 w-6" aria-hidden="true" /></div>
                      <span className="font-mono text-sm text-muted-foreground">{item.number}</span>
                    </div>
                    <p className="mt-6 text-xs font-semibold uppercase tracking-[.16em] text-primary">{item.signal}</p>
                    <h3 className="mt-2 text-xl font-semibold leading-snug text-secondary dark:text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

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

        <section className="bg-background py-24 md:py-32 pt-[40px] pb-[40px]">
          <div className="container">
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-secondary via-[#1c2c70] to-primary px-8 py-10 text-white md:px-16 md:py-10" data-aos="fade-up">
              <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
              <div className="relative max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[.2em] text-[#d2b4ff]">The next conversation</p>
                <h2 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">What are you trying to achieve?</h2>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">Tell Ayla about your audience, mandate and timing. She will help identify the most relevant Potential journey and, where there is a fit, connect you with our team.</p>
                <Button onClick={talkToAyla} size="lg" className="mt-9 rounded-full bg-white px-8 py-6 text-secondary hover:bg-white/90">Talk to Ayla <ArrowRight className="h-5 w-5" aria-hidden="true" /></Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default UseCases;