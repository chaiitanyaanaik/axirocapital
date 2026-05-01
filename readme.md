# Axiro Capital Website

Marketing website for Axiro Capital, a capital facilitation platform for MSMEs.  
Built with Next.js App Router, React, TypeScript, and Tailwind CSS.

## Stack

- Next.js `16`
- React `19`
- TypeScript
- Tailwind CSS `4`
- ESLint

## Local Development

1. Install dependencies:
   - `npm install`
2. Start the development server:
   - `npm run dev`
3. Open:
   - `http://localhost:3000`

### Recommended Local Run (stable)

If you hit duplicate dev server or watcher issues locally, run:

- `npm run dev -- --hostname 127.0.0.1 --port 3000 --webpack`

For a clean production preview:

- `npm run build`
- `npm run start -- --hostname 127.0.0.1 --port 3001`

## Scripts

- `npm run dev` - Run local dev server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint with zero warnings allowed

## Deployment (Vercel)

This workspace is linked to Vercel project `axiro`.

- Production deploy:
  - `npx vercel deploy --prod --yes`
- Primary production domain:
  - `https://axirocapital.com`
- Latest Vercel deployment URL format:
  - `https://axiro-<id>-chaiitanyaa09-5108s-projects.vercel.app`
- Vercel project:
  - `axiro` (team: `chaiitanyaa09-5108s-projects`)

## Domain Mapping (`axirocapital.com`)

Custom domain mapping is configured through Vercel + Squarespace DNS.

1. Add both domains in Vercel project settings:
   - `axirocapital.com`
   - `www.axirocapital.com`
2. Configure DNS in Squarespace:
   - `A` record: host `@` -> `76.76.21.21`
   - `CNAME` record: host `www` -> `cname.vercel-dns.com`
3. Keep existing email DNS records (for example Google TXT/SPF/DKIM) unchanged.
4. In Vercel, set a primary domain and redirect the secondary domain to it.
5. Wait for propagation and SSL issuance (usually minutes, can take longer).

## Routes

- `/` - Home
- `/about` - About
- `/services` - Services
- `/how-it-works` - How It Works
- `/contact` - Contact
- `/loan-insight` - MSME Loan Insight flow
- `/eligibility` - 5-step lender-facing eligibility pre-check
- `/fast-capital` - Fast-capital campaign landing (eligibility CTA + Calendly for case review)

## Current UI Notes

- Home page (`/`) is the locked, final V3-based landing page source in `components/home/HomePage.tsx`
- Home uses native scrolling without reveal-on-scroll hook
- Home top nav is embedded on the page and intentionally simplified:
  - brand + primary action only (`Check Eligibility`)
  - page links are hidden for now
- Home hero direction is based on `Home/v3.html` with mobile refinements from `Home/mobile_L.html`
  - Headline: `Stop chasing lenders`
  - Subheadline: `Most loans don't fail because the business is weak. They fail because the case isn't structured the way lenders evaluate risk.`
  - Primary hero CTA: `Check My Eligibility` -> `/eligibility`
  - Secondary hero CTA: `REVIEW MY CASE` -> `https://calendly.com/chaiitanyaanaik/30min`
- Home includes a dedicated `How this works` section below hero based on `Home/howitworks.html`
- Home footer is intentionally minimal (`© 2026 Axiro Capital`) with policy/terms/disclosure links removed
- `/loan-insight` flow nav intentionally hides links for focus

## Loan Insight System (Implemented)

- Deterministic TypeScript engine in `lib/loanInsight/`
  - scenario scoring, tie-break rules, confidence, gate transitions, final output
- UX state machine spec:
  - `LoanAnalysis/loan_insight_state_machine.json`
- API routes:
  - `POST /api/loan-insight/lead` (idempotent lead capture with retries)
  - `GET /api/loan-insight/health` (config/health checks)
- Lead persistence:
  - Supabase/Postgres via `lib/supabase/server.ts`
  - schema reference in `LoanAnalysis/supabase_schema.sql`
- Security and privacy:
  - production requires `LEADS_ENCRYPTION_KEY` for lead writes
  - non-production supports explicit plaintext fallback with warning logs
  - phone hash + masked payload support for analytics-safe events
- Tracking:
  - structured flow events include `event_id` and `session_id`
  - CTA and flow events wired via `lib/gtag.ts`

## Eligibility Flow (Implemented)

- Frontend:
  - `app/eligibility/page.tsx`
  - `components/eligibility/EligibilityFlow.tsx`
- Question bank:
  - `lib/eligibility/questionnaire.ts`
- Scoring and tier output:
  - `lib/eligibility/scoring.ts`
- API routes:
  - `POST /api/eligibility/calculate` (score/tier resolution)
  - `POST /api/eligibility/lead` (lead capture with eligibility metadata)
- UX behavior (current):
  - One question at a time (5 total)
  - Top progress indicator appears only on question steps
  - Option click auto-advances (no per-question bottom CTA)
  - "Takes 30 seconds. No documents required." shown only on question 1, above the question title
  - Question card visual style aligned to Loan Insight's cleaner option-row pattern
  - Post-question analysis interstitial then result + support capture
  - Analysis screen has no progress bars and no step label
  - Close (`X`) exits to home page (`/`)
  - Result/contact screen: `Proceed with loan support`
  - `Request Support` enabled only when valid name + valid phone are provided; email remains optional but validated if entered

## Progress Snapshot

- Home (`/`) is in finalized V3-aligned implementation mode
- Loan Insight (`/loan-insight`) deterministic engine + lead flow is active
- Eligibility (`/eligibility`) UI has been compacted for mobile fit and updated to auto-advance interactions
- Supabase schema and API wiring are in place for lead persistence

## Project Structure

- `app/` - Route entrypoints (App Router)
- `components/` - Reusable UI and page sections
- `hooks/` - Shared React hooks
- `lib/` - Utilities and shared logic
- `Home/`, `About/`, `Services/`, `How it works/`, `Contact/` - Reference HTML and design sources
- `DESIGN.md` - Visual system and style guidance
- `requirements.md` - Page and product requirements

## Product Messaging Guardrails

Axiro is positioned as a structured capital partner focused on loan outcomes.

- Use language around approvals, disbursement, better rates, and higher limits
- Keep tone clear, confident, and outcome-driven
- Avoid advisory-heavy terminology and generic buzzwords

## Design Guardrails

Follow `DESIGN.md` for visual consistency.

- Glassmorphism and layered depth
- Soft mesh gradients on light backgrounds
- Emerald (`#10B981`) as the primary action/success color
- Spacious layouts, rounded cards, subtle shadows

## Analytics

GA4 is enabled for production tracking.

- Environment variable: `NEXT_PUBLIC_GA_ID=G-KD9LLNPR9D`
- Tracking is initialized from app layout and page views are tracked by route

## Environment Variables

- `NEXT_PUBLIC_GA_ID` - GA4 measurement ID
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - server-side Supabase key for API writes
- `LEADS_ENCRYPTION_KEY` - base64-encoded 32-byte key (required in production for lead writes)
- `MONITORING_ALERT_WEBHOOK_URL` - optional critical alert webhook for encryption/persistence failures
