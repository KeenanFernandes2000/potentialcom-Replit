# Ayla — assistant changes to apply in Vapi

Assistant `32d7022b-8c96-4498-bd94-60dfd4171e4f` ("Ayla - Empowerment Advisor").
Nothing here has been applied — the website side is done and waiting on it.

Run the curls with `VAPI_PRIVATE_KEY` in the environment, or make the same edits
in the Vapi dashboard.

## Why

| Symptom | Cause |
| --- | --- |
| The booking panel almost never opens | `showBookingForm` is attached, but the prompt never tells her to call it — it tells her to say "book at www.potential.com", to a visitor who is already on potential.com |
| "Create a chatbot / voice agent" never happens | The website has the full UI and both handlers, but **no such tools exist** on the assistant, so the model can't trigger them |
| Calls cut off mid-discovery | `maxDurationSeconds: 180` against an 8-phase consultative script |

## 1. Create the two missing tools

Client-side tools are declared by **omitting a server URL**; the browser receives
them as a `tool-calls` message. They are one-way — the model never sees a result —
so the page narrates the outcome back with `say()`. `showBookingForm` already
works exactly this way; these two copy it.

```bash
curl -X POST https://api.vapi.ai/tool \
  -H "Authorization: Bearer $VAPI_PRIVATE_KEY" -H "Content-Type: application/json" \
  -d '{
    "type": "function",
    "async": true,
    "function": {
      "name": "CreateChatbot",
      "description": "Opens the chatbot builder on screen so the visitor can name and create their own AI chatbot. Call this only when the visitor has agreed they want one.",
      "parameters": { "type": "object", "properties": {}, "required": [] }
    }
  }'
```

```bash
curl -X POST https://api.vapi.ai/tool \
  -H "Authorization: Bearer $VAPI_PRIVATE_KEY" -H "Content-Type: application/json" \
  -d '{
    "type": "function",
    "async": true,
    "function": {
      "name": "CreateVoiceAgent",
      "description": "Opens the voice-agent builder on screen so the visitor can name and create their own AI voice agent. Call this only when the visitor has agreed they want one.",
      "parameters": { "type": "object", "properties": {}, "required": [] }
    }
  }'
```

Keep the two returned ids for the next step.

## 2. Patch the assistant

`showBookingForm` is `9a73b8f7-c9ef-4ccd-b805-272ac974cac5`. Add the two new ids
alongside it — `toolIds` replaces the whole array, so all three must be listed.

```bash
curl -X PATCH https://api.vapi.ai/assistant/32d7022b-8c96-4498-bd94-60dfd4171e4f \
  -H "Authorization: Bearer $VAPI_PRIVATE_KEY" -H "Content-Type: application/json" \
  -d '{
    "model": {
      "provider": "google",
      "model": "gemini-3.5-flash",
      "toolIds": [
        "9a73b8f7-c9ef-4ccd-b805-272ac974cac5",
        "<CreateChatbot id>",
        "<CreateVoiceAgent id>"
      ]
    },
    "maxDurationSeconds": 600,
    "clientMessages": [
      "transcript", "tool-calls", "status-update", "hang",
      "speech-update", "conversation-update", "user-interrupted"
    ]
  }'
```

- `maxDurationSeconds: 600` — ten minutes. One of her last 42 calls already died
  on `exceeded-max-duration`.
- `clientMessages` is currently unset, so defaults apply. The site now reads
  `status-update` (to explain *why* a call ended) and `hang` (to show "still
  thinking") — pinning the list makes that explicit rather than luck.
- **A `model` PATCH replaces the object**, so `provider` and `model` are repeated
  above to avoid wiping them. `messages` is left out on purpose: send the prompt
  in the same PATCH (step 3) or leave it untouched.

## 3. Prompt changes

Three edits. Everything else stays.

**(a) Replace PHASE 8 — CALL TO ACTION**

```
## PHASE 8 — CALL TO ACTION

- When the visitor is ready to speak to a person, call the `showBookingForm` tool.
- The booking calendar then appears on their screen, in this window.
- Say that it has appeared and let them pick a time — do not read out a web address.

### Example:
- "The best next step is a short session with one of our consultants — I've put
  the calendar on your screen now."
```

**(b) Add a TOOLS section, after CORE BEHAVIOR RULES**

```
# TOOLS

You can put things directly on the visitor's screen. Use them sparingly and only
after the visitor has agreed.

- `showBookingForm` — shows the booking calendar. Use when they want to talk to a person.
- `CreateChatbot` — shows the chatbot builder. Use only if they say they want to try building one.
- `CreateVoiceAgent` — shows the voice-agent builder. Use only if they say they want to try building one.

After calling a tool:
- Tell them what has just appeared on screen and what to do with it.
- You will NOT be told whether it worked. Wait for the visitor to tell you, and
  ask if nothing is said for a while.
- Never call a tool twice for the same request.
```

**(c) Replace FINAL RULE**

```
# FINAL RULE

- Every conversation should move toward clarity and, when appropriate, toward a
  booked session — which you arrange by calling `showBookingForm`, never by
  reading out a web address.
```

## Do not change

- **The `{{firstName}}` / `{{companyName}}` / `{{role}}` block.** The site passes
  these as `assistantOverrides.variableValues` and her opening turn depends on
  them. Verified: a scoped JWT still delivers them (POST /call/web → 201).
- **`serverMessages`.** Unset means defaults, which include `end-of-call-report` —
  that is what `api.potential.com/api/vapi/hook/server` uses to meter her minutes.
  Setting `clientMessages` alone does not touch it; setting `serverMessages` to a
  list that omits `end-of-call-report` would silently stop her billing data.
- Her voice (`11labs` / `zGjIP4SZlMnY9m93k97r`) and transcriber (`deepgram` /
  `flux-general-multi`).

## After applying

1. `curl -s -H "Authorization: Bearer $VAPI_PRIVATE_KEY" https://api.vapi.ai/assistant/32d7022b-8c96-4498-bd94-60dfd4171e4f` — confirm three `toolIds` and `maxDurationSeconds: 600`.
2. Open `/ayla`, submit the form, and ask her for a session — the calendar should appear in the window.
3. Ask her to build a chatbot — the builder panel should appear.
4. Check `vapicalllogs` afterwards: `endedReason` should no longer be
   `exceeded-max-duration` on a normal conversation.
