---
name: Blocked dependency install
description: Why a build can fail to resolve a dependency that is declared in package.json but never installed.
---

When npm install reconciles the full dependency tree, a single package blocked by
the Socket/package-firewall security policy (HTTP 403 from
`package-firewall.replit.local`, reason "Critical CVE") aborts the entire install.
Net effect: other newly-declared dependencies never get installed, and the Vite/Rollup
build later fails with "failed to resolve import X" even though X is in package.json.

**Why:** The blocked package and the missing package can be unrelated (e.g. a blocked
`vitest@2.1.9` devDependency prevented `react-markdown` from installing). The build
error points at the innocent missing package, not the real blocker.

**How to apply:** When a build fails to resolve a dep that IS in package.json,
run the install and read the full output — look for a 403 / "Blocked by Security Policy"
on a *different* package. Fix by moving the blocked package off the flagged version
(e.g. `installLanguagePackages({language:"nodejs", packages:["the-missing-dep","blocked-dep@latest"]})`)
rather than removing it, then re-run `npm run build` to confirm.
