// server/ayla-voice-consultation.test.ts
import { describe, expect, it } from "vitest";
import { AYLA_VOICE_CONSULTATION_PATH, LOCAL_LIMIT, createAylaVoiceConsultationHandler, ipLimitModeFromEnv, type IpLimitMode } from "./ayla-voice-consultation";
import { UNKNOWN_IP } from "./client-ip";
import { CRM_CAMPAIGNS } from "@shared/crm";

const FORM = { firstName: "Mona", lastName: "Haddad", email: "mona@example.com", companyName: "Acme Learning", role: "Head of L&D", countryCode: "+971", phoneNumber: "0544043860", companyWebsite: "" };

function setup(o: { saveFails?: boolean; ipLimit?: IpLimitMode } = {}) {
  const saved: unknown[] = [];
  const mails: string[][] = [];
  const logs: string[] = [];
  let now = 1_000_000;
  const handler = createAylaVoiceConsultationHandler({
    save: async (v) => {
      if (o.saveFails) throw new Error("db down");
      saved.push(v);
    },
    notify: async (lines) => {
      mails.push(lines);
    },
    now: () => now,
    ipLimit: o.ipLimit,
    log: (line) => logs.push(line),
  });
  // Each test call comes from its own visitor unless it names one: the per-IP limit has its own test.
  let n = 0;
  const handle = (raw: unknown, ip = `203.0.113.${++n}`) => handler(raw, ip);
  return { handle, saved, mails, logs, tick: (ms: number) => (now += ms) };
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
  it("a form Ayla's server refused (429) is flagged in the team email: it is not in the CRM, so someone follows up by hand", async () => {
    const t = setup();
    expect((await t.handle({ ...FORM, crmNotSaved: true })).status).toBe(201);
    expect(t.saved).toEqual([{ ...FORM }]);
    expect(t.mails[0]).toContain("CRM: NOT saved (Ayla's server was busy); please follow up by hand");
    expect(t.mails[0]!.join("\n")).not.toMatch(/saves the CRM contact/);
    const u = setup();
    await u.handle(FORM);
    expect(u.mails[0]!.join("\n")).not.toMatch(/NOT saved/);
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
  it("limits each email to LOCAL_LIMIT.perEmail and everyone to LOCAL_LIMIT.global per window", async () => {
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
  it("the global brake is 15 per 10 minutes and each IP gets 3 per hour", () => {
    expect(LOCAL_LIMIT).toMatchObject({ global: 15, windowMs: 10 * 60_000, perIp: 3, ipWindowMs: 60 * 60_000 });
  });
  it("enforce: limits each IP to LOCAL_LIMIT.perIp per hour, however often the email changes, without touching other visitors", async () => {
    const t = setup({ ipLimit: "enforce" });
    const ip = "198.51.100.7";
    for (let i = 0; i < LOCAL_LIMIT.perIp; i++) expect((await t.handle({ ...FORM, email: `s${i}@example.com` }, ip)).status).toBe(201);
    expect((await t.handle({ ...FORM, email: "fresh@example.com" }, ip)).status).toBe(429);
    expect(t.saved).toHaveLength(LOCAL_LIMIT.perIp);
    expect(t.mails).toHaveLength(LOCAL_LIMIT.perIp);
    // Another visitor is unaffected.
    expect((await t.handle({ ...FORM, email: "real@example.com" }, "198.51.100.8")).status).toBe(201);
    // Past the 10-minute window the IP is still held; past the hour it is free again.
    t.tick(LOCAL_LIMIT.windowMs + 1);
    expect((await t.handle({ ...FORM, email: "again@example.com" }, ip)).status).toBe(429);
    t.tick(LOCAL_LIMIT.ipWindowMs);
    expect((await t.handle({ ...FORM, email: "again@example.com" }, ip)).status).toBe(201);
  });
  it("an IPv6 visitor is one bucket per /56 (as Ayla's brain counts), however the address rotates inside it", async () => {
    const t = setup({ ipLimit: "enforce" });
    for (let i = 0; i < LOCAL_LIMIT.perIp; i++) expect((await t.handle({ ...FORM, email: `v${i}@example.com` }, `2001:db8:aa:bb0${i}::${i + 1}`)).status).toBe(201);
    expect((await t.handle({ ...FORM, email: "v9@example.com" }, "2001:db8:aa:bbff::99")).status).toBe(429);
    expect((await t.handle({ ...FORM, email: "w@example.com" }, "2001:db8:aa:cc00::1")).status).toBe(201);
  });
  it("a refused request (bad form or over the limit) does not use up the IP's allowance", async () => {
    const t = setup({ ipLimit: "enforce" });
    const ip = "198.51.100.9";
    expect((await t.handle({ ...FORM, email: "nope" }, ip)).status).toBe(400);
    for (let i = 0; i < LOCAL_LIMIT.perIp; i++) expect((await t.handle({ ...FORM, email: `k${i}@example.com` }, ip)).status).toBe(201);
  });
  it("AYLA_SITE_IP_LIMIT is off, observe or enforce; unset or anything else is observe", () => {
    expect(ipLimitModeFromEnv(undefined)).toBe("observe");
    expect(ipLimitModeFromEnv("")).toBe("observe");
    expect(ipLimitModeFromEnv(" Enforce ")).toBe("enforce");
    expect(ipLimitModeFromEnv("off")).toBe("off");
    expect(ipLimitModeFromEnv("observe")).toBe("observe");
    expect(ipLimitModeFromEnv("enfroce")).toBe("observe");
  });
  it("observe (the default): the per-IP limit never refuses; each time it would have, one line and no address", async () => {
    const t = setup();
    const ip = "198.51.100.7";
    for (let i = 0; i < LOCAL_LIMIT.perIp + 2; i++) expect((await t.handle({ ...FORM, email: `o${i}@example.com` }, ip)).status).toBe(201);
    expect(t.saved).toHaveLength(LOCAL_LIMIT.perIp + 2);
    expect(t.logs).toHaveLength(2);
    for (const l of t.logs) {
      expect(l).toMatch(/^\[ayla-voice\] ip-limit observe: would have refused/);
      expect(l).not.toContain("198.51.100");
      expect(l).not.toContain("@");
    }
  });
  it("observe and off: the global brake and the per-email limit still refuse", async () => {
    for (const ipLimit of ["observe", "off"] as const) {
      const t = setup({ ipLimit });
      for (let i = 0; i < LOCAL_LIMIT.perEmail; i++) expect((await t.handle(FORM, "198.51.100.1")).status).toBe(201);
      expect((await t.handle(FORM, "198.51.100.1")).status).toBe(429);
      const u = setup({ ipLimit });
      for (let i = 0; i < LOCAL_LIMIT.global; i++) expect((await u.handle({ ...FORM, email: `g${i}@example.com` })).status).toBe(201);
      expect((await u.handle({ ...FORM, email: "late@example.com" })).status).toBe(429);
    }
  });
  it("off: no per-IP limit and no observe lines", async () => {
    const t = setup({ ipLimit: "off" });
    for (let i = 0; i < LOCAL_LIMIT.perIp + 2; i++) expect((await t.handle({ ...FORM, email: `f${i}@example.com` }, "198.51.100.7")).status).toBe(201);
    expect(t.logs).toEqual([]);
  });
  it("an unknown address is never one shared per-IP bucket, in enforce or observe", async () => {
    for (const ipLimit of ["enforce", "observe"] as const) {
      const t = setup({ ipLimit });
      for (let i = 0; i < LOCAL_LIMIT.perIp + 2; i++) expect((await t.handle({ ...FORM, email: `u${i}@example.com` }, UNKNOWN_IP)).status).toBe(201);
      expect(t.logs).toEqual([]);
    }
  });
  it("a database failure is a 503 and sends no email", async () => {
    const t = setup({ saveFails: true });
    expect((await t.handle(FORM)).status).toBe(503);
    expect(t.mails).toEqual([]);
  });
});
