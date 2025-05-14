import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Tools = () => {
  const tools = [
    {
      title: "Product Marketing Generator",
      description: "Generate AI-powered marketing content from your website URL."
    },
    {
      title: "Business Idea Generator",
      description: "Turn your passion into a profitable idea in minutes."
    },
    {
      title: "CSR Plan Generator",
      description: "Let AI suggest impactful CSR programs."
    },
    {
      title: "Press Release Generator",
      description: "Create press releases with AI-powered language."
    },
    {
      title: "Article Generator",
      description: "Generate articles on any topic with AI assistance."
    },
    {
      title: "Skin Expert",
      description: "Personalized skincare advice."
    },
    {
      title: "Business Plan Generator",
      description: "Build comprehensive plans with AI insights."
    },
    {
      title: "Fitness Planner",
      description: "Tailored fitness & diet programs."
    },
    {
      title: "Career Choice Tool",
      description: "Personalized career advice."
    }
  ];

  return (
    <section id="tools" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-[#0B1846] text-center mb-4">
          Explore Our Growing Library of Agentic AI Workflows
        </h2>
        <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
          Specialized AI tools designed to tackle specific business challenges
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <Card 
              key={index} 
              className="bg-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border-none"
              data-aos="fade-up"
              data-aos-delay={index * 50}
            >
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-[#0B1846] mb-2">{tool.title}</h3>
                <p className="text-gray-600 mb-4">{tool.description}</p>
                <a href="#" className="text-[#14B6B8] font-medium flex items-center group">
                  Try it now <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Tools;
