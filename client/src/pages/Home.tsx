import Header from "@/components/Header";
import Hero from "@/components/sections/Hero";
import Benefits from "@/components/sections/Benefits";
import Tools from "@/components/sections/Tools";
import GettingStarted from "@/components/sections/GettingStarted";
import SetupSpeed from "@/components/sections/SetupSpeed";
import Rachel from "@/components/sections/Rachel";
import Stats from "@/components/sections/Stats";
import Solutions from "@/components/sections/Solutions";
import SalesBoost from "@/components/sections/SalesBoost";
import Architecture from "@/components/sections/Architecture";
import Whitepaper from "@/components/sections/Whitepaper";
import CTAFooter from "@/components/sections/CTAFooter";
import Footer from "@/components/Footer";
import { useEffect } from "react";

const Home = () => {
  // Refresh AOS animations on route change
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).AOS) {
      (window as any).AOS.refresh();
    }
  }, []);

  return (
    <div className="font-inter min-h-screen">
      <Header />
      <main>
        <Hero />
        <Benefits />
        <Tools />
        <GettingStarted />
        <SetupSpeed />
        <Rachel />
        <Stats />
        <Solutions />
        <SalesBoost />
        <Architecture />
        <Whitepaper />
        <CTAFooter />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
