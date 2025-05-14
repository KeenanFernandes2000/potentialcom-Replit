import { ArrowRight, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const SetupSpeed = () => {
  const metrics = [
    {
      title: "Hours",
      subtitle: "Not months",
      icon: <Clock className="h-5 w-5" />
    },
    {
      title: "Days",
      subtitle: "To ROI",
      icon: <Zap className="h-5 w-5" />
    },
    {
      title: "24/7",
      subtitle: "Availability",
      icon: <span className="font-mono text-xs">∞</span>
    }
  ];

  return (
    <section id="setup-speed" className="py-24 bg-secondary text-secondary-foreground overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div className="absolute -left-20 top-20 w-40 h-40 rounded-full bg-primary/20 filter blur-3xl"></div>
      <div className="absolute -right-20 bottom-20 w-60 h-60 rounded-full bg-primary/30 filter blur-3xl"></div>
      
      <div className="container relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          <div 
            className="md:w-1/2"
            data-aos="fade-right"
          >
            <div className="relative">
              {/* Decorative frame */}
              <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-primary/40 rounded-tl-lg"></div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-2 border-r-2 border-primary/40 rounded-br-lg"></div>
              
              {/* Image with overlay */}
              <div className="rounded-2xl overflow-hidden relative shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                  alt="Digital transformation visualization" 
                  className="w-full h-auto rounded-2xl" 
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-secondary/90 via-secondary/50 to-transparent"></div>
                
                {/* Overlay badge */}
                <div className="absolute bottom-6 left-6 right-6 glass-effect rounded-xl p-4 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-secondary-foreground">Rapid Deployment</div>
                      <div className="text-xs text-secondary-foreground/70">From concept to implementation in days</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div 
            className="md:w-1/2"
            data-aos="fade-left"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Get Started in <span className="text-primary">Minutes</span>
            </h2>
            <p className="text-xl mb-8 text-secondary-foreground/90">
              While others take months to implement AI solutions, our pre-built agents can be deployed in hours. 
              We've designed our platform for fast implementation and immediate value.
            </p>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              {metrics.map((metric, index) => (
                <div key={index} className="bg-primary/10 p-5 rounded-xl text-center">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                    <div className="text-primary">{metric.icon}</div>
                  </div>
                  <div className="text-3xl font-bold text-primary mb-1">{metric.title}</div>
                  <div className="text-secondary-foreground/70 text-sm">{metric.subtitle}</div>
                </div>
              ))}
            </div>
            
            <a 
              href="https://ai.potential.com/rachel"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button 
                className="rounded-full bg-primary hover:bg-primary/90 text-white font-medium"
                size="lg"
              >
                Start your Free Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SetupSpeed;
