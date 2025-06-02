import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PricingSection from "@/components/sections/Pricing";
import { useEffect } from "react";
import { AutoSEO } from "@/components/SEO";

const Pricing = () => {
  // Refresh AOS animations on route change
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).AOS) {
      (window as any).AOS.refresh();
    }
  }, []);

  return (
    <div className="font-inter min-h-screen">
      <AutoSEO />
      <Header />
      <main className="pt-32">
        <div className="container mb-10">
          <h1 className="text-4xl font-bold mb-4">Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Flexible plans designed to fit your business needs, from startups to
            enterprise organizations.
          </p>
        </div>
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
