// shared/ayla-consultation.test.ts
import { describe, expect, it } from "vitest";
import { aylaConsultationSchema } from "./schema";

const BASE = { firstName: "Mona", lastName: "Haddad", email: "mona@example.com", companyName: "Acme Learning", role: "Head of L&D" };

describe("aylaConsultationSchema (14 Nov: the short form)", () => {
  it("accepts the form without a phone (empty strings: the columns stay NOT NULL) and without a website", () => {
    const v = aylaConsultationSchema.parse(BASE);
    expect(v.phoneNumber).toBe("");
    expect(v.countryCode).toBe("");
  });
  it("keeps a phone with its country code as before", () => {
    expect(aylaConsultationSchema.parse({ ...BASE, phoneNumber: "544043860", countryCode: "+971", companyWebsite: "https://acme.example" })).toMatchObject({
      phoneNumber: "544043860", countryCode: "+971", companyWebsite: "https://acme.example",
    });
  });
  it("still requires the names, the email, the organisation and the role", () => {
    for (const k of ["firstName", "lastName", "email", "companyName", "role"] as const) {
      const { [k]: _gone, ...rest } = BASE;
      expect(aylaConsultationSchema.safeParse(rest).success).toBe(false);
    }
  });
});
