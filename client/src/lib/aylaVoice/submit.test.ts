// client/src/lib/aylaVoice/submit.test.ts
import { describe, expect, it } from "vitest";
import type { IntakeResult } from "./api";
import type { AylaFormValues, VoiceForm } from "./form";
import { SubmitError, submitAylaForm, type SubmitDeps } from "./submit";

const V: AylaFormValues = {
  firstName: "Mona", lastName: "Haddad", email: "mona@example.com", countryCode: "+971", phoneNumber: "0544043860",
  companyName: "Acme Learning", companyWebsite: "https://", role: "Head of L&D",
};
const SITE_BODY = { ...V, companyWebsite: "" };
const VOICE_FORM: VoiceForm = { firstName: "Mona", lastName: "Haddad", email: "mona@example.com", organisation: "Acme Learning", role: "Head of L&D", phone: "+971 544043860" };
const INTAKE = "i".repeat(43);

function setup(o: { engine?: "vapi" | "brain"; hp?: string; intake?: IntakeResult; crmFails?: boolean; localFails?: boolean } = {}) {
  const calls: Array<[string, unknown]> = [];
  const d: SubmitDeps = {
    engine: o.engine ?? "brain",
    hp: o.hp ?? "",
    intake: async (form) => {
      calls.push(["intake", form]);
      return o.intake ?? { ok: true, intake: INTAKE };
    },
    saveWithCrm: async (body) => {
      calls.push(["crm", body]);
      if (o.crmFails) throw new Error("Please try again shortly.");
    },
    saveLocal: async (body) => {
      calls.push(["local", body]);
      if (o.localFails) throw new Error("db down");
    },
  };
  return { d, calls, kinds: () => calls.map(([k]) => k) };
}

describe("submitAylaForm", () => {
  it("Vapi engine: today's path (the CRM intake through /api/ayla/consultation), the website box's lone https:// dropped", async () => {
    const t = setup({ engine: "vapi" });
    expect(await submitAylaForm(V, t.d)).toEqual({ kind: "vapi" });
    expect(t.calls).toEqual([["crm", SITE_BODY]]);
  });
  it("brain engine (Q2): the form goes to Ayla's server, the site keeps its own record outside the CRM, never the CRM intake", async () => {
    const t = setup();
    expect(await submitAylaForm(V, t.d)).toEqual({ kind: "brain", form: VOICE_FORM, intake: INTAKE });
    expect(t.calls).toEqual([["intake", VOICE_FORM], ["local", SITE_BODY]]);
  });
  it("the site's own record failing does not stop the call (the CRM contact is already saved)", async () => {
    const t = setup({ localFails: true });
    expect((await submitAylaForm(V, t.d)).kind).toBe("brain");
  });
  it("a filled honeypot: no intake (no CRM contact), no call; the site's route drops it quietly", async () => {
    const t = setup({ hp: "http://spam.example" });
    expect(await submitAylaForm(V, t.d)).toEqual({ kind: "ignored" });
    expect(t.calls).toEqual([["local", { ...SITE_BODY, hp: "http://spam.example" }]]);
  });
  it("Ayla's server unavailable, unreachable or refusing the origin: no lead was created, so today's path runs (CRM intake, Vapi)", async () => {
    for (const error of ["unavailable", "network", "origin"] as const) {
      const t = setup({ intake: { ok: false, error } });
      expect(await submitAylaForm(V, t.d)).toEqual({ kind: "vapi" });
      expect(t.kinds()).toEqual(["intake", "crm"]);
    }
  });
  it("the fallback's own failure is the visitor's error, as today", async () => {
    const t = setup({ intake: { ok: false, error: "unavailable" }, crmFails: true });
    await expect(submitAylaForm(V, t.d)).rejects.toThrow("Please try again shortly.");
  });
  it("rate limited or refused as invalid: an error to show, no call, nothing else sent", async () => {
    const r = setup({ intake: { ok: false, error: "rate_limited" } });
    await expect(submitAylaForm(V, r.d)).rejects.toThrow(SubmitError);
    await expect(submitAylaForm(V, setup({ intake: { ok: false, error: "rate_limited" } }).d)).rejects.toThrow(/Too many calls/);
    expect(r.kinds()).toEqual(["intake"]);
    const b = setup({ intake: { ok: false, error: "bad_request" } });
    await expect(submitAylaForm(V, b.d)).rejects.toThrow(/check your details/);
    expect(b.kinds()).toEqual(["intake"]);
  });
});
