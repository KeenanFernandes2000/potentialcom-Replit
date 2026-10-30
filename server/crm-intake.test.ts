// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { deliverCrmLead, leadFingerprint, CRM_INTAKE_URL } from "./crm-intake";

const lead = { email: "test@example.com", campaign: "website-contact", submissionId: "submission-test-1", hp: "" };
beforeEach(() => vi.stubEnv("POTENTIAL_CRM_INTAKE_KEY", "test-server-key"));
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("CRM intake contract", () => {
  it("uses the exact endpoint, server-only bearer header, and unchanged payload", async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ ok: true, status: "accepted", id: "test" }));
    vi.stubGlobal("fetch", fetcher);
    expect(await deliverCrmLead(lead)).toEqual({ ok: true, status: "accepted", id: "test" });
    const [url, init] = fetcher.mock.calls[0];
    expect(url).toBe(CRM_INTAKE_URL);
    expect(init.headers.Authorization).toBe("Bearer test-server-key");
    expect(JSON.parse(init.body)).toEqual(lead);
  });
  it("accepts duplicate acknowledgements as successful deliveries", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ ok: true, status: "duplicate", id: "test" })));
    expect((await deliverCrmLead(lead)).status).toBe("duplicate");
  });
  it.each([400, 401, 403, 409, 429, 500, 503])("surfaces CRM failure %s without leaking upstream data", async status => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ error: { message: "PRIVATE UPSTREAM DATA" } }, { status })));
    await expect(deliverCrmLead(lead)).rejects.not.toThrow("PRIVATE UPSTREAM DATA");
  });
  it("fails on network errors and malformed success bodies", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("secret internal failure")));
    await expect(deliverCrmLead(lead)).rejects.toMatchObject({ status: 502, code: "UPSTREAM" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("not json")));
    await expect(deliverCrmLead(lead)).rejects.toMatchObject({ status: 502 });
  });
  it("fails explicitly without a key and never calls CRM", async () => {
    vi.stubEnv("POTENTIAL_CRM_INTAKE_KEY", "");
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    await expect(deliverCrmLead(lead)).rejects.toMatchObject({ status: 503 });
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("detects changed payloads for a reused submission ID", () => {
    expect(leadFingerprint(lead)).not.toBe(leadFingerprint({ ...lead, email: "changed@example.com" }));
  });
});
