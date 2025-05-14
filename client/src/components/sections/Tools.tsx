import { ArrowRight, Sparkles, Star } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const Tools = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  const tools = [
    {
      title: "Product Marketing Generator",
      description: "Generate AI-powered marketing content from your website URL.",
      popular: true,
      category: "Marketing"
    },
    {
      title: "Business Idea Generator",
      description: "Turn your passion into a profitable idea in minutes.",
      popular: false,
      category: "Business"
    },
    {
      title: "CSR Plan Generator",
      description: "Let AI suggest impactful CSR programs.",
      popular: false,
      category: "Business"
    },
    {
      title: "Press Release Generator",
      description: "Create press releases with AI-powered language.",
      popular: true,
      category: "Marketing"
    },
    {
      title: "Article Generator",
      description: "Generate articles on any topic with AI assistance.",
      popular: false,
      category: "Content"
    },
    {
      title: "Skin Expert",
      description: "Personalized skincare advice for your unique needs.",
      popular: false,
      category: "Health"
    },
    {
      title: "Business Plan Generator",
      description: "Build comprehensive plans with AI insights.",
      popular: true,
      category: "Business"
    },
    {
      title: "Fitness Planner",
      description: "Tailored fitness & diet programs for your goals.",
      popular: false,
      category: "Health"
    },
    {
      title: "Career Choice Tool",
      description: "Personalized career advice based on your skills.",
      popular: false,
      category: "Career"
    }
  ];

  // Categories for filtering
  const categories = ["All", "Marketing", "Business", "Content", "Health", "Career"];

  return (
    <section id="tools" className="py-24 bg-background relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-muted/50 to-transparent"></div>
      
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4 mr-2" /> AI Workflows
          </div>
          <h2 className="section-title text-center">
            Explore Our Growing Library of <span className="text-primary">Agentic AI Workflows</span>
          </h2>
          <p className="text-lg text-muted-foreground mt-4">
            Specialized AI tools designed to tackle specific business challenges and drive innovation
          </p>
        </div>
        
        {/* Category filter pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category, i) => (
            <Badge
              key={i}
              variant={selectedCategory === category ? "default" : "outline"}
              className={`rounded-full px-4 py-2 text-sm cursor-pointer ${
                selectedCategory === category ? "bg-primary" : "hover:bg-primary/10"
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools
            .filter(tool => selectedCategory === "All" || tool.category === selectedCategory)
            .map((tool, index) => (
            <Card 
              key={index} 
              className="border border-border/50 rounded-lg overflow-hidden card-hover bg-background dark:bg-secondary/5 flex flex-col"
              data-aos="fade-up"
              data-aos-delay={index * 50}
            >
              <div className="h-1 bg-gradient-to-r from-primary/80 to-primary"></div>
              <CardContent className="p-3 flex-grow">
                <div className="flex justify-between items-center mb-1">
                  <Badge variant="outline" className="bg-muted/50 text-xs px-2 py-0 h-5">
                    {tool.category}
                  </Badge>
                  {tool.popular && (
                    <Badge className="bg-primary/10 text-primary border-none text-xs gap-1 px-2 py-0 h-5">
                      <Star className="h-3 w-3 fill-primary" /> Popular
                    </Badge>
                  )}
                </div>
                <h3 className="text-md font-semibold mb-1">{tool.title}</h3>
                <p className="text-muted-foreground text-xs">{tool.description}</p>
                <a 
                  href="https://ai.potential.com/rachel"
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="text-primary text-xs font-medium flex items-center group transition-colors hover:text-primary/80 mt-2"
                >
                  Learn more <ArrowRight className="ml-1 w-3 h-3 transition-transform group-hover:translate-x-1" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-6">
            Need a custom AI workflow for your specific business needs?
          </p>
          <a 
            href="https://ai.potential.com/rachel"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button 
              className="inline-flex items-center rounded-full bg-primary/10 hover:bg-primary/20 text-primary px-6 py-3 font-medium transition-colors"
            >
              Request Custom AI Solution <ArrowRight className="ml-1 w-4 h-4" />
            </button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Tools;
