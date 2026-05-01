import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import { calculateEligibilityResult } from "@/lib/eligibility/scoring";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

type CalculateRequest = {
  turnover_bucket: number;
  vintage_bucket: number;
  gst_bucket: number;
  emi_bucket: number;
  credit_bucket: number;
  session_id?: string;
};

const isValidBucket = (value: number, min: number, max: number): boolean =>
  Number.isInteger(value) && value >= min && value <= max;

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<CalculateRequest>;
  const turnover = body.turnover_bucket ?? NaN;
  const vintage = body.vintage_bucket ?? NaN;
  const gst = body.gst_bucket ?? NaN;
  const emi = body.emi_bucket ?? NaN;
  const credit = body.credit_bucket ?? NaN;

  if (
    !isValidBucket(turnover, 1, 5) ||
    !isValidBucket(vintage, 1, 5) ||
    !isValidBucket(gst, 1, 4) ||
    !isValidBucket(emi, 1, 5) ||
    !isValidBucket(credit, 1, 4)
  ) {
    return NextResponse.json(
      { ok: false, error: "Invalid bucket values in request body." },
      { status: 400 },
    );
  }

  const result = calculateEligibilityResult({
    turnover_bucket: turnover,
    vintage_bucket: vintage,
    gst_bucket: gst,
    emi_bucket: emi,
    credit_bucket: credit,
  });

  const requestId = randomUUID();
  const sessionId = body.session_id ?? "unknown";

  const supabase = getSupabaseAdminClient();
  if (supabase) {
    await supabase.from("loan_insight_events").insert({
      event_id: requestId,
      session_id: sessionId,
      user_id: null,
      event_name: "eligibility_calculated",
      payload: {
        turnover_bucket: turnover,
        vintage_bucket: vintage,
        gst_bucket: gst,
        emi_bucket: emi,
        credit_bucket: credit,
        tier: result.tier,
        score: result.score,
      },
      created_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    tier: result.tier,
    tier_label: result.tier_label,
    headline: result.headline,
    score: result.score,
    color: result.color,
    request_id: requestId,
  });
}
