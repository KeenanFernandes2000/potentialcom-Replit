// @vitest-environment node
import express from "express";
import request from "supertest";
import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  rows: new Map<string, any>(),
  query: vi.fn(), release: vi.fn(),
  getUserById: vi.fn(),
  getUserByEmail: vi.fn(),
}));
vi.mock("./db", () => ({
  pool: { connect: vi.fn(async () => ({ query: mocks.query, release: mocks.release })) },
}));
vi.mock("./storage", () => ({ storage: { getUserById: mocks.getUserById, getUserByEmail: mocks.getUserByEmail } }));
import { installCrmRoutes, buildCrmLead } from "./crm-routes";

function app() {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => { req.session = { userId: 7 } as any; next(); });
  installCrmRoutes(app);
  const saved = vi.fn();
  app.post(/.*/, (req, res) => { saved(req.path); res.status(201).json({ saved: true }); });
  app.put("/api/auth/profile", (_req, res) => { saved(); res.json({ saved: true }); });
  return { app, saved };
}

const meta = { submissionId: "integration-attempt-1", hp: "", pageUrl: "https://potential.com/inquire?utm_source=test", referrer: "https://example.com", utm: { source: "test", medium: "email" }, gclid: "test-click" };
const contact = { email: "test@example.com", firstName: "Test", lastName: "Contact", companyName: "Test company" };
beforeEach(() => {
  vi.stubEnv("POTENTIAL_CRM_INTAKE_KEY", "server-only-test-key");
  mocks.rows.clear();
  mocks.query.mockReset();
  mocks.getUserById.mockResolvedValue({ id: 7, email: "profile@example.com" });
  mocks.getUserByEmail.mockResolvedValue(undefined);
  mocks.query.mockImplementation(async (sql: string, args: any[]) => {
    if (sql.includes("pg_try_advisory_lock")) return { rows: [{ locked: true }] };
    if (sql.startsWith("SELECT fingerprint")) return { rows: mocks.rows.has(args[0]) ? [mocks.rows.get(args[0])] : [] };
    if (sql.startsWith("INSERT")) mocks.rows.set(args[0], { fingerprint: args[1], status: args[2], response: JSON.parse(args[3]) });
    return { rows: [] };
  });
  vi.stubGlobal("fetch", vi.fn(async () => Response.json({ ok: true, status: "accepted", id: "test-id" })));
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("form CRM delivery gate", () => {
  it.each([
    ["/api/inquire/consultation", { ...contact, describeInitiative: "Test initiative", role: "Manager" }, "website-contact"],
    ["/api/ayla/consultation", { ...contact, phoneNumber: "123456789", countryCode: "+971", role: "Manager" }, "website-ayla"],
    ["/api/vera/consultation", { ...contact, phoneNumber: "123456789", countryCode: "+971" }, "website-vera"],
    ["/api/partners/apply", { ...contact, jobTitle: "Manager", phoneNumber: "123456789", companySize: "1-10", partnerReason: "Test partnership reason", isSubscribedToNewsletter: false }, "website-partner"],
    ["/api/resources/track-download", { email: contact.email, resourceName: "Whitepaper" }, "website-whitepaper"],
    ["/api/newsletter/subscribe", { email: contact.email, newsletter: true, consentText: "Subscribe to our newsletter" }, "website-newsletter"],
    ["/api/csr-infographic/submit", { email: contact.email, fullName: "Test Contact", companyName: "Test company" }, "website-csr-infographic"],
    ["/api/auth/register", { email: contact.email, password: "never-forward-this", isSubscribedToNewsletter: false }, "website-account-signup"],
  ])("connects %s with safe canonical fields and attribution", async (url, data, campaign) => {
    const { app: server, saved } = app();
    const response = await request(server).post(url as string).send({ ...meta, ...data });
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    expect(saved).toHaveBeenCalledOnce();
    const payload = JSON.parse((fetch as any).mock.calls[0][1].body);
    expect(payload).toMatchObject({ email: contact.email, campaign, submissionId: meta.submissionId, hp: "", utm: meta.utm, pageUrl: meta.pageUrl, gclid: meta.gclid });
    expect(payload).not.toHaveProperty("password");
    expect(JSON.stringify(payload)).not.toContain("never-forward-this");
    expect(payload.newsletter).toBe(data.newsletter === true);
  });
  it("gets profile email from the authenticated user and keeps security fields out", async () => {
    const { app: server } = app();
    expect((await request(server).put("/api/auth/profile").send({ ...meta, firstName: "Updated", email: "attacker@example.com", role: "admin", linkedinUrl: "https://example.com/profile" })).status).toBe(200);
    const payload = JSON.parse((fetch as any).mock.calls[0][1].body);
    expect(payload).toMatchObject({ email: "profile@example.com", firstName: "Updated", campaign: "website-profile-update", newsletter: false, fields: { linkedinUrl: "https://example.com/profile" } });
    expect(payload).not.toHaveProperty("role");
  });
  it("replays successful attempts without CRM calls or repeated local effects", async () => {
    const { app: server, saved } = app();
    const body = { ...meta, ...contact };
    const first = await request(server).post("/api/inquire/consultation").send(body);
    const retry = await request(server).post("/api/inquire/consultation").send(body);
    expect(retry.status).toBe(201);
    expect(retry.body).toEqual(first.body);
    expect(saved).toHaveBeenCalledOnce();
    expect(fetch).toHaveBeenCalledOnce();
  });
  it("rejects changed payloads for the same id", async () => {
    const { app: server } = app();
    await request(server).post("/api/inquire/consultation").send({ ...meta, ...contact });
    expect((await request(server).post("/api/inquire/consultation").send({ ...meta, ...contact, companyName: "Changed" })).status).toBe(409);
  });
  it("keeps CRM failures visible and skips all local side effects until retry succeeds", async () => {
    const { app: server, saved } = app();
    (fetch as any).mockResolvedValueOnce(Response.json({ error: {} }, { status: 503 }));
    const body = { ...meta, ...contact };
    expect((await request(server).post("/api/inquire/consultation").send(body)).status).toBe(502);
    expect(saved).not.toHaveBeenCalled();
    expect((await request(server).post("/api/inquire/consultation").send(body)).status).toBe(201);
    expect(saved).toHaveBeenCalledOnce();
    expect((fetch as any).mock.calls[0][1].body).toBe((fetch as any).mock.calls[1][1].body);
  });
  it("passes honeypots unchanged and suppresses local writes", async () => {
    const { app: server, saved } = app();
    await request(server).post("/api/inquire/consultation").send({ ...meta, ...contact, hp: "spam" });
    expect(JSON.parse((fetch as any).mock.calls[0][1].body).hp).toBe("spam");
    expect(saved).not.toHaveBeenCalled();
  });
  it("requires explicit newsletter consent and never forwards credentials from extra fields", () => {
    expect(() => buildCrmLead("/api/newsletter/subscribe", meta, { email: contact.email }, contact.email)).toThrow("checkbox");
    const lead = buildCrmLead("/api/inquire/consultation", { ...meta, fields: { password: "bad" }, token: "bad" }, contact, contact.email);
    expect(JSON.stringify(lead)).not.toContain("bad");
  });
  it("rejects invalid form data before contacting CRM", async () => {
    const { app: server, saved } = app();
    expect((await request(server).post("/api/inquire/consultation").send({ ...meta, ...contact, email: "invalid" })).status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
    expect(saved).not.toHaveBeenCalled();
  });
  it("does not forward rejected duplicate account registrations", async () => {
    mocks.getUserByEmail.mockResolvedValue({ email: contact.email });
    const { app: server, saved } = app();
    expect((await request(server).post("/api/auth/register").send({ ...meta, email: contact.email, password: "not-for-crm" })).status).toBe(400);
    expect(saved).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });
  it("captures AI creation requests but ignores unknown action fields", async () => {
    const { app: server } = app();
    const response = await request(server).post("/api/lead").send({
      ...meta, ...contact, website: "https://example.com",
      fields: { action: "create-chatbot", agentName: "Test bot", password: "not-for-crm" },
    });
    expect(response.status).toBe(200);
    const payload = JSON.parse((fetch as any).mock.calls[0][1].body);
    expect(payload).toMatchObject({ fields: { action: "create-chatbot", agentName: "Test bot" }, website: "https://example.com" });
    expect(payload.fields).not.toHaveProperty("password");
  });
});
