import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Brain,
  Layers,
  BarChart3,
  Globe,
  Rocket,
  CheckCircle,
  ArrowRight,
  Download,
  Lightbulb,
  Trophy,
  Users,
  Zap,
  Target,
  TrendingUp,
  Clock,
  Settings,
  Play,
  Sparkles,
} from "lucide-react";

import heroImage from "@assets/stock_images/corporate_social_res_ac0695d3.jpg";
import philosophyImage from "@assets/stock_images/diverse_team_busines_988fa644.jpg";
import dashboardImage from "@assets/stock_images/ai_technology_digita_e018282c.jpg";
import teamImage from "@assets/stock_images/diverse_team_busines_ad90320d.jpg";

import infographicImage from "@assets/Gemini_Generated_Image_puapbnpuapbnpuap_1768466195548.png";

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

const AIForCSR = () => {
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    companyName: "",
  });

  const downloadUrl = "/assets/downloads/AI-Powered-CSR-Infographic.png";

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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.companyName) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/csr-infographic/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormSubmitted(true);
        
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = "AI-Powered-CSR-Infographic.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowLeadForm(false);
    setFormSubmitted(false);
    setFormData({ fullName: "", email: "", companyName: "" });
  };

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).AOS) {
      (window as any).AOS.refresh();
    }
  }, []);

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

  const modules = [
    {
      icon: Brain,
      title: "The Empowerment Core",
      description:
        "A robust system combining digital learning with action-based assignments to ensure participants apply knowledge to real-world problems.",
    },
    {
      icon: Zap,
      title: "The AI Business Toolbox",
      description:
        "A suite of 25+ pioneering tools—from strategy generation to marketing automation—that increases participant productivity by up to 10x.",
    },
    {
      icon: Trophy,
      title: "Innovation & Judging",
      description:
        "A structured module to manage competitions, prototypes, and business plans, perfect for youth or entrepreneurship grants.",
    },
    {
      icon: Globe,
      title: "Custom Environments",
      description:
        "Branded, multi-language digital ecosystems that align perfectly with your corporate identity.",
    },
  ];

  const deploymentSteps = [
    {
      step: 1,
      title: "Alignment",
      description: "We identify your high-level CSR/ESG objectives.",
      icon: Target,
    },
    {
      step: 2,
      title: "Modular Design",
      description: "We select the tools that complement your existing assets.",
      icon: Layers,
    },
    {
      step: 3,
      title: "Customization",
      description: "We configure our SaaS platform to fit your brand and language.",
      icon: Settings,
    },
    {
      step: 4,
      title: "Impact Launch",
      description: "Deployment in as little as 24 hours with continuous monitoring.",
      icon: Rocket,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="AI for CSR | Corporate Social Responsibility Technology Platform"
        description="Supercharge your social impact with AI-powered empowerment tools. Transform community challenges into measurable innovation opportunities with our modular CSR platform."
        keywords="CSR technology, corporate social responsibility, AI for sustainability, impact measurement, ESG reporting, stakeholder engagement, social impact"
      />
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt="Social impact collaboration"
              className="w-full h-full object-cover opacity-10"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-accent/30"></div>
          </div>
          <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
          <div className="container relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block px-4 py-2 mb-6 text-sm font-medium text-primary bg-primary/10 rounded-full">AI for CSR</span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                  Scale Your Social Impact:{" "}
                  <span className="gradient-text">
                    From Passive CSR to Active Empowerment.
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-8">Amplify your CSR vision today. Add a modular layer of AI-driven tools to your existing initiatives to turn community challenges into measurable innovation opportunities.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="text-lg px-8 py-6 group"
                    onClick={() => setShowBookingModal(true)}
                  >
                    Book Free 2026 Strategy Consultation
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
              <div className="relative hidden lg:block">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border">
                  <img
                    src={heroImage}
                    alt="Team collaborating on social impact"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent"></div>
                </div>
                <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl border border-border shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">10x</p>
                      <p className="text-sm text-muted-foreground">More Impact</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="py-16 md:py-24 bg-secondary/5">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="relative rounded-2xl overflow-hidden shadow-xl border border-border">
                  <img
                    src={philosophyImage}
                    alt="Strategic planning session"
                    className="w-full h-auto"
                  />
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <span className="inline-block px-3 py-1 mb-4 text-sm font-medium text-primary bg-primary/10 rounded-full">
                  Architecture for Amplification
                </span>
                <h2 className="section-title">
                  A Strategic Toolkit for the Modern CSR Leader
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Your organization already has the vision; we provide the digital
                  engine to help it reach its full potential. Our platform is a
                  Strategic Toolkit designed to plug into your current strategy,
                  moving beyond passive outreach to facilitate tangible, real-world
                  action.
                </p>
                <div className="bg-card p-6 rounded-xl border border-border mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        The Augmented Intelligence Model
                      </h3>
                      <p className="text-muted-foreground">
                        We help you transition from traditional CSR to an
                        "Augmented Intelligence" model. Here, human innovation is
                        supported and scaled by AI to empower individuals and
                        communities in meaningful, measurable ways.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Lead Magnet Section */}
        <section className="py-16 md:py-24 bg-gradient-to-r from-primary/10 via-accent/20 to-primary/10">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
              <div className="lg:col-span-3">
                <span className="inline-block px-3 py-1 mb-4 text-sm font-medium text-primary bg-primary/10 rounded-full">
                  Efficiency at Scale
                </span>
                <h2 className="section-title">
                  How AI Streamlines the Impact Lifecycle
                </h2>
                <p className="text-lg text-muted-foreground mb-8">Discover Potential.com's blueprint for the next generation of CSR. Our downloadable infographic reveals how we use AI to streamline the planning, setup, and deployment of impact programs—allowing you to measure and scale with 10x more efficiency.</p>
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 group"
                  onClick={() => setShowLeadForm(true)}
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download a Detailed Infographic for Free
                </Button>
              </div>
              <div className="lg:col-span-2">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border max-w-sm ml-auto">
                  <img
                    src={infographicImage}
                    alt="AI-Powered CSR: Vision to Impact Infographic"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>

          {showLeadForm && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-card rounded-2xl border border-border p-8 max-w-lg w-full relative">
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                
                {!formSubmitted ? (
                  <>
                    <h3 className="text-2xl font-bold mb-4">
                      Get Your Free Infographic
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Enter your details below to download the AI Impact Lifecycle
                      infographic.
                    </p>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <input
                        type="email"
                        placeholder="Work Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <input
                        type="text"
                        placeholder="Company Name"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Download Infographic"}
                      </Button>
                    </form>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">
                      Thank You!
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Your download should start automatically. If it doesn't, click the link below.
                    </p>
                    <a
                      href={downloadUrl}
                      download="AI-Powered-CSR-Infographic.png"
                      className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                    >
                      <Download className="h-5 w-5" />
                      Download Infographic
                    </a>
                    <div className="mt-6">
                      <Button variant="outline" onClick={closeModal}>
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Modular Approach Section */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="text-center mb-12">
              <span className="inline-block px-3 py-1 mb-4 text-sm font-medium text-primary bg-primary/10 rounded-full">
                Plug-and-Play Impact
              </span>
              <h2 className="section-title">
                An Agile Addition to Your Existing Framework
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Because our platform is modular by design, you can select only the
                components you need. It integrates seamlessly with your 2026
                objectives, ensuring you never have to start from scratch.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {modules.map((module, index) => (
                <div
                  key={index}
                  className="p-8 rounded-2xl border border-border bg-card card-hover group"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <module.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{module.title}</h3>
                  <p className="text-muted-foreground">{module.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Button
                size="lg"
                className="text-lg px-8 py-6 group"
                onClick={() => setShowBookingModal(true)}
              >
                Book Free 2026 Strategy Consultation
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </section>

        {/* Strategic Intelligence Section */}
        <section className="py-16 md:py-24 bg-secondary/5">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block px-3 py-1 mb-4 text-sm font-medium text-primary bg-primary/10 rounded-full">
                  Strategic Intelligence
                </span>
                <h2 className="section-title">
                  Turn Community Outreach into Strategic Assets
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Our platform acts as a layer of strategic intelligence, capturing
                  every interaction to provide deep market insights and ensure ESG
                  and UN SDG compliance.
                </p>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Real-time Dashboards
                      </h3>
                      <p className="text-muted-foreground">
                        Track reach, engagement, and behavioral change as they
                        happen.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Trend Identification
                      </h3>
                      <p className="text-muted-foreground">
                        Use advanced data collection to understand community needs
                        and inform your 2027 policy or product development.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-xl border border-border">
                  <img
                    src={dashboardImage}
                    alt="Analytics dashboard"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="py-16 md:py-24 pt-[0px] pb-[0px]">
          <div className="container">
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

        {/* Deployment Section */}
        <section className="py-16 md:py-24 bg-secondary/5">
          <div className="container">
            <div className="text-center mb-12">
              <span className="inline-block px-3 py-1 mb-4 text-sm font-medium text-primary bg-primary/10 rounded-full">
                Rapid, Low-Friction Integration
              </span>
              <h2 className="section-title">From Concept to Launch in Record Time</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our streamlined deployment process ensures you can start making an
                impact quickly without disrupting your existing operations.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {deploymentSteps.map((step, index) => (
                <div
                  key={index}
                  className="relative p-6 rounded-2xl border border-border bg-card text-center card-hover"
                >
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm">
                      {step.step}
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 mt-4">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-accent/10">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Ready to Amplify Your{" "}
                <span className="gradient-text">Social Impact?</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Book your free strategy consultation and discover how our
                AI-powered platform can transform your CSR initiatives in 2026 and
                beyond.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 group"
                  onClick={() => setShowBookingModal(true)}
                >
                  Book Free 2026 Strategy Consultation
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${showBookingModal ? 'bg-black/60 opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          style={{ visibility: showBookingModal ? 'visible' : 'hidden' }}
        >
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-4xl h-[85vh] relative flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className="text-2xl font-bold text-foreground">
                  Book Your Free Strategy Consultation
                </h3>
                <p className="text-muted-foreground mt-1">
                  Select a time that works best for you
                </p>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="w-10 h-10 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 bg-white overflow-hidden">
              <iframe
                src="https://meetings-eu1.hubspot.com/rawzaba?embed=true"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0, minHeight: '100%' }}
                title="Book a consultation"
                allow="microphone; camera"
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AIForCSR;
