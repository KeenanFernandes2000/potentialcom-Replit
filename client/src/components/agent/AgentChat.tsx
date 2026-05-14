import { useEffect, useRef, useState } from "react";
import { Send, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MessageBubble } from "./MessageBubble";
import { useAgentChat } from "./useAgentChat";
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
  const { messages, status, send } = useAgentChat(agentKey);
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [bot, setBot] = useState<AgentBotConfig | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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
      const form = new FormData();
      form.append("file", file);
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
