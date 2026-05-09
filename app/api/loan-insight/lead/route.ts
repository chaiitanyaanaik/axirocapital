import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import { getDeploymentEnv } from "@/lib/admin/deploymentEnv";
import { encryptPhone, hashForIdempotency, hasEncryptionKey } from "@/lib/loanInsight/crypto";
import { hashPhone, maskPhone } from "@/lib/loanInsight/privacy";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { validateIndianMobile } from "@/lib/validation/mobile";

type JsonValue = string | number | boolean | null | { [key: string]: JsonValue } | JsonValue[];

type LeadPayload = {
  phone: string;
  sessionId: string;
  userId?: string;
  idempotencyKey?: string;
  source?: string;
  leadStage?: "gate2" | "gate3";
  topScenarios?: string[];
  cluster?: string;
  meta?: { [key: string]: JsonValue };
};

type StoredLead = {
  leadId: string;
  sessionId: string;
  userId?: string;
  phoneRaw: string;
  phoneEncrypted: string;
  phoneMasked: string;
  phoneHash: string;
  idempotencyKey: string;
  source?: string;
  leadStage?: "gate2" | "gate3";
  topScenarios?: string[];
  cluster?: string;
  createdAt: string;
  meta?: { [key: string]: JsonValue };
};

const idempotencyMap = new Map<string, StoredLead>();
const inMemoryPrimaryDb = new Map<string, StoredLead>();
const isProduction = process.env.NODE_ENV === "production";
const leadEnv = getDeploymentEnv();

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const reportCritical = async (message: string, context: Record<string, unknown>) => {
  console.error(`[CRITICAL][loan-insight] ${message}`, context);
  const webhook = process.env.MONITORING_ALERT_WEBHOOK_URL;
  if (!webhook) return;
  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        level: "critical",
        service: "loan-insight-lead-api",
        message,
        context,
        ts: new Date().toISOString(),
      }),
    });
  } catch {
    // Never block request flow if alerting endpoint fails.
  }
};

const validatePayload = (body: Partial<LeadPayload>): body is LeadPayload =>
  Boolean(body.phone && body.sessionId && validateIndianMobile(body.phone).isValid);

const persistLead = async (lead: StoredLead): Promise<void> => {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    // Fallback for local/no DB environments.
    inMemoryPrimaryDb.set(lead.leadId, lead);
    return;
  }

  const { error } = await supabase.from("leads").upsert(
    {
      id: lead.leadId,
      phone_encrypted: lead.phoneEncrypted,
      phone_hash: lead.phoneHash,
      session_id: lead.sessionId,
      user_id: lead.userId ?? null,
      idempotency_key: lead.idempotencyKey,
      env: leadEnv,
      source: lead.source ?? "loan_insight",
      lead_stage: lead.leadStage ?? null,
      top_scenarios: lead.topScenarios ?? null,
      cluster_snapshot: lead.cluster ?? null,
      metadata_json: lead.meta ?? null,
      created_at: lead.createdAt,
    },
    { onConflict: "phone_hash,session_id" },
  );

  if (error) {
    throw error;
  }

  // Optional separate event sink; keep non-blocking semantics by swallowing errors.
  await supabase.from("loan_insight_events").insert({
    event_id: randomUUID(),
    session_id: lead.sessionId,
    user_id: lead.userId ?? null,
    event_name: "lead_submitted",
    payload: {
      lead_id: lead.leadId,
      phone_masked: lead.phoneMasked,
      phone_hash: lead.phoneHash,
      lead_stage: lead.leadStage ?? null,
      app_env: leadEnv,
    },
    created_at: lead.createdAt,
  });

  inMemoryPrimaryDb.set(lead.leadId, lead);
};

const persistWithRetry = async (lead: StoredLead, retries = 2): Promise<void> => {
  let attempt = 0;
  let lastError: unknown;
  while (attempt <= retries) {
    try {
      await persistLead(lead);
      return;
    } catch (error) {
      lastError = error;
      attempt += 1;
      await wait(120 * attempt);
    }
  }
  throw lastError;
};

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<LeadPayload>;
  if (!validatePayload(body)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid payload. Required: phone, sessionId, idempotencyKey.",
      },
      { status: 400 },
    );
  }

  const phoneValidation = validateIndianMobile(body.phone);
  const normalizedPhone = phoneValidation.normalized10;
  const phoneHash = hashPhone(normalizedPhone);
  const derivedIdempotency = hashForIdempotency(body.sessionId, phoneHash);
  const key = `${body.sessionId}:${body.idempotencyKey ?? derivedIdempotency}`;

  if (!hasEncryptionKey()) {
    if (isProduction) {
      await reportCritical("Missing LEADS_ENCRYPTION_KEY in production", {
        sessionId: body.sessionId,
        phoneHash,
        route: "/api/loan-insight/lead",
      });
      return NextResponse.json(
        {
          ok: false,
          error: "Encryption key missing. Unable to save lead right now.",
          code: "ENCRYPTION_KEY_MISSING",
        },
        { status: 500 },
      );
    }
    console.warn("[WARN][loan-insight] LEADS_ENCRYPTION_KEY missing, using plaintext fallback", {
      env: process.env.NODE_ENV,
      sessionId: body.sessionId,
      route: "/api/loan-insight/lead",
    });
  }

  const existing = idempotencyMap.get(key);
  if (existing) {
    return NextResponse.json({
      ok: true,
      deduped: true,
      leadId: existing.leadId,
      phoneMasked: existing.phoneMasked,
      phoneHash: existing.phoneHash,
    });
  }

  const encryptedPhone = encryptPhone(normalizedPhone);
  const lead: StoredLead = {
    leadId: randomUUID(),
    sessionId: body.sessionId,
    userId: body.userId,
    phoneRaw: normalizedPhone,
    phoneEncrypted: encryptedPhone,
    phoneMasked: maskPhone(normalizedPhone),
    phoneHash,
    idempotencyKey: body.idempotencyKey ?? derivedIdempotency,
    source: body.source ?? "loan_insight",
    leadStage: body.leadStage,
    topScenarios: body.topScenarios,
    cluster: body.cluster,
    createdAt: new Date().toISOString(),
    meta: body.meta,
  };

  try {
    await persistWithRetry(lead, 2);
    idempotencyMap.set(key, lead);
    return NextResponse.json({
      ok: true,
      deduped: false,
      leadId: lead.leadId,
      phoneMasked: lead.phoneMasked,
      phoneHash: lead.phoneHash,
    });
  } catch (error) {
    await reportCritical("Lead persistence failed after retries", {
      sessionId: body.sessionId,
      phoneHash,
      route: "/api/loan-insight/lead",
      error: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to store lead after retries.",
      },
      { status: 500 },
    );
  }
}
