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

const programmePaths = [
  {
    number: "01",
    title: "Workforce Performance & Certification",
    description:
      "Connect role standards, assessment, learning, practice, qualification and workplace application.",
    icon: UsersRound,
    tint: "bg-[#e9e2ff] text-[#6941b5]",
    signal: "Workforce capability",
  },
  {
    number: "02",
    title: "Entrepreneurship & SME Development",
    description:
      "Support entrepreneurs and SMEs through assessment, learning, mentoring, challenges, milestones and follow-up.",
    icon: Rocket,
    tint: "bg-[#dff4ef] text-[#087b70]",
    signal: "Enterprise progress",
  },
  {
    number: "03",
    title: "CSR & Community Impact",
    description:
      "Turn community, stakeholder and CSR priorities into structured participation, learning, action and evidence.",
    icon: HeartPulse,
    tint: "bg-[#fff0d8] text-[#a36018]",
    signal: "Community impact",
  },
  {
    number: "04",
    title: "Partner & Channel Academy",
    description:
      "Onboard, train, certify and continuously engage partners, distributors or external networks.",
    icon: Building2,
    tint: "bg-[#e5edff] text-[#315aa8]",
    signal: "Partner enablement",
  },
  {
    number: "05",
    title: "Financial Capability",
    description:
      "Deliver structured financial education programmes with learning, engagement, applied activities and reporting.",
    icon: Banknote,
    tint: "bg-[#fce4ed] text-[#a13b68]",
    signal: "Financial capability",
  },
  {
    number: "06",
    title: "Innovation & Challenges",
    description:
      "Manage applications, submissions, judging, progression, recognition and participant communications.",
    icon: Lightbulb,
    tint: "bg-[#e9f2df] text-[#4f7a2c]",
    signal: "Innovation",
  },
  {
    number: "07",
    title: "Youth & Employability",
    description:
      "Deliver learning, challenges, assessments, mentoring and progression for youth or national talent programmes.",
    icon: GraduationCap,
    tint: "bg-[#f8e3de] text-[#a44f3d]",
    signal: "Talent and progression",
  },
];

const audienceLenses = [
  {
    number: "A1",
    title: "Women’s Enterprise",
    description:
      "Support women entrepreneurs through learning, mentoring, peer engagement and practical business milestones.",
    icon: HeartPulse,
    tint: "bg-[#f8e3de] text-[#a44f3d]",
  },
  {
    number: "A2",
    title: "Youth & National Talent",
    description:
      "Shape learning, challenges, selection, recognition and progression around a defined youth or talent mandate.",
    icon: GraduationCap,
    tint: "bg-[#fff3c9] text-[#8a6a00]",
  },
  {
    number: "A3",
    title: "Employability",
    description:
      "Combine learning, coaching, mentorship, events, applications and employability milestones in one participant journey.",
    icon: Rocket,
    tint: "bg-[#dff2e8] text-[#26734f]",
  },
  {
    number: "A4",
    title: "Mentorship & Coaching",
    description:
      "Manage mentor and mentee journeys, onboarding, matching, goals, sessions, progress and feedback.",
    icon: Handshake,
    tint: "bg-[#dff2e8] text-[#26734f]",
  },
  {
    number: "A5",
    title: "Awards & Challenges",
    description:
      "Add applications, submissions, judging, evaluation, progression, recognition and participant communications to a programme.",
    icon: Target,
    tint: "bg-[#e8e9fb] text-[#4e55a0]",
  },
  {
    number: "A6",
    title: "Customer Education",
    description:
      "Help customers use products and services effectively through structured learning, guidance, certification and engagement.",
    icon: BookOpen,
    tint: "bg-[#e0eef5] text-[#2d6d88]",
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

  const discussYourInitiative = () => navigateWithUTM("/inquire");

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <SEO
        title="Learning & Engagement Use Cases | Potential"
        description="Explore workforce, national empowerment, customer education and partner enablement use cases built on Potential’s learning and engagement platform."
        keywords="government capability development, enterprise learning platform, financial literacy, workforce upskilling, Potential use cases"
        url="https://potential.com/usecases"
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
                <p className="mt-7 max-w-2xl text-lg leading-8 text-white/85 md:text-xl">Potential.com helps governments and enterprises create dedicated learning and engagement platforms around specific mandates — from AI capability and certification to innovation, mentorship, workforce development and community programmes.</p>
                <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Button onClick={discussYourInitiative} size="lg" className="rounded-full bg-white px-8 py-6 text-base font-semibold text-secondary shadow-lg shadow-black/10 hover:bg-white/90">
                    Discuss Your Initiative <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </Button>
                  <a href="#library" className="group inline-flex items-center justify-center gap-2 px-3 py-3 font-semibold text-white transition-colors hover:text-white/75">
                    Explore the use cases <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </a>
                </div>
                <p className="mt-4 max-w-xl text-sm leading-6 text-white/60">
                  Start with the use-case library below to identify the most relevant path.
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
               <p className="text-sm font-semibold uppercase tracking-[.2em] text-primary">Programme paths</p>
               <h2 className="mt-4 text-4xl font-bold tracking-tight text-secondary dark:text-white md:text-5xl">Start with the programme you need to deliver</h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                 Start with the mandate, audience and outcome. Then configure the platform around the journey required to deliver it.
              </p>
            </div>
            <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
               {programmePaths.map((item, index) => {
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

         <section id="capabilities" className="bg-[#f6f4fb] py-24 dark:bg-[#10172c] md:py-32">
           <div className="container">
             <div className="max-w-3xl" data-aos="fade-up">
               <p className="text-sm font-semibold uppercase tracking-[.2em] text-primary">Capabilities second</p>
               <h2 className="mt-4 text-4xl font-bold tracking-tight text-secondary dark:text-white md:text-5xl">
                 Combine the capabilities each programme needs
               </h2>
               <p className="mt-5 text-lg leading-8 text-muted-foreground">
                 These are the building blocks behind the programme journey — selected and configured
                 around the initiative, rather than sold as disconnected features.
               </p>
             </div>
             <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
               {capabilities.map(([title, description, Icon], index) => (
                 <article
                   key={title}
                   className="group rounded-2xl border border-border bg-background p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
                   data-aos="fade-up"
                   data-aos-delay={Math.min(index * 60, 240)}
                 >
                   <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                     <Icon className="h-6 w-6" />
                   </div>
                   <h3 className="mt-6 text-lg font-semibold text-secondary dark:text-white">{title}</h3>
                   <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
                 </article>
               ))}
             </div>
           </div>
         </section>

         <section className="bg-background py-24 md:py-32">
           <div className="container">
             <div className="mx-auto max-w-3xl text-center" data-aos="fade-up">
               <p className="text-sm font-semibold uppercase tracking-[.2em] text-primary">Audience lenses</p>
               <h2 className="mt-4 text-4xl font-bold tracking-tight text-secondary dark:text-white md:text-5xl">
                 Shape the journey around the people it serves
               </h2>
               <p className="mt-5 text-lg leading-8 text-muted-foreground">
                 Women, youth, entrepreneurs, employees, customers and communities are audience
                 contexts within a programme — not separate products.
               </p>
             </div>
             <div className="mx-auto mt-14 grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-3">
               {audienceLenses.map((item, index) => {
                 const Icon = item.icon;
                 return (
                   <article
                     key={item.number}
                     className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                     data-aos="fade-up"
                     data-aos-delay={Math.min(index * 60, 240)}
                   >
                     <div className="flex items-start justify-between gap-4">
                       <div className={`rounded-xl p-3 ${item.tint} dark:bg-primary/20 dark:text-[#eadfff]`}>
                         <Icon className="h-6 w-6" aria-hidden="true" />
                       </div>
                       <span className="font-mono text-sm text-muted-foreground">{item.number}</span>
                     </div>
                     <h3 className="mt-6 text-xl font-semibold leading-snug text-secondary dark:text-white">{item.title}</h3>
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
                <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">Tell us about your audience, mandate and timing. We’ll help identify the most relevant Potential.com journey and the right next step.</p>
                <Button onClick={discussYourInitiative} size="lg" className="mt-9 rounded-full bg-white px-8 py-6 text-secondary hover:bg-white/90">Discuss Your Initiative <ArrowRight className="h-5 w-5" aria-hidden="true" /></Button>
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