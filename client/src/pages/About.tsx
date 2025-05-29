import React from "react";
import {
  Globe,
  Users,
  Award,
  BarChart,
  Lightbulb,
  Clock,
  Zap,
  Building,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function About() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="py-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background z-0"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                About Potential.com
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                For over 20 years, we've been empowering millions
                globally—helping businesses, governments, and communities
                unleash their full potential.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                <p className="text-lg mb-6">
                  Driven by innovation and guided by a powerful mission—
                  <span className="font-semibold">
                    Empowering businesses and their stakeholders to thrive,
                    together
                  </span>
                  —we've continuously anticipated change rather than merely
                  adapting to it.
                </p>
                <p className="text-lg mb-6">
                  Today, we're revolutionizing industries through practical,
                  rapidly-deployable AI Agents, instantly expanding teams,
                  boosting productivity, and redefining possibilities.
                </p>
                <p className="text-lg font-medium">
                  At Potential.com, the future isn't coming—it's already here.
                  Join us, and unlock your limitless potential.
                </p>
              </div>
              <div className="bg-muted/30 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-border">
                <h3 className="text-2xl font-bold mb-6">Key Highlights</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-3 mt-1" />
                    <span>20+ years empowering organizations globally</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-3 mt-1" />
                    <span>Practical and rapidly-deployable AI solutions</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-3 mt-1" />
                    <span>
                      Worked with Fortune 500 companies and governments
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-3 mt-1" />
                    <span>Continuously innovating to anticipate change</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-3 mt-1" />
                    <span>Committed to sustainable growth and impact</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Our Approach Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">
                Our Approach to Empowerment
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Lessons from 20 years of empowering organizations around the
                world
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-background/60 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-border h-full">
                <div className="p-3 bg-primary/10 rounded-full w-fit mb-6">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Practical Solutions</h3>
                <p className="text-muted-foreground">
                  Effective empowerment starts with solutions that are easy to
                  understand, quick to implement, and deliver measurable
                  results. We focus on practical applications that drive real
                  value.
                </p>
              </div>

              <div className="bg-background/60 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-border h-full">
                <div className="p-3 bg-primary/10 rounded-full w-fit mb-6">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">
                  Technology as an Enabler
                </h3>
                <p className="text-muted-foreground">
                  Real success comes from carefully applying technology in a
                  targeted, user-centric manner—not by simply chasing new
                  trends. We leverage technology to enable human potential, not
                  replace it.
                </p>
              </div>

              <div className="bg-background/60 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-border h-full">
                <div className="p-3 bg-primary/10 rounded-full w-fit mb-6">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Incremental Progress</h3>
                <p className="text-muted-foreground">
                  Sustained empowerment needs incremental wins. Continuous,
                  incremental success builds confidence, capability, and
                  momentum, which fuels deeper and more transformative change.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* AI Empowerment Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">
                Amplifying Potential with AI
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Today, we're leveraging our proven methodology to empower
                organizations through the most transformative technology yet:
                Artificial Intelligence
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h3 className="text-2xl font-bold mb-6">
                  How We Amplify Intelligence
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-3 rounded-full mr-4">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">
                        Amplify Human Capabilities
                      </h4>
                      <p className="text-muted-foreground">
                        Our AI agents work alongside human teams, automating
                        routine tasks and freeing employees for strategic,
                        high-value activities.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-primary/10 p-3 rounded-full mr-4">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">
                        Instant Productivity Gains
                      </h4>
                      <p className="text-muted-foreground">
                        AI-driven chat and voice bots dramatically enhance
                        internal and external communication, delivering
                        immediate productivity boosts.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-primary/10 p-3 rounded-full mr-4">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Process Automation</h4>
                      <p className="text-muted-foreground">
                        Rapid and accurate process automation reduces
                        operational costs, increases operational accuracy, and
                        enables faster decision-making.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-primary/10 p-3 rounded-full mr-4">
                      <Lightbulb className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">
                        Innovation Acceleration
                      </h4>
                      <p className="text-muted-foreground">
                        AI's rapid prototyping capabilities allow organizations
                        to validate new ideas swiftly, reducing traditional
                        development cycles from months to days.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-muted/50 backdrop-blur-sm rounded-lg p-6 shadow-md border border-border text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    51%
                  </div>
                  <p className="text-muted-foreground">
                    of consumers prefer interactions with AI due to 24/7
                    availability and quicker resolutions
                  </p>
                </div>

                <div className="bg-muted/50 backdrop-blur-sm rounded-lg p-6 shadow-md border border-border text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    30%
                  </div>
                  <p className="text-muted-foreground">
                    reduction in operational costs reported by companies using
                    AI-driven automation
                  </p>
                </div>

                <div className="bg-muted/50 backdrop-blur-sm rounded-lg p-6 shadow-md border border-border text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    77%
                  </div>
                  <p className="text-muted-foreground">
                    of organizations recognize the importance of AI for
                    organizational success
                  </p>
                </div>

                <div className="bg-muted/50 backdrop-blur-sm rounded-lg p-6 shadow-md border border-border text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    20-30%
                  </div>
                  <p className="text-muted-foreground">
                    productivity loss from manual tasks that can be automated
                    with AI solutions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Our Global Impact</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Over two decades, Potential.com has worked alongside Fortune 500
                companies, global governments, and impactful organizations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              <div className="bg-background/60 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-border text-center">
                <div className="text-5xl font-bold text-primary mb-4">20+</div>
                <p className="text-lg font-medium">Years of Experience</p>
              </div>

              <div className="bg-background/60 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-border text-center">
                <div className="text-5xl font-bold text-primary mb-4">
                  Millions
                </div>
                <p className="text-lg font-medium">People Empowered</p>
              </div>

              <div className="bg-background/60 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-border text-center">
                <div className="text-5xl font-bold text-primary mb-4">
                  Global
                </div>
                <p className="text-lg font-medium">Reach & Impact</p>
              </div>

              <div className="bg-background/60 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-border text-center">
                <div className="text-5xl font-bold text-primary mb-4">
                  Fortune 500
                </div>
                <p className="text-lg font-medium">Client Partnerships</p>
              </div>
            </div>

            <div className="text-center">
              <Button
                size="lg"
                className="rounded-full px-8 gtm-about-partner-with-us"
                onClick={() => (window.location.href = "/partner")}
              >
                Partner With Us
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
