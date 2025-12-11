import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, PhoneOff, ChevronDown, ChevronUp } from "lucide-react";
import veraAvatarCentered from "@assets/Vera Avatar Centered.png";
import Vapi from '@vapi-ai/web';

interface QuickCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  assistantId: string;
}

interface Transcript {
  role: string;
  text: string;
  isPartial?: boolean;
}

export function QuickCallModal({ isOpen, onClose, assistantId }: QuickCallModalProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTranscriptVisible, setIsTranscriptVisible] = useState(false);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [currentPartial, setCurrentPartial] = useState<Transcript | null>(null);
  const vapiRef = useRef<Vapi | null>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected'>('idle');
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);

  // Auto-scroll to bottom when new transcripts arrive
  useEffect(() => {
    if (transcriptContainerRef.current && isTranscriptVisible) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [transcripts, currentPartial, isTranscriptVisible]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (vapiRef.current) {
        try {
          vapiRef.current.stop();
        } catch (error) {
          console.error('Error stopping call on unmount:', error);
        }
        vapiRef.current = null;
      }
    };
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicPermissionError(null);
      return true;
    } catch (error) {
      console.error('Microphone permission error:', error);
      setMicPermissionError('Microphone access is required for voice calls. Please enable it in your browser settings.');
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

          vapiInstance.start(assistantId);

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
            if (message.type === 'transcript') {
              const transcript = message.transcriptType === 'partial' 
                ? message.transcript 
                : message.transcript;
              
              const role = message.role || 'assistant';
              
              if (message.transcriptType === 'partial') {
                setCurrentPartial({
                  role,
                  text: transcript,
                  isPartial: true
                });
              } else {
                setTranscripts(prev => [...prev, {
                  role,
                  text: transcript,
                  isPartial: false
                }]);
                setCurrentPartial(null);
              }
            }
          });

          vapiInstance.on('error', (error) => {
            console.error('Vapi error:', error);
            setCallStatus('idle');
          });

        } catch (error) {
          console.error('Error initializing Vapi:', error);
          setCallStatus('idle');
        }
      });
    }
  }, [isOpen, assistantId, onClose]);

  const toggleMute = () => {
    if (vapiRef.current) {
      const newMutedState = !isMuted;
      vapiRef.current.setMuted(newMutedState);
      setIsMuted(newMutedState);
    }
  };

  const endCall = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
      vapiRef.current = null;
    }
    setIsCallActive(false);
    setCallStatus('idle');
    onClose();
  };

  const toggleTranscript = () => {
    setIsTranscriptVisible(!isTranscriptVisible);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-background">
        <DialogTitle className="sr-only">Voice Call with Vera</DialogTitle>
        
        <div className="relative">
          {/* Avatar Section */}
          <div className="relative bg-gradient-to-b from-primary/10 via-primary/5 to-background p-8 pb-6">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                {/* Animated rings */}
                {isSpeaking && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
                    <div className="absolute inset-0 rounded-full bg-primary/30 animate-pulse"></div>
                  </>
                )}
                
                {/* Avatar */}
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary/30 shadow-xl bg-white dark:bg-gray-800">
                  <img 
                    src={veraAvatarCentered} 
                    alt="Vera" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-1 text-foreground">Vera</h3>
                <div className="flex items-center justify-center gap-2">
                  {callStatus === 'connecting' && (
                    <>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-muted-foreground">Connecting...</span>
                    </>
                  )}
                  {callStatus === 'connected' && (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-muted-foreground">Connected</span>
                    </>
                  )}
                  {callStatus === 'idle' && (
                    <>
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Call Ended</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Microphone Permission Error */}
          {micPermissionError && (
            <div className="px-6 py-4 bg-destructive/10 border-l-4 border-destructive">
              <p className="text-sm text-destructive font-medium">{micPermissionError}</p>
            </div>
          )}

          {/* Controls */}
          <div className="p-6 space-y-4">
            <div className="flex justify-center gap-4">
              {/* Mute Button */}
              <Button
                variant="outline"
                size="lg"
                onClick={toggleMute}
                disabled={!isCallActive}
                className="rounded-full w-16 h-16 p-0"
              >
                {isMuted ? (
                  <MicOff className="h-6 w-6" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </Button>

              {/* End Call Button */}
              <Button
                variant="destructive"
                size="lg"
                onClick={endCall}
                disabled={!isCallActive && callStatus !== 'connecting'}
                className="rounded-full w-16 h-16 p-0"
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            </div>

            {/* Transcript Toggle */}
            <Button
              variant="ghost"
              onClick={toggleTranscript}
              className="w-full"
              disabled={!isCallActive}
            >
              {isTranscriptVisible ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Hide Transcript
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Show Transcript
                </>
              )}
            </Button>

            {/* Transcript Display */}
            {isTranscriptVisible && (
              <div 
                ref={transcriptContainerRef}
                className="max-h-60 overflow-y-auto border border-border rounded-lg p-4 space-y-2 bg-gray-50 dark:bg-gray-900/50"
              >
                {transcripts.length === 0 && !currentPartial && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Transcript will appear here...
                  </p>
                )}
                
                {transcripts.map((transcript, index) => (
                  <div 
                    key={index}
                    className={`text-sm p-3 rounded-lg shadow-sm ${
                      transcript.role === 'user' 
                        ? 'bg-white dark:bg-gray-800 ml-4 border border-gray-200 dark:border-gray-700' 
                        : 'bg-white dark:bg-gray-800 mr-4 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <span className="font-semibold text-xs uppercase text-gray-600 dark:text-gray-400">
                      {transcript.role === 'user' ? 'You' : 'Vera'}:
                    </span>
                    <p className="mt-1 text-gray-900 dark:text-gray-100">{transcript.text}</p>
                  </div>
                ))}
                
                {currentPartial && (
                  <div 
                    className={`text-sm p-3 rounded-lg shadow-sm opacity-60 ${
                      currentPartial.role === 'user' 
                        ? 'bg-white dark:bg-gray-800 ml-4 border border-gray-200 dark:border-gray-700' 
                        : 'bg-white dark:bg-gray-800 mr-4 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <span className="font-semibold text-xs uppercase text-gray-600 dark:text-gray-400">
                      {currentPartial.role === 'user' ? 'You' : 'Vera'}:
                    </span>
                    <p className="mt-1 text-gray-900 dark:text-gray-100">{currentPartial.text}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

