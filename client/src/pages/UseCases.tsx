import { useState, useMemo, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { X, Check, ChevronDown, Hotel, Stethoscope, ShoppingCart, Users, Car, Building2, GraduationCap, Plane, Utensils, Dumbbell, Home, Briefcase, PhoneCall, FileText, Wrench, Microscope, UserPlus, Store, Banknote, HeadphonesIcon, Calculator, MapPin, Clock, BookOpen, BarChart3, Phone, Calendar, Mail, Ticket, Bot, Database, Factory } from "lucide-react";
import { SEO } from "@/components/SEO";
import { AIChatbotForm } from "@/components/AIChatbotForm";
import { AIVoiceAgentForm } from "@/components/AIVoiceAgentForm";

// Import all customer logos
import adgmLogo from "@assets/Customer Logos/ADGM logo.png";
import airbusLogo from "@assets/Customer Logos/Airbus Logo.png";
import bankMuscatLogo from "@assets/Customer Logos/Bank mUscat logo.png";
import cartierLogo from "@assets/Customer Logos/Cartier logo.png";
import ciscoLogo from "@assets/Customer Logos/Cisco Logo.png";
import dctLogo from "@assets/Customer Logos/DCT Logo.png";
import dldLogo from "@assets/Customer Logos/DLD Logo.png";
import dellLogo from "@assets/Customer Logos/Dell logo.png";
import edbLogo from "@assets/Customer Logos/EDB logo.png";
import fordLogo from "@assets/Customer Logos/Ford logo.png";
import googleLogo from "@assets/Customer Logos/Google logo.png";
import govAbuDhabiLogo from "@assets/Customer Logos/Government of Abu Dhabi logo.png";
import govDubaiLogo from "@assets/Customer Logos/Government of Dubai logo.png";
import hsbcLogo from "@assets/Customer Logos/HSBC logo.png";
import inditexLogo from "@assets/Customer Logos/Inditex logo.png";
import khalifaFundLogo from "@assets/Customer Logos/Khalifa Fund logo.png";
import mbcLogo from "@assets/Customer Logos/MBC logo.png";
import microsoftLogo from "@assets/Customer Logos/Microsoft logo.png";
import nestleLogo from "@assets/Customer Logos/Nestle Logo.png";
import pepsicoLogo from "@assets/Customer Logos/Pepsico logo.png";
import unWomenLogo from "@assets/Customer Logos/UN Women logo.png";
import unLogo from "@assets/Customer Logos/UN logo.png";
import visaLogo from "@assets/Customer Logos/Visa logo.png";
import wfzoLogo from "@assets/Customer Logos/WFZO logo.png";
import intelLogo from "@assets/Customer Logos/intel logo.png";



// Map of use case icons
const useCaseIcons = {
  hotel: Hotel,
  healthcare: Stethoscope,
  ecommerce: ShoppingCart,
  hr: Users,
  automotive: Car,
  realestate: Building2,
  education: GraduationCap,
  travel: Plane,
  restaurants: Utensils,
  fitness: Dumbbell,
  insurance: FileText,
  sales: PhoneCall,
  techsupport: Wrench,
  consulting: Briefcase,
  finance: Building2,
  retail: Home
};

// Icons for different industries
const industryIcons = {
  "Room Service": "🚪",
  "Receptionist": "🛎️",
  "Concierge": "🌟",
  "Customer Support": "💬",
  "Ecommerce": "🛍️",
  "Sales": "🧑‍💼",
  "HR": "🧑‍🏫",
  "Marketing": "📣"
};

// Map agent titles to their respective images using direct file paths
const agentImages: { [key: string]: string } = {
  "Receptionist AI Agent": "/assets/images/AI Employees/Receptionist AI Agent.png",
  "Room Service AI Agent": "/assets/images/AI Employees/Room Service AI Agent.png",
  "Concierge AI Agent": "/assets/images/AI Employees/Concierge AI Agent.png",
  "Customer Support AI Agent": "/assets/images/AI Employees/Customer Support AI Agent.png",
  "Ecommerce Sales AI Agent": "/assets/images/AI Employees/Ecommerce Sales AI Agent.png",
  "Sales AI Agent": "/assets/images/AI Employees/Sales AI Agent.png",
  "HR/Training AI Agent": "/assets/images/AI Employees/HR:Training AI Agent.png",
  "Marketing & Outreach AI Agent": "/assets/images/AI Employees/Marketing & Outreach AI Agent.png"
};

// Use cases data
const useCases = [
  {
    id: 1,
    icon: "hotel",
    title: "Receptionist AI Agent",
    description: "Greets users, answers calls/chats, books appointments, and routes them to the right place.",
    tasks: ["Book Appointments", "Answer Queries", "Send Confirmations", "Route to Human"],
    channels: ["Phone", "Website", "WhatsApp"],
    interface: ["Voice", "Chat"],
    industry: "Receptionist",
    videoUrl: "https://example.com/receptionist-demo"
  },
  {
    id: 2,
    icon: "hotel",
    title: "Room Service AI Agent",
    description: "Takes guest requests like food orders, amenity needs, and checkout extensions.",
    tasks: ["Place Orders", "Track Orders", "Send Confirmations", "Answer Queries"],
    channels: ["Phone", "WhatsApp"],
    interface: ["Voice", "Chat"],
    industry: "Room Service",
    videoUrl: "https://example.com/room-service-demo"
  },
  {
    id: 3,
    icon: "hotel",
    title: "Concierge AI Agent",
    description: "Assists hotel guests, patients, or clients with bookings, directions, and service requests.",
    tasks: ["Book Appointments", "Suggest Products/Services", "Answer Queries"],
    channels: ["Phone", "Website", "WhatsApp"],
    interface: ["Voice", "Chat"],
    industry: "Concierge",
    videoUrl: "https://example.com/concierge-demo"
  },
  {
    id: 4,
    icon: "techsupport",
    title: "Customer Support AI Agent",
    description: "Handles FAQs, returns, escalations, policy questions, and ticketing 24/7.",
    tasks: ["Answer Queries", "Troubleshoot Issues", "Route to Human", "Track Orders"],
    channels: ["Website", "WhatsApp", "Phone"],
    interface: ["Voice", "Chat"],
    industry: "Customer Support",
    videoUrl: "https://example.com/customer-support-demo"
  },
  {
    id: 5,
    icon: "ecommerce",
    title: "Ecommerce Sales AI Agent",
    description: "Acts as a personal shopping assistant — understands customer needs and suggests the right products.",
    tasks: ["Suggest Products/Services", "Place Orders", "Answer Queries", "Follow Up", "Track Orders"],
    channels: ["Website", "WhatsApp", "Phone"],
    interface: ["Voice", "Chat"],
    industry: "Ecommerce",
    videoUrl: "https://example.com/ecommerce-sales-demo"
  },
  {
    id: 6,
    icon: "sales",
    title: "Sales AI Agent",
    description: "Qualifies leads, recommends solutions, follows up automatically, and closes more deals.",
    tasks: ["Capture Leads", "Suggest Products/Services", "Follow up"],
    channels: ["Phone", "Website", "WhatsApp"],
    interface: ["Voice", "Chat"],
    industry: "Sales",
    videoUrl: "https://example.com/sales-demo"
  },
  {
    id: 7,
    icon: "hr",
    title: "HR/Training AI Agent",
    description: "Onboards employees, delivers internal training, explains HR policies, or interviews candidates.",
    tasks: ["Provide Coaching", "Answer Queries", "Conduct Interviews"],
    channels: ["Website", "WhatsApp"],
    interface: ["Chat", "Voice"],
    industry: "HR",
    videoUrl: "https://example.com/hr-training-demo"
  },
  {
    id: 8,
    icon: "consulting",
    title: "Marketing & Outreach AI Agent",
    description: "Sends out promotional messages, collects feedback, and manages surveys or review requests.",
    tasks: ["Send Campaigns", "Collect Feedback", "Follow up"],
    channels: ["WhatsApp", "Phone", "Email"],
    interface: ["Voice", "Chat"],
    industry: "Marketing",
    videoUrl: "https://example.com/marketing-demo"
  }
];

// Extract unique filter options
const getAllTasks = () => {
  const tasks = useCases.flatMap(useCase => useCase.tasks);
  return tasks.filter((task, index, array) => array.indexOf(task) === index).sort();
};
const getAllIndustries = () => {
  const industries = useCases.map(useCase => useCase.industry);
  return industries.filter((industry, index, array) => array.indexOf(industry) === index).sort();
};
const getAllChannels = () => {
  const channels = useCases.flatMap(useCase => useCase.channels);
  return channels.filter((channel, index, array) => array.indexOf(channel) === index).sort();
};


const UseCases = () => {
  const [selectedFilters, setSelectedFilters] = useState({
    task: ["All Tasks"] as string[],
    industry: ["All Industries"] as string[],
    channel: ["All Channels"] as string[]
  });

  // State to track theme for logo filtering
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    };

    // Initial check
    checkDarkMode();

    // Create a mutation observer to monitor class changes on html element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          checkDarkMode();
        }
      });
    });

    // Start observing
    observer.observe(document.documentElement, { attributes: true });

    // Cleanup
    return () => observer.disconnect();
  }, []);

  // Function to scroll to the build agents section
  const scrollToBuildAgents = () => {
    const section = document.getElementById('build-agents');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Function to handle close and scroll
  const handleCloseAndScroll = () => {
    // Find and close any open dialog
    const openDialog = document.querySelector('[data-state="open"][role="dialog"]');
    if (openDialog) {
      const closeButton = openDialog.querySelector('[data-radix-dialog-close]') as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }
    }
    // Scroll after a brief delay
    setTimeout(() => {
      scrollToBuildAgents();
    }, 150);
  };

  // Logo grid for trusted companies with scrolling animation
  const LogoGrid = () => {
    // All 25 customer logos in updated order
    const clientLogos = [
      { name: "ADGM", logo: adgmLogo },
      { name: "Airbus", logo: airbusLogo },
      { name: "Bank Muscat", logo: bankMuscatLogo },
      { name: "Cartier", logo: cartierLogo },
      { name: "Cisco", logo: ciscoLogo },
      { name: "DCT", logo: dctLogo },
      { name: "DLD", logo: dldLogo },
      { name: "Dell", logo: dellLogo },
      { name: "EDB", logo: edbLogo },
      { name: "Ford", logo: fordLogo },
      { name: "Google", logo: googleLogo },
      { name: "Government of Abu Dhabi", logo: govAbuDhabiLogo },
      { name: "Government of Dubai", logo: govDubaiLogo },
      { name: "HSBC", logo: hsbcLogo },
      { name: "Inditex", logo: inditexLogo },
      { name: "Intel", logo: intelLogo },
      { name: "Khalifa Fund", logo: khalifaFundLogo },
      { name: "MBC", logo: mbcLogo },
      { name: "Microsoft", logo: microsoftLogo },
      { name: "Nestle", logo: nestleLogo },
      { name: "PepsiCo", logo: pepsicoLogo },
      { name: "UN Women", logo: unWomenLogo },
      { name: "United Nations", logo: unLogo },
      { name: "Visa", logo: visaLogo },
      { name: "WFZO", logo: wfzoLogo },
    ];

    return (
      <div
        className="client-logos py-8"
        data-aos="fade-up"
        data-aos-delay="100"
      >
        <h3 className="text-center text-muted-foreground uppercase text-sm tracking-wider mb-6">
          Trusted for over 20 years by leading organizations around the world
        </h3>

        {/* Scrolling container */}
        <div className="relative overflow-hidden">
          <div
            className="flex animate-scroll hover:pause-animation"
            style={{
              width: `${clientLogos.length * 2 * 120}px`, // Double width for seamless loop
            }}
          >
            {/* First set of logos */}
            {clientLogos.map((client, i) => (
              <div
                key={`first-${i}`}
                className="flex-shrink-0 w-32 h-16 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity mx-4"
              >
                <img
                  src={client.logo}
                  alt={`${client.name} logo`}
                  className="max-h-12 max-w-full object-contain"
                  style={{
                    filter: isDarkMode ? "brightness(0) invert(1)" : "none",
                  }}
                />
              </div>
            ))}
            {/* Duplicate set for seamless scrolling */}
            {clientLogos.map((client, i) => (
              <div
                key={`second-${i}`}
                className="flex-shrink-0 w-32 h-16 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity mx-4"
              >
                <img
                  src={client.logo}
                  alt={`${client.name} logo`}
                  className="max-h-12 max-w-full object-contain"
                  style={{
                    filter: isDarkMode ? "brightness(0) invert(1)" : "none",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Filter and sort use cases based on selected filters
  const filteredUseCases = useMemo(() => {
    return useCases
      .filter(useCase => {
        const matchesTask = selectedFilters.task.includes("All Tasks") || 
          selectedFilters.task.some(task => useCase.tasks.includes(task));
        const matchesIndustry = selectedFilters.industry.includes("All Industries") || 
          selectedFilters.industry.includes(useCase.industry);
        const matchesChannel = selectedFilters.channel.includes("All Channels") || 
          selectedFilters.channel.some(channel => useCase.channels.includes(channel));
        
        return matchesTask && matchesIndustry && matchesChannel;
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [selectedFilters]);

  const addFilter = (type: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters(prev => {
      const currentFilters = prev[type];
      // Fix the allOption string generation
      const allOption = type === 'industry' ? 'All Industries' : 
                       type === 'task' ? 'All Tasks' : 
                       type === 'channel' ? 'All Channels' : 
                       'All Interfaces';
      
      if (value === allOption) {
        // If selecting "All", clear other selections and set only "All"
        return { ...prev, [type]: [allOption] };
      } else {
        // If selecting a specific option, remove "All" if it exists and toggle the specific item
        const withoutAll = currentFilters.filter(item => item !== allOption);
        
        if (withoutAll.includes(value)) {
          // If item is already selected, remove it
          const updatedFilters = withoutAll.filter(item => item !== value);
          // If no specific items remain, revert to "All"
          if (updatedFilters.length === 0) {
            return { ...prev, [type]: [allOption] };
          }
          return { ...prev, [type]: updatedFilters };
        } else {
          // If item is not selected, add it (and ensure "All" is removed)
          const newFilters = [...withoutAll, value];
          return { ...prev, [type]: newFilters };
        }
      }
    });
  };

  const removeFilter = (type: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters(prev => {
      const newFilters = prev[type].filter(item => item !== value);
      const allOption = `All ${type.charAt(0).toUpperCase() + type.slice(1)}${type === 'industry' ? ' Industries' : type === 'task' ? ' Tasks' : ' Channels'}`;
      
      // If no specific filters remain, revert to "All"
      if (newFilters.length === 0) {
        return { ...prev, [type]: [allOption] };
      }
      
      return { ...prev, [type]: newFilters };
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      task: ["All Tasks"],
      industry: ["All Industries"],
      channel: ["All Channels"]
    });
  };

  return (
    <>
      <SEO 
        title="AI Use Cases for Every Industry | Potential.com"
        description="Explore powerful AI chatbot and voice agent use cases across industries. From healthcare to hospitality, discover how AI can automate tasks, reduce costs, and boost customer engagement."
        keywords="AI use cases, chatbot examples, voice agent applications, business automation, AI solutions by industry"
      />
      <div className="font-inter min-h-screen">
        <Header />
        
        <main className="pt-32">
          <div className="container mb-12">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 max-w-3xl">AI Employees, On Demand — Scalable Use Cases for Your Business</h1>
              <p className="text-xl text-muted-foreground max-w-3xl">Explore how AI Chatbots and Voice Agents can automate key business tasks, reduce costs, and boost customer engagement 24/7 — across all channels and industries.</p>
            </div>
          </div>

          {/* Filters Section */}
        <section className="py-8 border-b" style={{ backgroundColor: '#f1f5f94d' }}>
          <div className="container">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8">
                <p className="text-lg text-muted-foreground">Use the filters below to find the perfect AI Agent for your needs</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 w-full max-w-2xl">
                  {/* Job Role Filter */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        Filter by Job Role
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[300px] p-0" side="bottom" align="start">
                      <Command>
                        <CommandInput placeholder="Search job roles..." />
                        <CommandEmpty>No job roles found.</CommandEmpty>
                        <CommandGroup className="max-h-[240px] overflow-auto">
                          <CommandItem
                            onSelect={() => addFilter('industry', 'All Industries')}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                selectedFilters.industry.includes('All Industries') ? 'opacity-100' : 'opacity-0'
                              }`}
                            />
                            All Job Roles
                          </CommandItem>
                          {getAllIndustries().map((industry) => (
                            <CommandItem
                              key={industry}
                              onSelect={() => addFilter('industry', industry)}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  selectedFilters.industry.includes(industry) ? 'opacity-100' : 'opacity-0'
                                }`}
                              />
                              {industry}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {/* Capabilities Filter */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        Filter by Capabilities
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[300px] p-0" side="bottom" align="start">
                      <Command>
                        <CommandInput placeholder="Search capabilities..." />
                        <CommandEmpty>No capabilities found.</CommandEmpty>
                        <CommandGroup className="max-h-[240px] overflow-auto">
                          <CommandItem
                            onSelect={() => addFilter('task', 'All Tasks')}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                selectedFilters.task.includes('All Tasks') ? 'opacity-100' : 'opacity-0'
                              }`}
                            />
                            All Capabilities
                          </CommandItem>
                          {getAllTasks().map((task) => (
                            <CommandItem
                              key={task}
                              onSelect={() => addFilter('task', task)}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  selectedFilters.task.includes(task) ? 'opacity-100' : 'opacity-0'
                                }`}
                              />
                              {task}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Active Filters */}
                <div className="flex flex-wrap gap-2 items-center justify-center">
                  {Object.entries(selectedFilters).map(([type, values]) =>
                    values
                      .filter(value => !value.startsWith('All ')) // Hide "All" options from badges
                      .map(value => (
                        <Badge key={`${type}-${value}`} variant="secondary" className="flex items-center gap-1">
                          {value}
                          <X 
                            className="h-3 w-3 cursor-pointer hover:text-destructive" 
                            onClick={() => removeFilter(type as keyof typeof selectedFilters, value)}
                          />
                        </Badge>
                      ))
                  )}
                  {Object.values(selectedFilters).some(filters => 
                    filters.some(filter => !filter.startsWith('All '))
                  ) && (
                    <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-muted-foreground">
                      Clear All
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Grid */}
        <section className="py-16">
          <div className="container">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUseCases.map((useCase) => (
                  <Card key={useCase.id} className="glass-effect border-border rounded-xl overflow-hidden card-hover h-full">
                    <CardContent className="p-0 flex flex-col h-full">
                      {/* Agent Image */}
                      <div className="relative h-48 w-full overflow-hidden">
                        <img 
                          src={agentImages[useCase.title] || "/assets/images/AI Employees/Receptionist AI Agent.png"} 
                          alt={useCase.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                      
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex items-center gap-3 mb-4">
                        <div className="text-primary p-2 rounded-lg bg-primary/10">
                          {(() => {
                            // Map icon keys to unique icon components
                            const iconMap: { [key: string]: any } = {
                              "hotel": Hotel,
                              "healthcare": Stethoscope,
                              "doctor": UserPlus,
                              "medical": Microscope,
                              "ecommerce": ShoppingCart,
                              "hr": Users,
                              "automotive": Car,
                              "realestate": Building2,
                              "education": GraduationCap,
                              "travel": Plane,
                              "restaurant": Utensils,
                              "fitness": Dumbbell,
                              "insurance": FileText,
                              "sales": PhoneCall,
                              "finance": Banknote,
                              "retail": Store,
                              "consulting": Briefcase,
                              "techsupport": Wrench,
                              // Legacy emoji support (fallback)
                              "🏨": Hotel,
                              "🏥": Stethoscope,
                              "🩺": UserPlus,
                              "🧪": Microscope,
                              "🛒": ShoppingCart,
                              "👥": Users,
                              "🚗": Car,
                              "🏢": Building2,
                              "🎓": GraduationCap,
                              "✈️": Plane,
                              "🍽️": Utensils,
                              "💪": Dumbbell,
                              "📋": FileText,
                              "📞": PhoneCall,
                              "🏦": Banknote,
                              "🏪": Store,
                              "💼": Briefcase,
                              "🛠": Wrench
                            };
                            const IconComponent = iconMap[useCase.icon] || Building2;
                            return <IconComponent className="h-6 w-6" />;
                          })()}
                        </div>
                        <h3 className="text-lg font-semibold leading-tight">{useCase.title}</h3>
                      </div>
                      
                      <p className="text-muted-foreground mb-4 flex-grow">
                        {useCase.description}
                      </p>

                      <div className="space-y-3 mb-6">
                        <div>
                          <span className="text-xs text-muted-foreground mb-1 block font-bold">CAPABILITIES</span>
                          <div className="flex flex-wrap gap-1">
                            {useCase.tasks.map(task => (
                              <Badge key={task} className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 text-xs text-white bg-[#eb217c]">
                                {task}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        
                        
                        

                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                            Try This Agent
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
                          <DialogTitle className="sr-only">{useCase.title}</DialogTitle>
                          <div className="p-4 sm:p-6">
                            <h3 className="text-xl sm:text-2xl font-bold mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                              <div className="text-primary p-2 rounded-lg bg-primary/10 flex-shrink-0">
                                {(() => {
                                  // Map icon keys to unique icon components
                                  const iconMap: { [key: string]: any } = {
                                    "hotel": Hotel,
                                    "healthcare": Stethoscope,
                                    "doctor": UserPlus,
                                    "medical": Microscope,
                                    "ecommerce": ShoppingCart,
                                    "hr": Users,
                                    "automotive": Car,
                                    "realestate": Building2,
                                    "education": GraduationCap,
                                    "travel": Plane,
                                    "restaurant": Utensils,
                                    "fitness": Dumbbell,
                                    "insurance": FileText,
                                    "sales": PhoneCall,
                                    "finance": Banknote,
                                    "retail": Store,
                                    "consulting": Briefcase,
                                    "techsupport": Wrench,
                                    // Legacy emoji support (fallback)
                                    "🏨": Hotel,
                                    "🏥": Stethoscope,
                                    "🩺": UserPlus,
                                    "🧪": Microscope,
                                    "🛒": ShoppingCart,
                                    "👥": Users,
                                    "🚗": Car,
                                    "🏢": Building2,
                                    "🎓": GraduationCap,
                                    "✈️": Plane,
                                    "🍽️": Utensils,
                                    "💪": Dumbbell,
                                    "📋": FileText,
                                    "📞": PhoneCall,
                                    "🏦": Banknote,
                                    "🏪": Store,
                                    "💼": Briefcase,
                                    "🛠": Wrench
                                  };
                                  const IconComponent = iconMap[useCase.icon] || Building2;
                                  return <IconComponent className="h-6 w-6" />;
                                })()}
                              </div>
                              <span className="leading-tight">{useCase.title}</span>
                            </h3>
                            <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
                              {useCase.description}
                            </p>
                            
                            {/* Video Demo */}
                            <div className="aspect-video bg-muted rounded-lg mb-4 sm:mb-6 overflow-hidden">
                              {useCase.title === "Banking: Customer Support Agent" && useCase.industry === "Banking" ? (
                                <iframe
                                  src="https://www.youtube.com/embed/qW_nQ5kx8GY"
                                  title="Banking Customer Service Agent Demo"
                                  className="w-full h-full"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center p-4">
                                  <div className="text-center">
                                    <div className="text-3xl sm:text-4xl mb-2">🎥</div>
                                    <p className="text-muted-foreground text-sm sm:text-base">Video demo coming soon</p>
                                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 px-2">
                                      This agent will showcase: {useCase.tasks.join(", ")}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>

                            <DialogClose asChild>
                              <Button 
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm sm:text-base py-2 sm:py-3"
                                onClick={() => {
                                  // Update URL and scroll to the section after modal closes
                                  setTimeout(() => {
                                    window.history.pushState(null, '', '/usecases#build-agents');
                                    const section = document.getElementById('build-agents');
                                    if (section) {
                                      const offsetTop = section.getBoundingClientRect().top + window.scrollY - 80;
                                      window.scrollTo({
                                        top: offsetTop,
                                        behavior: 'smooth'
                                      });
                                    }
                                  }, 300);
                                }}
                              >
                                <span className="hidden sm:inline">Hire Your Next {useCase.title} starting from $500/month</span>
                                <span className="sm:hidden">Hire This Agent - $500/month</span>
                              </Button>
                            </DialogClose>
                          </div>
                        </DialogContent>
                      </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredUseCases.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-semibold mb-2">No use cases found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters to see more results
                  </p>
                  <Button onClick={clearAllFilters} variant="outline">
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Integration Section */}
        <section className="py-12 lg:py-16 from-background to-muted/20 overflow-hidden bg-[#fbfcfd]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Content - Animation */}
              <div className="flex justify-center lg:justify-start" data-aos="fade-right">
                <div className="relative w-full max-w-lg">
                  {/* Integration Animation */}
                  <div className="relative flex items-center justify-center h-[400px]">
                    {/* Central AI Agent */}
                    <div className="relative z-10" data-aos="zoom-in" data-aos-delay="200">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary via-purple-500 to-blue-500 rounded-2xl shadow-xl flex items-center justify-center animate-pulse">
                        <Bot className="text-white w-8 h-8" />
                      </div>
                    </div>

                    {/* Floating Integration Cards - Smaller */}
                    {/* CRM Systems - Top Left */}
                    <div className="absolute top-2 left-2 animate-float" data-aos="fade-up" data-aos-delay="400">
                      <div className="bg-background/80 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-border/50 hover:shadow-xl transition-all duration-300">
                        <div className="text-center">
                          <BarChart3 className="w-5 h-5 mb-1 mx-auto text-primary" />
                          <div className="text-xs font-medium text-foreground">CRM</div>
                        </div>
                      </div>
                    </div>

                    {/* Ecommerce - Top Right */}
                    <div className="absolute top-2 right-2 animate-float-delayed" data-aos="fade-up" data-aos-delay="500">
                      <div className="bg-background/80 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-border/50 hover:shadow-xl transition-all duration-300">
                        <div className="text-center">
                          <ShoppingCart className="w-5 h-5 mb-1 mx-auto text-primary" />
                          <div className="text-xs font-medium text-foreground">Ecommerce</div>
                        </div>
                      </div>
                    </div>

                    {/* Telephony - Left */}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 animate-float" data-aos="fade-right" data-aos-delay="600">
                      <div className="bg-background/80 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-border/50 hover:shadow-xl transition-all duration-300">
                        <div className="text-center">
                          <Phone className="w-5 h-5 mb-1 mx-auto text-primary" />
                          <div className="text-xs font-medium text-foreground">Phone</div>
                        </div>
                      </div>
                    </div>

                    {/* Calendar - Right */}
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 animate-float-delayed" data-aos="fade-left" data-aos-delay="700">
                      <div className="bg-background/80 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-border/50 hover:shadow-xl transition-all duration-300">
                        <div className="text-center">
                          <Calendar className="w-5 h-5 mb-1 mx-auto text-primary" />
                          <div className="text-xs font-medium text-foreground">Calendar</div>
                        </div>
                      </div>
                    </div>

                    {/* Ticketing - Bottom Left */}
                    <div className="absolute bottom-2 left-2 animate-float" data-aos="fade-up" data-aos-delay="800">
                      <div className="bg-background/80 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-border/50 hover:shadow-xl transition-all duration-300">
                        <div className="text-center">
                          <Ticket className="w-5 h-5 mb-1 mx-auto text-primary" />
                          <div className="text-xs font-medium text-foreground">Ticketing</div>
                        </div>
                      </div>
                    </div>

                    {/* Email - Bottom Right */}
                    <div className="absolute bottom-2 right-2 animate-float-delayed" data-aos="fade-up" data-aos-delay="900">
                      <div className="bg-background/80 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-border/50 hover:shadow-xl transition-all duration-300">
                        <div className="text-center">
                          <Mail className="w-5 h-5 mb-1 mx-auto text-primary" />
                          <div className="text-xs font-medium text-foreground">Email</div>
                        </div>
                      </div>
                    </div>

                    {/* HR System - Top Center */}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 animate-float" data-aos="fade-down" data-aos-delay="1000">
                      <div className="bg-background/80 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-border/50 hover:shadow-xl transition-all duration-300">
                        <div className="text-center">
                          <Users className="w-5 h-5 mb-1 mx-auto text-primary" />
                          <div className="text-xs font-medium text-foreground">HR System</div>
                        </div>
                      </div>
                    </div>

                    {/* ERP - Bottom Center */}
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 animate-float-delayed" data-aos="fade-up" data-aos-delay="1100">
                      <div className="bg-background/80 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-border/50 hover:shadow-xl transition-all duration-300">
                        <div className="text-center">
                          <Factory className="w-5 h-5 mb-1 mx-auto text-primary" />
                          <div className="text-xs font-medium text-foreground">ERP</div>
                        </div>
                      </div>
                    </div>

                    {/* Connection Lines */}
                    <div className="absolute inset-0 pointer-events-none">
                      <svg className="w-full h-full opacity-15">
                        <defs>
                          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="hsl(270, 70%, 56%)" />
                            <stop offset="100%" stopColor="hsl(270, 70%, 40%)" />
                          </linearGradient>
                        </defs>
                        
                        {/* Lines to each integration point */}
                        <line x1="50%" y1="50%" x2="20%" y2="20%" stroke="url(#connectionGradient)" strokeWidth="1.5" className="animate-pulse" strokeDasharray="3,3">
                          <animate attributeName="stroke-dashoffset" values="0;6" dur="2s" repeatCount="indefinite"/>
                        </line>
                        <line x1="50%" y1="50%" x2="80%" y2="20%" stroke="url(#connectionGradient)" strokeWidth="1.5" className="animate-pulse" strokeDasharray="3,3">
                          <animate attributeName="stroke-dashoffset" values="0;6" dur="2.5s" repeatCount="indefinite"/>
                        </line>
                        <line x1="50%" y1="50%" x2="10%" y2="50%" stroke="url(#connectionGradient)" strokeWidth="1.5" className="animate-pulse" strokeDasharray="3,3">
                          <animate attributeName="stroke-dashoffset" values="0;6" dur="3s" repeatCount="indefinite"/>
                        </line>
                        <line x1="50%" y1="50%" x2="90%" y2="50%" stroke="url(#connectionGradient)" strokeWidth="1.5" className="animate-pulse" strokeDasharray="3,3">
                          <animate attributeName="stroke-dashoffset" values="0;6" dur="2.2s" repeatCount="indefinite"/>
                        </line>
                        <line x1="50%" y1="50%" x2="20%" y2="80%" stroke="url(#connectionGradient)" strokeWidth="1.5" className="animate-pulse" strokeDasharray="3,3">
                          <animate attributeName="stroke-dashoffset" values="0;6" dur="2.8s" repeatCount="indefinite"/>
                        </line>
                        <line x1="50%" y1="50%" x2="80%" y2="80%" stroke="url(#connectionGradient)" strokeWidth="1.5" className="animate-pulse" strokeDasharray="3,3">
                          <animate attributeName="stroke-dashoffset" values="0;6" dur="2.3s" repeatCount="indefinite"/>
                        </line>
                        <line x1="50%" y1="50%" x2="50%" y2="10%" stroke="url(#connectionGradient)" strokeWidth="1.5" className="animate-pulse" strokeDasharray="3,3">
                          <animate attributeName="stroke-dashoffset" values="0;6" dur="2.7s" repeatCount="indefinite"/>
                        </line>
                        <line x1="50%" y1="50%" x2="50%" y2="90%" stroke="url(#connectionGradient)" strokeWidth="1.5" className="animate-pulse" strokeDasharray="3,3">
                          <animate attributeName="stroke-dashoffset" values="0;6" dur="2.6s" repeatCount="indefinite"/>
                        </line>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Content - Text */}
              <div className="text-center lg:text-left" data-aos="fade-left">
                <h2 className="text-3xl sm:text-4xl lg:text-4xl font-bold text-foreground mb-6">
                  Integrates Seamlessly With the Tools You Already Use
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Our AI Employees connect with your CRM, website, phones, booking tools, and more — so they work like your best-trained staff from day one.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Speak Every Customer's Language Section */}
        <section className="py-16 lg:py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Language Support Subsection */}
            <div className="border-t border-border/20 pt-16">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Left Content */}
                <div className="text-center lg:text-left" data-aos="fade-right">
                  <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                    Speak Every Customer's Language
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">Whether it’s English, Arabic, French, or more — your AI employee speaks the language your customer understands best. Potential.com's AI Agents support 100+ languages. </p>
                </div>

                {/* Right Content - Animated Country Flags */}
                <div className="flex justify-center lg:justify-end" data-aos="fade-left">
                  <div className="relative w-full max-w-sm lg:max-w-md">
                    {/* Scrolling Flags Container */}
                    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-background to-muted/50 p-3 sm:p-4 lg:p-6 shadow-xl border border-border/50">
                      <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                        {/* Row 1 - Moving Right */}
                        <div className="overflow-hidden">
                          <div className="flex animate-scroll-right space-x-2 sm:space-x-3 lg:space-x-4">
                          {[
                            { flag: "🇺🇸", name: "USA" },
                            { flag: "🇬🇧", name: "UK" },
                            { flag: "🇫🇷", name: "France" },
                            { flag: "🇩🇪", name: "Germany" },
                            { flag: "🇪🇸", name: "Spain" },
                            { flag: "🇮🇹", name: "Italy" },
                            { flag: "🇺🇸", name: "USA" },
                            { flag: "🇬🇧", name: "UK" },
                            { flag: "🇫🇷", name: "France" },
                            { flag: "🇩🇪", name: "Germany" },
                            { flag: "🇪🇸", name: "Spain" },
                            { flag: "🇮🇹", name: "Italy" }
                          ].map((country, index) => (
                            <div key={index} className="flex-shrink-0 text-center">
                              <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">{country.flag}</div>
                              <div className="text-xs text-muted-foreground font-medium">{country.name}</div>
                            </div>
                          ))}
                          </div>
                        </div>

                        {/* Row 2 - Moving Left */}
                        <div className="overflow-hidden">
                          <div className="flex animate-scroll-left space-x-2 sm:space-x-3 lg:space-x-4">
                          {[
                            { flag: "🇯🇵", name: "Japan" },
                            { flag: "🇰🇷", name: "Korea" },
                            { flag: "🇨🇳", name: "China" },
                            { flag: "🇮🇳", name: "India" },
                            { flag: "🇧🇷", name: "Brazil" },
                            { flag: "🇷🇺", name: "Russia" },
                            { flag: "🇯🇵", name: "Japan" },
                            { flag: "🇰🇷", name: "Korea" },
                            { flag: "🇨🇳", name: "China" },
                            { flag: "🇮🇳", name: "India" },
                            { flag: "🇧🇷", name: "Brazil" },
                            { flag: "🇷🇺", name: "Russia" }
                          ].map((country, index) => (
                            <div key={index} className="flex-shrink-0 text-center">
                              <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">{country.flag}</div>
                              <div className="text-xs text-muted-foreground font-medium">{country.name}</div>
                            </div>
                          ))}
                          </div>
                        </div>

                        {/* Row 3 - Moving Right */}
                        <div className="overflow-hidden">
                          <div className="flex animate-scroll-right space-x-2 sm:space-x-3 lg:space-x-4">
                          {[
                            { flag: "🇳🇱", name: "Netherlands" },
                            { flag: "🇸🇪", name: "Sweden" },
                            { flag: "🇳🇴", name: "Norway" },
                            { flag: "🇩🇰", name: "Denmark" },
                            { flag: "🇫🇮", name: "Finland" },
                            { flag: "🇵🇱", name: "Poland" },
                            { flag: "🇳🇱", name: "Netherlands" },
                            { flag: "🇸🇪", name: "Sweden" },
                            { flag: "🇳🇴", name: "Norway" },
                            { flag: "🇩🇰", name: "Denmark" },
                            { flag: "🇫🇮", name: "Finland" },
                            { flag: "🇵🇱", name: "Poland" }
                          ].map((country, index) => (
                            <div key={index} className="flex-shrink-0 text-center">
                              <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">{country.flag}</div>
                              <div className="text-xs text-muted-foreground font-medium">{country.name}</div>
                            </div>
                          ))}
                          </div>
                        </div>

                        {/* Row 4 - Moving Left */}
                        <div className="overflow-hidden">
                          <div className="flex animate-scroll-left space-x-2 sm:space-x-3 lg:space-x-4">
                          {[
                            { flag: "🇦🇺", name: "Australia" },
                            { flag: "🇨🇦", name: "Canada" },
                            { flag: "🇲🇽", name: "Mexico" },
                            { flag: "🇦🇷", name: "Argentina" },
                            { flag: "🇿🇦", name: "S. Africa" },
                            { flag: "🇪🇬", name: "Egypt" },
                            { flag: "🇦🇺", name: "Australia" },
                            { flag: "🇨🇦", name: "Canada" },
                            { flag: "🇲🇽", name: "Mexico" },
                            { flag: "🇦🇷", name: "Argentina" },
                            { flag: "🇿🇦", name: "S. Africa" },
                            { flag: "🇪🇬", name: "Egypt" }
                          ].map((country, index) => (
                            <div key={index} className="flex-shrink-0 text-center">
                              <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">{country.flag}</div>
                              <div className="text-xs text-muted-foreground font-medium">{country.name}</div>
                            </div>
                          ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section id="build-agents" className="py-16 bg-muted/30">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Build Your AI Agents</h2>
              <p className="text-xl text-muted-foreground mb-8">Our AI agents are fully customizable to fit any industry or business process. Start by testing an AI Voice Agent or AI chatbot, and we’ll work with you to tailor it further to your specific use case.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <AIChatbotForm
                  trigger={
                    <Button 
                      size="lg" 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      Create your Free AI Chatbot
                    </Button>
                  }
                />
                <AIVoiceAgentForm
                  trigger={
                    <Button 
                      size="lg" 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      Create Your Free AI Voice Agent
                    </Button>
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* Trusted Organizations Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <LogoGrid />
          </div>
        </section>

        </main>
        <Footer />
      </div>
    </>
  );
};

export default UseCases;