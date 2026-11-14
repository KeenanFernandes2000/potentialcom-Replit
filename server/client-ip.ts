// server/client-ip.ts
import type { IncomingMessage } from "node:http";
import { isIPv6 } from "node:net";

// The visitor's address, for per-visitor limits. The site sets no Express
// `trust proxy` (that would also change req.protocol and req.secure for every
// route), so routes that need the address call this instead. It is the same
// rule Ayla's server uses (potential-ai src/lib/clientIp.ts) and Express's own
// `trust proxy` walk: read X-Forwarded-For from the right, past the platform's
// own proxies (private, loopback and link-local addresses), and take the first
// address they didn't add. Anything further left was written by the visitor and
// is never used. TRUST_PROXY_HOPS fixes the number of trusted hops instead,
// for a chain with a public load balancer in it. When TRUST_PROXY_HOPS is
// longer than the chain that arrived, the answer is UNKNOWN_IP, never the
// leftmost entry (which the visitor wrote); callers must not use UNKNOWN_IP as
// one shared per-IP bucket.

/** The fixed answer when the visitor's address cannot be known. */
export const UNKNOWN_IP = "unknown";

const PRIVATE_V4 = [/^10\./, /^127\./, /^169\.254\./, /^192\.168\./, /^172\.(1[6-9]|2\d|3[01])\./];

/** Loopback, link-local or private (RFC 1918 / IPv6 ULA) address. */
export function isPrivateAddress(raw: string): boolean {
  const ip = raw.trim().toLowerCase().replace(/^::ffff:/, "");
  if (PRIVATE_V4.some((re) => re.test(ip))) return true;
  if (ip === "::1") return true;
  return /^f[cd][0-9a-f]{0,2}:/.test(ip) || /^fe[89ab][0-9a-f]?:/.test(ip);
}

function envHops(): number | undefined {
  const v = process.env.TRUST_PROXY_HOPS;
  if (!v) return undefined;
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 ? n : undefined;
}

/** The client address of a request; `hops` mirrors TRUST_PROXY_HOPS. */
export function clientIp(
  req: { headers: IncomingMessage["headers"]; socket: { remoteAddress?: string } },
  hops: number | undefined = envHops(),
): string {
  const remote = req.socket.remoteAddress ?? UNKNOWN_IP;
  const header = req.headers["x-forwarded-for"];
  const forwarded = (Array.isArray(header) ? header.join(",") : header ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const chain = [...forwarded, remote];
  if (hops !== undefined) {
    const at = chain.length - 1 - hops;
    return at >= 0 ? chain[at]! : UNKNOWN_IP;
  }
  for (let i = chain.length - 1; i > 0; i--) {
    if (!isPrivateAddress(chain[i]!)) return chain[i]!;
  }
  return chain[0]!;
}

/** The 8 groups of an IPv6 address (zone id dropped), or null. */
function ipv6Groups(raw: string): number[] | null {
  const ip = raw.split("%")[0]!.toLowerCase();
  if (!isIPv6(ip)) return null;
  let text = ip;
  // A trailing dotted IPv4 part becomes two groups.
  const v4 = /(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(text);
  if (v4) {
    const [a, b, c, d] = v4.slice(1).map(Number) as [number, number, number, number];
    text = text.slice(0, v4.index) + ((a << 8) | b).toString(16) + ":" + ((c << 8) | d).toString(16);
  }
  const [head, tail] = text.includes("::") ? text.split("::") : [text, undefined];
  const part = (s: string | undefined) => (s ? s.split(":").map((g) => parseInt(g, 16)) : []);
  const h = part(head);
  const t = part(tail);
  const groups = tail === undefined ? h : [...h, ...Array(8 - h.length - t.length).fill(0), ...t];
  return groups.length === 8 && groups.every((g) => g >= 0 && g <= 0xffff) ? groups : null;
}

/** RFC 5952 text: lowercase, no leading zeros, the longest run of 2+ zero groups as "::". */
function ipv6Text(groups: number[]): string {
  let best = -1;
  let bestLen = 1;
  for (let i = 0; i < 8; ) {
    let j = i;
    while (j < 8 && groups[j] === 0) j++;
    if (j - i > bestLen) [best, bestLen] = [i, j - i];
    i = j === i ? i + 1 : j;
  }
  const hex = groups.map((g) => g.toString(16));
  if (best < 0) return hex.join(":");
  return `${hex.slice(0, best).join(":")}::${hex.slice(best + bestLen).join(":")}`;
}

/**
 * The per-IP limit's bucket for an address, the way Ayla's brain keys its own
 * limits (express-rate-limit's ipKeyGenerator): IPv6 by its /56 prefix, so a
 * visitor can't rotate addresses inside the block their provider gave them;
 * IPv4 and IPv4-mapped IPv6 as the plain IPv4 address. Anything else
 * (UNKNOWN_IP included) is returned unchanged.
 */
export function ipLimitKey(ip: string): string {
  const groups = ipv6Groups(ip);
  if (!groups) return ip;
  if (groups.slice(0, 5).every((g) => g === 0) && groups[5] === 0xffff) {
    return [groups[6]! >> 8, groups[6]! & 0xff, groups[7]! >> 8, groups[7]! & 0xff].join(".");
  }
  const masked = [groups[0]!, groups[1]!, groups[2]!, groups[3]! & 0xff00, 0, 0, 0, 0];
  return `${ipv6Text(masked)}/56`;
}
