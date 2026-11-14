// client/src/lib/aylaVoice/engine.ts
// Which engine runs the /ayla call. The single switch is Ayla's server: the
// brain whenever agents.potential.com's GET /api/ayla/voice/status answers
// {available:true}, Vapi otherwise (no, error, non-200, or no answer within
// STATUS_TIMEOUT_MS). So AYLA_VOICE_MODE=off on the server is the instant
// rollback to Vapi for everyone, with no republish. Testers: ?ayla_voice=vapi
// forces Vapi; ?ayla_voice=brain asks for the brain (still subject to the
// server). There is no build-time flag: Replit does not pass Secrets into the
// Vite build, so one compiled to a constant and could not switch anything.

export type Engine = "vapi" | "brain";

/** How long the page waits for the server's answer before it picks Vapi. */
export const STATUS_TIMEOUT_MS = 2500;

export function engineOverride(search: string): Engine | null {
  const v = new URLSearchParams(search).get("ayla_voice");
  return v === "brain" || v === "vapi" ? v : null;
}

/** The brain unless a tester forces Vapi. */
export const wantedEngine = (search: string): Engine => engineOverride(search) ?? "brain";

export async function chooseEngine(wanted: Engine, status: () => Promise<boolean>, timeoutMs = STATUS_TIMEOUT_MS): Promise<Engine> {
  if (wanted !== "brain") return "vapi";
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const late = new Promise<boolean>((resolve) => {
      timer = setTimeout(() => resolve(false), timeoutMs);
    });
    return (await Promise.race([status(), late])) === true ? "brain" : "vapi";
  } catch {
    return "vapi";
  } finally {
    clearTimeout(timer);
  }
}

/**
 * The page's engine, decided once and only when first asked (the page asks
 * when the visitor starts filling in the form, and waits for it on submit),
 * so a page view alone sends nothing to Ayla's server.
 */
export function engineChoice(search: string, status: () => Promise<boolean>, timeoutMs = STATUS_TIMEOUT_MS): () => Promise<Engine> {
  let p: Promise<Engine> | null = null;
  return () => (p ??= chooseEngine(wantedEngine(search), status, timeoutMs));
}
