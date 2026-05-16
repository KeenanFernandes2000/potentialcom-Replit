import { useCallback, useEffect, useRef, useState } from "react";
import { Send, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MessageBubble } from "./MessageBubble";
import { SuggestedPrompts } from "./SuggestedPrompts";
import { useAgentChat } from "./useAgentChat";
import { AutoGrowTextarea } from "./AutoGrowTextarea";
import { ClearConversationMenu } from "./ClearConversationMenu";
import { ScrollToLatestPill } from "./ScrollToLatestPill";
import { useSmartScroll } from "./hooks/useSmartScroll";
import {
  MicButton,
  useTextToSpeech,
  useLiveKitVoice,
  VoiceModeButton,
  VoiceHero,
  TalkModePicker,
  AvatarPane,
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
  const { messages, status, send, clear } = chat;
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [bot, setBot] = useState<AgentBotConfig | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isNearBottom, scrollToBottom } = useSmartScroll(scrollRef);
  // focusBumpCounter increments each time we want the textarea to refocus
  // (initial mount, after a successful send, after clear()). Passed as
  // the autoFocusKey prop on AutoGrowTextarea.
  const [focusBumpCounter, setFocusBumpCounter] = useState(0);
  const bumpFocus = useCallback(() => setFocusBumpCounter((n) => n + 1), []);
  const [talkModePickerOpen, setTalkModePickerOpen] = useState(false);
  // Eager avatar-mode flag: flipped true the moment the user picks
  // "Voice + Avatar" so the AvatarPane (with its Connecting fallback)
  // renders immediately. Without this we'd wait ~7-8s for Anam to
  // spin up and publish its video track before any avatar UI shows,
  // which feels like the modal click did nothing. Reset on hangup.
  const [pickedAvatar, setPickedAvatar] = useState(false);
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

  // Auto-scroll on new messages, but ONLY if the user is already near
  // the bottom. Otherwise leave them where they are and let the
  // ScrollToLatestPill surface the option to jump back.
  useEffect(() => {
    if (isNearBottom) scrollToBottom(true);
  }, [messages, isNearBottom, scrollToBottom]);

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
    bumpFocus();
  };

  // Visual states for the header avatar.
  const isAgentSpeaking = voice.state === "agent-speaking";
  const isOnCall = voice.state !== "idle" && voice.state !== "error";
  // Avatar mode is true whenever the user picked avatar OR the Anam
  // video track has actually arrived. The eager flag drives the
  // initial Connecting state; the track-based check keeps things
  // honest if pickedAvatar somehow lingers past hangup.
  const isAvatarMode =
    (pickedAvatar && isOnCall) || !!voice.avatarVideoTrack;

  // Once the call leaves the on-call states (hangup or error), reset
  // the eager flag so the next picker round starts fresh.
  useEffect(() => {
    if (!isOnCall && pickedAvatar) {
      setPickedAvatar(false);
    }
  }, [isOnCall, pickedAvatar]);

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

  // Messages list — extracted so the same JSX renders in both the
  // normal vertical layout and the side-by-side avatar layout.
  const messagesNode = (
    <div className="relative flex-1 overflow-hidden min-h-0">
      <div
        ref={scrollRef}
        className="absolute inset-0 space-y-5 overflow-y-auto px-6 py-5"
      >
        {messages.length === 0 && !isOnCall && (
          <div
            className="flex flex-col items-center py-10 text-center"
            data-testid="agent-chat-empty-hero"
          >
            {bot?.avatarUrl && (
              <img
                src={bot.avatarUrl}
                alt={bot.name}
                className="mb-5 h-20 w-20 rounded-full object-cover"
              />
            )}
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Hi, I'm {bot?.name ?? "Ruby"}
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {bot?.greeting ??
                "Ask me anything — I'll find products, courses, experts, and deals."}
            </p>
            <div className="w-full max-w-md mt-2">
              <SuggestedPrompts onSelect={handlePromptSelect} />
            </div>
          </div>
        )}
        {(() => {
          let lastAgentIdx = -1;
          for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === "agent") {
              lastAgentIdx = i;
              break;
            }
          }
          return messages.map((message, idx) => (
            <MessageBubble
              key={message.id}
              message={message}
              registry={registry}
              tts={tts}
              ttsEnabled={!!bot?.audiotts}
              isLast={idx === lastAgentIdx}
              onRegenerate={chat.regenerate}
            />
          ));
        })()}
      </div>
      {!isNearBottom && messages.length > 0 && (
        <ScrollToLatestPill onClick={() => scrollToBottom(true)} />
      )}
    </div>
  );

  // Input row — same JSX in both layouts.
  const inputNode = (
    <div className="border-t border-border/60 px-6 py-4">
      {pendingImage && (
        <div className="mb-2 inline-flex items-center gap-2 rounded-lg border border-border bg-background p-1 pr-2">
          <img
            src={pendingImage.previewUrl}
            alt="Attached"
            className="h-10 w-10 rounded object-cover"
          />
          <span className="text-xs text-muted-foreground">Image attached</span>
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
          variant="ghost"
          className="h-11 w-11 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
          disabled={uploading || status === "streaming"}
          onClick={() => fileInputRef.current?.click()}
          data-testid="agent-chat-upload"
          aria-label="Attach an image"
        >
          <ImagePlus className="h-5 w-5" />
        </Button>
        <MicButton
          agentKey={agentKey}
          disabled={!bot?.audiostt}
          onTranscript={(text) => setInput(text)}
        />
        <AutoGrowTextarea
          value={input}
          onChange={setInput}
          onSubmit={() => {
            if (status === "streaming") return;
            const hasText = input.trim().length > 0;
            if (!hasText && !pendingImage) return;
            const text = pendingImage
              ? `${input} [image: ${pendingImage.filename}]`.trim()
              : input;
            const previewUrl = pendingImage?.previewUrl;
            setInput("");
            setPendingImage(null);
            void send(text, previewUrl);
            bumpFocus();
          }}
          placeholder="Message Ruby…"
          disabled={status === "streaming"}
          autoFocusKey={focusBumpCounter}
        />
        <Button
          type="submit"
          size="icon"
          className="h-11 w-11 rounded-full bg-primary hover:bg-primary/90 shadow-sm"
          disabled={
            status === "streaming" || (!input.trim() && !pendingImage)
          }
          data-testid="agent-chat-send"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );

  return (
    // App-grade chat surface. Reads as a real product, not a widget:
    // hairline border instead of a heavy shadow, generous interior
    // spacing, larger touch targets. The page already provides the
    // visual frame via the gradient hero — the chat doesn't need to
    // shout to earn its place.
    //
    // Layout: w-full so it fills whatever the parent grants. The host
    // page (Demo.tsx) sets lg:min-h on its column; legacy embed usage
    // relies on the min-h fallback below.
    <div className="w-full" data-testid="agent-chat-shell">
      {/* Fixed-height shell so the messages area inside actually
          scrolls. h-[680px] gives a comfortable default; max-h-[85vh]
          clamps it on smaller viewports (phones, short laptops) so
          the input row never falls below the fold. Inside, the
          messages div uses flex-1 + overflow-y-auto to scroll.
          Mobile (< sm): use dvh (dynamic viewport height) so the
          iOS virtual keyboard doesn't push the input offscreen, and
          leave ~180px of space for browser chrome + keyboard. */}
      <div className="flex h-[680px] max-h-[calc(100dvh-180px)] sm:max-h-[85vh] flex-col overflow-hidden rounded-2xl border border-border/60 bg-card">
      {/* Header — generous padding, h-12 avatar so it carries
          presence, name in lg-weight semibold. Status dot is bigger
          and uses brand primary on-call. */}
      <div className="flex items-center gap-3.5 border-b border-border/60 px-6 py-4">
        {bot?.avatarUrl && (
          <div className="relative flex-shrink-0">
            <img
              src={bot.avatarUrl}
              alt={bot.name}
              className="h-12 w-12 rounded-full object-cover"
            />
            <span
              aria-hidden="true"
              className={
                "absolute -bottom-0.5 -right-0.5 block h-3 w-3 rounded-full ring-2 ring-card " +
                (isOnCall
                  ? isAgentSpeaking
                    ? "bg-primary motion-safe:animate-pulse"
                    : "bg-primary"
                  : "bg-emerald-500")
              }
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold leading-tight text-foreground truncate">
            {bot?.name ?? "Ruby"}
          </div>
          {/* Subtitle: hidden on the narrowest viewports so the header
              row doesn't overflow on 320–375px screens. The status is
              still encoded in the avatar dot color. */}
          <div className="hidden sm:block text-xs text-muted-foreground mt-0.5">
            {isOnCall
              ? "On call · live"
              : status === "streaming"
                ? "Typing…"
                : "Online · usually replies instantly"}
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
                onClick={() => setTalkModePickerOpen(true)}
              />
            )}
          <ClearConversationMenu
            onClear={() => {
              clear();
              // setTimeout(0) so bumpFocus() runs AFTER Radix's
              // AlertDialog FocusScope restores focus to the menu
              // trigger on dialog close. Without this we race that
              // restore and may lose focus to the trigger.
              setTimeout(bumpFocus, 0);
            }}
          />
        </div>
      </div>

      {/* Talk-mode picker modal: opens from the header button.
          onPick mints the LiveKit room with the chosen withAvatar flag. */}
      <TalkModePicker
        open={talkModePickerOpen}
        onOpenChange={setTalkModePickerOpen}
        onPick={(withAvatar) => {
          setTalkModePickerOpen(false);
          setPickedAvatar(withAvatar);
          void voice.start({ withAvatar });
        }}
      />

      {/* Layout switcher:
          - Avatar mode: side-by-side (avatar pane | chat pane) on md+;
            stacks vertically on mobile (avatar on top, chat below).
          - Voice-only / no call: classic vertical layout (hero dock if
            on call, then messages, then input). */}
      {isOnCall && isAvatarMode ? (
        <div className="flex flex-1 flex-col overflow-hidden md:flex-row min-h-0">
          {/* LEFT pane — premium AvatarPane: brand-purple ambient
              orbs, rounded video tile with speaking ring, live badge,
              state label + duration timer, mute + end-call controls. */}
          <AvatarPane
            track={voice.avatarVideoTrack}
            avatarUrl={bot?.avatarUrl}
            agentName={bot?.name ?? "Ruby"}
            state={voice.state}
            durationMs={voice.durationMs}
            isMuted={voice.isMuted}
            onMute={voice.toggleMute}
            onHangup={voice.hangup}
          />
          {/* RIGHT pane — messages list (scrollable) + input row. */}
          <div className="flex flex-1 flex-col overflow-hidden min-h-0">
            {messagesNode}
            {inputNode}
          </div>
        </div>
      ) : (
        <>
          {isOnCall && !isAvatarMode && (
            <VoiceHero
              state={voice.state}
              durationMs={voice.durationMs}
              isMuted={voice.isMuted}
              agentName={bot?.name ?? "Ruby"}
              onMute={voice.toggleMute}
              onHangup={voice.hangup}
            />
          )}
          {messagesNode}
          {inputNode}
        </>
      )}
      </div>
    </div>
  );
}
