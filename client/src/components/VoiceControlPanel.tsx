import { Button } from "@/components/ui/button";
import { Mic, PhoneOff, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface VoiceControlPanelProps {
  onDisconnect?: () => void;
}

export function VoiceControlPanel({ onDisconnect }: VoiceControlPanelProps) {
  const [micEnabled, setMicEnabled] = useState(true);
  const [micTrack, setMicTrack] = useState<MediaStreamTrack | null>(null);
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(5).fill(0));
  const [showMicSelector, setShowMicSelector] = useState(false);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize audio and get devices
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        // Get user media - WebRTC approach like LiveKit
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const track = stream.getAudioTracks()[0];
        setMicTrack(track);
        setSelectedDevice(track.label || "Default Microphone");
        console.log("Audio initialized");

        // Setup audio visualization using Web Audio API
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8; // Like LiveKit's smooth audio visualization
        const source = audioContext.createMediaStreamSource(stream);

        source.connect(analyser);
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        // Start visualization loop - LiveKit-style frequency band analysis
        const visualize = () => {
          if (!analyserRef.current) return;
          
          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyserRef.current.getByteFrequencyData(dataArray);
          
          // LiveKit-style: Divide frequency spectrum into bands for visualization
          const numBands = 5;
          const bandSize = Math.floor(bufferLength / numBands);
          const levels: number[] = [];
          
          for (let i = 0; i < numBands; i++) {
            const start = i * bandSize;
            const end = Math.min(start + bandSize, bufferLength);
            let sum = 0;
            
            for (let j = start; j < end; j++) {
              sum += dataArray[j];
            }
            
            // Normalize to 0-100%
            const average = sum / (end - start);
            const normalizedLevel = Math.min((average / 255) * 100, 100);
            levels.push(normalizedLevel);
          }
          
          setAudioLevels(levels);
          
          if (micEnabled) {
            animationFrameRef.current = requestAnimationFrame(visualize);
          }
        };
        visualize();

        // Get audio devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        setAudioDevices(audioInputs);
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    };

    initializeAudio();

    // Cleanup on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setMicTrack((prev) => {
        if (prev) {
          prev.stop();
        }
        return null;
      });
    };
  }, []);

  // Reset visualization when mic is muted
  useEffect(() => {
    if (!micEnabled) {
      setAudioLevels(new Array(5).fill(0));
    }
  }, [micEnabled]);

  // Handle microphone toggle
  const handleMicToggle = () => {
    if (micTrack) {
      micTrack.enabled = !micEnabled;
      setMicEnabled(!micEnabled);
      console.log(`Microphone ${!micEnabled ? 'enabled' : 'disabled'}`);
    }
  };

  // Handle device change
  const handleDeviceChange = async (deviceId: string) => {
    try {
      // Stop old stream and tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const constraints = { 
        audio: deviceId !== "default" ? { deviceId: { exact: deviceId } } : true 
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      const newTrack = stream.getAudioTracks()[0];
      setMicTrack(newTrack);
      setSelectedDevice(newTrack.label || "Default Microphone");
      
      // Reconnect to analyser
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      // Restart visualization loop
      const visualize = () => {
        if (!analyserRef.current) return;
        
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        const numBands = 5;
        const bandSize = Math.floor(bufferLength / numBands);
        const levels: number[] = [];
        
        for (let i = 0; i < numBands; i++) {
          const start = i * bandSize;
          const end = Math.min(start + bandSize, bufferLength);
          let sum = 0;
          
          for (let j = start; j < end; j++) {
            sum += dataArray[j];
          }
          
          const average = sum / (end - start);
          const normalizedLevel = Math.min((average / 255) * 100, 100);
          levels.push(normalizedLevel);
        }
        
        setAudioLevels(levels);
        
        if (micEnabled) {
          animationFrameRef.current = requestAnimationFrame(visualize);
        }
      };
      
      if (micEnabled) {
        visualize();
      }
    } catch (error) {
      console.error("Error changing device:", error);
    }
  };

  // Handle disconnect
  const handleDisconnect = () => {
    if (micTrack) micTrack.stop();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Check if AudioContext exists and is not already closed
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    onDisconnect?.();
  };

  return (
    <div className="bg-background border-border dark:border-muted flex flex-col rounded-[31px] border p-3 drop-shadow-md/3">
      {/* Microphone Device Selection Dropdown */}
      {showMicSelector && (
        <div className="mb-3 rounded-lg bg-popover border border-border shadow-lg p-2 w-full max-w-[300px]">
          {audioDevices.map((device, index) => (
            <button
              key={device.deviceId}
              onClick={() => {
                handleDeviceChange(device.deviceId);
                setShowMicSelector(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors ${
                selectedDevice === device.label ? "bg-primary/10" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">{device.label || `Microphone ${index + 1}`}</span>
                {selectedDevice === device.label && (
                  <span className="text-primary">✓</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-1">
        <div className="flex grow gap-1 items-center">
          {/* Microphone Control with Dropdown and Waveform */}
          <Button
            variant="secondary"
            className="rounded-full h-12 px-3"
            disabled={!micTrack}
            onClick={handleMicToggle}
          >
            <div className="flex items-center gap-2">
              <Mic className={`h-5 w-5 ${!micEnabled ? 'text-destructive' : ''}`} />
              <div className="flex items-center gap-0.5">
                {[...Array(3)].map((_, i) => {
                  const level = audioLevels[Math.min(i + 1, audioLevels.length - 1)] || 0;
                  const barHeight = Math.min(4 + (level / 100) * 4, 8);
                  return (
                    <div
                      key={i}
                      className="w-0.5 bg-current rounded-full transition-all duration-150"
                      style={{
                        height: `${barHeight}px`,
                        opacity: micEnabled && level > 5 ? 1 : 0.3,
                      }}
                    />
                  );
                })}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMicSelector(!showMicSelector);
                }}
              >
                {showMicSelector ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Button>
            </div>
          </Button>

          {/* Waveform Visualizer - LiveKit style frequency band visualization */}
          <div className="flex items-center justify-center gap-1.5 h-12 px-4">
            {[...Array(5)].map((_, i) => {
              const level = audioLevels[i] || 0;
              const minHeight = 4;
              const maxHeight = 24;
              const barHeight = minHeight + (level / 100) * (maxHeight - minHeight);
              return (
                <div
                  key={i}
                  className="w-1.5 bg-primary rounded-full transition-all duration-75"
                  style={{
                    height: `${barHeight}px`,
                    opacity: micEnabled && level > 0 ? 0.6 + (level / 100) * 0.4 : 0.3,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* End Call Button */}
        <Button
          variant="destructive"
          onClick={handleDisconnect}
          className="font-mono rounded-full px-4"
        >
          <PhoneOff className="h-5 w-5 mr-2" />
          <span className="hidden md:inline">END CALL</span>
          <span className="inline md:hidden">END</span>
        </Button>
      </div>
    </div>
  );
}

