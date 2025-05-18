import Header from "@/components/Header";
import Hero from "@/components/sections/Hero";
import Benefits from "@/components/sections/Benefits";
import Agents from "@/components/sections/Agents";
import Pricing from "@/components/sections/Pricing";
import Start from "@/components/sections/Start";
import Vera from "@/components/sections/Vera";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";

const Home = () => {
  const [showMobileCTA, setShowMobileCTA] = useState(false);

  // Refresh AOS animations on route change
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).AOS) {
      (window as any).AOS.refresh();
    }
    
    // Show mobile CTA after scrolling
    const handleScroll = () => {
      setShowMobileCTA(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="font-inter min-h-screen">
      <Header />
      <main>
        <Hero />
        <Benefits />
        <Agents />
        <Pricing />
        <Vera />
        <Start />
      </main>
      <Footer />
      
      {/* Mobile Sticky CTA */}
      {showMobileCTA && (
        <div className="fixed bottom-6 right-6 z-40 md:hidden">
          <Button 
            className="rounded-full bg-primary hover:bg-primary/90 text-white font-semibold px-4 py-6 shadow-lg"
            size="lg"
          >
            <Rocket className="mr-2 h-4 w-4" /> Try Free AI Agent
          </Button>
        </div>
      )}
    </div>
  );
};

export default Home;
