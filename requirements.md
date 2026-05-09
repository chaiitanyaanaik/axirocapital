# Axiro Capital — Website Requirements

This document defines the non-negotiable requirements for the Axiro marketing site.

## Required Pages

The site must include and maintain the following routes:

1. Home (`/`)
2. About (`/about`)
3. Services (`/services`)
4. How It Works (`/how-it-works`)
5. Contact (`/contact`)
6. Loan Insight (`/loan-insight`)

## Current Status

All required pages are implemented in the Next.js App Router.

## Route Structure Contract

Expected App Router structure:

- `app/page.tsx`
- `app/about/page.tsx`
- `app/services/page.tsx`
- `app/how-it-works/page.tsx`
- `app/contact/page.tsx`

## Shared Layout Contract

The following components must remain reusable and consistent across all pages:

- Navbar
- Footer

Current navbar contract:

- Brand logo links to home (`/`)
- Standard pages may use shared navbar links
- Loan Insight page can hide links for focused flow (`<Navbar hideLinks />`)
- Home page uses a custom embedded v3-style nav for landing conversion focus

## Consistency Rules

- Follow `DESIGN.md` for visual system decisions
- Keep typography, spacing, and color usage consistent
- Keep navigation structure and behavior consistent
- Keep footer structure and behavior consistent

## Home Page Content Contract

The Home page should currently maintain the following:

- Source of truth: `components/home/HomePage.tsx`
- Hero heading: `Stop chasing lenders` + `Get working capital faster`
- Hero trust tag: `Trusted by growing businesses across India`
- Nav action `Check Eligibility`: `/loan-quote`
- Hero primary action: `Check My Eligibility` -> `/loan-quote` with UTMs (`utm_source`, `utm_medium`, `utm_campaign`)
- No secondary hero CTA in hero (single primary action)
- Include `How this works` section directly below hero
- Keep footer minimal and aligned to landing-style layout

## Home Page Responsive Contract

The Home page must remain usable and visually stable on mobile:

- Hero layout stacks cleanly from desktop split to single-column mobile
- CTA and audio cards stay full-width and legible on small screens
- Scenario cards remain readable without horizontal overflow
- No horizontal overflow at phone widths (e.g. 375px and 390px)
- Primary CTA remains visible and readable in first hero viewport range

## Loan Insight Requirements

- Deterministic gate flow:
  - Gate 1 dynamic 6-7 questions (skip logic allowed)
  - Gate 2 exactly one question, optional second only for `not_sure` + low confidence
  - Gate 3 optional action question
- Lead capture:
  - async, non-blocking, no OTP
  - idempotent writes through `/api/loan-insight/lead`
- Security:
  - production lead writes must fail if `LEADS_ENCRYPTION_KEY` missing
  - no silent plaintext lead storage in production
- Data separation:
  - `public.leads.env` records deployment context (`production` | `preview` | `development`)
  - admin eligibility leads view (`/admin/leads`) must only list `env = production` rows
- Health endpoint:
  - `/api/loan-insight/health` must report encryption readiness by environment

## Quality Goal

The site should feel like one cohesive, premium product experience, not a collection of disconnected pages.

## Launch and Domain Requirements

- Hosting target:
  - Vercel production deployment for project `axiro`
- Production URL alias:
  - `https://axiro-one.vercel.app`
- Custom domains to support:
  - `axirocapital.com`
  - `www.axirocapital.com`
- DNS contract for Squarespace-managed DNS:
  - `A` record: `@` -> `76.76.21.21`
  - `CNAME` record: `www` -> `cname.vercel-dns.com`
- Domain behavior:
  - One domain set as primary in Vercel
  - Other domain redirects to primary
  - HTTPS enforced after certificate issuance
