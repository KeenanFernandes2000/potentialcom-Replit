import type { Express } from "express";
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { crmMetadataSchema, deliverCrmLead } from "./crm-intake";

export function vapiWebhookToken() {
  if (!process.env.POTENTIAL_CRM_INTAKE_KEY) throw new Error("CRM unavailable");
  return createHmac("sha256", process.env.POTENTIAL_CRM_INTAKE_KEY).update("potential-vapi-crm-webhook-v1").digest("hex");
}

const toolArgs = z.object({
  email: z.string().email(), firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(), phone: z.string().max(100).optional(),
  company: z.string().max(255).optional(), role: z.string().max(255).optional(),
  message: z.string().max(10000).optional(), newsletter: z.boolean().optional(),
  consentText: z.string().max(1000).optional(),
});
const assistantId = () => process.env.VITE_AYLA_BOT_ID || "32d7022b-8c96-4498-bd94-60dfd4171e4f";

let cachedConfig: { expires: number; model: Record<string, unknown> } | undefined;

export function installVapiCrmRoutes(app: Express) {
  // Return only model identifiers and tool IDs. Never return upstream prompts,
  // private API keys, or webhook authorization headers to the browser.
  app.get("/api/ayla/crm-config", async (_req, res) => {
    try {
      if (!process.env.VAPI_CRM_TOOL_ID || !process.env.VAPI_PRIVATE_KEY) throw new Error("Configuration missing");
      if (cachedConfig && cachedConfig.expires > Date.now()) return res.json({ model: cachedConfig.model });
      const response = await fetch(`https://api.vapi.ai/assistant/${assistantId()}`, {
        headers: { Authorization: `Bearer ${process.env.VAPI_PRIVATE_KEY}` },
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error("Assistant unavailable");
      const assistant = await response.json();
      const model = assistant.model;
      // Inline tools can contain private server headers; never expose them.
      if (!model?.provider || !model?.model || model.tools?.length) throw new Error("Unsupported assistant configuration");
      const safeModel = {
        provider: model.provider, model: model.model,
        toolIds: Array.from(new Set([...(model.toolIds || []), process.env.VAPI_CRM_TOOL_ID])),
      };
      cachedConfig = { expires: Date.now() + 60000, model: safeModel };
      res.json({ model: safeModel });
    } catch {
      res.status(503).json({ message: "Conversation lead capture is temporarily unavailable. Your initial enquiry is already saved." });
    }
  });

  app.post("/api/ai/vapi-lead", async (req, res) => {
    try {
      const expected = Buffer.from(`Bearer ${vapiWebhookToken()}`);
      const actual = Buffer.from(req.header("authorization") || "");
      if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const message = req.body?.message;
      if (message?.type !== "tool-calls" || !Array.isArray(message.toolCallList)) {
        return res.status(400).json({ message: "Invalid tool request" });
      }
      const call = message.call;
      if (!call?.id || call.assistantId !== assistantId() || message.toolCallList.length > 5) {
        return res.status(400).json({ message: "Invalid call" });
      }
      const variables = call.assistantOverrides?.variableValues || message.assistant?.variableValues || {};
      let attribution = {};
      try { attribution = JSON.parse(variables.crmAttribution || "{}"); } catch {}
      const results = [];
      for (const tool of message.toolCallList) {
        let result = "Not saved: unsupported tool.";
        if (tool.function?.name === "submit_lead" && typeof tool.id === "string") {
          try {
            const args = toolArgs.parse(typeof tool.function.arguments === "string"
              ? JSON.parse(tool.function.arguments) : tool.function.arguments);
            const newsletter = args.newsletter === true;
            const meta = crmMetadataSchema.parse({
              ...attribution, hp: "", submissionId: `${call.id}:${tool.id}`,
              newsletter, consentText: newsletter ? args.consentText : undefined,
            });
            await deliverCrmLead({
              ...meta, ...args, newsletter, consentText: newsletter ? args.consentText : undefined,
              campaign: "website-ayla-conversation",
            });
            result = "Lead saved.";
          } catch (error) {
            result = error instanceof z.ZodError
              ? "Not saved: ask the visitor to check their email and confirm newsletter consent if requested."
              : "Not saved right now. Tell the visitor we could not record it and try again later with the same tool call.";
          }
        }
        results.push({ toolCallId: tool.id, result });
      }
      res.json({ results });
    } catch {
      res.status(503).json({ message: "Lead capture unavailable" });
    }
  });
}
