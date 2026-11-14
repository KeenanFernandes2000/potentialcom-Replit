// client/src/components/ayla/DemoAgentPanels.tsx
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CrmHoneypot } from "@/components/CrmHoneypot";
import { apiRequest } from "@/lib/queryClient";
import type { VoiceForm } from "@/lib/aylaVoice/form";
import type { Notice } from "@/lib/aylaVoice/protocol";

// The two demo panels Ayla opens on the voice call (show_chatbot_demo,
// show_voice_agent_demo). The demos work exactly as in AylaCallModal.tsx (the
// Vapi call): the lead goes to POST /api/lead, then potentialTS creates the
// agent from the browser (VITE_API_URL). Where the Vapi modal made Ayla speak
// with vapi.say, this one sends a notice and the server makes Ayla say it.

type Kind = "chatbot" | "voice_agent";
const KINDS = {
  chatbot: {
    title: "Create Your AI Chatbot", blurb: "Instantly deploy a custom AI agent for your business.", button: "Create Chatbot", done: "Chatbot Created!",
    action: "create-chatbot", message: "an AI chatbot", endpoint: "/api/bot/createsimplechatbot",
    idOf: (d: any): unknown => d?.assistantData?._id, link: (id: string) => `https://ai.potential.com/chat/${id}`, inputId: "agentName",
  },
  voice_agent: {
    title: "Create Your AI Voice Agent", blurb: "Instantly deploy a custom AI voice agent for your business.", button: "Create Voice Agent", done: "Voice Agent Created!",
    action: "create-voice-agent", message: "an AI voice agent", endpoint: "/api/vapi/simpleassistant",
    idOf: (d: any): unknown => d?.assistant?.id, link: (id: string) => `https://ai.potential.com/voice/${id}`, inputId: "voiceAgentName",
  },
} as const;

function DemoAgentPanel({ kind, form, onNotice, onClose }: { kind: Kind; form: VoiceForm; onNotice: (n: Notice) => void; onClose: () => void }) {
  const c = KINDS[kind];
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const url = createdId ? c.link(createdId) : "";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFailed(false);
    onNotice(`${kind}_creating`);
    const fd = new FormData();
    fd.append("username", form.firstName);
    fd.append("email", form.email);
    fd.append("name", name);
    fd.append("url", form.website || "https://placeholder-no-website.com");
    const medium = new URLSearchParams(window.location.search).get("utm_medium");
    if (medium) fd.append("medium", medium);
    fd.append("source", window.location.href);
    try {
      await apiRequest("/api/lead", {
        method: "POST",
        body: JSON.stringify({
          email: form.email, firstName: form.firstName, lastName: form.lastName, company: form.organisation, role: form.role, newsletter: false,
          message: `Requested ${c.message} named ${name}.`, fields: { action: c.action, agentName: name },
        }),
      });
      const res = await fetch(`${import.meta.env.VITE_API_URL}${c.endpoint}`, { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      const id = c.idOf(data);
      // A 429 or a 500 still parses as JSON: only a real id is a success (as in the Vapi modal).
      if (!res.ok || !id) {
        setFailed(true);
        onNotice(res.status === 429 ? `${kind}_limited` : `${kind}_failed`);
        return;
      }
      setCreatedId(String(id));
      onNotice((data as { failedToScrape?: boolean }).failedToScrape ? `${kind}_ready_no_scrape` : `${kind}_ready`);
    } catch {
      setFailed(true);
      onNotice(`${kind}_failed`);
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    if (!url) return;
    void navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <h2 className="text-2xl font-bold text-primary mb-2 text-center">{c.title}</h2>
      <p className="text-sm text-muted-foreground mb-6 text-center">{c.blurb}</p>
      {createdId ? (
        <div className="flex flex-col items-center w-full">
          <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-3 mb-3">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <p className="mb-2 text-green-800 dark:text-green-200 text-lg font-semibold">{c.done}</p>
          <div className="flex items-center gap-2 w-full mb-2">
            <input className="w-full rounded bg-muted/40 border-none p-2 text-sm font-mono" value={url} readOnly />
            <button type="button" onClick={copy} className="p-2 rounded hover:bg-primary/10 transition" aria-label="Copy link">
              {copied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5 text-primary" />}
            </button>
          </div>
          <Button onClick={onClose} className="w-full mt-4">Close</Button>
        </div>
      ) : (
        <form onSubmit={submit} className="w-full flex flex-col gap-4">
          <CrmHoneypot campaign="website-ai-conversation" />
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor={c.inputId}>Agent Name</label>
            <input
              id={c.inputId}
              className="w-full rounded-lg bg-muted/40 border-none p-3 focus:outline-none focus:ring-2 focus:ring-primary/40 text-base transition"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your agent's name"
              autoComplete="off"
            />
          </div>
          {failed && <p className="text-xs text-red-600" role="status">That didn't work. Ayla can arrange a follow-up instead.</p>}
          <Button type="submit" disabled={loading} className="w-full text-base font-semibold py-3 mt-2">
            {loading ? "Creating..." : c.button}
          </Button>
          <Button type="button" onClick={onClose} variant="outline" size="sm">Close</Button>
        </form>
      )}
    </div>
  );
}

export const ChatbotDemoPanel = (p: { form: VoiceForm; onNotice: (n: Notice) => void; onClose: () => void }) => <DemoAgentPanel kind="chatbot" {...p} />;
export const VoiceAgentDemoPanel = (p: { form: VoiceForm; onNotice: (n: Notice) => void; onClose: () => void }) => <DemoAgentPanel kind="voice_agent" {...p} />;
