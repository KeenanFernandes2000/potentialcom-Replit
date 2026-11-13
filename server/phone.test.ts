import { describe, expect, it } from "vitest";
import { joinPhone } from "./phone";
describe("joinPhone", () => {
  it.each([
    ["+971", "544043860", "+971 544043860"],
    ["+971", "0544043860", "+971 544043860"],
    ["+971", "+971 54 404 3860", "+971 54 404 3860"],
    ["+971", "00971 54 404 3860", "+971 54 404 3860"],
    ["+91", "9123456789", "+91 9123456789"],
    ["+1", "(608) 795-5156", "+1 (608) 795-5156"],
    ["", "054 404 3860", "054 404 3860"],
    ["+971", "  ", undefined],
    [undefined, undefined, undefined],
  ])("joins %j and %j as %j", (code, number, expected) => {
    expect(joinPhone(code, number)).toBe(expected);
  });
});
