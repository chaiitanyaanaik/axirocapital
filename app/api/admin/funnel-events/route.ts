import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin/auth";
import { getDeploymentEnv } from "@/lib/admin/deploymentEnv";
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

const FUNNEL_EVENT_NAMES = ["fast_capital_progress", "fast_capital_abandon"] as const;

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

  const deploymentEnv = getDeploymentEnv();

  const { data, error } = await supabase
    .from("loan_insight_events")
    .select("id, event_name, session_id, payload, created_at")
    .in("event_name", [...FUNNEL_EVENT_NAMES])
    .order("created_at", { ascending: false })
    .limit(800);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const payloadEnv = (payload: unknown): string | null => {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
    const v = (payload as Record<string, unknown>).app_env;
    return typeof v === "string" ? v : null;
  };

  const events = (data ?? [])
    .filter((row) => payloadEnv(row.payload) === deploymentEnv)
    .slice(0, 500)
    .map((row) => ({
      id: row.id,
      created_at: row.created_at,
      event_name: row.event_name,
      session_id: row.session_id,
      env: payloadEnv(row.payload) ?? deploymentEnv,
      payload: row.payload as Record<string, unknown> | null,
    }));

  return NextResponse.json({ ok: true, events, deployment_env: deploymentEnv });
}
