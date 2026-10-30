import { CRM_CAMPAIGNS, NEWSLETTER_CONSENT } from "@shared/crm";
import { getAllUTMParams } from "./utm-utils";

const attempts = new Map<string, { signature: string; body: string }>();
const pending = new Map<string, Promise<Response>>();

export function captureCrmAttribution() {
  getAllUTMParams();
  try {
    if (!sessionStorage.getItem("crm_referrer") && document.referrer) {
      sessionStorage.setItem("crm_referrer", document.referrer);
    }
  } catch { /* Storage may be disabled; current-page attribution still works. */ }
}

export function crmAttribution() {
  captureCrmAttribution();
  const values = getAllUTMParams();
  let referrer = document.referrer;
  try { referrer = sessionStorage.getItem("crm_referrer") || referrer; } catch {}
  return {
    pageUrl: location.href,
    referrer,
    utm: {
      source: values.utm_source, medium: values.utm_medium,
      campaign: values.utm_campaign, term: values.utm_term, content: values.utm_content,
    },
    gclid: values.gclid,
    fbclid: values.fbclid,
  };
}

// Retain the identical body AND id on failures. Editing fields starts a new
// attempt. Successful submissions clear the snapshot, even for unchanged data.
export async function fetchWithCrm(url: string, options: RequestInit = {}): Promise<Response> {
  const campaign = CRM_CAMPAIGNS[url];
  if (!campaign || !options.body || !["POST", "PUT"].includes(options.method || "")) {
    return fetch(url, options);
  }
  const data = JSON.parse(String(options.body));
  const input = document.querySelector<HTMLInputElement>(`input[data-crm-form="${campaign}"]`);
  const hp = data.hp ?? input?.value ?? "";
  const signature = JSON.stringify({ ...data, hp });
  const key = `${location.pathname}:${campaign}`;
  let attempt = attempts.get(key);
  if (!attempt || attempt.signature !== signature) {
    const newsletter = data.newsletter === true || data.isSubscribedToNewsletter === true;
    attempt = {
      signature,
      body: JSON.stringify({
        ...data, ...crmAttribution(), campaign, hp,
        newsletter,
        consentText: newsletter ? data.consentText || NEWSLETTER_CONSENT : undefined,
        submissionId: crypto.randomUUID(),
      }),
    };
    attempts.set(key, attempt);
  }
  const requestKey = `${key}:${attempt.body}`;
  let work = pending.get(requestKey);
  if (!work) {
    work = fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
      body: attempt.body,
    });
    pending.set(requestKey, work);
  }
  try {
    const response = await work;
    if (response.ok && attempts.get(key) === attempt) attempts.delete(key);
    return response.clone();
  } finally {
    pending.delete(requestKey);
  }
}
