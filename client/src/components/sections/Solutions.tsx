import { ArrowRight, ChevronRight, CheckCircle, Server, Phone, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Solutions = () => {
  const solutions = [
    {
      title: "No-Code AI Chatbots",
      description: "Boost sales, cut costs, improve service, 24/7 — deploy without coding.",
      image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      alt: "AI Chatbot Interface",
      icon: <Server className="h-6 w-6" />,
      features: ["Custom Training", "Multi-Channel", "Analytics Dashboard"],
      color: "blue"
    },
    {
      title: "AI Voice Agents",
      description: "Automate calls and reduce operational costs with human-like voice assistants.",
      image: "https://images.unsplash.com/photo-1589254065878-42c9da997008?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      alt: "AI Voice Assistant Technology",
      icon: <Phone className="h-6 w-6" />,
      features: ["Natural Speech", "Call Transcription", "Intent Recognition"],
      color: "purple"
    },
    {
      title: "AI Workflows",
      description: "Customizable agent teams to execute complex tasks seamlessly across your organization.",
      image: "https://images.unsplash.com/photo-1607798748738-b15c40d33d57?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      alt: "AI Workflow Automation",
      icon: <BarChart3 className="h-6 w-6" />,
      features: ["Process Automation", "Cross-Department", "Custom Triggers"],
      color: "amber"
    }
  ];

  return (
    <section id="solutions" className="py-24 bg-background relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-muted/50 to-transparent"></div>
      
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Enterprise Solutions
          </div>
          <h2 className="section-title text-center">
            Our <span className="text-primary">Agentic AI</span> Solutions
          </h2>
          <p className="text-lg text-muted-foreground mt-4">
            Powerful AI solutions designed to transform your business operations with
            minimal disruption and maximum impact
          </p>
        </div>
        
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6">
          {solutions.map((solution, index) => (
            <Card 
              key={index} 
              className="glass-effect border-border rounded-xl overflow-hidden card-hover"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="relative">
                {/* Image with overlay */}
                <div className="h-48 relative">
                  <img 
                    src={solution.image} 
                    alt={solution.alt} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-70"></div>
                </div>
                
                {/* Floating icon badge */}
                <div className="absolute -bottom-6 left-6 w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
                  {solution.icon}
                </div>
              </div>
              
              <CardContent className="p-6 pt-10">
                <h3 className="text-xl font-semibold mb-3">{solution.title}</h3>
                <p className="text-muted-foreground mb-6">
                  {solution.description}
                </p>
                
                {/* Features list */}
                <ul className="space-y-2 mb-4">
                  {solution.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter className="px-6 pb-6 pt-0 flex justify-between items-center">
                <a href="#" className="text-primary font-medium flex items-center group">
                  Learn More <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
                
                <Badge variant="outline" className="bg-primary/5 border-primary/20">
                  Enterprise
                </Badge>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {/* Call to action */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-6">
            Need a customized solution for your specific business requirements?
          </p>
          <Button
            className="rounded-full bg-primary hover:bg-primary/90 text-white font-medium px-6 py-6"
            size="lg"
          >
            Schedule a Consultation <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Solutions;
