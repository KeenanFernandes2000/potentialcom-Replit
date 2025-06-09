import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { 
  Phone, 
  Calendar, 
  Headphones, 
  HelpCircle, 
  Package, 
  Info, 
  Settings,
  PhoneCall,
  Target,
  Users,
  CheckCircle,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  Zap
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

// Import hero image
import voiceAgentHero from "@assets/voiceAgentHero.png";
import voiceAgentSetupProcess from "@assets/voiceAgentSetupProcess.png";

const Voice = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("inbound");
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

  // Use cases data
  const inboundUseCases = [
    {
      icon: Calendar,
      title: "Appointment Bookings",
      description: "Let your AI Voice Agent schedule, confirm, and update appointments—no manual work needed, just seamless automation that saves time.",
      benefits: ["24/7 booking availability", "Automatic calendar sync", "SMS confirmations"]
    },
    {
      icon: Headphones,
      title: "Customer Support",
      description: "Deliver real-time support with direct access to your systems—AI Voice Agents fetch accurate, up-to-date info with zero hassle.",
      benefits: ["Instant issue resolution", "Knowledge base integration", "Escalation to humans"]
    },
    {
      icon: HelpCircle,
      title: "Answer FAQs",
      description: "Cut down on repetitive calls by instantly resolving common customer queries—your AI Voice Agent has the answers 24/7.",
      benefits: ["Instant responses", "Multi-language support", "Learning from interactions"]
    },
    {
      icon: Package,
      title: "Order Tracking",
      description: "Empower customers to get real-time updates on their orders and services—eliminating the need for live agents to handle routine checks.",
      benefits: ["Real-time updates", "Delivery notifications", "Issue alerts"]
    },
    {
      icon: Info,
      title: "Product Assistance",
      description: "Guide customers with detailed product information and help them make informed decisions—your AI Voice Agent becomes a product expert.",
      benefits: ["Product comparisons", "Specification details", "Recommendation engine"]
    },
    {
      icon: Settings,
      title: "Custom Agents",
      description: "Build and personalize AI Voice Agents in minutes to match any business scenario—no technical skills required, just powerful results.",
      benefits: ["No-code setup", "Custom workflows", "Brand voice matching"]
    }
  ];

  const outboundUseCases = [
    {
      icon: Target,
      title: "Sales Outreach",
      description: "Proactively engage leads and introduce your products or services—convert cold calls into closed deals with smart, human-like conversations.",
      benefits: ["Higher conversion rates", "Personalized pitches", "Follow-up automation"]
    },
    {
      icon: Users,
      title: "Lead Prequalification",
      description: "Let AI Voice Agents filter and qualify leads before handing them to your sales team—focus only on high-potential prospects and speed up conversions.",
      benefits: ["Quality lead scoring", "Time savings", "Automated routing"]
    },
    {
      icon: CheckCircle,
      title: "Appointment Confirmations",
      description: "Send reminders, confirm bookings, and adjust appointments through automated calls—ensuring a smooth, professional experience every time.",
      benefits: ["Reduced no-shows", "Automatic rescheduling", "Professional image"]
    },
    {
      icon: MessageSquare,
      title: "Customer Surveys",
      description: "Automatically reach out to customers for feedback—gain real insights to enhance your service and measure satisfaction in real time.",
      benefits: ["Higher response rates", "Real-time analytics", "Actionable insights"]
    },
    {
      icon: TrendingUp,
      title: "Upselling",
      description: "Stay in touch with existing customers to renew subscriptions or offer complementary products—maximize lifetime value with zero manual effort.",
      benefits: ["Revenue growth", "Customer retention", "Personalized offers"]
    },
    {
      icon: Settings,
      title: "Custom Agents",
      description: "Build and personalize AI Voice Agents in minutes to match any business scenario—no technical skills required, just powerful results.",
      benefits: ["Flexible workflows", "Brand alignment", "Scalable solutions"]
    }
  ];

  // All 25 customer logos in updated order
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
        title="AI Voice Agents - Never Miss a Sales Call Again | Potential.com"
        description="Enhance your customer support and call operations with AI Voice Agents—human-like voice assistants that handle calls and answer questions. Cut costs, save time, and close more deals."
        keywords="AI voice agents, voice AI, automated calls, customer support, sales calls, voice assistants, AI phone agents"
      />
      <Header />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center py-16 lg:py-20">
            {/* Left Content */}
            <div className="text-center lg:text-left order-1 lg:order-1" data-aos="fade-right">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 lg:mb-6 leading-tight">
                AI Voice Agents
              </h1>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-primary mb-4 lg:mb-6">
                Never Miss a Sales Call Again
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 lg:mb-8 max-w-2xl mx-auto lg:mx-0 px-4 sm:px-0">
                Enhance your customer support and call operations with AI Voice Agents—human-like voice assistants that handle calls and answer questions. Cut costs, save time, and close more deals.
              </p>
              
              <div className="space-y-4 px-4 sm:px-0">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto text-sm sm:text-base lg:text-lg px-6 sm:px-8 py-4 sm:py-6 h-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Create Your AI Voice Agent Now - It's Free
                </Button>
                
                <div className="flex items-center justify-center lg:justify-start space-x-2 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <span className="font-medium">Live in 60 seconds</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="flex justify-center lg:justify-end order-2 lg:order-2" data-aos="fade-left" data-aos-delay="200">
              <div className="relative max-w-sm sm:max-w-md lg:max-w-lg w-full px-4 sm:px-0">
                <img
                  src={voiceAgentHero}
                  alt="AI Voice Agent Hero"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
                {/* Decorative elements - hidden on mobile */}
                <div className="hidden sm:block absolute -top-4 -right-4 w-16 sm:w-24 h-16 sm:h-24 bg-primary/20 rounded-full blur-xl"></div>
                <div className="hidden sm:block absolute -bottom-4 -left-4 w-20 sm:w-32 h-20 sm:h-32 bg-primary/10 rounded-full blur-xl"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Background decorative elements - responsive sizes */}
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
                  width: `${clientLogos.length * 2 * 120}px`, // Double width for seamless loop
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
      {/* AI Voice Agents Use Cases Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              AI voice agents for all your needs
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Create no-code AI phone call agents: never miss a call again and convert more leads
            </p>
          </div>

          {/* Interactive Tab Section */}
          <div className="max-w-6xl mx-auto">
            {/* Tab Navigation */}
            <div className="flex justify-center mb-12" data-aos="fade-up" data-aos-delay="100">
              <div className="bg-background rounded-2xl p-2 shadow-lg border border-border/50 flex items-center justify-center">
                <button
                  onClick={() => {
                    setActiveTab("inbound");
                    setSelectedUseCase(0);
                  }}
                  className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-3 ${
                    activeTab === "inbound"
                      ? "bg-primary text-primary-foreground shadow-md transform scale-105"
                      : "text-foreground bg-muted/30 hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Phone className="w-5 h-5" />
                  <span>Inbound Calls</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("outbound");
                    setSelectedUseCase(0);
                  }}
                  className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-3 ${
                    activeTab === "outbound"
                      ? "bg-primary text-primary-foreground shadow-md transform scale-105"
                      : "text-foreground bg-muted/30 hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <PhoneCall className="w-5 h-5" />
                  <span>Outbound Calls</span>
                </button>
              </div>
            </div>

            {/* Dynamic Content Area */}
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left: Use Case List */}
              <div data-aos="fade-right" data-aos-delay="200">
                <div className="space-y-2">
                  {(activeTab === "inbound" ? inboundUseCases : outboundUseCases).map((useCase, index) => (
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
                    const currentUseCase = (activeTab === "inbound" ? inboundUseCases : outboundUseCases)[selectedUseCase];
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
                  <h2 className="sm:text-3xl lg:text-4xl font-bold text-white mb-4 text-[30px]">Let AI handle calls just like real agents</h2>
                  <p className="text-purple-100 text-lg lg:text-xl mb-6 lg:mb-0 max-w-2xl">
                    Fill up the form to get your custom-trained AI Voice Agent in seconds. Get 10 minutes of free usage time to test it out!
                  </p>
                </div>
                
                {/* Right CTA Button */}
                <div className="flex-shrink-0">
                  <button className="bg-white hover:bg-gray-50 text-purple-600 font-bold text-lg px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-3">
                    <span>Try For Free</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
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
              The Future is Calling—Will Your AI Voice Agents Answer?
            </h2>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto mb-16">
            {[
              {
                icon: "💰",
                value: "60%",
                label: "Decrease in operational costs",
                color: "text-green-600",
                bgColor: "bg-green-100 dark:bg-green-900/20"
              },
              {
                icon: "📈",
                value: "21%",
                label: "Increase in sales conversions",
                color: "text-blue-600",
                bgColor: "bg-blue-100 dark:bg-blue-900/20"
              },
              {
                icon: "🔗",
                value: "40+",
                label: "Apps integrated",
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
                value: "60s",
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
      {/* AI Voice Agents Features Section */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              AI Voice Agents Designed for Your Success
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Enhance your call operations with Potential.com AI Voice Agents
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content - Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
              {/* Feature 1: 24/7 Call Handling */}
              <div className="bg-background rounded-2xl p-6 shadow-lg border border-border/50" data-aos="fade-up" data-aos-delay="100">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">24/7 Call Handling & Support</h3>
                <p className="text-sm text-muted-foreground">
                  AI Voice Agents manage calls anytime, reducing wait times and improving response efficiency.
                </p>
              </div>

              {/* Feature 2: System Integration */}
              <div className="bg-background rounded-2xl p-6 shadow-lg border border-border/50" data-aos="fade-up" data-aos-delay="200">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Seamless System Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Connect effortlessly with CRMs, IVRs, helpdesks, and other tools for smooth workflows.
                </p>
              </div>

              {/* Feature 3: Multilingual */}
              <div className="bg-background rounded-2xl p-6 shadow-lg border border-border/50" data-aos="fade-up" data-aos-delay="300">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Customizable, Multilingual & AI-Trained</h3>
                <p className="text-sm text-muted-foreground">
                  Easily train AI Voice Agents for your business needs and support customers in multiple languages.
                </p>
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
                  Reduce costs, handle high call volumes, and scale effortlessly with AI-driven automation.
                </p>
              </div>
            </div>

            {/* Right Content - Device Mockups */}
            <div className="flex justify-center lg:justify-end" data-aos="fade-left" data-aos-delay="500">
              <div className="relative max-w-lg w-full">
                {/* Phone Mockup */}
                <div className="relative z-10">
                  <div className="bg-gray-900 rounded-3xl p-2 shadow-2xl transform rotate-3">
                    <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-white">
                      <div className="flex items-center justify-between mb-6">
                        <div className="text-sm font-medium">Your AI Voice Agent</div>
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                      <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                          </svg>
                        </div>
                        <div className="text-2xl font-bold mb-2">00:02:34</div>
                        <div className="text-sm opacity-80">AI Voice Agent Active</div>
                      </div>
                      <div className="flex justify-center space-x-6">
                        <button className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3.22.79-4.5 2.09C10.72 3.79 9.26 3 7.5 3A5.5 5.5 0 002 8.5c0 2.29 1.51 4.04 3 5.5L12 21l7-7z"/>
                          </svg>
                        </button>
                        <button className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                          </svg>
                        </button>
                        <button className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop/Dashboard Mockup */}
                <div className="absolute -top-8 -right-8 z-0 transform -rotate-6">
                  <div className="bg-gray-900 rounded-xl p-3 shadow-xl w-64">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-white text-xs font-medium">AI Voice Agent</div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <div className="w-20 h-2 bg-gray-600 rounded mb-1"></div>
                            <div className="w-16 h-1.5 bg-gray-700 rounded"></div>
                          </div>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-500 rounded-full"></div>
                          <div className="flex-1">
                            <div className="w-24 h-2 bg-gray-600 rounded mb-1"></div>
                            <div className="w-20 h-1.5 bg-gray-700 rounded"></div>
                          </div>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Laptop Mockup */}
                <div className="absolute -bottom-4 -left-4 z-0 transform rotate-2">
                  <div className="bg-gray-800 rounded-lg p-2 shadow-lg w-32">
                    <div className="bg-gray-900 rounded h-20 flex items-center justify-center">
                      <div className="w-16 h-10 bg-gray-700 rounded"></div>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-b-lg mt-1"></div>
                  </div>
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
                  Speak Every Customer's Language
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Potential.com's AI Voice Agents support 100+ languages and a wide range of regional accents—perfect for engaging a global audience. You might also clone your own voice for a truly personalized experience.
                </p>
              </div>

              {/* Right Content - Animated Country Flags */}
              <div className="flex justify-center lg:justify-end" data-aos="fade-left">
                <div className="relative w-full max-w-md">
                  {/* Scrolling Flags Container */}
                  <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-background to-muted/50 p-8 shadow-xl border border-border/50">
                    <div className="space-y-6">
                      {/* Row 1 - Moving Right */}
                      <div className="flex animate-scroll-right space-x-4">
                        {[
                          { flag: "🇺🇸", name: "USA" },
                          { flag: "🇬🇧", name: "UK" },
                          { flag: "🇫🇷", name: "France" },
                          { flag: "🇩🇪", name: "Germany" },
                          { flag: "🇪🇸", name: "Spain" },
                          { flag: "🇮🇹", name: "Italy" },
                          { flag: "🇺🇸", name: "USA" },
                          { flag: "🇬🇧", name: "UK" },
                          { flag: "🇫🇷", name: "France" },
                          { flag: "🇩🇪", name: "Germany" },
                          { flag: "🇪🇸", name: "Spain" },
                          { flag: "🇮🇹", name: "Italy" }
                        ].map((country, index) => (
                          <div key={index} className="flex-shrink-0 text-center">
                            <div className="text-4xl mb-2">{country.flag}</div>
                            <div className="text-xs text-muted-foreground font-medium">{country.name}</div>
                          </div>
                        ))}
                      </div>

                      {/* Row 2 - Moving Left */}
                      <div className="flex animate-scroll-left space-x-4">
                        {[
                          { flag: "🇯🇵", name: "Japan" },
                          { flag: "🇰🇷", name: "Korea" },
                          { flag: "🇨🇳", name: "China" },
                          { flag: "🇮🇳", name: "India" },
                          { flag: "🇧🇷", name: "Brazil" },
                          { flag: "🇷🇺", name: "Russia" },
                          { flag: "🇯🇵", name: "Japan" },
                          { flag: "🇰🇷", name: "Korea" },
                          { flag: "🇨🇳", name: "China" },
                          { flag: "🇮🇳", name: "India" },
                          { flag: "🇧🇷", name: "Brazil" },
                          { flag: "🇷🇺", name: "Russia" }
                        ].map((country, index) => (
                          <div key={index} className="flex-shrink-0 text-center">
                            <div className="text-4xl mb-2">{country.flag}</div>
                            <div className="text-xs text-muted-foreground font-medium">{country.name}</div>
                          </div>
                        ))}
                      </div>

                      {/* Row 3 - Moving Right */}
                      <div className="flex animate-scroll-right space-x-4">
                        {[
                          { flag: "🇳🇱", name: "Netherlands" },
                          { flag: "🇸🇪", name: "Sweden" },
                          { flag: "🇳🇴", name: "Norway" },
                          { flag: "🇩🇰", name: "Denmark" },
                          { flag: "🇫🇮", name: "Finland" },
                          { flag: "🇵🇱", name: "Poland" },
                          { flag: "🇳🇱", name: "Netherlands" },
                          { flag: "🇸🇪", name: "Sweden" },
                          { flag: "🇳🇴", name: "Norway" },
                          { flag: "🇩🇰", name: "Denmark" },
                          { flag: "🇫🇮", name: "Finland" },
                          { flag: "🇵🇱", name: "Poland" }
                        ].map((country, index) => (
                          <div key={index} className="flex-shrink-0 text-center">
                            <div className="text-4xl mb-2">{country.flag}</div>
                            <div className="text-xs text-muted-foreground font-medium">{country.name}</div>
                          </div>
                        ))}
                      </div>

                      {/* Row 4 - Moving Left */}
                      <div className="flex animate-scroll-left space-x-4">
                        {[
                          { flag: "🇦🇺", name: "Australia" },
                          { flag: "🇨🇦", name: "Canada" },
                          { flag: "🇲🇽", name: "Mexico" },
                          { flag: "🇦🇷", name: "Argentina" },
                          { flag: "🇿🇦", name: "S. Africa" },
                          { flag: "🇪🇬", name: "Egypt" },
                          { flag: "🇦🇺", name: "Australia" },
                          { flag: "🇨🇦", name: "Canada" },
                          { flag: "🇲🇽", name: "Mexico" },
                          { flag: "🇦🇷", name: "Argentina" },
                          { flag: "🇿🇦", name: "S. Africa" },
                          { flag: "🇪🇬", name: "Egypt" }
                        ].map((country, index) => (
                          <div key={index} className="flex-shrink-0 text-center">
                            <div className="text-4xl mb-2">{country.flag}</div>
                            <div className="text-xs text-muted-foreground font-medium">{country.name}</div>
                          </div>
                        ))}
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
          </div>
        </div>
      </section>
      {/* Setup Process Section */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Get Your AI Voice Agents Live in Seconds
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              As easy as it looks like! Launch your AI-powered voice automation—fast, seamless and free
            </p>
          </div>

          {/* Setup Process Image */}
          <div className="flex justify-center" data-aos="fade-up" data-aos-delay="200">
            <div className="relative max-w-5xl w-full">
              <img
                src={voiceAgentSetupProcess}
                alt="AI Voice Agent Setup Process - Step by step guide showing how to get your voice agents live in seconds"
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
                  <h2 className="sm:text-3xl lg:text-4xl font-bold text-white mb-4 text-[30px]">Cut costs, save time, and scale your support effortlessly!</h2>
                  <p className="text-purple-100 text-lg lg:text-xl mb-6 lg:mb-0 max-w-2xl">
                    Set up & Train your AI Voice Agent in Minutes. get started for free to start with no card required.
                  </p>
                </div>
                
                {/* Right CTA Button */}
                <div className="flex-shrink-0">
                  <button className="bg-white hover:bg-gray-50 text-purple-600 font-bold text-lg px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-3">
                    <span>Try For Free</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
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

export default Voice;