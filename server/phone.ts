/**
 * The forms send a country-code dropdown and a separate number box. Visitors
 * often type the full international number in the box as well ("+971 54…"),
 * which used to become "+971 +971 54…": not a valid number, so the CRM could
 * not match it to the caller. A number typed with + or 00 is taken as already
 * international; otherwise the dropdown code is used, and the national trunk
 * 0 (054… in the UAE) is dropped, as it is never dialled after a country code.
 */
export function joinPhone(countryCode: unknown, phoneNumber: unknown): string | undefined {
  const number = typeof phoneNumber === "string" ? phoneNumber.trim() : "";
  if (!number) return undefined;
  if (number.startsWith("+")) return number;
  if (number.startsWith("00")) return `+${number.slice(2).trimStart()}`;
  const code = typeof countryCode === "string" ? countryCode.trim() : "";
  if (!code) return number;
  const local = number.replace(/^0+(?=\d)/, "");
  return `${code.startsWith("+") ? code : `+${code.replace(/\D/g, "")}`} ${local}`;
}
