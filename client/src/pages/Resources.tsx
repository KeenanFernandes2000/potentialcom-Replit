import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Whitepaper from "@/components/sections/Whitepaper";
import BecomePartner from "@/components/sections/BecomePartner";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const Resources = () => {
  // Case Studies section
  const CaseStudies = () => {
    const caseStudies = [
      {
        title: "Tatawwar: Building Tomorrow's Minds",
        description: "Transformative educational initiative with HSBC that connected students, teachers, and businesses to address UN Sustainable Development Goals.",
        imageSrc: "https://placehold.co/800x400/e6f7ff/0066cc?text=HSBC+Partnership",
        category: "Education",
        partner: "HSBC"
      },
      {
        title: "The Entrepreneurial Nation",
        description: "Revolutionary program that equipped SMEs and startups with AI-powered tools to rapidly scale operations and accelerate business growth.",
        imageSrc: "https://placehold.co/800x400/f5f5f5/333333?text=Ministry+of+Economy",
        category: "SME Development",
        partner: "Ministry of Economy"
      },
      {
        title: "Maliyat Financial Literacy",
        description: "Groundbreaking CSR initiative with Bank Muscat that empowered youth with essential financial skills for economic independence.",
        imageSrc: "https://placehold.co/800x400/f9f9f9/c41230?text=Bank+Muscat+Initiative",
        category: "Financial Education",
        partner: "Bank Muscat"
      },
      {
        title: "Cartier Women's Initiative",
        description: "Global entrepreneurship competition that identified and accelerated women-led ventures addressing critical global challenges.",
        imageSrc: "https://placehold.co/800x400/000000/ffffff?text=Cartier+Women's+Initiative",
        category: "Women Empowerment",
        partner: "Cartier"
      }
    ];

    return (
      <section id="case-studies" className="py-24 relative">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Success Stories
            </div>
            <h2 className="text-3xl font-bold mb-6">
              Real-World Case Studies
            </h2>
            <p className="text-xl text-muted-foreground">
              See how organizations are transforming with our AI solutions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {caseStudies.map((study, idx) => (
              <div 
                key={idx} 
                className="glass-effect rounded-xl overflow-hidden border border-border shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                data-aos="fade-up"
                data-aos-delay={idx * 100}
              >
                <div className="h-48 relative">
                  <img 
                    src={study.imageSrc} 
                    alt={study.title} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute top-4 right-4 rounded-full bg-primary/80 text-white px-3 py-1 text-xs font-medium">
                    {study.category}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold">{study.title}</h3>
                    <div className="text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded-full">
                      with {study.partner}
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">{study.description}</p>
                  <Button 
                    variant="link" 
                    className="px-0 text-primary"
                    onClick={() => window.open('https://ai.potential.com/voice/42531902-20ad-46c7-a611-3e0ccf721aa1', '_blank', 'noopener,noreferrer')}
                  >
                    Read full case study
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

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
        <Whitepaper />
        <CaseStudies />
        <BecomePartner />
      </main>
      <Footer />
    </div>
  );
};

export default Resources;