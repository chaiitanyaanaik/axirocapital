/**
 * Same convention as eligibility leads (`/api/eligibility/lead`):
 * Vercel: `VERCEL_ENV` → production | preview | development
 * Local Next dev: falls back to `development`
 */
export function getDeploymentEnv(): string {
  return process.env.VERCEL_ENV ?? (process.env.NODE_ENV === "production" ? "production" : "development");
}
