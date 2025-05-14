import { Card, CardContent } from "@/components/ui/card";
import { Check, ChevronRight, LightbulbIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const GettingStarted = () => {
  const steps = [
    {
      number: "01",
      title: "Select Your Agent",
      description: "Choose from 100+ templates designed for specific business functions"
    },
    {
      number: "02",
      title: "Customize & Integrate",
      description: "Connect to existing workflows and tailor the agent to your needs"
    },
    {
      number: "03",
      title: "Measure Immediate Impact",
      description: "Track performance and ROI in real-time with our dashboard"
    }
  ];

  const features = [
    {
      title: "Simple Setup",
      description: "We handle the technical complexity so you can focus on results"
    },
    {
      title: "Instant Results",
      description: "See productivity improvements from day one"
    },
    {
      title: "AI Adoption Support",
      description: "Dedicated team helps your staff embrace AI collaboration"
    }
  ];

  return (
    <section id="getting-started" className="py-24 bg-muted/30 dark:bg-secondary/5 relative">
      {/* Decorative element */}
      <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-grid-pattern -z-0 opacity-30 pointer-events-none"></div>
      
      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <LightbulbIcon className="h-4 w-4 mr-2" /> Easy Implementation
          </div>
          <h2 className="section-title text-center">
            Get Started with <span className="text-primary">AI Agents</span>
          </h2>
          <p className="text-lg text-muted-foreground mt-4">
            A simple three-step process to transform your business operations with AI
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 mb-16">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="relative"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              {/* Connect steps with line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[calc(50%+2rem)] right-0 h-0.5 bg-gradient-to-r from-primary/50 to-primary/10 z-0"></div>
              )}
              
              <div className="text-center relative z-10">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <div className="text-primary text-2xl font-bold font-mono">{step.number}</div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <Card 
          className="glass-effect border border-border rounded-2xl"
          data-aos="fade-up"
        >
          <CardContent className="p-8 md:p-12">
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col items-center md:items-start text-center md:text-left">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Check className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-16 text-center">
          <a 
            href="https://ai.potential.com/rachel"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button 
              className="rounded-full bg-primary hover:bg-primary/90 text-white font-medium px-8 py-6"
              size="lg"
            >
              Start Your AI Journey <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default GettingStarted;
