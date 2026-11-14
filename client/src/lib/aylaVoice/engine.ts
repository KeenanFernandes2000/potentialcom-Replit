// client/src/lib/aylaVoice/engine.ts
// Which engine runs the /ayla call (spec, Rollout): the build flag
// VITE_AYLA_VOICE_ENGINE (vapi unless "brain"), overridden by ?ayla_voice=
// for testers, and "brain" only while agents.potential.com says the voice
// button is available (AYLA_VOICE_MODE=off on the server is an instant
// rollback to Vapi, no publish needed).

export type Engine = "vapi" | "brain";

export const engineFlag = (raw: unknown): Engine => (raw === "brain" ? "brain" : "vapi");

export function engineOverride(search: string): Engine | null {
  const v = new URLSearchParams(search).get("ayla_voice");
  return v === "brain" || v === "vapi" ? v : null;
}

export async function chooseEngine(wanted: Engine, status: () => Promise<boolean>): Promise<Engine> {
  if (wanted !== "brain") return "vapi";
  try {
    return (await status()) ? "brain" : "vapi";
  } catch {
    return "vapi";
  }
}
