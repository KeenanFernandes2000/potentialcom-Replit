// @vitest-environment node
import express from "express";
import request from "supertest";
import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { installVapiCrmRoutes, vapiWebhookToken } from "./vapi-crm";

function app() {
  const app = express();
  app.use(express.json());
  installVapiCrmRoutes(app);
  return app;
}
const envelope = (args: unknown) => ({
  message: {
    type: "tool-calls",
    call: {
      id: "call-integration-123", assistantId: "32d7022b-8c96-4498-bd94-60dfd4171e4f",
      assistantOverrides: { variableValues: { crmAttribution: JSON.stringify({ pageUrl: "https://potential.com/ayla", utm: { source: "test" } }) } },
    },
    toolCallList: [{ id: "tool-integration-123", function: { name: "submit_lead", arguments: args } }],
  },
});
beforeEach(() => {
  vi.stubEnv("POTENTIAL_CRM_INTAKE_KEY", "test-only-server-key");
  vi.stubGlobal("fetch", vi.fn(async () => Response.json({ ok: true, status: "accepted", id: "test" })));
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe("AI submit_lead tool", () => {
  it("requires signed server authorization", async () => {
    expect((await request(app()).post("/api/ai/vapi-lead").send(envelope({ email: "test@example.com" }))).status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("forwards only visitor fields, with attribution and stable retry IDs", async () => {
    const server = app();
    const payload = envelope({ email: "test@example.com", message: "Needs a platform", newsletter: false, password: "ignore", endpoint: "https://invalid.example" });
    for (let i = 0; i < 2; i++) {
      const response = await request(server).post("/api/ai/vapi-lead")
        .set("Authorization", `Bearer ${vapiWebhookToken()}`).send(payload);
      expect(response.body.results[0].result).toBe("Lead saved.");
    }
    const lead = JSON.parse((fetch as any).mock.calls[0][1].body);
    expect(lead).toMatchObject({ email: "test@example.com", message: "Needs a platform", campaign: "website-ayla-conversation", pageUrl: "https://potential.com/ayla", submissionId: "call-integration-123:tool-integration-123", newsletter: false });
    expect(lead).not.toHaveProperty("password");
    expect(lead).not.toHaveProperty("endpoint");
    expect((fetch as any).mock.calls[0][1].body).toBe((fetch as any).mock.calls[1][1].body);
  });
  it.each([
    { message: "No email known" },
    { email: "invalid" },
    { email: "test@example.com", newsletter: true },
  ])("never guesses an email or silently subscribes without consent", async args => {
    const result = await request(app()).post("/api/ai/vapi-lead").set("Authorization", `Bearer ${vapiWebhookToken()}`).send(envelope(args));
    expect(result.body.results[0].result).toContain("Not saved");
    expect(fetch).not.toHaveBeenCalled();
  });
  it("returns a short honest failure to the agent, without raw CRM data", async () => {
    (fetch as any).mockResolvedValueOnce(Response.json({ error: { message: "private internal data" } }, { status: 503 }));
    const result = await request(app()).post("/api/ai/vapi-lead").set("Authorization", `Bearer ${vapiWebhookToken()}`).send(envelope({ email: "test@example.com" }));
    expect(result.body.results[0].result).toContain("Not saved right now");
    expect(JSON.stringify(result.body)).not.toContain("private internal data");
  });
  it("passes exact AI newsletter consent when the visitor explicitly agrees", async () => {
    await request(app()).post("/api/ai/vapi-lead").set("Authorization", `Bearer ${vapiWebhookToken()}`)
      .send(envelope({ email: "test@example.com", newsletter: true, consentText: "Would you like our newsletter?" }));
    expect(JSON.parse((fetch as any).mock.calls[0][1].body)).toMatchObject({ newsletter: true, consentText: "Would you like our newsletter?" });
  });
});
