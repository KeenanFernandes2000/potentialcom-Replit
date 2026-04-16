import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { CalendarCheck, Clock, Video, Shield } from "lucide-react";

export default function Book() {
  useEffect(() => {
    const existing = document.querySelector(
      'script[src="https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js"]',
    );
    if (!existing) {
      const script = document.createElement("script");
      script.src =
        "https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js";
      script.type = "text/javascript";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Book a Meeting | Potential.com"
        description="Schedule a free consultation to design and launch impactful National Resilience Programs"
      />
      <Header />
      <section className="pt-28 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/20 rounded-full blur-3xl opacity-20" />

        <div className="container relative z-10">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-primary/10 rounded-full mb-4">
              <CalendarCheck className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Book a <span className="gradient-text">Meeting</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">Schedule a free consultation with our team to explore how Potential.com can support you in designing and launching your National Resilience Programs.</p>
          </div>

          <div className="max-w-4xl mx-auto bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
            <div
              className="meetings-iframe-container"
              data-src="https://meetings-eu1.hubspot.com/rawzaba?embed=true"
              style={{ minHeight: "660px" }}
            />
          </div>
        </div>
      </section>
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center p-6">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Quick & Easy</h3>
              <p className="text-muted-foreground text-sm">
                Pick a time that works for you. Our scheduling is simple and
                flexible.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Virtual Meeting</h3>
              <p className="text-muted-foreground text-sm">
                Connect with our experts from anywhere via video call. No travel
                needed.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No Commitment</h3>
              <p className="text-muted-foreground text-sm">
                A free, no-obligation consultation to understand your needs and
                goals.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
