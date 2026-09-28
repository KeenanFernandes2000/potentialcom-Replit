import Daily from "@daily-co/daily-js";

/**
 * Pulls Daily's call-machine bundle into cache before anyone starts a call.
 *
 * vapi.start() does not fetch it until the call already exists, and cold it
 * takes 9+ seconds from c.daily.co. Vapi gives up waiting for customer audio
 * first and ends the room, which surfaces as "Meeting ended due to ejection"
 * and a 0.000s call logged as
 * `call.in-progress.error-assistant-did-not-receive-customer-audio` — 18 of
 * Ayla's last 43 calls, every one of them zero seconds long.
 *
 * Warming it while the visitor fills in the form turns that 9s into ~0.2s.
 * The version comes from daily-js itself so this cannot rot against a bump.
 */
export function warmVoiceCall() {
  if (typeof document === "undefined") return;
  if (document.getElementById("daily-call-machine-prefetch")) return;

  const version = typeof Daily.version === "function" ? Daily.version() : null;
  if (!version) return;

  const preconnect = document.createElement("link");
  preconnect.rel = "preconnect";
  preconnect.href = "https://c.daily.co";
  preconnect.crossOrigin = "anonymous";
  document.head.appendChild(preconnect);

  // prefetch, not preload: the visitor is still typing, and preload would warn
  // about an unused resource long before the call starts.
  const prefetch = document.createElement("link");
  prefetch.id = "daily-call-machine-prefetch";
  prefetch.rel = "prefetch";
  prefetch.as = "script";
  prefetch.crossOrigin = "anonymous";
  prefetch.href = `https://c.daily.co/call-machine/versioned/${version}/static/call-machine-object-bundle.js`;
  document.head.appendChild(prefetch);
}
