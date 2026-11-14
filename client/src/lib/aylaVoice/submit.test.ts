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
  it("Ayla's server answers 503 (busy or unavailable) or cannot be reached: no lead was created, so today's path runs (CRM intake, Vapi)", async () => {
    for (const error of ["unavailable", "network"] as const) {
      const t = setup({ intake: { ok: false, error } });
      expect(await submitAylaForm(V, t.d)).toEqual({ kind: "vapi" });
      expect(t.kinds()).toEqual(["intake", "crm"]);
    }
  });
  it("the fallback's own failure is the visitor's error, as today", async () => {
    const t = setup({ intake: { ok: false, error: "unavailable" }, crmFails: true });
    await expect(submitAylaForm(V, t.d)).rejects.toThrow("Please try again shortly.");
  });
  it("429 from the intake: the site keeps its own record and team email (the lead is not lost), the visitor is told Ayla is busy, no Vapi", async () => {
    const t = setup({ intake: { ok: false, error: "rate_limited" } });
    const err = await submitAylaForm(V, t.d).catch((e) => e);
    expect(err).toBeInstanceOf(SubmitError);
    expect(err.message).toBe("Ayla is busy right now. Please try again shortly.");
    expect(t.calls).toEqual([["intake", VOICE_FORM], ["local", { ...SITE_BODY, crmNotSaved: true }]]);
    expect(t.kinds()).not.toContain("crm");
  });
  it("403 and 400 are not a fallback either (the spec names only 503 and the network): the site keeps its record, the visitor gets an error", async () => {
    for (const [error, message] of [["origin", /couldn't start the call/], ["bad_request", /check your details/]] as const) {
      const t = setup({ intake: { ok: false, error } });
      await expect(submitAylaForm(V, t.d)).rejects.toThrow(message);
      expect(t.kinds()).toEqual(["intake", "local"]);
    }
  });
  it("the site's record failing on a refusal still shows the refusal", async () => {
    const t = setup({ intake: { ok: false, error: "rate_limited" }, localFails: true });
    await expect(submitAylaForm(V, t.d)).rejects.toThrow(/busy/);
  });
});
