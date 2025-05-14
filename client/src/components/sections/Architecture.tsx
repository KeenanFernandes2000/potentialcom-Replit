import { Database, NetworkIcon, Code, Server, Workflow, GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Architecture = () => {
  // Integration partners
  const partners = [
    "Salesforce",
    "Microsoft",
    "AWS",
    "Slack",
    "Google Cloud",
    "SAP"
  ];

  // Technology stack items
  const technologies = [
    { name: "Serverless", icon: <Server className="h-4 w-4" /> },
    { name: "GraphQL API", icon: <Code className="h-4 w-4" /> },
    { name: "Event-Driven", icon: <Workflow className="h-4 w-4" /> },
    { name: "Microservices", icon: <GitBranch className="h-4 w-4" /> }
  ];

  return (
    <section id="architecture" className="py-24 bg-background relative">
      {/* Decorative backgrounds */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-muted/30 to-transparent"></div>
      
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <NetworkIcon className="h-4 w-4 mr-2" /> Technical Architecture
          </div>
          <h2 className="section-title text-center">
            API-Based <span className="text-primary">Agentic AI</span> Solution Architecture
          </h2>
          <p className="text-lg text-muted-foreground mt-4">
            We guide you in connecting AI agents to each other or to your existing systems via our secure API to supercharge productivity.
          </p>
        </div>
        
        <div 
          className="glass-effect p-8 rounded-2xl border border-border shadow-md mb-16"
          data-aos="fade-up"
        >
          <div className="relative p-6 rounded-xl">
            {/* Architecture diagram SVG - dark mode compatible */}
            <svg 
              className="w-full h-[350px] md:h-[450px]" 
              viewBox="0 0 1000 500" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Architecture diagram showing API connections between AI agents and systems"
            >
              {/* Background patterns */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 0 0 L 40 0 40 40 0 40 z" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1"/>
                </pattern>
                <linearGradient id="agentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="systemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="apiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              
              {/* Grid background */}
              <rect width="1000" height="500" fill="url(#grid)" />
              
              {/* Central API Hub */}
              <circle cx="500" cy="250" r="100" fill="url(#apiGradient)" stroke="hsl(var(--primary))" strokeWidth="2" />
              <text x="500" y="240" textAnchor="middle" className="fill-foreground" fontWeight="bold" fontSize="22">API Hub</text>
              <text x="500" y="270" textAnchor="middle" className="fill-muted-foreground" fontSize="14">Secure Gateway</text>
              
              {/* AI Agent Nodes */}
              <circle cx="250" cy="150" r="70" fill="url(#agentGradient)" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeDasharray="4,2" />
              <text x="250" y="140" textAnchor="middle" className="fill-foreground" fontWeight="bold" fontSize="16">AI Agent 1</text>
              <text x="250" y="165" textAnchor="middle" className="fill-muted-foreground" fontSize="12">Sales Automation</text>
              
              <circle cx="250" cy="350" r="70" fill="url(#agentGradient)" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeDasharray="4,2" />
              <text x="250" y="340" textAnchor="middle" className="fill-foreground" fontWeight="bold" fontSize="16">AI Agent 2</text>
              <text x="250" y="365" textAnchor="middle" className="fill-muted-foreground" fontSize="12">Customer Support</text>
              
              <circle cx="750" cy="150" r="70" fill="url(#systemGradient)" stroke="hsl(var(--secondary))" strokeWidth="1.5" strokeDasharray="4,2" />
              <text x="750" y="140" textAnchor="middle" className="fill-foreground" fontWeight="bold" fontSize="16">System 1</text>
              <text x="750" y="165" textAnchor="middle" className="fill-muted-foreground" fontSize="12">CRM Integration</text>
              
              <circle cx="750" cy="350" r="70" fill="url(#systemGradient)" stroke="hsl(var(--secondary))" strokeWidth="1.5" strokeDasharray="4,2" />
              <text x="750" y="340" textAnchor="middle" className="fill-foreground" fontWeight="bold" fontSize="16">System 2</text>
              <text x="750" y="365" textAnchor="middle" className="fill-muted-foreground" fontSize="12">ERP Integration</text>
              
              {/* Connection lines */}
              <line x1="310" y1="150" x2="400" y2="200" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="6,3" />
              <line x1="310" y1="350" x2="400" y2="300" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="6,3" />
              <line x1="600" y1="200" x2="690" y2="150" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="6,3" />
              <line x1="600" y1="300" x2="690" y2="350" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="6,3" />
              
              {/* Data flow indicators */}
              <circle cx="350" cy="175" r="8" fill="hsl(var(--primary))" />
              <circle cx="350" cy="325" r="8" fill="hsl(var(--primary))" />
              <circle cx="650" cy="175" r="8" fill="hsl(var(--primary))" />
              <circle cx="650" cy="325" r="8" fill="hsl(var(--primary))" />
              
              {/* Labels for connections */}
              <text x="350" y="120" textAnchor="middle" className="fill-muted-foreground" fontSize="12">Real-time data</text>
              <text x="650" y="120" textAnchor="middle" className="fill-muted-foreground" fontSize="12">Secure connection</text>
              <text x="350" y="400" textAnchor="middle" className="fill-muted-foreground" fontSize="12">Event triggers</text>
              <text x="650" y="400" textAnchor="middle" className="fill-muted-foreground" fontSize="12">Data sync</text>
            </svg>
            
            {/* Technology badges overlay */}
            <div className="absolute bottom-4 left-0 right-0 flex flex-wrap justify-center gap-2">
              {technologies.map((tech, index) => (
                <Badge 
                  key={index}
                  variant="outline"
                  className="glass-effect border-border text-foreground px-3 py-1 flex items-center gap-1"
                >
                  {tech.icon}
                  <span>{tech.name}</span>
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        {/* Partners section */}
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold mb-6">Integrates with Your Enterprise Tools</h3>
          <div 
            className="flex flex-wrap justify-center gap-6 items-center"
            data-aos="fade-up"
          >
            {partners.map((partner, index) => (
              <div 
                key={index} 
                className="px-5 py-3 rounded-lg bg-muted/70 dark:bg-secondary/20 font-medium text-sm border border-border"
              >
                <Database className="inline h-4 w-4 mr-2 text-primary" />
                {partner}
              </div>
            ))}
          </div>
        </div>
        
        {/* Technical note */}
        <div className="text-center text-muted-foreground text-sm max-w-2xl mx-auto">
          <p>Our API follows OpenAPI 3.0 specifications with comprehensive documentation and SDKs for all major programming languages.</p>
        </div>
      </div>
    </section>
  );
};

export default Architecture;
