import { useEffect, useRef, useState } from "react";
import { Send, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MessageBubble } from "./MessageBubble";
import { useAgentChat } from "./useAgentChat";
import {
  MicButton,
  AutoSpeakToggle,
  useTextToSpeech,
  useAutoSpeak,
  useLiveKitVoice,
  VoiceModeButton,
  VoiceCallBar,
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
  const voice = useLiveKitVoice(agentKey, chat.pushExternalEvent);
  const { enabled: autoSpeak } = useAutoSpeak();
  const spokenMessageIds = useRef<Set<string>>(new Set());

  // When auto-speak flips ON, mark all currently-completed agent messages
  // as "already spoken" so we don't replay history. Only newly-completing
  // messages from this point forward will auto-play.
  //
  // CRITICAL: this effect must be declared BEFORE the play effect below.
  // Both effects react to the same autoSpeak transition, and React runs
  // them in declaration order. If the play effect ran first, it would
  // see the latest backlog message and speak it before the seed effect
  // had a chance to mark it as already-spoken.
  useEffect(() => {
    if (!autoSpeak) return;
    for (const m of messages) {
      if (m.role === "agent" && m.status === "complete") {
        spokenMessageIds.current.add(m.id);
      }
    }
    // We intentionally don't include `messages` in deps — we only want to
    // seed on the autoSpeak transition, not every time messages change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSpeak]);

  // When a voice call ends, mark every current agent message as
  // "already spoken" so the auto-speak play effect doesn't replay the
  // voice-mode responses through the /speak TTS proxy on the next
  // render. The in-call audio already played them via the WebSocket
  // MediaSource pipeline; auto-speak would otherwise double-speak them.
  const prevVoiceStateRef = useRef(voice.state);
  useEffect(() => {
    const prev = prevVoiceStateRef.current;
    const curr = voice.state;
    const wasActive = prev !== "idle" && prev !== "error";
    const isInactive = curr === "idle" || curr === "error";
    if (wasActive && isInactive) {
      for (const m of messages) {
        if (m.role === "agent" && m.status === "complete") {
          spokenMessageIds.current.add(m.id);
        }
      }
    }
    prevVoiceStateRef.current = curr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voice.state]);

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

  // Auto-speak: when a new agent message completes and auto-speak is on,
  // play it. We dedupe via a per-message-id set so toggling auto-speak
  // mid-conversation doesn't re-speak everything.
  useEffect(() => {
    if (!autoSpeak || !bot?.audiotts) return;
    if (voice.state !== "idle" && voice.state !== "error") return; // gate off during a voice call
    const last = messages[messages.length - 1];
    if (!last) return;
    if (last.role !== "agent") return;
    if (last.status !== "complete") return;
    if (!last.text || !last.text.trim()) return;
    if (spokenMessageIds.current.has(last.id)) return;
    spokenMessageIds.current.add(last.id);
    void tts.play(last.text);
  }, [autoSpeak, bot, messages, tts, voice.state]);

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

  return (
    <div className="mx-auto flex h-[600px] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        {bot?.avatarUrl && (
          <img
            src={bot.avatarUrl}
            alt={bot.name}
            className="h-9 w-9 rounded-full object-cover"
          />
        )}
        <div>
          <div className="text-sm font-semibold">{bot?.name ?? "Ruby"}</div>
          <div className="text-xs text-muted-foreground">AI Beauty Concierge</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {bot?.audiostt && bot?.audiotts &&
            (voice.state === "idle" || voice.state === "error" ? (
              <VoiceModeButton
                busy={status === "streaming"}
                onClick={() => void voice.start()}
              />
            ) : (
              <VoiceCallBar
                state={voice.state}
                durationMs={voice.durationMs}
                isMuted={voice.isMuted}
                onMute={voice.toggleMute}
                onHangup={voice.hangup}
              />
            ))}
          {bot?.audiotts && <AutoSpeakToggle />}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && bot?.greeting && (
          <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-muted px-4 py-2 text-sm">
            {bot.greeting}
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
      <div className="border-t border-border bg-card p-3">
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
  );
}
