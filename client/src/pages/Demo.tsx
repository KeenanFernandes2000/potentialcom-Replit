import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { RubyChat } from "@/components/ruby/RubyChat";
import { Button } from "@/components/ui/button";
import {
  Check,
  ShoppingBag,
  Calendar,
  GraduationCap,
  Heart,
  Mic,
  ArrowRight,
  Zap,
  MessageCircle,
  Layers,
} from "lucide-react";

// Customer logos — reuse the curated subset that already lives in
// Home.tsx so the demo page borrows the same trust-strip credibility
// as the marketing site. Six brands picked for global recognizability.
import microsoftLogo from "@assets/Customer Logos/Microsoft logo.png";
import googleLogo from "@assets/Customer Logos/Google logo.png";
import visaLogo from "@assets/Customer Logos/Visa logo.png";
import nestleLogo from "@assets/Customer Logos/Nestle Logo.png";
import cartierLogo from "@assets/Customer Logos/Cartier logo.png";
import hsbcLogo from "@assets/Customer Logos/HSBC logo.png";
import inditexLogo from "@assets/Customer Logos/Inditex logo.png";
import pepsicoLogo from "@assets/Customer Logos/Pepsico logo.png";
import {
  SiShopify,
  SiStripe,
  SiHubspot,
  SiSalesforce,
  SiTwilio,
  SiSlack,
  SiZapier,
  SiNotion,
  SiAmazon,
  SiGooglecloud,
  SiMailchimp,
} from "react-icons/si";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

const Demo = () => {
  const { toast } = useToast();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied!", description: "Text copied to clipboard" });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Refresh AOS animations on page load.
    if (typeof window !== "undefined" && (window as any).AOS) {
      (window as any).AOS.refresh();
    }
  }, []);

  const detailedUseCases = [
    {
      id: "shopping",
      emoji: "🛍️",
      title: "Shopping & Product Assistance",
      tagline:
        "Personalized product discovery, image recognition, and seamless order management.",
      actions: [
        "Step 1 — Discover Products",
        '"Hey Ruby, can you show me some great lipsticks I can buy?"',
        "Step 2 — Add to Cart",
        '"I love the [product name] you suggested. Please add it to my cart."',
        "Step 3 — Visual Product Suggestions",
        '"Ruby, can you recommend products similar to the one in this picture?"',
        "Step 5 — Track My Order",
        '"Where is my order? I want to track the delivery status. My order number is #2099 and my email address is karen_3kl@outlook.com"',
        "Step 6 — Discounts",
        '"Are there any discount coupons available for me?"',
      ],
    },
    {
      id: "booking",
      emoji: "💄",
      title: "Book Skincare Experts & Makeup Artists",
      tagline:
        "Connect with beauty professionals and schedule consultations effortlessly.",
      actions: [
        "Step 1: Discover Experts",
        '"I have an upcoming event and need a makeup expert."',
        '"Can you show me some skilled skincare experts?"',
        "Step 2: Check Consultation Prices",
        '"How much does [Expert Name] charge?"',
        "Step 3: Book an Appointment",
        '"I\'d like to book an appointment with [Expert Name]."',
      ],
    },
    // {
    //   id: "learning",
    //   emoji: "🎓",
    //   title: "Learning & Beauty Courses",
    //   tagline: "Master beauty skills with guided courses and track your certification progress.",
    //   actions: [
    //     "Share available makeup and skincare courses",
    //     "Track learner progress and completion",
    //     "Recommend the next lesson or topic",
    //     "Share certifications and event schedules",
    //   ],
    //   prompts: [
    //     "What courses do you offer about skincare?",
    //     "What is my progress to get the Makeup Artist Certification?",
    //     "Recommend what I should learn next.",
    //     "Email me my course certificate.",
    //   ],
    // },
    // {
    //   id: "hr",
    //   emoji: "👩‍💼",
    //   title: "HR & Career at Alora",
    //   tagline: "Explore career opportunities and experience AI-powered interview assistance.",
    //   actions: [
    //     "Display open job positions",
    //     "Conduct pre-screening interview questions",
    //     "Evaluate candidate responses and provide a score",
    //     "Explain company culture and benefits",
    //   ],
    //   prompts: [
    //     "Are there any open jobs at Alora?",
    //     "Interview me for the Marketing Manager role.",
    //     "Tell me about Alora's work culture.",
    //   ],
    // },
    {
      id: "support",
      emoji: "💌",
      title: "Customer Support & Engagement",
      tagline:
        "Quick answers to FAQs, hassle-free returns, and seamless escalation to human support.",
      actions: [
        '"I received the wrong shade — how do I return it?"',
        '"Do you test your products on animals?"',
      ],
    },
    // {
    //   id: "automation",
    //   emoji: "⚙️",
    //   title: "System & Automation",
    //   tagline: "Build custom AI agents tailored to your business needs.",
    //   actions: [
    //     "Build new AI Agents",
    //   ],
    //   prompts: [
    //     "I want to create an AI Chatbot for my business.",
    //     "I want to create an AI Voice Agent for my business.",
    //   ],
    // },
  ];

  const integrations = [
    { name: "Shopify", icon: SiShopify },
    { name: "Stripe", icon: SiStripe },
    { name: "HubSpot", icon: SiHubspot },
    { name: "Salesforce", icon: SiSalesforce },
    { name: "Mailchimp", icon: SiMailchimp },
    { name: "Twilio", icon: SiTwilio },
    { name: "Slack", icon: SiSlack },
    { name: "Zapier", icon: SiZapier },
    { name: "Notion", icon: SiNotion },
    { name: "AWS", icon: SiAmazon },
    { name: "Google Cloud", icon: SiGooglecloud },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="AI Agent Demo - Ruby | Potential.com"
        description="Experience Ruby, our interactive AI agent demo. Chat with Ruby to shop products, book beauty experts, learn, and get customer support — a live look at Potential.com AI agents."
      />
      <Header />

      {/* Hero — matches the Vera/Ayla brand pattern:
         left = "Hello, I'm [Name], Your AI [role]" headline + subhead
         + primary CTA, right = the visual focal element. For Ruby the
         right side is the LIVE chat panel (instead of an avatar image).
         Background uses the brand's signature blurred decorative orbs
         in primary/accent at low opacity. AOS fade-up on entrance. */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 py-20 lg:py-28">
        {/* Background decoration — matches Vera.tsx exactly. Two
            soft blurred orbs in brand colors, low opacity. */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-20 w-64 h-64 opacity-20 dark:opacity-5 blur-3xl">
            <div className="w-full h-full rounded-full bg-primary" />
          </div>
          <div className="absolute bottom-20 right-20 w-80 h-80 opacity-15 dark:opacity-5 blur-3xl">
            <div className="w-full h-full rounded-full bg-accent" />
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:items-center">
            {/* Left: brand-pattern headline + CTA */}
            <div className="space-y-8" data-aos="fade-up">
              <div className="space-y-6">
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                  Hello, I'm Ruby,
                  <br />
                  <span className="text-primary">
                    Your AI Beauty Concierge
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                  Chat or talk to me, and I'll help you shop products,
                  book beauty experts, take courses, and answer support
                  questions — completely free.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-6 text-lg"
                  onClick={() => {
                    document
                      .querySelector("[data-testid='agent-chat-shell']")
                      ?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  data-testid="hero-start-cta"
                >
                  Start Chatting with Ruby
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mic className="h-4 w-4 text-primary" />
                  or tap voice in the chat to talk in real time
                </div>
              </div>

              {/* Try-this chips — let users dispatch a prompt into the
                  chat without typing. Brand styling: subtle border,
                  white card surface, primary hover. */}
              <div className="space-y-3">
                <div className="text-sm font-medium text-foreground">
                  Try one of these
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Show me lipsticks",
                    "Find me a makeup expert",
                    "Any discount codes today?",
                    "Help me return a product",
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() =>
                        window.dispatchEvent(
                          new CustomEvent("ruby:send", {
                            detail: { prompt, agentKey: "ruby" },
                          }),
                        )
                      }
                      className="rounded-full bg-primary/10 text-primary px-4 py-2 text-sm border border-primary/20 hover:bg-primary/20 transition-colors"
                      data-testid={`hero-try-${prompt.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Capability mini-links (anchors to the accordion below) */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2 text-sm text-muted-foreground">
                {[
                  { icon: ShoppingBag, label: "Shop", target: "shopping" },
                  { icon: Calendar, label: "Book", target: "booking" },
                  { icon: GraduationCap, label: "Learn", target: "support" },
                  { icon: Heart, label: "Support", target: "support" },
                ].map((cap) => {
                  const Icon = cap.icon;
                  return (
                    <a
                      key={cap.label}
                      href={`#use-case-${cap.target}`}
                      className="flex items-center gap-1.5 transition-colors hover:text-primary"
                      data-testid={`capability-${cap.label.toLowerCase()}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{cap.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Right: the live chat panel as the visual focal point */}
            <div
              className="flex justify-center lg:justify-end"
              data-aos="fade-up"
              data-aos-delay="150"
            >
              <div className="w-full max-w-xl lg:min-h-[720px]">
                <RubyChat />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats band — credibility density right under the hero.
         Four cells, each with an icon + a number/lead + a one-line
         caption. Brand-consistent: bordered card style same as
         integrations. Subtle bg shift so it visually separates from
         the hero gradient. */}
      <section className="border-y border-border bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
            {[
              {
                icon: Layers,
                lead: "10+",
                caption: "live tools — products, bookings, courses, support",
              },
              {
                icon: Zap,
                lead: "<1s",
                caption: "average response from query to answer",
              },
              {
                icon: Mic,
                lead: "Live voice",
                caption: "real-time spoken conversation, not playback",
              },
              {
                icon: MessageCircle,
                lead: "24/7",
                caption: "always on — text or voice, any channel",
              },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 px-6 py-6 lg:py-8"
                  data-testid={`stat-${idx}`}
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-lg font-bold text-foreground leading-tight">
                      {stat.lead}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 leading-snug">
                      {stat.caption}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust strip — "powered by the same platform trusted by".
         Borrows the exact customer-logo treatment from Home.tsx, scaled
         down. Builds enterprise credibility before scrolling into the
         deeper capability content. */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <p
            className="text-center text-sm uppercase tracking-widest text-muted-foreground mb-8"
            data-aos="fade-up"
          >
            Built on the Potential platform — trusted by teams at
          </p>
          <div
            className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 opacity-70 grayscale"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            {[
              { src: microsoftLogo, alt: "Microsoft" },
              { src: googleLogo, alt: "Google" },
              { src: visaLogo, alt: "Visa" },
              { src: nestleLogo, alt: "Nestle" },
              { src: cartierLogo, alt: "Cartier" },
              { src: hsbcLogo, alt: "HSBC" },
              { src: inditexLogo, alt: "Inditex" },
              { src: pepsicoLogo, alt: "PepsiCo" },
            ].map((logo) => (
              <img
                key={logo.alt}
                src={logo.src}
                alt={logo.alt}
                className="h-7 sm:h-8 w-auto object-contain"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: What Ruby Can Do */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              What <span className="gradient-text">Ruby</span> Can Do
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your smart beauty companion connected to Alora Brands — ready to
              help customers shop, learn, book, and grow.
            </p>
          </div>

          <div
            className="max-w-5xl mx-auto space-y-4"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <Accordion type="single" collapsible className="space-y-4">
              {detailedUseCases.map((useCase, idx) => (
                <AccordionItem
                  key={useCase.id}
                  id={`use-case-${useCase.id}`}
                  value={useCase.id}
                  className="bg-card border border-border rounded-xl px-6 hover:border-primary/30 data-[state=open]:border-primary/40 data-[state=open]:shadow-lg transition-all scroll-mt-24"
                >
                  <AccordionTrigger className="hover:no-underline py-6">
                    <div className="flex items-center gap-5 text-left">
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-3xl">
                        {useCase.emoji}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">
                          {useCase.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {useCase.tagline}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <div className="space-y-6 pt-4">
                      {/* Agentic Actions / Quick Action Guide */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Check className="h-5 w-5 text-primary" />
                          {useCase.id === "shopping" ||
                          useCase.id === "booking" ||
                          useCase.id === "support"
                            ? "Quick Action Guide"
                            : "Agentic Actions"}
                        </h4>
                        {useCase.id === "shopping" ||
                        useCase.id === "booking" ||
                        useCase.id === "support" ? (
                          <div className="space-y-2 ml-7">
                            {useCase.actions.map((action, actionIdx) => {
                              // Check if this is a step header (starts with "Step")
                              const isStepHeader = action.startsWith("Step");
                              // Check if this is a quoted prompt (starts with quote)
                              const isQuotedPrompt =
                                action.startsWith('"') ||
                                action.startsWith("'");
                              // Check if this is a prompt with prefix (Prompt A:, Prompt B:, Prompt:)
                              const isPromptWithPrefix =
                                /^(Prompt [A-Z]:|Prompt:)/.test(action);

                              if (isStepHeader) {
                                return (
                                  <div
                                    key={actionIdx}
                                    className="mt-4 first:mt-0"
                                  >
                                    <span className="font-bold text-foreground">
                                      {action}
                                    </span>
                                  </div>
                                );
                              } else if (isQuotedPrompt) {
                                // Remove quotes for display and copy
                                const textWithoutQuotes = action.replace(
                                  /^["']|["']$/g,
                                  "",
                                );
                                return (
                                  <div
                                    key={actionIdx}
                                    onClick={() =>
                                      copyToClipboard(textWithoutQuotes)
                                    }
                                    className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer inline-block ml-4"
                                  >
                                    {action}
                                  </div>
                                );
                              } else if (isPromptWithPrefix) {
                                // Extract the quoted text for copying (remove prefix and quotes)
                                const quotedMatch =
                                  action.match(/["']([^"']+)["']/);
                                const textToCopy = quotedMatch
                                  ? quotedMatch[1]
                                  : action;
                                return (
                                  <div
                                    key={actionIdx}
                                    onClick={() => copyToClipboard(textToCopy)}
                                    className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer inline-block ml-4"
                                  >
                                    {action}
                                  </div>
                                );
                              } else {
                                return (
                                  <div
                                    key={actionIdx}
                                    className="text-muted-foreground ml-4"
                                  >
                                    {action}
                                  </div>
                                );
                              }
                            })}
                          </div>
                        ) : (
                          <ul className="space-y-2 ml-7">
                            {useCase.actions.map((action, actionIdx) => (
                              <li
                                key={actionIdx}
                                className="text-muted-foreground flex items-start gap-2"
                              >
                                <span className="text-primary mt-1">•</span>
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Sample Prompts */}
                      {useCase.id !== "shopping" &&
                        useCase.id !== "booking" &&
                        useCase.id !== "support" &&
                        (useCase as any).prompts &&
                        (useCase as any).prompts.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3">
                              🗣️ Try Asking:
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {(useCase as any).prompts.map(
                                (prompt: string, promptIdx: number) => (
                                  <div
                                    key={promptIdx}
                                    onClick={() => copyToClipboard(prompt)}
                                    className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
                                    data-testid={`prompt-${useCase.id}-${promptIdx}`}
                                  >
                                    {prompt}
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Section 3: Integrations */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Connected with <span className="gradient-text">Your Tools</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Integrate once. Empower everywhere.
            </p>
          </div>

          <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-4xl mx-auto"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            {integrations.map((integration, idx) => {
              const IconComponent = integration.icon;
              return (
                <div
                  key={idx}
                  className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col items-center justify-center gap-3"
                  data-testid={`integration-${idx}`}
                >
                  <IconComponent className="text-4xl text-foreground/70 group-hover:text-primary transition-colors" />
                  <span className="text-xs text-muted-foreground text-center">
                    {integration.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA banner — matches the gradient navy → purple banner
         used across Home.tsx. Closes the page with a clear next step:
         this isn't just a Ruby demo — it's a proof point for the
         Potential platform, and you can build YOUR version. */}
      <section
        className="py-20 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0B1846 0%, #1a2a6c 40%, #8844DD 100%)",
        }}
      >
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6" data-aos="fade-up">
            <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
              Want a Ruby for your brand?
            </h2>
            <p className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto">
              Ruby was built on the Potential platform — same agents
              powering Vera, Ayla, Lumi, and enterprise AI in
              production today. Yours can ship just as fast.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button
                size="lg"
                className="rounded-full bg-white text-[#0B1846] hover:bg-white/90 font-semibold px-10 py-6 text-lg shadow-lg"
                onClick={() => (window.location.href = "/book")}
                data-testid="cta-book-demo"
              >
                Book a Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-white/40 bg-white/10 text-white hover:bg-white/20 font-semibold px-8 py-6 text-lg"
                onClick={() => (window.location.href = "/ai-agents")}
                data-testid="cta-build-agent"
              >
                Build Your AI Agent
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <Toaster />
    </div>
  );
};

export default Demo;
