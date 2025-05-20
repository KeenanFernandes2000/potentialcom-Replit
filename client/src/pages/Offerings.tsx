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

  // Testimonials section
  const Testimonials = () => {
    const testimonials = [
      {
        quote: "The Potential platform was instrumental in our type of work, a timesaving enabler! Their great customer support and open mentality for user experience enhancement is the key success factor",
        name: "MAHA ZOUWAYHED",
        title: "ASSOCIATE DIRECTOR, TALAL AND MADIHA ZEIN AUB INNOVATION PARK",
        avatar: "https://placehold.co/120x120/e9ddff/8844dd?text=MZ"
      },
      {
        quote: "We made use of Potential.com's platform to empower Free Zones around the world by giving them access to our learning resources and helping them take action and innovate with their stakeholders.",
        name: "DR. SAMIR HAMROUNI",
        title: "CEO, WORLD FREE ZONE ORGANIZATIONS",
        avatar: "https://placehold.co/120x120/e9ddff/8844dd?text=SH"
      }
    ];

    return (
      <section id="testimonials" className="py-24 bg-muted/30">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-6">
              Testimonials
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, idx) => (
              <div 
                key={idx} 
                className="glass-effect rounded-xl p-8 border border-border shadow-md"
                data-aos="fade-up"
                data-aos-delay={idx * 100}
              >
                <div className="flex flex-col h-full">
                  <p className="text-lg font-medium mb-6 italic">
                    "{testimonial.quote}"
                  </p>
                  <div className="mt-auto flex items-center">
                    <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <p className="font-bold text-primary">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.title}</p>
                    </div>
                  </div>
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
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Offerings;