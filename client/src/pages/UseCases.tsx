import { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { SEO } from "@/components/SEO";

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
    icon: "🏨",
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
    tasks: ["Answer Questions", "Suggest Products or Services", "Route to Specialist or Human"],
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
    tasks: ["Analyze Reports or Responses", "Recommend Content or Resources"],
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
    tasks: ["Answer Questions", "Suggest Products or Services", "Place Orders"],
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
    tasks: ["Answer Questions", "Analyze Reports or Responses", "Suggest Products or Services"],
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
    tasks: ["Provide Coaching or Training", "Analyze Reports or Responses", "Recommend Content or Resources"],
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
    tasks: ["Answer Questions", "Suggest Products or Services", "Route to Specialist or Human"],
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
    tasks: ["Provide Coaching or Training", "Analyze Reports or Responses", "Recommend Content or Resources"],
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
    tasks: ["Capture Leads", "Suggest Products or Services", "Book Appointments", "Answer Questions"],
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
    tasks: ["Register Users or Attendees", "Send Confirmations", "Answer Questions"],
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
    tasks: ["Provide Coaching or Training", "Book Appointments", "Recommend Content or Resources", "Answer Questions"],
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
    tasks: ["Troubleshoot Issues", "Track Requests or Orders", "Route to Specialist or Human"],
    channels: ["Phone", "Website", "WhatsApp"],
    interface: ["Voice", "Chat"],
    industry: "Tech Support",
    videoUrl: "https://example.com/tech-support-demo"
  }
];

// Extract unique filter options
const getAllTasks = () => {
  const tasks = useCases.flatMap(useCase => useCase.tasks);
  return tasks.filter((task, index, array) => array.indexOf(task) === index);
};
const getAllIndustries = () => {
  const industries = useCases.map(useCase => useCase.industry);
  return industries.filter((industry, index, array) => array.indexOf(industry) === index);
};
const getAllChannels = () => {
  const channels = useCases.flatMap(useCase => useCase.channels);
  return channels.filter((channel, index, array) => array.indexOf(channel) === index);
};
const getAllInterfaces = () => {
  const interfaces = useCases.flatMap(useCase => useCase.interface);
  return interfaces.filter((interfaceType, index, array) => array.indexOf(interfaceType) === index);
};

const UseCases = () => {
  const [selectedFilters, setSelectedFilters] = useState({
    task: [] as string[],
    industry: [] as string[],
    channel: [] as string[],
    interface: [] as string[]
  });

  // Filter use cases based on selected filters
  const filteredUseCases = useMemo(() => {
    return useCases.filter(useCase => {
      const matchesTask = selectedFilters.task.length === 0 || 
        selectedFilters.task.some(task => useCase.tasks.includes(task));
      const matchesIndustry = selectedFilters.industry.length === 0 || 
        selectedFilters.industry.includes(useCase.industry);
      const matchesChannel = selectedFilters.channel.length === 0 || 
        selectedFilters.channel.some(channel => useCase.channels.includes(channel));
      const matchesInterface = selectedFilters.interface.length === 0 || 
        selectedFilters.interface.some(interfaceType => useCase.interface.includes(interfaceType));
      
      return matchesTask && matchesIndustry && matchesChannel && matchesInterface;
    });
  }, [selectedFilters]);

  const addFilter = (type: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [type]: [...prev[type], value]
    }));
  };

  const removeFilter = (type: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item !== value)
    }));
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      task: [],
      industry: [],
      channel: [],
      interface: []
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
                {/* Task Filter */}
                <Select onValueChange={(value) => addFilter('task', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Task" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAllTasks().map(task => (
                      <SelectItem key={task} value={task}>{task}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Industry Filter */}
                <Select onValueChange={(value) => addFilter('industry', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAllIndustries().map(industry => (
                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Channel Filter */}
                <Select onValueChange={(value) => addFilter('channel', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Channel" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAllChannels().map(channel => (
                      <SelectItem key={channel} value={channel}>{channel}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Interface Filter */}
                <Select onValueChange={(value) => addFilter('interface', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Interface" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAllInterfaces().map(interfaceType => (
                      <SelectItem key={interfaceType} value={interfaceType}>{interfaceType}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Active Filters */}
              <div className="flex flex-wrap gap-2 items-center">
                {Object.entries(selectedFilters).map(([type, values]) =>
                  values.map(value => (
                    <Badge key={`${type}-${value}`} variant="secondary" className="flex items-center gap-1">
                      {value}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-destructive" 
                        onClick={() => removeFilter(type as keyof typeof selectedFilters, value)}
                      />
                    </Badge>
                  ))
                )}
                {(selectedFilters.task.length > 0 || selectedFilters.industry.length > 0 || 
                  selectedFilters.channel.length > 0 || selectedFilters.interface.length > 0) && (
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
                        <div className="text-3xl">{useCase.icon}</div>
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
                              <Badge key={task} variant="outline" className="text-xs">
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
                              <Badge key={interfaceType} variant="default" className="text-xs">
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
                              <span className="text-3xl">{useCase.icon}</span>
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

                            <div className="flex gap-4">
                              <Button className="flex-1" onClick={() => window.location.href = "/vera"}>
                                Schedule Consultation
                              </Button>
                              <Button variant="outline" className="flex-1" onClick={() => window.location.href = "/chatbot"}>
                                Build Similar Agent
                              </Button>
                            </div>
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
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                Don't See Your Use Case?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Our AI agents can be customized for any industry or business process. Schedule a consultation to discuss your specific needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => window.location.href = "/vera"}>
                  Schedule Consultation
                </Button>
                <Button size="lg" variant="outline" onClick={() => window.location.href = "/chatbot"}>
                  Build Custom Agent
                </Button>
              </div>
            </div>
          </div>
        </section>

        </main>
        <Footer />
      </div>
    </>
  );
};

export default UseCases;