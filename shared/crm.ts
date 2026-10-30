// Public form identifiers and consent copy only. Credentials live on the server.
export const NEWSLETTER_CONSENT = "Subscribe to our newsletter";

export const CRM_CAMPAIGNS: Record<string, string> = {
  "/api/inquire/consultation": "website-contact",
  "/api/ayla/consultation": "website-ayla",
  "/api/vera/consultation": "website-vera",
  "/api/partners/apply": "website-partner",
  "/api/resources/track-download": "website-whitepaper",
  "/api/newsletter/subscribe": "website-newsletter",
  "/api/csr-infographic/submit": "website-csr-infographic",
  "/api/auth/register": "website-account-signup",
  "/api/auth/profile": "website-profile-update",
  "/api/lead": "website-ai-conversation",
};

export const SUBMIT_LEAD_TOOL = {
  name: "submit_lead",
  description: "Save the visitor as a CRM lead once they have provided their email. Never invent values. Newsletter must be false unless the visitor explicitly agrees; consentText must be the exact question they agreed to. Tell the visitor if saving fails.",
  parameters: {
    type: "object" as const,
    properties: {
      email: { type: "string" as const },
      firstName: { type: "string" as const },
      lastName: { type: "string" as const },
      phone: { type: "string" as const },
      company: { type: "string" as const },
      role: { type: "string" as const },
      message: { type: "string" as const, description: "Brief summary of the visitor's needs." },
      newsletter: { type: "boolean" as const },
      consentText: { type: "string" as const },
    },
    required: ["email"],
  },
};
