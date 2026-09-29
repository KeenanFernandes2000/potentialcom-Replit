import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { navigateWithUTM } from "@/lib/utm-utils";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Download,
  Globe,
  Users,
  Rocket,
  BarChart3,
  Building2,
} from "lucide-react";

import bmwLogo from "@assets/BMW_logo_1782107783038.png";
import alAinMuseumLogo from "@assets/Al_Ain_Museum_logo_1782107849084.png";
import dubaiSmeLogo from "@assets/dubai_sme_logo_1782107929025.jpeg";
import tipHealthcareLogo from "@assets/DED_Logo_1782108260153.jpg";
import innovationTheaterLogo from "@assets/motc_new_logo_1782108578573.png";
import vxAcademyLogo from "@assets/DCT_logo_1782108989381.png";
import moeLogo from "@assets/MOE_logo_1782111063727.png";
import adgmFepLogo from "@assets/ADGM_logo_1782112596349.jpeg";
import vxAcademyPdf from "@assets/DCT_VX_Academy_Case_Study_1782113750466.pdf";
import dubaiSmeYecPdf from "@assets/DubaiSME_YEC_Case_Study_1782113851598.pdf";
import airbusEntaliqPdf from "@assets/Entaliq_with_Airbus_Case_Study_1782113953296.pdf";
import alAinHiringPdf from "@assets/Al_Ain_AI_hiring_Case_Study_1782113992249.pdf";
import dctTouristGuidePdf from "@assets/DCT_Tourist_Guide_Case_Study_1782114102548.pdf";
import dctLearnPdf from "@assets/DCT_Learn_Case_Study_1782114125320.pdf";
import tenPdf from "@assets/Potential.com_-_Ministry_of_Economy_Case_Study_1782114200465.pdf";
import tipPdf from "@assets/Potential.com_-_TIP_Case_Study_1782114261510.pdf";
import tatawwarPdf from "@assets/Tatawwar_Case_Study_1782114335023.pdf";
import cartierPdf from "@assets/Cartier_Case_Study_1782114419701.pdf";
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
import youthLeadersLogos from "@assets/Untitled_design_(57)_1790683583293.png";

const CASE_STUDY_PDF = "/assets/pdfs/potential-case-studies.pdf";

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

type Stat = { value: string; label: string };
type CaseStudy = {
  industry: string;
  useCase: string;
  title: string;
  logo?: string;
  logoClassName?: string;
  intro: string;
  stats: Stat[];
  pdf?: string;
};

const TBD: Stat = { value: "—", label: "To be added" };

const heroStats: Stat[] = [
  { value: "2M+", label: "People Reached" },
  { value: "500+", label: "Partners, Sponsors & Organizations" },
  { value: "1000+", label: "Programs & Initiatives Delivered" },
  { value: "80+", label: "Countries" },
];

const caseStudies: CaseStudy[] = [
  {
    industry: "Government",
    useCase: "Youth Development",
    title: "Youth Leaders Path",
    logo: youthLeadersLogos,
    logoClassName: "max-h-20 max-w-full object-contain",
    intro: "Empowering Emirati youth to become the next leaders of the UAE.",
    stats: [
      { value: "1000+", label: "Youth Empowered" },
      { value: "40+", label: "Attending 8-day in-person workshops" },
      { value: "Hybrid", label: "Hybrid driven delivery" },
    ],
  },
  {
    industry: "Automotive",
    useCase: "Lead Generation",
    title: "AGMC BMW Email Campaign",
    logo: bmwLogo,
    intro:
      "Email campaign promoting the BMW 5 Series Special Offer, delivering exceptional engagement and response.",
    stats: [
      { value: "4,843", label: "Emails Delivered" },
      { value: "28.0%", label: "Open Rate" },
      { value: "4.9%", label: "Click-through Rate" },
    ],
  },
  {
    industry: "Government",
    useCase: "Entrepreneurship",
    title: "Future Entrepreneurs Programme",
    logo: adgmFepLogo,
    logoClassName: "max-h-24 max-w-[260px] object-contain",
    intro:
      "An AI-powered cornerstone initiative committed to empowering UAE Nationals and job seekers with entrepreneurial potential across the business landscape.",
    stats: [
      { value: "600+", label: "Emiratis Empowered" },
      { value: "Hybrid", label: "Model" },
      { value: "AI-Powered", label: "User Journeys" },
    ],
  },
  {
    industry: "Government",
    useCase: "HR",
    title: "Al Ain Museum AI-Powered Hiring",
    logo: alAinMuseumLogo,
    pdf: alAinHiringPdf,
    intro:
      "An AI pre-screening bot streamlined hiring for heritage, archaeology, and museum practices.",
    stats: [
      { value: "200", label: "Candidates Screened" },
      { value: "72 Hrs", label: "Screening Completed" },
      { value: "246", label: "Successful Calls Logged" },
    ],
  },
  {
    industry: "Consumer Goods",
    useCase: "Arts & Culture",
    title: "PepsiCo Art of Zayed",
    logo: pepsicoLogo,
    intro:
      "A pan-UAE program celebrating Sheikh Zayed's legacy through Art, Poetry & Music.",
    stats: [
      { value: "90,000+", label: "Social Media Reach" },
      { value: "20,000+", label: "Online Impressions" },
      { value: "$8,725", label: "Prize Pool Awarded" },
    ],
  },
  {
    industry: "Technology",
    useCase: "Partner Enablement",
    title: "Dell EMC VMware Partner Academy",
    logo: dellLogo,
    intro:
      "A regional enablement initiative that built partner capabilities and accelerated business impact.",
    stats: [
      { value: "75", label: "Participants" },
      { value: "4", label: "Learning Tracks" },
      { value: "75+", label: "Deliverables" },
    ],
  },
  {
    industry: "Government",
    useCase: "Entrepreneurship",
    title: "Dubai SME Young Entrepreneurs Competition",
    logo: dubaiSmeLogo,
    logoClassName: "max-h-24 max-w-full object-contain",
    pdf: dubaiSmeYecPdf,
    intro:
      "A national platform empowering young innovators and entrepreneurs.",
    stats: [
      { value: "3,000+", label: "Social Media Individuals" },
      { value: "600+", label: "Registered Teams" },
      { value: "23+", label: "Webinars Delivered" },
    ],
  },
  {
    industry: "Aerospace",
    useCase: "Innovation",
    title: "Airbus Entaliq Program in KSA",
    logo: airbusLogo,
    pdf: airbusEntaliqPdf,
    intro:
      "Empowering Saudi innovators through aviation innovation, mentorship and incubation.",
    stats: [
      { value: "1,072", label: "Innovators Engaged" },
      { value: "836", label: "Registered to Challenge" },
      { value: "58", label: "Projects Received" },
    ],
  },
  {
    industry: "Government",
    useCase: "Innovation",
    title: "Innovation Theater Qatar",
    logo: innovationTheaterLogo,
    logoClassName: "max-h-24 max-w-full object-contain",
    intro:
      "A flagship initiative to inspire, educate and empower entrepreneurs with digital solutions.",
    stats: [
      { value: "500+", label: "Attendees" },
      { value: "100+", label: "Registered Participants" },
      { value: "20+", label: "Innovative Teams" },
    ],
  },
  {
    industry: "Technology",
    useCase: "Innovation",
    title: "Intel Business Challenge in KSA",
    logo: intelLogo,
    intro:
      "A global competition inspiring university students to develop innovative business ideas.",
    stats: [
      { value: "31,555+", label: "Website Unique Visitors" },
      { value: "2,324", label: "Total Registrations" },
      { value: "331", label: "Team Registrations" },
    ],
  },
  {
    industry: "Technology",
    useCase: "Lead Generation",
    title: "Microsoft Lead Generation",
    logo: microsoftLogo,
    intro:
      "A 360° campaign for Office 365 reaching SMEs across the UAE and driving high-quality leads.",
    stats: [
      { value: "20,000+", label: "Professionals Reached" },
      { value: "400+", label: "Leads Generated" },
      { value: "2 Weeks", label: "Campaign Duration" },
    ],
  },
  {
    industry: "Banking & Finance",
    useCase: "Youth Development",
    title: "HSBC Tatawwar Youth Program",
    logo: hsbcLogo,
    pdf: tatawwarPdf,
    intro:
      "Empowering youth to innovate on UN SDGs through learning, mentorship and incubation.",
    stats: [
      { value: "25,000+", label: "Youth Empowered" },
      { value: "3,000+", label: "Innovations Developed" },
      { value: "8", label: "International Awards" },
    ],
  },
  {
    industry: "Luxury & Retail",
    useCase: "Women Empowerment",
    title: "Cartier Women Initiative",
    logo: cartierLogo,
    pdf: cartierPdf,
    intro:
      "Supporting women entrepreneurs across MENA to grow, access funding and scale.",
    stats: [
      { value: "6,000+", label: "Women Trained (Since 2015)" },
      { value: "$300K+", label: "Prize Money Awarded" },
      { value: "20+", label: "Regional Partners" },
    ],
  },
  {
    industry: "Consumer Goods",
    useCase: "Women Empowerment",
    title: "PepsiCo empowerHER",
    logo: pepsicoLogo,
    intro:
      "Developing women-led businesses in rural communities across MEA and the Indian Subcontinent.",
    stats: [
      { value: "30,000+", label: "Women Trained" },
      { value: "100+", label: "Startups Set Up" },
      { value: "2", label: "E-commerce Platforms Launched" },
    ],
  },
  {
    industry: "Automotive",
    useCase: "Youth Development",
    title: "Ford College Community Challenge",
    logo: fordLogo,
    intro: "Empowering university students in the US.",
    stats: [
      { value: "100+", label: "Teams Engaged" },
      { value: "100+", label: "Innovations" },
      { value: "5", label: "Scholarships Granted" },
    ],
  },
  {
    industry: "Nonprofit",
    useCase: "Women Empowerment",
    title: "AWLF Women Fund Managers Program",
    logo: unWomenLogo,
    intro:
      "A technology platform that manages the identification, capacity building, mentorship, support, and investment in women investors and entrepreneurs at scale.",
    stats: [
      { value: "1,000+", label: "Women Empowered" },
      { value: "100+", label: "Identified" },
      { value: "10+", label: "Fund Managers" },
    ],
  },
  {
    industry: "Government",
    useCase: "Certification",
    title: "Dubai Land Department Real Estate Certification",
    logo: dldLogo,
    intro:
      "A platform qualify internationally certified real estate professionals to promote, market and sell Dubai real estate properties and developments.",
    stats: [
      { value: "1,000+", label: "Certified" },
      { value: "SMART", label: "Exam" },
      { value: "6+", label: "Languages" },
    ],
  },
  {
    industry: "Government",
    useCase: "Certification",
    title: "DCT Tourist Guide Certification Platform",
    logo: vxAcademyLogo,
    logoClassName: "max-h-20 max-w-[170px] object-contain",
    pdf: dctTouristGuidePdf,
    intro:
      "An official certification platform for DCT Abu Dhabi for individuals who aspire to become licensed tourist guides in the Emirate of Abu Dhabi.",
    stats: [
      { value: "1,000+", label: "Certified Guides" },
      { value: "PAID", label: "Certification" },
      { value: "SMART", label: "Exam" },
    ],
  },
  {
    industry: "Government",
    useCase: "Certification",
    title: "Visitor Experience (VX) Academy",
    logo: vxAcademyLogo,
    logoClassName: "max-h-20 max-w-[170px] object-contain",
    pdf: vxAcademyPdf,
    intro:
      "AI-Powered Frontliner Empowerment and Certification Academy to elevate visitor experience standards in the Emirate.",
    stats: [
      { value: "100,000", label: "Target Frontliners" },
      { value: "88.1%", label: "Completion Rate" },
      { value: "135,205", label: "Hours Delivered So Far" },
    ],
  },
  {
    industry: "Government",
    useCase: "Entrepreneurship",
    title: "The Entrepreneurial Nation (TEN)",
    logo: moeLogo,
    logoClassName: "max-h-24 max-w-full object-contain",
    pdf: tenPdf,
    intro:
      "A national project for startups and SMEs that features the biggest public-private partnerships of its kind, bringing together all stakeholders.",
    stats: [
      { value: "$1,000,000+", label: "Support Provided" },
      { value: "5,000+", label: "Registered" },
      { value: "20+", label: "International Partners" },
    ],
  },
  {
    industry: "Government",
    useCase: "HR",
    title: "DCT Learn Platform",
    logo: vxAcademyLogo,
    logoClassName: "max-h-20 max-w-[170px] object-contain",
    pdf: dctLearnPdf,
    intro:
      "A unified Knowledge-Sharing Hub designed to empower internal teams & external partners across the culture & tourism ecosystem.",
    stats: [
      { value: "10+", label: "Programs Launched" },
      { value: "1,000+", label: "Learners Engaged" },
      { value: "1,000+", label: "Training Hours Delivered" },
    ],
  },
  {
    industry: "Banking & Finance",
    useCase: "Financial Literacy",
    title: "Maliyat Financial Literacy Program",
    logo: bankMuscatLogo,
    intro:
      "An AI-Powered platform driving financial literacy for various age groups in Oman.",
    stats: [
      { value: "20,000+", label: "Engaged" },
      { value: "3", label: "Age Groups" },
      { value: "6+", label: "AI Tools" },
    ],
  },
  {
    industry: "Government",
    useCase: "Innovation",
    title: "TIP Healthcare Awards",
    logo: tipHealthcareLogo,
    logoClassName: "max-h-24 max-w-full object-contain",
    pdf: tipPdf,
    intro:
      "A platform to develop the healthcare sector by attracting researchers to file patents in the UAE and startups to set up in Abu Dhabi.",
    stats: [
      { value: "300K+", label: "Reached" },
      { value: "1,000+", label: "Innovators" },
      { value: "100+", label: "Inventions" },
    ],
  },
];

const useInView = (options?: IntersectionObserverInit) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, ...options },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
};

const FadeIn = ({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  const { ref, isVisible } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const LogoOrFallback = ({
  logo,
  title,
  logoClassName,
}: {
  logo?: string;
  title: string;
  logoClassName?: string;
}) => {
  if (logo) {
    return (
      <img
        src={logo}
        alt={`${title} logo`}
        className={logoClassName ?? "max-h-20 max-w-[200px] object-contain"}
      />
    );
  }
  return (
    <div className="flex flex-col items-center gap-2 text-secondary">
      <Building2 className="w-8 h-8 text-primary" />
      <span className="text-base font-bold uppercase tracking-wide text-center">
        {title.split(" ").slice(0, 2).join(" ")}
      </span>
    </div>
  );
};

const industries = [
  "All",
  ...Array.from(new Set(caseStudies.map((cs) => cs.industry)))
    .sort()
    .sort((a, b) =>
      a === "Government" ? -1 : b === "Government" ? 1 : 0,
    ),
];

const useCases = [
  "All",
  ...Array.from(new Set(caseStudies.map((cs) => cs.useCase))).sort(),
];

const CaseStudies = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeIndustry, setActiveIndustry] = useState("All");
  const [activeUseCase, setActiveUseCase] = useState("All");

  const priorityOrder = [
    "Youth Leaders Path",
    "HSBC Tatawwar Youth Program",
    "Airbus Entaliq Program in KSA",
    "The Entrepreneurial Nation (TEN)",
    "Visitor Experience (VX) Academy",
    "PepsiCo Art of Zayed",
    "Cartier Women Initiative",
  ];

  const filteredCaseStudies = caseStudies
    .filter(
      (cs) =>
        (activeIndustry === "All" || cs.industry === activeIndustry) &&
        (activeUseCase === "All" || cs.useCase === activeUseCase),
    )
    .sort((a, b) => {
      const ai = priorityOrder.indexOf(a.title);
      const bi = priorityOrder.indexOf(b.title);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.title.localeCompare(b.title);
    });

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Potential.com - Platform Case Studies"
        description="Explore initiatives Potential has delivered across learning, certification, engagement, innovation, mentorship and capability development for governments and enterprises."
        keywords="Potential.com case studies, learning and engagement platform, certification, innovation, mentorship, capability development, governments, enterprises"
        url="https://www.potential.com/case-studies"
      />
      <Header />
      <main>
        {/* Hero */}
        <section className="relative pt-28 pb-12 md:pt-32 md:pb-16 overflow-hidden bg-gradient-to-br from-secondary via-primary to-secondary">
          <div className="absolute inset-0 bg-grid-pattern opacity-20" />
          <div className="absolute -top-10 -left-10 w-80 h-80 bg-primary/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 right-0 w-96 h-96 bg-fuchsia-500/30 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/2 w-72 h-72 bg-white/10 rounded-full blur-3xl" />

          <div className="container relative z-10 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              20+ Years of Delivered Initiatives
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-[1.05] text-white">
              Delivered Initiatives.{" "}
              <span className="bg-gradient-to-r from-amber-300 via-pink-200 to-white bg-clip-text text-transparent">
                Credible Evidence.
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-base md:text-lg text-white/85 mb-8">
               Explore programme evidence from learning, certification, engagement, innovation,
               mentorship and capability initiatives delivered for governments and enterprises.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-3xl mx-auto">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/15 bg-white/10 backdrop-blur-md px-3 py-4 text-center"
                >
                  <div className="text-2xl md:text-3xl font-extrabold text-white mb-0.5">
                    {stat.value}
                  </div>
                  <div className="text-[11px] md:text-xs text-white/75 leading-snug">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trusted By */}
        <section className="py-10 border-b border-border bg-background">
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

        {/* Featured Case Studies */}
        <section className="py-16 md:py-24">
          <div className="container">
            <FadeIn className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                 Programme Evidence from Delivered Initiatives
              </h2>
              <p className="max-w-2xl mx-auto text-muted-foreground">
                 Explore platforms, programmes and campaigns delivered for leading
                 governments and enterprises. Filter by industry and programme need.
              </p>
            </FadeIn>

            {/* Filters */}
            <div className="max-w-4xl mx-auto mb-12 space-y-6">
              <div>
                <p className="text-center text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Filter by Industry
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {industries.map((ind) => (
                    <button
                      key={ind}
                      onClick={() => setActiveIndustry(ind)}
                      aria-pressed={activeIndustry === ind}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${
                        activeIndustry === ind
                          ? "bg-primary text-white border-primary"
                          : "bg-card text-muted-foreground border-border hover:border-primary hover:text-primary"
                      }`}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-center text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Filter by Use Case
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {useCases.map((uc) => (
                    <button
                      key={uc}
                      onClick={() => setActiveUseCase(uc)}
                      aria-pressed={activeUseCase === uc}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${
                        activeUseCase === uc
                          ? "bg-primary text-white border-primary"
                          : "bg-card text-muted-foreground border-border hover:border-primary hover:text-primary"
                      }`}
                    >
                      {uc}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredCaseStudies.length === 0 && (
              <div className="text-center py-16">
                <p className="text-lg font-semibold mb-2">No case studies match these filters</p>
                <p className="text-muted-foreground mb-6">
                  Try a different industry or use case combination.
                </p>
                <button
                  onClick={() => {
                    setActiveIndustry("All");
                    setActiveUseCase("All");
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
                >
                  Reset filters
                </button>
              </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCaseStudies.map((cs, i) => (
                <FadeIn key={cs.title} delay={(i % 3) * 100}>
                  <div className="group h-full flex flex-col rounded-2xl border border-border bg-card p-6 card-hover">
                    <div className="flex flex-wrap gap-2 mb-5">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide">
                        {cs.industry}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full border border-border text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                        {cs.useCase}
                      </span>
                    </div>

                    <div className="h-28 flex items-center justify-center mb-6 rounded-xl bg-white border border-border p-4">
                      <LogoOrFallback
                        logo={cs.logo}
                        title={cs.title}
                        logoClassName={cs.logoClassName}
                      />
                    </div>

                    <h3 className="text-xl font-bold mb-3">{cs.title}</h3>
                    <p className="text-sm text-muted-foreground mb-6 flex-grow">
                      {cs.intro}
                    </p>

                    <div className="grid grid-cols-3 gap-3 mb-6 pt-4 border-t border-border">
                      {cs.stats.map((stat, si) => (
                        <div key={si}>
                          <div className="text-lg font-bold text-primary leading-tight">
                            {stat.value}
                          </div>
                          <div className="text-[11px] text-muted-foreground leading-snug mt-1">
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    <a
                      href={cs.pdf ?? CASE_STUDY_PDF}
                      download
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors mt-auto"
                    >
                      <Download className="w-4 h-4" />
                      Download Case Study
                    </a>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Why Potential.com */}
        <section className="py-16 md:py-24 bg-muted/50">
          <div className="container">
            <FadeIn className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                 Experience Across the Learning & Engagement Journey
              </h2>
            </FadeIn>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  icon: Users,
                  title: "Deep Expertise",
                   text: "20 years designing and delivering learning, capability, innovation and stakeholder engagement programmes.",
                },
                {
                  icon: Rocket,
                  title: "End-to-End Capability",
                   text: "Experience across learning, certification, engagement, mentorship, selection, communities and reporting.",
                },
                {
                  icon: BarChart3,
                  title: "Measurable Outcomes",
                   text: "Participation, progress, outcome and impact reporting that gives programme owners and leadership clearer evidence.",
                },
                {
                  icon: Globe,
                  title: "Global Reach",
                  text: "Proven programs implemented in 80+ countries with localized impact.",
                },
                {
                  icon: Building2,
                  title: "Ecosystem Approach",
                  text: "Strong networks of partners, sponsors, experts, mentors and enablers across sectors and geographies.",
                },
                {
                  icon: Rocket,
                  title: "AI-Enabled Advantage",
                   text: "AI support for guidance, personalization and analysis where it adds value across the participant journey.",
                },
              ].map((item, i) => (
                <FadeIn key={item.title} delay={(i % 3) * 100}>
                  <div className="h-full rounded-2xl border border-border bg-card p-6 card-hover">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.text}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Standard CTA */}
        <section className="bg-muted/50 py-10 dark:bg-secondary/10">
          <div className="container">
            <div
              className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-secondary via-[#1c2c70] to-primary px-8 py-10 text-white md:px-16"
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
                  Describe what you are trying to achieve and we will help identify the most relevant
                  next step.
                </p>
                <Button
                  size="lg"
                  className="mt-9 rounded-full bg-white px-8 py-6 text-secondary hover:bg-white/90"
                  onClick={() => navigateWithUTM("/inquire")}
                >
                  Discuss Your Initiative <ArrowRight className="ml-2 h-5 w-5" />
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

export default CaseStudies;
