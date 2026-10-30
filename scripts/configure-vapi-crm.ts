// One-time provider configuration, NOT a deployment/migration hook.
// Use a production URL verified via Replit deployment metadata.
import { SUBMIT_LEAD_TOOL } from "../shared/crm";
import { vapiWebhookToken } from "../server/vapi-crm";

const site = new URL(process.argv[2] || "");
if (site.protocol !== "https:" || site.username || site.password) throw new Error("A public HTTPS site URL is required.");
if (!process.env.VAPI_PRIVATE_KEY) throw new Error("Vapi server credentials are missing.");

const server = {
  url: new URL("/api/ai/vapi-lead", site).href,
  headers: { Authorization: `Bearer ${vapiWebhookToken()}` },
  timeoutSeconds: 15,
};
const headers = { "Content-Type": "application/json", Authorization: `Bearer ${process.env.VAPI_PRIVATE_KEY}` };
const listed = await fetch("https://api.vapi.ai/tool", { headers });
if (!listed.ok) throw new Error(`Vapi tool lookup failed (${listed.status}).`);
const tools = await listed.json();
const existing = tools.find((tool: any) => tool.function?.name === "submit_lead" && tool.server?.url === server.url);
const response = await fetch(`https://api.vapi.ai/tool${existing ? `/${existing.id}` : ""}`, {
  method: existing ? "PATCH" : "POST",
  headers,
  body: JSON.stringify({ type: "function", async: false, function: SUBMIT_LEAD_TOOL, server }),
});
if (!response.ok) throw new Error(`Vapi tool setup failed (${response.status}).`);
const tool = await response.json();
// This ID is public configuration, not a credential. No secret values are logged.
console.log(JSON.stringify({ toolId: tool.id, existingAssistantUnchanged: true }));
