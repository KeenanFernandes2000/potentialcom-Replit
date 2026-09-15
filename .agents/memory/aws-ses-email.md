---
name: AWS SES region
description: Region and identity behavior for form notification email delivery through AWS SES.
---

AWS SES notifications must use the region where the sender identity or verified sending domain is configured. Exact-address identity lookups may return `NOT_FOUND` even when a verified domain authorizes the send.

**Why:** SES identities are regional, and a successful account credential check in another region does not prove that the configured sender can send there.

**How to apply:** Keep the SES region explicit through `AWS_REGION` or `AWS_DEFAULT_REGION`, and verify delivery with a labeled send test after changing the region.