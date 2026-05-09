import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import { getDeploymentEnv } from "@/lib/admin/deploymentEnv";
import { getSupabaseAdminClient, type Json } from "@/lib/supabase/server";
import { normalizeToIndianMobile10, validateIndianMobile } from "@/lib/validation/mobile";

const ALLOWED_EVENTS = new Set(["fast_capital_progress", "fast_capital_abandon"]);

const FORBIDDEN_PAYLOAD_KEYS = new Set([
  "name",
  "full_name",
  "first_name",
  "last_name",
  "phone",
  "mobile",
  "email",
  "company",
  "address",
  "password",
  "token",
  "lead_metadata",
]);

const ALLOWED_PAYLOAD_KEYS = new Set([
  "phase",
  "last_phase",
  "page_path",
  "fields_started_count",
  "has_name_input",
  "has_phone_input",
  "has_company_input",
  "has_email_input",
  "turnover_key",
  "vintage_key",
  "emi_key",
  "step1_complete",
  "step2_complete",
  "contact_name",
  "contact_email",
  "contact_phone",
  "company_name",
]);

const MAX_BODY_BYTES = 12_000;
const MAX_SESSION_LEN = 128;
const MAX_PATH_LEN = 512;
const MAX_KEY_LEN = 64;
const MAX_CONTACT_NAME = 120;
const MAX_CONTACT_EMAIL = 254;
const MAX_COMPANY_NAME = 200;

type FunnelBody = {
  session_id?: string;
  event_name?: string;
  payload?: Record<string, unknown>;
};

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const sanitizePayload = (raw: unknown): Json | null => {
  if (!isPlainObject(raw)) return null;
  const out: { [key: string]: Json } = {};
  for (const [k, v] of Object.entries(raw)) {
    const key = k.trim();
    if (!ALLOWED_PAYLOAD_KEYS.has(key) || FORBIDDEN_PAYLOAD_KEYS.has(key)) {
      return null;
    }
    if (
      key === "fields_started_count" &&
      typeof v === "number" &&
      Number.isInteger(v) &&
      v >= 0 &&
      v <= 32
    ) {
      out[key] = v;
      continue;
    }
    if (
      (key === "has_name_input" ||
        key === "has_phone_input" ||
        key === "has_company_input" ||
        key === "has_email_input" ||
        key === "step1_complete" ||
        key === "step2_complete") &&
      typeof v === "boolean"
    ) {
      out[key] = v;
      continue;
    }
    if (key === "phase" || key === "last_phase") {
      if (v === "step1" || v === "step2" || v === "analysis") {
        out[key] = v;
        continue;
      }
      return null;
    }
    if (key === "page_path" && typeof v === "string") {
      const s = v.slice(0, MAX_PATH_LEN);
      if (s.length === 0) return null;
      out[key] = s;
      continue;
    }
    if (key === "turnover_key" || key === "vintage_key" || key === "emi_key") {
      if (v === null) {
        out[key] = null;
        continue;
      }
      if (typeof v === "string" && v.length <= MAX_KEY_LEN) {
        out[key] = v;
        continue;
      }
      return null;
    }
    if (key === "contact_name") {
      if (v === null) {
        out[key] = null;
        continue;
      }
      if (typeof v === "string") {
        const s = v.trim().slice(0, MAX_CONTACT_NAME);
        out[key] = s.length > 0 ? s : null;
        continue;
      }
      return null;
    }
    if (key === "company_name") {
      if (v === null) {
        out[key] = null;
        continue;
      }
      if (typeof v === "string") {
        const s = v.trim().slice(0, MAX_COMPANY_NAME);
        out[key] = s.length > 0 ? s : null;
        continue;
      }
      return null;
    }
    if (key === "contact_email") {
      if (v === null) {
        out[key] = null;
        continue;
      }
      if (typeof v === "string") {
        const s = v.trim().slice(0, MAX_CONTACT_EMAIL);
        if (s.length === 0) {
          out[key] = null;
          continue;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) {
          out[key] = null;
          continue;
        }
        out[key] = s;
        continue;
      }
      return null;
    }
    if (key === "contact_phone") {
      if (v === null) {
        out[key] = null;
        continue;
      }
      let phoneRaw: unknown = v;
      if (typeof phoneRaw === "number" && Number.isFinite(phoneRaw)) {
        phoneRaw = String(Math.trunc(phoneRaw));
      }
      if (typeof phoneRaw === "string") {
        const normalized = normalizeToIndianMobile10(phoneRaw);
        if (normalized.length === 0) {
          out[key] = null;
          continue;
        }
        if (normalized.length === 10) {
          const pv = validateIndianMobile(normalized);
          if (!pv.isValid) {
            out[key] = null;
            continue;
          }
          out[key] = pv.normalized10;
          continue;
        }
        out[key] = normalized;
        continue;
      }
      return null;
    }
    return null;
  }
  return out;
};

export async function POST(req: Request) {
  if (!req.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ ok: false, error: "Expected JSON body." }, { status: 415 });
  }

  const rawText = await req.text();
  if (rawText.length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "Body too large." }, { status: 413 });
  }

  let body: FunnelBody;
  try {
    body = JSON.parse(rawText) as FunnelBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const sessionId = typeof body.session_id === "string" ? body.session_id.trim() : "";
  if (!sessionId || sessionId.length > MAX_SESSION_LEN) {
    return NextResponse.json({ ok: false, error: "Invalid session_id." }, { status: 400 });
  }

  const eventName = typeof body.event_name === "string" ? body.event_name.trim() : "";
  if (!ALLOWED_EVENTS.has(eventName)) {
    return NextResponse.json({ ok: false, error: "Invalid event_name." }, { status: 400 });
  }

  const payloadJson = sanitizePayload(body.payload ?? {});
  if (!payloadJson || !isPlainObject(payloadJson)) {
    return NextResponse.json({ ok: false, error: "Invalid payload." }, { status: 400 });
  }

  if (typeof payloadJson.page_path !== "string") {
    return NextResponse.json({ ok: false, error: "payload.page_path is required." }, { status: 400 });
  }
  if (eventName === "fast_capital_abandon") {
    if (
      payloadJson.last_phase !== "step1" &&
      payloadJson.last_phase !== "step2" &&
      payloadJson.last_phase !== "analysis"
    ) {
      return NextResponse.json({ ok: false, error: "payload.last_phase is required for abandon." }, { status: 400 });
    }
  } else if (payloadJson.phase !== "step1" && payloadJson.phase !== "step2" && payloadJson.phase !== "analysis") {
    return NextResponse.json({ ok: false, error: "payload.phase is required for progress." }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Database is not configured." },
      { status: 500 },
    );
  }

  const createdAt = new Date().toISOString();
  const payloadWithEnv: Json = { ...payloadJson, app_env: getDeploymentEnv() };
  const { error } = await supabase.from("loan_insight_events").insert({
    event_id: randomUUID(),
    session_id: sessionId,
    user_id: null,
    event_name: eventName,
    payload: payloadWithEnv,
    created_at: createdAt,
  });

  if (error) {
    return NextResponse.json(
      { ok: false, error: "Failed to store event.", detail: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
