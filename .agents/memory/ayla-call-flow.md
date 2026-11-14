---
name: Protect Ayla call flow
description: Constraint for any future edits to the Ayla page and its conversion experience.
---

Do not rebuild, simplify, replace, or otherwise alter the Ayla form, its fields, submission behavior, backend integration, or the immediate AI voice-call startup after a successful submission, unless Mamoon asks. Surrounding page copy and presentation may be refined without touching that flow.

**The flow (since 14 Nov 2026, Mamoon's decision):** a short form (first and last name, work email, organisation, role; phone with its country code and website optional), then the call starts at once. Two engines, chosen by `VITE_AYLA_VOICE_ENGINE`, a tester's `?ayla_voice=brain|vapi`, and the server's `GET /api/ayla/voice/status` (`client/src/lib/aylaVoice/engine.ts`):
- **Brain (Ayla's own server, agents.potential.com):** the form goes to `POST /api/ayla/voice/intake`, which saves the CRM contact (channel Voice) before the call. The site keeps its own `ayla_consultations` row and team email through `/api/ayla/voice-consultation`, which never reaches the CRM intake (one CRM contact, not two). The honeypot is checked on the site. The call is WebRTC, audio only (`AylaVoiceModal.tsx`), with the microphone granted before the call is created; panels (code, booking, demos) and captions come from the server's event stream.
- **Vapi (the rollback, kept for the first week):** the form posts to `/api/ayla/consultation` (CRM intake, campaign `website-ayla`), then `AylaCallModal.tsx`. The brain path falls back to this when Ayla's server is unavailable or unreachable.

**Why:** The immediate voice conversation is an intentional and required part of the conversion experience, not a standard lead form that can be safely replaced.

**How to apply:** For Ayla page work, isolate and preserve the complete form-to-call path. Do not add a second form, booking widget, qualification score, or competing conversion flow. Call and submission logic belongs in `client/src/lib/aylaVoice/` with bun tests (`bun test client/src/lib/aylaVoice`).
