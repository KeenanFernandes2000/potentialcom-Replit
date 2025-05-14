import { Rocket, Puzzle, HeadphonesIcon, Scale, BookOpen, History } from "lucide-react";

const Benefits = () => {
  const benefits = [
    {
      icon: <Rocket className="h-8 w-8" />,
      title: "Instant Productivity",
      description: "Ready in hours, not months. Get your AI agents up and running quickly."
    },
    {
      icon: <Puzzle className="h-8 w-8" />,
      title: "Seamless Integration",
      description: "Bolt-on to existing APIs and systems without disrupting workflows."
    },
    {
      icon: <HeadphonesIcon className="h-8 w-8" />,
      title: "Fully Supported Setup",
      description: "Dedicated team onboarding ensures a smooth transition to AI-powered workflows."
    },
    {
      icon: <Scale className="h-8 w-8" />,
      title: "Modular & Scalable",
      description: "Pricing grows with use-cases, allowing you to scale at your own pace."
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Pre-built Expertise",
      description: "100+ agent templates across Leadership, Sales, Operations, and more."
    },
    {
      icon: <History className="h-8 w-8" />,
      title: "20 Years of Empowerment",
      description: "Backed by two decades of experience in organizational transformation."
    }
  ];

  return (
    <section id="benefits" className="py-20 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-[#0B1846] text-center mb-16">
          Why Businesses Choose Our AI Agents
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="text-[#14B6B8] mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold text-[#0B1846] mb-2">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
