import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import {
  ArrowRight,
  CheckCircle,
  Rocket,
  BarChart3,
  Users,
  Globe,
  Landmark,
  Banknote,
  Lightbulb,
  Brain,
  Sparkles,
  Heart,
  TrendingUp,
  Target,
  Building2,
  X,
} from "lucide-react";

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

const useInView = (options?: IntersectionObserverInit) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.15, ...options });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
};

const useCounter = (target: number, isVisible: boolean, duration = 2000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isVisible, target, duration]);
  return count;
};

const SlideIn = ({ children, className = "", delay = 0, direction = "up" }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "scale";
}) => {
  const { ref, isVisible } = useInView();
  const transforms: Record<string, string> = {
    up: "translate-y-12",
    left: "-translate-x-12",
    right: "translate-x-12",
    scale: "scale-95",
  };
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0 translate-x-0 scale-100" : `opacity-0 ${transforms[direction]}`} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const NationalPrograms = () => {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
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
    return () => observer.disconnect();
  }, []);

  const loadHubSpotForm = useCallback(() => {
    if (!formContainerRef.current) return;
    formContainerRef.current.innerHTML = "";
    let cancelled = false;
    let retries = 0;
    const maxRetries = 25;

    const checkAndCreate = () => {
      if (cancelled || retries >= maxRetries) return;
      retries++;
      if ((window as any).hbspt) {
        (window as any).hbspt.forms.create({
          portalId: "25217377",
          formId: "f794634e-348b-40c2-acf5-23bd46cb3df6",
          region: "eu1",
          target: "#hs-demo-form-container",
        });
      } else {
        setTimeout(checkAndCreate, 200);
      }
    };

    const existing = document.querySelector('script[src*="js-eu1.hsforms.net"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = "//js-eu1.hsforms.net/forms/embed/v2.js";
      script.charset = "utf-8";
      script.type = "text/javascript";
      script.async = true;
      script.onload = checkAndCreate;
      document.head.appendChild(script);
    } else {
      checkAndCreate();
    }

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (showDemoModal) {
      const cleanup = loadHubSpotForm();
      document.body.style.overflow = "hidden";
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") setShowDemoModal(false);
      };
      window.addEventListener("keydown", handleEsc);
      return () => {
        cleanup?.();
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleEsc);
        triggerRef.current?.focus();
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [showDemoModal, loadHubSpotForm]);

  const openDemo = () => setShowDemoModal(true);

  const whyNowCards = [
    {
      icon: Brain,
      title: "AI Disruption",
      description: "AI is replacing jobs faster than systems can adapt. Organizations need large-scale reskilling programs now.",
    },
    {
      icon: TrendingUp,
      title: "Economic Shift",
      description: "New industries are emerging. Economies must adapt quickly through workforce and entrepreneurship programs.",
    },
    {
      icon: Users,
      title: "Social Pressure",
      description: "Stakeholders expect real, measurable impact. Programs must deliver visible results at scale.",
    },
  ];

  const solutionFeatures = [
    { icon: Sparkles, text: "AI-powered learning journeys" },
    { icon: Users, text: "Mentorship and coaching" },
    { icon: Rocket, text: "Hackathons and challenges" },
    { icon: Lightbulb, text: "Entrepreneurship support" },
    { icon: Heart, text: "Community engagement" },
    { icon: BarChart3, text: "Impact dashboards" },
  ];

  const audiences = [
    {
      icon: Landmark,
      title: "Government Entities",
      description: "Launch national workforce and entrepreneurship programs with measurable outcomes.",
    },
    {
      icon: Building2,
      title: "Enterprise CSR / ESG",
      description: "Turn CSR budgets into scalable, measurable impact programs.",
    },
    {
      icon: Banknote,
      title: "Banks & Financial Institutions",
      description: "Build SME pipelines while meeting financial inclusion goals.",
    },
    {
      icon: Globe,
      title: "Free Zones & Innovation Authorities",
      description: "Launch startup ecosystems, hackathons, and innovation programs at scale.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Design Your Program",
      description: "Define your audience, structure, and objectives.",
    },
    {
      number: "02",
      title: "Launch Your Platform",
      description: "Fully branded, AI-powered, and ready to deploy.",
    },
    {
      number: "03",
      title: "Scale and Track Impact",
      description: "Engage participants and monitor results in real time.",
    },
  ];

  const proofCards = [
    {
      title: "HSBC Tatawwar",
      description: "Entrepreneurship programs across multiple countries.",
      icon: Target,
    },
    {
      title: "Bank Muscat Maliyat",
      description: "National financial literacy program reaching thousands.",
      icon: Banknote,
    },
    {
      title: "Ministry of Economy",
      description: "Powered the Entrepreneurial Nation initiative.",
      icon: Landmark,
    },
  ];

  const { ref: statsInViewRef, isVisible: statsVisible } = useInView();
  const yearsCount = useCounter(20, statsVisible);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Launch National Programs in Weeks | Potential.com"
        description="Launch workforce, entrepreneurship, and CSR programs with a real impact tracking. AI-powered, fully branded, and trusted by governments and enterprises."
        keywords="national programs, workforce development, entrepreneurship programs, CSR programs, AI-powered platform, government programs, impact tracking"
      />
      <Header />
      <main className="pt-20">

        {/* SECTION 1 — HERO */}
        <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] opacity-30" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] opacity-20" />
          <div className="container relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <SlideIn direction="left">
                  <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold leading-tight mb-6">
                    Launch Workforce, Entrepreneurship or CSR Programs{" "}
                    <span className="gradient-text">in Weeks</span>
                  </h1>
                </SlideIn>
                <SlideIn direction="left" delay={150}>
                  <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    We help governments, enterprises, and financial institutions design and launch AI-powered national programs for workforce development, entrepreneurship, and economic resilience.
                  </p>
                </SlideIn>
                <div className="space-y-3 mb-8">
                  {[
                    "Fully designed program in 1–2 weeks",
                    "Launch-ready platform in 3–4 weeks",
                    "Engage 1,000–100,000+ participants",
                    "Real-time dashboards for impact reporting",
                  ].map((item, i) => (
                    <SlideIn key={i} direction="up" delay={250 + i * 100}>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-foreground font-medium">{item}</span>
                      </div>
                    </SlideIn>
                  ))}
                </div>
                <SlideIn direction="up" delay={650}>
                  <Button size="lg" className="text-base px-8 py-6 rounded-xl" onClick={openDemo}>
                    Request Free Demo <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </SlideIn>
              </div>
              <SlideIn direction="right" delay={300}>
                <div className="relative">
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                      <span className="text-xs text-muted-foreground ml-2">Impact Dashboard</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-primary/10 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-primary">12,450</div>
                        <div className="text-xs text-muted-foreground">Active Participants</div>
                      </div>
                      <div className="bg-green-500/10 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">94%</div>
                        <div className="text-xs text-muted-foreground">Completion Rate</div>
                      </div>
                      <div className="bg-blue-500/10 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">847</div>
                        <div className="text-xs text-muted-foreground">New Businesses</div>
                      </div>
                      <div className="bg-purple-500/10 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">4.8</div>
                        <div className="text-xs text-muted-foreground">Avg. Rating</div>
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Program Progress</span>
                        <span className="text-sm text-primary font-semibold">78%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: "78%" }} />
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm font-semibold shadow-lg">
                    Live Data
                  </div>
                </div>
              </SlideIn>
            </div>
          </div>
        </section>

        {/* SECTION 2 — TRUSTED LOGOS */}
        <section className="py-12 border-y border-border/50 bg-muted/30">
          <div className="container">
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
        </section>

        {/* SECTION 3 — WHY NOW */}
        <section className="py-20 md:py-28">
          <div className="container">
            <SlideIn direction="up">
              <div className="text-center mb-14">
                <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  Why Now
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">
                  Why Organizations Need These Programs <span className="gradient-text">Now</span>
                </h2>
              </div>
            </SlideIn>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {whyNowCards.map((card, i) => (
                <SlideIn key={i} direction="up" delay={i * 150}>
                  <div className="group bg-card border border-border rounded-2xl p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                    <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                      <card.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{card.description}</p>
                  </div>
                </SlideIn>
              ))}
            </div>
            <SlideIn direction="up" delay={500}>
              <div className="text-center mt-12">
                <Button size="lg" className="text-base px-8 py-6 rounded-xl" onClick={openDemo}>
                  Request Free Demo <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </SlideIn>
          </div>
        </section>

        {/* SECTION 4 — SOLUTION */}
        <section className="py-20 md:py-28 bg-muted/30">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-14 items-center">
              <div>
                <SlideIn direction="left">
                  <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                    Our Solution
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    A Complete Program-in-a-Box — <span className="gradient-text">Powered by AI</span>
                  </h2>
                  <p className="text-lg text-primary font-semibold mb-6">
                    We don't sell software. We deliver running programs.
                  </p>
                </SlideIn>
                <SlideIn direction="left" delay={200}>
                  <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                    Fully branded under your organization
                  </p>
                </SlideIn>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {solutionFeatures.map((feature, i) => (
                  <SlideIn key={i} direction="up" delay={i * 100}>
                    <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4 hover:shadow-md hover:border-primary/30 transition-all duration-300">
                      <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-medium text-sm leading-snug pt-2">{feature.text}</span>
                    </div>
                  </SlideIn>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5 — WHO IT'S FOR */}
        <section className="py-20 md:py-28">
          <div className="container">
            <SlideIn direction="up">
              <div className="text-center mb-14">
                <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  Who It's For
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">
                  Built for Organizations <span className="gradient-text">Driving Impact</span>
                </h2>
              </div>
            </SlideIn>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {audiences.map((item, i) => (
                <SlideIn key={i} direction="scale" delay={i * 120}>
                  <div className="group bg-card border border-border rounded-2xl p-8 hover:shadow-xl hover:border-primary/40 hover:scale-[1.02] transition-all duration-300">
                    <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                      <item.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </SlideIn>
              ))}
            </div>
            <SlideIn direction="up" delay={500}>
              <div className="text-center mt-12">
                <Button size="lg" variant="outline" className="text-base px-8 py-6 rounded-xl border-primary text-primary hover:bg-primary hover:text-primary-foreground" onClick={() => navigate("/book")}>
                  Book a Strategy Session <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </SlideIn>
          </div>
        </section>

        {/* SECTION 6 — HOW IT WORKS */}
        <section className="py-20 md:py-28 bg-muted/30">
          <div className="container">
            <SlideIn direction="up">
              <div className="text-center mb-14">
                <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  How It Works
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">
                  From Idea to National Program <span className="gradient-text">in Weeks</span>
                </h2>
              </div>
            </SlideIn>
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8 relative">
                <div className="hidden md:block absolute top-14 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
                {steps.map((step, i) => (
                  <SlideIn key={i} direction="up" delay={i * 200}>
                    <div className="relative text-center">
                      <div className="relative z-10 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mx-auto mb-6 shadow-lg shadow-primary/25">
                        {step.number}
                      </div>
                      <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </SlideIn>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA — Deliver Real Impact */}
        <section className="py-16 bg-primary">
          <div className="container">
            <SlideIn direction="scale">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground text-center md:text-left">
                  Deliver Real Impact at Scale — Starting Now
                </h2>
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-base px-8 py-6 rounded-xl whitespace-nowrap"
                  onClick={openDemo}
                >
                  Request Free Demo <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </SlideIn>
          </div>
        </section>

        {/* SECTION 7 — PROOF */}
        <section className="py-20 md:py-28">
          <div className="container">
            <SlideIn direction="up">
              <div className="text-center mb-14">
                <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  Proven Results
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">
                  Programs That Ran at <span className="gradient-text">National Scale</span>
                </h2>
              </div>
            </SlideIn>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {proofCards.map((card, i) => (
                <SlideIn key={i} direction="left" delay={i * 150}>
                  <div className="group bg-card border border-border rounded-2xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                      <card.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{card.description}</p>
                  </div>
                </SlideIn>
              ))}
            </div>
            <SlideIn direction="up" delay={500}>
              <p className="text-center text-muted-foreground mt-10 text-lg">
                Trusted by leading governments and enterprises globally
              </p>
            </SlideIn>
          </div>
        </section>

        {/* SECTION 9 — FINAL CTA */}
        <section className="py-16 bg-primary">
          <div className="container">
            <SlideIn direction="scale">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground text-center md:text-left">
                    Turn Your Strategy Into a Live Impact Program — Fast
                  </h2>
                </div>
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-base px-8 py-6 rounded-xl whitespace-nowrap"
                  onClick={openDemo}
                >
                  Request Free Demo <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </SlideIn>
          </div>
        </section>

        {/* TRUST SIGNALS */}
        <section className="py-16 bg-muted/30" ref={statsInViewRef}>
          <div className="container">
            <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20">
              <SlideIn direction="up" delay={0}>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{yearsCount}+</div>
                  <div className="text-muted-foreground font-medium">Years Experience</div>
                </div>
              </SlideIn>
              <div className="hidden md:block w-px h-16 bg-border" />
              <SlideIn direction="up" delay={150}>
                <div className="text-center">
                  <div className="flex items-center gap-2 justify-center mb-2">
                    <Landmark className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-muted-foreground font-medium">Used by Governments &<br />Global Enterprises</div>
                </div>
              </SlideIn>
              <div className="hidden md:block w-px h-16 bg-border" />
              <SlideIn direction="up" delay={300}>
                <div className="text-center">
                  <div className="flex items-center gap-2 justify-center mb-2">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-muted-foreground font-medium">AI-Powered Delivery</div>
                </div>
              </SlideIn>
            </div>
          </div>
        </section>

      </main>
      <Footer />

      {/* DEMO MODAL */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="demo-modal-title">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDemoModal(false)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8">
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 id="demo-modal-title" className="text-2xl font-bold mb-2">Request Free Demo</h3>
            <p className="text-muted-foreground mb-6">Fill in the form below and our team will get back to you shortly.</p>
            <div id="hs-demo-form-container" ref={formContainerRef} className="min-h-[300px]" />
          </div>
        </div>
      )}
    </div>
  );
};

export default NationalPrograms;
