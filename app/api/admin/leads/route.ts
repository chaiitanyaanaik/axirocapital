import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin/auth";
import { decryptPhone } from "@/lib/loanInsight/crypto";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

const parseCookies = (cookieHeader: string | null): Record<string, string> => {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(";").map((entry) => {
      const [rawKey, ...rest] = entry.trim().split("=");
      return [rawKey, decodeURIComponent(rest.join("=") || "")];
    }),
  );
};

export async function GET(req: Request) {
  const cookies = parseCookies(req.headers.get("cookie"));
  const session = verifyAdminSessionToken(cookies[ADMIN_SESSION_COOKIE]);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "Database is not configured." }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("leads")
    .select("id, source, lead_stage, created_at, metadata_json, phone_encrypted, phone_hash, session_id")
    .eq("source", "eligibility")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const leads = (data ?? []).map((row) => {
    const metadata = (row.metadata_json ?? {}) as Record<string, unknown>;
    return {
      id: row.id,
      created_at: row.created_at,
      source: row.source,
      lead_stage: row.lead_stage,
      session_id: row.session_id,
      phone: decryptPhone(row.phone_encrypted),
      phone_hash: row.phone_hash,
      name: metadata.name ?? null,
      email: metadata.email ?? null,
      company_name: metadata.company_name ?? null,
      tier: metadata.tier ?? null,
      score: metadata.score ?? null,
      turnover_bucket: metadata.turnover_bucket ?? null,
      vintage_bucket: metadata.vintage_bucket ?? null,
      gst_bucket: metadata.gst_bucket ?? null,
      emi_bucket: metadata.emi_bucket ?? null,
      credit_bucket: metadata.credit_bucket ?? null,
    };
  });

  return NextResponse.json({ ok: true, leads });
}
