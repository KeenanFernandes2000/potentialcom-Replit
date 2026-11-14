// server/ip-chain-diagnostic.ts
import type { IncomingMessage } from "node:http";
import { classifyAddress } from "./client-ip";

// The per-IP limit is only right if clientIp() picks the visitor out of the
// X-Forwarded-For chain the platform builds, and we can't see Replit's chain
// from outside. This logs its shape, never an address: on the first request
// after the process starts, then at most once an hour. If the rightmost public
// entry is the same across many requests, that entry is the platform's own
// load balancer, and TRUST_PROXY_HOPS must skip it before AYLA_SITE_IP_LIMIT
// goes to enforce.

export const IP_CHAIN_LOG_EVERY_MS = 60 * 60_000;
/** Recent requests whose rightmost public entry is remembered (in memory only, never logged). */
export const IP_CHAIN_SAMPLES = 50;
const MAX_POSITIONS = 8;
/** Sample counts that log at once, so the answer arrives without waiting an hour. */
const MILESTONES = new Set([5, 20, IP_CHAIN_SAMPLES]);

type Req = { headers: IncomingMessage["headers"]; socket: { remoteAddress?: string } };

export interface IpChainDiagnosticDeps {
  now(): number;
  log(line: string): void;
  /** TRUST_PROXY_HOPS as clientIp() reads it, for the line only. */
  hops(): number | undefined;
}

export function createIpChainDiagnostic(d: IpChainDiagnosticDeps) {
  let lastLogAt: number | undefined;
  const recent: Array<string | null> = [];
  // Each recent chain right to left (in memory only, never logged): per position,
  // the visitor's slot varies between requests and the platform's own hops do not.
  const chains: string[][] = [];
  let seen = 0;
  return {
    observe(req: Req): void {
      const header = req.headers["x-forwarded-for"];
      const entries = (Array.isArray(header) ? header.join(",") : header ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const classes = entries.map(classifyAddress).reverse();
      const rightmostPublic = [...entries].reverse().find((e) => classifyAddress(e) === "public") ?? null;
      recent.push(rightmostPublic);
      if (recent.length > IP_CHAIN_SAMPLES) recent.shift();
      chains.push([...entries].reverse());
      if (chains.length > IP_CHAIN_SAMPLES) chains.shift();
      seen++;

      const now = d.now();
      const milestone = MILESTONES.has(seen);
      if (!milestone && lastLogAt !== undefined && now - lastLogAt < IP_CHAIN_LOG_EVERY_MS) return;
      lastLogAt = now;
      const distinct = new Set(recent.filter((v): v is string => v !== null)).size;
      const shown = classes.slice(0, MAX_POSITIONS);
      const more = classes.length > MAX_POSITIONS ? [`+${classes.length - MAX_POSITIONS} more`] : [];
      const positions = classes.length ? [...shown, ...more].join(",") : "-";
      const hops = d.hops();
      const width = Math.min(MAX_POSITIONS, Math.max(0, ...chains.map((c) => c.length)));
      const byPosition = Array.from({ length: width }, (_, i) => new Set(chains.map((c) => c[i]).filter((v): v is string => !!v)).size);
      d.log(
        `[ayla-voice] ip-chain xff_entries=${entries.length} right_to_left=${positions} ` +
          `remote=${classifyAddress(req.socket.remoteAddress ?? "")} ` +
          `rightmost_public_distinct=${distinct} of last ${recent.length} requests ` +
          `trust_proxy_hops=${hops === undefined ? "unset" : hops} ` +
          `distinct_by_position=${byPosition.length ? byPosition.join(",") : "-"}`,
      );
    },
  };
}
