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
2. Deploy to production:
   - `npx vercel deploy --prod --yes`
3. Confirm deployment readiness:
   - Open Vercel project deployment inspector and verify `READY` state
4. Validate domain alias:
   - Confirm deployment is aliased to `https://axirocapital.com`

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
