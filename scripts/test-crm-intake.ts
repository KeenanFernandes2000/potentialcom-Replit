// Creates one clearly labelled, non-subscribed test contact and checks dedupe.
// No credentials, visitor data, or raw CRM responses are logged.
import { randomUUID } from "node:crypto";
import { deliverCrmLead } from "../server/crm-intake";

const submissionId = randomUUID();
const lead = {
  email: `test+potential-website-${submissionId}@example.com`,
  firstName: "Website Integration",
  lastName: "Test",
  campaign: "website-integration-test",
  message: "Automated integration verification; not a real enquiry.",
  fields: { integrationTest: true },
  newsletter: false,
  hp: "",
  submissionId,
};
const first = await deliverCrmLead(lead);
const repeated = await deliverCrmLead(lead);
if (first.status !== "accepted" || repeated.status !== "duplicate") {
  throw new Error("CRM did not return the expected accepted/duplicate acknowledgement.");
}
console.log(JSON.stringify({ first: first.status, repeated: repeated.status, newsletter: false }));
