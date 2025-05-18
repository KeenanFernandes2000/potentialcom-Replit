import { Button } from "@/components/ui/button";
import { MessageCircle, Bot, Send } from "lucide-react";
import veraAvatar from "@assets/vera-avatar.png";

const Vera = () => {
  const chatMessages = [
    {
      sender: "vera",
      message: "Hi there! I'm Vera, your AI business consultant. How can I help you today?",
      time: "Just now"
    },
    {
      sender: "user",
      message: "I'm looking to automate our customer support process.",
      time: "Just now"
    },
    {
      sender: "vera",
      message: "Great! I can recommend our AI Voice Agents and Chatbots specifically designed for customer support. Would you like me to explain how they work?",
      time: "Just now"
    }
  ];

  // Chat features as highlights
  const chatFeatures = [
    "24/7 Availability",
    "Custom Recommendations",
    "Human Handoff",
    "API Integration"
  ];

  return (
    <section id="vera" className="py-24 bg-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-muted/50 to-transparent"></div>
      <div className="absolute -left-20 bottom-20 w-40 h-40 rounded-full bg-primary/20 filter blur-3xl"></div>
      
      <div className="container">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div 
            className="lg:w-2/5 relative order-2 lg:order-1"
            data-aos="fade-right"
          >
            <div className="relative">
              {/* Decorative frame */}
              <div className="absolute -top-3 -left-3 right-20 h-20 border-t-2 border-l-2 border-primary/30 rounded-tl-2xl"></div>
              <div className="absolute -bottom-3 -right-3 w-28 h-28 border-b-2 border-r-2 border-primary/30 rounded-br-2xl"></div>
              
              {/* Main image with effects */}
              <div className="rounded-2xl overflow-hidden relative shadow-2xl">
                <img 
                  src={veraAvatar} 
                  alt="Vera, AI Business Consultant" 
                  className="w-full h-auto object-contain rounded-2xl bg-gradient-to-b from-background/10 to-primary/5" 
                />
                
                {/* Image overlay gradient - more subtle for the avatar */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-background/5 to-transparent"></div>
                
                {/* Badge overlay */}
                <div className="absolute bottom-6 left-6 right-6 glass-effect rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Vera - AI Consultant</div>
                      <div className="text-xs text-muted-foreground">Available 24/7 to assist you</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Feature badges */}
              <div className="absolute -right-4 top-1/4 transform translate-x-1/2 bg-background rounded-full px-4 py-2 shadow-md border border-border">
                <div className="text-xs font-medium flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span> Always Online
                </div>
              </div>
            </div>
            
            {/* Feature list */}
            <div className="mt-8 grid grid-cols-2 gap-3">
              {chatFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div 
            className="lg:w-3/5 order-1 lg:order-2"
            data-aos="fade-left"
          >
            <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <MessageCircle className="h-4 w-4 mr-2" /> AI Assistant
            </div>
            <h2 className="section-title mb-6">
              Meet <span className="text-primary">Vera</span>: Your 24/7 AI Business Consultant
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Vera is your intelligent assistant who answers your questions, matches you with the perfect AI Agents, and books meetings with human experts when needed. She's always available to guide your business growth journey.
            </p>
            <a 
              href="https://ai.potential.com/rachel"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button 
                className="rounded-full bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-6"
                size="lg"
              >
                Talk to Vera
              </Button>
            </a>
            
            {/* Chat Preview */}
            <div className="mt-12 glass-effect rounded-2xl overflow-hidden border border-border shadow-lg">
              <div className="bg-primary/5 p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Vera</div>
                    <div className="text-xs text-muted-foreground">Online</div>
                  </div>
                </div>
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
              </div>
              
              <div className="p-6">
                {chatMessages.map((chat, index) => (
                  <div 
                    key={index} 
                    className={`flex items-start gap-4 mb-5 ${chat.sender === 'user' ? 'justify-end' : ''}`}
                  >
                    {chat.sender === 'vera' && (
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <Bot className="h-5 w-5" />
                      </div>
                    )}
                    
                    <div className="max-w-[80%]">
                      <div className={`rounded-2xl p-4 ${
                        chat.sender === 'vera' 
                          ? 'bg-muted border border-border' 
                          : 'bg-primary/10 text-foreground'
                      }`}>
                        <p>
                          {chat.message}
                        </p>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {chat.time}
                      </div>
                    </div>
                    
                    {chat.sender === 'user' && (
                      <div className="w-10 h-10 rounded-full bg-secondary/50 dark:bg-secondary flex items-center justify-center text-secondary-foreground">
                        <span className="text-sm font-medium">You</span>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Chat input */}
                <div className="mt-6 flex items-center gap-2">
                  <input 
                    type="text" 
                    placeholder="Ask Vera a question..." 
                    className="flex-1 bg-muted rounded-full px-4 py-2 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button className="rounded-full w-10 h-10 p-0 flex items-center justify-center" size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Vera;