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
  Zap,
  Building2,
  X,
  GraduationCap,
  Handshake,
  Trophy,
  MessageCircle,
  MapPin,
  Activity,
  Briefcase,
  Leaf,
  ShieldCheck,
  Target,
} from "lucide-react";

import whyNowImg1 from "@assets/1_1776339706269.png";
import whyNowImg2 from "@assets/2_1776339706277.png";
import whyNowImg3 from "@assets/web_1776844141490.png";

import hsbcProofLogo from "@assets/HSBC_MASTERBRAND_LOGO_CMYK_1776340917689.png";
import bankMuscatProofLogo from "@assets/BankMuscat-Horizontal-Flat_1776340986119.jpg";
import moEconomyLogo from "@assets/MOEconomy_UAE_logo_1776341149105.jpg";

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

const useLoopingCounter = (target: number, duration = 3000, pauseDuration = 2000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let animFrame: number;
    let startTime: number | null = null;
    let pausing = false;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      if (pausing) {
        if (elapsed > pauseDuration) {
          pausing = false;
          startTime = timestamp;
        }
      } else {
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * target));
        if (progress >= 1) {
          setCount(target);
          pausing = true;
          startTime = timestamp;
        }
      }
      animFrame = requestAnimationFrame(animate);
    };
    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [target, duration, pauseDuration]);
  return count;
};

const regionDots = [
  { top: "45%", left: "82%", label: "UAE", delay: 0 },
  { top: "38%", left: "65%", label: "Saudi Arabia", delay: 300 },
  { top: "58%", left: "75%", label: "Oman", delay: 600 },
  { top: "42%", left: "35%", label: "Egypt", delay: 900 },
  { top: "28%", left: "58%", label: "Jordan", delay: 1200 },
  { top: "40%", left: "78%", label: "Bahrain", delay: 1500 },
  { top: "18%", left: "22%", label: "Tunisia", delay: 1800 },
  { top: "25%", left: "8%", label: "Morocco", delay: 2100 },
  { top: "8%", left: "52%", label: "Turkey", delay: 2400 },
  { top: "48%", left: "28%", label: "Libya", delay: 2700 },
  { top: "22%", left: "15%", label: "Algeria", delay: 3000 },
  { top: "32%", left: "72%", label: "Kuwait", delay: 3300 },
  { top: "42%", left: "88%", label: "Qatar", delay: 3600 },
  { top: "68%", left: "40%", label: "Sudan", delay: 3900 },
  { top: "22%", left: "55%", label: "Lebanon", delay: 4200 },
  { top: "15%", left: "62%", label: "Iraq", delay: 4500 },
];

const AnimatedDashboard = () => {
  const participants = useLoopingCounter(24580, 4000, 3000);
  const courses = useLoopingCounter(18420, 3500, 3000);
  const startups = useLoopingCounter(1247, 3000, 3000);
  const jobs = useLoopingCounter(8930, 3800, 3000);
  const co2Saved = useLoopingCounter(1840, 3600, 3000);
  const sdgsAligned = useLoopingCounter(12, 2500, 3000);
  const esgScore = useLoopingCounter(87, 2800, 3000);
  const volunteerHours = useLoopingCounter(46200, 4000, 3000);
  const [activeDot, setActiveDot] = useState(0);
  const [pulseModule, setPulseModule] = useState(0);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setActiveDot(prev => (prev + 1) % regionDots.length);
    }, 2000);
    const moduleInterval = setInterval(() => {
      setPulseModule(prev => (prev + 1) % 4);
    }, 1500);
    return () => {
      clearInterval(dotInterval);
      clearInterval(moduleInterval);
    };
  }, []);

  const modules = [
    { icon: GraduationCap, label: "Learning", color: "from-blue-400/30 to-blue-500/10" },
    { icon: Handshake, label: "Mentorship", color: "from-green-400/30 to-green-500/10" },
    { icon: Trophy, label: "Hackathons", color: "from-orange-400/30 to-orange-500/10" },
    { icon: MessageCircle, label: "Community", color: "from-pink-400/30 to-pink-500/10" },
  ];

  return (
    <div className="relative">
      <div className="absolute -inset-6 bg-gradient-to-r from-purple-500/30 via-pink-500/25 to-blue-500/30 rounded-3xl blur-2xl" />
      <div className="absolute -inset-2 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-2xl blur-md" />
      <div className="relative bg-gradient-to-br from-[#1e1040]/95 via-[#18082e]/95 to-[#0d0a2a]/95 backdrop-blur-xl border border-white/15 rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/40">

        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10">
          <BarChart3 className="w-4 h-4 text-purple-300/70" />
          <span className="text-xs text-white/80 font-semibold tracking-wide">Impact Reporting Dashboard</span>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-[10px] text-green-300/70 font-medium">LIVE</span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-white/90 font-semibold text-sm">ESG & CSR Impact Program</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-400/20 text-[10px] text-green-300 font-medium">
                  <Activity className="w-3 h-3" /> Active
                </span>
                <span className="text-[10px] text-purple-200/50">{participants.toLocaleString()}+ participants</span>
              </div>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/15 border border-purple-400/15">
              <Brain className="w-3.5 h-3.5 text-purple-300" />
              <span className="text-[10px] text-purple-300 font-medium">AI Coach Active</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              { label: "Participants", value: participants.toLocaleString(), suffix: "+", color: "text-purple-300", bg: "from-purple-500/20 to-purple-500/5", border: "border-purple-400/10", icon: Users },
              { label: "Empowered", value: courses.toLocaleString(), suffix: "", color: "text-blue-300", bg: "from-blue-500/20 to-blue-500/5", border: "border-blue-400/10", icon: GraduationCap },
              { label: "Startups Launched", value: startups.toLocaleString(), suffix: "", color: "text-green-300", bg: "from-green-500/20 to-green-500/5", border: "border-green-400/10", icon: Rocket },
              { label: "Jobs Created", value: jobs.toLocaleString(), suffix: "+", color: "text-pink-300", bg: "from-pink-500/20 to-pink-500/5", border: "border-pink-400/10", icon: Briefcase },
            ].map((metric, i) => (
              <div key={i} className={`bg-gradient-to-br ${metric.bg} border ${metric.border} rounded-lg p-2.5 text-center`}>
                <metric.icon className={`w-3.5 h-3.5 ${metric.color} mx-auto mb-1 opacity-60`} />
                <div className={`text-base font-bold ${metric.color} tabular-nums`}>{metric.value}{metric.suffix}</div>
                <div className="mt-0.5 text-[#ffffff] text-[11px]">{metric.label}</div>
              </div>
            ))}
          </div>

          <div className="mb-3 p-2.5 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-400/15">
            <div className="flex items-center gap-1.5 mb-2">
              <Leaf className="w-3 h-3 text-emerald-300" />
              <span className="text-[10px] text-emerald-200/80 font-semibold tracking-wide uppercase">ESG Impact Metrics</span>
              <span className="ml-auto text-[9px] text-emerald-300/60 font-medium">YTD</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "CO₂ Saved (t)", value: co2Saved.toLocaleString(), color: "text-emerald-300", icon: Leaf },
                { label: "UN SDGs", value: `${sdgsAligned}/17`, color: "text-teal-300", icon: Target },
                { label: "ESG Score", value: `${esgScore}`, color: "text-cyan-300", icon: ShieldCheck },
                { label: "Volunteer Hrs", value: volunteerHours.toLocaleString(), color: "text-green-300", icon: Heart },
              ].map((metric, i) => (
                <div key={i} className="text-center">
                  <metric.icon className={`w-3 h-3 ${metric.color} mx-auto mb-0.5 opacity-70`} />
                  <div className={`text-sm font-bold ${metric.color} tabular-nums`}>{metric.value}</div>
                  <div className="text-[9px] text-white/60">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 mb-3 px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/5">
            <Sparkles className="w-3 h-3 text-yellow-300/70" />
            <span className="text-[10px] text-purple-200/60">Personalized Journey Running</span>
            <div className="ml-auto flex gap-0.5">
              {[0,1,2].map(i => (
                <div key={i} className="w-1 h-3 rounded-full bg-purple-400/30 overflow-hidden">
                  <div className="w-full bg-purple-400/70 rounded-full animate-pulse" style={{ height: `${40 + Math.random() * 60}%`, animationDelay: `${i * 200}ms` }} />
                </div>
              ))}
            </div>
          </div>

          <div className="relative bg-white/[0.03] border border-white/5 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-purple-300/60" />
                <span className="text-[10px] text-purple-200/50 font-medium">Regional Reach — MENA & Turkey</span>
              </div>
              <span className="text-[9px] text-purple-300/50 font-medium">{regionDots.length} countries</span>
            </div>
            <div className="relative h-28">
              {regionDots.map((dot, i) => (
                <div key={i} className="absolute transition-all duration-700" style={{ top: dot.top, left: dot.left }}>
                  <div className={`relative ${i === activeDot ? "scale-[1.8]" : "scale-100"} transition-transform duration-500`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${i === activeDot ? "bg-purple-400 shadow-lg shadow-purple-400/50" : "bg-purple-400/30"} transition-all duration-500`} />
                    {i === activeDot && (
                      <div className="absolute -inset-1.5 rounded-full bg-purple-400/20 animate-ping" />
                    )}
                  </div>
                  {i === activeDot && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] text-purple-300/90 font-semibold bg-purple-500/25 px-1.5 py-0.5 rounded border border-purple-400/15">
                      {dot.label}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {modules.map((mod, i) => (
              <div
                key={i}
                className={`relative bg-gradient-to-br ${mod.color} border border-white/5 rounded-lg p-2 text-center transition-all duration-500 ${i === pulseModule ? "border-white/20 scale-[1.05]" : ""}`}
              >
                {i === pulseModule && (
                  <div className="absolute inset-0 rounded-lg bg-white/5 animate-pulse" />
                )}
                <mod.icon className="w-4 h-4 text-white/60 mx-auto mb-1" />
                <div className="text-[9px] text-white/50 font-medium">{mod.label}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
      <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl px-4 py-2 text-sm font-bold shadow-lg shadow-purple-500/30 flex items-center gap-1.5">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        Live Data
      </div>
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
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const checkAndCreate = () => {
      if (cancelled || retries >= maxRetries) return;
      retries++;
      try {
        if ((window as any).hbspt && (window as any).hbspt.forms) {
          (window as any).hbspt.forms.create({
            portalId: "25217377",
            formId: "f794634e-348b-40c2-acf5-23bd46cb3df6",
            region: "eu1",
            target: "#hs-demo-form-container",
          });
        } else {
          timerId = setTimeout(checkAndCreate, 200);
        }
      } catch (e) {
        console.warn("HubSpot form creation error:", e);
      }
    };

    const existing = document.querySelector('script[src*="js-eu1.hsforms.net"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://js-eu1.hsforms.net/forms/embed/v2.js";
      script.charset = "utf-8";
      script.type = "text/javascript";
      script.async = true;
      script.onload = () => checkAndCreate();
      script.onerror = () => console.warn("Failed to load HubSpot forms script");
      document.head.appendChild(script);
    } else {
      checkAndCreate();
    }

    return () => {
      cancelled = true;
      if (timerId) clearTimeout(timerId);
    };
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
      image: whyNowImg1,
    },
    {
      icon: TrendingUp,
      title: "Economic Shift",
      description: "New industries are emerging. Economies must adapt quickly through workforce and entrepreneurship programs.",
      image: whyNowImg2,
    },
    {
      icon: Users,
      title: "ESG Compliance & Disclosure",
      description: "Enterprises must meet growing ESG reporting requirements with transparent, measurable data on impact and outcomes.",
      image: whyNowImg3,
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
      icon: Building2,
      title: "Enterprise CSR / ESG",
      description: "Turn ESG commitments into scalable programs with real-time impact measurement and reporting dashboards.",
    },
    {
      icon: Landmark,
      title: "Government Entities",
      description: "Launch national workforce and entrepreneurship programs with measurable outcomes.",
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
      title: "Tatawwar Program",
      logo: hsbcProofLogo,
      audience: "Youth & students (ages 15–18) across MENA",
      outcome: "Empowered youth to become social innovators through education, prototyping, and acceleration programs focused on UN SDGs",
      stats: ["25,000+ Youth engaged", "250+ Idea prototypes developed", "20+ Startups accelerated"],
    },
    {
      title: "The Entrepreneurial Nation (TEN)",
      logo: moEconomyLogo,
      audience: "Entrepreneurs, startups, and SMEs",
      outcome: "Strengthened the national entrepreneurship ecosystem through partnerships, programs, and funding opportunities",
      stats: ["5,000+ Entrepreneurs engaged", "20+ Global Partners", "$1M support provided"],
    },
    {
      title: "Maliyat Program",
      logo: bankMuscatProofLogo,
      audience: "Students, youth, and adults across Oman",
      outcome: "Enhanced financial literacy and money management skills through practical learning on budgeting, saving, and financial planning",
      stats: ["20,000+ Individuals engaged"],
    },
  ];

  const { ref: statsInViewRef, isVisible: statsVisible } = useInView();
  const yearsCount = useCounter(20, statsVisible);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Launch ESG & CSR Programs in Weeks | Potential.com"
        description="Launch workforce, entrepreneurship, and CSR programs with a real impact tracking. AI-powered, fully branded, and trusted by governments and enterprises."
        keywords="national programs, workforce development, entrepreneurship programs, CSR programs, AI-powered platform, government programs, impact tracking"
      />
      <Header />
      <main className="pt-20">

        {/* SECTION 1 — HERO */}
        <section className="relative py-12 md:py-16 lg:py-20 overflow-hidden bg-[#1a0a2e]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a2e] via-[#2d1154] to-[#0f1642]" />
          <div className="absolute top-[-200px] right-[-100px] w-[700px] h-[700px] bg-purple-600/20 rounded-full blur-[150px]" />
          <div className="absolute bottom-[-150px] left-[-100px] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[130px]" />
          <div className="absolute top-[20%] left-[50%] w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />

          <div className="container relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <SlideIn direction="left">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-purple-200 text-sm font-medium mb-6">
                    <Sparkles className="h-4 w-4" />
                    AI-Powered National Programs
                  </div>
                </SlideIn>
                <SlideIn direction="left" delay={100}>
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] mb-6 tracking-tight">
                    <span className="text-white">Launch ESG & CSR Programs That Deliver Measurable</span>
                    <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-orange-300 bg-clip-text text-transparent">
                    Impact</span>
                  </h1>
                </SlideIn>
                <SlideIn direction="left" delay={200}>
                  <p className="text-lg md:text-xl text-purple-100/70 mb-10 leading-relaxed max-w-xl">Empower communities, employees, and stakeholders with AI-powered CSR programs—designed to launch, manage, and scale impactful ESG initiatives with ease.
</p>
                </SlideIn>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-10">
                  {[
                    { text: "Fully designed program in 1–2 weeks", icon: Rocket },
                    { text: "Launch-ready platform in 3–4 weeks", icon: Zap },
                    { text: "Engage 1,000–100,000+ participants", icon: Users },
                    { text: "Real-time dashboards for impact reporting", icon: BarChart3 },
                  ].map((item, i) => (
                    <SlideIn key={i} direction="up" delay={300 + i * 100}>
                      <div className="flex items-start gap-3 group">
                        <div className="mt-0.5 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/20 border border-purple-400/20 flex items-center justify-center flex-shrink-0 group-hover:from-purple-500/50 group-hover:to-pink-500/40 transition-all">
                          <item.icon className="h-4 w-4 text-purple-300" />
                        </div>
                        <span className="text-white/90 text-sm font-medium leading-snug">{item.text}</span>
                      </div>
                    </SlideIn>
                  ))}
                </div>
                <SlideIn direction="up" delay={700}>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button size="lg" className="text-base px-8 py-6 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 border-0 shadow-lg shadow-purple-500/25 text-white" onClick={openDemo}>
                      Request Free Demo <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </SlideIn>
              </div>

              <SlideIn direction="right" delay={400}>
                <AnimatedDashboard />
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
                  <div className="group [perspective:1000px] h-[320px]">
                    <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                      <div className="absolute inset-0 [backface-visibility:hidden] rounded-2xl overflow-hidden shadow-lg">
                        <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <h3 className="text-xl font-bold text-white">{card.title}</h3>
                        </div>
                      </div>
                      <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-primary/90 to-primary flex flex-col items-center justify-center p-8 text-center">
                        <card.icon className="h-10 w-10 text-white mb-4" />
                        <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
                        <p className="text-white/90 leading-relaxed">{card.description}</p>
                      </div>
                    </div>
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
                  <p className="text-lg text-primary font-semibold mb-6">More Than CSR Management—A Full Impact Ecosystem</p>
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
        <section className="py-20 md:py-28 bg-[#dfd8ed80]">
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
              {audiences.map((item, i) => (
                <SlideIn key={i} direction="scale" delay={i * 120}>
                  <div className="group relative bg-gradient-to-br from-card to-muted/50 border border-border rounded-2xl p-6 text-center hover:shadow-2xl hover:border-primary/40 hover:-translate-y-2 transition-all duration-300 overflow-hidden h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-primary/[0.08] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10">
                      <div className="bg-gradient-to-br from-primary/15 to-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:from-primary/25 group-hover:to-primary/10 transition-colors shadow-sm">
                        <item.icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </SlideIn>
              ))}
            </div>
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
                  From Idea to National CSR Program <span className="gradient-text">in Weeks</span>
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
        <section className="py-16 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0B1846 0%, #1a2a6c 40%, #8844DD 100%)" }}>
          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center" data-aos="fade-up">
              <p className="text-xl md:text-2xl font-semibold text-white mb-8">Ready to Scale Your CSR Impact?</p>
              <Button
                size="lg"
                className="rounded-full bg-white text-[#0B1846] hover:bg-white/90 font-semibold px-10 py-6 text-lg shadow-lg"
                onClick={openDemo}
              >
                Request Free Demo <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
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
                  Proven<span className="gradient-text"> Impact </span>Across Industries
                </h2>
              </div>
            </SlideIn>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {proofCards.map((card, i) => (
                <SlideIn key={i} direction="left" delay={i * 150}>
                  <div className="group [perspective:1000px] h-[380px]">
                    <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                      <div className="absolute inset-0 [backface-visibility:hidden] rounded-2xl overflow-hidden shadow-lg border border-border bg-white flex flex-col items-center justify-center p-8">
                        <div className="flex-1 flex items-center justify-center w-full">
                          <img src={card.logo} alt={card.title} className={`object-contain ${i === 0 ? "max-h-28 max-w-[80%]" : "max-h-40 max-w-[90%]"}`} />
                        </div>
                        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl px-5 py-3 w-full text-center">
                          <h3 className="text-lg font-bold text-foreground">{card.title}</h3>
                        </div>
                      </div>
                      <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-primary/90 to-primary flex flex-col justify-center p-7 text-white">
                        <h3 className="text-lg font-bold mb-3">{card.title}</h3>
                        <p className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">Target Audience</p>
                        <p className="text-white/95 text-sm mb-3">{card.audience}</p>
                        <p className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">Outcome</p>
                        <p className="text-white/95 text-sm mb-4 leading-relaxed">{card.outcome}</p>
                        <div className="flex flex-wrap gap-2">
                          {card.stats.map((stat, j) => (
                            <span key={j} className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold">
                              {stat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </SlideIn>
              ))}
            </div>
            <SlideIn direction="up" delay={500}>
              <p className="text-center mt-10 text-lg font-bold gradient-text">
                Trusted by 100+ organizations running programs on our platform
              </p>
            </SlideIn>
          </div>
        </section>

        {/* SECTION 9 — FINAL CTA */}
        <section className="py-16 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0B1846 0%, #1a2a6c 40%, #8844DD 100%)" }}>
          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center" data-aos="fade-up">
              <p className="text-xl md:text-2xl font-semibold text-white mb-8">Turn Your CSR Strategy Into a Live Impact Program — Fast</p>
              <Button
                size="lg"
                className="rounded-full bg-white text-[#0B1846] hover:bg-white/90 font-semibold px-10 py-6 text-lg shadow-lg"
                onClick={openDemo}
              >
                Request Free Demo <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
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
