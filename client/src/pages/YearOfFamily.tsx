import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import {
  CheckCircle,
  ArrowRight,
  Rocket,
  BarChart3,
  Users,
  Globe,
  Trophy,
  Heart,
  Shield,
  TrendingUp,
  Sparkles,
} from "lucide-react";

import heroImage from "@assets/year-of-family-hero.jpg";
import optionLogosImage from "@assets/Your_logo_x_Year_of_Family_1770878897089.png";
import option2LogosImage from "@assets/Potential.org_x_Year_of_Family_1770878941343.png";
import opportunityImage from "@assets/Infographic_1770879638386.png";
import solutionImage from "@assets/year-of-family-solution.jpg";
import impactImage from "@assets/year-of-family-impact.jpg";
import strategicImage from "@assets/year-of-family-strategic.jpg";

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

const FadeInSection = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const { ref, isVisible } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const YearOfFamily = () => {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const bookingContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showBookingModal) return;
    const initMeetings = () => {
      if (bookingContainerRef.current && (window as any).hbspt?.meetings) {
        (window as any).hbspt.meetings.create(bookingContainerRef.current);
      }
    };
    const existingScript = document.getElementById('hubspot-meetings-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'hubspot-meetings-script';
      script.type = 'text/javascript';
      script.src = 'https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js';
      script.async = true;
      script.onload = () => initMeetings();
      document.head.appendChild(script);
    } else {
      initMeetings();
    }
  }, [showBookingModal]);

  const solutionFeatures = [
    { icon: Rocket, text: "Launch a fully branded Year of Family platform" },
    { icon: Sparkles, text: "Provide AI-powered family empowerment tools" },
    { icon: Heart, text: "Structured tracks: Financial Stability, Wellbeing & Parenting, Entrepreneurship & Family Business" },
    { icon: BarChart3, text: "Track participation and manage your impact" },
  ];

  const impactPoints = [
    { icon: Users, text: "Engage thousands of families" },
    { icon: BarChart3, text: "Track behavioral participation" },
    { icon: Globe, text: "Align with national priorities" },
    { icon: Shield, text: "Strengthen ESG reporting" },
    { icon: TrendingUp, text: "Build a long-term digital legacy" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Year of Family | Launch a National Digital Empowerment Initiative | Potential.com"
        description="Lead the Year of Family with a measurable, AI-powered digital initiative that empowers UAE families at national scale. Launch your branded platform or sponsor the national digital ecosystem."
        keywords="Year of Family UAE, family empowerment, national initiative, AI platform, digital infrastructure, ESG, UAE families, community impact"
      />
      <Header />
      <main className="pt-20">

        {/* 1 - HERO SECTION */}
        <section className="relative py-24 md:py-36 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt="UAE families at golden hour"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>
          </div>
          <div className="container relative z-10">
            <div className="max-w-3xl">
              <FadeInSection>
                <span className="inline-block px-4 py-2 mb-6 text-sm font-semibold text-primary rounded-full bg-[#ffffffbf]">
                  Year of Family 2025
                </span>
              </FadeInSection>
              <FadeInSection delay={100}>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Lead the <span className="text-[#ffffff]">Year of Family</span>.{" "}
                  <span className="gradient-text text-[#ffffff]">Don't Just Talk About It.</span>
                </h1>
              </FadeInSection>
              <FadeInSection delay={200}>
                <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed max-w-2xl">
                  Launch or sponsor a measurable, AI-powered digital initiative that empowers UAE families at national scale — fully aligned with the Year of Family priorities.
                </p>
              </FadeInSection>
              <FadeInSection delay={300}>
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  <div className="flex items-center gap-2 text-gray-200">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Launch your own branded initiative in a week</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-200">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Sponsor our national Year of Family program</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-200">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Empower families across UAE & measure real impact</span>
                  </div>
                </div>
              </FadeInSection>
              <FadeInSection delay={400}>
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 group"
                  onClick={() => setShowBookingModal(true)}
                >
                  Book Free Demo
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <p className="text-sm text-gray-400 mt-3">30-minute executive walkthrough. No obligation.</p>
              </FadeInSection>
            </div>
          </div>
        </section>

        {/* 2 - THE OPPORTUNITY */}
        <section className="py-20 md:py-28 bg-background">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <FadeInSection>
                <div>
                  <span className="inline-block px-4 py-2 mb-6 text-sm font-medium text-primary bg-primary/10 rounded-full">
                    The Opportunity
                  </span>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                    The Year of Family Is a{" "}
                    <span className="gradient-text">National Moment of Action</span>
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                    Many organizations want to contribute meaningfully — but most initiatives remain events, campaigns, or workshops without measurable long-term impact.
                  </p>
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                    <p className="text-sm font-medium text-muted-foreground mb-1">What's missing?</p>
                    <p className="text-lg font-semibold text-foreground">A ready-to-launch, branded initiative you can lead.</p>
                  </div>
                </div>
              </FadeInSection>
              <FadeInSection delay={200}>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border">
                  <img
                    src={opportunityImage}
                    alt="From fragmented initiatives to unified digital platform"
                    className="w-full h-auto"
                  />
                </div>
              </FadeInSection>
            </div>
          </div>
        </section>

        {/* 3 - THE SOLUTION */}
        <section className="py-20 md:py-28 bg-secondary/5">
          <div className="container">
            <FadeInSection>
              <div className="text-center mb-16">
                <span className="inline-block px-4 py-2 mb-6 text-sm font-medium text-primary bg-primary/10 rounded-full">
                  The Solution
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                  Your Ready-to-Launch Platform for the{" "}
                  <span className="gradient-text">Year of Family</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Empower the UAE families at scale through a structured, measurable initiative aligned with national priorities.</p>
              </div>
            </FadeInSection>

            <FadeInSection>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
                <div className="p-8 rounded-2xl bg-card border-2 border-primary/20 hover:border-primary/40 transition-colors text-center">
                  <div className="mb-4">
                    <img src={optionLogosImage} alt="Your Organization's Logo x Year of Family" className="w-full max-w-xs mx-auto h-auto" />
                  </div>
                  <h3 className="text-xl text-foreground mb-2 font-semibold">Option 1</h3>
                  <p className="text-lg text-primary mb-2 font-bold">Launch Your Own Branded Initiative</p>
                  <p className="text-muted-foreground text-sm">Deploy our ready-to-launch custom-branded digital program under your organization's identity</p>
                </div>
                <div className="p-8 rounded-2xl bg-card border-2 border-amber-500/20 hover:border-amber-500/40 transition-colors text-center">
                  <div className="mb-4">
                    <img src={option2LogosImage} alt="Potential.org x Year of Family" className="w-full max-w-xs mx-auto h-auto" />
                  </div>
                  <h3 className="text-xl text-foreground mb-2 font-semibold">Option 2</h3>
                  <p className="text-lg mb-2 text-[#4f9f5a] font-bold">Sponsor the National Program</p>
                  <p className="text-muted-foreground text-sm">Contribute to the Potential.org national program and gain visibility at scale</p>
                </div>
              </div>
            </FadeInSection>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
              <FadeInSection>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border">
                  <img
                    src={solutionImage}
                    alt="Digital dashboard with engagement analytics"
                    className="w-full h-auto"
                  />
                </div>
              </FadeInSection>
              <FadeInSection delay={150}>
                <div className="space-y-5">
                  {solutionFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-foreground font-medium pt-1.5">{feature.text}</p>
                    </div>
                  ))}
                </div>
              </FadeInSection>
            </div>

            {/* Mid-page CTA */}
            <FadeInSection>
              <div className="text-center mt-16">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 group"
                  onClick={() => setShowBookingModal(true)}
                >
                  Book Free Demo
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </FadeInSection>
          </div>
        </section>

        {/* 4 - THE IMPACT */}
        <section className="py-20 md:py-28 bg-background">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <FadeInSection>
                <div>
                  <span className="inline-block px-4 py-2 mb-6 text-sm font-medium text-primary bg-primary/10 rounded-full">
                    The Impact
                  </span>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-8 leading-tight">
                    From Awareness to{" "}
                    <span className="gradient-text">Measurable Impact</span>
                  </h2>
                  <div className="space-y-4 mb-10">
                    {impactPoints.map((point, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <point.icon className="h-5 w-5 text-primary" />
                        </div>
                        <p className="text-lg text-foreground font-medium">{point.text}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-8 rounded-2xl bg-gradient-to-r from-primary/10 to-[#8f40dd]/10 border-2 border-primary/30 shadow-lg shadow-primary/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-primary to-[#8f40dd]"></div>
                    <p className="text-xl font-bold text-foreground mb-2 pl-4">This is not an event.</p>
                    <p className="text-xl font-bold text-primary pl-4">It is a large-scale Family Empowerment Initiative.</p>
                  </div>
                </div>
              </FadeInSection>
              <FadeInSection delay={200}>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border">
                  <img
                    src={impactImage}
                    alt="Impact visualization across UAE emirates"
                    className="w-full h-auto"
                  />
                </div>
              </FadeInSection>
            </div>
          </div>
        </section>

        {/* 5 - STRATEGIC POSITIONING */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={strategicImage}
              alt="UAE families standing confidently"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/65 to-black/50"></div>
          </div>
          <div className="container relative z-10">
            <FadeInSection>
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8 leading-tight">
                  How Will Your Organization Be Remembered in the<br />
                  <span className="pt-[0px] pb-[0px] mt-[0px] mb-[0px] ml-[1px] mr-[1px] bg-[#f1f1f200] text-[#ffffff]">Year of Family?</span>
                </h2>
                <p className="text-xl text-gray-200 mb-4 font-bold">Move from participating to leadership & impact!</p>
                <p className="text-lg text-gray-300 mb-10 max-w-xl mx-auto">
                  Empower families. Strengthen communities. Support national stability.
                </p>
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 hover:bg-amber-600 font-semibold group bg-[#8f40dd] text-[#f6f6f6]"
                  onClick={() => setShowBookingModal(true)}
                >
                  Book Free Demo
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </FadeInSection>
          </div>
        </section>

        {/* 6 - FINAL CTA */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 via-background to-amber-500/5">
          <div className="container">
            <FadeInSection>
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                  Let's Design Your{" "}
                  <span className="gradient-text">Year of Family Initiative</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
                  Book a free strategy session to explore how your organization can launch or sponsor a measurable national empowerment program.
                </p>
                <Button
                  size="lg"
                  className="text-lg px-10 py-7 hover:bg-amber-600 font-semibold group shadow-lg shadow-amber-500/20 bg-[#8f40dd] text-[#fcfafe]"
                  onClick={() => setShowBookingModal(true)}
                >
                  Book Free Demo
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  Executive-level consultation. Customized to your entity.
                </p>
              </div>
            </FadeInSection>
          </div>
        </section>

        {showBookingModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-4xl h-[85vh] relative flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">
                    Book Free Demo
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
              <div className="flex-1 bg-white overflow-y-auto">
                <div 
                  ref={bookingContainerRef}
                  className="meetings-iframe-container" 
                  data-src="https://meetings-eu1.hubspot.com/rawzaba?embed=true"
                  style={{ minHeight: '100%' }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default YearOfFamily;
