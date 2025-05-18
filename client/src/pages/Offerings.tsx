import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Platforms from "@/components/sections/Platforms";
import Solutions from "@/components/sections/Solutions";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";

const Offerings = () => {
  const [activeTab, setActiveTab] = useState("platforms");
  
  // Add Case Studies section to the offerings page
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
      <section id="case-studies" className="py-20 relative">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Success Stories
            </div>
            <h2 className="section-title mb-6">
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
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-12">
              <Link href="/">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold">Our Offerings</h1>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-12">
                <TabsTrigger value="platforms">Platforms</TabsTrigger>
                <TabsTrigger value="solutions">Solutions</TabsTrigger>
                <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
              </TabsList>
              <TabsContent value="platforms">
                <Platforms />
              </TabsContent>
              <TabsContent value="solutions">
                <Solutions />
              </TabsContent>
              <TabsContent value="case-studies">
                <CaseStudies />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Offerings;