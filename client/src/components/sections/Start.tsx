import { Button } from "@/components/ui/button";
import { RocketIcon, CalendarIcon, Users } from "lucide-react";

const Start = () => {
  return (
    <section id="start" className="py-20">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Get Started
          </div>
          <h2 className="section-title mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-muted-foreground">
            Choose the option that works best for you and begin your AI journey
            today
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
          {/* Option 1: Try Free AI Agent */}
          <div
            className="glass-effect rounded-2xl p-8 border border-border shadow-md text-center"
            data-aos="fade-up"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
              <RocketIcon className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold mb-3">Try Free AI Agent</h3>
            <p className="text-muted-foreground mb-6">
              Test our prebuilt chatbot with no commitment and see immediate
              results.
            </p>
            <Button
              className="rounded-full bg-primary hover:bg-primary/90 text-white font-semibold px-8 w-full gtm-start-try-free-agent"
              size="lg"
              onClick={() =>
                window.open(
                  "https://ai.potential.com/login?utm_source=bot&utm_medium=main",
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            >
              Try Free AI Agent
            </Button>
          </div>

          {/* Option 2: Book a Demo */}
          <div
            className="glass-effect rounded-2xl p-8 border border-border shadow-md text-center"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
              <CalendarIcon className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold mb-3">Talk to AI Consultant</h3>
            <p className="text-muted-foreground mb-6">
              Talk now with our AI consultant to explore how you can harness the
              power of AI.
            </p>
            <Button
              className="rounded-full bg-primary hover:bg-primary/90 text-white font-semibold px-8 w-full gtm-start-talk-to-consultant"
              size="lg"
              onClick={() =>
                window.open(
                  "https://ai.potential.com/voice/42531902-20ad-46c7-a611-3e0ccf721aa1",
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            >
              Talk to AI Consultant
            </Button>
          </div>

          {/* Option 3: Become a Partner */}
          <div
            className="glass-effect rounded-2xl p-8 border border-border shadow-md text-center"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
              <Users className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold mb-3">Become a Partner</h3>
            <p className="text-muted-foreground mb-6">
              Join our partner program to resell or implement our solutions.
            </p>
            <Button
              className="rounded-full bg-primary hover:bg-primary/90 text-white font-semibold px-8 w-full gtm-start-become-partner"
              size="lg"
              onClick={() => {
                window.location.href = "/partner";
              }}
            >
              Become a Partner
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Start;
