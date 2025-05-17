import { Button } from "@/components/ui/button";
import { MessageCircle, Phone } from "lucide-react";

const Agents = () => {
  const agentOptions = [
    {
      title: "Chatbot",
      icon: <MessageCircle className="h-6 w-6" />,
      description: "Train a chatbot on your content. 24/7 support agent.",
      price: "$50/mo",
      ctaText: "Try Now",
    },
    {
      title: "Voicebot",
      icon: <Phone className="h-6 w-6" />,
      description: "Automate calls & phone support.",
      price: "$200/mo",
      ctaText: "Try Now",
    }
  ];

  return (
    <section id="agents" className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            AI Agents
          </div>
          <h2 className="section-title mb-6">
            Launch a No-Code AI Chatbot or Voicebot in Minutes
          </h2>
          <p className="text-xl text-muted-foreground">
            Deploy intelligent AI assistants that handle customer inquiries, automate support, and scale your business operations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {agentOptions.map((agent, idx) => (
            <div 
              key={idx} 
              className="glass-effect rounded-2xl p-8 border border-border shadow-lg transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px]"
              data-aos="fade-up"
              data-aos-delay={idx * 100}
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                {agent.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3">{agent.title}</h3>
              <p className="text-muted-foreground mb-4">{agent.description}</p>
              <div className="text-xl font-bold text-primary mb-6">{agent.price}</div>
              <Button 
                className="rounded-full bg-primary hover:bg-primary/90 text-white font-semibold px-8"
                size="lg"
              >
                {agent.ctaText}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Agents;