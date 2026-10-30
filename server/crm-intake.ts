import { createHash } from "node:crypto";
import { z } from "zod";

export const CRM_INTAKE_URL = "https://crm.potentiallead.com/api/intake";

export class CrmIntakeError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

export const crmMetadataSchema = z.object({
  submissionId: z.string().min(8).max(128),
  hp: z.string().max(2048).default(""),
  pageUrl: z.string().url().max(4096).optional(),
  referrer: z.string().max(4096).optional(),
  utm: z.object({
    source: z.string().max(500).optional(), medium: z.string().max(500).optional(),
    campaign: z.string().max(500).optional(), term: z.string().max(500).optional(),
    content: z.string().max(500).optional(),
  }).optional(),
  gclid: z.string().max(1000).optional(),
  fbclid: z.string().max(1000).optional(),
  newsletter: z.boolean().default(false),
  consentText: z.string().max(1000).optional(),
}).refine(value => !value.newsletter || !!value.consentText?.trim(), {
  message: "Please confirm newsletter consent.",
});

export type CrmLead = {
  email: string; campaign: string; submissionId: string; hp: string;
  [key: string]: unknown;
};

// Stable hash for detecting an id reused for a different payload. No credentials
// or authentication fields are ever included in the CRM payload or ledger.
export function leadFingerprint(lead: CrmLead) {
  return createHash("sha256").update(JSON.stringify(lead)).digest("hex");
}

export async function deliverCrmLead(lead: CrmLead) {
  const key = process.env.POTENTIAL_CRM_INTAKE_KEY;
  if (!key) {
    throw new CrmIntakeError(503, "UNAVAILABLE", "We couldn't save your submission right now. Please try again shortly.");
  }
  let response: Response;
  try {
    response = await fetch(CRM_INTAKE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify(lead),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new CrmIntakeError(502, "UPSTREAM", "We couldn't reach our CRM. Please try again; your submission won't be duplicated.");
  }
  const body = await response.json().catch(() => null);
  if (!response.ok || body?.ok !== true) {
    const status = response.status === 429 ? 429 : response.status === 409 ? 409 :
      response.status === 400 ? 400 : 502;
    const message = status === 400
      ? "Please check your email and form details, then try again."
      : status === 429 ? "Too many submissions. Please wait a moment and try again."
      : status === 409 ? "This submission changed. Please edit a field and submit again."
      : "We couldn't save your submission right now. Please try again shortly.";
    throw new CrmIntakeError(status, status === 429 ? "RATE_LIMITED" : "CRM_DELIVERY", message);
  }
  return { ok: true, status: body.status as string, id: body.id as string };
}
