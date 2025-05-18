import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Agents from "@/components/sections/Agents";
import Platforms from "@/components/sections/Platforms";
import Solutions from "@/components/sections/Solutions";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const Offerings = () => {
  // Case Studies section
  const CaseStudies = () => {
    const caseStudies = [
      {
        title: "Government KPI Tracking",
        description: "How a government agency used our AI agents to streamline performance tracking across departments.",
        imageSrc: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "Government"
      },
      {
        title: "Enterprise Support Automation",
        description: "Fortune 500 company reduced support costs by 75% while improving customer satisfaction.",
        imageSrc: "https://images.unsplash.com/photo-1531973576160-7125cd663d86?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "Enterprise"
      },
      {
        title: "SME Growth Acceleration",
        description: "How a small business used AI agents to scale operations without additional hiring.",
        imageSrc: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "SME"
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
                  <h3 className="text-xl font-bold mb-3">{study.title}</h3>
                  <p className="text-muted-foreground mb-4">{study.description}</p>
                  <Button variant="link" className="px-0 text-primary">
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
        <div className="container mb-12">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our AI Products</h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Explore our comprehensive range of AI solutions designed to empower your organization.
            </p>
          </div>
        </div>
        
        <Agents />
        <Platforms />
        <Solutions />
        <CaseStudies />
      </main>
      <Footer />
    </div>
  );
};

export default Offerings;