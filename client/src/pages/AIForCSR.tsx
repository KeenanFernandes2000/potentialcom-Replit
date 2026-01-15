import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const AIForCSR = () => {
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).AOS) {
      (window as any).AOS.refresh();
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="AI for CSR | Corporate Social Responsibility Technology Platform"
        description="Transform your corporate social responsibility initiatives with AI-powered technology. Streamline impact measurement, stakeholder engagement, and sustainability reporting."
        keywords="CSR technology, corporate social responsibility, AI for sustainability, impact measurement, ESG reporting, stakeholder engagement"
      />
      <Header />

      <main className="pt-20">
        {/* Hero Section Placeholder */}
        <section className="relative py-20 md:py-28 bg-gradient-to-br from-background via-accent/20 to-background overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-50"></div>
          <div className="container relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <span className="inline-block px-4 py-2 mb-6 text-sm font-medium text-primary bg-primary/10 rounded-full">
                AI-Powered CSR Platform
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Hero Section
                <span className="gradient-text block mt-2">Content Coming Soon</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                This section will contain the main value proposition and call-to-action for your CSR technology platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-6">
                  Primary CTA
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  Secondary CTA
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 1 Placeholder */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="section-title">Section 1</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Content section placeholder - ready for your content
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="p-6 rounded-xl border border-border bg-card card-hover"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <span className="text-primary font-bold">{item}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Feature {item}</h3>
                  <p className="text-muted-foreground">
                    Feature description placeholder ready for your content.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2 Placeholder */}
        <section className="py-16 md:py-24 bg-secondary/5">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block px-3 py-1 mb-4 text-sm font-medium text-primary bg-primary/10 rounded-full">
                  Section Label
                </span>
                <h2 className="section-title">Section 2</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Two-column content section placeholder - ideal for feature highlights or case studies.
                </p>
                <ul className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary text-sm">✓</span>
                      </div>
                      <span className="text-foreground">Benefit point {item} placeholder</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-card rounded-2xl border border-border p-8 flex items-center justify-center min-h-[300px]">
                <span className="text-muted-foreground">Image/Visual placeholder</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3 Placeholder */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="section-title">Section 3</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Content section placeholder - ready for your content
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="p-6 rounded-xl border border-border bg-card text-center card-hover"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">{item}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Item {item}</h3>
                  <p className="text-muted-foreground text-sm">
                    Description placeholder
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section Placeholder */}
        <section className="py-16 md:py-24 bg-gradient-to-r from-primary/10 via-accent/20 to-primary/10">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="section-title">Call to Action Section</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Final conversion section placeholder - ready for your compelling CTA content.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-6">
                  Get Started
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AIForCSR;
