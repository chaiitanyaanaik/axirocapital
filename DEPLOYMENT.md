# Axiro Deployment Runbook

This runbook documents how to deploy the current website and map the production domain.

## Project

- Vercel project: `axiro`
- Team scope: `chaiitanyaa09-5108s-projects`
- Primary production domain: `https://axirocapital.com`
- Secondary Vercel deployment URL: `https://axiro-<id>-chaiitanyaa09-5108s-projects.vercel.app`

## Deploy Current Version

From the project root:

1. Install dependencies (if needed):
   - `npm install`
2. Apply Supabase schema changes (if `LoanAnalysis/supabase_schema.sql` changed):
   - Run the full script in the Supabase SQL editor for the target project, or apply only the new migration blocks.
   - For existing databases, the `env` column on `public.leads` is added and backfilled in the `do $$ ... end $$` block; the `leads_env_created_idx` index is created **after** that block so you do not get `column "env" does not exist` errors.
3. Deploy to production:
   - `npx vercel deploy --prod --yes`
4. Confirm deployment readiness:
   - Open Vercel project deployment inspector and verify `READY` state
5. Validate domain alias:
   - Confirm deployment is aliased to `https://axirocapital.com`

## Git and GitHub

Source repo: **`https://github.com/chaiitanyaanaik/axirocapital`** (adjust if renamed).

### First-time link from this machine

If `git remote -v` is empty, add the real repo URL (not a placeholder):

```bash
git remote add origin https://github.com/chaiitanyaanaik/axirocapital.git
```

If `origin` already exists but points at the wrong URL:

```bash
git remote set-url origin https://github.com/chaiitanyaanaik/axirocapital.git
```

Push your default branch (this project has used `master`; GitHub may use `main`):

```bash
git push -u origin master
# or: git branch -M main && git push -u origin main
```

### HTTPS authentication (Personal Access Token)

GitHub does **not** accept your normal account password for `git push` over HTTPS. Use a **Personal Access Token** when Git asks for a **Password**.

- **Fine-grained token:** under **Repository permissions**, add **Contents: Read and write** for `chaiitanyaanaik/axirocapital` (and **Metadata: Read-only** if offered). “Only select repositories” is fine once those permissions are added.
- **Classic token:** enable the **`repo`** scope.

If Git returns **403** or “Permission denied”, the token usually lacks **write** access or macOS **Keychain** is caching an old password. Clear GitHub entries in **Keychain Access** (search `github.com`), or run:

```bash
printf 'protocol=https\nhost=github.com\n\n' | git credential-osxkeychain erase
```

Then push again and paste a **new** token at the password prompt.

### SSH (optional)

```bash
git remote set-url origin git@github.com:chaiitanyaanaik/axirocapital.git
git push -u origin master
```

Requires an SSH key added under GitHub → **Settings → SSH and GPG keys**.

## Vercel environment variables (production)

Set these in Vercel **Project → Settings → Environment Variables** for Production (and Preview if you use preview deployments):

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Supabase project URL for server-side API routes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server only; never expose to the browser) |
| `LEADS_ENCRYPTION_KEY` | Base64-encoded 32-byte AES key; required for loan-insight lead writes in production |
| `ADMIN_EMAIL` | Admin login email for `/admin/login` |
| `ADMIN_PASSWORD` | Admin login password |
| `ADMIN_SESSION_SECRET` | Secret used to sign admin session cookies |

Optional:

| Variable | Purpose |
|----------|---------|
| `MONITORING_ALERT_WEBHOOK_URL` | Webhook for critical persistence/encryption alerts |
| `NEXT_PUBLIC_GA_ID` | GA4 measurement ID |

On Vercel, `VERCEL_ENV` is set automatically (`production`, `preview`, `development`). APIs derive a deployment label via `lib/admin/deploymentEnv.ts` (same value stored on `public.leads.env`).

## Admin (`/admin/leads`)

### Completed leads tab

- Lists `public.leads` where `source = 'eligibility'` and **`env` matches the current deployment** (`production` on prod, `preview` on preview, `development` for local `next dev`).
- Ensure Supabase has the `env` column on `leads` and rows are backfilled where needed (see `LoanAnalysis/supabase_schema.sql`).

### Funnel (partial) tab

- Reads `public.loan_insight_events` for `fast_capital_progress` and `fast_capital_abandon`.
- Rows are filtered by **`payload.app_env`** matching the current deployment (set server-side on insert). There is **no** separate `env` column on `loan_insight_events`.
- Payloads may include **PII** (`contact_name`, `contact_email`, `contact_phone`, `company_name`) for ops; restrict admin access accordingly.

### Vercel CLI auth

- If deploy fails with an invalid token, run `npx vercel login` locally, then `npx vercel deploy --prod --yes`.

## Map Domain (`axirocapital.com`)

1. In Vercel (`Project -> Settings -> Domains`), add:
   - `axirocapital.com`
   - `www.axirocapital.com`
2. In Squarespace DNS, set:
   - `A` record: host `@`, value `76.76.21.21`
   - `CNAME` record: host `www`, value `cname.vercel-dns.com`
3. Remove conflicting legacy website records:
   - old `A` records for host `@` pointing to Squarespace website IPs
   - old `CNAME` for host `www` pointing to Squarespace website host
4. Keep non-website records intact:
   - email-related TXT/SPF/DKIM records
   - `_domainconnect` CNAME record
5. Back in Vercel:
   - choose a primary domain
   - enable redirect from secondary domain
   - confirm certificate/HTTPS status

## Validation Checklist

- `axirocapital.com` resolves and loads site
- `www.axirocapital.com` resolves and redirects per primary-domain setting
- Secondary Vercel deployment URL responds with the same build
- Vercel domain status shows configured/valid
- TLS certificate active for both hostnames

## Notes

- DNS propagation can complete in minutes but may take up to 24-48 hours in some cases.
- If Vercel briefly shows invalid configuration, wait and re-check after propagation.
