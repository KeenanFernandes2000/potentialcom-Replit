import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { fetchWithCrm, crmAttribution } from "./crm-submission";

beforeEach(() => {
  sessionStorage.clear();
  history.replaceState({}, "", "/inquire?utm_source=newsletter&utm_medium=email&gclid=click1");
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 })));
});
afterEach(() => { vi.unstubAllGlobals(); document.body.innerHTML = ""; });

describe("browser CRM submission metadata", () => {
  it("preserves landing attribution across navigation", () => {
    const first = crmAttribution();
    history.replaceState({}, "", "/partner");
    const next = crmAttribution();
    expect(first.utm.source).toBe("newsletter");
    expect(next.utm).toEqual(first.utm);
    expect(next.gclid).toBe("click1");
    expect(next.pageUrl).toContain("/partner");
  });
  it("reuses the exact id/body on retries, renewing only after success", async () => {
    const fetcher = fetch as any;
    fetcher.mockResolvedValueOnce(new Response("{}", { status: 503 }));
    const options = { method: "POST", body: JSON.stringify({ email: "retry@example.com" }) };
    await fetchWithCrm("/api/inquire/consultation", options);
    history.replaceState({}, "", "/inquire?utm_source=changed");
    await fetchWithCrm("/api/inquire/consultation", options);
    expect(fetcher.mock.calls[0][1].body).toBe(fetcher.mock.calls[1][1].body);
    await fetchWithCrm("/api/inquire/consultation", options);
    expect(JSON.parse(fetcher.mock.calls[2][1].body).submissionId).not.toBe(JSON.parse(fetcher.mock.calls[1][1].body).submissionId);
  });
  it("starts a new attempt if the visitor changes form fields after failure", async () => {
    (fetch as any).mockResolvedValue(new Response("{}", { status: 500 }));
    await fetchWithCrm("/api/partners/apply", { method: "POST", body: JSON.stringify({ email: "first@example.com" }) });
    await fetchWithCrm("/api/partners/apply", { method: "POST", body: JSON.stringify({ email: "edited@example.com" }) });
    const calls = (fetch as any).mock.calls;
    expect(JSON.parse(calls[0][1].body).submissionId).not.toBe(JSON.parse(calls[1][1].body).submissionId);
  });
  it("reads the honeypot and sets consent only for an explicit opt-in", async () => {
    document.body.innerHTML = '<input name="hp" data-crm-form="website-whitepaper" value="bot-value">';
    await fetchWithCrm("/api/resources/track-download", { method: "POST", body: JSON.stringify({ email: "optin@example.com", newsletter: true }) });
    const body = JSON.parse((fetch as any).mock.calls[0][1].body);
    expect(body).toMatchObject({ hp: "bot-value", newsletter: true, consentText: "Subscribe to our newsletter" });
    await fetchWithCrm("/api/resources/track-download", { method: "POST", body: JSON.stringify({ email: "optout@example.com" }) });
    const unchecked = JSON.parse((fetch as any).mock.calls[1][1].body);
    expect(unchecked.newsletter).toBe(false);
    expect(unchecked).not.toHaveProperty("consentText");
  });
  it("does not attach CRM metadata to login or password reset", async () => {
    const options = { method: "POST", body: JSON.stringify({ email: "login@example.com", password: "not-for-crm" }) };
    await fetchWithCrm("/api/auth/login", options);
    expect((fetch as any).mock.calls[0]).toEqual(["/api/auth/login", options]);
  });
  it("shares one request for simultaneous double-clicks", async () => {
    let resolve!: (response: Response) => void;
    (fetch as any).mockReturnValue(new Promise(r => { resolve = r; }));
    const options = { method: "POST", body: JSON.stringify({ email: "double@example.com" }) };
    const first = fetchWithCrm("/api/inquire/consultation", options);
    const second = fetchWithCrm("/api/inquire/consultation", options);
    expect(fetch).toHaveBeenCalledOnce();
    resolve(new Response("{}", { status: 200 }));
    expect((await first).ok).toBe(true);
    expect((await second).ok).toBe(true);
  });
});
