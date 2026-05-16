import { useEffect, useRef, useState } from "react";
import { Send, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MessageBubble } from "./MessageBubble";
import { SuggestedPrompts } from "./SuggestedPrompts";
import { useAgentChat } from "./useAgentChat";
import {
  MicButton,
  useTextToSpeech,
  useLiveKitVoice,
  VoiceModeButton,
  VoiceHero,
} from "./voice";
import type { ToolRegistry } from "./toolRegistry";
import type { AgentBotConfig } from "@shared/agent";

interface AgentChatProps {
  agentKey: string;
  registry: ToolRegistry;
}

// Chat panel: fetches the agent's bot config (name, greeting, avatar) on
// mount, renders the conversation, and owns the input box. Structurally
// agent-agnostic (driven by the agentKey + registry props), though the
// subtitle and input placeholder are currently Ruby-specific copy —
// parameterize when a second agent is added.
export function AgentChat({ agentKey, registry }: AgentChatProps) {
  const chat = useAgentChat(agentKey);
  const { messages, status, send } = chat;
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [bot, setBot] = useState<AgentBotConfig | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tts = useTextToSpeech(agentKey);
  const voice = useLiveKitVoice(agentKey, chat.sessionId, chat.pushExternalEvent);

  // Surface voice errors as a toast. The hook holds the upstream
  // message (e.g., "Voice trial exhausted", "Mic access denied").
  // Without this, the call bar would silently disappear on error.
  useEffect(() => {
    if (voice.state !== "error") return;
    toast({
      title: "Voice call error",
      description: voice.errorMessage ?? "Something went wrong with the voice call.",
      variant: "destructive",
    });
  }, [voice.state, voice.errorMessage, toast]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImage, setPendingImage] = useState<{
    previewUrl: string;
    filename: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    setUploading(true);
    try {
      // Sanitize the filename before upload: the server stores files under
      // their original name, and the downstream `[image: <filename>]` tag is
      // parsed out of message text by the agent — spaces/parens in the name
      // break that handoff. Strip them at the source so the whole chain stays
      // clean.
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_");
      const safeFile =
        safeName === file.name
          ? file
          : new File([file], safeName, { type: file.type });
      const form = new FormData();
      form.append("file", safeFile);
      const res = await fetch(`/api/agent/${agentKey}/upload`, {
        method: "POST",
        credentials: "include",
        body: form,
      });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const data = await res.json();
      const filename = data.filename ?? data.fileName ?? data.name;
      if (!filename) throw new Error("Upload response missing filename");
      setPendingImage((prev) => {
        if (prev) URL.revokeObjectURL(prev.previewUrl);
        return { previewUrl: URL.createObjectURL(file), filename };
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Image upload failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/agent/${agentKey}/bot`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data) setBot(data as AgentBotConfig);
      })
      .catch(() => {
        /* greeting is optional — ignore config failures */
      });
    return () => {
      cancelled = true;
    };
  }, [agentKey]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "streaming") return;
    const hasText = input.trim().length > 0;
    if (!hasText && !pendingImage) return;

    // When an image is attached, append its uploaded filename to the message
    // so the agent's analyze_product_image flow can reference it.
    const text = pendingImage
      ? `${input} [image: ${pendingImage.filename}]`.trim()
      : input;
    const previewUrl = pendingImage?.previewUrl;
    setInput("");
    setPendingImage(null);
    void send(text, previewUrl);
  };

  // Visual states for the header avatar.
  const isAgentSpeaking = voice.state === "agent-speaking";
  const isOnCall = voice.state !== "idle" && voice.state !== "error";

  const handlePromptSelect = (prompt: string) => {
    if (status === "streaming") return;
    void send(prompt);
  };

  // External-prefill API. Any element on the host page can drop a
  // prompt into Ruby by dispatching:
  //   window.dispatchEvent(new CustomEvent('ruby:send', { detail: { prompt, agentKey } }))
  // The `agentKey` filter lets multiple chat panels coexist on the same
  // page without crosstalk (today there's only one, but future-proofing
  // is cheap). Streaming turns are dropped silently — the caller's
  // assumption is "if Ruby's busy, the user clearly cares about the
  // current turn." Dispatched mid-call (voice mode active) still works
  // because send() routes through the same text path.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ prompt?: string; agentKey?: string }>).detail;
      if (!detail || typeof detail.prompt !== "string") return;
      if (detail.agentKey && detail.agentKey !== agentKey) return;
      const prompt = detail.prompt.trim();
      if (!prompt) return;
      if (status === "streaming") return;
      void send(prompt);
    };
    window.addEventListener("ruby:send", handler);
    return () => window.removeEventListener("ruby:send", handler);
  }, [agentKey, status, send]);

  return (
    // Minimal shell: flat neutral surface, single hairline border, no
    // ambient orbs, no aurora, no glassmorphism. The chat panel itself
    // is the focal element — decoration competes with content.
    //
    // Layout: w-full so it fills whatever the parent grants. The host
    // page (Demo.tsx) constrains width; legacy embed usage relies on
    // the legacy h-[600px] fallback below.
    <div className="w-full" data-testid="agent-chat-shell">
      <div className="flex h-full min-h-[600px] flex-col overflow-hidden rounded-2xl border border-border bg-card">
      {/* Header — quiet status line. One small dot (live = emerald,
          on-call = primary, pulses only while Ruby is actually
          speaking). No rings, no shadows. */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        {bot?.avatarUrl && (
          <div className="relative flex-shrink-0">
            <img
              src={bot.avatarUrl}
              alt={bot.name}
              className="h-9 w-9 rounded-full object-cover"
            />
            <span
              aria-hidden="true"
              className={
                "absolute bottom-0 right-0 block h-2 w-2 rounded-full ring-2 ring-card " +
                (isOnCall
                  ? isAgentSpeaking
                    ? "bg-primary motion-safe:animate-pulse"
                    : "bg-primary"
                  : "bg-emerald-500")
              }
            />
          </div>
        )}
        <div className="min-w-0">
          <div className="text-sm font-medium leading-tight">
            {bot?.name ?? "Ruby"}
          </div>
          <div className="text-xs text-muted-foreground">
            {isOnCall ? "On call" : "AI Beauty Concierge"}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* Only show the "Start voice" button in the header when no
              call is active — the in-call controls live in VoiceHero
              below (the in-message overlay) for a stronger focal moment. */}
          {bot?.audiostt &&
            bot?.audiotts &&
            (voice.state === "idle" || voice.state === "error") && (
              <VoiceModeButton
                busy={status === "streaming"}
                onClick={() => void voice.start()}
              />
            )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {/* In-call hero overlay. Renders ABOVE the message list so it
            captures attention while still letting prior messages scroll
            into view above it as new ones arrive. */}
        {isOnCall && (
          <VoiceHero
            state={voice.state}
            durationMs={voice.durationMs}
            isMuted={voice.isMuted}
            avatarUrl={bot?.avatarUrl}
            agentName={bot?.name ?? "Ruby"}
            onMute={voice.toggleMute}
            onHangup={voice.hangup}
          />
        )}
        {/* Empty-state hero — only when no messages AND not in a call.
            Quiet, centered, neutral. No glow, no shimmer, no gradient
            text. Lets the prompt chips below be the call-to-action. */}
        {messages.length === 0 && !isOnCall && (
          <div
            className="flex flex-col items-center pt-6 text-center"
            data-testid="agent-chat-empty-hero"
          >
            {bot?.avatarUrl && (
              <img
                src={bot.avatarUrl}
                alt={bot.name}
                className="mb-4 h-16 w-16 rounded-full object-cover"
              />
            )}
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {bot?.name ? `Hey, I'm ${bot.name}` : "Welcome"}
            </h2>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              {bot?.greeting ??
                "Ask me anything — I'll find products, courses, experts, and deals."}
            </p>
            <div className="w-full">
              <SuggestedPrompts onSelect={handlePromptSelect} />
            </div>
          </div>
        )}
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            registry={registry}
            tts={tts}
            ttsEnabled={!!bot?.audiotts}
          />
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-border p-3">
        {pendingImage && (
          <div className="mb-2 inline-flex items-center gap-2 rounded-lg border border-border bg-background p-1 pr-2">
            <img
              src={pendingImage.previewUrl}
              alt="Attached"
              className="h-10 w-10 rounded object-cover"
            />
            <span className="text-xs text-muted-foreground">
              Image attached
            </span>
            <button
              type="button"
              onClick={() =>
                setPendingImage((prev) => {
                  if (prev) URL.revokeObjectURL(prev.previewUrl);
                  return null;
                })
              }
              className="text-muted-foreground hover:text-foreground"
              aria-label="Remove attached image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelected}
            data-testid="agent-chat-file"
          />
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="rounded-full"
            disabled={uploading || status === "streaming"}
            onClick={() => fileInputRef.current?.click()}
            data-testid="agent-chat-upload"
            aria-label="Attach an image"
          >
            <ImagePlus className="h-4 w-4" />
          </Button>
          <MicButton
            agentKey={agentKey}
            disabled={!bot?.audiostt}
            onTranscript={(text) => setInput(text)}
          />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Ruby anything…"
            className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
            data-testid="agent-chat-input"
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full"
            disabled={
              status === "streaming" || (!input.trim() && !pendingImage)
            }
            data-testid="agent-chat-send"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
      </div>
    </div>
  );
}
