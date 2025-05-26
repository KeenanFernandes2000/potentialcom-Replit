import { BookOpen, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";

const Learn = () => {
  const resources = [
    {
      title: "Blog / Use Cases",
      description: "Explore real-world applications and success stories",
      icon: <BookOpen className="h-5 w-5" />,
      link: "/blog/",
    },
    {
      title: "AI Amplify",
      description: "Learn how to maximize your AI investment",
      icon: <BarChart className="h-5 w-5" />,
      link: "https://www.potential.com/blog/ai-amplify",
    },
  ];

  return (
    <section id="learn" className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Resources
          </div>
          <h2 className="section-title mb-6">Learn & Explore</h2>
          <p className="text-xl text-muted-foreground">
            Discover how our AI solutions can transform your business through
            our educational resources
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {resources.map((resource, idx) => (
            <a
              key={idx}
              href={resource.link}
              className="glass-effect rounded-xl p-6 border border-border transition-all duration-300 hover:shadow-lg hover:border-primary/30 group"
              data-aos="fade-up"
              data-aos-delay={idx * 100}
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                {resource.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{resource.title}</h3>
              <p className="text-sm text-muted-foreground">
                {resource.description}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Learn;
