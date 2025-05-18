import { ArrowRight, ChevronRight, Building, Users, Landmark, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const Solutions = () => {
  const solutionsByProfile = [
    {
      title: "Startups & SMEs",
      description: "Launch your digital team without hiring.",
      icon: <Users className="h-6 w-6" />
    },
    {
      title: "Enterprises",
      description: "Augment your workforce with scalable agents + systems.",
      icon: <Building className="h-6 w-6" />
    },
    {
      title: "Governments & Free Zones",
      description: "Empower thousands with AI-powered programs.",
      icon: <Landmark className="h-6 w-6" />
    },
    {
      title: "Agencies",
      description: "Resell or deploy branded AI + platforms.",
      icon: <Briefcase className="h-6 w-6" />
    }
  ];

  return (
    <section id="solutions" className="py-20 bg-muted/30 relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background to-transparent"></div>
      
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Solutions
          </div>
          <h2 className="section-title text-center">
            Solutions by Profile
          </h2>
          <p className="text-xl text-muted-foreground mt-4">
            Tailored AI solutions designed for different business types and needs
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {solutionsByProfile.map((solution, index) => (
            <Card 
              key={index} 
              className="glass-effect border-border rounded-xl overflow-hidden card-hover"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >              
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {solution.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{solution.title}</h3>
                <p className="text-muted-foreground">
                  {solution.description}
                </p>
              </CardContent>
              
              <CardFooter className="px-6 pb-6 pt-0">
                <Button 
                  variant="ghost" 
                  className="text-primary font-medium p-0 hover:bg-transparent flex items-center group"
                  onClick={() => window.open('https://ai.potential.com/voice/42531902-20ad-46c7-a611-3e0ccf721aa1', '_blank', 'noopener,noreferrer')}
                >
                  Learn More <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
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
            onClick={() => window.open('https://ai.potential.com/voice/42531902-20ad-46c7-a611-3e0ccf721aa1', '_blank', 'noopener,noreferrer')}
          >
            Schedule a Consultation <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Solutions;
