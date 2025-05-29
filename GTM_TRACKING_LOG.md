# Google Tag Manager Tracking Classes Log

## Overview

This document lists all the tracking classes implemented across the Potential.com website for Google Analytics via Google Tag Manager. All classes use the prefix `gtm-` followed by a descriptive identifier.

---

## 🏠 Homepage (`https://potential.com/`)

### Hero Section

| Class Name                    | Element | Action | Description                                     |
| ----------------------------- | ------- | ------ | ----------------------------------------------- |
| `gtm-hero-try-free-agent`     | Button  | Click  | "Try Free AI Agent" - main CTA in hero          |
| `gtm-hero-talk-to-consultant` | Button  | Click  | "Talk to AI Consultant" - secondary CTA in hero |

### AI Agents Section (`#agents`)

| Class Name                | Element | Action | Description                  |
| ------------------------- | ------- | ------ | ---------------------------- |
| `gtm-agents-chatbot-try`  | Button  | Click  | Opens chatbot creation form  |
| `gtm-agents-voicebot-try` | Button  | Click  | Opens voicebot creation form |

### Vera Section (`#vera`)

| Class Name              | Element | Action | Description                |
| ----------------------- | ------- | ------ | -------------------------- |
| `gtm-vera-talk-to-vera` | Button  | Click  | Links to Vera page (/vera) |

### Rachel Section (`#rachel`)

| Class Name                  | Element | Action | Description                           |
| --------------------------- | ------- | ------ | ------------------------------------- |
| `gtm-rachel-talk-to-rachel` | Button  | Click  | External link to Rachel AI consultant |

### Benefits Section

| Class Name                      | Element | Action | Description                                     |
| ------------------------------- | ------- | ------ | ----------------------------------------------- |
| `gtm-benefits-explore-features` | Button  | Click  | "Explore All Features" - redirects to Vera page |

### Get Started Section (`#start`)

| Class Name                     | Element | Action | Description                                    |
| ------------------------------ | ------- | ------ | ---------------------------------------------- |
| `gtm-start-try-free-agent`     | Button  | Click  | "Try Free AI Agent" in start section           |
| `gtm-start-talk-to-consultant` | Button  | Click  | "Talk to AI Consultant" in start section       |
| `gtm-start-become-partner`     | Button  | Click  | "Become a Partner" - redirects to partner page |

### CTA Footer Section

| Class Name                      | Element | Action | Description                                   |
| ------------------------------- | ------- | ------ | --------------------------------------------- |
| `gtm-cta-footer-talk-to-rachel` | Button  | Click  | "Talk to Rachel" - external link to Rachel AI |
| `gtm-cta-footer-schedule-demo`  | Button  | Click  | "Schedule a Demo" button                      |

### Mobile Elements

| Class Name                    | Element | Action | Description              |
| ----------------------------- | ------- | ------ | ------------------------ |
| `gtm-mobile-sticky-try-agent` | Button  | Click  | Sticky mobile CTA button |

---

## 📄 Vera Page (`https://potential.com/vera`)

### Hero Section

| Class Name             | Element | Action | Description                               |
| ---------------------- | ------- | ------ | ----------------------------------------- |
| `gtm-vera-get-started` | Button  | Click  | "Get Started with Vera" - scrolls to form |

### Consultation Form

| Class Name             | Element | Action | Description                   |
| ---------------------- | ------- | ------ | ----------------------------- |
| `gtm-vera-form-submit` | Button  | Click  | Submit Vera consultation form |

### Meet Vera Section

| Class Name                    | Element | Action | Description                                      |
| ----------------------------- | ------- | ------ | ------------------------------------------------ |
| `gtm-vera-start-consultation` | Button  | Click  | "Start Your Free Consultation" - scrolls to form |

---

## 📄 About Page (`https://potential.com/about`)

| Class Name                  | Element | Action | Description                  |
| --------------------------- | ------- | ------ | ---------------------------- |
| `gtm-about-partner-with-us` | Button  | Click  | "Partner With Us" CTA button |

---

## 📄 Offerings Page (`https://potential.com/offerings`)

### Case Studies Section

| Class Name                 | Element | Action | Description                                    |
| -------------------------- | ------- | ------ | ---------------------------------------------- |
| `gtm-offerings-case-study` | Button  | Click  | "Read full case study" - external link to Vera |

### Platforms Section

| Class Name                 | Element | Action | Description                          |
| -------------------------- | ------- | ------ | ------------------------------------ |
| `gtm-platforms-learn-more` | Button  | Click  | "Learn More" - external link to Vera |

### Solutions Section

| Class Name                            | Element | Action | Description                                       |
| ------------------------------------- | ------- | ------ | ------------------------------------------------- |
| `gtm-solutions-learn-more`            | Button  | Click  | "Learn More" - external link to Vera              |
| `gtm-solutions-schedule-consultation` | Button  | Click  | "Schedule a Consultation" - external link to Vera |

---

## 💰 Pricing Page (`https://potential.com/pricing`)

### Pricing Plans

| Class Name                        | Element | Action | Description                     |
| --------------------------------- | ------- | ------ | ------------------------------- |
| `gtm-pricing-plan-starter`        | Button  | Click  | Starter plan selection          |
| `gtm-pricing-plan-growth`         | Button  | Click  | Growth plan selection (popular) |
| `gtm-pricing-plan-micro-platform` | Button  | Click  | Micro Platform plan selection   |
| `gtm-pricing-plan-enterprise`     | Button  | Click  | Enterprise plan selection       |

### Contact

| Class Name                  | Element | Action | Description                   |
| --------------------------- | ------- | ------ | ----------------------------- |
| `gtm-pricing-contact-sales` | Button  | Click  | "Contact our sales team" link |

---

## 🤝 Partner Page (`https://potential.com/partner`)

### Hero Section

| Class Name                   | Element | Action | Description                         |
| ---------------------------- | ------- | ------ | ----------------------------------- |
| `gtm-partner-become-partner` | Button  | Click  | Scrolls to partner application form |

### Partner Application Form

| Class Name                        | Element | Action | Description                                |
| --------------------------------- | ------- | ------ | ------------------------------------------ |
| `gtm-partner-form-submit`         | Button  | Click  | Submit partner application form            |
| `gtm-partner-form-submit-another` | Button  | Click  | Submit another application (after success) |

---

## 🤖 AI Agent Forms (Modal Forms)

### Chatbot Creation Form

| Class Name                        | Element | Action | Description                          |
| --------------------------------- | ------- | ------ | ------------------------------------ |
| `gtm-chatbot-form-remove-website` | Button  | Click  | Remove website field from form       |
| `gtm-chatbot-form-add-website`    | Button  | Click  | Add website field to form            |
| `gtm-chatbot-form-cancel`         | Button  | Click  | Cancel chatbot creation              |
| `gtm-chatbot-form-submit`         | Button  | Click  | Submit chatbot creation form         |
| `gtm-chatbot-form-test-agent`     | Button  | Click  | Test created chatbot (success state) |

### Voicebot Creation Form

| Class Name                         | Element | Action | Description                           |
| ---------------------------------- | ------- | ------ | ------------------------------------- |
| `gtm-voicebot-form-remove-website` | Button  | Click  | Remove website field from form        |
| `gtm-voicebot-form-add-website`    | Button  | Click  | Add website field to form             |
| `gtm-voicebot-form-cancel`         | Button  | Click  | Cancel voicebot creation              |
| `gtm-voicebot-form-submit`         | Button  | Click  | Submit voicebot creation form         |
| `gtm-voicebot-form-test-agent`     | Button  | Click  | Test created voicebot (success state) |

---

## 🧩 Global Components

### Header Navigation (All Pages)

| Class Name                | Element | Action | Description             |
| ------------------------- | ------- | ------ | ----------------------- |
| `gtm-header-theme-toggle` | Button  | Click  | Toggle light/dark theme |

### Footer (All Pages)

| Class Name                        | Element | Action | Description             |
| --------------------------------- | ------- | ------ | ----------------------- |
| `gtm-footer-newsletter-subscribe` | Button  | Click  | Subscribe to newsletter |

---

## 📊 Google Tag Manager Implementation Guide

### 1. Basic Trigger Setup

Create a Click Trigger in GTM:

- **Trigger Type:** Click - All Elements
- **This trigger fires on:** Some Clicks
- **Condition:** Click Classes contains `gtm-`

### 2. Event Tag Configuration

Create a GA4 Event Tag:

- **Tag Type:** Google Analytics: GA4 Event
- **Event Name:** `button_click`
- **Event Parameters:**
  - `button_class`: `{{Click Classes}}`
  - `page_path`: `{{Page Path}}`
  - `button_text`: `{{Click Text}}`

### 3. Specific Tracking Examples

#### Track AI Agent Form Submissions

- **Trigger Condition:** Click Classes contains `gtm-chatbot-form-submit` OR `gtm-voicebot-form-submit`
- **Event Name:** `form_submit`
- **Parameters:**
  - `form_type`: Extract from class (chatbot/voicebot)
  - `action`: `agent_creation`

#### Track CTA Performance

- **Trigger Condition:** Click Classes contains `gtm-hero-` OR `gtm-start-`
- **Event Name:** `cta_click`
- **Parameters:**
  - `cta_location`: Extract from class (hero/start)
  - `cta_type`: Extract from class (try-agent/talk-to-consultant)

#### Track Pricing Plan Selection

- **Trigger Condition:** Click Classes contains `gtm-pricing-plan-`
- **Event Name:** `pricing_plan_click`
- **Parameters:**
  - `plan_type`: Extract from class (starter/growth/enterprise)

#### Track Vera Page Interactions

- **Trigger Condition:** Click Classes contains `gtm-vera-`
- **Event Name:** `vera_interaction`
- **Parameters:**
  - `interaction_type`: Extract from class (get-started/form-submit/start-consultation)

#### Track Rachel Interactions

- **Trigger Condition:** Click Classes contains `gtm-rachel-`
- **Event Name:** `rachel_interaction`
- **Parameters:**
  - `interaction_type`: Extract from class (talk-to-rachel)

### 4. Advanced Segmentation

Use the tracking classes to create audience segments:

- **High Intent Users:** Users who clicked agent creation buttons
- **Pricing Page Visitors:** Users who interacted with pricing plans
- **Partner Prospects:** Users who clicked partner-related CTAs
- **Vera Consultations:** Users who submitted Vera consultation forms
- **Rachel Users:** Users who clicked to talk to Rachel

---

## 🔍 Testing Checklist

### Homepage Testing

- [ ] Hero section CTAs
- [ ] AI Agents section buttons
- [ ] Vera section button
- [ ] Rachel section button
- [ ] Benefits section button
- [ ] Start section CTAs
- [ ] CTA Footer buttons
- [ ] Mobile sticky CTA

### Vera Page Testing

- [ ] Hero "Get Started" button
- [ ] Consultation form submission
- [ ] "Start Your Free Consultation" button

### Offerings Page Testing

- [ ] Case study buttons
- [ ] Platform "Learn More" buttons
- [ ] Solutions "Learn More" buttons
- [ ] Solutions "Schedule a Consultation" button

### Form Testing

- [ ] Chatbot form interactions
- [ ] Voicebot form interactions
- [ ] Partner application form
- [ ] Vera consultation form

### Global Component Testing

- [ ] Header theme toggle
- [ ] Footer newsletter subscription

---

## 📈 Key Performance Indicators (KPIs)

### Conversion Funnel

1. **Awareness:** Homepage visits, section views
2. **Interest:** CTA clicks, form opens
3. **Consideration:** Form submissions, consultation requests
4. **Action:** Agent creation, partnership applications

### Primary Metrics to Track

- **Agent Creation Rate:** `gtm-chatbot-form-submit` + `gtm-voicebot-form-submit`
- **Consultation Requests:** `gtm-vera-form-submit`
- **Rachel Engagement:** `gtm-rachel-talk-to-rachel`
- **Partner Interest:** `gtm-partner-form-submit`
- **CTA Performance:** All `gtm-hero-*` and `gtm-start-*` classes

### Secondary Metrics

- **Feature Exploration:** `gtm-benefits-explore-features`
- **Case Study Interest:** `gtm-offerings-case-study`
- **Platform Interest:** `gtm-platforms-learn-more`
- **Solution Interest:** `gtm-solutions-*`

---

## 🏷️ Naming Convention Summary

**Format:** `gtm-[section/page]-[component]-[action]`

**Examples:**

- `gtm-hero-try-free-agent` (section-action)
- `gtm-pricing-plan-starter` (page-component-detail)
- `gtm-chatbot-form-submit` (component-element-action)

This consistent naming makes it easy to:

- Group related events in GTM
- Create audience segments
- Build custom reports in GA4
- Maintain and update tracking
