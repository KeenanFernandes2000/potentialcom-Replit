/**
 * Every voice call on potential.com starts with a server-signed Vapi token:
 * POST /api/vapi/token { assistantId } returns a one-hour JWT restricted to
 * that one assistant and to this site's origin, with transient assistants
 * disabled.
 *
 * Until Nov 2026 the site shipped the raw Vapi public key (VITE_VAPI_KEY) in
 * its bundle, and anyone could reuse it from any site, for any assistant,
 * billed to us. That key is being retired, so there is deliberately no
 * fallback to it: if the token endpoint fails, the call fails with a clear
 * message instead of silently running unscoped.
 */
export class VoiceTokenError extends Error {
  constructor(public readonly status: number) {
    super(`Vapi token endpoint returned ${status || "no token"}`);
    this.name = "VoiceTokenError";
  }
}

export async function getVapiCallToken(assistantId: string): Promise<string> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vapi/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assistantId }),
  });
  if (!res.ok) throw new VoiceTokenError(res.status);
  const { token } = await res.json();
  if (!token) throw new VoiceTokenError(0);
  return token;
}

export const VOICE_UNAVAILABLE_MESSAGE =
  "Voice calls are briefly unavailable. Please try again in a few minutes.";
