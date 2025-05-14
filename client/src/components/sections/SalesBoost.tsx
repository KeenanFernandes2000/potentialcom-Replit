import { Button } from "@/components/ui/button";
import { TrendingUp, CheckCircle2, ChevronRight, BarChart2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const SalesBoost = () => {
  // Key benefits of sales AI
  const benefits = [
    "24/7 Lead Generation",
    "Automated Follow-ups",
    "Qualified Prospect Routing",
    "AI-enhanced Customer Insights"
  ];
  
  // Growth metrics
  const metrics = [
    { value: "50%", label: "More Leads" },
    { value: "35%", label: "Cost Reduction" },
    { value: "3x", label: "ROI" }
  ];

  return (
    <section id="sales-boost" className="py-24 bg-muted/30 dark:bg-secondary/5 relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div 
            className="lg:w-1/2"
            data-aos="fade-right"
          >
            <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <TrendingUp className="h-4 w-4 mr-2" /> Proven Results
            </div>
            
            <h2 className="section-title mb-6">
              AI Agents to <span className="text-primary">Boost Revenue</span>
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8">
              Our AI sales agents work 24/7 to generate leads, qualify prospects, and set appointments. 
              They integrate with your CRM and provide detailed analytics to optimize your sales funnel.
            </p>
            
            {/* Benefits list */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
            
            {/* Metrics cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {metrics.map((metric, index) => (
                <Card key={index} className="glass-effect border-border overflow-hidden">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl md:text-3xl font-bold text-primary mb-1">{metric.value}</div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Button 
              className="rounded-full bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-6"
              size="lg"
            >
              Boost Your Sales <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div 
            className="lg:w-1/2 relative"
            data-aos="fade-left"
          >
            <div className="relative">
              {/* Decorative frame */}
              <div className="absolute -top-4 -left-4 right-20 h-16 border-t-2 border-l-2 border-primary/30 rounded-tl-xl"></div>
              <div className="absolute -bottom-4 -right-4 left-20 h-16 border-b-2 border-r-2 border-primary/30 rounded-br-xl"></div>
              
              {/* Main image with overlay */}
              <div className="rounded-2xl overflow-hidden relative shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1539193143244-c83d9436d633?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                  alt="Modern sales technology interface" 
                  className="w-full h-auto rounded-2xl" 
                />
                
                {/* Image overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/30 to-transparent opacity-50"></div>
                
                {/* Stats floating card */}
                <div className="absolute top-6 right-6 glass-effect rounded-xl p-4 shadow-lg border border-border max-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart2 className="h-5 w-5 text-primary" />
                    <div className="font-medium">Sales Growth</div>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "75%" }}></div>
                  </div>
                  <div className="mt-2 text-xs text-right text-muted-foreground">
                    75% increase in 3 months
                  </div>
                </div>
                
                {/* Case study badge */}
                <div className="absolute bottom-6 left-6 bg-primary text-white text-xs py-1 px-3 rounded-full">
                  SUCCESS STORY
                </div>
              </div>
            </div>
            
            {/* Quote */}
            <blockquote className="mt-8 glass-effect p-6 rounded-xl italic border-l-4 border-primary">
              <p className="text-muted-foreground">
                "After implementing Potential's AI Sales Agents, we saw an immediate 45% increase in qualified leads with no additional staff."
              </p>
              <footer className="mt-2 text-sm font-medium">
                — Marketing Director, Fortune 500 Company
              </footer>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SalesBoost;
