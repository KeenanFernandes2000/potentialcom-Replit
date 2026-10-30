---
name: CRM contact and consent policy
description: Approved CRM scope for account data, lead forms, AI conversations, and consent.
---
Website account signups should create or enrich CRM contacts. Profile edits should only fill empty CRM fields, not overwrite existing CRM data. A signup alone is not a sales enquiry or newsletter subscription. Never send passwords, login activity, password resets, or security tokens.

**Why:** The user approved this recommendation when connecting the new CRM, to capture useful contact information without replacing sales-managed data or mixing account creation with marketing consent.

**How to apply:** Keep lead intent and explicit newsletter consent distinct from account/contact enrichment. Follow the supplied CRM intake contract, including its rules protecting unsubscribed contacts.

AI conversation leads and remaining scheduler replacements are in scope. Preserve Ayla's immediate call startup and existing assistant behavior.

**Why:** The user explicitly included AI leads, while the existing Ayla conversion flow is protected. Development work must not change the live saved assistant's existing voice, prompt, or tools.

**How to apply:** Prefer additive, per-call CRM tooling and server-only credentials. A CRM capture problem must be visible without preventing Ayla's already-submitted enquiry from starting its call.
