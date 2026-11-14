// client/src/components/ayla/CodeEntryPanel.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { CodeResult, CodeStatus } from "@/lib/aylaVoice/protocol";

// The 6-digit code box (opened when Ayla sends a code). The code goes to our
// server, which checks it through Ayla's own tool; Ayla then continues. The
// status comes from the server's state.

const MESSAGES: Record<CodeStatus, string> = {
  idle: "If that email address is in our records, a 6-digit code is on its way. Type it here, or read it to Ayla.",
  checking: "Checking your code…",
  verified: "Thanks, that worked. Ayla can now pick up where you left off.",
  failed: "That code didn't work. Only the newest code works.",
  capped: "Too many tries for now. Ayla is happy to keep helping meanwhile.",
};

export function CodeEntryPanel({ status, onSubmit, onClose }: { status: CodeStatus; onSubmit: (code: string) => Promise<CodeResult>; onClose: () => void }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const digits = code.replace(/\D/g, "").slice(0, 6);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (digits.length !== 6 || busy) return;
    setBusy(true);
    setNote(null);
    const r = await onSubmit(digits);
    setBusy(false);
    if (r === "busy") setNote("One moment, then try again.");
    if (r === "failed") setCode("");
  };
  return (
    <div className="w-full flex flex-col items-center">
      <h2 className="text-2xl font-bold text-primary mb-2 text-center">Your 6-digit code</h2>
      <p className="text-sm text-muted-foreground mb-6 text-center" role="status">{note ?? MESSAGES[status]}</p>
      {status !== "verified" && status !== "capped" && (
        <form onSubmit={submit} className="w-full flex flex-col gap-4">
          <label className="block text-sm font-medium" htmlFor="aylaCode">Code</label>
          <input
            id="aylaCode"
            className="w-full rounded-lg bg-muted/40 border-none p-3 text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
            value={digits}
            onChange={(e) => setCode(e.target.value)}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="••••••"
          />
          <Button type="submit" disabled={digits.length !== 6 || busy || status === "checking"} className="w-full text-base font-semibold py-3">
            {busy || status === "checking" ? "Checking…" : "Check code"}
          </Button>
        </form>
      )}
      <Button onClick={onClose} className="w-full mt-4" variant="outline" size="sm">Close</Button>
    </div>
  );
}
