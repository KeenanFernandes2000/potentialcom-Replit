import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { scrollToSection } from "@/lib/animations";

// Import all customer logos
import adgmLogo from "@assets/Customer Logos/ADGM logo.png";
import airbusLogo from "@assets/Customer Logos/Airbus Logo.png";
import bankMuscatLogo from "@assets/Customer Logos/Bank mUscat logo.png";
import cartierLogo from "@assets/Customer Logos/Cartier logo.png";
import ciscoLogo from "@assets/Customer Logos/Cisco Logo.png";
import dctLogo from "@assets/Customer Logos/DCT logo.png";
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

// No longer needed as we're using a YouTube video embeded iframe

const Hero = () => {
  // State to track theme
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    };

    // Initial check
    checkDarkMode();

    // Create a mutation observer to monitor class changes on html element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          checkDarkMode();
        }
      });
    });

    // Start observing
    observer.observe(document.documentElement, { attributes: true });

    // Cleanup
    return () => observer.disconnect();
  }, []);

  const goToRachel = () => {
    window.open(
      "https://ai.potential.com/rachel",
      "_blank",
      "noopener,noreferrer"
    );
  };

  // Abstract SVG elements for decoration
  const AbstractShapes = () => (
    <>
      {/* Top right blob */}
      <div className="absolute top-0 right-0 -mt-24 -mr-24 w-96 h-96 opacity-20 dark:opacity-10 blur-3xl">
        <div className="w-full h-full rounded-full bg-primary" />
      </div>

      {/* Bottom left blob */}
      <div className="absolute bottom-0 left-0 -mb-24 -ml-24 w-80 h-80 opacity-20 dark:opacity-10 blur-3xl">
        <div className="w-full h-full rounded-full bg-secondary" />
      </div>

      {/* Middle accent */}
      <div className="absolute top-1/3 -right-20 w-72 h-72 opacity-30 dark:opacity-5 blur-2xl">
        <div className="w-full h-full rounded-full bg-accent" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10" />
    </>
  );

  // Logo grid for trusted companies with scrolling animation
  const LogoGrid = () => {
    // All 25 customer logos
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
      { name: "Khalifa Fund", logo: khalifaFundLogo },
      { name: "MBC", logo: mbcLogo },
      { name: "Microsoft", logo: microsoftLogo },
      { name: "Nestle", logo: nestleLogo },
      { name: "PepsiCo", logo: pepsicoLogo },
      { name: "UN Women", logo: unWomenLogo },
      { name: "United Nations", logo: unLogo },
      { name: "Visa", logo: visaLogo },
      { name: "WFZO", logo: wfzoLogo },
      { name: "Intel", logo: intelLogo },
    ];

    return (
      <div
        className="client-logos py-8"
        data-aos="fade-up"
        data-aos-delay="100"
      >
        <h3 className="text-center text-muted-foreground uppercase text-sm tracking-wider mb-6">
          Trusted for over 20 years by leading organizations around the world
        </h3>
        
        {/* Scrolling container */}
        <div className="relative overflow-hidden">
          <div 
            className="flex animate-scroll hover:pause-animation"
            style={{
              width: `${clientLogos.length * 2 * 120}px`, // Double width for seamless loop
            }}
          >
            {/* First set of logos */}
            {clientLogos.map((client, i) => (
              <div
                key={`first-${i}`}
                className="flex-shrink-0 w-32 h-16 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity mx-4"
              >
                <img
                  src={client.logo}
                  alt={`${client.name} logo`}
                  className="max-h-12 max-w-full object-contain"
                  style={{
                    filter: isDarkMode ? "brightness(0) invert(1)" : "none",
                  }}
                />
              </div>
            ))}
            {/* Duplicate set for seamless scrolling */}
            {clientLogos.map((client, i) => (
              <div
                key={`second-${i}`}
                className="flex-shrink-0 w-32 h-16 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity mx-4"
              >
                <img
                  src={client.logo}
                  alt={`${client.name} logo`}
                  className="max-h-12 max-w-full object-contain"
                  style={{
                    filter: isDarkMode ? "brightness(0) invert(1)" : "none",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Stats component
  const QuickStats = () => {
    const stats = [
      { value: "2x", label: "Revenue Increase" },
      { value: "85%", label: "Cost reduction" },
      { value: "24/7", label: "AI availability" },
    ];

    return (
      <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex flex-col items-center md:items-start">
            <div className="text-2xl font-bold text-primary mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section
      id="hero"
      className="pt-32 pb-20 md:pt-36 md:pb-24 bg-background relative overflow-hidden"
    >
      <div className="absolute inset-0">
        <AbstractShapes />
      </div>

      <div className="container relative z-10">
        <div className="flex flex-col md:flex-row gap-12 lg:gap-16 items-center mb-16">
          <div className="md:w-1/2" data-aos="fade-right">
            <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4 mr-2" /> AI-Powered Agents
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Deploy{" "}
              <span className="text-primary">Powerful AI Team Members</span>{" "}
              That Get Things Done
            </h1>

            <p className="text-xl text-muted-foreground mb-8">
              Seamlessly integrate intelligent agents into your workflows and
              transform how your business operates in the AI age.
            </p>

            <QuickStats />

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="rounded-full bg-primary hover:bg-primary/90 text-white gtm-hero-try-free-agent"
                onClick={() => scrollToSection("agents")}
              >
                Try Free AI Agent <Sparkles className="ml-2 h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                className="rounded-full border-primary text-primary hover:bg-primary/10 gtm-hero-talk-to-consultant"
                size="lg"
                onClick={() => window.location.href = "/vera"}
              >
                Talk to AI Consultant <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          <div
            className="md:w-1/2 relative"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <div className="relative mx-auto max-w-[500px]">
              {/* Decorative elements */}
              <div className="absolute -top-5 -left-5 w-20 h-20 bg-primary/30 rounded-full blur-xl"></div>
              <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-secondary/30 rounded-full blur-xl"></div>

              {/* Image with glass-like border */}
              <div className="relative z-10">
                {/* Floating badge above video */}
                <div className="glass-effect rounded-xl p-4 text-sm mb-4 border border-border">
                  <div className="font-medium">AI-powered productivity</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Scale your team without scaling overhead
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden shadow-2xl border border-border">
                  <div className="aspect-video w-full">
                    <iframe
                      src="https://www.youtube.com/embed/bMg9HDyMAa4?si=_pptCuyUaq2rnzWm"
                      title="AI Agents for Business"
                      className="w-full h-full object-cover rounded-2xl"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <LogoGrid />
      </div>
    </section>
  );
};

export default Hero;
