import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, PhoneOff, ChevronDown, ChevronUp, Check, Copy, AlertTriangle, RefreshCw, CalendarClock } from "lucide-react";
import AylaAvatarCentered from "@assets/Ayla Avatar Centered.png";
import Vapi from '@vapi-ai/web';

const ASSISTANT_ID =
  import.meta.env.VITE_AYLA_BOT_ID || "32d7022b-8c96-4498-bd94-60dfd4171e4f";

/** If Vapi has not reported call-start by now, the connection is not coming. */
const CONNECT_TIMEOUT_MS = 20000;
/** Silence from the local microphone for this long means the device, not the visitor. */
const NO_USER_AUDIO_MS = 10000;
/**
 * Fallback fuse for SDK versions with no local audio-level observer: the only
 * evidence the microphone works is then a user transcript, which is slower to
 * arrive and needs a longer fuse to avoid crying wolf at someone who is thinking.
 */
const NO_USER_TRANSCRIPT_MS = 25000;

/**
 * Prefer a server-signed, origin- and assistant-scoped JWT over the public key.
 * The public key is a fallback only: without it a token outage would take the
 * whole call flow down, and the key is no more exposed than it already was.
 */
async function resolveVapiCredential(): Promise<{ credential: string; scoped: boolean }> {
  const publicKey = import.meta.env.VITE_VAPI_KEY;
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vapi/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assistantId: ASSISTANT_ID }),
    });
    if (res.ok) {
      const { token } = await res.json();
      if (token) return { credential: token, scoped: true };
    }
    console.warn(`Vapi token endpoint returned ${res.status}; falling back to the public key.`);
  } catch (err) {
    console.warn("Vapi token endpoint unreachable; falling back to the public key.", err);
  }
  return { credential: publicKey, scoped: false };
}

/**
 * Vapi reports why a call stopped in `status-update`. Only some reasons are the
 * visitor's problem; the rest need to read as "our fault, here is the way out"
 * rather than the modal simply vanishing.
 */
function describeEndedReason(reason?: string): { title: string; detail: string } | null {
  if (!reason) return null;
  if (reason === "customer-ended-call" || reason.startsWith("assistant-ended-call")) return null;
  if (reason.includes("max-duration")) {
    return {
      title: "We ran out of time on this call.",
      detail: "Ayla's calls are time-limited. Start again to carry on, or book a session with a consultant.",
    };
  }
  if (reason.includes("microphone") || reason.includes("no-microphone")) {
    return {
      title: "We lost your microphone.",
      detail: "Check that the right input device is selected, then start the call again.",
    };
  }
  // The dominant failure: 18 of her last 43 calls, every one of them 0.000s
  // long, going back to March. The audio track never reached Vapi at all, so
  // this is not a visitor who went quiet — it is a capture that never started.
  if (reason.includes("did-not-receive-customer-audio")) {
    return {
      title: "Your microphone never came through.",
      detail: "The call connected but no audio reached us. Starting again usually fixes it — if it doesn't, book a session with a consultant.",
    };
  }
  if (reason.includes("ejected") || reason.includes("meeting-ended") || reason.includes("transport")) {
    return {
      title: "The connection dropped.",
      detail: "This is usually the network. Start the call again, or book a session instead.",
    };
  }
  return {
    title: "The call ended unexpectedly.",
    detail: "Sorry — that one is on us. Try again, or book a session with a consultant.",
  };
}

interface AylaCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRemount?: () => void;
}

interface Transcript {
  role: string;
  text: string;
  isPartial?: boolean;
}

interface AylaCallModalUser {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  companyName: string;
  website: string;
  companyWebsite: string;
  role: string;
}

export function AylaCallModal({ isOpen, onClose, user, onRemount }: AylaCallModalProps & { user: AylaCallModalUser; onRemount?: () => void }) {
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
  const voiceAgentUrl = voiceAgentId && voiceAgentId !== "Error" ? `https://ai.potential.com/voice/${voiceAgentId}` : "";
  const [waitingMessageIndex, setWaitingMessageIndex] = useState(0);
  const [isWaiting, setIsWaiting] = useState(false);
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);
  const [callError, setCallError] = useState<{ title: string; detail: string } | null>(null);
  const [audioWarning, setAudioWarning] = useState<string | null>(null);
  const [isStalled, setIsStalled] = useState(false);
  const [micDevices, setMicDevices] = useState<MediaDeviceInfo[]>([]);
  const [networkWarning, setNetworkWarning] = useState(false);
  const connectTimerRef = useRef<number | undefined>(undefined);
  const silenceWatchRef = useRef<number | undefined>(undefined);
  const lastLoudAtRef = useRef(0);
  const heardUserRef = useRef(false);
  const endedReasonRef = useRef<string | null>(null);

  // The parent passes onClose as an inline arrow, so it is a different function
  // on every render. Reading it — and user — through refs keeps the call effect
  // keyed on isOpen alone. Otherwise any re-render re-runs that effect, and its
  // cleanup stops a call that has only just connected.
  const onCloseRef = useRef(onClose);
  const userRef = useRef(user);
  onCloseRef.current = onClose;
  userRef.current = user;

  /** Offer a way out of a dead input device: list the other microphones. */
  const loadMicDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setMicDevices(devices.filter(d => d.kind === "audioinput"));
    } catch (err) {
      console.warn("Could not enumerate microphones", err);
    }
  };

  const switchMicrophone = async (deviceId: string) => {
    if (typeof vapiRef.current?.setInputDevicesAsync !== "function") {
      setAudioWarning("Switching device isn't available here — choose your microphone in the browser's site settings, then start the call again.");
      return;
    }
    try {
      await vapiRef.current.setInputDevicesAsync({ audioDeviceId: deviceId });
      lastLoudAtRef.current = Date.now();
      setAudioWarning(null);
    } catch (err) {
      console.error("Could not switch microphone", err);
      setAudioWarning("We couldn't switch to that microphone. Try another one, or book a session instead.");
    }
  };
  const [showBookingForm, setShowBookingForm] = useState(false);
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

        // Listen for HubSpot meeting events
        script.onload = () => {
          // Set up event listener for meeting bookings
          window.addEventListener('message', handleHubSpotMessage, false);
        };
      } else {
        // Script already loaded, just set up listener
        window.addEventListener('message', handleHubSpotMessage, false);
      }
    }

    return () => {
      window.removeEventListener('message', handleHubSpotMessage, false);
    };
  }, [showBookingForm]);

  // Handle messages from HubSpot iframe
  const handleHubSpotMessage = (event: MessageEvent) => {
    // Verify origin for security
    if (event.origin !== 'https://meetings-eu1.hubspot.com') {
      return;
    }

    // HubSpot's iframe also posts plain strings across this channel, so parse
    // only what can be JSON instead of logging an exception for every one.
    if (typeof event.data === 'string' && !event.data.trimStart().startsWith('{')) {
      return;
    }

    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

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

          // Notify Ayla about the booking
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

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [transcripts, currentPartial]);

  // Add microphone permission check
  const checkMicrophonePermission = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicPermissionError('This browser cannot open a microphone. Try Chrome, Edge or Safari — or book a session with a consultant instead.');
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately after getting permission
      stream.getTracks().forEach(track => track.stop());
      setMicPermissionError(null);
      return true;
    } catch (error) {
      console.error('Microphone permission error:', error);
      // "Denied" and "there is no microphone" need different instructions, and
      // the name is the only thing that separates them.
      const name = (error as DOMException)?.name;
      if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        setMicPermissionError('We could not find a microphone on this device. Plug one in and try again, or book a session with a consultant instead.');
      } else if (name === 'NotReadableError') {
        setMicPermissionError('Your microphone is in use by another app. Close the other call or recording, then try again.');
      } else {
        setMicPermissionError('Microphone access is required for this call. Allow it in your browser settings, then try again.');
      }
      return false;
    }
  };

  useEffect(() => {
    if (isOpen && !vapiRef.current) {
      setCallStatus('connecting');
      setCallError(null);
      setAudioWarning(null);
      endedReasonRef.current = null;
      // The modal can be dismissed while we are still awaiting permission or a
      // token; without this flag the call would connect to a closed modal and
      // keep the microphone open.
      let cancelled = false;

      const startCall = async () => {
        const hasPermission = await checkMicrophonePermission();
        if (cancelled) return;
        if (!hasPermission) {
          setCallStatus('idle');
          return;
        }

        const { credential, scoped } = await resolveVapiCredential();
        if (cancelled) return;
        if (!credential) {
          console.error('No Vapi credential available: the token endpoint failed and VITE_VAPI_KEY is not set.');
          setCallStatus('idle');
          setCallError({
            title: "We couldn't start the call.",
            detail: "Ayla is briefly unavailable. Book a session with a consultant and we'll pick it up from there.",
          });
          return;
        }
        if (!scoped) {
          console.warn('Ayla is running on the unscoped public key for this call.');
        }

        try {
          const vapiInstance = new Vapi(credential);
          vapiRef.current = vapiInstance;

          // Nothing else tells us a connection silently never arrived.
          connectTimerRef.current = window.setTimeout(() => {
            if (vapiRef.current !== vapiInstance) return;
            try { vapiInstance.stop(); } catch { /* already gone */ }
            vapiRef.current = null;
            setCallStatus('idle');
            setIsCallActive(false);
            setCallError({
              title: "Ayla couldn't connect.",
              detail: "That is usually a firewall or a flaky network. Try again, or book a session with a consultant.",
            });
          }, CONNECT_TIMEOUT_MS);

          const assistantOverrides = {
            variableValues: {
              firstName: userRef.current.firstName,
              lastName: userRef.current.lastName,
              email: userRef.current.email,
              phoneNumber: userRef.current.phoneNumber,
              companyName: userRef.current.companyName,
              website: userRef.current.website,
              companyWebsite: userRef.current.companyWebsite,
              role: userRef.current.role,
            }
          };
          
          vapiInstance.start(ASSISTANT_ID, assistantOverrides);

          vapiInstance.on('call-start', () => {
            window.clearTimeout(connectTimerRef.current);
            setIsCallActive(true);
            setTranscripts([]);
            setCurrentPartial(null);
            setCallStatus('connected');
            heardUserRef.current = false;
            lastLoudAtRef.current = Date.now();

            // The local mic level is the direct way to catch a dead input
            // device, but it only exists from @vapi-ai/web 2.7. Older versions
            // throw on the call, which would take the rest of this handler with
            // it, so feature-detect rather than assume the installed version.
            const client = vapiInstance as unknown as {
              startLocalAudioLevelObserver?: (interval?: number) => Promise<void>;
            };
            const hasLevelObserver = typeof client.startLocalAudioLevelObserver === "function";
            if (hasLevelObserver) {
              void client.startLocalAudioLevelObserver!(200);
            }

            silenceWatchRef.current = window.setInterval(() => {
              if (vapiRef.current !== vapiInstance) return;
              if (vapiInstance.isMuted()) {
                lastLoudAtRef.current = Date.now();
                return;
              }
              // Without the observer, lastLoudAt only moves on a user
              // transcript — so once we have heard them, stop watching rather
              // than warning every visitor who pauses to think.
              if (!hasLevelObserver && heardUserRef.current) return;
              const limit = hasLevelObserver ? NO_USER_AUDIO_MS : NO_USER_TRANSCRIPT_MS;
              if (Date.now() - lastLoudAtRef.current > limit) {
                setAudioWarning(
                  "We can't hear anything from your microphone. It may be muted, turned down, or the wrong input device.",
                );
                void loadMicDevices();
              }
            }, 2000);
          });

          vapiInstance.on('local-volume-level', (level: number) => {
            // Anything above the noise floor proves the microphone is live.
            if (level > 0.02) {
              lastLoudAtRef.current = Date.now();
              setAudioWarning(null);
            }
          });

          vapiInstance.on('call-start-failed', (event: any) => {
            console.error('Vapi call-start-failed:', event);
            window.clearTimeout(connectTimerRef.current);
            if (vapiRef.current !== vapiInstance) return;
            vapiRef.current = null;
            setCallStatus('idle');
            setIsCallActive(false);
            setCallError({
              title: "Ayla couldn't connect.",
              detail: `The call failed while ${event?.stage || 'connecting'}. Try again, or book a session with a consultant.`,
            });
          });

          vapiInstance.on('network-quality-change', (event: any) => {
            // 'bad' and 'low' are Daily's degraded thresholds.
            const quality = event?.threshold || event?.quality;
            setNetworkWarning(quality === 'bad' || quality === 'low' || quality === 'very-low');
          });

          vapiInstance.on('call-end', () => {
            window.clearTimeout(connectTimerRef.current);
            window.clearInterval(silenceWatchRef.current);
            setIsCallActive(false);
            setCallStatus('idle');
            if (vapiRef.current === vapiInstance) {
              vapiRef.current = null;
              const failure = describeEndedReason(endedReasonRef.current || undefined);
              // A clean hang-up closes the modal; anything else keeps it open so
              // the visitor gets an explanation and a way forward.
              if (failure) {
                setCallError(failure);
              } else {
                onCloseRef.current();
              }
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
            if (message.type === 'transcript') {
              if (message.role === 'user') {
                // Proof the microphone is live: clear any "we can't hear you" hint.
                heardUserRef.current = true;
                lastLoudAtRef.current = Date.now();
                setAudioWarning(null);
              }
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

            // Vapi reports the reason a call stopped here, not on 'call-end'.
            if (message.type === 'status-update') {
              if (message.endedReason) endedReasonRef.current = message.endedReason;
              if (message.status === 'ended') setIsSpeaking(false);
            }

            // The pipeline stalled (model, voice or tool latency). Say so rather
            // than leaving the visitor talking into silence.
            if (message.type === 'hang') {
              setIsStalled(true);
              window.setTimeout(() => setIsStalled(false), 6000);
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
                  setShowVoiceAgentCreation(false);
                  setShowBookingForm(false);
                }
                if (
                  toolCall.type === "function" &&
                  toolCall.function?.name === "CreateVoiceAgent"
                ) {
                  setShowAgentCreation(false);
                  setShowVoiceAgentCreation(true);
                  setShowBookingForm(false);
                }
                if (
                  toolCall.type === "function" &&
                  toolCall.function?.name === "showBookingForm"
                ) {
                  setShowAgentCreation(false);
                  setShowVoiceAgentCreation(false);
                  setShowBookingForm(true);
                }
              }
            }
          });

          vapiInstance.on('error', (error) => {
            console.error('Vapi call error:', error);
            window.clearTimeout(connectTimerRef.current);
            window.clearInterval(silenceWatchRef.current);
            setIsCallActive(false);
            setCallStatus('idle');
            if (vapiRef.current === vapiInstance) {
              vapiRef.current = null;
              setCallError(
                describeEndedReason(endedReasonRef.current || undefined) || {
                  title: "The call dropped.",
                  detail: "Sorry — that one is on us. Try again, or book a session with a consultant.",
                },
              );
            }
          });
        } catch (error) {
          console.error('Could not initialise the Vapi client:', error);
          window.clearTimeout(connectTimerRef.current);
          setCallStatus('idle');
          setCallError({
            title: "We couldn't start the call.",
            detail: "Your browser may be blocking it. Try again, or book a session with a consultant.",
          });
        }
      };

      void startCall();

      return () => {
        cancelled = true;
        window.clearTimeout(connectTimerRef.current);
        window.clearInterval(silenceWatchRef.current);
        if (vapiRef.current) {
          try { vapiRef.current.stop(); } catch { /* already stopped */ }
          vapiRef.current = null;
        }
      };
    }
  }, [isOpen]);

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
      setShowAgentCreation(false);
      setShowVoiceAgentCreation(false);
      setShowBookingForm(false);
      setBotId(null);
      setVoiceAgentId(null);
      setAgentName("");
      setVoiceAgentName("");
      setBookingInfo(null);
      setCallError(null);
      setAudioWarning(null);
      setIsStalled(false);
      setNetworkWarning(false);
      setMicDevices([]);
      window.clearTimeout(connectTimerRef.current);
      window.clearInterval(silenceWatchRef.current);
      endedReasonRef.current = null;
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bot/createsimplechatbot`, { method: "POST", body: formData });
      const data = await response.json().catch(() => ({}));
      stopWaitingMessages();
      await new Promise(resolve => setTimeout(resolve, 1000));
      // A 429 or a 500 still parses as JSON. Announcing "your chatbot is ready"
      // and showing a link to an id that does not exist is worse than failing.
      if (!response.ok || !data?.assistantData?._id) {
        if (response.status === 429) {
          vapiRef.current?.say("We've hit our limit for new agents from your network for now. I can book you a session with a consultant instead.", false);
        } else {
          vapiRef.current?.say("I'm sorry, I couldn't create your chatbot just now. Shall I book you a session with a consultant instead?", false);
        }
        setBotId("Error");
        return;
      }
      setBotId(data.assistantData._id);
      if(data.failedToScrape){
        vapiRef.current?.say("Great news! Your chatbot is now ready. You can click on the provided link to test it. I've also sent you an email with a link to your personal dashboard where you can customize and enhance your agent. However, I was unable to scrape your website. You can login to your dashboard and add your website manually.", false);
      }
        else{
          vapiRef.current?.say("Great news! Your chatbot is now ready. You can click on the provided link to test it. I've also sent you an email with a link to your personal dashboard where you can customize and enhance your agent.", false);
        }
    } catch (error) {
      stopWaitingMessages();
      await new Promise(resolve => setTimeout(resolve, 1000));
      vapiRef.current?.say("I apologize, but there was an error creating your chatbot. Let's try again.", false);
      setBotId("Error");
    } finally {
      setLoading(false);
    }
  };

  const chatbotUrl = botId && botId !== "Error" ? `https://ai.potential.com/chat/${botId}` : "";

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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vapi/simpleassistant`, { method: "POST", body: formData });
      const data = await response.json().catch(() => ({}));
      stopWaitingMessages();
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Same as the chatbot path: only claim success when there is a real id.
      if (!response.ok || !data?.assistant?.id) {
        if (response.status === 429) {
          vapiRef.current?.say("We've hit our limit for new agents from your network for now. I can book you a session with a consultant instead.", false);
        } else {
          vapiRef.current?.say("I'm sorry, I couldn't create your voice agent just now. Shall I book you a session with a consultant instead?", false);
        }
        setVoiceAgentId("Error");
        return;
      }
      setVoiceAgentId(data.assistant.id);
      if(data.failedToScrape){
        vapiRef.current?.say("Great news! Your voice agent is now ready. You can click on the provided link to test it. I've also sent you an email with a link to your personal dashboard where you can customize and enhance your agent. However, I was unable to scrape your website. You can login to your dashboard and add your website manually.", false);
      }
      else{
        vapiRef.current?.say("Great news! Your voice agent is now ready. You can click on the provided link to test it. I've also sent you an email with a link to your personal dashboard where you can customize and enhance your agent.", false);
      }
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
        className={`${(showAgentCreation || showVoiceAgentCreation || showBookingForm) ? 'sm:max-w-6xl' : 'sm:max-w-3xl'} max-h-[90vh] overflow-y-auto`}
        onInteractOutside={e => e.preventDefault()}
      >
        {micPermissionError && (
          <div className="mb-6 w-full flex flex-col items-center">
            <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-xl px-6 py-4 shadow-md w-full max-w-md">
              <span className="flex-shrink-0 mt-0.5">
                <MicOff className="h-6 w-6 text-red-600" />
              </span>
              <div className="flex-1">
                <p className="text-red-700 dark:text-red-300 font-semibold text-base mb-1">
                  We can't reach your microphone.
                </p>
                <p className="text-xs text-red-600 dark:text-red-200">{micPermissionError}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-900/30"
                    onClick={() => {
                      setMicPermissionError(null);
                      if (typeof onRemount === 'function') onRemount();
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-1.5" /> Try again
                  </Button>
                  {/* Never a dead end: the booking path does not need a microphone. */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-700 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-900/30"
                    onClick={() => {
                      setMicPermissionError(null);
                      setShowAgentCreation(false);
                      setShowVoiceAgentCreation(false);
                      setShowBookingForm(true);
                    }}
                  >
                    <CalendarClock className="h-4 w-4 mr-1.5" /> Book a session instead
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {callError && (
          <div className="mb-6 w-full flex flex-col items-center">
            <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-800 rounded-xl px-6 py-4 shadow-md w-full max-w-md">
              <span className="flex-shrink-0 mt-0.5">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </span>
              <div className="flex-1">
                <p className="text-amber-800 dark:text-amber-200 font-semibold text-base mb-1">
                  {callError.title}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-200/80">{callError.detail}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                    onClick={() => {
                      setCallError(null);
                      if (typeof onRemount === 'function') onRemount();
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-1.5" /> Start the call again
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                    onClick={() => {
                      setCallError(null);
                      setShowAgentCreation(false);
                      setShowVoiceAgentCreation(false);
                      setShowBookingForm(true);
                    }}
                  >
                    <CalendarClock className="h-4 w-4 mr-1.5" /> Book a session instead
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {audioWarning && !micPermissionError && (
          <div className="mb-4 w-full flex justify-center">
            <div className="bg-muted/60 border border-border rounded-xl px-5 py-3 w-full max-w-md">
              <div className="flex items-start gap-3">
                <MicOff className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground flex-1">{audioWarning}</p>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setAudioWarning(null)}>
                  Dismiss
                </Button>
              </div>
              {micDevices.length > 1 && (
                <div className="mt-3 pl-8">
                  <label className="text-[11px] uppercase tracking-wide text-muted-foreground/80">
                    Try a different microphone
                  </label>
                  <select
                    className="mt-1 w-full rounded bg-background border border-border p-2 text-xs"
                    defaultValue=""
                    onChange={(e) => e.target.value && switchMicrophone(e.target.value)}
                  >
                    <option value="" disabled>Select an input device…</option>
                    {micDevices.map((device, index) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Microphone ${index + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {networkWarning && (
          <div className="mb-4 w-full flex justify-center">
            <p className="text-xs text-muted-foreground">
              Your connection looks weak — Ayla may break up.
            </p>
          </div>
        )}

        {isStalled && (
          <div className="mb-4 w-full flex justify-center">
            <p className="text-xs text-muted-foreground animate-pulse">Ayla is still thinking…</p>
          </div>
        )}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Agent Creation, Voice Agent Creation, or Booking Form */}
          {(showAgentCreation || showVoiceAgentCreation || showBookingForm) && (
            <div className="flex-1 lg:border-r lg:pr-6 border-b lg:border-b-0 pb-6 lg:pb-0 flex flex-col justify-center items-center">
              <div className={`w-full ${showBookingForm ? 'max-w-full' : 'max-w-xs'} mx-auto bg-background/80 rounded-2xl shadow-lg p-4 lg:p-8 flex flex-col items-center`}>
                {showAgentCreation && <>
                  <h2 className="text-2xl font-bold text-primary mb-2 text-center">Create Your AI Chatbot</h2>
                  <p className="text-sm text-muted-foreground mb-6 text-center">
                    Instantly deploy a custom AI agent for your business.
                  </p>
                  {botId && botId !== "Error" ? (
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
                  {voiceAgentId && voiceAgentId !== "Error" ? (
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
                {showBookingForm && <>
                  <h2 className="text-xl lg:text-2xl font-bold text-primary mb-2 text-center">Schedule a Consultation</h2>
                  <p className="text-sm text-muted-foreground mb-4 lg:mb-6 text-center">
                    Let's discuss your AI needs with one of our human experts.
                  </p>
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
                </>}
              </div>
            </div>
          )}
          {/* Right: Ayla UI (your existing Ayla call UI) */}
          <div className="flex-1 lg:pl-6 pt-6 lg:pt-0">
            <DialogTitle className="text-xl font-semibold text-center mb-2">Talk to Ayla</DialogTitle>
            <div className="w-full flex items-center justify-center mb-2">
              {callStatus === 'connecting' && (
                <span className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                  Connecting to Ayla...
                </span>
              )}
              {callStatus === 'connected' && (
                <span className="flex items-center gap-2 text-sm text-green-400">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
                  Connected
                </span>
              )}
            </div>
            <div className="flex flex-col items-center space-y-4 lg:space-y-6">
              <div className="relative w-24 h-24 lg:w-32 lg:h-32 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg">
                <img
                  src='/assets/images/agents/AylaAvatarCentered.png'
                  alt="Ayla"
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
                  className={`w-full bg-muted/30 rounded-lg overflow-y-auto p-2 lg:p-4 scroll-smooth transition-all duration-300 border ${
                    isTranscriptVisible ? 'h-[200px] lg:h-[300px] opacity-100' : 'h-0 opacity-0'
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
                              {transcript.role === 'assistant' ? 'Ayla' : 'You'}:
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
                              {currentPartial.role === 'assistant' ? 'Ayla' : 'You'}:
                            </span>{' '}
                            {currentPartial.text}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center space-x-4 pt-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleMuteToggle}
                  className={`h-10 w-10 lg:h-12 lg:w-12 rounded-full ${
                    isMuted ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' : ''
                  }`}
                >
                  {isMuted ? <MicOff className="h-4 w-4 lg:h-5 lg:w-5" /> : <Mic className="h-4 w-4 lg:h-5 lg:w-5" />}
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={handleEndCall}
                  className="h-10 w-10 lg:h-12 lg:w-12 rounded-full"
                >
                  <PhoneOff className="h-4 w-4 lg:h-5 lg:w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}