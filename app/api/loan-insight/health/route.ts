import { NextResponse } from "next/server";

import { hasEncryptionKey } from "@/lib/loanInsight/crypto";

const isProduction = process.env.NODE_ENV === "production";

export async function GET() {
  const encryptionKeyPresent = hasEncryptionKey();
  const supabaseConfigured = Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
  const webhookConfigured = Boolean(process.env.MONITORING_ALERT_WEBHOOK_URL);
  const aiApiKeyConfigured = Boolean(process.env.OPENAI_API_KEY);
  const aiModelConfigured = Boolean(process.env.AI_MODEL);

  const checks = {
    encryption_key: {
      required: isProduction,
      present: encryptionKeyPresent,
      status: isProduction && !encryptionKeyPresent ? "fail" : "pass",
    },
    supabase: {
      required: false,
      present: supabaseConfigured,
      status: supabaseConfigured ? "pass" : "warn",
    },
    alerting_webhook: {
      required: false,
      present: webhookConfigured,
      status: webhookConfigured ? "pass" : "warn",
    },
    ai_api_key: {
      required: false,
      present: aiApiKeyConfigured,
      status: aiApiKeyConfigured ? "pass" : "warn",
    },
    ai_model: {
      required: false,
      present: aiModelConfigured,
      status: aiModelConfigured ? "pass" : "warn",
    },
  } as const;

  const overallStatus =
    checks.encryption_key.status === "fail"
      ? "fail"
      : checks.supabase.status === "warn" ||
          checks.alerting_webhook.status === "warn" ||
          checks.ai_api_key.status === "warn" ||
          checks.ai_model.status === "warn"
        ? "warn"
        : "pass";

  return NextResponse.json(
    {
      ok: overallStatus !== "fail",
      status: overallStatus,
      service: "loan-insight",
      env: process.env.NODE_ENV ?? "unknown",
      checks,
      ts: new Date().toISOString(),
    },
    { status: overallStatus === "fail" ? 500 : 200 },
  );
}
