import { useState, useMemo, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { X, Check, ChevronDown, Hotel, Stethoscope, ShoppingCart, Users, Car, Building2, GraduationCap, Plane, Utensils, Dumbbell, Home, Briefcase, PhoneCall, FileText, Wrench, Microscope, UserPlus, Store, Banknote, HeadphonesIcon, Calculator, MapPin, Clock, BookOpen, BarChart3, Phone, Calendar, Mail, Ticket, Bot, Database, Factory, Mic, MicOff, PhoneOff, ChevronUp, Copy } from "lucide-react";
import { SEO } from "@/components/SEO";
import { AIChatbotForm } from "@/components/AIChatbotForm";
import { AIVoiceAgentForm } from "@/components/AIVoiceAgentForm";
import veraAvatarCentered from "@assets/Vera Avatar Centered.png";
import Vapi from '@vapi-ai/web';

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

// Import AI Agent images - using static URLs for deployment compatibility
const receptionistAgentImg = "/assets/images/agents/receptionist.png";
const roomServiceAgentImg = "/assets/images/agents/room-service.png";
const conciergeAgentImg = "/assets/images/agents/concierge.png";
const customerSupportAgentImg = "/assets/images/agents/customer-support.png";
const ecommerceSalesAgentImg = "/assets/images/agents/ecommerce-sales.png";
const salesAgentImg = "/assets/images/agents/sales.png";
const hrTrainingAgentImg = "/assets/images/agents/hr-training.png";
const marketingAgentImg = "/assets/images/agents/marketing.png";


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

// Map agent titles to their respective imported images
const agentImages: { [key: string]: string } = {
  "Receptionist AI Agent": receptionistAgentImg,
  "Room Service AI Agent": roomServiceAgentImg,
  "Concierge AI Agent": conciergeAgentImg,
  "Customer Support AI Agent": customerSupportAgentImg,
  "Ecommerce Sales AI Agent": ecommerceSalesAgentImg,
  "Sales AI Agent": salesAgentImg,
  "HR/Training AI Agent": hrTrainingAgentImg,
  "Marketing & Outreach AI Agent": marketingAgentImg
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
    tasks: ["Capture Leads", "Suggest Products/Services", "Follow Up"],
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
    tasks: ["Send Campaigns", "Collect Feedback", "Follow Up"],
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

  // State for inline Vera in video div
  const [showVeraInline, setShowVeraInline] = useState(false);
  
  // State to control dialog open/close
  const [dialogOpen, setDialogOpen] = useState<{[key: number]: boolean}>({});
  
  // Vera inline states
  const [isMuted, setIsMuted] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTranscriptVisible, setIsTranscriptVisible] = useState(false);
  const [transcripts, setTranscripts] = useState<any[]>([]);
  const [currentPartial, setCurrentPartial] = useState<any>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected'>('idle');
  const vapiRef = useRef<any>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  
  // Vera form states
  const [showAgentCreation, setShowAgentCreation] = useState(false);
  const [showVoiceAgentCreation, setShowVoiceAgentCreation] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [voiceAgentName, setVoiceAgentName] = useState("");
  const [botId, setBotId] = useState<string | null>(null);
  const [voiceAgentId, setVoiceAgentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [voiceAgentLoading, setVoiceAgentLoading] = useState(false);
  const [currentUseCaseId, setCurrentUseCaseId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [voiceAgentCopied, setVoiceAgentCopied] = useState(false);
  const [bookingInfo, setBookingInfo] = useState<{
    meetingTime?: string;
    meetingDate?: string;
    meetingUrl?: string;
    confirmed?: boolean;
    duration?: number;
    contactName?: string;
    contactEmail?: string;
    organizerName?: string;
  } | null>(null);
  
  // User data for Vera (you can customize this or make it dynamic)
  const veraUser = {
    firstName: "Demo",
    lastName: "User", 
    email: "demo@example.com",
    phoneNumber: "",
    companyName: "Demo Company",
    website: "https://example.com",
    companyWebsite: "https://example.com"
  };

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

  // Auto-scroll transcript for inline Vera
  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [transcripts, currentPartial]);

  // Load HubSpot meetings script when booking form is shown
  useEffect(() => {
    if (showBookingForm) {
      // Check if script is already loaded
      const existingScript = document.getElementById('hubspot-meetings-script');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'hubspot-meetings-script';
        script.type = 'text/javascript';
        script.src = 'https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js';
        script.async = true;
        document.head.appendChild(script);

        // Listen for HubSpot meeting events and initialize embed
        script.onload = () => {
          // Set up event listener for meeting bookings
          window.addEventListener('message', handleHubSpotMessage, false);
          
          // Initialize HubSpot embed after script loads
          setTimeout(() => {
            initializeHubSpotEmbed();
          }, 100);
        };
      } else {
        // Script already loaded, just set up listener and initialize
        window.addEventListener('message', handleHubSpotMessage, false);
        setTimeout(() => {
          initializeHubSpotEmbed();
        }, 100);
      }
    }

    return () => {
      window.removeEventListener('message', handleHubSpotMessage, false);
    };
  }, [showBookingForm]);

  // Initialize HubSpot embed
  const initializeHubSpotEmbed = () => {
    if (typeof window !== 'undefined' && (window as any).hbspt && (window as any).hbspt.meetings) {
      const container = document.querySelector('.meetings-iframe-container');
      if (container && !container.querySelector('iframe')) {
        try {
          (window as any).hbspt.meetings.create({
            portalId: "your-portal-id", // Replace with actual portal ID
            formId: "your-form-id", // Replace with actual form ID  
            target: '.meetings-iframe-container'
          });
        } catch (error) {
          console.log('Error initializing HubSpot embed:', error);
          // Fallback to iframe approach
          const iframe = document.createElement('iframe');
          iframe.src = 'https://meetings-eu1.hubspot.com/rawzaba?embed=true';
          iframe.style.width = '100%';
          iframe.style.height = '100%';
          iframe.style.border = 'none';
          iframe.frameBorder = '0';
          container.innerHTML = '';
          container.appendChild(iframe);
        }
      }
    } else {
      // Fallback to direct iframe if HubSpot script not available
      const container = document.querySelector('.meetings-iframe-container');
      if (container && !container.querySelector('iframe')) {
        const iframe = document.createElement('iframe');
        iframe.src = 'https://meetings-eu1.hubspot.com/rawzaba?embed=true';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.frameBorder = '0';
        container.innerHTML = '';
        container.appendChild(iframe);
      }
    }
  };

  // Handle messages from HubSpot iframe
  const handleHubSpotMessage = (event: MessageEvent) => {
    // Verify origin for security
    if (event.origin !== 'https://meetings-eu1.hubspot.com') {
      return;
    }

    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      console.log(data);
      
      // Check for meeting booking events
      if (data.meetingBookSucceeded && data.meetingsPayload) {
        const eventData = data.meetingsPayload.bookingResponse?.event;
        const postResponse = data.meetingsPayload.bookingResponse?.postResponse;
        
        if (eventData) {
          const meetingDateTime = eventData.dateTime; // Unix timestamp in milliseconds
          const dateString = eventData.dateString; // "2025-06-27" format
          const duration = eventData.duration; // Duration in milliseconds
          const contact = postResponse?.contact;
          const organizer = postResponse?.organizer;
          
          setBookingInfo({
            meetingTime: meetingDateTime ? new Date(meetingDateTime).toISOString() : undefined,
            meetingDate: dateString,
            meetingUrl: postResponse?.meetingLink || undefined,
            confirmed: true,
            duration: duration,
            contactName: contact ? `${contact.firstName} ${contact.lastName}` : undefined,
            contactEmail: contact?.email,
            organizerName: organizer?.name || `${organizer?.firstName} ${organizer?.lastName}`
          });

          // Notify Vera about the booking
          setTimeout(() => {
            if (vapiRef.current && meetingDateTime) {
              const formattedDate = new Date(meetingDateTime).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              });
              
              const durationMinutes = duration ? Math.round(duration / 60000) : 30; // Convert to minutes
              const contactName = contact ? `${contact.firstName} ${contact.lastName}` : 'the user';
              
              vapiRef.current.say(`Perfect! I can see that ${contactName} has successfully booked a ${durationMinutes}-minute meeting for ${formattedDate} with ${organizer?.firstName || 'our team'}. A confirmation email will be sent to ${contact?.email || 'the provided email address'} shortly with all the details. Is there anything else I can help you with in the meantime?`, false);
            } else if (vapiRef.current) {
              vapiRef.current.say("Great! I can see you've successfully booked a meeting with our team. You should receive a confirmation email shortly with all the details. Is there anything else I can help you with?", false);
            }
          }, 1000);
        }
      }
      
      // Handle other HubSpot events
      if (data.type === 'MEETING_CANCELLED') {
        setBookingInfo(null);
        if (vapiRef.current) {
          vapiRef.current.say("I noticed the meeting was cancelled. No worries! Feel free to book another time when it's convenient for you, or let me know if there's anything else I can help with.", false);
        }
      }
    } catch (error) {
      console.log('Error parsing HubSpot message:', error);
    }
  };

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

  // Inline Vera functions
  const startInlineVera = async (assistantId?: string) => {
    setShowVeraInline(true);
    setCallStatus('connecting');
    
    const apiKey = import.meta.env.VITE_VAPI_KEY;
    if (!apiKey) {
      console.error('Voice API key is not set. Please check your .env file.');
      return;
    }

    try {
      const vapiInstance = new Vapi(apiKey);
      vapiRef.current = vapiInstance;

      const assistantOverrides = {
        variableValues: {
          firstName: veraUser.firstName,
          lastName: veraUser.lastName,
          email: veraUser.email,
          phoneNumber: veraUser.phoneNumber,
          companyName: veraUser.companyName,
          website: veraUser.website,
          companyWebsite: veraUser.companyWebsite,
        }
      };
      
      // Use provided assistant ID or default to Vera's ID
      const defaultAssistantId = '42531902-20ad-46c7-a611-3e0ccf721aa1';
      vapiInstance.start(assistantId || defaultAssistantId, assistantOverrides);

      vapiInstance.on('call-start', () => {
        setIsCallActive(true);
        setTranscripts([]);
        setCurrentPartial(null);
        setCallStatus('connected');
      });

      vapiInstance.on('call-end', () => {
        setIsCallActive(false);
        setCallStatus('idle');
        setShowVeraInline(false);
        if (vapiRef.current === vapiInstance) {
          vapiRef.current = null;
        }
      });

      vapiInstance.on('speech-start', () => {
        setIsSpeaking(true);
      });

      vapiInstance.on('speech-end', () => {
        setIsSpeaking(false);
        setCurrentPartial(null);
      });

             vapiInstance.on('message', (message: any) => {
              console.log(message);
        if (message.type === 'transcript') {
          if (message.transcriptType === 'partial') {
            setCurrentPartial({
              role: message.role,
              text: message.transcript,
              isPartial: true
            });
          } else if (message.transcriptType === 'final') {
            setTranscripts(prev => [...prev, { role: message.role, text: message.transcript }]);
            setCurrentPartial(null);
          }
        }
        // Handle tool-calls for agent creation and booking
        if (message.type === "tool-calls" && Array.isArray(message.toolCallList)) {
          for (const toolCall of message.toolCallList) {
            if (toolCall.type === "function" && toolCall.function?.name === "CreateChatbot") {
              setShowAgentCreation(true);
              setShowVoiceAgentCreation(false);
              setShowBookingForm(false);
            }
            if (toolCall.type === "function" && toolCall.function?.name === "CreateVoiceAgent") {
              setShowAgentCreation(false);
              setShowVoiceAgentCreation(true);
              setShowBookingForm(false);
            }
            if (toolCall.type === "function" && toolCall.function?.name === "showBookingForm") {
              setShowAgentCreation(false);
              setShowVoiceAgentCreation(false);
              setShowBookingForm(true);
            }
          }
        }
      });

      vapiInstance.on('error', (error: any) => {
        setIsCallActive(false);
        setCallStatus('idle');
        setShowVeraInline(false);
        if (vapiRef.current === vapiInstance) {
          vapiRef.current = null;
        }
      });
    } catch (error) {
      setCallStatus('idle');
      setShowVeraInline(false);
    }
  };

  const handleInlineMuteToggle = () => {
    if (vapiRef.current) {
      const newMutedState = !isMuted;
      vapiRef.current.setMuted(newMutedState);
      setIsMuted(newMutedState);
    }
  };

  const handleInlineEndCall = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
      vapiRef.current = null;
    }
    setShowVeraInline(false);
    setIsCallActive(false);
    setCallStatus('idle');
    setTranscripts([]);
    setCurrentPartial(null);
    setIsMuted(false);
    setIsSpeaking(false);
    setIsTranscriptVisible(false);
    // Reset form states
    setShowAgentCreation(false);
    setShowVoiceAgentCreation(false);
    setShowBookingForm(false);
    setAgentName("");
    setVoiceAgentName("");
    setBotId(null);
    setVoiceAgentId(null);
    setLoading(false);
    setVoiceAgentLoading(false);
    setCurrentUseCaseId(null);
    setCopied(false);
    setVoiceAgentCopied(false);
    setBookingInfo(null);
  };

  // Agent creation handlers
  const handleInlineAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setBotId(null);
    
    if (vapiRef.current) {
      vapiRef.current.say("Creating your chatbot now. This may take a few seconds. Please stay on the line.", false);
    }
    
    const formData = new FormData();
    formData.append("username", veraUser.firstName);
    formData.append("email", veraUser.email);
    formData.append("name", agentName);
    formData.append("url", veraUser.website);
    formData.append("source", window.location.href);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/bot/createsimplechatbot`, { 
        method: "POST", 
        body: formData 
      });
      const data = await response.json();
      setBotId(data?.assistantData?._id || "Unknown");
      
      if (vapiRef.current) {
        if (data.failedToScrape) {
          vapiRef.current.say("Great news! Your chatbot is now ready. You can see the link below to test it. I've also sent you an email with a link to your personal dashboard where you can customize and enhance your agent. However, I was unable to scrape your website. You can login to your dashboard and add your website manually.", false);
        } else {
          vapiRef.current.say("Great news! Your chatbot is now ready. You can see the link below to test it. I've also sent you an email with a link to your personal dashboard where you can customize and enhance your agent.", false);
        }
      }
    } catch (error) {
      if (vapiRef.current) {
        vapiRef.current.say("I apologize, but there was an error creating your chatbot. Let's try again.", false);
      }
      setBotId("Error");
    } finally {
      setLoading(false);
    }
  };

  const handleInlineVoiceAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVoiceAgentLoading(true);
    setVoiceAgentId(null);
    
    if (vapiRef.current) {
      vapiRef.current.say("Creating your voice agent now. This may take a few seconds. Please stay on the line.", false);
    }
    
    const formData = new FormData();
    formData.append("username", veraUser.firstName);
    formData.append("email", veraUser.email);
    formData.append("name", voiceAgentName);
    formData.append("url", veraUser.website);
    formData.append("source", window.location.href);
    formData.append("image", "potential-default-voice.png");
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/vapi/simpleassistant`, { 
        method: "POST", 
        body: formData 
      });
      const data = await response.json();
      setVoiceAgentId(data?.assistant?.id || "Unknown");
      
      if (vapiRef.current) {
        if (data.failedToScrape) {
          vapiRef.current.say("Great news! Your voice agent is now ready. You can see the link below to test it. I've also sent you an email with a link to your personal dashboard where you can customize and enhance your agent. However, I was unable to scrape your website. You can login to your dashboard and add your website manually.", false);
        } else {
          vapiRef.current.say("Great news! Your voice agent is now ready. You can see the link below to test it. I've also sent you an email with a link to your personal dashboard where you can customize and enhance your agent.", false);
        }
      }
    } catch (error) {
      if (vapiRef.current) {
        vapiRef.current.say("I apologize, but there was an error creating your voice agent. Let's try again.", false);
      }
      setVoiceAgentId("Error");
    } finally {
      setVoiceAgentLoading(false);
    }
  };

  // Copy functions
  const handleCopyAgent = (id: string) => {
    const url = `${import.meta.env.VITE_BASE_URL}/chat/${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleCopyVoiceAgent = (id: string) => {
    const url = `${import.meta.env.VITE_BASE_URL}/voice/${id}`;
    navigator.clipboard.writeText(url);
    setVoiceAgentCopied(true);
    setTimeout(() => setVoiceAgentCopied(false), 1500);
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
                          src={agentImages[useCase.title] || conciergeAgentImg} 
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

                      <Dialog 
                        open={dialogOpen[useCase.id] || false}
                        onOpenChange={(open) => {
                          const isAIAgent = useCase.title === "Concierge AI Agent" || useCase.title === "HR/Training AI Agent" || useCase.title === "Room Service AI Agent" || useCase.title === "Receptionist AI Agent" || useCase.title === "Sales AI Agent";
                          const hasActiveOrConnectingCall = isCallActive || callStatus === 'connecting';
                          
                          // Prevent closing if there's an active/connecting call for AI agents
                          if (!open && isAIAgent && hasActiveOrConnectingCall) {
                            // Keep the dialog open by not updating the state
                            return;
                          }
                          
                          // Update dialog state for normal operation
                          setDialogOpen(prev => ({ ...prev, [useCase.id]: open }));
                          
                          // Clean up call if dialog is being closed
                          if (!open && isAIAgent && hasActiveOrConnectingCall) {
                            handleInlineEndCall();
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full bg-primary hover:bg-primary/90 text-white"
                            onClick={() => {
                              // Open the dialog
                              setDialogOpen(prev => ({ ...prev, [useCase.id]: true }));
                              
                              if (useCase.title === "Concierge AI Agent") {
                                setCurrentUseCaseId(useCase.id);
                                // Auto-start Vera after modal opens
                                setTimeout(() => {
                                  startInlineVera();
                                }, 500);
                              } else if (useCase.title === "HR/Training AI Agent") {
                                setCurrentUseCaseId(useCase.id);
                                // Auto-start Nole after modal opens
                                setTimeout(() => {
                                  startInlineVera('926fc07e-28bd-4c40-9757-05acec3524f2');
                                }, 500);
                              } else if (useCase.title === "Room Service AI Agent") {
                                setCurrentUseCaseId(useCase.id);
                                // Auto-start Tony after modal opens
                                setTimeout(() => {
                                  startInlineVera('631984d9-b601-4088-b2db-8fb011a98c25');
                                }, 500);
                              } else if (useCase.title === "Receptionist AI Agent") {
                                setCurrentUseCaseId(useCase.id);
                                // Auto-start Zoya after modal opens
                                setTimeout(() => {
                                  startInlineVera('d3f482dd-5b8e-4913-ab90-2371cd4f1f91');
                                }, 500);
                              } else if (useCase.title === "Sales AI Agent") {
                                setCurrentUseCaseId(useCase.id);
                                // Auto-start Charlie after modal opens
                                setTimeout(() => {
                                  startInlineVera('f04e39ee-dc09-4032-a55c-b4eccbb85834');
                                }, 500);
                              }
                            }}
                          >
                            Try This Agent
                          </Button>
                        </DialogTrigger>
                        <DialogContent 
                          className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto"
                          onInteractOutside={(e) => {
                            const isAIAgent = useCase.title === "Concierge AI Agent" || useCase.title === "HR/Training AI Agent" || useCase.title === "Room Service AI Agent" || useCase.title === "Receptionist AI Agent" || useCase.title === "Sales AI Agent";
                            const hasActiveOrConnectingCall = isCallActive || callStatus === 'connecting';
                            // Prevent dialog from closing when clicking outside if there's an active/connecting call
                            if (isAIAgent && hasActiveOrConnectingCall) {
                              e.preventDefault();
                              e.stopPropagation();
                              return false;
                            }
                          }}
                          onEscapeKeyDown={(e) => {
                            const isAIAgent = useCase.title === "Concierge AI Agent" || useCase.title === "HR/Training AI Agent" || useCase.title === "Room Service AI Agent" || useCase.title === "Receptionist AI Agent" || useCase.title === "Sales AI Agent";
                            const hasActiveOrConnectingCall = isCallActive || callStatus === 'connecting';
                            // Prevent dialog from closing with escape key if there's an active/connecting call
                            if (isAIAgent && hasActiveOrConnectingCall) {
                              e.preventDefault();
                              e.stopPropagation();
                              return false;
                            }
                          }}
                        >
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
                            
                            {/* Video Demo or Vera/Nole/Tony/Zoya/Charlie Interface */}
                            <div className="aspect-video bg-muted rounded-lg mb-4 sm:mb-6 overflow-hidden">
                              {(useCase.title === "Concierge AI Agent" || useCase.title === "HR/Training AI Agent" || useCase.title === "Room Service AI Agent" || useCase.title === "Receptionist AI Agent" || useCase.title === "Sales AI Agent") ? (
                                showVeraInline ? (
                                  <div className="w-full h-full flex flex-col lg:flex-row bg-background border border-border">
                                    {/* Left: Forms Section */}
                                    {(showAgentCreation || showVoiceAgentCreation || showBookingForm) && (
                                      <div className="flex-1 p-2 sm:p-4 border-b lg:border-b-0 lg:border-r border-border overflow-y-auto min-h-0">
                                        {showAgentCreation && (
                                          <div className="w-full bg-background/80 rounded-2xl shadow-lg p-4 lg:p-8 flex flex-col items-center">
                                            <h2 className="text-2xl font-bold text-primary mb-2 text-center">Create Your AI Chatbot</h2>
                                            <p className="text-sm text-muted-foreground mb-6 text-center">Instantly deploy a custom AI agent for your business.</p>
                                                                                         {botId ? (
                                              <div className="flex flex-col items-center">
                                                <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-3 mb-3">
                                                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                                <p className="mb-2 text-green-800 dark:text-green-200 text-lg font-semibold">Chatbot Created!</p>
                                                <p className="mb-2 text-base text-center break-all">ID: <b>{botId}</b></p>
                                                <div className="flex items-center gap-2 w-full mb-2">
                                                  <input
                                                    className="w-full rounded bg-muted/40 border-none p-2 text-sm font-mono"
                                                    value={`${import.meta.env.VITE_BASE_URL}/chat/${botId}`}
                                                    readOnly
                                                  />
                                                  <button
                                                    type="button"
                                                    onClick={() => handleCopyAgent(botId)}
                                                    className="p-2 rounded hover:bg-primary/10 transition"
                                                    aria-label="Copy chatbot link"
                                                  >
                                                    {copied ? (
                                                      <Check className="h-5 w-5 text-green-600" />
                                                    ) : (
                                                      <Copy className="h-5 w-5 text-primary" />
                                                    )}
                                                  </button>
                                                  {copied && <span className="text-xs text-green-600 ml-1">Copied!</span>}
                                                </div>
                                                <Button onClick={() => window.open(`${import.meta.env.VITE_BASE_URL}/chat/${botId}`, '_blank')} className="w-full mt-4">Test Your Chatbot</Button>
                                              </div>
                                            ) : (
                                              <form onSubmit={handleInlineAgentSubmit} className="w-full flex flex-col gap-4">
                                                <div>
                                                  <label className="block text-sm font-medium mb-1" htmlFor="agentName">Agent Name</label>
                                                  <input
                                                    id="agentName"
                                                    className="w-full rounded-lg bg-muted/40 border-none p-3 focus:outline-none focus:ring-2 focus:ring-primary/40 text-base transition"
                                                    value={agentName}
                                                    onChange={e => setAgentName(e.target.value)}
                                                    required
                                                    placeholder="Enter your agent's name"
                                                    autoComplete="off"
                                                  />
                                                </div>
                                                <Button type="submit" disabled={loading} className="w-full text-base font-semibold py-3 mt-2">
                                                  {loading ? "Creating..." : "Create Chatbot"}
                                                </Button>
                                              </form>
                                            )}
                                          </div>
                                        )}

                                        {showVoiceAgentCreation && (
                                          <div className="w-full bg-background/80 rounded-2xl shadow-lg p-4 lg:p-8 flex flex-col items-center">
                                            <h2 className="text-2xl font-bold text-primary mb-2 text-center">Create Your AI Voice Agent</h2>
                                            <p className="text-sm text-muted-foreground mb-6 text-center">Instantly deploy a custom AI voice agent for your business.</p>
                                                                                         {voiceAgentId ? (
                                              <div className="flex flex-col items-center">
                                                <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-3 mb-3">
                                                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                                <p className="mb-2 text-green-800 dark:text-green-200 text-lg font-semibold">Voice Agent Created!</p>
                                                <p className="mb-2 text-base text-center break-all">ID: <b>{voiceAgentId}</b></p>
                                                <div className="flex items-center gap-2 w-full mb-2">
                                                  <input
                                                    className="w-full rounded bg-muted/40 border-none p-2 text-sm font-mono"
                                                    value={`${import.meta.env.VITE_BASE_URL}/voice/${voiceAgentId}`}
                                                    readOnly
                                                  />
                                                  <button
                                                    type="button"
                                                    onClick={() => handleCopyVoiceAgent(voiceAgentId)}
                                                    className="p-2 rounded hover:bg-primary/10 transition"
                                                    aria-label="Copy voice agent link"
                                                  >
                                                    {voiceAgentCopied ? (
                                                      <Check className="h-5 w-5 text-green-600" />
                                                    ) : (
                                                      <Copy className="h-5 w-5 text-primary" />
                                                    )}
                                                  </button>
                                                  {voiceAgentCopied && <span className="text-xs text-green-600 ml-1">Copied!</span>}
                                                </div>
                                                <Button onClick={() => window.open(`${import.meta.env.VITE_BASE_URL}/voice/${voiceAgentId}`, '_blank')} className="w-full mt-4">Test Your Voice Agent</Button>
                                              </div>
                                            ) : (
                                              <form onSubmit={handleInlineVoiceAgentSubmit} className="w-full flex flex-col gap-4">
                                                <div>
                                                  <label className="block text-sm font-medium mb-1" htmlFor="voiceAgentName">Agent Name</label>
                                                  <input
                                                    id="voiceAgentName"
                                                    className="w-full rounded-lg bg-muted/40 border-none p-3 focus:outline-none focus:ring-2 focus:ring-primary/40 text-base transition"
                                                    value={voiceAgentName}
                                                    onChange={e => setVoiceAgentName(e.target.value)}
                                                    required
                                                    placeholder="Enter your agent's name"
                                                    autoComplete="off"
                                                  />
                                                </div>
                                                <Button type="submit" disabled={voiceAgentLoading} className="w-full text-base font-semibold py-3 mt-2">
                                                  {voiceAgentLoading ? "Creating..." : "Create Voice Agent"}
                                                </Button>
                                              </form>
                                            )}
                                          </div>
                                        )}

                                        {showBookingForm && (
                                          <div className="w-full bg-background/80 rounded-2xl shadow-lg p-4 lg:p-8 flex flex-col items-center">
                                            <h2 className="text-xl lg:text-2xl font-bold text-primary mb-2 text-center">Schedule a Consultation</h2>
                                            <p className="text-sm text-muted-foreground mb-4 lg:mb-6 text-center">Let's discuss your AI needs with one of our human experts.</p>
                                            <div className="w-full">
                                              {bookingInfo?.confirmed ? (
                                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
                                                  <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3 mx-auto w-12 h-12 flex items-center justify-center mb-4">
                                                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                  </div>
                                                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                                                    Meeting Booked Successfully!
                                                  </h3>
                                                  <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                                                    {bookingInfo.contactEmail ? `Confirmation email will be sent to ${bookingInfo.contactEmail}` : "You'll receive a confirmation email with all the meeting details shortly."}
                                                  </p>
                                                  {bookingInfo.meetingTime && (
                                                    <div className="text-xs text-green-600 dark:text-green-400 mb-4 space-y-1">
                                                      <p>
                                                        <strong>Meeting Time:</strong> {new Date(bookingInfo.meetingTime).toLocaleDateString('en-US', {
                                                          weekday: 'long',
                                                          year: 'numeric',
                                                          month: 'long',
                                                          day: 'numeric',
                                                          hour: 'numeric',
                                                          minute: '2-digit',
                                                          timeZoneName: 'short'
                                                        })}
                                                      </p>
                                                      {bookingInfo.duration && (
                                                        <p>
                                                          <strong>Duration:</strong> {Math.round(bookingInfo.duration / 60000)} minutes
                                                        </p>
                                                      )}
                                                      {bookingInfo.organizerName && (
                                                        <p>
                                                          <strong>Meeting with:</strong> {bookingInfo.organizerName}
                                                        </p>
                                                      )}
                                                      {bookingInfo.contactName && (
                                                        <p>
                                                          <strong>Attendee:</strong> {bookingInfo.contactName}
                                                        </p>
                                                      )}
                                                    </div>
                                                  )}
                                                </div>
                                              ) : (
                                                <div 
                                                  className="meetings-iframe-container rounded-lg overflow-hidden" 
                                                  data-src="https://meetings-eu1.hubspot.com/rawzaba?embed=true"
                                                  style={{ 
                                                    minHeight: '400px',
                                                    height: '60vh',
                                                    maxHeight: '600px',
                                                    width: '100%'
                                                  }}
                                                ></div>
                                              )}
                                              <Button 
                                                onClick={() => setShowBookingForm(false)} 
                                                className="w-full mt-4"
                                                variant="outline"
                                                size="sm"
                                              >
                                                {bookingInfo?.confirmed ? 'Close' : 'Close Booking Form'}
                                              </Button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* Right: Vera/Nole Interface */}
                                    <div className="flex-1 p-2 sm:p-4 flex flex-col h-full min-h-[300px] lg:min-h-0">
                                      <h3 className="text-xl font-semibold text-center mb-2">
                                        {useCase.title === "HR/Training AI Agent" ? "Talk to Nole" : 
                                         useCase.title === "Room Service AI Agent" ? "Talk to Tony" : 
                                         useCase.title === "Receptionist AI Agent" ? "Talk to Zoya" :
                                         useCase.title === "Sales AI Agent" ? "Talk to Charlie" :
                                         "Talk to Vera"}
                                      </h3>
                                      <div className="w-full flex items-center justify-center mb-4">
                                        {callStatus === 'connecting' && (
                                          <span className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                                            {useCase.title === "HR/Training AI Agent" ? "Connecting to Nole..." : 
                                             useCase.title === "Room Service AI Agent" ? "Connecting to Tony..." : 
                                             useCase.title === "Receptionist AI Agent" ? "Connecting to Zoya..." :
                                             useCase.title === "Sales AI Agent" ? "Connecting to Charlie..." :
                                             "Connecting to Vera..."}
                                          </span>
                                        )}
                                        {callStatus === 'connected' && (
                                          <span className="flex items-center gap-2 text-sm text-green-400">
                                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
                                            Connected
                                          </span>
                                        )}
                                      </div>

                                      {/* Avatar Section */}
                                      <div className="flex flex-col items-center mb-4">
                                        <div className="relative w-24 h-24 lg:w-32 lg:h-32 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg">
                                          <img
                                            src={useCase.title === "HR/Training AI Agent" ? hrTrainingAgentImg : 
                                                 useCase.title === "Room Service AI Agent" ? roomServiceAgentImg : 
                                                 useCase.title === "Receptionist AI Agent" ? receptionistAgentImg :
                                                 useCase.title === "Sales AI Agent" ? salesAgentImg :
                                                 conciergeAgentImg}
                                            alt={useCase.title === "HR/Training AI Agent" ? "Nole" : 
                                                 useCase.title === "Room Service AI Agent" ? "Tony" : 
                                                 useCase.title === "Receptionist AI Agent" ? "Zoya" :
                                                 useCase.title === "Sales AI Agent" ? "Charlie" :
                                                 "Vera"}
                                            className={`w-full h-full object-cover ${isSpeaking ? 'animate-pulse' : ''}`}
                                          />
                                          {isSpeaking && (
                                            <div className="absolute inset-0 bg-primary/10 animate-ping rounded-full" />
                                          )}
                                        </div>
                                      </div>

                                      {/* Transcript Section - Flexible */}
                                      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                                        <div className="w-full flex flex-col space-y-2 h-full">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full flex items-center justify-between px-4 py-2 border-2 rounded-lg hover:bg-muted/50 transition-colors flex-shrink-0"
                                            onClick={() => setIsTranscriptVisible(!isTranscriptVisible)}
                                          >
                                            <div className="flex items-center space-x-2">
                                              <span className="text-sm font-medium">Conversation Transcript</span>
                                              <span className="text-xs text-muted-foreground">
                                                ({transcripts.length} messages)
                                              </span>
                                            </div>
                                            {isTranscriptVisible ? (
                                              <ChevronUp className="h-4 w-4" />
                                            ) : (
                                              <ChevronDown className="h-4 w-4" />
                                            )}
                                          </Button>
                                          
                                          <div 
                                            ref={transcriptContainerRef}
                                            className={`w-full bg-muted/30 rounded-lg overflow-y-auto scroll-smooth transition-all duration-300 border ${
                                              isTranscriptVisible ? 'flex-1 opacity-100 p-2 lg:p-4' : 'h-0 opacity-0 overflow-hidden p-0'
                                            }`}
                                            style={{
                                              maxHeight: isTranscriptVisible ? 'calc(100% - 60px)' : '0px'
                                            }}
                                          >
                                            {transcripts.length === 0 && !currentPartial ? (
                                              <div className="flex items-center justify-center h-full text-muted-foreground text-sm min-h-[100px]">
                                                Your conversation will appear here...
                                              </div>
                                            ) : (
                                              <div className="space-y-3">
                                                {transcripts.map((transcript, index) => (
                                                  <div
                                                    key={index}
                                                    className={`p-3 rounded-lg shadow-sm ${
                                                      transcript.role === 'assistant'
                                                        ? 'bg-primary/10 ml-4 border border-primary/20'
                                                        : 'bg-muted-foreground/10 mr-4 border border-muted-foreground/20'
                                                    }`}
                                                  >
                                                    <p className="text-sm">
                                                      <span className="font-semibold text-primary">
                                                        {transcript.role === 'assistant' ? 
                                                          (useCase.title === "HR/Training AI Agent" ? 'Nole' : 
                                                           useCase.title === "Room Service AI Agent" ? 'Tony' : 
                                                           useCase.title === "Receptionist AI Agent" ? 'Zoya' :
                                                           useCase.title === "Sales AI Agent" ? 'Charlie' :
                                                           'Vera') : 'You'}:
                                                      </span>{' '}
                                                      {transcript.text}
                                                    </p>
                                                  </div>
                                                ))}
                                                {currentPartial && (
                                                  <div
                                                    className={`p-3 rounded-lg shadow-sm opacity-50 ${
                                                      currentPartial.role === 'assistant'
                                                        ? 'bg-primary/10 ml-4 border border-primary/20'
                                                        : 'bg-muted-foreground/10 mr-4 border border-muted-foreground/20'
                                                    }`}
                                                  >
                                                    <p className="text-sm">
                                                      <span className="font-semibold text-primary">
                                                        {currentPartial.role === 'assistant' ? 
                                                          (useCase.title === "HR/Training AI Agent" ? 'Nole' : 
                                                           useCase.title === "Room Service AI Agent" ? 'Tony' : 
                                                           useCase.title === "Receptionist AI Agent" ? 'Zoya' :
                                                           useCase.title === "Sales AI Agent" ? 'Charlie' :
                                                           'Vera') : 'You'}:
                                                      </span>{' '}
                                                      {currentPartial.text}
                                                    </p>
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Control Buttons - Always at bottom */}
                                      <div className="flex items-center justify-center space-x-4 pt-4 mt-4 border-t border-border/20 flex-shrink-0">
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          onClick={handleInlineMuteToggle}
                                          className={`h-10 w-10 lg:h-12 lg:w-12 rounded-full ${
                                            isMuted ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' : ''
                                          }`}
                                        >
                                          {isMuted ? <MicOff className="h-4 w-4 lg:h-5 lg:w-5" /> : <Mic className="h-4 w-4 lg:h-5 lg:w-5" />}
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          size="icon"
                                          onClick={handleInlineEndCall}
                                          className="h-10 w-10 lg:h-12 lg:w-12 rounded-full"
                                        >
                                          <PhoneOff className="h-4 w-4 lg:h-5 lg:w-5" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center p-4">
                                                                      <div className="text-center">
                                    <div className="text-3xl sm:text-4xl mb-4">🎯</div>
                                    <p className="text-muted-foreground text-sm sm:text-base mb-4">
                                      {useCase.title === "HR/Training AI Agent" ? "Nole will start automatically..." : 
                                       useCase.title === "Room Service AI Agent" ? "Tony will start automatically..." : 
                                       useCase.title === "Receptionist AI Agent" ? "Zoya will start automatically..." :
                                       useCase.title === "Sales AI Agent" ? "Charlie will start automatically..." :
                                       "Vera will start automatically..."}
                                    </p>
                                  </div>
                                  </div>
                                )
                              ) : useCase.title === "Banking: Customer Support Agent" && useCase.industry === "Banking" ? (
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

                            <Button 
                              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm sm:text-base py-2 sm:py-3"
                              onClick={() => {
                                const isAIAgent = useCase.title === "Concierge AI Agent" || useCase.title === "HR/Training AI Agent" || useCase.title === "Room Service AI Agent" || useCase.title === "Receptionist AI Agent" || useCase.title === "Sales AI Agent";
                                const hasActiveOrConnectingCall = isCallActive || callStatus === 'connecting';
                                
                                // End Vapi call if it's active or connecting
                                if (isAIAgent && hasActiveOrConnectingCall) {
                                  handleInlineEndCall();
                                }
                                
                                // Close the dialog
                                setDialogOpen(prev => ({ ...prev, [useCase.id]: false }));
                                
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
                              {useCase.title === "Concierge AI Agent" ? (
                                <>
                                  <span className="hidden sm:inline">Build Your Custom Concierge Agent - starting from $500/month</span>
                                  <span className="sm:hidden">Build Custom Agent - $500/month</span>
                                </>
                              ) : useCase.title === "HR/Training AI Agent" ? (
                                <>
                                  <span className="hidden sm:inline">Build Your Custom HR/Interview Agent - starting from $500/month</span>
                                  <span className="sm:hidden">Build Custom HR Agent - $500/month</span>
                                </>
                              ) : useCase.title === "Room Service AI Agent" ? (
                                <>
                                  <span className="hidden sm:inline">Build Your Custom Room Service Agent - starting from $500/month</span>
                                  <span className="sm:hidden">Build Custom Room Service Agent - $500/month</span>
                                </>
                              ) : useCase.title === "Receptionist AI Agent" ? (
                                <>
                                  <span className="hidden sm:inline">Build Your Custom Receptionist Agent - starting from $500/month</span>
                                  <span className="sm:hidden">Build Custom Receptionist Agent - $500/month</span>
                                </>
                              ) : useCase.title === "Sales AI Agent" ? (
                                <>
                                  <span className="hidden sm:inline">Build Your Custom Sales Agent - starting from $500/month</span>
                                  <span className="sm:hidden">Build Custom Sales Agent - $500/month</span>
                                </>
                              ) : (
                                <>
                                  <span className="hidden sm:inline">Hire Your Next {useCase.title} starting from $500/month</span>
                                  <span className="sm:hidden">Hire This Agent - $500/month</span>
                                </>
                              )}
                            </Button>
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
        <section className="py-12 lg:py-16 from-background to-muted/20 overflow-hidden bg-muted/30 dark:bg-muted/10">
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
                      <svg className="w-full h-full opacity-30 dark:opacity-50">
                        <defs>
                          <linearGradient id="connectionGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="hsl(270, 70%, 56%)" />
                            <stop offset="100%" stopColor="hsl(270, 70%, 40%)" />
                          </linearGradient>
                          <linearGradient id="connectionGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="hsl(270, 60%, 70%)" />
                            <stop offset="100%" stopColor="hsl(270, 60%, 85%)" />
                          </linearGradient>
                        </defs>
                        
                        {/* Lines to each integration point - better positioned */}
                        <line x1="50%" y1="50%" x2="15%" y2="15%" stroke="url(#connectionGradientLight)" strokeWidth="2" className="animate-pulse dark:hidden" strokeDasharray="4,4">
                          <animate attributeName="stroke-dashoffset" values="0;8" dur="2s" repeatCount="indefinite"/>
                        </line>
                        <line x1="50%" y1="50%" x2="15%" y2="15%" stroke="url(#connectionGradientDark)" strokeWidth="2" className="animate-pulse hidden dark:block" strokeDasharray="4,4">
                          <animate attributeName="stroke-dashoffset" values="0;8" dur="2s" repeatCount="indefinite"/>
                        </line>
                        
                        <line x1="50%" y1="50%" x2="85%" y2="15%" stroke="url(#connectionGradientLight)" strokeWidth="2" className="animate-pulse dark:hidden" strokeDasharray="4,4">
                          <animate attributeName="stroke-dashoffset" values="0;8" dur="2.5s" repeatCount="indefinite"/>
                        </line>
                        <line x1="50%" y1="50%" x2="85%" y2="15%" stroke="url(#connectionGradientDark)" strokeWidth="2" className="animate-pulse hidden dark:block" strokeDasharray="4,4">
                          <animate attributeName="stroke-dashoffset" values="0;8" dur="2.5s" repeatCount="indefinite"/>
                        </line>
                        
                        <line x1="50%" y1="50%" x2="5%" y2="50%" stroke="url(#connectionGradientLight)" strokeWidth="2" className="animate-pulse dark:hidden" strokeDasharray="4,4">
                          <animate attributeName="stroke-dashoffset" values="0;8" dur="3s" repeatCount="indefinite"/>
                        </line>
                        <line x1="50%" y1="50%" x2="5%" y2="50%" stroke="url(#connectionGradientDark)" strokeWidth="2" className="animate-pulse hidden dark:block" strokeDasharray="4,4">
                          <animate attributeName="stroke-dashoffset" values="0;8" dur="3s" repeatCount="indefinite"/>
                        </line>
                        
                        <line x1="50%" y1="50%" x2="95%" y2="50%" stroke="url(#connectionGradientLight)" strokeWidth="2" className="animate-pulse dark:hidden" strokeDasharray="4,4">
                          <animate attributeName="stroke-dashoffset" values="0;8" dur="2.2s" repeatCount="indefinite"/>
                        </line>
                        <line x1="50%" y1="50%" x2="95%" y2="50%" stroke="url(#connectionGradientDark)" strokeWidth="2" className="animate-pulse hidden dark:block" strokeDasharray="4,4">
                          <animate attributeName="stroke-dashoffset" values="0;8" dur="2.2s" repeatCount="indefinite"/>
                        </line>
                        
                        <line x1="50%" y1="50%" x2="15%" y2="85%" stroke="url(#connectionGradientLight)" strokeWidth="2" className="animate-pulse dark:hidden" strokeDasharray="4,4">
                          <animate attributeName="stroke-dashoffset" values="0;8" dur="2.8s" repeatCount="indefinite"/>
                        </line>
                        <line x1="50%" y1="50%" x2="15%" y2="85%" stroke="url(#connectionGradientDark)" strokeWidth="2" className="animate-pulse hidden dark:block" strokeDasharray="4,4">
                          <animate attributeName="stroke-dashoffset" values="0;8" dur="2.8s" repeatCount="indefinite"/>
                        </line>
                        
                        <line x1="50%" y1="50%" x2="85%" y2="85%" stroke="url(#connectionGradientLight)" strokeWidth="2" className="animate-pulse dark:hidden" strokeDasharray="4,4">
                          <animate attributeName="stroke-dashoffset" values="0;8" dur="2.3s" repeatCount="indefinite"/>
                        </line>
                        <line x1="50%" y1="50%" x2="85%" y2="85%" stroke="url(#connectionGradientDark)" strokeWidth="2" className="animate-pulse hidden dark:block" strokeDasharray="4,4">
                          <animate attributeName="stroke-dashoffset" values="0;8" dur="2.3s" repeatCount="indefinite"/>
                        </line>
                        
                        <line x1="50%" y1="50%" x2="50%" y2="5%" stroke="url(#connectionGradientLight)" strokeWidth="2" className="animate-pulse dark:hidden" strokeDasharray="4,4">
                          <animate attributeName="stroke-dashoffset" values="0;8" dur="2.7s" repeatCount="indefinite"/>
                        </line>
                        <line x1="50%" y1="50%" x2="50%" y2="5%" stroke="url(#connectionGradientDark)" strokeWidth="2" className="animate-pulse hidden dark:block" strokeDasharray="4,4">
                          <animate attributeName="stroke-dashoffset" values="0;8" dur="2.7s" repeatCount="indefinite"/>
                        </line>
                        
                        <line x1="50%" y1="50%" x2="50%" y2="95%" stroke="url(#connectionGradientLight)" strokeWidth="2" className="animate-pulse dark:hidden" strokeDasharray="4,4">
                          <animate attributeName="stroke-dashoffset" values="0;8" dur="2.6s" repeatCount="indefinite"/>
                        </line>
                        <line x1="50%" y1="50%" x2="50%" y2="95%" stroke="url(#connectionGradientDark)" strokeWidth="2" className="animate-pulse hidden dark:block" strokeDasharray="4,4">
                          <animate attributeName="stroke-dashoffset" values="0;8" dur="2.6s" repeatCount="indefinite"/>
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