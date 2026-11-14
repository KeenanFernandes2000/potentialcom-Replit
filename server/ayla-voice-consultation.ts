// server/ayla-voice-consultation.ts
import type { Express } from "express";
import { z } from "zod";
import { aylaConsultationSchema, type AylaConsultationInput } from "@shared/schema";
import { joinPhone } from "@shared/phone";
import { clientIp, ipLimitKey } from "./client-ip";

// The /ayla form when the call runs on Ayla's brain (Mamoon, 14 Nov, Q2):
// Ayla's server (agents.potential.com) saves the visitor in the CRM as a Voice
// contact, so the site must NOT deliver the same form to the CRM intake as
// well. The site still keeps its own records: the ayla_consultations row and
// the team email. This path is deliberately not in CRM_CAMPAIGNS, so the CRM
// middleware (crm-routes.ts) never handles it; the honeypot, an email check
// and per-email, per-IP and global limits stand in for the intake's own checks.

export const AYLA_VOICE_CONSULTATION_PATH = "/api/ayla/voice-consultation";
/**
 * Records allowed. The visible harm of abuse is the team's inbox and real
 * visitors starved by a full global window. Per email and for everyone per
 * 10 minutes; per IP per hour, since a script just changes the email. The IP
 * is the one the platform's proxy saw (client-ip.ts), never a value the
 * visitor wrote into X-Forwarded-For.
 */
export const LOCAL_LIMIT = Object.freeze({
  perEmail: 3,
  global: 15,
  windowMs: 10 * 60_000,
  perIp: 3,
  ipWindowMs: 60 * 60_000,
});

export interface AylaVoiceConsultationDeps {
  save(v: AylaConsultationInput): Promise<unknown>;
  /** The team email's lines (routes.ts sendFormNotificationEmail; it never throws). */
  notify(lines: string[]): Promise<void>;
  now(): number;
}
export type HandlerResult = { status: number; body: { message: string } };

// The table schema checks lengths only; on the CRM route the intake checked the email. Here nothing else does.
const formSchema = aylaConsultationSchema.extend({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  companyName: z.string().trim().min(1).max(255),
  role: z.string().trim().min(1).max(100),
});

export function createAylaVoiceConsultationHandler(d: AylaVoiceConsultationDeps) {
  let all: number[] = [];
  const byEmail = new Map<string, number[]>();
  const byIp = new Map<string, number[]>();
  const allow = (email: string, ip: string): boolean => {
    const now = d.now();
    const within = (ms: number) => (ts: number[]) => ts.filter((t) => now - t <= ms);
    all = within(LOCAL_LIMIT.windowMs)(all);
    const mine = within(LOCAL_LIMIT.windowMs)(byEmail.get(email) ?? []);
    const fromIp = within(LOCAL_LIMIT.ipWindowMs)(byIp.get(ip) ?? []);
    if (all.length >= LOCAL_LIMIT.global || mine.length >= LOCAL_LIMIT.perEmail || fromIp.length >= LOCAL_LIMIT.perIp) return false;
    all.push(now);
    mine.push(now);
    fromIp.push(now);
    byEmail.set(email, mine);
    byIp.set(ip, fromIp);
    // Keep the maps small: forget emails and IPs that went quiet.
    const forget = (m: Map<string, number[]>, ms: number) =>
      m.forEach((v, k) => {
        if (now - (v[v.length - 1] ?? 0) > ms) m.delete(k);
      });
    forget(byEmail, LOCAL_LIMIT.windowMs);
    forget(byIp, LOCAL_LIMIT.ipWindowMs);
    return true;
  };

  /** `ip` is the visitor's address from clientIp(), the per-IP limit's key. */
  return async function handle(raw: unknown, ip: string): Promise<HandlerResult> {
    const body = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : null;
    // A filled honeypot: answer as the CRM route does, keep nothing.
    if (body && typeof body.hp === "string" && body.hp.trim()) return { status: 201, body: { message: "Submission received." } };
    const parsed = formSchema.safeParse(body);
    if (!parsed.success) return { status: 400, body: { message: "Please check your form details and try again." } };
    if (!allow(parsed.data.email.toLowerCase(), ipLimitKey(ip))) return { status: 429, body: { message: "Too many submissions. Please try again shortly." } };
    const v = parsed.data;
    try {
      await d.save(v);
    } catch {
      // No visitor data in the log.
      console.error("[ayla-voice-consultation] save failed");
      return { status: 503, body: { message: "We couldn't save your submission right now. Please try again shortly." } };
    }
    // The page sets crmNotSaved when Ayla's server refused the form (busy): no CRM contact, no call.
    const crmNotSaved = body?.crmNotSaved === true;
    await d.notify([
      crmNotSaved
        ? "New submission from the Ayla form on potential.com/ayla. Ayla's server was busy, so there was no call and the contact is not in the CRM."
        : "New submission received from the Ayla form on potential.com/ayla (voice button on Ayla's brain; Ayla's server saves the CRM contact, channel Voice).",
      "Source: Ayla voice button",
      ...(crmNotSaved ? ["CRM: NOT saved (Ayla's server was busy); please follow up by hand"] : []),
      "",
      `First Name: ${v.firstName}`,
      `Last Name: ${v.lastName}`,
      `Email: ${v.email}`,
      `Phone Number: ${joinPhone(v.countryCode, v.phoneNumber) ?? ""}`,
      `Company Name: ${v.companyName}`,
      `Company Website: ${v.companyWebsite || "N/A"}`,
      `Role: ${v.role}`,
    ]);
    return { status: 201, body: { message: "Consultation request submitted successfully" } };
  };
}

export function installAylaVoiceConsultation(app: Express, d: AylaVoiceConsultationDeps): void {
  const handle = createAylaVoiceConsultationHandler(d);
  app.post(AYLA_VOICE_CONSULTATION_PATH, async (req, res) => {
    const r = await handle(req.body, clientIp(req));
    res.status(r.status).json(r.body);
  });
}
