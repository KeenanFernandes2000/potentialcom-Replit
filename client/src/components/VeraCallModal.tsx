import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, PhoneOff, ChevronDown, ChevronUp, Check, Copy } from "lucide-react";
import veraAvatarCentered from "@assets/Vera Avatar Centered.png";
import Vapi from '@vapi-ai/web';

interface VeraCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRemount?: () => void;
}

interface Transcript {
  role: string;
  text: string;
  isPartial?: boolean;
}

interface VeraCallModalUser {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  companyName: string;
  website: string;
  companyWebsite: string;
}

export function VeraCallModal({ isOpen, onClose, user, onRemount }: VeraCallModalProps & { user: VeraCallModalUser; onRemount?: () => void }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTranscriptVisible, setIsTranscriptVisible] = useState(false);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [currentPartial, setCurrentPartial] = useState<Transcript | null>(null);
  const vapiRef = useRef<Vapi | null>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected'>('idle');
  const [showAgentCreation, setShowAgentCreation] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [botId, setBotId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showVoiceAgentCreation, setShowVoiceAgentCreation] = useState(false);
  const [voiceAgentName, setVoiceAgentName] = useState("");
  const [voiceAgentId, setVoiceAgentId] = useState<string | null>(null);
  const [voiceAgentLoading, setVoiceAgentLoading] = useState(false);
  const [voiceAgentCopied, setVoiceAgentCopied] = useState(false);
  const voiceAgentUrl = voiceAgentId ? `https://ai.potential.com/voice/${voiceAgentId}` : "";
  const [waitingMessageIndex, setWaitingMessageIndex] = useState(0);
  const [isWaiting, setIsWaiting] = useState(false);
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);

  const waitingMessages = [
    "I'm setting up your AI agent with all the necessary configurations...",
    "Training your agent on your business context...",
    "Almost there! Just a few more seconds...",
    "Your agent is being prepared with the latest AI capabilities...",
    "Just a moment while I finalize your agent's settings..."
  ];

  const startWaitingMessages = () => {
    setIsWaiting(true);
    setWaitingMessageIndex(0);
    sayNextWaitingMessage();
  };

  const sayNextWaitingMessage = () => {
    if (!isWaiting || !vapiRef.current) return;
    
    vapiRef.current.say(waitingMessages[waitingMessageIndex], false);
    
    if (waitingMessageIndex < waitingMessages.length - 1) {
      setWaitingMessageIndex(prev => prev + 1);
      setTimeout(sayNextWaitingMessage, 8000);
    }
  };

  const stopWaitingMessages = () => {
    setIsWaiting(false);
    setWaitingMessageIndex(0);
  };

  // Add cleanup on unmount
  useEffect(() => {
    return () => {
      stopWaitingMessages();
    };
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [transcripts, currentPartial]);

  // Add microphone permission check
  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately after getting permission
      stream.getTracks().forEach(track => track.stop());
      setMicPermissionError(null);
      return true;
    } catch (error) {
      console.error('Microphone permission error:', error);
      setMicPermissionError('Microphone access is required for this call. Please enable microphone access in your browser settings and <b>reload the page</b>.');
      return false;
    }
  };

  useEffect(() => {
    if (isOpen && !vapiRef.current) {
      setCallStatus('connecting');
      const apiKey = import.meta.env.VITE_VAPI_KEY;
      if (!apiKey) {
        console.error('Voice API key is not set. Please check your .env file.');
        return;
      }

      // Check microphone permission before initializing the call
      checkMicrophonePermission().then(hasPermission => {
        if (!hasPermission) {
          setCallStatus('idle');
          return;
        }

        try {
          const vapiInstance = new Vapi(apiKey);
          vapiRef.current = vapiInstance;

          const assistantOverrides = {
            model: {
              provider: "openai" as "openai",
              model: "gpt-4o-mini" as "gpt-4o-mini",
              messages: [
                {
                  role: "system" as "system",
                  content: `**Vera's Role & Operating Instructions**

You are Vera, a voice-based AI customer service and sales representative working for Potential.com. Your mission is to empower businesses through AI adoption—starting with AI Voice Agents and Chatbots, known for their quick setup and fast ROI.
---

**User Information:**
* Name: ${user.firstName} ${user.lastName}
* Email: ${user.email}
* Phone: ${user.phoneNumber}
* Company: ${user.companyName}
* Website: ${user.website}
* Company Website: ${user.companyWebsite}

**Your Objectives:**
* Engage users in a friendly, interactive, and consultative manner.
* Automatically open the chatbot or voice agent creation form when requested.
* Use pre-filled user data (name, email, etc.); do not ask users for their name.
* Prompt users to input the proposed agent name and click "Create".
---
**Your Capabilities:**
* **Find the Right AI Solutions**: Discover AI tools suited to user needs.
* **Set Up Chatbots & Voice Agents**: Use the CreateChatbot or CreateVoiceAgent function.
* **Schedule a Meeting**: For high-end leads only, offer to book a meeting with a human consultant.
---
**Guiding Principles:**
* Keep responses short and conversational.
* Ask about business needs before recommending a solution.
* Focus on benefits, not just features—keep things simple and clear.
* Use whole numbers (e.g., "twenty-three" not "two three") unless digit-specific (e.g., phone numbers).
* Speak like a digital team member—not a robot.
---
**Core Products from Potential.com:**
1. **AI Chatbots**: Website-integrated chatbots that engage customers 24/7.
2. **AI Voice Agents**: Handle calls with human-like voices—cutting costs and increasing sales.
3. **AI-Linked Micro Platforms**: Lightweight plug-and-play business systems.
**AI agents can be deployed in minutes to days—not months.**
---
**Discovery Process:**
* Ask if their goal is to increase sales or reduce costs.
* Uncover their use case (support, lead gen, internal ops).
* Ask about:
  * Required inputs and outputs
  * Integration needs (APIs, local/cloud hosting)
  * Internal systems they use
---
**Messaging Philosophy:**
1. **Old Software is Obsolete**
   * "Most companies overpay for software they barely use."
   * "Enterprise tools are slow, bloated, and not AI-ready."
2. **The New Model: AI + Micro Platforms**
   * "Use AI agents that solve 80% of your problem at 20% of the cost."
3. **Start Small**
   * "Launch your first chatbot or voicebot today—trained on your site or content."
4. **Grow with Confidence**
   * "Add more agents and tools as your needs evolve."
---
**Sample Micro Platforms:**
* **CRM Lite**: Organize leads, track deals, get AI insights.
* **LMS Lite**: Deliver learning with AI tutors and progress tracking.
* **Support Desk**: AI auto-responders + ticketing.
* **KPI Tracker**: Monitor key metrics with predictive AI.
* **Hackathon Platform**: Run innovation programs with AI scoring.
* **Project Manager**: AI-enhanced task tracking.
* **Coaching & Mentoring**: Personalized growth paths.
* **Marketplace**: AI-curated ecosystem listings.
* **Social Impact**: Track community initiatives.
* **Public Certification**: Skill and credential verification.
---
**Pricing:**
* AI Agents: From $50/month.
* Setup + Branding + AI Training: One-time fee.
* Optional: Ongoing training and yearly support.
---
**Why Choose Us:**
* 20 years of organizational transformation experience.
* Dedicated onboarding and AI guidance.
* Free AI upskilling programs for clients.
* Fast, no-code deployment.
* We build what you need—no bloated one-size-fits-all tools.
---
**Practical User Questions → Your Responses:**
* "What do you offer?" → Chatbots, Voicebots, and Micro Platforms.
* "How is this different?" → Faster, cheaper, modular vs enterprise bloat.
* "Can it replace my CRM/LMS?" → Yes—start with agents, then expand.
* "How do I start?" → Try chatbot or voice agent now.
* "Can I customize it?" → Yes—trained on your site, no code needed.
* "Do I install anything?" → No—embed via browser or script.
* "Cost?" → From $50/month; $499+ for platforms.
* "Can I talk to someone?" → Only if they're high-end leads.
* "Deploy across departments?" → Yes: Start → Expand → Integrate.
* "We're a free zone / gov agency?" → Offer co-branding or partner model.
---
**CTA Behavior (Chatbots or Voicebots):**
1. If asked about chatbot:
   * Auto-launch CreateChatbot form.
   * Prompt: "Please enter your proposed chatbot name and click 'Create'.".
   * CTA: [Let's Try It Now]
2. If asked about voice agent:
   * Auto-launch CreateVoiceAgent form.
   * Prompt: "Please enter your proposed voice agent name and click 'Create'.".
   * CTA: [Let's Try It Now]
---
`,
                },
              ],
              functions: [
                {
                  name: "CreateChatbot",
                  async: true,
                  description: "Opens the chatbot creation form for the user.",
                  parameters: {
                    type: "object",
                    properties: {}
                  }
                },
                {
                  name: "CreateVoiceAgent",
                  async: true,
                  description: "Opens the voice agent creation form for the user.",
                  parameters: {
                    type: "object",
                    properties: {}
                  }
                }
              ],
              maxTokens: 250,
              temperature: 0,
              emotionRecognitionEnabled: true,
            },
          };
          
          vapiInstance.start('42531902-20ad-46c7-a611-3e0ccf721aa1', assistantOverrides);

          vapiInstance.on('call-start', () => {
            setIsCallActive(true);
            setTranscripts([]);
            setCurrentPartial(null);
            setCallStatus('connected');
          });

          vapiInstance.on('call-end', () => {
            setIsCallActive(false);
            setCallStatus('idle');
            if (vapiRef.current === vapiInstance) {
              vapiRef.current = null;
              onClose();
            }
          });

          vapiInstance.on('speech-start', () => {
            setIsSpeaking(true);
          });

          vapiInstance.on('speech-end', () => {
            setIsSpeaking(false);
            setCurrentPartial(null);
          });

          vapiInstance.on('message', (message) => {
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
            // Handle tool-calls for agent creation
            if (
              message.type === "tool-calls" &&
              Array.isArray(message.toolCallList)
            ) {
              for (const toolCall of message.toolCallList) {
                if (
                  toolCall.type === "function" &&
                  toolCall.function?.name === "CreateChatbot"
                ) {
                  setShowAgentCreation(true);
                }
                if (
                  toolCall.type === "function" &&
                  toolCall.function?.name === "CreateVoiceAgent"
                ) {
                  setShowVoiceAgentCreation(true);
                }
              }
            }
          });

          vapiInstance.on('error', (error) => {
            setIsCallActive(false);
            setCallStatus('idle');
            if (vapiRef.current === vapiInstance) {
              vapiRef.current = null;
              onClose();
            }
          });

          return () => {
            if (vapiRef.current === vapiInstance) {
              vapiInstance.stop();
              vapiRef.current = null;
            }
          };
        } catch (error) {
          setCallStatus('idle');
          onClose();
        }
      });
    }
  }, [isOpen, onClose]);

  const handleMuteToggle = () => {
    if (vapiRef.current) {
      const newMutedState = !isMuted;
      vapiRef.current.setMuted(newMutedState);
      setIsMuted(newMutedState);
    }
  };

  const handleEndCall = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
      vapiRef.current = null;
      onClose();
    }
  };

  // Reset state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      stopWaitingMessages();
      setIsMuted(false);
      setIsCallActive(false);
      setIsSpeaking(false);
      setIsTranscriptVisible(false);
      setTranscripts([]);
      setCurrentPartial(null);
      setCallStatus('idle');
      if (transcriptContainerRef.current) {
        transcriptContainerRef.current.scrollTop = 0;
      }
    }
  }, [isOpen]);

  // Agent creation handler
  const handleAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setBotId(null);
    stopWaitingMessages();
    vapiRef.current?.say("Creating your chatbot now. This may take a few seconds. Please stay on the line.", false);
    startWaitingMessages();
    const formData = new FormData();
    formData.append("username", user.firstName);
    formData.append("email", user.email);
    formData.append("name", agentName);
    const websiteUrl = user.website ? user.website : "https://placeholder-no-website.com";
    formData.append("url", websiteUrl);
    const utmMedium = new URLSearchParams(window.location.search).get(
      "utm_medium"
    );
    if (utmMedium) {
      formData.append("medium", utmMedium);
    }
    formData.append("source", window.location.href);
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/bot/createsimplechatbot`, { method: "POST", body: formData });
      const data = await response.json();
      stopWaitingMessages();
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBotId(data?.assistantData?._id || "Unknown");
      vapiRef.current?.say("Great news! Your chatbot is now ready. You can click on the provided link to test it. I've also sent you an email with a link to your personal dashboard where you can customize and enhance your agent.", false);
    } catch (error) {
      stopWaitingMessages();
      await new Promise(resolve => setTimeout(resolve, 1000));
      vapiRef.current?.say("I apologize, but there was an error creating your chatbot. Let's try again.", false);
      setBotId("Error");
    } finally {
      setLoading(false);
    }
  };

  const chatbotUrl = botId ? `https://ai.potential.com/chat/${botId}` : "";

  const handleCopy = () => {
    if (!chatbotUrl) return;
    navigator.clipboard.writeText(chatbotUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleVoiceAgentCopy = () => {
    if (!voiceAgentUrl) return;
    navigator.clipboard.writeText(voiceAgentUrl);
    setVoiceAgentCopied(true);
    setTimeout(() => setVoiceAgentCopied(false), 1500);
  };

  const handleVoiceAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVoiceAgentLoading(true);
    setVoiceAgentId(null);
    stopWaitingMessages();
    vapiRef.current?.say("Creating your voice agent now. This may take a few seconds. Please stay on the line.", false);
    startWaitingMessages();
    const formData = new FormData();
    formData.append("username", user.firstName);
    formData.append("email", user.email);
    formData.append("name", voiceAgentName);
    const websiteUrl = user.website ? user.website : "https://placeholder-no-website.com";
    formData.append("url", websiteUrl);
    const utmMedium = new URLSearchParams(window.location.search).get("utm_medium");
    if (utmMedium) {
      formData.append("medium", utmMedium);
    }
    formData.append("source", window.location.href);
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/vapi/simpleassistant`, { method: "POST", body: formData });
      const data = await response.json();
      stopWaitingMessages();
      await new Promise(resolve => setTimeout(resolve, 1000));
      setVoiceAgentId(data?.assistant?.id || "Unknown");
      vapiRef.current?.say("Great news! Your voice agent is now ready. You can click on the provided link to test it. I've also sent you an email with a link to your personal dashboard where you can customize and enhance your agent.", false);
    } catch (error) {
      stopWaitingMessages();
      await new Promise(resolve => setTimeout(resolve, 1000));
      vapiRef.current?.say("I apologize, but there was an error creating your voice agent. Let's try again.", false);
      setVoiceAgentId("Error");
    } finally {
      setVoiceAgentLoading(false);
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          handleEndCall();
        }
      }}
      modal={true}
    >
      <DialogContent 
        className="sm:max-w-3xl"
        onInteractOutside={e => e.preventDefault()}
      >
        {micPermissionError && (
          <div className="mb-6 w-full flex flex-col items-center">
            <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-xl px-6 py-4 shadow-md w-full max-w-md">
              <span className="flex-shrink-0">
                <MicOff className="h-6 w-6 text-red-600" />
              </span>
              <div className="flex-1">
                <p className="text-red-700 dark:text-red-300 font-semibold text-base mb-1">
                  Microphone access is required for this call.
                </p>
                <p className="text-xs text-red-600 dark:text-red-200">
                  Please enable microphone access in your browser settings and <b>reload the page</b>.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 border-red-300 dark:border-red-700 text-red-700 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-900/30"
                  onClick={() => {
                    setMicPermissionError(null);
                    if (typeof onRemount === 'function') onRemount();
                  }}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-row gap-6">
          {/* Left: Agent Creation or Voice Agent Creation */}
          {(showAgentCreation || showVoiceAgentCreation) && (
            <div className="flex-1 border-r pr-6 flex flex-col justify-center items-center">
              <div className="w-full max-w-xs mx-auto bg-background/80 rounded-2xl shadow-lg p-8 flex flex-col items-center">
                {showAgentCreation && <>
                  <h2 className="text-2xl font-bold text-primary mb-2 text-center">Create Your AI Chatbot</h2>
                  <p className="text-sm text-muted-foreground mb-6 text-center">
                    Instantly deploy a custom AI agent for your business.
                  </p>
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
                          value={chatbotUrl}
                          readOnly
                        />
                        <button
                          type="button"
                          onClick={handleCopy}
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
                      <Button onClick={() => setShowAgentCreation(false)} className="w-full mt-4">Close</Button>
                    </div>
                  ) : (
                    <form onSubmit={handleAgentSubmit} className="w-full flex flex-col gap-4">
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
                </>}
                {showVoiceAgentCreation && <>
                  <h2 className="text-2xl font-bold text-primary mb-2 text-center">Create Your AI Voice Agent</h2>
                  <p className="text-sm text-muted-foreground mb-6 text-center">
                    Instantly deploy a custom AI voice agent for your business.
                  </p>
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
                          value={voiceAgentUrl}
                          readOnly
                        />
                        <button
                          type="button"
                          onClick={handleVoiceAgentCopy}
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
                      <Button onClick={() => setShowVoiceAgentCreation(false)} className="w-full mt-4">Close</Button>
                    </div>
                  ) : (
                    <form onSubmit={handleVoiceAgentSubmit} className="w-full flex flex-col gap-4">
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
                </>}
              </div>
            </div>
          )}
          {/* Right: Vera UI (your existing Vera call UI) */}
          <div className="flex-1 pl-6">
            <DialogTitle className="text-xl font-semibold text-center mb-2">Talk to Vera</DialogTitle>
            <div className="w-full flex items-center justify-center mb-2">
              {callStatus === 'connecting' && (
                <span className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                  Connecting to Vera...
                </span>
              )}
              {callStatus === 'connected' && (
                <span className="flex items-center gap-2 text-sm text-green-400">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
                  Connected
                </span>
              )}
            </div>
            <div className="flex flex-col items-center space-y-6">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg">
                <img
                  src={veraAvatarCentered}
                  alt="Vera"
                  className={`w-full h-full object-cover ${isSpeaking ? 'animate-pulse' : ''}`}
                />
                {isSpeaking && (
                  <div className="absolute inset-0 bg-primary/10 animate-ping rounded-full" />
                )}
              </div>

              <div className="w-full flex flex-col space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center justify-between px-4 py-2 border-2 rounded-lg hover:bg-muted/50 transition-colors"
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
                  className={`w-full bg-muted/30 rounded-lg overflow-y-auto p-4 scroll-smooth transition-all duration-300 border ${
                    isTranscriptVisible ? 'h-[300px] opacity-100' : 'h-0 opacity-0'
                  }`}
                >
                  {transcripts.length === 0 && !currentPartial ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      Your conversation will appear here...
                    </div>
                  ) : (
                    <>
                      {transcripts.map((transcript, index) => (
                        <div
                          key={index}
                          className={`mb-3 p-3 rounded-lg shadow-sm ${
                            transcript.role === 'assistant'
                              ? 'bg-primary/10 ml-4 border border-primary/20'
                              : 'bg-muted-foreground/10 mr-4 border border-muted-foreground/20'
                          }`}
                        >
                          <p className="text-sm">
                            <span className="font-semibold text-primary">
                              {transcript.role === 'assistant' ? 'Vera' : 'You'}:
                            </span>{' '}
                            {transcript.text}
                          </p>
                        </div>
                      ))}
                      {currentPartial && (
                        <div
                          className={`mb-3 p-3 rounded-lg shadow-sm opacity-50 ${
                            currentPartial.role === 'assistant'
                              ? 'bg-primary/10 ml-4 border border-primary/20'
                              : 'bg-muted-foreground/10 mr-4 border border-muted-foreground/20'
                          }`}
                        >
                          <p className="text-sm">
                            <span className="font-semibold text-primary">
                              {currentPartial.role === 'assistant' ? 'Vera' : 'You'}:
                            </span>{' '}
                            {currentPartial.text}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleMuteToggle}
                  className={`h-12 w-12 rounded-full ${
                    isMuted ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' : ''
                  }`}
                >
                  {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={handleEndCall}
                  className="h-12 w-12 rounded-full"
                >
                  <PhoneOff className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}