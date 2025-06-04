import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useTheme } from "next-themes";
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
  TrendingUp
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

const Voice = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  // Refresh AOS animations on route change
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).AOS) {
      (window as any).AOS.refresh();
    }
  }, []);

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
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
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

          {/* Inbound and Outbound Sections */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            
            {/* Inbound Call Automation */}
            <div data-aos="fade-right" data-aos-delay="100">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mr-4">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-foreground">
                  Inbound Call Automation
                </h3>
              </div>
              <p className="text-muted-foreground mb-8 text-lg">
                Handle incoming calls with smart, AI-driven responses—enhance customer satisfaction while boosting your team's efficiency.
              </p>
              
              <div className="space-y-6">
                {[
                  {
                    icon: Calendar,
                    title: "Appointment Bookings",
                    description: "Let your AI Voice Agent schedule, confirm, and update appointments—no manual work needed, just seamless automation that saves time."
                  },
                  {
                    icon: Headphones,
                    title: "Customer Support",
                    description: "Deliver real-time support with direct access to your systems—AI Voice Agents fetch accurate, up-to-date info with zero hassle."
                  },
                  {
                    icon: HelpCircle,
                    title: "Answer FAQs",
                    description: "Cut down on repetitive calls by instantly resolving common customer queries—your AI Voice Agent has the answers 24/7."
                  },
                  {
                    icon: Package,
                    title: "Order Tracking",
                    description: "Empower customers to get real-time updates on their orders and services—eliminating the need for live agents to handle routine checks."
                  },
                  {
                    icon: Info,
                    title: "Product Assistance",
                    description: "Guide customers with detailed product information and help them make informed decisions—your AI Voice Agent becomes a product expert."
                  },
                  {
                    icon: Settings,
                    title: "Custom Agents",
                    description: "Build and personalize AI Voice Agents in minutes to match any business scenario—no technical skills required, just powerful results."
                  }
                ].map((feature, index) => (
                  <div 
                    key={index} 
                    className="bg-background rounded-xl p-6 shadow-sm border border-border/50 hover:shadow-md transition-all duration-300"
                    data-aos="fade-up" 
                    data-aos-delay={150 + index * 50}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <feature.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Outbound Call Automation */}
            <div data-aos="fade-left" data-aos-delay="200">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mr-4">
                  <PhoneCall className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-foreground">
                  Outbound Call Automation
                </h3>
              </div>
              <p className="text-muted-foreground mb-8 text-lg">Reach more customers in less time with AI Voice Agents that handle outbound calls at scale—boost productivity and drive better results.</p>
              
              <div className="space-y-6">
                {[
                  {
                    icon: Target,
                    title: "Sales Outreach",
                    description: "Proactively engage leads and introduce your products or services—convert cold calls into closed deals with smart, human-like conversations."
                  },
                  {
                    icon: Users,
                    title: "Lead Prequalification",
                    description: "Let AI Voice Agents filter and qualify leads before handing them to your sales team—focus only on high-potential prospects and speed up conversions."
                  },
                  {
                    icon: CheckCircle,
                    title: "Appointment Confirmations",
                    description: "Send reminders, confirm bookings, and adjust appointments through automated calls—ensuring a smooth, professional experience every time."
                  },
                  {
                    icon: MessageSquare,
                    title: "Customer Surveys",
                    description: "Automatically reach out to customers for feedback—gain real insights to enhance your service and measure satisfaction in real time."
                  },
                  {
                    icon: TrendingUp,
                    title: "Upselling",
                    description: "Stay in touch with existing customers to renew subscriptions or offer complementary products—maximize lifetime value with zero manual effort."
                  },
                  {
                    icon: Settings,
                    title: "Custom Agents",
                    description: "Build and personalize AI Voice Agents in minutes to match any business scenario—no technical skills required, just powerful results."
                  }
                ].map((feature, index) => (
                  <div 
                    key={index} 
                    className="bg-background rounded-xl p-6 shadow-sm border border-border/50 hover:shadow-md transition-all duration-300"
                    data-aos="fade-up" 
                    data-aos-delay={250 + index * 50}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <feature.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16" data-aos="fade-up" data-aos-delay="400">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 h-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Try For Free
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Set up your AI Voice Agent in under 60 seconds
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Voice;