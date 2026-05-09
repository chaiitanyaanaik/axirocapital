"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";

import { ELIGIBILITY_QUESTIONS } from "@/lib/eligibility/questionnaire";
import { calculateEligibilityResult, mapFastCapitalAnswersToBuckets } from "@/lib/eligibility/scoring";
import { trackEvent } from "@/lib/gtag";
import { normalizeToIndianMobile10, validateIndianMobile } from "@/lib/validation/mobile";

import { formCopy } from "./copy";

const ANALYSIS_MS = 2500;

const sessionId =
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `fc-${Date.now()}`;

type FlowPhase = "step1" | "step2" | "analysis";

const turnoverQ = ELIGIBILITY_QUESTIONS.find((q) => q.id === "turnover")!;
const vintageQ = ELIGIBILITY_QUESTIONS.find((q) => q.id === "vintage")!;
const emiQ = ELIGIBILITY_QUESTIONS.find((q) => q.id === "emi")!;

const fieldLabelClass = "mb-1.5 block text-sm font-semibold text-slate-900";
const fieldControlClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100";

const PROGRESS_DEBOUNCE_MS = 3500;

const postFunnelEvent = async (
  eventName: "fast_capital_progress" | "fast_capital_abandon",
  payload: Record<string, unknown>,
) => {
  try {
    await fetch("/api/funnel/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, event_name: eventName, payload }),
    });
  } catch {
    /* non-blocking */
  }
};

const sendFunnelAbandonBeacon = (payload: Record<string, unknown>) => {
  try {
    const body = JSON.stringify({
      session_id: sessionId,
      event_name: "fast_capital_abandon",
      payload,
    });
    const blob = new Blob([body], { type: "application/json" });
    if (typeof navigator !== "undefined" && navigator.sendBeacon("/api/funnel/event", blob)) {
      return;
    }
    void fetch("/api/funnel/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    /* ignore */
  }
};

export function FastCapitalLeadFlow() {
  const router = useRouter();
  const pagePath = usePathname() ?? "";
  const [phase, setPhase] = useState<FlowPhase>("step1");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [turnover, setTurnover] = useState<string | null>(null);
  const [vintage, setVintage] = useState<string | null>(null);
  const [emi, setEmi] = useState<string | null>(null);

  const normalizedName = name.trim();
  const phoneValidation = useMemo(() => validateIndianMobile(phone), [phone]);
  const normalizedPhone = phoneValidation.normalized10;
  const normalizedEmail = email.trim();
  const isNameValid = normalizedName.length >= 2;
  const isPhoneValid = phoneValidation.isValid;
  const isEmailValid =
    normalizedEmail.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

  const firstThreeValid = isNameValid && isPhoneValid && turnover !== null;
  const step1Complete = firstThreeValid && vintage !== null;
  const step2Complete = emi !== null && isEmailValid;

  const buckets = useMemo(
    () =>
      mapFastCapitalAnswersToBuckets({
        turnover: turnover ?? undefined,
        vintage: vintage ?? undefined,
        emi: emi ?? undefined,
      }),
    [turnover, vintage, emi],
  );

  const localResult = useMemo(
    () => (buckets ? calculateEligibilityResult(buckets) : null),
    [buckets],
  );

  const flowStartedRef = useRef(false);
  const abandonSentRef = useRef(false);
  const leadSavedRef = useRef(false);
  const suppressAbandonRef = useRef(false);
  const prevPhaseRef = useRef<FlowPhase | null>(null);

  const coarseProgress = useMemo(() => {
    let fieldsStartedCount = 0;
    if (normalizedName.length > 0) fieldsStartedCount += 1;
    if (phone.trim().length > 0) fieldsStartedCount += 1;
    if (turnover !== null) fieldsStartedCount += 1;
    if (vintage !== null) fieldsStartedCount += 1;
    if (company.trim().length > 0) fieldsStartedCount += 1;
    if (emi !== null) fieldsStartedCount += 1;
    if (normalizedEmail.length > 0) fieldsStartedCount += 1;

    const phoneForPayload = normalizeToIndianMobile10(phone);
    const contact_phone = phoneForPayload.length > 0 ? phoneForPayload.slice(0, 10) : null;

    return {
      page_path: pagePath || "/",
      phase,
      fields_started_count: fieldsStartedCount,
      has_name_input: normalizedName.length > 0,
      has_phone_input: phone.trim().length > 0,
      has_company_input: company.trim().length > 0,
      has_email_input: normalizedEmail.length > 0,
      turnover_key: turnover,
      vintage_key: vintage,
      emi_key: emi,
      step1_complete: step1Complete,
      step2_complete: step2Complete,
      contact_name: normalizedName.length > 0 ? normalizedName : null,
      contact_email: normalizedEmail.length > 0 ? normalizedEmail : null,
      contact_phone,
      company_name: company.trim().length > 0 ? company.trim() : null,
    };
  }, [
    pagePath,
    phase,
    normalizedName,
    phone,
    turnover,
    vintage,
    company,
    emi,
    normalizedEmail,
    step1Complete,
    step2Complete,
  ]);

  useEffect(() => {
    if (typeof sessionStorage === "undefined") return;
    if (sessionStorage.getItem(`axiro-fc-lead-${sessionId}`) === "1") {
      leadSavedRef.current = true;
    }
    if (sessionStorage.getItem(`axiro-fc-abandon-${sessionId}`) === "1") {
      abandonSentRef.current = true;
    }
  }, []);

  const hasInteraction = useMemo(
    () =>
      normalizedName.length > 0 ||
      phone.trim().length > 0 ||
      company.trim().length > 0 ||
      normalizedEmail.length > 0 ||
      turnover !== null ||
      vintage !== null ||
      emi !== null,
    [normalizedName, phone, company, normalizedEmail, turnover, vintage, emi],
  );

  useEffect(() => {
    if (!hasInteraction || flowStartedRef.current) return;
    flowStartedRef.current = true;
    trackEvent("fast_capital_flow_started", {
      page_path: pagePath || "/",
      session_id: sessionId,
    });
  }, [hasInteraction, pagePath]);

  useEffect(() => {
    if (prevPhaseRef.current === null) {
      prevPhaseRef.current = phase;
      return;
    }
    if (prevPhaseRef.current === phase) return;
    prevPhaseRef.current = phase;
    trackEvent("fast_capital_phase", {
      phase,
      page_path: pagePath || "/",
      session_id: sessionId,
    });
    void postFunnelEvent("fast_capital_progress", { ...coarseProgress });
  }, [phase, pagePath, coarseProgress]);

  useEffect(() => {
    if (!hasInteraction) return;
    const t = window.setTimeout(() => {
      if (!flowStartedRef.current || abandonSentRef.current || leadSavedRef.current) return;
      trackEvent("fast_capital_field_progress", {
        page_path: pagePath || "/",
        session_id: sessionId,
        fields_started_count: coarseProgress.fields_started_count,
        turnover_selected: turnover !== null,
        vintage_selected: vintage !== null,
        emi_selected: emi !== null,
        step1_complete: step1Complete,
        step2_complete: step2Complete,
        has_name_input: coarseProgress.has_name_input,
        has_phone_input: coarseProgress.has_phone_input,
        has_company_input: coarseProgress.has_company_input,
        has_email_input: coarseProgress.has_email_input,
      });
      void postFunnelEvent("fast_capital_progress", { ...coarseProgress });
    }, PROGRESS_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [
    coarseProgress,
    pagePath,
    turnover,
    vintage,
    emi,
    step1Complete,
    step2Complete,
    hasInteraction,
  ]);

  useEffect(() => {
    const fireAbandon = () => {
      if (
        !flowStartedRef.current ||
        leadSavedRef.current ||
        abandonSentRef.current ||
        suppressAbandonRef.current
      ) {
        return;
      }
      abandonSentRef.current = true;
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem(`axiro-fc-abandon-${sessionId}`, "1");
      }
      const lastPhase = phase;
      trackEvent("fast_capital_abandon", {
        page_path: pagePath || "/",
        session_id: sessionId,
        last_phase: lastPhase,
      });
      sendFunnelAbandonBeacon({
        ...coarseProgress,
        last_phase: lastPhase,
      });
    };

    const onHidden = () => {
      if (document.visibilityState !== "hidden") return;
      fireAbandon();
    };

    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("pagehide", fireAbandon);
    return () => {
      document.removeEventListener("visibilitychange", onHidden);
      window.removeEventListener("pagehide", fireAbandon);
    };
  }, [phase, pagePath, coarseProgress]);

  useEffect(() => {
    if (phase !== "analysis" || !buckets) return;
    const fallbackResult = localResult;
    if (!fallbackResult) return;

    let cancelled = false;
    void (async () => {
      const startMs = Date.now();
      let resolvedResult = fallbackResult;
      try {
        const response = await fetch("/api/eligibility/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...buckets, session_id: sessionId }),
        });
        if (response.ok) {
          resolvedResult = await response.json();
        }
      } catch {
        /* local fallback */
      }

      const remainingMs = Math.max(0, ANALYSIS_MS - (Date.now() - startMs));
      if (remainingMs > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remainingMs));
      }
      if (cancelled) return;

      let leadSubmitted = false;
      let leadError: string | null = null;

      if (isNameValid && isPhoneValid && isEmailValid) {
        const storageKey = `axiro-fc-lead-${sessionId}`;
        const alreadyPosted =
          typeof sessionStorage !== "undefined" && sessionStorage.getItem(storageKey) === "1";
        if (alreadyPosted) {
          leadSubmitted = true;
          leadSavedRef.current = true;
        } else {
          try {
            const response = await fetch("/api/eligibility/lead", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                session_id: sessionId,
                ...buckets,
                tier: resolvedResult.tier,
                score: resolvedResult.score,
                lead_metadata: {
                  name: normalizedName,
                  phone: normalizedPhone,
                  email: normalizedEmail || undefined,
                  company_name: company.trim() || undefined,
                },
              }),
            });
            if (response.ok) {
              if (typeof sessionStorage !== "undefined") {
                sessionStorage.setItem(storageKey, "1");
              }
              leadSubmitted = true;
              leadSavedRef.current = true;
              trackEvent("fast_capital_lead_saved", {
                page_path: pagePath || "/",
                session_id: sessionId,
                tier: resolvedResult.tier,
                score: resolvedResult.score,
              });
            } else {
              const payload = (await response.json()) as { error?: string; detail?: string };
              const detail = payload.detail ? ` (${payload.detail})` : "";
              leadError = `${payload.error ?? "Unable to save details right now."}${detail}`;
            }
          } catch {
            leadError = "Unable to save details right now.";
          }
        }
      }

      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem(
          `axiro-fc-result-${sessionId}`,
          JSON.stringify({
            sessionId,
            buckets,
            result: resolvedResult,
            createdAt: new Date().toISOString(),
            leadSubmitted,
            leadError,
          }),
        );
      }
      suppressAbandonRef.current = true;
      router.push(`/fast-capital/result?sid=${sessionId}`);
    })();

    return () => {
      cancelled = true;
    };
  }, [
    phase,
    buckets,
    localResult,
    router,
    isNameValid,
    isPhoneValid,
    isEmailValid,
    normalizedName,
    normalizedPhone,
    normalizedEmail,
    company,
    pagePath,
  ]);

  const goStep2 = () => {
    if (!step1Complete) return;
    setPhase("step2");
  };

  const runAnalysis = () => {
    if (!step2Complete || !buckets) return;
    setPhase("analysis");
  };

  const analysisOverlay =
    phase === "analysis" && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#f9fbfc] px-4">
            <div className="w-full max-w-3xl rounded-3xl border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <div className="px-5 py-16 text-center sm:px-7 sm:py-20">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50">
                  <span className="material-symbols-outlined animate-spin text-2xl text-emerald-600">
                    progress_activity
                  </span>
                </div>
                <p className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Analyzing your profile…</p>
                <p className="mx-auto mt-3 max-w-xl text-lg leading-relaxed text-slate-600 sm:text-2xl">
                  Checking your responses against lender-facing eligibility signals.
                </p>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div
        className="scroll-mt-28 rounded-2xl border border-slate-200/80 bg-white text-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
        id="fast-capital-quote-form"
      >
      <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
        <h2 className="text-lg font-bold text-slate-900 sm:text-xl">{formCopy.title}</h2>
        <p className="mt-1 text-sm text-slate-600">{formCopy.subtitle}</p>
        {phase === "step1" || phase === "step2" ? (
          <div className="mt-4 flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  phase === "step1" ? "bg-primary-container text-white" : "bg-emerald-600 text-white"
                }`}
              >
                1
              </span>
              <span
                className={`text-sm font-semibold ${phase === "step1" ? "text-primary-container" : "text-slate-500"}`}
              >
                {formCopy.step1Label}
              </span>
            </div>
            <div className="h-px flex-1 bg-slate-200" />
            <div className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  phase === "step2" ? "bg-primary-container text-white" : "bg-slate-200 text-slate-500"
                }`}
              >
                2
              </span>
              <span
                className={`text-sm font-semibold ${phase === "step2" ? "text-primary-container" : "text-slate-500"}`}
              >
                {formCopy.step2Label}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {phase === "step1" ? (
        <div className="space-y-4 px-4 py-5 sm:px-6 sm:py-6">
          <div>
            <label className={fieldLabelClass} htmlFor="fast-capital-name">
              Full name
            </label>
            <input
              autoComplete="name"
              className={`${fieldControlClass} placeholder:text-slate-400`}
              id="fast-capital-name"
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              value={name}
            />
          </div>
          <div>
            <label className={fieldLabelClass} htmlFor="fast-capital-phone">
              Mobile
            </label>
            <input
              autoComplete="tel"
              className={`${fieldControlClass} placeholder:text-slate-400`}
              id="fast-capital-phone"
              inputMode="numeric"
              maxLength={10}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
              value={phone}
            />
            {!isPhoneValid && phone.trim().length > 0 ? (
              <p className="mt-1 text-xs text-red-600">
                {phoneValidation.error ?? "Enter a valid mobile number."}
              </p>
            ) : null}
          </div>
          <div>
            <label className={fieldLabelClass} htmlFor="fast-capital-turnover">
              {turnoverQ.question}
            </label>
            <select
              className={fieldControlClass}
              id="fast-capital-turnover"
              onChange={(e) => {
                const v = e.target.value;
                setTurnover(v === "" ? null : v);
              }}
              value={turnover ?? ""}
            >
              <option value="">Select annual turnover / sales</option>
              {turnoverQ.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          {firstThreeValid ? (
            <div>
              <label className={fieldLabelClass} htmlFor="fast-capital-vintage">
                {vintageQ.question}
              </label>
              <select
                className={fieldControlClass}
                id="fast-capital-vintage"
                onChange={(e) => {
                  const v = e.target.value;
                  setVintage(v === "" ? null : v);
                }}
                value={vintage ?? ""}
              >
                <option value="">Select operational tenure</option>
                {vintageQ.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <button
            className="w-full rounded-xl bg-primary-container py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-200/30 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            disabled={!step1Complete}
            onClick={goStep2}
            type="button"
          >
            {formCopy.step1Continue}
          </button>
        </div>
      ) : null}

      {phase === "step2" ? (
        <div className="space-y-4 px-4 py-5 sm:px-6 sm:py-6">
          <button
            className="flex items-center gap-1 text-sm font-semibold text-emerald-700"
            onClick={() => setPhase("step1")}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back
          </button>
          <div>
            <label className={fieldLabelClass} htmlFor="fast-capital-emi">
              {emiQ.question}
            </label>
            <select
              className={fieldControlClass}
              id="fast-capital-emi"
              onChange={(e) => {
                const v = e.target.value;
                setEmi(v === "" ? null : v);
              }}
              value={emi ?? ""}
            >
              <option value="">Select EMI vs monthly turnover</option>
              {emiQ.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={fieldLabelClass} htmlFor="fast-capital-company">
              Company name
            </label>
            <input
              autoComplete="organization"
              className={`${fieldControlClass} placeholder:text-slate-400`}
              id="fast-capital-company"
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company name"
              value={company}
            />
          </div>
          <div>
            <label className={fieldLabelClass} htmlFor="fast-capital-email">
              Email (optional)
            </label>
            <input
              autoComplete="email"
              className={`${fieldControlClass} placeholder:text-slate-400`}
              id="fast-capital-email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              type="email"
              value={email}
            />
            {!isEmailValid ? (
              <p className="mt-1 text-xs text-red-600">Enter a valid email or leave blank.</p>
            ) : null}
          </div>
          <button
            className="w-full rounded-xl bg-primary-container py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-200/30 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            disabled={!step2Complete}
            onClick={runAnalysis}
            type="button"
          >
            {formCopy.step2Submit}
          </button>
        </div>
      ) : null}

      </div>
      {analysisOverlay}
    </>
  );
}
