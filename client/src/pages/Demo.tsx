import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { 
  MessageCircle, 
  Mic, 
  User, 
  ShoppingCart, 
  Briefcase, 
  GraduationCap, 
  Hospital, 
  Users,
  Send,
  Play,
  Pause,
  ChevronDown,
  Check
} from "lucide-react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type InterfaceMode = "chat" | "voice" | "avatar";

interface Message {
  role: "user" | "agent";
  text: string;
}

const Demo = () => {
  const [activeMode, setActiveMode] = useState<InterfaceMode>("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Show initial message when component mounts
    setMessages([
      {
        role: "agent",
        text: "Assume you are:",
      },
    ]);
  }, []);

  const handleUseCaseClick = (prompt: string, useCase: string) => {
    // Add user message
    setMessages((prev) => [...prev, { role: "user", text: useCase }]);
    
    // Simulate agent response after a delay
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { 
          role: "agent", 
          text: `Great! I'm now acting as your ${useCase}. ${prompt}` 
        },
      ]);
    }, 1000);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    setMessages((prev) => [...prev, { role: "user", text: inputValue }]);
    setInputValue("");
    
    // Simulate agent response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { 
          role: "agent", 
          text: "I understand! Let me help you with that." 
        },
      ]);
    }, 1000);
  };

  const toggleVoice = () => {
    setIsVoiceActive(!isVoiceActive);
    if (!isVoiceActive) {
      // Simulate speaking animation
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 3000);
    } else {
      setIsSpeaking(false);
    }
  };

  const useCases = [
    {
      icon: <ShoppingCart className="h-5 w-5" />,
      emoji: "🛍️",
      label: "E-Commerce & Shopping Assistant",
      prompt: "How can I help you shop today?",
    },
    {
      icon: <Briefcase className="h-5 w-5" />,
      emoji: "💼",
      label: "Sales & Marketing Agent",
      prompt: "Let me help you grow your business!",
    },
    {
      icon: <GraduationCap className="h-5 w-5" />,
      emoji: "🎓",
      label: "Learning Concierge",
      prompt: "Ready to accelerate your learning journey?",
    },
    {
      icon: <Hospital className="h-5 w-5" />,
      emoji: "🏥",
      label: "Clinic & Hospital Assistant",
      prompt: "How can I assist with your healthcare needs?",
    },
    {
      icon: <Users className="h-5 w-5" />,
      emoji: "👩‍💼",
      label: "HR & People Assistant",
      prompt: "Let me help you with HR and people management!",
    },
  ];

  const renderChatInterface = () => (
    <div className="w-full max-w-3xl mx-auto bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
      {/* Chat header */}
      <div className="bg-primary/10 border-b border-border px-6 py-4">
        <h3 className="font-semibold text-foreground">Chat with Ruby</h3>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground ml-auto"
                  : "bg-muted text-foreground"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Use case buttons - shown after initial message */}
        {messages.length === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            {useCases.map((useCase, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="justify-start h-auto py-3 px-4 hover:bg-primary/10 hover:border-primary transition-all duration-300 group"
                onClick={() => handleUseCaseClick(useCase.prompt, useCase.label)}
                data-testid={`button-usecase-${idx}`}
              >
                <span className="text-2xl mr-3 group-hover:scale-110 transition-transform">
                  {useCase.emoji}
                </span>
                <span className="text-left text-sm font-medium">{useCase.label}</span>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-4 bg-muted/30">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            data-testid="input-chat-message"
          />
          <Button
            onClick={handleSendMessage}
            className="rounded-full bg-primary hover:bg-primary/90"
            size="icon"
            data-testid="button-send-message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderVoiceInterface = () => (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-card border border-border rounded-2xl shadow-lg p-12">
        <div className="flex flex-col items-center justify-center space-y-8">
          {/* Pulsing microphone animation */}
          <div className="relative">
            <div
              className={`absolute inset-0 rounded-full bg-primary/30 ${
                isSpeaking ? "animate-ping" : ""
              }`}
            />
            <div
              className={`relative w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center ${
                isSpeaking ? "animate-pulse" : ""
              }`}
            >
              <Mic className="h-16 w-16 text-white" />
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-2">
              {isVoiceActive ? "Listening..." : "Tap to speak with Ruby"}
            </h3>
            <p className="text-muted-foreground">
              {isVoiceActive
                ? "I'm here to help! What would you like to know?"
                : "Start a voice conversation"}
            </p>
          </div>

          <Button
            size="lg"
            onClick={toggleVoice}
            className={`rounded-full px-8 ${
              isVoiceActive
                ? "bg-destructive hover:bg-destructive/90"
                : "bg-primary hover:bg-primary/90"
            }`}
            data-testid="button-toggle-voice"
          >
            {isVoiceActive ? (
              <>
                <Pause className="mr-2 h-5 w-5" />
                End Call
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5" />
                Start Voice Chat
              </>
            )}
          </Button>

          {/* Waveform visualization when speaking */}
          {isSpeaking && (
            <div className="flex items-center justify-center gap-1 h-16">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 bg-primary rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 60 + 20}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAvatarInterface = () => (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
        {/* Avatar video area */}
        <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-primary to-primary/70 mx-auto mb-4 flex items-center justify-center">
                <User className="h-24 w-24 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Ruby</h3>
              <p className="text-muted-foreground">Your AI Assistant</p>
            </div>
          </div>
        </div>

        {/* Avatar controls */}
        <div className="p-6 space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Interactive avatar mode - Coming soon
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {useCases.map((useCase, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  data-testid={`button-avatar-usecase-${idx}`}
                >
                  {useCase.emoji} {useCase.label.split(" ")[0]}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const detailedUseCases = [
    {
      id: "ecommerce",
      emoji: "🛍️",
      title: "E-Commerce & Shopping Assistant",
      tagline: "Your 24/7 virtual store expert — helping users discover, shop, and manage orders effortlessly.",
      actions: [
        "Recommend personalized products instantly",
        "Recognize and suggest products from uploaded or taken images",
        "Update or track orders in real-time",
        "Change shipping address before delivery",
        "Add items directly to cart or checkout",
        "Share exclusive offers and discount codes",
      ],
      prompts: [
        '"Where is my order?"',
        '"Change my delivery address to Dubai Marina."',
        '"Cancel order #4521."',
        '"What foundation brands do you have?"',
        '"Find similar shoes to this photo."',
      ],
    },
    {
      id: "sales",
      emoji: "💼",
      title: "Sales & Marketing Agent",
      tagline: "Your AI-powered sales rep — closing deals, nurturing leads, and even creating new AI Agents on the fly.",
      actions: [
        "Build new AI Agents",
        "Book product demos or sales calls",
        "Send follow-up emails or marketing materials",
        "Add and update leads in CRM systems",
        "Share promotions, bundles, or limited offers",
        "Upsell and cross-sell smartly",
        "Handle client inquiries or FAQs with precision",
      ],
      prompts: [
        '"Create an AI Chatbot for my restaurant."',
        '"I want to build an AI Voice Agent for my business."',
        '"Book a meeting with a human sales expert."',
        '"What do you recommend for my company?"',
        '"Send me your company profile."',
      ],
    },
    {
      id: "learning",
      emoji: "🎓",
      title: "Learning Concierge",
      tagline: "A personal learning guide that tracks your progress and accelerates your growth.",
      actions: [
        "Check learner progress and completion rate",
        "Suggest the next best course or module",
        "Connect learners with mentors or coaches",
        "Share program milestones and certificates",
      ],
      prompts: [
        '"What\'s my progress in the AI Upskilling Program?"',
        '"Recommend the next course for me."',
        '"Connect me to a mentor."',
        '"When is my next workshop?"',
      ],
    },
    {
      id: "clinic",
      emoji: "🏥",
      title: "Clinic & Hospital Assistant",
      tagline: "Your AI receptionist — booking, guiding, and caring for patients anytime, anywhere.",
      actions: [
        "Book, reschedule, or cancel appointments instantly",
        "Suggest the right doctor based on symptoms",
        "Show service availability",
        "Share service options and prices",
        "Provide directions, contact info, and opening hours",
        "Send confirmations via WhatsApp or email",
      ],
      prompts: [
        '"I feel sick and don\'t know which doctor to see."',
        '"Book a consultation with a doctor."',
        '"Do you accept MetLife insurance?"',
        '"What are your opening hours?"',
      ],
    },
    {
      id: "hr",
      emoji: "👩‍💼",
      title: "HR & People Assistant",
      tagline: "Your intelligent HR partner — helping you hire, onboard, and grow your team with ease.",
      actions: [
        "Conduct pre-screening interviews",
        "Score and summarize candidate responses automatically",
        "Guide new hires through onboarding and training",
        "Explain HR policies, benefits, and procedures",
        "Set individual and department KPIs",
        "Provide feedback and performance reviews",
        "Answer FAQs about leaves, payroll, or documents",
        "Display or send documents via email",
      ],
      prompts: [
        '"I\'m here for the Marketing Manager interview."',
        '"Ask me 3 questions to test marketing skills."',
        '"What\'s our leave policy?"',
        '"Help me set my KPIs for this year."',
      ],
    },
  ];

  const integrations = [
    {
      category: "E-Commerce",
      logos: ["Shopify", "WooCommerce", "Stripe", "PayPal"],
    },
    {
      category: "Sales & CRM",
      logos: ["HubSpot", "Salesforce", "Calendly", "Mailchimp", "WhatsApp Business"],
    },
    {
      category: "Clinic",
      logos: ["Amwell", "Doctolib", "Twilio", "Google Maps"],
    },
    {
      category: "HR",
      logos: ["BambooHR", "Workday", "Zoho People", "Microsoft Teams", "Slack"],
    },
    {
      category: "Learning",
      logos: ["Potential.com", "Moodle", "TalentLMS", "Google Sheets", "Airtable"],
    },
    {
      category: "Automation",
      logos: ["Zapier", "Make", "Notion", "AWS", "Azure", "Google Cloud"],
    },
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

          {/* Mode toggles */}
          <div className="flex justify-center gap-4 mb-12" data-aos="fade-up" data-aos-delay="100">
            <Button
              variant={activeMode === "chat" ? "default" : "outline"}
              onClick={() => setActiveMode("chat")}
              className="rounded-full"
              data-testid="button-mode-chat"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat 💬
            </Button>
            <Button
              variant={activeMode === "voice" ? "default" : "outline"}
              onClick={() => setActiveMode("voice")}
              className="rounded-full"
              data-testid="button-mode-voice"
            >
              <Mic className="mr-2 h-4 w-4" />
              Voice 🎙️
            </Button>
            <Button
              variant={activeMode === "avatar" ? "default" : "outline"}
              onClick={() => setActiveMode("avatar")}
              className="rounded-full"
              data-testid="button-mode-avatar"
            >
              <User className="mr-2 h-4 w-4" />
              Avatar 🧑‍💻
            </Button>
          </div>

          {/* Interface rendering */}
          <div data-aos="fade-up" data-aos-delay="200">
            {activeMode === "chat" && renderChatInterface()}
            {activeMode === "voice" && renderVoiceInterface()}
            {activeMode === "avatar" && renderAvatarInterface()}
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
              Explore the powerful capabilities across different industries and use cases
            </p>
          </div>

          <div className="max-w-5xl mx-auto space-y-4" data-aos="fade-up" data-aos-delay="100">
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
                        <h3 className="text-xl font-semibold">{useCase.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {useCase.tagline}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <div className="space-y-6 pt-4">
                      {/* Agentic Actions */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Check className="h-5 w-5 text-primary" />
                          Agentic Actions
                        </h4>
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
                      </div>

                      {/* Sample Prompts */}
                      <div>
                        <h4 className="font-semibold mb-3">🗣️ Try Asking:</h4>
                        <div className="flex flex-wrap gap-2">
                          {useCase.prompts.map((prompt, promptIdx) => (
                            <div
                              key={promptIdx}
                              className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
                              data-testid={`prompt-${useCase.id}-${promptIdx}`}
                            >
                              {prompt}
                            </div>
                          ))}
                        </div>
                      </div>
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

          <div className="space-y-8" data-aos="fade-up" data-aos-delay="100">
            {integrations.map((category, idx) => (
              <div key={idx} className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-primary">
                  {category.category}
                </h3>
                <div className="flex flex-wrap gap-4">
                  {category.logos.map((logo, logoIdx) => (
                    <div
                      key={logoIdx}
                      className="bg-muted/50 px-6 py-3 rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                      data-testid={`integration-${category.category}-${logoIdx}`}
                    >
                      <span className="text-foreground/80 group-hover:text-foreground font-medium">
                        {logo}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Demo;
