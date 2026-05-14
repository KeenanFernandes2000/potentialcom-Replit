import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { RubyChat } from "@/components/ruby/RubyChat";
import {
  ChevronDown,
  Check,
} from "lucide-react";
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
        description="Experience Ruby, our interactive AI agent demo. Try Chat, Voice, and Avatar interfaces for E-Commerce, Sales, Learning, Healthcare, and HR use cases."
      />
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/20 rounded-full blur-3xl opacity-20" />

        <div className="container relative z-10">
          {/* Title and subtitle */}
          <div className="text-center mb-12" data-aos="fade-up">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Meet <span className="gradient-text">Ruby</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Your All-in-One Demo AI Agent — Ready to Talk, Listen, and Act.
            </p>
          </div>

          {/* Native chat interface */}
          <div data-aos="fade-up" data-aos-delay="200">
            <RubyChat />
          </div>

          {/* Scroll indicator */}
          <div className="flex justify-center mt-16 animate-bounce">
            <ChevronDown className="h-8 w-8 text-muted-foreground" />
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
                  value={useCase.id}
                  className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-lg transition-all"
                >
                  <AccordionTrigger className="hover:no-underline py-6">
                    <div className="flex items-center gap-4 text-left">
                      <span className="text-4xl">{useCase.emoji}</span>
                      <div>
                        <h3 className="text-xl font-semibold">
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

      <Footer />
      <Toaster />
    </div>
  );
};

export default Demo;
