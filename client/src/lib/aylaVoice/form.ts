// client/src/lib/aylaVoice/form.ts
import { joinPhone } from "@shared/phone";

// The /ayla form's own rules (14 Nov: a short form; phone and website
// optional) and the form as Ayla's voice call receives it. Dependency-free so
// bun can test it; the page's zod schema calls these.

/** The page's form values (react-hook-form), as the page and /api/ayla/consultation name them. */
export interface AylaFormValues {
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  companyName: string;
  companyWebsite: string;
  role: string;
}

/** The form for POST /api/ayla/voice/session (plan B' parseVoiceForm). Every value is the visitor's claim. */
export interface VoiceForm {
  firstName: string;
  lastName: string;
  email: string;
  organisation: string;
  role: string;
  /** With its country code (joinPhone). */
  phone?: string;
  website?: string;
}

/** What is wrong with the phone fields, and which field shows it; null when fine (no phone is fine). */
export function phoneProblem(countryCode: string, phoneNumber: string): { field: "countryCode" | "phoneNumber"; message: string } | null {
  const n = phoneNumber.trim();
  if (!n) return null;
  if (!/^\+?[\d\s().-]{4,30}$/.test(n)) return { field: "phoneNumber", message: "Please enter a valid phone number" };
  if (!n.startsWith("+") && !n.startsWith("00") && !countryCode.trim()) return { field: "countryCode", message: "Please select a country code" };
  return null;
}

/** The website box's value: its lone "https://" (the default) counts as empty. */
export const websiteValue = (raw: string): string => {
  const t = (raw ?? "").trim();
  return /^https?:\/\/$/i.test(t) ? "" : t;
};

/** What is wrong with the website, or null (empty is fine). */
export function websiteProblem(raw: string): string | null {
  const v = websiteValue(raw);
  if (!v) return null;
  try {
    const u = new URL(v);
    return (u.protocol === "https:" || u.protocol === "http:") && u.hostname.includes(".") ? null : "Please enter a valid website URL";
  } catch {
    return "Please enter a valid website URL";
  }
}

/** The voice call's form: trimmed, the phone joined with its country code, empty optional fields left out. */
export function voiceFormFrom(v: AylaFormValues): VoiceForm {
  const phone = joinPhone(v.countryCode, v.phoneNumber);
  const website = websiteValue(v.companyWebsite);
  return {
    firstName: v.firstName.trim(),
    lastName: v.lastName.trim(),
    email: v.email.trim(),
    organisation: v.companyName.trim(),
    role: v.role.trim(),
    ...(phone ? { phone } : {}),
    ...(website ? { website } : {}),
  };
}
