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

    // Refresh AOS animations on page load
    if (typeof window !== "undefined" && (window as any).AOS) {
      (window as any).AOS.refresh();
    }
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
      id: "shopping",
      emoji: "🛍️",
      title: "Shopping & Product Assistance",
      tagline: "Personalized product discovery, image recognition, and seamless order management.",
      actions: [
        "Recommend personalized products instantly",
        "Recognize and suggest products from uploaded images",
        "Recognize and suggest products from taken pictures",
        "Add items to cart directly",
        "Track orders",
        "Update orders in real-time",
        "Change shipping address before delivery",
        "Cancel orders",
        "Share exclusive offers and discount codes",
      ],
      prompts: [
        "I have oily skin, what products do you recommend?",
        "Here is a photo of my face, which foundation and shade do you recommend?",
        "Where is my order?",
        "What discounts are available today?",
      ],
    },
    {
      id: "booking",
      emoji: "💄",
      title: "Book Skincare Experts & Makeup Artists",
      tagline: "Connect with beauty professionals and schedule consultations effortlessly.",
      actions: [
        "Show and recommend available experts (with images, names, and specialties)",
        "Book or reschedule appointments",
        "Send confirmation via email or WhatsApp",
        "Share consultation prices and service options",
      ],
      prompts: [
        "I have a lot of black dots on my face and want to consult a skincare expert. Who do you recommend?",
        "Who's available this weekend for bridal makeup?",
        "Show me your top skincare experts.",
        "How much is a full glam session?",
        "Send me the booking confirmation on WhatsApp.",
      ],
    },
    {
      id: "learning",
      emoji: "🎓",
      title: "Learning & Beauty Courses",
      tagline: "Master beauty skills with guided courses and track your certification progress.",
      actions: [
        "Share available makeup and skincare courses",
        "Track learner progress and completion",
        "Recommend the next lesson or topic",
        "Share certifications and event schedules",
      ],
      prompts: [
        "What courses do you offer about skincare?",
        "What is my progress to get the Makeup Artist Certification?",
        "Recommend what I should learn next.",
        "Email me my course certificate.",
      ],
    },
    {
      id: "hr",
      emoji: "👩‍💼",
      title: "HR & Career at Alora",
      tagline: "Explore career opportunities and experience AI-powered interview assistance.",
      actions: [
        "Display open job positions",
        "Conduct pre-screening interview questions",
        "Evaluate candidate responses and provide a score",
        "Explain company culture and benefits",
      ],
      prompts: [
        "Are there any open jobs at Alora?",
        "Interview me for the Marketing Manager role.",
        "Tell me about Alora's work culture.",
      ],
    },
    {
      id: "support",
      emoji: "💌",
      title: "Customer Support & Engagement",
      tagline: "Quick answers to FAQs, hassle-free returns, and seamless escalation to human support.",
      actions: [
        "Answer FAQs (returns, shipping, product ingredients)",
        "Handle returns and refund requests",
        "Connect to human support when needed",
      ],
      prompts: [
        "I received the wrong shade — how do I return it?",
        "Do you test your products on animals?",
        "Can I return my order and get a refund?",
      ],
    },
    {
      id: "automation",
      emoji: "⚙️",
      title: "System & Automation",
      tagline: "Build custom AI agents tailored to your business needs.",
      actions: [
        "Build new AI Agents",
      ],
      prompts: [
        "I want to create an AI Chatbot for my business.",
        "I want to create an AI Voice Agent for my business.",
      ],
    },
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
              Your smart beauty companion connected to Alora Brands — ready to help customers shop, learn, book, and grow.
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
    </div>
  );
};

export default Demo;
