import { Button } from "@/components/ui/button";
import {
  UserPlus,
  GraduationCap,
  HeadphonesIcon,
  BarChart4,
  Trophy,
  ClipboardList,
  Users,
  ShoppingBag,
  Heart,
  Award,
} from "lucide-react";

const Platforms = () => {
  const platforms = [
    {
      title: "CRM Lite",
      icon: <UserPlus className="h-6 w-6" />,
      description: "Simple customer relationship management",
      features: [
        "Customer data organization",
        "Lead tracking",
        "AI-powered insights",
      ],
    },
    {
      title: "LMS Lite",
      icon: <GraduationCap className="h-6 w-6" />,
      description: "Easy learning management system",
      features: [
        "Course creation tools",
        "Student progress tracking",
        "AI tutoring integration",
      ],
    },
    {
      title: "Support Desk",
      icon: <HeadphonesIcon className="h-6 w-6" />,
      description: "Customer support solution",
      features: ["Ticket management", "Knowledge base", "AI auto-responses"],
    },
    {
      title: "KPI Tracker",
      icon: <BarChart4 className="h-6 w-6" />,
      description: "Performance metrics dashboard",
      features: [
        "Custom KPI monitoring",
        "Team performance tracking",
        "AI prediction insights",
      ],
    },
    {
      title: "Hackathon Platform",
      icon: <Trophy className="h-6 w-6" />,
      description: "Innovation and competition management",
      features: [
        "Team formation tools",
        "Submission management",
        "AI-based judging assistance",
      ],
    },
    {
      title: "Project Manager",
      icon: <ClipboardList className="h-6 w-6" />,
      description: "Streamlined task and project management",
      features: [
        "Task assignment and tracking",
        "Progress visualization",
        "AI resource optimization",
      ],
    },
    {
      title: "Coaching and Mentoring",
      icon: <Users className="h-6 w-6" />,
      description: "Personalized development and guidance",
      features: [
        "Skills assessment and roadmapping",
        "Personalized coaching sessions",
        "AI-guided personal development",
      ],
    },
    {
      title: "Marketplace",
      icon: <ShoppingBag className="h-6 w-6" />,
      description: "Connect buyers and sellers in your ecosystem",
      features: [
        "Product and service listings",
        "Secure transaction processing",
        "AI-powered recommendations",
      ],
    },
    {
      title: "Social Impact",
      icon: <Heart className="h-6 w-6" />,
      description: "Drive positive change in communities",
      features: [
        "Impact tracking and measurement",
        "Community engagement tools",
        "AI-powered social initiative planning",
      ],
    },
    {
      title: "Public Certification",
      icon: <Award className="h-6 w-6" />,
      description: "Verification and empowerment programs",
      features: [
        "Skill certification systems",
        "Digital credential management",
        "AI-guided learning paths",
      ],
    },
  ];

  return (
    <section id="platforms" className="py-20">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Micro Platforms
          </div>
          <h2 className="section-title mb-6">AI-Linked Micro Platforms</h2>
          <p className="text-xl text-muted-foreground">
            Lightweight systems that integrate with our AI agents to deliver
            specific business functionality without the complexity of enterprise
            software.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {platforms.map((platform, idx) => (
            <div
              key={idx}
              className="glass-effect rounded-2xl p-6 border border-border transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px]"
              data-aos="fade-up"
              data-aos-delay={idx * 100}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                {platform.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{platform.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {platform.description}
              </p>

              <ul className="space-y-2 mb-6">
                {platform.features.map((feature, i) => (
                  <li key={i} className="flex items-start text-sm">
                    <div className="mr-2 mt-0.5 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant="outline"
                className="w-full rounded-full hover:bg-primary hover:text-white gtm-platforms-learn-more"
                onClick={() => window.location.href = "/vera"}
              >
                Learn More
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Platforms;
