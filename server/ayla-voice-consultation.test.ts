// server/ayla-voice-consultation.test.ts
import { describe, expect, it } from "vitest";
import { AYLA_VOICE_CONSULTATION_PATH, LOCAL_LIMIT, createAylaVoiceConsultationHandler } from "./ayla-voice-consultation";
import { CRM_CAMPAIGNS } from "@shared/crm";

const FORM = { firstName: "Mona", lastName: "Haddad", email: "mona@example.com", companyName: "Acme Learning", role: "Head of L&D", countryCode: "+971", phoneNumber: "0544043860", companyWebsite: "" };

function setup(o: { saveFails?: boolean } = {}) {
  const saved: unknown[] = [];
  const mails: string[][] = [];
  let now = 1_000_000;
  const handle = createAylaVoiceConsultationHandler({
    save: async (v) => {
      if (o.saveFails) throw new Error("db down");
      saved.push(v);
    },
    notify: async (lines) => {
      mails.push(lines);
    },
    now: () => now,
  });
  return { handle, saved, mails, tick: (ms: number) => (now += ms) };
}

describe("the /ayla brain-mode consultation record (Q2: the site's own row and team email, never the CRM)", () => {
  it("is not a CRM intake route, so the CRM middleware never sees it (Ayla's server saves the CRM contact)", () => {
    expect(AYLA_VOICE_CONSULTATION_PATH).toBe("/api/ayla/voice-consultation");
    expect(CRM_CAMPAIGNS[AYLA_VOICE_CONSULTATION_PATH]).toBeUndefined();
  });
  it("stores the row and emails the team, the phone joined with its country code", async () => {
    const t = setup();
    expect(await t.handle({ ...FORM, hp: "" })).toEqual({ status: 201, body: { message: "Consultation request submitted successfully" } });
    expect(t.saved).toEqual([{ ...FORM }]);
    expect(t.mails).toHaveLength(1);
    expect(t.mails[0]).toContain("Phone Number: +971 544043860");
    expect(t.mails[0]).toContain("Email: mona@example.com");
    expect(t.mails[0]!.join("\n")).toMatch(/voice button/i);
  });
  it("no phone and no website are fine (stored as empty strings, as the schema does)", async () => {
    const t = setup();
    const { countryCode: _c, phoneNumber: _p, companyWebsite: _w, ...short } = FORM;
    expect((await t.handle(short)).status).toBe(201);
    expect(t.saved[0]).toMatchObject({ phoneNumber: "", countryCode: "" });
  });
  it("a filled honeypot looks like success but stores and sends nothing", async () => {
    const t = setup();
    expect(await t.handle({ ...FORM, hp: "http://spam.example" })).toEqual({ status: 201, body: { message: "Submission received." } });
    expect(t.saved).toEqual([]);
    expect(t.mails).toEqual([]);
  });
  it("refuses a bad form without saying more", async () => {
    const t = setup();
    expect(await t.handle({ ...FORM, email: "nope" })).toEqual({ status: 400, body: { message: "Please check your form details and try again." } });
    expect(await t.handle("x")).toMatchObject({ status: 400 });
    expect(t.saved).toEqual([]);
  });
  it("limits each email to LOCAL_LIMIT.perEmail and everyone to LOCAL_LIMIT.global per window (no proxy guesswork about IPs)", async () => {
    const t = setup();
    for (let i = 0; i < LOCAL_LIMIT.perEmail; i++) expect((await t.handle(FORM)).status).toBe(201);
    expect((await t.handle({ ...FORM, email: "MONA@example.com" })).status).toBe(429);
    expect((await t.handle({ ...FORM, email: "other@example.com" })).status).toBe(201);
    t.tick(LOCAL_LIMIT.windowMs + 1);
    expect((await t.handle(FORM)).status).toBe(201);
    const u = setup();
    for (let i = 0; i < LOCAL_LIMIT.global; i++) expect((await u.handle({ ...FORM, email: `v${i}@example.com` })).status).toBe(201);
    expect((await u.handle({ ...FORM, email: "late@example.com" })).status).toBe(429);
    expect(u.saved).toHaveLength(LOCAL_LIMIT.global);
  });
  it("a database failure is a 503 and sends no email", async () => {
    const t = setup({ saveFails: true });
    expect((await t.handle(FORM)).status).toBe(503);
    expect(t.mails).toEqual([]);
  });
});
