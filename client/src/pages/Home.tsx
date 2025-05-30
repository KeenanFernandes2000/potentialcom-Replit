import Header from "@/components/Header";
import Hero from "@/components/sections/Hero";
import Benefits from "@/components/sections/Benefits";
import Agents from "@/components/sections/Agents";
import Start from "@/components/sections/Start";
import Vera from "@/components/sections/Vera";
import Whitepaper from "@/components/sections/Whitepaper";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";
import { scrollToSection } from "@/lib/animations";

const Home = () => {
  const [showMobileCTA, setShowMobileCTA] = useState(false);

  // Refresh AOS animations on route change
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).AOS) {
      (window as any).AOS.refresh();
    }

    // Handle hash-based scrolling on page load
    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        const sectionId = hash.replace("#", "");
        const element = document.getElementById(sectionId);
        if (element) {
          // Add a small delay to ensure the page is fully loaded
          setTimeout(() => {
            const offsetTop =
              element.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({
              top: offsetTop,
              behavior: "smooth",
            });
          }, 100);
        }
      }
    };

    // Check for hash on initial load
    handleHashScroll();

    // Show mobile CTA after scrolling
    const handleScroll = () => {
      setShowMobileCTA(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="font-inter min-h-screen">
      <Header />
      <main>
        <Hero />
        <Benefits />
        <Agents />
        <Vera />
        <Whitepaper />
        <Start />
      </main>
      <Footer />

      {/* Mobile Sticky CTA */}
      {showMobileCTA && (
        <div className="fixed bottom-6 right-6 z-40 md:hidden">
          <Button
            className="rounded-full bg-primary hover:bg-primary/90 text-white font-semibold px-4 py-6 shadow-lg gtm-mobile-sticky-try-agent"
            size="lg"
            onClick={() => scrollToSection("agents")}
          >
            <Rocket className="mr-2 h-4 w-4" /> Try Free AI Agent
          </Button>
        </div>
      )}
    </div>
  );
};

export default Home;
