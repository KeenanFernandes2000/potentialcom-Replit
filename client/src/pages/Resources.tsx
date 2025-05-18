import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Learn from "@/components/sections/Learn";
import { useEffect } from "react";

const Resources = () => {
  // Refresh AOS animations on route change
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).AOS) {
      (window as any).AOS.refresh();
    }
  }, []);

  return (
    <div className="font-inter min-h-screen">
      <Header />
      <main className="pt-32">
        <div className="container mb-10">
          <h1 className="text-4xl font-bold mb-4">Resources</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Explore our educational resources and learn how AI can transform your business operations.
          </p>
        </div>
        <Learn />
      </main>
      <Footer />
    </div>
  );
};

export default Resources;