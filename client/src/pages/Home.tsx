import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  GraduationCap,
  Trophy,
  Users,
  Bot,
  Gamepad2,
  BarChart3,
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
  Banknote,
  Lightbulb,
  Globe,
  Briefcase,
  CheckCircle,
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
import pitchInfographic from "@assets/Pitch_Infographic_1_1770792455350.png";

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
  { icon: GraduationCap, label: "Structured learning journeys & certifications" },
  { icon: Trophy, label: "Applications, challenges & innovation programs" },
  { icon: Users, label: "Mentorship & expert engagement" },
  { icon: Bot, label: "AI coaches & practical AI tools" },
  { icon: Gamepad2, label: "Gamification & performance tracking" },
  { icon: BarChart3, label: "Real-time dashboards & impact analytics" },
  { icon: Languages, label: "Multi-language and audience segmentation" },
];

const aiCapabilities = [
  { icon: Target, label: "Personalize learning and engagement paths" },
  { icon: ArrowRight, label: "Guide participants from awareness to execution" },
  { icon: Bot, label: "Provide AI coaches and smart tools" },
  { icon: LineChart, label: "Analyze engagement and predict outcomes" },
  { icon: Zap, label: "Reduce operational complexity" },
];

const scaleItems = [
  { icon: Paintbrush, label: "Full branding & customization" },
  { icon: Settings, label: "Program architecture & workflows" },
  { icon: Brain, label: "AI configuration aligned to your goals" },
  { icon: BarChart3, label: "KPIs & reporting frameworks" },
  { icon: Languages, label: "Localization & segmentation" },
];

const audiences = [
  { icon: Landmark, label: "Governments" },
  { icon: Globe, label: "CSR & Sustainability Leaders" },
  { icon: Banknote, label: "Banks & Financial Institutions" },
  { icon: Lightbulb, label: "National Innovation Programs" },
  { icon: Building2, label: "Economic Development Authorities" },
  { icon: Briefcase, label: "Large Enterprises" },
];

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
              <div className="w-full h-full rounded-full bg-secondary" />
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
                  <Sparkles className="h-4 w-4 mr-2" /> AI-Powered Empowerment Platform
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Deliver Measurable Impact at Scale —{" "}
                  <span className="text-primary">Without the Operational Burden</span>
                </h1>

                <p className="text-xl text-muted-foreground mb-10">
                  We help governments, enterprises, and CSR leaders transform large-scale
                  initiatives into AI-powered digital ecosystems that drive real engagement,
                  learning, and outcomes.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Button
                    size="lg"
                    className="rounded-full bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg"
                    onClick={() => navigateWithUTM("/demo")}
                  >
                    Request a Demo <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full border-primary text-primary hover:bg-primary/10 px-8 py-6 text-lg"
                    onClick={() => navigateWithUTM("/vera")}
                  >
                    Book a Strategy Call
                  </Button>
                </div>
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
        <section className="py-24 bg-muted/50 dark:bg-secondary/10">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center" data-aos="fade-up">
              <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                What We Do
              </div>
              <h2 className="section-title text-center mb-6">
                We Turn Programs Into{" "}
                <span className="text-primary">Scalable Impact Infrastructure</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Potential.com is an AI-powered empowerment platform that enables
                organizations to design, launch, and manage large-scale initiatives —
                efficiently and at scale.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                From entrepreneurship and financial literacy to innovation, workforce
                development, and CSR programs — we provide the digital ecosystem that
                turns strategy into measurable results.
              </p>
              <div className="inline-flex px-6 py-3 rounded-xl bg-primary/10 text-primary font-semibold text-lg">
                Fully branded. Fully customized. Ready in weeks.
              </div>
            </div>
          </div>
        </section>

        {/* What You Get */}
        <section className="py-24 bg-background">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center mb-16" data-aos="fade-up">
              <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                What You Get
              </div>
              <h2 className="section-title text-center mb-6">
                A Complete Digital{" "}
                <span className="text-primary">Empowerment Ecosystem</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Your customized platform can include:
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
              {ecosystemFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="glass-effect border border-border p-6 rounded-xl card-hover flex items-start gap-4"
                  data-aos="fade-up"
                  data-aos-delay={index * 80}
                >
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <p className="text-foreground font-medium pt-2">{feature.label}</p>
                </div>
              ))}
            </div>

            <div className="max-w-3xl mx-auto text-center" data-aos="fade-up">
              <div className="glass-effect border border-primary/20 rounded-2xl p-8">
                <p className="text-muted-foreground text-lg mb-2">
                  This is not just software access.
                </p>
                <p className="text-foreground font-semibold text-xl">
                  It is a fully built, AI-powered program aligned to your objectives.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why It's Different */}
        <section className="py-24 bg-muted/50 dark:bg-secondary/10">
          <div className="container">
            <div className="mb-10" data-aos="fade-up">
              <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                Why It's Different
              </div>
              <h2 className="section-title whitespace-nowrap">
                Most Platforms Manage.{" "}
                <span className="text-primary">We Empower.</span>
              </h2>
            </div>

            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
              <div className="lg:w-5/12" data-aos="fade-right">
                <div className="space-y-4 mb-8">
                  <div className="glass-effect border border-border rounded-xl p-5">
                    <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Traditional</div>
                    <p className="text-foreground font-medium">Learning platforms deliver courses.</p>
                  </div>
                  <div className="glass-effect border border-border rounded-xl p-5">
                    <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Traditional</div>
                    <p className="text-foreground font-medium">CRMs manage contacts.</p>
                  </div>
                  <div className="glass-effect border border-border rounded-xl p-5">
                    <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Traditional</div>
                    <p className="text-foreground font-medium">Competition tools select winners.</p>
                  </div>
                </div>

                <p className="text-lg text-muted-foreground mb-6">
                  Real impact requires more than isolated tools.
                </p>
                <div className="glass-effect border border-primary/20 rounded-2xl p-6">
                  <p className="text-foreground font-semibold text-lg">
                    We unify education, engagement, AI guidance, performance tracking,
                    and ecosystem collaboration into one intelligent platform.
                  </p>
                </div>
              </div>

              <div className="lg:w-7/12 relative" data-aos="fade-up" data-aos-delay="200">
                <div className="relative mx-auto">
                  <div className="absolute -top-5 -left-5 w-20 h-20 bg-primary/30 rounded-full blur-xl"></div>
                  <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-secondary/30 rounded-full blur-xl"></div>
                  <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-border">
                    <img
                      src={pitchInfographic}
                      alt="Potential.com - The AI-Powered Empowerment Revolution"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI at the Core */}
        <section className="py-24 bg-background">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16" data-aos="fade-up">
                <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  AI at the Core
                </div>
                <h2 className="section-title text-center mb-6">
                  Intelligence Embedded{" "}
                  <span className="text-primary">Across the Entire Journey</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  AI is integrated throughout the platform to:
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {aiCapabilities.map((item, index) => (
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

              <div className="text-center" data-aos="fade-up">
                <div className="glass-effect border border-primary/20 rounded-2xl p-8">
                  <p className="text-foreground font-semibold text-lg">
                    Run national or enterprise-scale initiatives with lean teams —
                    without sacrificing quality.
                  </p>
                </div>
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
                  Launch in Weeks,{" "}
                  <span className="text-primary">Not Months</span>
                </h2>
                <p className="text-lg text-muted-foreground">We handle:</p>
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

              <div className="text-center" data-aos="fade-up">
                <p className="text-xl text-foreground font-semibold mb-2">
                  You focus on impact.
                </p>
                <p className="text-lg text-muted-foreground">
                  We handle the infrastructure.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Who It's For */}
        <section className="py-24 bg-background">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16" data-aos="fade-up">
                <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  Who It's For
                </div>
                <h2 className="section-title text-center mb-6">
                  Designed for Organizations That Need{" "}
                  <span className="text-primary">Measurable Impact at Scale</span>
                </h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {audiences.map((item, index) => (
                  <div
                    key={index}
                    className="glass-effect border border-border p-8 rounded-xl card-hover text-center"
                    data-aos="fade-up"
                    data-aos-delay={index * 80}
                  >
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-primary/10 text-primary mb-4">
                      <item.icon className="h-7 w-7" />
                    </div>
                    <p className="text-foreground font-semibold">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="text-center" data-aos="fade-up">
                <p className="text-lg text-muted-foreground">
                  If your objective is structured, scalable empowerment — this platform
                  was built for you.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Simple Positioning */}
        <section className="py-24 bg-muted/50 dark:bg-secondary/10">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center" data-aos="fade-up">
              <div className="space-y-4 mb-8">
                <p className="text-xl text-muted-foreground">
                  LMS platforms teach.
                </p>
                <p className="text-xl text-muted-foreground">
                  CRMs manage.
                </p>
              </div>
              <div className="glass-effect border border-primary/20 rounded-2xl p-10">
                <p className="text-2xl md:text-3xl font-bold text-foreground">
                  Potential.com builds{" "}
                  <span className="text-primary">AI-powered empowerment ecosystems.</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-accent/10">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center" data-aos="fade-up">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Ready to Transform Your Programs Into{" "}
                <span className="text-primary">Measurable Impact?</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
                Let's design a fully customized AI-powered platform aligned with your
                strategic goals.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  size="lg"
                  className="rounded-full bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg"
                  onClick={() => navigateWithUTM("/demo")}
                >
                  Request a Demo <ArrowRight className="ml-2 h-5 w-5" />
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
