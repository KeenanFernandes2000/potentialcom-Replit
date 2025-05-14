import { Button } from "@/components/ui/button";

const Vera = () => {
  const chatMessages = [
    {
      sender: "vera",
      message: "Hi there! I'm Vera, your AI business consultant. How can I help you today?"
    },
    {
      sender: "user",
      message: "I'm looking to automate our customer support process."
    },
    {
      sender: "vera",
      message: "Great! I can recommend our AI Voice Agents and Chatbots specifically designed for customer support. Would you like me to explain how they work?"
    }
  ];

  return (
    <section id="vera" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div 
            className="md:w-2/5 relative"
            data-aos="fade-right"
          >
            {/* Vera image */}
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000" 
              alt="Vera, AI Business Consultant" 
              className="rounded-xl shadow-lg w-full h-auto object-cover" 
            />
            
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-[#14B6B8]/20 rounded-full"></div>
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-[#0B1846]/10 rounded-full"></div>
          </div>
          
          <div 
            className="md:w-3/5"
            data-aos="fade-left"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#0B1846] mb-6">
              Meet Vera: Your 24/7 AI Business Consultant
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Vera is your intelligent assistant who answers your questions, matches you with the perfect AI Agents, and books meetings with human experts when needed. She's always available to guide your business growth journey.
            </p>
            <Button 
              className="rounded-full bg-[#14B6B8] hover:bg-[#14B6B8]/90 text-white font-bold uppercase px-8 py-6"
            >
              Talk to Vera
            </Button>
            
            {/* Chat Preview */}
            <div className="mt-12 bg-gray-100 rounded-xl p-6 shadow-sm">
              {chatMessages.map((chat, index) => (
                <div 
                  key={index} 
                  className={`flex items-start gap-4 mb-4 ${chat.sender === 'user' ? 'justify-end' : ''}`}
                >
                  {chat.sender === 'vera' && (
                    <div className="w-10 h-10 rounded-full bg-[#14B6B8] flex items-center justify-center text-white">
                      V
                    </div>
                  )}
                  
                  <div className={`rounded-lg p-4 ${chat.sender === 'vera' ? 'bg-white shadow-sm' : 'bg-[#0B1846]/10'}`}>
                    <p className="text-gray-700">
                      {chat.message}
                    </p>
                  </div>
                  
                  {chat.sender === 'user' && (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white">
                      Y
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Vera;
