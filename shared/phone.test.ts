// shared/phone.test.ts
import { describe, expect, it } from "vitest";
import { joinPhone } from "./phone";
import { joinPhone as serverJoinPhone } from "../server/phone";

describe("joinPhone (shared)", () => {
  it("is the server's function, now usable by the client", () => {
    expect(joinPhone("+971", "0544043860")).toBe("+971 544043860");
    expect(joinPhone("+971", "+971 54 404 3860")).toBe("+971 54 404 3860");
    expect(joinPhone("", "")).toBeUndefined();
    expect(serverJoinPhone).toBe(joinPhone);
  });
});
