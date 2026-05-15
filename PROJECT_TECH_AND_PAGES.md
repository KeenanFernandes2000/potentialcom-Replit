# Project Overview

This project is a full-stack TypeScript web app for `Potential.com`. It combines a React frontend with an Express backend, PostgreSQL persistence, form-based lead capture, authentication, blog content from WordPress, and AI-focused product/demo pages.

## What The Project Uses

### Core stack

- **Language:** TypeScript across client, server, and shared schema code
- **Frontend:** React 18 + Vite
- **Routing:** `wouter`
- **Server:** Express
- **Build/runtime:** Vite for the client, `tsx` for local dev, `esbuild` for the server production bundle

### Frontend/UI

- **Styling:** Tailwind CSS
- **Component system:** `shadcn/ui` built on **Radix UI**
- **Data fetching/cache:** `@tanstack/react-query`
- **Forms/validation:** `react-hook-form`, `zod`, `@hookform/resolvers`
- **SEO/meta tags:** `react-helmet-async`
- **Icons:** `lucide-react`, `@phosphor-icons/react`, `react-icons`
- **Animations:** `aos` (Animate On Scroll)
- **Charts/UI helpers:** `recharts`, `embla-carousel-react`, `react-resizable-panels`, `vaul`

### Backend/data

- **Database:** PostgreSQL
- **Database access:** Drizzle ORM
- **DB hosting driver:** `@neondatabase/serverless`
- **Schema validation/shared types:** `drizzle-zod`, `zod`
- **Sessions:** `express-session` + `connect-pg-simple` (Postgres-backed sessions)
- **Password hashing:** `bcryptjs`

### External integrations

- **WordPress blog API:** proxied from `https://blog.potential.com/wp-json/wp/v2`
- **Email notifications:** SendGrid via `@sendgrid/mail`
- **Voice/AI call flows:** `@vapi-ai/web`
- **Live conversational/RTC packages present:** `livekit-client`, `livekit-server-sdk`, `@livekit/components-react`

### Project structure

- `client/`: React app
- `server/`: Express app, API routes, Vite/static serving
- `shared/`: shared DB schema and types
- `public/assets/`: downloadable/static assets

## Main Backend Capabilities

The backend currently supports:

- user registration, login, logout, profile fetch/update
- email verification and password reset flows
- newsletter subscribe/unsubscribe
- partner application submissions
- Vera and Ayla consultation form submissions
- resource download tracking
- CSR infographic lead capture + file download
- WordPress post/category proxying
- whitepaper PDF download
- health check endpoint at `/health`

## Pages In The App

These are the client-side routes defined in the app router.

| Route | Page | Purpose |
| --- | --- | --- |
| `/` | Home | Main landing page for Potential.com AI agents and business growth |
| `/solutions` | Offerings | AI solutions/services overview with sections like agents, platforms, and solutions |
| `/resources` | Resources | Whitepaper, learning resources, and case studies |
| `/pricing` | Pricing | Pricing page |
| `/partner` | Partner | Partner program information and application path |
| `/about` | About | Company/about page |
| `/vera` | Vera | Vera AI advisor page with consultation form |
| `/ayla` | Ayla | Ayla page with consultation/demo flow |
| `/voice` | Voice | AI voice agents product page |
| `/chatbot` | Chatbot | AI chatbot product page |
| `/usecases` | UseCases | Industry/use-case showcase for AI agents |
| `/demo` | Demo | AI agent demo page for Ruby |
| `/lumi` | Lumi | AI agent demo page for Lumi |
| `/ai-for-csr` | AIForCSR | CSR-focused AI platform/product page |
| `/ai-agents` | AIAgents | General AI agents marketing page |
| `/year-of-family` | YearOfFamily | Campaign/initiative page for a national family empowerment program |
| `/login` | Login | User login page |
| `/register` | Register | User registration page |
| `/profile` | Profile | Logged-in user profile/account page |
| `/forgot-password` | ForgotPassword | Password reset request/reset flow |
| `/terms` | TermsOfUse | Terms of use/legal page |
| `/privacy` | PrivacyPolicy | Privacy policy/legal page |
| `/promptingguide` | PromptingGuide | Prompting guide / educational content page |
| `/blog` | Blog | Blog index page |
| `/blog/category/:slug` | BlogCategory | Blog listing filtered by category |
| `/articles/:slug` | BlogPost | Individual blog article page |
| `*` | NotFound | 404 fallback page |

## Notes

- Blog content is not stored in this app; it is fetched through the backend WordPress proxy.
- Authentication is session-based, not JWT-based.
- The app appears marketing/site-focused with lead generation, demos, and consultation booking as major goals.
- There are existing product-specific AI experiences around **chat**, **voice**, and demo agents such as **Vera**, **Ayla**, **Ruby**, and **Lumi**.
