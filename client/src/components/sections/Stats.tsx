import { Award, Globe, Target } from "lucide-react";

const Stats = () => {
  const stats = [
    {
      value: "1M+",
      label: "Empowered stakeholders",
      icon: <Globe className="h-6 w-6" />,
      description: "Organizations leveraging our AI solutions worldwide"
    },
    {
      value: "1B+",
      label: "AI Agent tasks",
      icon: <Target className="h-6 w-6" />,
      description: "Tasks automated and optimized through our AI agents"
    },
    {
      value: "20",
      label: "Years of Innovation",
      icon: <Award className="h-6 w-6" />,
      description: "Two decades of experience in organizational transformation" 
    }
  ];

  return (
    <section id="stats" className="py-24 bg-muted/30 dark:bg-secondary/5 relative">
      {/* Decorative patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="section-title text-center">
            Trusted by <span className="text-primary">Innovators Worldwide</span>
          </h2>
          <p className="text-lg text-muted-foreground mt-4">
            Our AI solutions have made a significant impact across industries and continents
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="glass-effect border border-border/50 rounded-2xl p-8 text-center card-hover"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 text-primary">
                {stat.icon}
              </div>
              
              <div className="text-5xl font-bold text-primary mb-3 font-mono">
                {stat.value}
              </div>
              
              <h3 className="text-xl font-semibold mb-3">
                {stat.label}
              </h3>
              
              <p className="text-muted-foreground">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
        
        {/* Trust badges */}
        <div className="mt-20 flex flex-wrap justify-center gap-6 items-center">
          <div className="py-2 px-4 rounded-full bg-muted/70 dark:bg-secondary/30 text-sm font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            99.9% Uptime
          </div>
          <div className="py-2 px-4 rounded-full bg-muted/70 dark:bg-secondary/30 text-sm font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            GDPR Compliant
          </div>
          <div className="py-2 px-4 rounded-full bg-muted/70 dark:bg-secondary/30 text-sm font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            ISO 27001 Certified
          </div>
          <div className="py-2 px-4 rounded-full bg-muted/70 dark:bg-secondary/30 text-sm font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            SOC 2 Compliant
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
