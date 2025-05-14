import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Solutions = () => {
  const solutions = [
    {
      title: "No-Code AI Chatbots",
      description: "Boost sales, cut costs, improve service, 24/7 … deploy without coding.",
      image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      alt: "AI Chatbot Interface"
    },
    {
      title: "AI Voice Agents",
      description: "Automate calls and reduce operational costs with human-like voice assistants.",
      image: "https://images.unsplash.com/photo-1589254065878-42c9da997008?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      alt: "AI Voice Assistant Technology"
    },
    {
      title: "AI Workflows",
      description: "Customizable agent teams to execute complex tasks seamlessly.",
      image: "https://images.unsplash.com/photo-1607798748738-b15c40d33d57?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      alt: "AI Workflow Automation"
    }
  ];

  return (
    <section id="solutions" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-[#0B1846] text-center mb-16">
          Our Agentic AI Solutions
        </h2>
        
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
          {solutions.map((solution, index) => (
            <Card 
              key={index} 
              className="bg-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border-none"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="h-48 bg-gray-200 relative">
                <img 
                  src={solution.image} 
                  alt={solution.alt} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-[#0B1846] mb-2">{solution.title}</h3>
                <p className="text-gray-600 mb-4">
                  {solution.description}
                </p>
                <a href="#" className="text-[#14B6B8] font-medium flex items-center group">
                  Learn More <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Solutions;
