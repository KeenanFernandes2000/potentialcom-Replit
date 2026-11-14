// server/client-ip.ts
import type { IncomingMessage } from "node:http";

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
