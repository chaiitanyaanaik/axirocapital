import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import { encryptPhone, hashForIdempotency } from "@/lib/loanInsight/crypto";
import { hashPhone, maskPhone } from "@/lib/loanInsight/privacy";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

type LeadRequest = {
  session_id: string;
  turnover_bucket: number;
  vintage_bucket: number;
  gst_bucket: number;
  emi_bucket: number;
  credit_bucket: number;
  tier: number;
  score: number;
  lead_metadata: {
    name: string;
    phone: string;
    email?: string;
    company_name?: string;
  };
};

const isValidBucket = (value: number, min: number, max: number): boolean =>
  Number.isInteger(value) && value >= min && value <= max;

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<LeadRequest>;
  const turnover = body.turnover_bucket ?? NaN;
  const vintage = body.vintage_bucket ?? NaN;
  const gst = body.gst_bucket ?? NaN;
  const emi = body.emi_bucket ?? NaN;
  const credit = body.credit_bucket ?? NaN;
  const tier = body.tier ?? NaN;
  const score = body.score ?? NaN;
  const phone = body.lead_metadata?.phone?.trim() ?? "";
  const name = body.lead_metadata?.name?.trim() ?? "";

  if (
    !body.session_id ||
    !isValidBucket(turnover, 1, 5) ||
    !isValidBucket(vintage, 1, 5) ||
    !isValidBucket(gst, 1, 4) ||
    !isValidBucket(emi, 1, 5) ||
    !isValidBucket(credit, 1, 4) ||
    !isValidBucket(tier, 1, 4) ||
    !name ||
    phone.replace(/\D/g, "").length < 10
  ) {
    return NextResponse.json(
      { ok: false, error: "Invalid payload for eligibility lead capture." },
      { status: 400 },
    );
  }

  const leadId = randomUUID();
  const phoneHash = hashPhone(phone);
  const idempotencyKey = hashForIdempotency(body.session_id, phoneHash);
  const createdAt = new Date().toISOString();
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      {
        ok: false,
        error: "Database is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      },
      { status: 500 },
    );
  }

  const { error } = await supabase.from("leads").upsert(
    {
      id: leadId,
      phone_encrypted: encryptPhone(phone),
      phone_hash: phoneHash,
      session_id: body.session_id,
      user_id: null,
      idempotency_key: idempotencyKey,
      source: "eligibility",
      lead_stage: "eligibility_result",
      top_scenarios: null,
      cluster_snapshot: `tier_${tier}`,
      metadata_json: {
        name,
        email: body.lead_metadata?.email ?? null,
        company_name: body.lead_metadata?.company_name ?? null,
        turnover_bucket: turnover,
        vintage_bucket: vintage,
        gst_bucket: gst,
        emi_bucket: emi,
        credit_bucket: credit,
        tier,
        score,
      },
      created_at: createdAt,
    },
    { onConflict: "phone_hash,session_id" },
  );
  if (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to store lead.",
        detail: error.message,
        hint: error.details ?? null,
      },
      { status: 500 },
    );
  }

  await supabase.from("loan_insight_events").insert({
    event_id: randomUUID(),
    session_id: body.session_id,
    user_id: null,
    event_name: "eligibility_lead_submitted",
    payload: {
      lead_id: leadId,
      phone_masked: maskPhone(phone),
      tier,
      score,
    },
    created_at: createdAt,
  });

  return NextResponse.json({
    ok: true,
    lead_id: leadId,
    phone_masked: maskPhone(phone),
  });
}
