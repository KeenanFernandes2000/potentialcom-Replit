import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, Sparkles } from "lucide-react";

const Hero = () => {
  const scrollToVera = () => {
    const vera = document.getElementById('vera');
    if (vera) {
      const offsetTop = vera.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
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
    // Client logo image paths
    const clientLogos = [
      { name: 'Airbus', path: '/assets/images/clients/AIRBUS-logo.png' },
      { name: 'DG', path: '/assets/images/clients/DG-logo.png' },
      { name: 'Nestle', path: '/assets/images/clients/Nestle-logo.png' },
      { name: 'United Nations', path: '/assets/images/clients/UN-logo.png' },
      { name: 'Cartier', path: '/assets/images/clients/cartier-logo.png' },
      { name: 'HSBC', path: '/assets/images/clients/hsbc-logo.png' },
      { name: 'Intel', path: '/assets/images/clients/intel-logo.png' },
      { name: 'PepsiCo', path: '/assets/images/clients/pepsico-logo.png' }
    ];

    return (
      <div className="client-logos py-8" data-aos="fade-up" data-aos-delay="100">
        <h3 className="text-center text-muted-foreground uppercase text-sm tracking-wider mb-6">
          Trusted by innovative companies worldwide
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-6 items-center justify-items-center">
          {clientLogos.map((client, i) => (
            <div 
              key={i} 
              className="w-24 h-12 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
            >
              <img 
                src={client.path} 
                alt={`${client.name} logo`} 
                className="max-h-full max-w-full object-contain" 
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
      { value: "8x", label: "Faster deployment" },
      { value: "85%", label: "Cost reduction" },
      { value: "24/7", label: "AI availability" }
    ];
    
    return (
      <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex flex-col items-center md:items-start">
            <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section id="hero" className="pt-32 pb-20 bg-background relative overflow-hidden">
      <AbstractShapes />
      
      <div className="container relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-x-12 gap-y-16 mb-16">
          <div className="md:w-1/2 lg:pr-8" data-aos="fade-up">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              <span>Revolutionizing Business with AI</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="gradient-text">Expand Your Human Team</span> with <br className="hidden lg:block" />Specialized AI Agents
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              Rapidly deploy powerful AI team members who seamlessly integrate with your existing systems—backed by dedicated support to ensure instant ROI.
            </p>
            
            <QuickStats />
            
            <div className="flex flex-wrap gap-4 items-center">
              <Button 
                onClick={scrollToVera}
                className="rounded-full bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-6"
                size="lg"
              >
                Talk to Vera <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                className="rounded-full border-primary text-primary hover:bg-primary/10"
                size="lg"
              >
                View Demo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="md:w-1/2 relative" data-aos="fade-up" data-aos-delay="200">
            <div className="relative mx-auto max-w-[500px]">
              {/* Decorative elements */}
              <div className="absolute -top-5 -left-5 w-20 h-20 bg-primary/30 rounded-full blur-xl"></div>
              <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-secondary/30 rounded-full blur-xl"></div>
              
              {/* Image with glass-like border */}
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-border">
                <img 
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                  alt="Business team collaborating with AI interfaces" 
                  className="w-full h-auto object-cover rounded-2xl" 
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-40"></div>
                
                {/* Floating badge overlay */}
                <div className="absolute bottom-6 left-6 right-6 glass-effect rounded-xl p-4 text-sm">
                  <div className="font-medium">AI-powered productivity</div>
                  <div className="text-xs text-muted-foreground mt-1">Scale your team without scaling overhead</div>
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
