// client/src/lib/aylaVoice/submit.ts
import type { IntakeResult } from "./api";
import type { Engine } from "./engine";
import { voiceFormFrom, websiteValue, type AylaFormValues, type VoiceForm } from "./form";

// What the /ayla form does on submit (spec "Form intake", Mamoon 14 Nov, Q2).
//  - Vapi engine: today's path. POST /api/ayla/consultation: the CRM intake
//    (campaign website-ayla), the site's ayla_consultations row, the team email.
//  - Brain engine: the form goes to Ayla's server (/voice/intake), which makes
//    the CRM Voice upsert in the call's own conversation. The site keeps its
//    own row and team email through /api/ayla/voice-consultation, which never
//    reaches the CRM intake: one CRM contact, not two.
//  - Ayla's server unavailable or unreachable (or refusing our origin): it
//    created no lead, so today's path runs and the call is Vapi's.
//  - The honeypot is the site's job on the brain path (the intake has none):
//    a filled one sends nothing to Ayla's server and starts no call.

export type SubmitOutcome = { kind: "brain"; form: VoiceForm; intake: string } | { kind: "vapi" } | { kind: "ignored" };

export interface SubmitDeps {
  engine: Engine;
  /** The form's honeypot input. */
  hp: string;
  intake(form: VoiceForm): Promise<IntakeResult>;
  /** POST /api/ayla/consultation through the CRM submission helper; throws a visitor-facing error. */
  saveWithCrm(body: Record<string, unknown>): Promise<void>;
  /** POST /api/ayla/voice-consultation: the site's own record, no CRM. Best effort. */
  saveLocal(body: Record<string, unknown>): Promise<void>;
}

/** A refusal to show the visitor (no call starts). */
export class SubmitError extends Error {}

export async function submitAylaForm(values: AylaFormValues, d: SubmitDeps): Promise<SubmitOutcome> {
  // The website box's lone "https://" is no website.
  const body: Record<string, unknown> = { ...values, companyWebsite: websiteValue(values.companyWebsite) };
  if (d.engine !== "brain") {
    await d.saveWithCrm(body);
    return { kind: "vapi" };
  }
  if (d.hp.trim()) {
    await d.saveLocal({ ...body, hp: d.hp }).catch(() => {});
    return { kind: "ignored" };
  }
  const form = voiceFormFrom(values);
  const r = await d.intake(form);
  if (r.ok) {
    // The CRM already has the visitor; the site's own row must not hold up the call.
    void d.saveLocal(body).catch(() => {});
    return { kind: "brain", form, intake: r.intake };
  }
  if (r.error === "unavailable" || r.error === "network" || r.error === "origin") {
    await d.saveWithCrm(body);
    return { kind: "vapi" };
  }
  if (r.error === "rate_limited") throw new SubmitError("Too many calls from your network right now. Please try again later, or book a session with a consultant.");
  throw new SubmitError("We couldn't start the call. Please check your details and try again.");
}
