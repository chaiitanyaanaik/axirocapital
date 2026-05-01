# Loan Insight Implementation Notes

This file captures the implemented system behavior and file-level ownership to keep product, engineering, and UX aligned.

## Implementation Status (Current)

- `loan-insight` flow is production-shaped with deterministic state engine + optional AI enrichment.
- `eligibility` flow is implemented as a separate 5-question pre-check with scoring + lead capture.
- Both flows are now aligned on a cleaner, compact question-card pattern for better mobile fit.

## Core Engine

- Engine entry and public exports:
  - `lib/loanInsight/index.ts`
- Core deterministic logic:
  - `lib/loanInsight/engine.ts`
- Types and contracts:
  - `lib/loanInsight/types.ts`
- Rule and priority config:
  - `lib/loanInsight/config.ts`
- Deterministic insight templates:
  - `lib/loanInsight/templates.ts`
- Questionnaire labels/options used by UI:
  - `lib/loanInsight/questionnaire.ts`

## State/Flow Spec

- Canonical machine spec:
  - `LoanAnalysis/loan_insight_state_machine.json`

Flow summary:
- Gate 1 (6-7 questions with dynamic skip)
- Insight reveal
- Gate 2 (1 question, optional second for low-confidence `not_sure`)
- Lead capture (non-blocking)
- Gate 3 (optional)
- Final output + CTA

## Frontend Screens

- Page route:
  - `app/loan-insight/page.tsx`
- Interactive flow component:
  - `components/loan-insight/LoanInsightFlow.tsx`

Current UX highlights:
- One question at a time
- Gate progress in top bar
- Gate 1 analyzing interstitial before first insight reveal
- Lead capture can be skipped without breaking flow
- Fallback transition prevents Gate 3 dead-ends

## Gate 1 Label Mapping Contract (Non-Breaking)

Gate 1 now uses a label/value split for safer UX improvements:

- UI shows user-friendly labels (for readability and completion)
- Engine still receives canonical values (for deterministic scoring)

Canonical values remain unchanged in:

- `lib/loanInsight/types.ts`
- `lib/loanInsight/config.ts`
- `lib/loanInsight/questionnaire.ts` (`GATE1_OPTIONS`)

Display labels are mapped in:

- `lib/loanInsight/questionnaire.ts` (`getGate1OptionItems`)

Important:

- Do not send display labels into engine state or scoring rules.
- Keep analytics payloads and signal values canonical for backward compatibility.
- `business_change` is currently not part of Gate 1 scoring and remains future/optional metadata.

## Lead API and Persistence

- Lead endpoint:
  - `app/api/loan-insight/lead/route.ts`
- AI enrichment endpoint:
  - `app/api/loan-insight/enrich/route.ts`
- Health endpoint:
  - `app/api/loan-insight/health/route.ts`
- Supabase server client:
  - `lib/supabase/server.ts`
- Privacy helpers:
  - `lib/loanInsight/privacy.ts`
- Encryption/idempotency helpers:
  - `lib/loanInsight/crypto.ts`
- Schema reference:
  - `LoanAnalysis/supabase_schema.sql`

## Security Rules

- Production:
  - `LEADS_ENCRYPTION_KEY` is required for lead writes.
  - Missing key returns error and triggers critical log/alert hook.
  - Plaintext fallback is not allowed.
- Non-production:
  - Plaintext fallback allowed with warning logs for local/preview resilience.

## AI Runtime Configuration

- Required for live AI enrichment:
  - `OPENAI_API_KEY`
- Optional model override:
  - `AI_MODEL` (defaults to `gpt-4o-mini`)
- If AI request fails or returns invalid data:
  - system falls back to deterministic template output

## Event Tracking

- Event objects include:
  - `event_id`
  - `session_id`
  - optional `user_id`
- GA helper:
  - `lib/gtag.ts`

## Homepage Lock

- Final homepage source of truth:
  - `components/home/HomePage.tsx`
- Built from V3 references and finalized for current launch.

## Eligibility Flow Notes

Primary files:

- Route:
  - `app/eligibility/page.tsx`
- Interactive screen:
  - `components/eligibility/EligibilityFlow.tsx`
- Question definitions:
  - `lib/eligibility/questionnaire.ts`
- Eligibility scoring:
  - `lib/eligibility/scoring.ts`
- Lead + score APIs:
  - `app/api/eligibility/calculate/route.ts`
  - `app/api/eligibility/lead/route.ts`

Current behavior:

- Exactly 5 sequential questions, one visible at a time.
- Answer selection triggers auto-advance (no per-question `Continue` CTA).
- First question only shows reassurance pill (`Takes 30 seconds. No documents required`).
- UI uses compact rows and reduced typography for no-scroll fit on mobile where possible.
- Final phase transitions through analysis state and then captures support details.
