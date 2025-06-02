import React from "react";
import {
  Handshake,
  Award,
  BarChart,
  Users,
  Globe,
  HeartHandshake,
  BadgeCheck,
  GraduationCap,
  Check,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BecomePartner from "@/components/sections/BecomePartner";
import { AutoSEO } from "@/components/SEO";

// Partner benefit component
interface BenefitProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const Benefit = ({ icon: Icon, title, description }: BenefitProps) => (
  <div className="flex flex-col items-center text-center bg-secondary/20 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-secondary-foreground/10 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl">
    <div className="bg-primary/10 p-4 rounded-full mb-4">
      <Icon className="h-10 w-10 text-primary" />
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

// Partner type component
interface PartnerTypeProps {
  title: string;
  description: string;
  benefits: string[];
}

const PartnerType = ({ title, description, benefits }: PartnerTypeProps) => (
  <div className="bg-secondary/20 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-secondary-foreground/10 h-full flex flex-col">
    <h3 className="text-2xl font-bold mb-3">{title}</h3>
    <p className="mb-6 text-muted-foreground">{description}</p>
    <div className="space-y-3 mt-auto">
      <h4 className="font-semibold">Benefits</h4>
      <ul className="space-y-2">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default function Partner() {
  return (
    <div className="min-h-screen">
      <AutoSEO />
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="py-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background z-0"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <div className="inline-block p-3 bg-primary/10 rounded-full mb-4">
                <Handshake className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Partner with Potential.com
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Join our growing ecosystem of innovative partners who are
                transforming organizations through AI-powered solutions
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">
                  Expand Your Capabilities with Our Partner Program
                </h2>
                <p className="text-lg mb-6">
                  Our partner program is designed to help organizations leverage
                  Potential.com's AI agent ecosystem to create new
                  opportunities, enhance customer value, and accelerate business
                  growth.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-full mr-4">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Recognition</h3>
                      <p className="text-muted-foreground">
                        Join our partner directory and earn badges for your
                        expertise
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-full mr-4">
                      <BarChart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Growth</h3>
                      <p className="text-muted-foreground">
                        Access new markets and expand your service offerings
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-full mr-4">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Community</h3>
                      <p className="text-muted-foreground">
                        Collaborate with other innovative partners in our
                        ecosystem
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="mt-8 gtm-partner-become-partner"
                  onClick={() =>
                    document
                      .getElementById("become-partner")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Become a Partner
                </Button>
              </div>
              <div className="flex justify-center">
                <div className="bg-secondary/20 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-secondary-foreground/10 max-w-md">
                  <h3 className="text-2xl font-bold mb-4">
                    Why Partner With Us
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-1" />
                      <span>Access to cutting-edge AI agent technology</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-1" />
                      <span>Comprehensive partner enablement resources</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-1" />
                      <span>Joint marketing and co-selling opportunities</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-1" />
                      <span>Technical support and implementation guidance</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-1" />
                      <span>Revenue sharing and incentive programs</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4 bg-secondary/20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">
                How We Empower Our Partners
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Our comprehensive partner program provides everything you need
                to succeed
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Benefit
                icon={HeartHandshake}
                title="Co-Selling Support"
                description="Collaborate with our sales team to identify opportunities and close deals together"
              />
              <Benefit
                icon={BadgeCheck}
                title="Certifications"
                description="Earn official certifications that demonstrate your expertise with our platform"
              />
              <Benefit
                icon={GraduationCap}
                title="Training Resources"
                description="Access comprehensive training programs to build technical proficiency"
              />
              <Benefit
                icon={Globe}
                title="Market Expansion"
                description="Reach new markets and industries through our established global presence"
              />
              <Benefit
                icon={Users}
                title="Partner Community"
                description="Join a vibrant community of partners to share best practices and insights"
              />
              <Benefit
                icon={BarChart}
                title="Growth Opportunities"
                description="Unlock new revenue streams and business opportunities through AI innovation"
              />
            </div>
          </div>
        </section>

        {/* Partner Types Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Partner Types</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                We offer different partnership models to suit your
                organization's goals and capabilities
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <PartnerType
                title="Solutions Partners"
                description="For consulting firms and system integrators that want to implement our AI solutions for their clients."
                benefits={[
                  "Implementation expertise development",
                  "Project-based revenue opportunities",
                  "Client satisfaction improvements",
                  "Value-added service offerings",
                ]}
              />
              <PartnerType
                title="Technology Partners"
                description="For software providers looking to integrate with our platform and create enhanced joint solutions."
                benefits={[
                  "API and integration support",
                  "Joint solution development",
                  "Co-marketing opportunities",
                  "Technical collaboration",
                ]}
              />
              <PartnerType
                title="Referral Partners"
                description="For organizations that want to refer clients to us while focusing on their core business."
                benefits={[
                  "Referral commissions",
                  "Minimal resource investment",
                  "Complementary solution offering",
                  "Enhanced client relationships",
                ]}
              />
            </div>
          </div>
        </section>

        {/* Partner Application Form */}
        <BecomePartner />
      </main>
      <Footer />
    </div>
  );
}
