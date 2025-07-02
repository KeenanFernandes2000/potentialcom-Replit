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
import { X, Check, ChevronDown, Hotel, Stethoscope, ShoppingCart, Users, Car, Building2, GraduationCap, Plane, Utensils, Dumbbell, Home, Briefcase, PhoneCall, FileText, Wrench, Microscope, UserPlus, Store, Banknote, HeadphonesIcon, Calculator, MapPin, Clock, BookOpen } from "lucide-react";
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
  "Hotel": "🏨",
  "Clinic/Hospital": "🏥", 
  "Ecommerce": "🛒",
  "HR": "👩‍💼",
  "AI Coaches": "🎓",
  "Automotive": "🚗",
  "Banking": "🏦",
  "Restaurant": "🍽",
  "Education": "🧑‍🏫",
  "Real Estate": "🏘",
  "Events": "🎟",
  "Wellbeing": "🧘",
  "Tech Support": "🛠"
};

// Use cases data
const useCases = [
  {
    id: 1,
    icon: "hotel",
    title: "Hotel: Room Service Agent",
    description: "An AI voice agent that responds to guest calls, takes room service orders, and manages simple guest requests without staff intervention.",
    tasks: ["Place Orders", "Answer Questions", "Send Confirmations"],
    channels: ["Phone"],
    interface: ["Voice"],
    industry: "Hotel",
    videoUrl: "https://example.com/hotel-room-service-demo" // Placeholder
  },
  {
    id: 2,
    icon: "🏨",
    title: "Hotel: Receptionist Agent",
    description: "This digital receptionist books rooms, responds to inquiries, and sends confirmations — 24/7.",
    tasks: ["Book Appointments", "Answer Questions", "Send Confirmations"],
    channels: ["Phone", "Website", "WhatsApp"],
    interface: ["Voice", "Chat"],
    industry: "Hotel",
    videoUrl: "https://example.com/hotel-receptionist-demo"
  },
  {
    id: 3,
    icon: "🏥",
    title: "Clinic/Hospital: Appointment Receptionist",
    description: "Helps patients book and confirm appointments across all touchpoints, reducing call center overload and improving experience.",
    tasks: ["Book Appointments", "Answer Questions", "Send Confirmations"],
    channels: ["Phone", "Website", "WhatsApp"],
    interface: ["Voice", "Chat"],
    industry: "Clinic/Hospital",
    videoUrl: "https://example.com/clinic-receptionist-demo"
  },
  {
    id: 4,
    icon: "🩺",
    title: "Clinic/Hospital: AI Doctor First Respondent",
    description: "Acts as a first-line responder to medical inquiries, offering smart advice and recommending the right doctors.",
    tasks: ["Answer Questions", "Suggest Products/Services", "Route to Human"],
    channels: ["Phone", "Website", "WhatsApp"],
    interface: ["Voice", "Chat"],
    industry: "Clinic/Hospital",
    videoUrl: "https://example.com/ai-doctor-demo"
  },
  {
    id: 5,
    icon: "🧪",
    title: "Clinic: Medical Test Analyzer",
    description: "Accepts uploaded lab reports, interprets results using AI, and summarizes insights for patients.",
    tasks: ["Analyze Reports/Responses", "Recommend Resources"],
    channels: ["Website"],
    interface: ["Chat"],
    industry: "Clinic/Hospital",
    videoUrl: "https://example.com/medical-analyzer-demo"
  },
  {
    id: 6,
    icon: "🛒",
    title: "Ecommerce: Shopping Assistant",
    description: "Helps users find products, answers their questions, and places orders — all via chat or voice.",
    tasks: ["Answer Questions", "Suggest Products/Services", "Place Orders", "Track Orders"],
    channels: ["Phone", "Website", "WhatsApp"],
    interface: ["Voice", "Chat"],
    industry: "Ecommerce",
    videoUrl: "https://example.com/shopping-assistant-demo"
  },
  {
    id: 7,
    icon: "👩‍💼",
    title: "HR: Interview Assistant",
    description: "Conducts candidate interviews, analyzes responses, and suggests the best candidates for HR to review.",
    tasks: ["Answer Questions", "Analyze Reports/Responses", "Suggest Products/Services"],
    channels: ["Phone", "Website"],
    interface: ["Voice", "Chat"],
    industry: "HR",
    videoUrl: "https://example.com/hr-interview-demo"
  },
  {
    id: 8,
    icon: "🎓",
    title: "AI Coaches",
    description: "AI-powered coaches trained on specific topics that engage, support, and train users interactively.",
    tasks: ["Provide Coaching", "Analyze Reports/Responses", "Recommend Resources"],
    channels: ["Phone", "Website", "WhatsApp"],
    interface: ["Voice", "Chat"],
    industry: "AI Coaches",
    videoUrl: "https://example.com/ai-coaches-demo"
  },
  {
    id: 9,
    icon: "🚗",
    title: "Automotive: Customer Service Agent",
    description: "Books appointments for services or test drives, answers product queries, and helps customers quickly.",
    tasks: ["Book Appointments", "Answer Questions", "Send Confirmations"],
    channels: ["Phone", "Website", "WhatsApp"],
    interface: ["Voice", "Chat"],
    industry: "Automotive",
    videoUrl: "https://example.com/automotive-service-demo"
  },
  {
    id: 10,
    icon: "🏦",
    title: "Banking: Customer Support Agent",
    description: "Assists customers with account queries, recommends financial products, and ensures round-the-clock service.",
    tasks: ["Answer Questions", "Suggest Products/Services", "Route to Human"],
    channels: ["Phone", "Website", "WhatsApp"],
    interface: ["Voice", "Chat"],
    industry: "Banking",
    videoUrl: "https://example.com/banking-support-demo"
  },
  {
    id: 11,
    icon: "🍽",
    title: "Restaurant: Reservation & Order Agent",
    description: "Books tables, takes pre-orders, sends confirmations, and handles peak-time traffic seamlessly.",
    tasks: ["Book Appointments", "Place Orders", "Send Confirmations"],
    channels: ["Phone", "Website", "WhatsApp"],
    interface: ["Voice", "Chat"],
    industry: "Restaurant",
    videoUrl: "https://example.com/restaurant-booking-demo"
  },
  {
    id: 12,
    icon: "🧑‍🏫",
    title: "Education: Learning Coach",
    description: "Guides students through study topics, assigns quizzes, tracks performance, and offers study support.",
    tasks: ["Provide Coaching", "Analyze Reports/Responses", "Recommend Resources"],
    channels: ["Website", "WhatsApp"],
    interface: ["Chat"],
    industry: "Education",
    videoUrl: "https://example.com/learning-coach-demo"
  },
  {
    id: 13,
    icon: "🏘",
    title: "Real Estate: Property Inquiry and Sales Agent",
    description: "Captures leads, recommends listings, answers questions, and books property visits.",
    tasks: ["Capture Leads", "Suggest Products/Services", "Book Appointments", "Answer Questions"],
    channels: ["Phone", "Website", "WhatsApp"],
    interface: ["Voice", "Chat"],
    industry: "Real Estate",
    videoUrl: "https://example.com/real-estate-agent-demo"
  },
  {
    id: 14,
    icon: "🎟",
    title: "Events: Registration Agent",
    description: "Manages event signups, provides info, and sends updates to attendees automatically.",
    tasks: ["Register Users", "Send Confirmations", "Answer Questions"],
    channels: ["Website", "WhatsApp", "Phone"],
    interface: ["Voice", "Chat"],
    industry: "Events",
    videoUrl: "https://example.com/events-registration-demo"
  },
  {
    id: 15,
    icon: "🧘",
    title: "Wellbeing: Wellbeing Agent",
    description: "Performs routine emotional wellness check-ins, provides wellness tips, and books sessions with experts.",
    tasks: ["Provide Coaching", "Book Appointments", "Recommend Resources", "Answer Questions"],
    channels: ["Website", "WhatsApp", "Phone"],
    interface: ["Chat", "Voice"],
    industry: "Wellbeing",
    videoUrl: "https://example.com/wellbeing-agent-demo"
  },
  {
    id: 16,
    icon: "🛠",
    title: "Tech Support: Troubleshooting Assistant",
    description: "Resolves common issues, creates support tickets, and escalates complex cases to technical teams.",
    tasks: ["Troubleshoot Issues", "Track Orders", "Route to Human"],
    channels: ["Phone", "Website", "WhatsApp"],
    interface: ["Voice", "Chat"],
    industry: "Tech Support",
    videoUrl: "https://example.com/tech-support-demo"
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
const getAllInterfaces = () => {
  const interfaces = useCases.flatMap(useCase => useCase.interface);
  return interfaces.filter((interfaceType, index, array) => array.indexOf(interfaceType) === index).sort();
};

const UseCases = () => {
  const [selectedFilters, setSelectedFilters] = useState({
    task: ["All Tasks"] as string[],
    industry: ["All Industries"] as string[],
    channel: ["All Channels"] as string[],
    interface: ["All Interfaces"] as string[]
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
        const matchesInterface = selectedFilters.interface.includes("All Interfaces") || 
          selectedFilters.interface.some(interfaceType => useCase.interface.includes(interfaceType));
        
        return matchesTask && matchesIndustry && matchesChannel && matchesInterface;
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
      const allOption = `All ${type.charAt(0).toUpperCase() + type.slice(1)}${type === 'interface' ? 's' : type === 'industry' ? ' Industries' : type === 'task' ? ' Tasks' : ' Channels'}`;
      
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
      channel: ["All Channels"],
      interface: ["All Interfaces"]
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
              <h1 className="text-4xl md:text-5xl font-bold mb-4 max-w-3xl">Discover Powerful AI Agent Use Cases for Every Industry</h1>
              <p className="text-xl text-muted-foreground max-w-3xl">Explore how AI Chatbots and Voice Agents can automate key business tasks, reduce costs, and boost customer engagement — across all channels and industries.</p>
            </div>
          </div>

          {/* Filters Section */}
        <section className="py-8 border-b" style={{ backgroundColor: '#f1f5f94d' }}>
          <div className="container">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-semibold text-center mb-8">
                Use the filters below to find the perfect AI Agent for your needs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* Industry Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      Select Industry
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[300px] p-0" side="bottom" align="start">
                    <Command>
                      <CommandInput placeholder="Search industries..." />
                      <CommandEmpty>No industries found.</CommandEmpty>
                      <CommandGroup className="max-h-[240px] overflow-auto">
                        <CommandItem
                          onSelect={() => addFilter('industry', 'All Industries')}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              selectedFilters.industry.includes('All Industries') ? 'opacity-100' : 'opacity-0'
                            }`}
                          />
                          All Industries
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

                {/* Task Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      Select Agent Task
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[300px] p-0" side="bottom" align="start">
                    <Command>
                      <CommandInput placeholder="Search tasks..." />
                      <CommandEmpty>No tasks found.</CommandEmpty>
                      <CommandGroup className="max-h-[240px] overflow-auto">
                        <CommandItem
                          onSelect={() => addFilter('task', 'All Tasks')}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              selectedFilters.task.includes('All Tasks') ? 'opacity-100' : 'opacity-0'
                            }`}
                          />
                          All Tasks
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

                {/* Channel Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      Select Channel
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[300px] p-0" side="bottom" align="start">
                    <Command>
                      <CommandInput placeholder="Search channels..." />
                      <CommandEmpty>No channels found.</CommandEmpty>
                      <CommandGroup className="max-h-[240px] overflow-auto">
                        <CommandItem
                          onSelect={() => addFilter('channel', 'All Channels')}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              selectedFilters.channel.includes('All Channels') ? 'opacity-100' : 'opacity-0'
                            }`}
                          />
                          All Channels
                        </CommandItem>
                        {getAllChannels().map((channel) => (
                          <CommandItem
                            key={channel}
                            onSelect={() => addFilter('channel', channel)}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                selectedFilters.channel.includes(channel) ? 'opacity-100' : 'opacity-0'
                              }`}
                            />
                            {channel}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* Interface Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      Select Interface
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[300px] p-0" side="bottom" align="start">
                    <Command>
                      <CommandInput placeholder="Search interfaces..." />
                      <CommandEmpty>No interfaces found.</CommandEmpty>
                      <CommandGroup className="max-h-[240px] overflow-auto">
                        <CommandItem
                          onSelect={() => addFilter('interface', 'All Interfaces')}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              selectedFilters.interface.includes('All Interfaces') ? 'opacity-100' : 'opacity-0'
                            }`}
                          />
                          All Interfaces
                        </CommandItem>
                        {getAllInterfaces().map((interfaceType) => (
                          <CommandItem
                            key={interfaceType}
                            onSelect={() => addFilter('interface', interfaceType)}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                selectedFilters.interface.includes(interfaceType) ? 'opacity-100' : 'opacity-0'
                              }`}
                            />
                            {interfaceType}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Active Filters */}
              <div className="flex flex-wrap gap-2 items-center">
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
        </section>

        {/* Use Cases Grid */}
        <section className="py-16">
          <div className="container">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUseCases.map((useCase) => (
                  <Card key={useCase.id} className="glass-effect border-border rounded-xl overflow-hidden card-hover h-full">
                    <CardContent className="p-6 flex flex-col h-full">
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
                          <span className="text-xs font-medium text-muted-foreground mb-1 block">TASKS</span>
                          <div className="flex flex-wrap gap-1">
                            {useCase.tasks.map(task => (
                              <Badge key={task} className="text-xs text-white" style={{ backgroundColor: '#9f2064' }}>
                                {task}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-xs font-medium text-muted-foreground mb-1 block">CHANNELS</span>
                          <div className="flex flex-wrap gap-1">
                            {useCase.channels.map(channel => (
                              <Badge key={channel} variant="secondary" className="text-xs">
                                {channel}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-xs font-medium text-muted-foreground mb-1 block">INTERFACE</span>
                          <div className="flex flex-wrap gap-1">
                            {useCase.interface.map(interfaceType => (
                              <Badge key={interfaceType} className="text-xs text-white" style={{ backgroundColor: '#eb217c' }}>
                                {interfaceType}
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
                        <DialogContent className="max-w-4xl">
                          <DialogTitle className="sr-only">{useCase.title}</DialogTitle>
                          <div className="p-6">
                            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
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
                              {useCase.title}
                            </h3>
                            <p className="text-muted-foreground mb-6">
                              {useCase.description}
                            </p>
                            
                            {/* Video Demo Placeholder */}
                            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-6">
                              <div className="text-center">
                                <div className="text-4xl mb-2">🎥</div>
                                <p className="text-muted-foreground">Video demo coming soon</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  This agent will showcase: {useCase.tasks.join(", ")}
                                </p>
                              </div>
                            </div>

                            <DialogClose asChild>
                              <Button 
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
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
                                Build Similar AI Agents for Free
                              </Button>
                            </DialogClose>
                          </div>
                        </DialogContent>
                      </Dialog>
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