// client/src/lib/aylaVoice/form.test.ts
import { describe, expect, it } from "vitest";
import { phoneProblem, voiceFormFrom, websiteProblem, websiteValue, type AylaFormValues } from "./form";

const V: AylaFormValues = {
  firstName: " Mona ", lastName: "Haddad", email: " mona@example.com ", countryCode: "+971", phoneNumber: "0544043860",
  companyName: "Acme Learning", companyWebsite: "https://", role: "Head of L&D",
};

describe("phoneProblem", () => {
  it("no phone is fine; a local number needs a country code; an international one does not", () => {
    expect(phoneProblem("", "")).toBeNull();
    expect(phoneProblem("+971", "054 404 3860")).toBeNull();
    expect(phoneProblem("", "+971 54 404 3860")).toBeNull();
    expect(phoneProblem("", "00971544043860")).toBeNull();
    expect(phoneProblem("", "0544043860")).toEqual({ field: "countryCode", message: "Please select a country code" });
    expect(phoneProblem("+971", "call me")).toEqual({ field: "phoneNumber", message: "Please enter a valid phone number" });
  });
});

describe("the website box", () => {
  it("its lone https:// is empty; a URL must be http(s)", () => {
    expect(websiteValue("https://")).toBe("");
    expect(websiteValue(" https://acme.example ")).toBe("https://acme.example");
    expect(websiteProblem("https://")).toBeNull();
    expect(websiteProblem("")).toBeNull();
    expect(websiteProblem("https://acme.example")).toBeNull();
    expect(websiteProblem("javascript:alert(1)")).toBe("Please enter a valid website URL");
    expect(websiteProblem("acme")).toBe("Please enter a valid website URL");
  });
});

describe("voiceFormFrom", () => {
  it("trims, keeps the country code with the phone (the old bug), and leaves out what was not given", () => {
    expect(voiceFormFrom(V)).toEqual({ firstName: "Mona", lastName: "Haddad", email: "mona@example.com", organisation: "Acme Learning", role: "Head of L&D", phone: "+971 544043860" });
    expect(voiceFormFrom({ ...V, phoneNumber: "", companyWebsite: "https://acme.example" })).toEqual({
      firstName: "Mona", lastName: "Haddad", email: "mona@example.com", organisation: "Acme Learning", role: "Head of L&D", website: "https://acme.example",
    });
  });
});
