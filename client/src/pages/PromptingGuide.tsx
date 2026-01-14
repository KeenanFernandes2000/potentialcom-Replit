import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AutoSEO } from "@/components/SEO";
import { useEffect } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import { CodeBlockTabs } from "@/components/CodeBlockTabs";
import { Callout } from "@/components/Callout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PromptingGuide = () => {
  // Refresh AOS animations on route change
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).AOS) {
      (window as any).AOS.refresh();
    }
  }, []);

  return (
    <div className="font-inter min-h-screen bg-background">
      <AutoSEO />
      <Header />
      <main className="pt-20 sm:pt-24 lg:pt-32 pb-12 sm:pb-16 lg:pb-20">
        <div className="container max-w-4xl px-4 sm:px-6">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-foreground">
              Prompting Guide
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              System design principles for production-grade conversational AI
            </p>
          </div>

          <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-li:text-foreground">
            {/* Introduction */}
            <section className="mb-8 sm:mb-10 lg:mb-12">
              <p className="text-sm sm:text-base text-foreground mb-4 sm:mb-6">
                Effective prompting transforms AI agents from robotic to lifelike. A system prompt serves as the personality and policy blueprint of your AI agent, defining its role, goals, allowable tools, step-by-step instructions for certain tasks, and guardrails outlining what the agent should not do. The structure of this prompt directly impacts reliability.
              </p>
            </section>

            {/* Prompt Engineering Fundamentals */}
            <section className="mb-8 sm:mb-10 lg:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mt-8 sm:mt-10 lg:mt-12 mb-4 sm:mb-5 lg:mb-6 text-foreground">
                Prompt engineering fundamentals
              </h2>

              <p className="text-xs sm:text-sm text-foreground mb-4 sm:mb-6">
                The following principles form the foundation of production-grade prompt engineering:
              </p>

              {/* Separate Instructions */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold mt-6 sm:mt-8 mb-3 sm:mb-4 text-foreground">
                  Separate instructions into clean sections
                </h3>
                <p className="text-xs sm:text-sm text-foreground mb-3 sm:mb-4">
                  Separating instructions into dedicated sections with markdown headings helps the model prioritize and interpret them correctly. Use whitespace and line breaks to separate instructions.
                </p>
                <p className="text-xs sm:text-sm text-foreground mb-3 sm:mb-4">
                  <strong>Why this matters for reliability:</strong> Models are tuned to pay extra attention to certain headings (especially <code className="bg-muted dark:bg-muted/50 text-foreground px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-border text-xs sm:text-sm"># Guardrails</code>), and clear section boundaries prevent instruction bleed where rules from one context affect another.
                </p>

                <CodeBlockTabs
                  lessEffective={`You are a customer service agent. Be polite and helpful. Never share sensitive data. You can look up orders and process refunds. Always verify identity first. Keep responses under 3 sentences unless the user asks for details.`}
                  recommended={`# Personality

You are a customer service agent for Acme Corp. You are polite, efficient, and solution-oriented.

# Goal

Help customers resolve issues quickly by looking up orders and processing refunds when appropriate.

# Guardrails

Never share sensitive customer data across conversations.
Always verify customer identity before accessing account information.

# Tone

Keep responses concise (under 3 sentences) unless the user requests detailed explanations.`}
                />
              </div>

              {/* Be Concise */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold mt-6 sm:mt-8 mb-3 sm:mb-4 text-foreground">
                  Be as concise as possible
                </h3>
                <p className="text-xs sm:text-sm text-foreground mb-3 sm:mb-4">
                  Keep every instruction short, clear, and action-based. Remove filler words and restate only what is essential for the model to act correctly.
                </p>
                <p className="text-xs sm:text-sm text-foreground mb-3 sm:mb-4">
                  <strong>Why this matters for reliability:</strong> Concise instructions reduce ambiguity and token usage. Every unnecessary word is a potential source of misinterpretation.
                </p>

                <CodeBlockTabs
                  lessEffective={`# Tone

When you're talking to customers, you should try to be really friendly and approachable, making sure that you're speaking in a way that feels natural and conversational, kind of like how you'd talk to a friend, but still maintaining a professional demeanor that represents the company well.`}
                  recommended={`# Tone

Speak in a friendly, conversational manner while maintaining professionalism.`}
                />

                <Callout type="note">
                  <p>
                    If you need the agent to maintain a specific tone, define it explicitly and concisely in the <code className="bg-muted dark:bg-muted/50 px-1 sm:px-1.5 py-0.5 rounded text-[10px] sm:text-xs"># Personality</code> or <code className="bg-muted dark:bg-muted/50 px-1 sm:px-1.5 py-0.5 rounded text-[10px] sm:text-xs"># Tone</code> section. Avoid repeating tone guidance throughout the prompt.
                  </p>
                </Callout>
              </div>

              {/* Emphasize Critical Instructions */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold mt-6 sm:mt-8 mb-3 sm:mb-4 text-foreground">
                  Emphasize critical instructions
                </h3>
                <p className="text-xs sm:text-sm text-foreground mb-3 sm:mb-4">
                  Highlight critical steps by adding "This step is important" at the end of the line. Repeating the most important 1-2 instructions twice in the prompt can help reinforce them.
                </p>
                <p className="text-xs sm:text-sm text-foreground mb-3 sm:mb-4">
                  <strong>Why this matters for reliability:</strong> In complex prompts, models may prioritize recent context over earlier instructions. Emphasis and repetition ensure critical rules aren't overlooked.
                </p>

                <CodeBlockTabs
                  lessEffective={`# Goal

Verify customer identity before accessing their account.
Look up order details and provide status updates.
Process refund requests when eligible.`}
                  recommended={`# Goal

Verify customer identity before accessing their account. This step is important.
Look up order details and provide status updates.
Process refund requests when eligible.

# Guardrails

Never access account information without verifying customer identity first. This step is important.`}
                />
              </div>

              {/* Normalize Inputs and Outputs */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold mt-6 sm:mt-8 mb-3 sm:mb-4 text-foreground">
                  Normalize inputs and outputs
                </h3>
                <p className="text-xs sm:text-sm text-foreground mb-3 sm:mb-4">
                  Voice agents often misinterpret or misformat structured information such as emails, IDs, or record locators. To ensure accuracy, separate (or "normalize") how data is spoken to the user from how it is written when used in tools or APIs.
                </p>
                <p className="text-xs sm:text-sm text-foreground mb-3 sm:mb-4">
                  <strong>Why this matters for reliability:</strong> Text-to-speech models sometimes mispronounce symbols like "@" or "." naturally, for example when an agent speaks "john@company.com" directly. Normalizing to spoken format ("john at company dot com") creates natural, understandable speech while maintaining correct written format for tools.
                </p>

                <CodeBlock
                  title="Recommended approach"
                  code={`# Character normalization

When collecting structured data (emails, phone numbers, confirmation codes):

**Spoken format** (to/from user):

- Email: "john dot smith at company dot com"
- Phone: "five five five... one two three... four five six seven"
- Code: "A B C one two three"

**Written format** (for tools/APIs):

- Email: "john.smith@company.com"
- Phone: "5551234567"
- Code: "ABC123"

Always collect data in spoken format, then convert to written format before passing to tools.

## Example normalization rules

- "@" symbol → spoken as "at", written as "@"
- "." symbol → spoken as "dot", written as "."
- Numbers → spoken individually ("one two three"), written as digits ("123")
- Spaces in codes → spoken with pauses ("A B C"), written without spaces ("ABC")`}
                />

                <Callout type="tip">
                  <p>
                    Add character normalization rules to your system prompt when agents collect emails, phone numbers, confirmation codes, or other structured identifiers that will be passed to tools.
                  </p>
                </Callout>
              </div>


              {/* Dedicate a Guardrails Section */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold mt-6 sm:mt-8 mb-3 sm:mb-4 text-foreground">
                  Dedicate a guardrails section
                </h3>
                <p className="text-xs sm:text-sm text-foreground mb-3 sm:mb-4">
                  List all non-negotiable rules the model must always follow in a dedicated <code className="bg-muted dark:bg-muted/50 text-foreground px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-border text-xs sm:text-sm"># Guardrails</code> section. Models are tuned to pay extra attention to this heading.
                </p>
                <p className="text-xs sm:text-sm text-foreground mb-3 sm:mb-4">
                  <strong>Why this matters for reliability:</strong> Guardrails prevent inappropriate responses and ensure compliance with policies. Centralizing them in a dedicated section makes them easier to audit and update.
                </p>

                <CodeBlock
                  title="Recommended approach"
                  code={`# Guardrails

Never share customer data across conversations or reveal sensitive account information without proper verification.
Never process refunds over $500 without supervisor approval.
Never make promises about delivery dates that aren't confirmed in the order system.
Acknowledge when you don't know an answer instead of guessing.
If a customer becomes abusive, politely end the conversation and offer to escalate to a supervisor.`}
                />

                <Callout type="warning">
                  <p>
                    <strong>Critical:</strong> Never allow agents to guess or make up information when they don't know an answer. Always include explicit instructions to acknowledge uncertainty and escalate when needed. This prevents hallucinations and maintains trust.
                  </p>
                </Callout>
              </div>


              {/* Specify Output Format */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold mt-6 sm:mt-8 mb-3 sm:mb-4 text-foreground">
                  Specify output format when needed
                </h3>
                <p className="text-xs sm:text-sm text-foreground mb-3 sm:mb-4">
                  When agents need to return structured data or follow specific formatting, explicitly define the expected output format in your prompt. This ensures consistency and makes parsing easier.
                </p>
                <p className="text-xs sm:text-sm text-foreground mb-3 sm:mb-4">
                  <strong>Why this matters for reliability:</strong> Clear output specifications reduce parsing errors and ensure downstream systems receive data in the expected format. This is critical for tool integrations and data processing.
                </p>

                <CodeBlock
                  title="Recommended approach"
                  code={`# Output format

When summarizing a customer issue, use this format:

**Issue Type:** [one of: technical, billing, shipping, product]
**Severity:** [one of: low, medium, high, critical]
**Summary:** [2-3 sentence description]
**Next Steps:** [action items, one per line]

Example:
**Issue Type:** technical
**Severity:** high
**Summary:** Customer unable to access account after password reset. Multiple login attempts failed.
**Next Steps:**
- Verify account status
- Reset authentication tokens
- Provide temporary access credentials`}
                />
              </div>

              {/* Use Conditional Logic */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold mt-6 sm:mt-8 mb-3 sm:mb-4 text-foreground">
                  Use conditional instructions for dynamic behavior
                </h3>
                <p className="text-xs sm:text-sm text-foreground mb-3 sm:mb-4">
                  Define how the agent should behave differently based on context, user state, or conversation flow. Conditional instructions enable more natural and adaptive interactions.
                </p>
                <p className="text-xs sm:text-sm text-foreground mb-3 sm:mb-4">
                  <strong>Why this matters for reliability:</strong> Conditional logic helps agents handle edge cases and adapt to different scenarios without requiring separate prompts for each situation.
                </p>

                <CodeBlock
                  title="Recommended approach"
                  code={`# Response guidelines

**If the customer is frustrated or upset:**
- Acknowledge their feelings first: "I understand this is frustrating."
- Take ownership: "Let me help resolve this for you."
- Provide clear next steps

**If the customer asks about policy:**
- Quote the exact policy language
- Explain the reasoning behind the policy
- Offer alternatives if available

**If you don't have the information:**
- Acknowledge: "I don't have that information available right now."
- Offer to look it up or escalate
- Never guess or make up information`}
                />
              </div>
            </section>

            {/* Advanced Prompting Techniques */}
            <section className="mb-8 sm:mb-10 lg:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mt-8 sm:mt-10 lg:mt-12 mb-4 sm:mb-5 lg:mb-6 text-foreground">
                Advanced prompting techniques
              </h2>

              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold mt-6 sm:mt-8 mb-3 sm:mb-4 text-foreground">
                  Chain of thought and step-by-step reasoning
                </h3>
                <p className="text-xs sm:text-sm text-foreground mb-3 sm:mb-4">
                  For complex workflows and reasoning tasks, break down the process into explicit steps and instruct the model to show its thinking process. This helps the model follow the correct sequence, reduces errors, and makes decision-making transparent.
                </p>
                <p className="text-xs sm:text-sm text-foreground mb-3 sm:mb-4">
                  <strong>Why this matters for reliability:</strong> Step-by-step instructions help models maintain context across long conversations and ensure critical steps aren't skipped. This is especially important for tasks involving multiple tool calls or decision points.
                </p>

                <CodeBlockTabs
                  lessEffective={`# Goal

Help customers with order issues. Check their order status, verify eligibility, and process refunds if needed.`}
                  recommended={`# Goal

Process customer order issues through this workflow:

1. Greet the customer and collect order number
2. Verify customer identity using order number and email
3. Look up order details with \`getOrderDetails\` tool
4. Assess the issue type (delayed, damaged, wrong item, etc.)
5. Determine resolution path:
   - For eligible refunds: Process with \`processRefund\` tool
   - For ineligible cases: Explain policy and offer alternatives
6. Confirm resolution and provide next steps

# Decision-making process

When determining refund eligibility, follow this reasoning process:

1. **Check order date:** Is the order within the 30-day return window?
   - If no: Explain policy and offer alternatives
   - If yes: Continue to step 2

2. **Verify product type:** Is this a digital download or physical product?
   - If digital: Check if it's eligible for refund (varies by product)
   - If physical: Continue to step 3

3. **Check refund status:** Has this order already been refunded?
   - If yes: Inform customer and provide refund details
   - If no: Continue to step 4

4. **Assess reason:** What is the customer's reason for return?
   - Defective/wrong item: Process refund immediately
   - Changed mind: Verify eligibility based on product category
   - Other: Evaluate case by case

Always explain your reasoning to the customer before taking action.`}
                />
              </div>

              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold mt-6 sm:mt-8 mb-3 sm:mb-4 text-foreground">
                  Few-shot learning with examples
                </h3>
                <p className="text-xs sm:text-sm text-foreground mb-3 sm:mb-4">
                  Include concrete examples of desired behavior directly in your prompt. Show the model exactly how to handle specific scenarios through example interactions, formatting patterns, or data transformations.
                </p>
                <p className="text-xs sm:text-sm text-foreground mb-3 sm:mb-4">
                  <strong>Why this matters for reliability:</strong> Examples provide concrete patterns for the model to follow, reducing ambiguity and improving consistency across similar scenarios. They're especially valuable for complex formatting, multi-step processes, and edge cases.
                </p>

                <CodeBlock
                  title="Recommended approach"
                  code={`# Example interactions

**Example 1: Handling a delayed order**

User: "My order was supposed to arrive yesterday but it hasn't shown up."
You: "I apologize for the delay. Let me check the shipping status for you. Can I get your order number?"
User: "ORD123456"
You: [Calls \`getOrderStatus\` tool]
You: "I see your order is currently in transit and should arrive by tomorrow. I've set up tracking notifications so you'll be updated on its progress. Would you like me to expedite the shipping at no extra cost?"

**Example 2: Handling an ineligible refund**

User: "I want to return this item I bought 45 days ago."
You: "I understand you'd like to return that item. Our return policy allows returns within 30 days of purchase. Since your order is 45 days old, it's outside the return window. However, I can help you with [alternative solution]. Would that work for you?"

# Formatting examples

When a customer provides a confirmation code:

1. Listen for the spoken format (e.g., "A B C one two three")
2. Convert to written format (e.g., "ABC123")
3. Pass to \`lookupReservation\` tool

**Examples:**
- User says: "My code is A... B... C... one... two... three" → You format: "ABC123"
- User says: "X Y Z four five six seven eight" → You format: "XYZ45678"`}
                />
              </div>

              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold mt-6 sm:mt-8 mb-3 sm:mb-4 text-foreground">
                  Role-playing and persona consistency
                </h3>
                <p className="text-xs sm:text-sm text-foreground mb-3 sm:mb-4">
                  Define a clear persona for your agent and maintain consistency throughout the conversation. The persona should align with your brand and the agent's specific role.
                </p>
                <p className="text-xs sm:text-sm text-foreground mb-3 sm:mb-4">
                  <strong>Why this matters for reliability:</strong> A consistent persona helps build trust and ensures the agent behaves predictably. It also helps the model maintain character throughout long conversations.
                </p>

                <CodeBlockTabs
                  lessEffective={`# Personality

Be helpful and professional.`}
                  recommended={`# Personality

You are Sarah, a customer service specialist with 5 years of experience helping customers resolve issues.

**Your communication style:**
- Warm and empathetic, but professional
- Use the customer's name when you know it
- Acknowledge concerns before offering solutions
- Speak in clear, simple language (avoid jargon)

**Your approach:**
- Listen actively to understand the full situation
- Take ownership of problems ("I'll help you resolve this")
- Follow through on commitments
- Escalate when appropriate, but only after trying to help first

**What makes you unique:**
- You remember context from earlier in the conversation
- You anticipate follow-up questions
- You offer proactive solutions, not just reactive responses`}
                />
              </div>
            </section>

            {/* Tool Configuration */}
            <section className="mb-8 sm:mb-10 lg:mb-12">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mt-8 sm:mt-10 lg:mt-12 mb-4 sm:mb-5 lg:mb-6 text-foreground">
                Tool configuration for reliability
              </h2>

              <p className="text-xs sm:text-sm text-foreground mb-4 sm:mb-6">
                Agents capable of handling transactional workflows can be highly effective. To enable this, they must be equipped with tools that let them perform actions in other systems. The following principles ensure reliable tool usage:
              </p>

              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold mt-6 sm:mt-8 mb-3 sm:mb-4 text-foreground">
                  Describe tools with clear usage guidelines
                </h3>
                <p className="text-xs sm:text-sm text-foreground mb-3 sm:mb-4">
                  For each tool, provide a comprehensive description that includes when to use it, required parameters, expected outputs, and error handling procedures.
                </p>

                <CodeBlock
                  title="Recommended approach"
                  code={`## \`processRefund\`

**Purpose:** Process a refund for an eligible order

**When to use:**
- Customer has requested a refund
- Order is within 30-day return window
- Order is eligible (not digital download, not already refunded)
- Refund amount is under $500
- Customer identity has been verified

**Required parameters:**
- \`order_id\` (string): Order identifier from \`verifyIdentity\` step
- \`reason_code\` (string): One of "defective", "wrong_item", "late_delivery", "changed_mind"
- \`amount\` (number): Refund amount in dollars

**Usage steps:**
1. Confirm refund details with customer
2. Wait for customer confirmation
3. Call this tool with all required parameters

**Error handling:**
- If refund fails: "I'm unable to process that refund right now. Let me escalate to a supervisor who can help."
- Never retry without customer permission
- Always explain what went wrong`}
                />
              </div>


              <Callout type="warning">
                <p>
                  <strong>Important:</strong> Always include explicit error handling instructions for every tool. If a tool call fails, the agent should never guess or make up information. Instead, it should acknowledge the failure and offer to retry or escalate.
                </p>
              </Callout>
            </section>

            {/* Common Mistakes */}
            <section className="mb-8 sm:mb-10 lg:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mt-8 sm:mt-10 lg:mt-12 mb-4 sm:mb-5 lg:mb-6 text-foreground">
                Common prompt engineering mistakes
              </h2>

              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold mt-6 sm:mt-8 mb-3 sm:mb-4 text-foreground">
                  Overloading with too many instructions
                </h3>
                <p className="text-xs sm:text-sm text-foreground mb-3 sm:mb-4">
                  Including too many instructions in a single prompt can cause the model to lose focus on critical rules. Prioritize essential instructions and remove redundant guidance.
                </p>

                <CodeBlockTabs
                  lessEffective={`# Goal

Help customers with orders, refunds, shipping, product questions, account issues, technical problems, billing questions, subscription management, and general inquiries. Always be friendly, professional, helpful, efficient, and empathetic. Respond quickly, accurately, and thoroughly.`}
                  recommended={`# Goal

Help customers resolve order-related issues efficiently.

**Primary focus:**
- Order status and tracking
- Refund processing for eligible orders
- Shipping inquiries

**For other issues:** Politely redirect to the appropriate department.`}
                />
              </div>

              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold mt-6 sm:mt-8 mb-3 sm:mb-4 text-foreground">
                  Vague or ambiguous language
                </h3>
                <p className="text-xs sm:text-sm text-foreground mb-3 sm:mb-4">
                  Ambiguous instructions lead to inconsistent behavior. Use specific, actionable language that leaves no room for interpretation.
                </p>

                <CodeBlockTabs
                  lessEffective={`# Guardrails

Be careful with customer data.
Handle refunds appropriately.
Don't make promises you can't keep.`}
                  recommended={`# Guardrails

Never share customer data across conversations or reveal sensitive account information without proper verification.
Never process refunds over $500 without supervisor approval.
Never make promises about delivery dates that aren't confirmed in the order system.`}
                />
              </div>

              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold mt-6 sm:mt-8 mb-3 sm:mb-4 text-foreground">
                  Inconsistent formatting
                </h3>
                <p className="text-xs sm:text-sm text-foreground mb-3 sm:mb-4">
                  Inconsistent formatting makes prompts harder to parse and can confuse the model. Establish a clear format and stick to it throughout the prompt. See the "Formatting best practices" section for detailed guidelines.
                </p>

                <CodeBlockTabs
                  lessEffective={`# Goal
Help customers

#GUARDRAILS
- Never share data
- Be professional

Tools:
* lookupOrder
* processRefund`}
                  recommended={`# Goal

Help customers resolve issues efficiently.

# Guardrails

Never share customer data across conversations.
Always maintain professionalism.

# Tools

## \`lookupOrder\`

**When to use:** To retrieve order information

## \`processRefund\`

**When to use:** To process eligible refunds`}
                />
              </div>

              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold mt-6 sm:mt-8 mb-3 sm:mb-4 text-foreground">
                  Missing examples or context
                </h3>
                <p className="text-xs sm:text-sm text-foreground mb-3 sm:mb-4">
                  Without examples, models may struggle to understand expected behavior, especially for complex or nuanced scenarios. Always include concrete examples for critical workflows, formatting requirements, and edge cases.
                </p>

                <CodeBlockTabs
                  lessEffective={`# Goal

Process refunds when customers request them.`}
                  recommended={`# Goal

Process refunds when customers request them.

## Example workflow

User: "I want to return my order"
You: "I'd be happy to help with that. Can I get your order number?"
User: "ORD123456"
You: [Calls \`verifyIdentity\` tool]
You: [Calls \`getOrderDetails\` tool]
You: "I see your order is eligible for a refund. I'll process a $45.99 refund to your original payment method. It will appear in 3-5 business days. Does that work for you?"`}
                />

                <Callout type="tip">
                  <p>
                    When adding examples, ensure they cover both typical cases and edge cases. This helps the model handle a wider range of scenarios correctly.
                  </p>
                </Callout>
              </div>
            </section>

            {/* Production Considerations */}
            <section className="mb-8 sm:mb-10 lg:mb-12">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mt-8 sm:mt-10 lg:mt-12 mb-4 sm:mb-5 lg:mb-6 text-foreground">
                Production considerations
              </h2>

              <p className="text-xs sm:text-sm text-foreground mb-4 sm:mb-6">
                Enterprise agents require additional safeguards beyond prompt quality. Production deployments must account for error handling, compliance, and graceful degradation.
              </p>

              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold mt-6 sm:mt-8 mb-3 sm:mb-4 text-foreground">
                  Handle errors across all tool integrations
                </h3>
                <p className="text-xs sm:text-sm text-foreground mb-3 sm:mb-4">
                  Every external tool call is a potential failure point. Ensure your prompt includes explicit error handling for:
                </p>
                <ul className="list-disc pl-5 sm:pl-6 space-y-2 sm:space-y-3 text-xs sm:text-sm text-foreground">
                  <li>
                    <strong>Network failures:</strong> "I'm having trouble connecting to our system. Let me try again."
                  </li>
                  <li>
                    <strong>Missing data:</strong> "I don't see that information in our system. Can you verify the details?"
                  </li>
                  <li>
                    <strong>Timeout errors:</strong> "This is taking longer than expected. I can escalate to a specialist or try again."
                  </li>
                  <li>
                    <strong>Permission errors:</strong> "I don't have access to that information. Let me transfer you to someone who can help."
                  </li>
                </ul>
              </div>
            </section>

            {/* Example Prompts */}
            <section className="mb-8 sm:mb-10 lg:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mt-8 sm:mt-10 lg:mt-12 mb-4 sm:mb-5 lg:mb-6 text-foreground">
                Example prompts
              </h2>

              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold mt-6 sm:mt-8 mb-3 sm:mb-4 text-foreground">
                  Example 1: Technical Support Agent
                </h3>
                <CodeBlock
                  title="Technical support specialist"
                  code={`# Personality

You are a technical support agent specializing in software troubleshooting.
You are patient, methodical, and solution-oriented.

# Goal

Assist users in diagnosing and resolving software issues efficiently through this workflow:

1. Greet the user and confirm their identity
2. Gather information about the issue
3. Consult the Knowledge Base for potential solutions
4. If necessary, use Remote Access to diagnose the problem
5. Provide step-by-step instructions to resolve the issue
6. Confirm resolution and offer further assistance if needed

# Guardrails

Never provide hardware support or speculate about issues.
Never share sensitive user data or access credentials.
Acknowledge when you don't know an answer instead of guessing.
If the issue requires hardware support, politely redirect to the hardware support team.

# Tools

## \`lookupKnowledgeBase\`

**When to use:** When you need to find solutions to common software issues
**Parameters:**
- \`query\` (required): Search query describing the issue

**Error handling:**
If the knowledge base search fails, acknowledge the issue and offer to escalate to a senior technician.

## \`remoteDiagnostics\`

**When to use:** When you need to remotely diagnose a user's system
**Parameters:**
- \`user_id\` (required): User identifier
- \`permission_granted\` (required): Boolean indicating user consent

**Error handling:**
If remote access fails, provide alternative troubleshooting steps and offer to schedule a follow-up call.

# Character normalization

When collecting email addresses:

- Spoken: "john dot smith at company dot com"
- Written: "john.smith@company.com"
- Convert "@" from "at", "." from "dot", remove spaces

# Error handling

If any tool call fails:

1. Acknowledge: "I'm having trouble accessing that information right now."
2. Do not guess or make up information
3. Offer to retry once, then escalate if failure persists`}
                />
              </div>

              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold mt-6 sm:mt-8 mb-3 sm:mb-4 text-foreground">
                  Example 2: Customer Service Refund Agent
                </h3>
                <CodeBlock
                  title="Refund processing specialist"
                  code={`# Personality

You are a refund specialist for RetailCo.
You are empathetic, solution-oriented, and efficient.
You balance customer satisfaction with company policy compliance.

# Goal

Process refund requests through this workflow:

1. Verify customer identity using order number and email
2. Look up order details with \`getOrderDetails\` tool
3. Confirm refund eligibility (within 30 days, not digital download, not already refunded)
4. For refunds under $100: Process immediately with \`processRefund\` tool
5. For refunds $100-$500: Apply secondary verification, then process
6. For refunds over $500: Escalate to supervisor with case summary

This step is important: Never process refunds without verifying eligibility first.

# Guardrails

Never process refunds outside the 30-day return window without supervisor approval.
Never process refunds over $500 without supervisor approval. This step is important.
Never access order information without verifying customer identity.
If a customer becomes aggressive, remain calm and offer supervisor escalation.

# Tools

## \`verifyIdentity\`

**When to use:** At the start of every conversation
**Parameters:**
- \`order_id\` (required): Order ID in written format (e.g., "ORD123456")
- \`email\` (required): Customer email in written format

**Usage:**
1. Collect order ID: "Can I get your order number?"
   - Spoken: "O R D one two three four five six"
   - Written: "ORD123456"
2. Collect email and convert to written format
3. Call this tool with both values

## \`getOrderDetails\`

**When to use:** After identity verification
**Returns:** Order date, items, total amount, refund eligibility status

**Error handling:**
If order not found, ask customer to verify order number and try again.

## \`processRefund\`

**When to use:** Only after confirming eligibility
**Required checks before calling:**
- Identity verified
- Order is within 30 days
- Order is eligible (not digital, not already refunded)
- Refund amount is under $500

**Parameters:**
- \`order_id\` (required): From previous verification
- \`reason_code\` (required): One of "defective", "wrong_item", "late_delivery", "changed_mind"

**Usage:**
1. Confirm refund details with customer: "I'll process a $[amount] refund to your original payment method. It will appear in 3-5 business days. Does that work for you?"
2. Wait for customer confirmation
3. Call this tool

**Error handling:**
If refund processing fails, apologize and escalate: "I'm unable to process that refund right now. Let me escalate to a supervisor who can help."

# Character normalization

Order IDs:
- Spoken: "O R D one two three four five six"
- Written: "ORD123456"
- No spaces, all uppercase

Email addresses:
- Spoken: "john dot smith at retailco dot com"
- Written: "john.smith@retailco.com"`}
                />
              </div>
            </section>

            {/* Formatting Best Practices */}
            <section className="mb-8 sm:mb-10 lg:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mt-8 sm:mt-10 lg:mt-12 mb-4 sm:mb-5 lg:mb-6 text-foreground">
                Formatting best practices
              </h2>

              <p className="text-sm sm:text-base text-foreground mb-3 sm:mb-4">
                How you format your prompt impacts how effectively the language model interprets it:
              </p>

              <ul className="list-disc pl-5 sm:pl-6 space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-foreground">
                <li>
                  <strong>Use markdown headings:</strong> Structure sections with <code className="bg-muted dark:bg-muted/50 text-foreground px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-border text-xs sm:text-sm">#</code> for main sections, <code className="bg-muted dark:bg-muted/50 text-foreground px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-border text-xs sm:text-sm">##</code> for subsections
                </li>
                <li>
                  <strong>Prefer bulleted lists:</strong> Break down instructions into digestible bullet points
                </li>
                <li>
                  <strong>Use whitespace:</strong> Separate sections and instruction groups with blank lines
                </li>
                <li>
                  <strong>Keep headings in sentence case:</strong> <code className="bg-muted dark:bg-muted/50 text-foreground px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-border text-xs sm:text-sm"># Goal</code> not <code className="bg-muted dark:bg-muted/50 text-foreground px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-border text-xs sm:text-sm"># GOAL</code>
                </li>
                <li>
                  <strong>Be consistent:</strong> Use the same formatting pattern throughout the prompt
                </li>
              </ul>
            </section>

            {/* FAQ */}
            <section className="mb-8 sm:mb-10 lg:mb-12 not-prose">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mt-8 sm:mt-10 lg:mt-12 mb-4 sm:mb-5 lg:mb-6 text-foreground">
                Frequently asked questions
              </h2>

              <div className="rounded-sm border border-border bg-card shadow-lg shadow-primary/5 dark:shadow-primary/10">
                <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                  <AccordionItem value="item-0" className="border-b border-border">
                    <AccordionTrigger className="text-left text-sm sm:text-base font-semibold text-foreground hover:no-underline py-3 sm:py-4 hover:bg-muted/50 px-4 sm:px-6 transition-colors mt-0 mb-0">
                      How do I maintain consistency across multiple agents?
                    </AccordionTrigger>
                    <AccordionContent className="text-xs sm:text-sm text-foreground pb-3 sm:pb-4 pt-2 px-4 sm:px-6 mt-0">
                      Create shared prompt templates for common sections like character normalization, error handling, and guardrails. Store these in a central repository and reference them across specialist agents. Use the orchestrator pattern to ensure consistent routing logic and handoff procedures.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-1" className="border-b border-border">
                    <AccordionTrigger className="text-left text-sm sm:text-base font-semibold text-foreground hover:no-underline py-3 sm:py-4 hover:bg-muted/50 px-4 sm:px-6 transition-colors mt-0 mb-0">
                      What's the minimum viable prompt for production?
                    </AccordionTrigger>
                    <AccordionContent className="text-xs sm:text-sm text-foreground pb-3 sm:pb-4 pt-2 px-4 sm:px-6 mt-0">
                      At minimum, include: (1) Personality/role definition, (2) Primary goal, (3) Core guardrails, and (4) Tool descriptions if tools are used. Even simple agents benefit from explicit section structure and error handling instructions.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2" className="border-b border-border">
                    <AccordionTrigger className="text-left text-sm sm:text-base font-semibold text-foreground hover:no-underline py-3 sm:py-4 hover:bg-muted/50 px-4 sm:px-6 transition-colors mt-0 mb-0">
                      How do I handle tool deprecation without breaking agents?
                    </AccordionTrigger>
                    <AccordionContent className="text-xs sm:text-sm text-foreground pb-3 sm:pb-4 pt-2 px-4 sm:px-6 mt-0">
                      When deprecating a tool, add a new tool first, then update the prompt to prefer the new tool while keeping the old one as a fallback. Monitor usage, then remove the old tool once usage drops to zero. Always include error handling so agents can recover if a deprecated tool is called.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3" className="border-b border-border">
                    <AccordionTrigger className="text-left text-sm sm:text-base font-semibold text-foreground hover:no-underline py-3 sm:py-4 hover:bg-muted/50 px-4 sm:px-6 transition-colors mt-0 mb-0">
                      Should I use different prompts for different LLMs?
                    </AccordionTrigger>
                    <AccordionContent className="text-xs sm:text-sm text-foreground pb-3 sm:pb-4 pt-2 px-4 sm:px-6 mt-0">
                      Generally, prompts structured with the principles in this guide work across models. However, model-specific tuning can improve performance—particularly for tool-calling format and reasoning steps. Test your prompt with multiple models and adjust if needed.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4" className="border-b border-border">
                    <AccordionTrigger className="text-left text-sm sm:text-base font-semibold text-foreground hover:no-underline py-3 sm:py-4 hover:bg-muted/50 px-4 sm:px-6 transition-colors mt-0 mb-0">
                      How long should my system prompt be?
                    </AccordionTrigger>
                    <AccordionContent className="text-xs sm:text-sm text-foreground pb-3 sm:pb-4 pt-2 px-4 sm:px-6 mt-0">
                      <p className="mb-2 sm:mb-3">
                        No universal limit exists, but prompts over 2000 tokens increase latency and cost. Focus on conciseness: every line should serve a clear purpose. If your prompt exceeds 2000 tokens, consider splitting into multiple specialized agents or extracting reference material into a knowledge base.
                      </p>
                      <Callout type="warning">
                        <p>
                          <strong>Performance warning:</strong> Prompts exceeding 2000 tokens significantly increase response latency and API costs. Always prioritize conciseness and consider architectural patterns like specialized agents or knowledge bases for complex requirements.
                        </p>
                      </Callout>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5" className="border-b border-border">
                    <AccordionTrigger className="text-left text-sm sm:text-base font-semibold text-foreground hover:no-underline py-3 sm:py-4 hover:bg-muted/50 px-4 sm:px-6 transition-colors mt-0 mb-0">
                      How do I balance consistency with adaptability?
                    </AccordionTrigger>
                    <AccordionContent className="text-xs sm:text-sm text-foreground pb-3 sm:pb-4 pt-2 px-4 sm:px-6 mt-0">
                      Define core personality traits, goals, and guardrails firmly while allowing flexibility in tone and verbosity based on user communication style. Use conditional instructions: "If the user is frustrated, acknowledge their concerns before proceeding."
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-6" className="border-b border-border">
                    <AccordionTrigger className="text-left text-sm sm:text-base font-semibold text-foreground hover:no-underline py-3 sm:py-4 hover:bg-muted/50 px-4 sm:px-6 transition-colors mt-0 mb-0">
                      Can I update prompts after deployment?
                    </AccordionTrigger>
                    <AccordionContent className="text-xs sm:text-sm text-foreground pb-3 sm:pb-4 pt-2 px-4 sm:px-6 mt-0">
                      Yes. System prompts can be modified at any time to adjust behavior. This is particularly useful for addressing emerging issues or refining capabilities as you learn from user interactions. Always test changes in a staging environment before deploying to production.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-7" className="border-b border-border last:border-b-0">
                    <AccordionTrigger className="text-left text-sm sm:text-base font-semibold text-foreground hover:no-underline py-3 sm:py-4 hover:bg-muted/50 px-4 sm:px-6 transition-colors mt-0 mb-0">
                      How do I prevent agents from hallucinating when tools fail?
                    </AccordionTrigger>
                    <AccordionContent className="text-xs sm:text-sm text-foreground pb-3 sm:pb-4 pt-2 px-4 sm:px-6 mt-0">
                      Include explicit error handling instructions for every tool. Emphasize "never guess or make up information" in the guardrails section. Repeat this instruction in tool-specific error handling sections. Test tool failure scenarios during development to ensure agents follow recovery instructions.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PromptingGuide;
