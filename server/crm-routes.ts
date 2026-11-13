import type { Express, Request, Response } from "express";
import type { PoolClient } from "@neondatabase/serverless";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { CRM_CAMPAIGNS, NEWSLETTER_CONSENT } from "@shared/crm";
import {
  registerUserSchema, updateProfileSchema, newsletterSubscriberSchema,
  resourceDownloadSchema, partnerApplicationSchema, veraConsultationSchema,
  aylaConsultationSchema, inquireConsultationSchema, csrInfographicLeadSchema,
} from "@shared/schema";
import { pool } from "./db";
import { storage } from "./storage";
import { CrmIntakeError, crmMetadataSchema, deliverCrmLead, leadFingerprint, type CrmLead } from "./crm-intake";
import { joinPhone } from "./phone";

const aiLeadSchema = z.object({
  email: z.string().email(),
  firstName: z.string().max(100).optional(), lastName: z.string().max(100).optional(),
  phone: z.string().max(100).optional(), company: z.string().max(255).optional(),
  role: z.string().max(255).optional(), message: z.string().max(10000).optional(),
  website: z.string().max(2048).optional(),
  fields: z.object({
    action: z.enum(["create-chatbot", "create-voice-agent"]),
    agentName: z.string().max(255),
  }).optional(),
});

const schemas: Record<string, z.ZodTypeAny> = {
  "/api/auth/register": registerUserSchema,
  "/api/auth/profile": updateProfileSchema,
  "/api/newsletter/subscribe": newsletterSubscriberSchema,
  "/api/resources/track-download": resourceDownloadSchema,
  "/api/partners/apply": partnerApplicationSchema,
  "/api/vera/consultation": veraConsultationSchema,
  "/api/ayla/consultation": aylaConsultationSchema,
  "/api/inquire/consultation": inquireConsultationSchema,
  "/api/csr-infographic/submit": csrInfographicLeadSchema,
  "/api/lead": aiLeadSchema,
};

export function buildCrmLead(url: string, raw: Record<string, unknown>, data: Record<string, any>, email: string): CrmLead {
  const meta = crmMetadataSchema.parse({ ...raw, submissionId: raw.submissionId || randomUUID() });
  // Only an explicitly checked opt-in is subscribed; never trust pre-existing
  // profile subscription flags as fresh consent.
  const newsletter = url !== "/api/auth/profile" &&
    (meta.newsletter === true || data.isSubscribedToNewsletter === true);
  const consentText = newsletter ? meta.consentText : undefined;
  if (url === "/api/newsletter/subscribe" && !newsletter) {
    throw new CrmIntakeError(400, "CONSENT", "Please select the newsletter checkbox to subscribe.");
  }
  if (newsletter && (!consentText || (url !== "/api/lead" && consentText !== NEWSLETTER_CONSENT))) {
    throw new CrmIntakeError(400, "CONSENT", "Please confirm your newsletter preference and try again.");
  }
  const fields: Record<string, unknown> = {};
  for (const key of ["companySize", "resourceName", "linkedinUrl"]) {
    if (data[key]) fields[key] = data[key];
  }
  if (url === "/api/lead" && data.fields) Object.assign(fields, data.fields);
  const phone = data.phone || joinPhone(data.countryCode, data.phoneNumber);
  return {
    ...meta,
    email,
    campaign: CRM_CAMPAIGNS[url],
    firstName: data.firstName || undefined, lastName: data.lastName || undefined,
    fullName: data.fullName || undefined,
    phone,
    company: data.company || data.companyName || undefined,
    website: /^https?:\/\/$/.test(data.companyWebsite || data.website || "") ? undefined : data.companyWebsite || data.website || undefined,
    role: data.jobTitle || data.role || undefined,
    message: data.message || data.describeInitiative || data.partnerReason || undefined,
    newsletter, consentText,
    fields,
  };
}

function sendError(res: Response, error: unknown) {
  if (error instanceof CrmIntakeError) {
    if (error.status === 429) res.setHeader("Retry-After", "30");
    return res.status(error.status).json({ message: error.message, error: { code: error.code, message: error.message } });
  }
  if (error instanceof z.ZodError) {
    return res.status(400).json({ message: "Please check your form details and try again.", error: { code: "VALIDATION" } });
  }
  // Do not log raw upstream bodies, visitor data, credentials, or DB parameters.
  console.error("[crm] submission failed", { type: error instanceof Error ? error.name : "Unknown" });
  return res.status(503).json({ message: "We couldn't save your submission right now. Please try again shortly.", error: { code: "UNAVAILABLE" } });
}

// Install before existing handlers. Validate and deliver to CRM BEFORE reporting
// success or starting Ayla's call. Existing local handlers/emails stay intact.
export function installCrmRoutes(app: Express) {
  for (const [url, schema] of Object.entries(schemas)) {
    const method = url === "/api/auth/profile" ? "put" : "post";
    app[method](url, async (req: Request, res: Response, next) => {
      let connection: PoolClient | undefined;
      let locked = false;
      let ledgerKey = "";
      const release = async () => {
        const current = connection;
        connection = undefined;
        if (current) {
          try {
            if (locked) await current.query("SELECT pg_advisory_unlock(hashtext($1))", [ledgerKey]);
          } finally { current.release(); }
        }
      };
      try {
        const data = schema.parse(req.body);
        let email = data.email;
        if (url === "/api/auth/profile") {
          if (!req.session?.userId) return res.status(401).json({ message: "Not authenticated" });
          const user = await storage.getUserById(req.session.userId);
          if (!user) return res.status(404).json({ message: "User not found" });
          email = user.email; // Never accept another contact's email from the browser.
        }
        const lead = buildCrmLead(url, req.body, data, email);
        if (!process.env.POTENTIAL_CRM_INTAKE_KEY) {
          throw new CrmIntakeError(503, "UNAVAILABLE", "We couldn't save your submission right now. Please try again shortly.");
        }
        ledgerKey = `${url}:${lead.submissionId}`;
        const fingerprint = leadFingerprint(lead);
        connection = await pool.connect();
        const lock = await connection.query("SELECT pg_try_advisory_lock(hashtext($1)) AS locked", [ledgerKey]);
        locked = lock.rows[0].locked;
        if (!locked) throw new CrmIntakeError(429, "IN_PROGRESS", "Your submission is still processing. Please wait a moment and try again.");
        const previous = await connection.query("SELECT fingerprint, status, response FROM crm_submissions WHERE id = $1", [ledgerKey]);
        if (previous.rows[0]) {
          if (previous.rows[0].fingerprint !== fingerprint) {
            throw new CrmIntakeError(409, "CONFLICT", "This submission changed. Please edit a field and submit again.");
          }
          const cached = previous.rows[0];
          await release();
          return res.status(cached.status).json(cached.response);
        }
        if (url === "/api/auth/register" && await storage.getUserByEmail(lead.email)) {
          throw new CrmIntakeError(400, "INVALID", "Email already in use");
        }
        const result = await deliverCrmLead(lead);
        if (lead.hp) {
          await release();
          return res.status(201).json({ message: "Submission received." });
        }
        const originalJson = res.json.bind(res);
        // Wait for the replay record before sending success. Local validation or
        // persistence failures remain retryable and are never recorded as success.
        res.json = (body) => {
          const status = res.statusCode;
          void (async () => {
            try {
              if (status >= 200 && status < 300) {
                await connection!.query(
                  "INSERT INTO crm_submissions (id, fingerprint, status, response) VALUES ($1, $2, $3, $4::jsonb)",
                  [ledgerKey, fingerprint, status, JSON.stringify(body)],
                );
              }
              originalJson(body);
            } catch {
              res.status(503);
              originalJson({ message: "We couldn't finish saving your submission. Please try again shortly." });
            } finally { await release().catch(() => {}); }
          })();
          return res;
        };
        if (url === "/api/lead") {
          return res.status(200).json({ ok: true, status: result.status, message: "Lead saved." });
        }
        next();
      } catch (error) {
        await release().catch(() => {});
        sendError(res, error);
      }
    });
  }
}
