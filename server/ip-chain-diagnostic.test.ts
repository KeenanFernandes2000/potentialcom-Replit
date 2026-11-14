// server/ip-chain-diagnostic.test.ts
import { describe, expect, it } from "vitest";
import { IP_CHAIN_LOG_EVERY_MS, IP_CHAIN_SAMPLES, createIpChainDiagnostic } from "./ip-chain-diagnostic";

const req = (remote: string | undefined, xff?: string) => ({
  headers: xff === undefined ? {} : { "x-forwarded-for": xff },
  socket: { remoteAddress: remote },
});

function setup() {
  const logs: string[] = [];
  let now = 5_000_000;
  const d = createIpChainDiagnostic({ now: () => now, log: (l) => logs.push(l), hops: () => undefined });
  return { d, logs, tick: (ms: number) => (now += ms) };
}

describe("the ip-chain diagnostic (the shape of X-Forwarded-For, never an address)", () => {
  it("logs the first request's chain shape, right to left, and the socket's class", () => {
    const t = setup();
    t.d.observe(req("169.254.8.1", "6.6.6.6, 203.0.113.9, 10.0.0.1"));
    expect(t.logs).toEqual([
      "[ayla-voice] ip-chain xff_entries=3 right_to_left=private,public,public remote=link-local rightmost_public_distinct=1 of last 1 requests trust_proxy_hops=unset",
    ]);
  });
  it("never puts an address in the line", () => {
    const t = setup();
    t.d.observe(req("34.111.179.208", "198.51.100.23, 34.111.179.208"));
    expect(t.logs[0]).not.toMatch(/\d+\.\d+\.\d+\.\d+|::/);
  });
  it("then at most once an hour, counting how many different rightmost public entries the recent requests had", () => {
    const t = setup();
    t.d.observe(req("10.0.0.2", "198.51.100.1, 34.111.179.208"));
    t.d.observe(req("10.0.0.2", "198.51.100.2, 34.111.179.208"));
    t.d.observe(req("10.0.0.2", "198.51.100.3, 34.111.179.208"));
    expect(t.logs).toHaveLength(1);
    t.tick(IP_CHAIN_LOG_EVERY_MS);
    t.d.observe(req("10.0.0.2", "198.51.100.4, 34.111.179.208"));
    expect(t.logs).toHaveLength(2);
    // Four visitors, one rightmost public value: the platform's own load balancer is in the chain.
    expect(t.logs[1]).toContain("rightmost_public_distinct=1 of last 4 requests");
    t.d.observe(req("10.0.0.2", "198.51.100.5"));
    t.tick(IP_CHAIN_LOG_EVERY_MS);
    t.d.observe(req("10.0.0.2", "198.51.100.6"));
    expect(t.logs[2]).toContain("rightmost_public_distinct=3 of last 6 requests");
  });
  it("keeps only the last IP_CHAIN_SAMPLES requests", () => {
    const t = setup();
    for (let i = 0; i < IP_CHAIN_SAMPLES + 10; i++) t.d.observe(req("10.0.0.2", `198.51.100.${i}`));
    t.tick(IP_CHAIN_LOG_EVERY_MS);
    t.d.observe(req("10.0.0.2", "198.51.100.200"));
    expect(t.logs[1]).toContain(`rightmost_public_distinct=${IP_CHAIN_SAMPLES} of last ${IP_CHAIN_SAMPLES} requests`);
  });
  it("no header, a missing socket address, a long chain and TRUST_PROXY_HOPS", () => {
    const logs: string[] = [];
    const d = createIpChainDiagnostic({ now: () => 0, log: (l) => logs.push(l), hops: () => 2 });
    d.observe(req(undefined));
    expect(logs[0]).toBe("[ayla-voice] ip-chain xff_entries=0 right_to_left=- remote=invalid rightmost_public_distinct=0 of last 1 requests trust_proxy_hops=2");
    const long = createIpChainDiagnostic({ now: () => 0, log: (l) => logs.push(l), hops: () => undefined });
    long.observe(req("10.0.0.2", Array.from({ length: 12 }, (_, i) => `198.51.100.${i}`).join(", ")));
    expect(logs[1]).toContain("xff_entries=12 right_to_left=public,public,public,public,public,public,public,public,+4 more ");
  });
});
