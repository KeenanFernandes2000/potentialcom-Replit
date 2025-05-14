import { Card, CardContent } from "@/components/ui/card";

const GettingStarted = () => {
  const steps = [
    {
      number: "01",
      title: "Select Your Agent",
      description: "Choose from 100+ templates designed for specific business functions"
    },
    {
      number: "02",
      title: "Customize & Integrate",
      description: "Connect to existing workflows and tailor the agent to your needs"
    },
    {
      number: "03",
      title: "Measure Immediate Impact",
      description: "Track performance and ROI in real-time with our dashboard"
    }
  ];

  const features = [
    {
      title: "Simple Setup",
      description: "We handle the technical complexity so you can focus on results"
    },
    {
      title: "Instant Results",
      description: "See productivity improvements from day one"
    },
    {
      title: "AI Adoption Support",
      description: "Dedicated team helps your staff embrace AI collaboration"
    }
  ];

  return (
    <section id="getting-started" className="py-20 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-[#0B1846] text-center mb-16">
          Get Started with AI Agents
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="text-center"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="w-20 h-20 rounded-full bg-[#14B6B8]/10 flex items-center justify-center mx-auto mb-6">
                <div className="text-[#14B6B8] text-3xl font-bold">{step.number}</div>
              </div>
              <h3 className="text-xl font-semibold text-[#0B1846] mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
        
        <Card 
          className="bg-white rounded-2xl shadow-sm"
          data-aos="fade-up"
        >
          <CardContent className="p-8 md:p-12">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {features.map((feature, index) => (
                <div key={index}>
                  <h3 className="text-xl font-semibold text-[#0B1846] mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default GettingStarted;
