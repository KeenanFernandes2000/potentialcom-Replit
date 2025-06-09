import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { AIChatbotForm } from "@/components/AIChatbotForm";
import { useEffect, useState } from "react";
import { 
  MessageCircle, 
  Calendar, 
  Headphones, 
  HelpCircle, 
  Package, 
  Info, 
  Settings,
  Users,
  Target,
  CheckCircle,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  Zap,
  Bot,
  GraduationCap,
  BookOpen,
  Award,
  UserCheck,
  Briefcase,
  School
} from "lucide-react";

// Import all customer logos
import adgmLogo from "@assets/Customer Logos/ADGM logo.png";
import airbusLogo from "@assets/Customer Logos/Airbus Logo.png";
import bankMuscatLogo from "@assets/Customer Logos/Bank mUscat logo.png";
import cartierLogo from "@assets/Customer Logos/Cartier logo.png";
import ciscoLogo from "@assets/Customer Logos/Cisco Logo.png";
import dctLogo from "@assets/Customer Logos/DCT Logo.png";
import dldLogo from "@assets/Customer Logos/DLD Logo.png";
import dellLogo from "@assets/Customer Logos/Dell logo.png";
import edbLogo from "@assets/Customer Logos/EDB logo.png";
import fordLogo from "@assets/Customer Logos/Ford logo.png";
import googleLogo from "@assets/Customer Logos/Google logo.png";
import govAbuDhabiLogo from "@assets/Customer Logos/Government of Abu Dhabi logo.png";
import govDubaiLogo from "@assets/Customer Logos/Government of Dubai logo.png";
import hsbcLogo from "@assets/Customer Logos/HSBC logo.png";
import inditexLogo from "@assets/Customer Logos/Inditex logo.png";
import intelLogo from "@assets/Customer Logos/intel logo.png";
import khalifaFundLogo from "@assets/Customer Logos/Khalifa Fund logo.png";
import mbcLogo from "@assets/Customer Logos/MBC logo.png";
import microsoftLogo from "@assets/Customer Logos/Microsoft logo.png";
import nestleLogo from "@assets/Customer Logos/Nestle Logo.png";
import pepsicoLogo from "@assets/Customer Logos/Pepsico logo.png";
import unWomenLogo from "@assets/Customer Logos/UN Women logo.png";
import unLogo from "@assets/Customer Logos/UN logo.png";
import visaLogo from "@assets/Customer Logos/Visa logo.png";
import wfzoLogo from "@assets/Customer Logos/WFZO logo.png";

// Import hero image (using voice agent setup as placeholder for now)
import voiceAgentSetupProcess from "@assets/voiceAgentSetupProcess.png";

const Chatbot = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("customer-service");
  const [selectedUseCase, setSelectedUseCase] = useState(0);

  // Detect dark mode using the same method as Hero component
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    // Initial check
    checkDarkMode();

    // Create a mutation observer to monitor class changes on html element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          checkDarkMode();
        }
      });
    });

    // Start observing
    observer.observe(document.documentElement, { attributes: true });

    // Cleanup
    return () => observer.disconnect();
  }, []);

  // Refresh AOS animations on route change
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).AOS) {
      (window as any).AOS.refresh();
    }
  }, []);

  // Use cases data for Customer Service
  const customerServiceUseCases = [
    {
      icon: HelpCircle,
      title: "24/7 Customer Support",
      description: "Provide instant customer support around the clock with AI Chatbots that never sleep—handle multiple conversations simultaneously with consistent, helpful responses.",
      benefits: ["Instant response times", "Multi-conversation handling", "Consistent service quality"]
    },
    {
      icon: Package,
      title: "Order Management",
      description: "Let customers track orders, modify deliveries, and get real-time updates through intelligent chatbot conversations—reducing support tickets by 70%.",
      benefits: ["Real-time order tracking", "Delivery modifications", "Automated notifications"]
    },
    {
      icon: Info,
      title: "Product Information",
      description: "Transform your chatbot into a product expert that provides detailed specifications, comparisons, and recommendations based on customer needs.",
      benefits: ["Detailed product specs", "Smart recommendations", "Comparison tools"]
    },
    {
      icon: Calendar,
      title: "Appointment Booking",
      description: "Streamline appointment scheduling with intelligent chatbots that check availability, book slots, and send automatic confirmations and reminders.",
      benefits: ["Smart scheduling", "Automatic confirmations", "Reminder notifications"]
    },
    {
      icon: Headphones,
      title: "Technical Support",
      description: "Resolve technical issues instantly with AI Chatbots trained on your knowledge base—escalating complex cases to human agents when needed.",
      benefits: ["Instant troubleshooting", "Knowledge base integration", "Smart escalation"]
    },
    {
      icon: Settings,
      title: "Custom Solutions",
      description: "Build tailored chatbot experiences for your specific business needs—no coding required, just powerful AI that understands your industry.",
      benefits: ["Industry-specific training", "Custom workflows", "No-code setup"]
    }
  ];

  // Use cases data for Sales & Marketing
  const salesMarketingUseCases = [
    {
      icon: Target,
      title: "Lead Generation",
      description: "Capture and qualify leads 24/7 with intelligent chatbots that engage visitors, collect contact information, and identify sales opportunities.",
      benefits: ["24/7 lead capture", "Smart qualification", "Higher conversion rates"]
    },
    {
      icon: Users,
      title: "Lead Qualification",
      description: "Pre-qualify prospects with intelligent conversations that assess needs, budget, and timeline—passing only high-quality leads to your sales team.",
      benefits: ["Automated scoring", "Quality filtering", "Sales team efficiency"]
    },
    {
      icon: MessageSquare,
      title: "Customer Surveys",
      description: "Collect valuable feedback through conversational surveys that feel natural and engaging—increasing response rates and data quality.",
      benefits: ["Higher response rates", "Natural conversations", "Actionable insights"]
    },
    {
      icon: TrendingUp,
      title: "Upselling & Cross-selling",
      description: "Identify upselling opportunities through intelligent conversation analysis and recommend relevant products or services at the right moment.",
      benefits: ["Smart recommendations", "Revenue growth", "Personalized offers"]
    },
    {
      icon: Bot,
      title: "Product Demos",
      description: "Provide interactive product demonstrations and answer pre-sales questions instantly—guiding prospects through your solutions.",
      benefits: ["Interactive demos", "Instant answers", "Guided discovery"]
    },
    {
      icon: Settings,
      title: "Custom Campaigns",
      description: "Create targeted chatbot campaigns for specific audiences, products, or marketing goals—with full analytics and optimization.",
      benefits: ["Targeted messaging", "Campaign analytics", "A/B testing"]
    }
  ];

  // Use cases data for Coaching & Training
  const coachingUseCases = [
    {
      icon: GraduationCap,
      title: "Employee Onboarding",
      description: "Guide new hires through comprehensive onboarding journeys with interactive chatbots that answer questions and ensure complete training completion.",
      benefits: ["Standardized onboarding", "Self-paced learning", "Progress tracking"]
    },
    {
      icon: BookOpen,
      title: "Product Training",
      description: "Train employees on new products, features, and services with AI chatbots that provide instant access to training materials and assessments.",
      benefits: ["Real-time learning", "Interactive quizzes", "Performance analytics"]
    },
    {
      icon: Award,
      title: "Skills Development",
      description: "Deliver personalized skill development programs through conversational learning experiences that adapt to individual learning styles and pace.",
      benefits: ["Personalized paths", "Continuous assessment", "Skill certification"]
    },
    {
      icon: UserCheck,
      title: "Performance Coaching",
      description: "Provide ongoing performance coaching and feedback through AI mentors that help employees improve productivity and achieve goals.",
      benefits: ["Continuous feedback", "Goal tracking", "Performance insights"]
    },
    {
      icon: Briefcase,
      title: "Business Coaching",
      description: "Support entrepreneurs and business leaders with AI coaching assistants that provide strategic guidance, best practices, and actionable insights.",
      benefits: ["Strategic guidance", "Best practice sharing", "Decision support"]
    },
    {
      icon: School,
      title: "Compliance Training",
      description: "Ensure regulatory compliance with interactive training chatbots that deliver mandatory training and track completion across your organization.",
      benefits: ["Compliance tracking", "Automated reporting", "Regular updates"]
    }
  ];

  // All 25 customer logos
  const clientLogos = [
    { name: "ADGM", logo: adgmLogo },
    { name: "Airbus", logo: airbusLogo },
    { name: "Bank Muscat", logo: bankMuscatLogo },
    { name: "Cartier", logo: cartierLogo },
    { name: "Cisco", logo: ciscoLogo },
    { name: "DCT", logo: dctLogo },
    { name: "DLD", logo: dldLogo },
    { name: "Dell", logo: dellLogo },
    { name: "EDB", logo: edbLogo },
    { name: "Ford", logo: fordLogo },
    { name: "Google", logo: googleLogo },
    { name: "Government of Abu Dhabi", logo: govAbuDhabiLogo },
    { name: "Government of Dubai", logo: govDubaiLogo },
    { name: "HSBC", logo: hsbcLogo },
    { name: "Inditex", logo: inditexLogo },
    { name: "Intel", logo: intelLogo },
    { name: "Khalifa Fund", logo: khalifaFundLogo },
    { name: "MBC", logo: mbcLogo },
    { name: "Microsoft", logo: microsoftLogo },
    { name: "Nestle", logo: nestleLogo },
    { name: "PepsiCo", logo: pepsicoLogo },
    { name: "UN Women", logo: unWomenLogo },
    { name: "United Nations", logo: unLogo },
    { name: "Visa", logo: visaLogo },
    { name: "WFZO", logo: wfzoLogo },
  ];

  return (
    <>
      <SEO 
        title="AI Chatbots - Transform Customer Conversations Instantly | Potential.com"
        description="Revolutionize customer engagement with AI Chatbots that provide instant support, capture leads, and automate conversations. Boost satisfaction while reducing costs."
        keywords="AI chatbots, chatbot automation, customer service bots, conversational AI, chat support, automated customer service, AI customer support"
      />
      <Header />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center py-16 lg:py-20">
            {/* Left Content */}
            <div className="text-center lg:text-left order-1 lg:order-1" data-aos="fade-right">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 lg:mb-6 leading-tight">
                AI Chatbots
              </h1>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-primary mb-4 lg:mb-6">
                Transform Customer Conversations Instantly
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 lg:mb-8 max-w-2xl mx-auto lg:mx-0 px-4 sm:px-0">A simple, powerful AI Chatbot that embeds seamlessly on your website to engage your customers 24/7 in real-time with precision and ease.</p>
              
              <div className="space-y-4 px-4 sm:px-0">
                <AIChatbotForm
                  trigger={
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto text-sm sm:text-base lg:text-lg px-6 sm:px-8 py-4 sm:py-6 h-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      Create Your AI Chatbot Now - It's Free
                    </Button>
                  }
                />
                
                <div className="flex items-center justify-center lg:justify-start space-x-2 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <span className="font-medium">Live in 60 seconds</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Image - Chatbot Interface Mockup */}
            <div className="flex justify-center lg:justify-end order-2 lg:order-2" data-aos="fade-left" data-aos-delay="200">
              <div className="relative max-w-sm sm:max-w-md lg:max-w-lg w-full px-4 sm:px-0">
                {/* Chatbot Interface Mockup */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {/* Header */}
                  <div className="bg-primary text-primary-foreground p-4 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold">Nike's AI Bot</div>
                      <div className="text-xs opacity-80">Ready to help 24/7</div>
                    </div>
                  </div>
                  
                  {/* Chat Messages */}
                  <div className="p-4 space-y-4 h-80 overflow-y-auto bg-gray-50 dark:bg-gray-800">
                    {/* Bot Message */}
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-3 max-w-xs shadow-sm">
                        <p className="text-sm text-foreground">Hi! I'm your AI assistant. How can I help you today?</p>
                      </div>
                    </div>
                    
                    {/* User Message */}
                    <div className="flex items-start space-x-2 justify-end">
                      <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-xs shadow-sm">
                        <p className="text-sm">I need help with my order</p>
                      </div>
                    </div>
                    
                    {/* Bot Response */}
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-3 max-w-xs shadow-sm">
                        <p className="text-sm text-foreground">I'd be happy to help! Please provide your order number and I'll check the status for you.</p>
                      </div>
                    </div>
                    
                    {/* Typing Indicator */}
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Input Area */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2">
                        <div className="text-sm text-muted-foreground">Type your message...</div>
                      </div>
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-primary-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="hidden sm:block absolute -top-4 -right-4 w-16 sm:w-24 h-16 sm:h-24 bg-primary/20 rounded-full blur-xl"></div>
                <div className="hidden sm:block absolute -bottom-4 -left-4 w-20 sm:w-32 h-20 sm:h-32 bg-primary/10 rounded-full blur-xl"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 sm:w-36 lg:w-48 h-24 sm:h-36 lg:h-48 bg-primary/5 rounded-full blur-3xl"></div>
      </section>
      {/* Trusted Organizations Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div
            className="client-logos py-8"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <h3 className="text-center text-muted-foreground uppercase text-sm tracking-wider mb-6">
              Trusted for over 20 years by leading organizations around the world
            </h3>

            {/* Scrolling container */}
            <div className="relative overflow-hidden">
              <div
                className="flex animate-scroll hover:pause-animation"
                style={{
                  width: `${clientLogos.length * 2 * 120}px`,
                }}
              >
                {/* First set of logos */}
                {clientLogos.map((client, i) => (
                  <div
                    key={`first-${i}`}
                    className="flex-shrink-0 w-32 h-16 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity mx-4"
                  >
                    <img
                      src={client.logo}
                      alt={`${client.name} logo`}
                      className="max-h-12 max-w-full object-contain"
                      style={{
                        filter: isDarkMode ? "brightness(0) invert(1)" : "none",
                      }}
                    />
                  </div>
                ))}
                {/* Duplicate set for seamless scrolling */}
                {clientLogos.map((client, i) => (
                  <div
                    key={`second-${i}`}
                    className="flex-shrink-0 w-32 h-16 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity mx-4"
                  >
                    <img
                      src={client.logo}
                      alt={`${client.name} logo`}
                      className="max-h-12 max-w-full object-contain"
                      style={{
                        filter: isDarkMode ? "brightness(0) invert(1)" : "none",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* AI Chatbots Use Cases Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              AI Chatbots for every business need
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Create intelligent chatbots that understand your customers and deliver exceptional experiences
            </p>
          </div>

          {/* Interactive Tab Section */}
          <div className="max-w-6xl mx-auto">
            {/* Tab Navigation */}
            <div className="flex justify-center mb-12" data-aos="fade-up" data-aos-delay="100">
              <div className="bg-background rounded-2xl p-2 shadow-lg border border-border/50 flex items-center justify-center">
                <button
                  onClick={() => {
                    setActiveTab("customer-service");
                    setSelectedUseCase(0);
                  }}
                  className={`px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                    activeTab === "customer-service"
                      ? "bg-primary text-primary-foreground shadow-md transform scale-105"
                      : "text-foreground bg-muted/30 hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Headphones className="w-4 h-4" />
                  <span>Customer Service</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("sales-marketing");
                    setSelectedUseCase(0);
                  }}
                  className={`px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                    activeTab === "sales-marketing"
                      ? "bg-primary text-primary-foreground shadow-md transform scale-105"
                      : "text-foreground bg-muted/30 hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Sales & Marketing</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("coaching");
                    setSelectedUseCase(0);
                  }}
                  className={`px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                    activeTab === "coaching"
                      ? "bg-primary text-primary-foreground shadow-md transform scale-105"
                      : "text-foreground bg-muted/30 hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Coaching</span>
                </button>
              </div>
            </div>

            {/* Dynamic Content Area */}
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left: Use Case List */}
              <div data-aos="fade-right" data-aos-delay="200">
                <div className="space-y-2">
                  {(activeTab === "customer-service" ? customerServiceUseCases : activeTab === "sales-marketing" ? salesMarketingUseCases : coachingUseCases).map((useCase, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedUseCase(index)}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                        selectedUseCase === index
                          ? "bg-primary/10 border-2 border-primary shadow-lg"
                          : "bg-background border border-border/50 hover:shadow-md hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          selectedUseCase === index ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                        }`}>
                          <useCase.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{useCase.title}</h4>
                        </div>
                        <ArrowRight className={`w-5 h-5 transition-all duration-300 ${
                          selectedUseCase === index ? "text-primary transform translate-x-1" : "text-muted-foreground"
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Selected Use Case Details */}
              <div data-aos="fade-left" data-aos-delay="300">
                <div className="bg-background rounded-2xl p-6 shadow-xl border border-border/50 sticky top-8">
                  {(() => {
                    const currentUseCase = (activeTab === "customer-service" ? customerServiceUseCases : activeTab === "sales-marketing" ? salesMarketingUseCases : coachingUseCases)[selectedUseCase];
                    const Icon = currentUseCase.icon;
                    return (
                      <div className="space-y-4">
                        {/* Icon and Title */}
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Icon className="w-8 h-8 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-foreground">{currentUseCase.title}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Zap className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm text-muted-foreground">AI-Powered</span>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-muted-foreground leading-relaxed">
                          {currentUseCase.description}
                        </p>

                        {/* Benefits */}
                        <div>
                          <h4 className="font-semibold text-foreground mb-3">Key Benefits:</h4>
                          <div className="space-y-2">
                            {currentUseCase.benefits.map((benefit, index) => (
                              <div key={index} className="flex items-center space-x-3">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <span className="text-sm text-muted-foreground">{benefit}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Banner Section */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden" data-aos="fade-up">
            {/* Gradient Background */}
            <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-700 rounded-3xl p-8 lg:p-12 shadow-2xl">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-6 left-6 w-12 h-12 bg-white rounded-full blur-xl"></div>
                <div className="absolute top-16 right-12 w-10 h-10 bg-white rounded-full blur-lg"></div>
                <div className="absolute bottom-12 left-1/4 w-14 h-14 bg-white rounded-full blur-xl"></div>
                <div className="absolute bottom-6 right-6 w-8 h-8 bg-white rounded-full blur-md"></div>
              </div>
              
              {/* Content */}
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                {/* Left Content */}
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="sm:text-3xl lg:text-4xl font-bold text-white mb-4 text-[30px]">Grow Your Sales & Revenue with AI!</h2>
                  <p className="text-purple-100 text-lg lg:text-xl mb-6 lg:mb-0 max-w-2xl">
                    Fill up the form to get your custom-trained AI Chatbot in seconds. 7-day free trial | No credit card required
                  </p>
                </div>
                
                {/* Right CTA Button */}
                <div className="flex-shrink-0">
                  <AIChatbotForm
                    trigger={
                      <button className="bg-white hover:bg-gray-50 text-purple-600 font-bold text-lg px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-3">
                        <span>Try For Free</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Statistics Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              The Future is Conversational—Will Your AI Chatbots Lead?
            </h2>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto mb-16">
            {[
              {
                icon: "💰",
                value: "70%",
                label: "Reduction in support costs",
                color: "text-green-600",
                bgColor: "bg-green-100 dark:bg-green-900/20"
              },
              {
                icon: "📈",
                value: "35%",
                label: "Increase in lead conversion",
                color: "text-blue-600",
                bgColor: "bg-blue-100 dark:bg-blue-900/20"
              },
              {
                icon: "🔗",
                value: "50+",
                label: "Platform integrations",
                color: "text-purple-600",
                bgColor: "bg-purple-100 dark:bg-purple-900/20"
              },
              {
                icon: "🌐",
                value: "100+",
                label: "Languages supported",
                color: "text-orange-600",
                bgColor: "bg-orange-100 dark:bg-orange-900/20"
              }
            ].map((stat, index) => (
              <div key={index} className="text-center p-6 bg-background rounded-2xl border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${stat.bgColor} flex items-center justify-center`}>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <div className={`text-4xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Additional Performance Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: "⚡",
                value: "99.9%",
                label: "Uptime",
                color: "text-emerald-600",
                bgColor: "bg-emerald-100 dark:bg-emerald-900/20"
              },
              {
                icon: "⏱️",
                value: "30s",
                label: "Setup Time",
                color: "text-indigo-600",
                bgColor: "bg-indigo-100 dark:bg-indigo-900/20"
              },
              {
                icon: "♾️",
                value: "∞",
                label: "Scalability",
                color: "text-violet-600",
                bgColor: "bg-violet-100 dark:bg-violet-900/20"
              },
              {
                icon: "🕐",
                value: "24/7",
                label: "Available",
                color: "text-cyan-600",
                bgColor: "bg-cyan-100 dark:bg-cyan-900/20"
              }
            ].map((stat, index) => (
              <div key={index} className="text-center p-6 bg-background rounded-2xl border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" data-aos="fade-up" data-aos-delay={400 + index * 100}>
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${stat.bgColor} flex items-center justify-center`}>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <div className={`text-4xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* AI Chatbots Features Section */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              AI Chatbots Designed for Your Success
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">Engage more effectively and save costs with our Artificial Intelligence No-code Chatbot</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content - Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
              {/* Feature 1: 24/7 Conversations */}
              <div className="bg-background rounded-2xl p-6 shadow-lg border border-border/50" data-aos="fade-up" data-aos-delay="100">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Fully Customizable</h3>
                <p className="text-sm text-muted-foreground">Train the AI Chatbot with your company's specific information and offerings using your website, documents, FAQs, and more.</p>
              </div>

              {/* Feature 2: Multi-Platform */}
              <div className="bg-background rounded-2xl p-6 shadow-lg border border-border/50" data-aos="fade-up" data-aos-delay="200">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Multi-Platform Integration</h3>
                <p className="text-sm text-muted-foreground">Deploy on websites, WhatsApp, or any platform without the need for coding—reaching customers where they prefer.</p>
              </div>

              {/* Feature 3: Smart Learning */}
              <div className="bg-background rounded-2xl p-6 shadow-lg border border-border/50" data-aos="fade-up" data-aos-delay="300">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Security First</h3>
                <p className="text-sm text-muted-foreground">Our AI Chatbot includes premium security measures to keep your data safe. Your data will not be used to train any model.</p>
              </div>

              {/* Feature 4: Cost-Effective */}
              <div className="bg-background rounded-2xl p-6 shadow-lg border border-border/50" data-aos="fade-up" data-aos-delay="400">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Cost-Effective & Scalable</h3>
                <p className="text-sm text-muted-foreground">
                  Handle unlimited conversations simultaneously while drastically reducing customer service costs.
                </p>
              </div>
            </div>

            {/* Right Content - Chatbot Analytics Dashboard */}
            <div className="flex justify-center lg:justify-end" data-aos="fade-left" data-aos-delay="500">
              <div className="relative max-w-lg w-full">
                {/* Dashboard Mockup */}
                <div className="relative z-10">
                  <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-foreground">Chatbot Analytics</h3>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      
                      {/* Stats Cards */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                          <div className="text-2xl font-bold text-blue-600">1,247</div>
                          <div className="text-xs text-blue-600/70">Conversations Today</div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                          <div className="text-2xl font-bold text-green-600">94%</div>
                          <div className="text-xs text-green-600/70">Resolution Rate</div>
                        </div>
                      </div>
                      
                      {/* Chart Area */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4">
                        <div className="text-sm font-medium text-foreground mb-3">Response Time Trend</div>
                        <div className="flex items-end space-x-2 h-20">
                          {[40, 65, 45, 80, 55, 90, 75, 60, 85, 70].map((height, i) => (
                            <div
                              key={i}
                              className="bg-primary rounded-t flex-1"
                              style={{ height: `${height}%` }}
                            ></div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Recent Activity */}
                      <div className="space-y-3">
                        <div className="text-sm font-medium text-foreground">Recent Activity</div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div className="text-xs text-muted-foreground">Order inquiry resolved</div>
                          </div>
                          <div className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div className="text-xs text-muted-foreground">Lead captured & qualified</div>
                          </div>
                          <div className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <div className="text-xs text-muted-foreground">Escalated to human agent</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 z-0">
                  <div className="bg-primary/20 rounded-full w-16 h-16 blur-xl"></div>
                </div>
                <div className="absolute -bottom-4 -left-4 z-0">
                  <div className="bg-primary/10 rounded-full w-20 h-20 blur-xl"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Language Support Subsection */}
          <div className="mt-20 pt-16 border-t border-border/20">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-left" data-aos="fade-right">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                  Chat in Every Customer's Language
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Potential.com's AI Chatbots support 100+ languages and understand cultural nuances—perfect for engaging a global audience with natural, context-aware conversations.
                </p>
              </div>

              {/* Right Content - Language Visualization */}
              <div className="flex justify-center lg:justify-end" data-aos="fade-left">
                <div className="relative w-full max-w-md">
                  {/* Chat Bubbles in Different Languages */}
                  <div className="space-y-4">
                    <div className="flex justify-start">
                      <div className="bg-primary/10 rounded-lg p-3 max-w-xs">
                        <div className="text-sm text-foreground">Hello! How can I help you?</div>
                        <div className="text-xs text-muted-foreground mt-1">🇺🇸 English</div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-xs">
                        <div className="text-sm">¡Hola! ¿Cómo puedo ayudarte?</div>
                        <div className="text-xs opacity-70 mt-1">🇪🇸 Spanish</div>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-primary/10 rounded-lg p-3 max-w-xs">
                        <div className="text-sm text-foreground">Bonjour! Comment puis-je vous aider?</div>
                        <div className="text-xs text-muted-foreground mt-1">🇫🇷 French</div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-xs">
                        <div className="text-sm">こんにちは！いかがお手伝いできますか？</div>
                        <div className="text-xs opacity-70 mt-1">🇯🇵 Japanese</div>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-primary/10 rounded-lg p-3 max-w-xs">
                        <div className="text-sm text-foreground">مرحبا! كيف يمكنني مساعدتك؟</div>
                        <div className="text-xs text-muted-foreground mt-1">🇸🇦 Arabic</div>
                      </div>
                    </div>
                  </div>

                  {/* Central Highlight */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-background/90 backdrop-blur-sm rounded-xl p-4 border border-primary/20 shadow-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary mb-1">100+</div>
                        <div className="text-sm text-muted-foreground font-medium">Languages</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Integration Subsection */}
          <div className="mt-20 pt-16 border-t border-border/20">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Content - YouTube Video */}
              <div className="flex justify-center lg:justify-start" data-aos="fade-right">
                <div className="relative w-full max-w-lg">
                  <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl border border-border/20">
                    <iframe
                      width="100%"
                      height="100%"
                      src="https://www.youtube.com/embed/AvoJaRmXcPM"
                      title="WhatsApp Integration Made Easy"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute -top-4 -right-4 z-0">
                    <div className="bg-green-500/20 rounded-full w-16 h-16 blur-xl"></div>
                  </div>
                  <div className="absolute -bottom-4 -left-4 z-0">
                    <div className="bg-green-500/10 rounded-full w-20 h-20 blur-xl"></div>
                  </div>
                </div>
              </div>

              {/* Right Content */}
              <div className="text-center lg:text-left" data-aos="fade-left">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                  WhatsApp Integration Made Easy
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Connect your WhatsApp Business number and start engaging with customers instantly and effortlessly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Setup Process Section */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Get Your AI Chatbot Live in Seconds
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              As easy as it looks! Launch your AI-powered chatbot automation—fast, seamless and free
            </p>
          </div>

          {/* Setup Process Image */}
          <div className="flex justify-center" data-aos="fade-up" data-aos-delay="200">
            <div className="relative max-w-5xl w-full">
              <img
                src={voiceAgentSetupProcess}
                alt="AI Chatbot Setup Process - Step by step guide showing how to get your chatbots live in seconds"
                className="w-full h-auto rounded-2xl shadow-2xl border border-border/20"
                loading="lazy"
              />
              
              {/* Optional overlay for better visual appeal */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-background/10 via-transparent to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>
      </section>
      {/* Final CTA Banner Section */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden" data-aos="fade-up">
            {/* Gradient Background */}
            <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-700 rounded-3xl p-8 lg:p-12 shadow-2xl">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-6 left-6 w-12 h-12 bg-white rounded-full blur-xl"></div>
                <div className="absolute top-16 right-12 w-10 h-10 bg-white rounded-full blur-lg"></div>
                <div className="absolute bottom-12 left-1/4 w-14 h-14 bg-white rounded-full blur-xl"></div>
                <div className="absolute bottom-6 right-6 w-8 h-8 bg-white rounded-full blur-md"></div>
              </div>
              
              {/* Content */}
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                {/* Left Content */}
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="sm:text-3xl lg:text-4xl font-bold text-white mb-4 text-[30px]">Boost engagement, reduce costs, and scale conversations effortlessly!</h2>
                  <p className="text-purple-100 text-lg lg:text-xl mb-6 lg:mb-0 max-w-2xl">
                    Set up & Train your AI Chatbot in Minutes. Get started for free—no card required.
                  </p>
                </div>
                
                {/* Right CTA Button */}
                <div className="flex-shrink-0">
                  <AIChatbotForm
                    trigger={
                      <button className="bg-white hover:bg-gray-50 text-purple-600 font-bold text-lg px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-3">
                        <span>Try For Free</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Chatbot;