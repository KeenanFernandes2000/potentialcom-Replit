import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, ChevronDown } from "lucide-react";

const CTAFooter = () => {
  // Function to go to Rachel's page
  const goToRachel = () => {
    window.open('https://ai.potential.com/rachel', '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="cta-footer" className="py-24 bg-secondary dark:bg-secondary/90 text-secondary-foreground relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 dark:opacity-5 pointer-events-none"></div>
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-primary/5 to-transparent"></div>
      <div className="absolute -top-40 right-10 w-80 h-80 bg-primary/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
      
      <div className="container relative z-10 text-center">
        <div 
          className="mx-auto max-w-3xl glass-effect p-10 rounded-3xl border border-primary/20 shadow-lg"
          data-aos="fade-up"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium mb-6">
            <MessageCircle className="h-4 w-4 mr-2" /> 
            <span>Ready to Transform Your Business?</span>
          </div>
          
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-foreground"
            data-aos="fade-up"
          >
            Get Started with <span className="text-primary">Rachel</span> – Your AI Growth Partner!
          </h2>
          
          <p 
            className="text-xl mb-10 max-w-2xl mx-auto text-muted-foreground"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Ready to transform your business with AI? Let Rachel guide you through the perfect solution for your needs. Our team will help you implement the right AI agents for your specific challenges.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              onClick={goToRachel}
              className="rounded-full bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-6 shadow-lg"
              size="lg"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              Talk to Rachel <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              className="rounded-full border-primary/30 text-foreground hover:bg-primary/10 px-8 py-6"
              size="lg"
              data-aos="fade-up"
              data-aos-delay="250"
            >
              Schedule a Demo
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div 
            className="mt-8 pt-8 border-t border-secondary-foreground/10 flex flex-wrap justify-center gap-8"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path><path d="m14.5 9-5 5"></path><path d="m9.5 9 5 5"></path></svg>
              </div>
              <div className="text-left">
                <div className="font-medium">Enterprise Ready</div>
                <div className="text-xs text-muted-foreground">SOC 2 Compliant</div>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 19a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v12Z"></path><path d="M14 2h4a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1h-4"></path><path d="M9 11v5"></path><path d="M9 11a2 2 0 0 0-2-2"></path><path d="M9 11a2 2 0 0 1-2 2"></path></svg>
              </div>
              <div className="text-left">
                <div className="font-medium">No Lock-In</div>
                <div className="text-xs text-muted-foreground">Easy API Integration</div>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
              </div>
              <div className="text-left">
                <div className="font-medium">24/7 Support</div>
                <div className="text-xs text-muted-foreground">Always Available</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Subtle scroll down indicator */}
        <div className="mt-12 animate-bounce">
          <ChevronDown className="h-6 w-6 mx-auto text-primary/50" />
        </div>
      </div>
    </section>
  );
};

export default CTAFooter;
