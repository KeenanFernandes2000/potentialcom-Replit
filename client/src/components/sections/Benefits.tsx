import { Rocket, Puzzle, HeadphonesIcon, Scale, BookOpen, History, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Benefits = () => {
  const benefits = [
    {
      icon: <Rocket className="h-10 w-10" />,
      title: "Instant Productivity",
      description: "Ready in hours, not months. Get your AI agents up and running quickly."
    },
    {
      icon: <Puzzle className="h-10 w-10" />,
      title: "Seamless Integration",
      description: "Bolt-on to existing APIs and systems without disrupting workflows."
    },
    {
      icon: <HeadphonesIcon className="h-10 w-10" />,
      title: "Fully Supported Setup",
      description: "Dedicated team onboarding ensures a smooth transition to AI-powered workflows."
    },
    {
      icon: <Scale className="h-10 w-10" />,
      title: "Modular & Scalable",
      description: "Pricing grows with use-cases, allowing you to scale at your own pace."
    },
    {
      icon: <BookOpen className="h-10 w-10" />,
      title: "Pre-built Expertise",
      description: "100+ agent templates across Leadership, Sales, Operations, and more."
    },
    {
      icon: <History className="h-10 w-10" />,
      title: "20 Years of Empowerment",
      description: "Backed by two decades of experience in organizational transformation."
    }
  ];

  return (
    <section id="benefits" className="py-24 bg-muted/50 dark:bg-secondary/10">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Our Advantages
          </div>
          <h2 className="section-title text-center">
            Why Businesses Choose <span className="text-primary">Our AI Agents</span>
          </h2>
          <p className="text-lg text-muted-foreground mt-4">
            Modern solutions designed to transform your business operations with
            minimal disruption and maximum impact.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="glass-effect border border-border p-8 rounded-xl card-hover"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-lg bg-primary/10 text-primary mb-6">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
              <p className="text-muted-foreground mb-6">{benefit.description}</p>
              <Button
                variant="link"
                className="p-0 h-auto font-medium text-primary flex items-center group"
              >
                Learn more <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Button 
            className="rounded-full bg-primary hover:bg-primary/90 text-white font-medium px-8 py-6"
            size="lg"
          >
            Explore All Features
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
