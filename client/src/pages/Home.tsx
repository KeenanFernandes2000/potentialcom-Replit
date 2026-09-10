import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  MessageSquare,
  Sparkles,
  GraduationCap,
  Trophy,
  Users,
  Bot,
  Gamepad2,
  Languages,
  Rocket,
  Paintbrush,
  Settings,
  Brain,
  Target,
  LineChart,
  Zap,
  Building2,
  Landmark,
  Lightbulb,
  Globe,
  Briefcase,
  CheckCircle,
  Network,
  HeartHandshake,
  ShieldCheck,
  Factory,
  School,
  Handshake,
} from "lucide-react";
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
import khalifaFundLogo from "@assets/Customer Logos/Khalifa Fund logo.png";
import mbcLogo from "@assets/Customer Logos/MBC logo.png";
import microsoftLogo from "@assets/Customer Logos/Microsoft logo.png";
import nestleLogo from "@assets/Customer Logos/Nestle Logo.png";
import pepsicoLogo from "@assets/Customer Logos/Pepsico logo.png";
import unWomenLogo from "@assets/Customer Logos/UN Women logo.png";
import unLogo from "@assets/Customer Logos/UN logo.png";
import visaLogo from "@assets/Customer Logos/Visa logo.png";
import wfzoLogo from "@assets/Customer Logos/WFZO logo.png";
import intelLogo from "@assets/Customer Logos/intel logo.png";
import aylaHeroImg from "@assets/2.png";
import journeyVisualImg from "@assets/ChatGPT_Image_Sep_10,_2026,_01_59_16_PM_1789034630381.png";
import aiCoreVisualImg from "@assets/ChatGPT_Image_Sep_10,_2026,_02_14_52_PM_1789035344777.png";
import globalPeopleVisualImg from "@assets/ChatGPT_Image_Sep_10,_2026,_02_20_30_PM_1789035666637.png";
import whatWeDoVisualImg from "@assets/ChatGPT_Image_Sep_10,_2026,_03_35_02_PM_1789040155157.png";

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

const ecosystemFeatures = [
  { icon: GraduationCap, label: "Academy & Courses" },
  { icon: CheckCircle, label: "Certification & Licensing" },
  { icon: Trophy, label: "Competitions & Challenges" },
  { icon: Users, label: "Mentorship & Coaching" },
  { icon: Globe, label: "Community & Events" },
  { icon: Lightbulb, label: "Innovation & Ideas" },
];

const aiCapabilities = [
  { icon: Target, label: "Personalized learning", description: "Guide each person through the next most relevant step." },
  { icon: Bot, label: "AI coaching and guidance", description: "Offer support, prompts and practice without losing the human context." },
  { icon: Brain, label: "Content and knowledge support", description: "Make trusted knowledge easier to find, understand and use." },
  { icon: Gamepad2, label: "Role-based practice", description: "Turn capability into action through realistic scenarios and simulation." },
  { icon: Zap, label: "Engagement insights", description: "See where participation is building and where people need help." },
  { icon: LineChart, label: "Leadership analysis", description: "Bring progress, adoption and evidence into one clearer view." },
];

const scaleItems = [
  { icon: Paintbrush, label: "Dedicated deployment" },
  { icon: Languages, label: "Multilingual experiences" },
  { icon: Settings, label: "Configurable journeys" },
  { icon: Users, label: "Enterprise roles and administration" },
  { icon: Building2, label: "Integration and deployment options" },
  { icon: Rocket, label: "Phased launch" },
];

const startSteps = [
  ["01", "Discover", "Define the need, audience and path."],
  ["02", "Blueprint", "Agree the first journey, roles and success measures."],
  ["03", "Mockup", "Preview a personalised interactive mockup platform."],
  ["04", "Launch & Prove", "Deploy the agreed first phase, measure, improve and expand."],
];

const audiences = [
  { icon: Landmark, label: "Governments & Public Sector" },
  { icon: Building2, label: "Banks & Financial Services" },
  { icon: Factory, label: "Multinationals & Global Enterprises" },
  { icon: HeartHandshake, label: "Foundations & Philanthropy" },
  { icon: School, label: "Educational Institutions" },
  { icon: ShieldCheck, label: "Non-Profits & NGOs" },
  { icon: Handshake, label: "Industry Associations & Professional Bodies" },
  { icon: Briefcase, label: "Programme & Initiative Owners" },
];

const differentiators = [
  {
    title: "Dedicated experience",
    description: "A focused environment shaped around your organisation, audience and mandate.",
  },
  {
    title: "AI where it adds value",
    description: "Practical support for guidance, personalization, practice and analysis.",
  },
  {
    title: "Built around application",
    description: "Journeys that help people practise, contribute, qualify and take meaningful action.",
  },
  {
    title: "Evidence for leadership",
    description: "Participation, engagement, outcome and impact reporting for informed decisions.",
  },
];

const aylaSteps = [
  {
    number: "1",
    title: "Tell us about your initiative",
    description: "Complete a short introductory form.",
  },
  {
    number: "2",
    title: "Talk to Ayla",
    description: "Ayla asks questions about the need, audience, timing and requirements.",
  },
  {
    number: "3",
    title: "Get the right next step",
    description: "Explore a relevant platform journey or approach.",
  },
  {
    number: "4",
    title: "Meet our team",
    description: "Where there is a strong fit, book a conversation directly with Potential.",
  },
];

const CTABanner = () => (
  <section id="programme-cta" className="bg-background py-24 md:py-32">
    <div className="container">
      <div
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-secondary via-[#1c2c70] to-primary p-8 text-white md:p-16"
        data-aos="fade-up"
      >
        <div
          className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[.2em] text-[#d2b4ff]">
            The next conversation
          </p>
          <h2 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">
            Have a programme or initiative in mind?
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
            Describe what you are trying to achieve and Ayla will help identify the most relevant
            next step.
          </p>
          <Button
            size="lg"
            className="mt-9 rounded-full bg-white px-8 py-6 text-secondary hover:bg-white/90"
            onClick={() => navigateWithUTM("/ayla")}
          >
            Talk to Ayla <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  </section>
);

const Home = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).AOS) {
      (window as any).AOS.refresh();
    }

    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          checkDarkMode();
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });

    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        const sectionId = hash.replace("#", "");
        const element = document.getElementById(sectionId);
        if (element) {
          setTimeout(() => {
            const offsetTop = element.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: offsetTop, behavior: "smooth" });
          }, 100);
        }
      }
    };
    handleHashScroll();

    return () => observer.disconnect();
  }, []);

  return (
    <div className="font-inter min-h-screen">
      <SEO />
      <Header />
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 md:pt-36 md:pb-24 bg-background relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 -mt-24 -mr-24 w-96 h-96 opacity-20 dark:opacity-10 blur-3xl">
              <div className="w-full h-full rounded-full bg-primary" />
            </div>
            <div className="absolute bottom-0 left-0 -mb-24 -ml-24 w-80 h-80 opacity-20 dark:opacity-10 blur-3xl">
              <div className="w-full h-full rounded-full bg-primary" />
            </div>
            <div className="absolute top-1/3 -right-20 w-72 h-72 opacity-30 dark:opacity-5 blur-2xl">
              <div className="w-full h-full rounded-full bg-accent" />
            </div>
            <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10" />
          </div>

          <div className="container relative z-10">
            <div className="flex flex-col md:flex-row gap-12 lg:gap-16 items-center mb-16">
              <div className="md:w-1/2" data-aos="fade-right">
                <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  <Sparkles className="h-4 w-4 mr-2" /> AI-powered Learning &amp; Engagement Platform
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Build capability. Engage people.{" "}
                  <span className="text-primary">Prove what changed.</span>
                </h1>

                <p className="text-xl text-muted-foreground mb-8">
                  Potential helps governments and enterprises build dedicated platforms for learning,
                  certification, mentorship, communities, innovation and AI-enabled capability
                  development — bringing the audience journey, engagement and evidence into one experience.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Button
                    size="lg"
                    className="rounded-full bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg"
                    onClick={() => navigateWithUTM("/ayla")}
                  >
                    Talk to Ayla <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-4 max-w-xl">
                  Tell Ayla what you are trying to achieve. She will help shape the right approach and,
                  where there is a fit, connect you with our team.
                </p>
              </div>

              <div className="md:w-1/2 relative" data-aos="fade-up" data-aos-delay="200">
                <div className="relative mx-auto max-w-[560px]">
                  <div className="absolute -top-5 -left-5 w-20 h-20 bg-primary/30 rounded-full blur-xl"></div>
                  <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-secondary/30 rounded-full blur-xl"></div>
                  <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-border">
                    <div className="aspect-video w-full">
                      <iframe
                        src="https://www.youtube.com/embed/y3Bmn0XLfyk?si=wBq5XyLXq4Mymioa"
                        title="YouTube video player"
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                        style={{ border: 0 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="relative z-10 w-full">
            <div className="client-logos py-8" data-aos="fade-up" data-aos-delay="100">
              <h3 className="text-center text-muted-foreground uppercase text-sm tracking-wider mb-6">
                Trusted for over 20 years by leading organizations around the world
              </h3>
              <div className="relative overflow-hidden">
                <div
                  className="flex animate-scroll hover:pause-animation"
                  style={{ width: `${clientLogos.length * 2 * 120}px` }}
                >
                  {clientLogos.map((client, i) => (
                    <div
                      key={`first-${i}`}
                      className="flex-shrink-0 w-32 h-16 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity mx-4"
                    >
                      <img
                        src={client.logo}
                        alt={`${client.name} logo`}
                        className="max-h-12 max-w-full object-contain"
                        style={{ filter: isDarkMode ? "brightness(0) invert(1)" : "none" }}
                      />
                    </div>
                  ))}
                  {clientLogos.map((client, i) => (
                    <div
                      key={`second-${i}`}
                      className="flex-shrink-0 w-32 h-16 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity mx-4"
                    >
                      <img
                        src={client.logo}
                        alt={`${client.name} logo`}
                        className="max-h-12 max-w-full object-contain"
                        style={{ filter: isDarkMode ? "brightness(0) invert(1)" : "none" }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What We Do */}
        <section id="what-we-do" className="py-24 bg-muted/50 dark:bg-secondary/10">
          <div className="container">
            <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
              <div className="max-w-xl" data-aos="fade-right">
                <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  What We Do
                </div>
                <h2 className="section-title mb-6">
                  One platform around the{" "}
                  <span className="text-primary">journey you need to deliver.</span>
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Organisations can build a dedicated experience around their audience and mandate,
                  helping people learn, practise, contribute, qualify or connect while programme
                  owners manage participation, engagement and outcomes.
                </p>
              </div>

              <div className="relative w-full lg:max-w-2xl lg:justify-self-end" data-aos="fade-left">
                <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-primary/25 via-transparent to-accent/25 blur-2xl" aria-hidden="true" />
                <div className="relative overflow-hidden rounded-[2rem] border border-border bg-secondary p-2 shadow-2xl md:p-3">
                  <div className="relative overflow-hidden rounded-[1.5rem]">
                    <img
                      src={whatWeDoVisualImg}
                      alt="Connected learning and engagement journeys for learning, practice, contribution, qualification, connection, and measurable outcomes"
                      className="aspect-[16/9] w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-secondary/85 via-secondary/20 to-transparent px-5 pb-5 pt-16 md:px-6 md:pb-6" aria-hidden="true" />
                    <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3 md:bottom-6 md:left-6 md:right-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                        One connected journey
                      </p>
                      <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                        Learn · Practise · Progress
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Who It's For */}
        <section id="audiences" className="py-24 bg-background">
          <div className="container">
            <div className="mb-10" data-aos="fade-up">
              <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                Who It's For
              </div>
              <h2 className="section-title">
                Built for organisations with a mandate to{" "}
                <span className="text-primary">develop or engage people.</span>
              </h2>
            </div>

            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
              <div className="lg:w-5/12" data-aos="fade-right">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {audiences.map((item, index) => (
                    <div
                      key={index}
                      className="group glass-effect border border-border p-3 md:p-4 rounded-2xl card-hover flex items-center gap-3 min-h-[72px]"
                      data-aos="fade-up"
                      data-aos-delay={index * 80}
                    >
                      <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary shrink-0 transition-colors group-hover:bg-primary group-hover:text-white">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <p className="text-foreground font-semibold text-xs sm:text-sm leading-snug">{item.label}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border-l-4 border-primary bg-primary/5 p-5">
                  <p className="text-lg font-semibold text-primary">
                    For public-sector mandates, enterprise capability priorities, and programme
                    owners leading innovation, community, sustainability or CSR initiatives.
                  </p>
                </div>
              </div>

              <div className="lg:w-7/12 relative" data-aos="fade-up" data-aos-delay="200">
                <div className="relative mx-auto overflow-hidden rounded-3xl border border-border shadow-2xl">
                  <img
                    src={globalPeopleVisualImg}
                    alt="A diverse group of professionals representing different roles and industries"
                    className="h-[430px] w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                    <div className="mb-4 flex items-center gap-2 text-white/65">
                      <Globe className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-[0.2em]">One platform, many contexts</span>
                    </div>
                    <p className="max-w-md text-xl font-semibold leading-snug text-white md:text-2xl">
                      Different mandates. Shared momentum. Measurable progress.
                    </p>
                  </div>
                  <div className="absolute right-5 top-5 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-xs text-white backdrop-blur-md">
                    Built for the world
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How to Start */}
        <section id="home-how-to-start" className="py-24 bg-muted/50 dark:bg-secondary/10 md:py-32">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center" data-aos="fade-up">
              <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                How to start
              </div>
              <h2 className="section-title text-center mb-6">
                Start with the need, then{" "}
                <span className="text-primary">shape the first release.</span>
              </h2>
              <p className="text-lg leading-8 text-muted-foreground">
                A strong platform journey starts with clarity. Personalised interactive previews
                are prepared for qualified organisations and initiatives.
              </p>
            </div>

            <div
              className="relative mx-auto mt-12 max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-secondary via-[#18245a] to-primary p-6 shadow-2xl md:mt-16 md:p-10"
              data-aos="fade-up"
            >
              <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
              <div className="absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-primary/30 blur-3xl" aria-hidden="true" />
              <div className="relative grid gap-4 md:grid-cols-4 md:gap-5">
                {startSteps.map(([number, title, description], index) => (
                  <div
                    key={number}
                    className="relative rounded-2xl border border-white/15 bg-white/[.08] p-5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white/[.12] motion-reduce:transition-none md:p-6"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-xl font-bold text-white shadow-lg shadow-black/20">
                      {number}
                    </div>
                    <h3 className="mt-6 text-lg font-semibold text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/65">{description}</p>
                    {index < startSteps.length - 1 && (
                      <ArrowRight
                        className="absolute -right-4 top-12 z-10 hidden h-8 w-8 rounded-full border border-white/20 bg-[#253475] p-1.5 text-[#d2b4ff] md:block"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* What You Get */}
        <section id="capabilities" className="py-24 bg-background">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center mb-16" data-aos="fade-up">
              <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                What You Get
              </div>
              <h2 className="section-title text-center mb-6">
                Core capabilities for{" "}
                <span className="text-primary">learning and engagement</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Use one capability or combine several into a dedicated learning and engagement
                platform shaped around your initiative.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
              {ecosystemFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden glass-effect border border-border p-6 rounded-2xl card-hover flex items-start gap-4"
                  data-aos="fade-up"
                  data-aos-delay={index * 80}
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/80 via-primary/20 to-transparent opacity-60" />
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold pt-1">{feature.label}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      A purposeful layer in the journey.
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="max-w-4xl mx-auto mt-4" data-aos="fade-up">
              <div className="relative rounded-3xl p-8 md:p-10 overflow-hidden bg-secondary text-secondary-foreground">
                <div className="absolute inset-0 bg-grid-pattern opacity-20" />
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <p className="text-white/60 text-sm uppercase tracking-[0.18em] mb-2">Explore the platform</p>
                      <p className="text-white font-bold text-2xl md:text-3xl max-w-xl">
                        One connected audience journey, built for what comes next.
                      </p>
                    </div>
                    <Button
                      size="lg"
                      variant="outline"
                      className="shrink-0 rounded-full border-white/30 bg-white/10 text-white hover:bg-white hover:text-secondary"
                      onClick={() => navigateWithUTM("/platform")}
                    >
                      Explore All Capabilities <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <CTABanner />

        {/* Talk to Ayla */}
        <section className="py-24 relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
          <div className="container relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="order-2 lg:order-1 flex justify-center" data-aos="fade-right">
                <div className="relative w-full max-w-md">
                  <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-2xl" />
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-primary/10">
                    <img
                      src={aylaHeroImg}
                      alt="Ayla - Your AI Empowerment Advisor"
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="absolute -bottom-3 -right-3 bg-primary text-white rounded-full p-3 shadow-lg">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2 space-y-6" data-aos="fade-left">
                <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  Meet Ayla
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                  Start with your challenge,{" "}
                  <span className="text-primary">not a product demo.</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                  Ayla is Potential’s AI advisor. She asks about your organisation, audience,
                  initiative, timing and requirements to help determine the most relevant next step.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {aylaSteps.map((step) => (
                    <div key={step.number} className="rounded-xl border border-border bg-background/70 p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-bold text-sm">
                          {step.number}
                        </span>
                        <p className="font-semibold text-foreground">{step.title}</p>
                      </div>
                      <p className="text-sm text-muted-foreground pl-11">{step.description}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Button
                    size="lg"
                    className="rounded-full bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg shadow-lg shadow-primary/25"
                    onClick={() => navigateWithUTM("/ayla")}
                  >
                    Talk to Ayla <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI at the Core */}
        <section id="ai-core" className="py-24 bg-background">
          <div className="container">
            <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[.85fr_1.15fr] lg:gap-20">
              <div data-aos="fade-right">
                <div className="inline-flex rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
                  AI at the Core
                </div>
                <h2 className="section-title mt-5">
                  AI that supports{" "}
                  <span className="text-primary">the journey.</span>
                </h2>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                  Applied where it can improve the experience, support participants and give
                  programme owners clearer insight. AI strengthens the journey without replacing
                  the people, decisions and expertise that make it meaningful.
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  {aiCapabilities.map((item) => (
                    <div key={item.label} className="group flex gap-3 rounded-2xl border border-border bg-card p-4 transition duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 motion-reduce:transition-none">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.label}</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative" data-aos="fade-left">
                <div className="absolute -inset-5 rounded-[2rem] bg-primary/15 blur-3xl" />
                <div className="relative overflow-hidden rounded-3xl border border-border bg-muted/30 p-2 shadow-2xl">
                  <img
                    src={aiCoreVisualImg}
                    alt="AI-powered learning and engagement platform supporting personalized learning, coaching, practice, insights and leadership analysis"
                    className="w-full rounded-[1.35rem] object-cover"
                  />
                </div>
                <p className="mt-4 text-center text-xs font-medium uppercase tracking-[.16em] text-muted-foreground">
                  Human-led. AI-supported. Built for measurable progress.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why It's Different */}
        <section id="difference" className="py-24 bg-muted/50 dark:bg-secondary/10">
          <div className="container">
            <div className="mb-10" data-aos="fade-up">
              <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                Why It's Different
              </div>
              <h2 className="section-title">
                Designed around your workflow,{" "}
                <span className="text-primary">not a generic portal.</span>
              </h2>
            </div>

            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
              <div className="lg:w-5/12" data-aos="fade-right">
                <div className="space-y-4">
                  {differentiators.map((item) => (
                    <div key={item.title} className="glass-effect border border-border rounded-xl p-5">
                      <p className="text-foreground font-semibold mb-1">{item.title}</p>
                      <p className="text-muted-foreground text-sm">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:w-7/12 relative min-h-[390px] flex items-center" data-aos="fade-up" data-aos-delay="200">
                <img
                  src={journeyVisualImg}
                  alt="AI-powered learning and engagement journey from learning and connection to growth, measurable outcomes, and a bigger tomorrow"
                  className="h-[390px] w-full rounded-3xl object-cover shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Built for Scale & Speed */}
        <section className="py-24 bg-muted/50 dark:bg-secondary/10">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16" data-aos="fade-up">
                <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  Built for Scale & Speed
                </div>
                <h2 className="section-title text-center mb-6">
                  Built for considered,{" "}
                  <span className="text-primary">phased delivery.</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  Deployment choices and operating controls for government and enterprise environments.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {scaleItems.map((item, index) => (
                  <div
                    key={index}
                    className="glass-effect border border-border p-6 rounded-xl card-hover flex items-start gap-4"
                    data-aos="fade-up"
                    data-aos-delay={index * 80}
                  >
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <p className="text-foreground font-medium pt-2">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="relative text-center mt-16" data-aos="fade-up">
                <div className="relative inline-block rounded-2xl p-10 overflow-hidden" style={{ background: "linear-gradient(135deg, #0B1846 0%, #1a2a6c 40%, #8844DD 100%)" }}>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl -mr-20 -mt-20" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -ml-16 -mb-16" />
                  <div className="relative z-10">
                    <p className="text-2xl md:text-3xl font-bold text-white mb-2">
                      Start with the priority.
                    </p>
                    <p className="text-xl md:text-2xl text-white/70 font-medium">
                      Expand the journey in phases.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-background py-24 md:py-32">
          <div className="container">
            <div
              className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-secondary via-[#1c2c70] to-primary p-8 text-white md:p-16"
              data-aos="fade-up"
            >
              <div
                className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/10 blur-3xl"
                aria-hidden="true"
              />
              <div className="relative max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[.2em] text-[#d2b4ff]">
                  The next conversation
                </p>
                <h2 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">
                  What does your organisation need people to do next?
                </h2>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
                  Tell Ayla about your mandate, audience and challenge. She will help identify
                  the most relevant path and connect you with our team where there is a fit.
                </p>
                <Button
                  size="lg"
                  className="mt-9 rounded-full bg-white px-8 py-6 text-secondary hover:bg-white/90"
                  onClick={() => navigateWithUTM("/ayla")}
                >
                  Talk to Ayla <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
