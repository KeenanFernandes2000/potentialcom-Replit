import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

// Import client logos - light mode
import airbusLogoLight from "@assets/Light Mode client logos/AIRBUS-logo.png";
import dgLogoLight from "@assets/Light Mode client logos/DG-logo.png";
import nestleLogoLight from "@assets/Light Mode client logos/Nestle-logo.png";
import unLogoLight from "@assets/Light Mode client logos/UN-logo.png";
import cartierLogoLight from "@assets/Light Mode client logos/cartier-logo.png";
import hsbcLogoLight from "@assets/Light Mode client logos/hsbc-logo.png";
import intelLogoLight from "@assets/Light Mode client logos/intel-logo.png";
import pepsicoLogoLight from "@assets/Light Mode client logos/pepsico-logo.png";

// Import client logos - dark mode
import dgLogoDark from "@assets/Dark Mode Client logos/partner1.webp"; // Government of Dubai
import hsbcLogoDark from "@assets/Dark Mode Client logos/partner2.webp"; // HSBC
import unLogoDark from "@assets/Dark Mode Client logos/partner3.webp"; // United Nations
import pepsicoLogoDark from "@assets/Dark Mode Client logos/partner4.webp"; // PepsiCo
import intelLogoDark from "@assets/Dark Mode Client logos/partner5.webp"; // Intel
import airbusLogoDark from "@assets/Dark Mode Client logos/partner6.webp"; // Airbus
import microsoftLogoDark from "@assets/Dark Mode Client logos/partner7.webp"; // Microsoft
import dellLogoDark from "@assets/Dark Mode Client logos/partner8.webp"; // Dell

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

  // Logo grid for trusted companies
  const LogoGrid = () => {
    // Client logo objects with light and dark mode versions
    const clientLogos = [
      { name: "Airbus", logoLight: airbusLogoLight, logoDark: airbusLogoDark },
      {
        name: "Government of Dubai",
        logoLight: dgLogoLight,
        logoDark: dgLogoDark,
      },
      { name: "Nestle", logoLight: nestleLogoLight, logoDark: unLogoDark }, // Using UN for Nestle in dark mode
      {
        name: "United Nations",
        logoLight: unLogoLight,
        logoDark: pepsicoLogoDark,
      }, // Using PepsiCo for UN in dark mode
      { name: "Cartier", logoLight: cartierLogoLight, logoDark: intelLogoDark }, // Using Intel for Cartier in dark mode
      { name: "HSBC", logoLight: hsbcLogoLight, logoDark: hsbcLogoDark },
      { name: "Intel", logoLight: intelLogoLight, logoDark: microsoftLogoDark }, // Using Microsoft for Intel in dark mode
      { name: "PepsiCo", logoLight: pepsicoLogoLight, logoDark: dellLogoDark }, // Using Dell for PepsiCo in dark mode
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
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-6 items-center justify-items-center">
          {clientLogos.map((client, i) => (
            <div
              key={i}
              className="w-24 h-12 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
            >
              <img
                src={isDarkMode ? client.logoDark : client.logoLight}
                alt={`${client.name} logo`}
                className="max-h-full max-w-full object-contain"
                style={{
                  filter: isDarkMode ? "brightness(0) invert(1)" : "none",
                }}
              />
            </div>
          ))}
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
                onClick={() =>
                  window.open(
                    "https://ai.potential.com/login?utm_source=bot&utm_medium=main",
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
              >
                Try Free AI Agent <Sparkles className="ml-2 h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                className="rounded-full border-primary text-primary hover:bg-primary/10 gtm-hero-talk-to-consultant"
                size="lg"
                onClick={() =>
                  window.open(
                    "https://ai.potential.com/voice/42531902-20ad-46c7-a611-3e0ccf721aa1",
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
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
