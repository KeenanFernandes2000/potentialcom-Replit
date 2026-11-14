// server/client-ip.test.ts
import { describe, expect, it } from "vitest";
import { UNKNOWN_IP, clientIp, ipLimitKey, isPrivateAddress } from "./client-ip";

const req = (remote: string | undefined, xff?: string | string[]) => ({
  headers: xff === undefined ? {} : { "x-forwarded-for": xff },
  socket: { remoteAddress: remote },
});

describe("isPrivateAddress (the platform's own proxy hops)", () => {
  it("knows loopback, link-local and private ranges, and nothing else", () => {
    for (const ip of ["10.0.1.5", "172.18.0.3", "192.168.1.1", "127.0.0.1", "169.254.1.1", "::1", "fd12::1", "fe80::1", "::ffff:10.0.0.2"]) {
      expect(isPrivateAddress(ip)).toBe(true);
    }
    for (const ip of ["8.8.8.8", "172.32.0.1", "2001:db8::1", "::ffff:1.2.3.4"]) {
      expect(isPrivateAddress(ip)).toBe(false);
    }
  });
});

describe("clientIp (the visitor's address, as the proxy saw it)", () => {
  it("takes the first public address from the right, never what the visitor wrote further left", () => {
    expect(clientIp(req("169.254.8.1", "6.6.6.6, 203.0.113.9, 10.1.2.3"), undefined)).toBe("203.0.113.9");
    expect(clientIp(req("169.254.8.1", ["6.6.6.6", "203.0.113.9"]), undefined)).toBe("203.0.113.9");
  });
  it("a visitor who prepends a fake address gets the same key as without it", () => {
    expect(clientIp(req("169.254.8.1", "1.1.1.1, 203.0.113.9"), undefined)).toBe(clientIp(req("169.254.8.1", "203.0.113.9"), undefined));
  });
  it("ignores the header when the peer is not one of our proxies (a public socket address is the visitor)", () => {
    expect(clientIp(req("203.0.113.9", "6.6.6.6"), undefined)).toBe("203.0.113.9");
  });
  it("uses the socket address when nothing is forwarded", () => {
    expect(clientIp(req("203.0.113.9"), undefined)).toBe("203.0.113.9");
    expect(clientIp(req(undefined), undefined)).toBe("unknown");
  });
  it("trusts exactly TRUST_PROXY_HOPS proxies when set (e.g. a public load balancer in the chain)", () => {
    expect(clientIp(req("169.254.8.1", "6.6.6.6, 203.0.113.9, 34.110.1.1"), 2)).toBe("203.0.113.9");
    expect(clientIp(req("169.254.8.1", "203.0.113.9"), 1)).toBe("203.0.113.9");
  });
  it("TRUST_PROXY_HOPS longer than the real chain gives the fixed sentinel, never the leftmost (visitor-written) entry", () => {
    expect(clientIp(req("169.254.8.1", "6.6.6.6, 203.0.113.9"), 5)).toBe(UNKNOWN_IP);
    expect(clientIp(req("169.254.8.1"), 1)).toBe(UNKNOWN_IP);
    expect(UNKNOWN_IP).toBe("unknown");
  });
});

describe("ipLimitKey (the per-IP limit's bucket, as Ayla's brain keys it: express-rate-limit ipKeyGenerator, IPv6 by /56)", () => {
  it("groups an IPv6 visitor by /56, so rotating addresses inside their prefix stays one bucket", () => {
    expect(ipLimitKey("2001:db8:aa:bb12:1:2:3:4")).toBe("2001:db8:aa:bb00::/56");
    expect(ipLimitKey("2001:db8:aa:bbff::9")).toBe("2001:db8:aa:bb00::/56");
    expect(ipLimitKey("2001:DB8:AA:BB12::1")).toBe("2001:db8:aa:bb00::/56");
    expect(ipLimitKey("2001:db8:aa:cc00::1")).toBe("2001:db8:aa:cc00::/56");
    expect(ipLimitKey("2001:0:0:12::1")).toBe("2001::/56");
    expect(ipLimitKey("fe80::1%eth0")).toBe("fe80::/56");
  });
  it("leaves IPv4 (and IPv4-mapped IPv6) as the plain address, and the sentinel as it is", () => {
    expect(ipLimitKey("203.0.113.9")).toBe("203.0.113.9");
    expect(ipLimitKey("::ffff:203.0.113.9")).toBe("203.0.113.9");
    expect(ipLimitKey(UNKNOWN_IP)).toBe(UNKNOWN_IP);
    expect(ipLimitKey("not-an-address")).toBe("not-an-address");
  });
});
