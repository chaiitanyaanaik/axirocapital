"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { ELIGIBILITY_QUESTIONS, type EligibilityAnswers } from "@/lib/eligibility/questionnaire";
import {
  calculateEligibilityResult,
  mapAnswersToEligibilityBuckets,
} from "@/lib/eligibility/scoring";

type FlowPhase = "questions" | "analysis";

const ANALYSIS_MS = 2500;
const sessionId =
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `elig-${Date.now()}`;

export function EligibilityFlow() {
  const router = useRouter();
  const [phase, setPhase] = useState<FlowPhase>("questions");
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<EligibilityAnswers>({});
  const autoAdvanceTimerRef = useRef<number | null>(null);

  const totalSteps = ELIGIBILITY_QUESTIONS.length;
  const currentQuestion = ELIGIBILITY_QUESTIONS[stepIndex];
  const selectedValue = currentQuestion ? answers[currentQuestion.id] ?? null : null;

  const progressPct = useMemo(() => {
    if (phase === "questions") {
      return Math.round((stepIndex / totalSteps) * 100);
    }
    if (phase === "analysis") return 92;
    return 100;
  }, [phase, stepIndex, totalSteps]);

  const localEligibilityResult = useMemo(() => {
    const buckets = mapAnswersToEligibilityBuckets(answers);
    if (!buckets) return null;
    return calculateEligibilityResult(buckets);
  }, [answers]);

  useEffect(() => {
    if (phase !== "analysis") return;
    const buckets = mapAnswersToEligibilityBuckets(answers);
    const fallbackResult = localEligibilityResult;
    if (!buckets || !fallbackResult) return;

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
        // local result fallback
      }

      const remainingMs = Math.max(0, ANALYSIS_MS - (Date.now() - startMs));
      if (remainingMs > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remainingMs));
      }
      if (cancelled) return;

      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem(
          `axiro-eligibility-result-${sessionId}`,
          JSON.stringify({
            sessionId,
            buckets,
            result: resolvedResult,
            createdAt: new Date().toISOString(),
          }),
        );
      }
      router.push(`/eligibility/result?sid=${sessionId}`);
    })();

    return () => {
      cancelled = true;
    };
  }, [answers, localEligibilityResult, phase, router]);

  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current !== null) {
        window.clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, []);

  const onSelect = (value: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    if (autoAdvanceTimerRef.current !== null) {
      window.clearTimeout(autoAdvanceTimerRef.current);
    }
    autoAdvanceTimerRef.current = window.setTimeout(() => {
      if (stepIndex < totalSteps - 1) {
        setStepIndex((prev) => prev + 1);
        return;
      }
      setPhase("analysis");
    }, 180);
  };

  const onBack = () => {
    if (autoAdvanceTimerRef.current !== null) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    if (phase === "analysis") {
      setPhase("questions");
      setStepIndex(totalSteps - 1);
      return;
    }
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  };

  const onClose = () => {
    if (autoAdvanceTimerRef.current !== null) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    router.push("/");
  };

  return (
    <main className="relative min-h-screen bg-surface pt-24 sm:pt-24">
      <div className="mesh-gradient" />
      <section className="mx-auto w-full max-w-3xl px-3 pb-4 sm:px-6 sm:pb-8">
        <div className="relative z-10 overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <header className="bg-white px-3 py-1.5 sm:px-6 sm:py-3">
            {phase === "questions" ? (
              <div className="mb-2.5 flex items-center justify-between sm:mb-3">
                <button
                  aria-label="Go back"
                  className="rounded-full p-2 text-emerald-600 transition hover:bg-emerald-50 disabled:text-slate-300"
                  disabled={stepIndex === 0}
                  onClick={onBack}
                  type="button"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <p className="text-base font-semibold text-slate-700 sm:text-lg">
                  {`Step ${stepIndex + 1} of ${totalSteps}`}
                </p>
                <button
                  aria-label="Close flow"
                  className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100"
                  onClick={onClose}
                  type="button"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            ) : (
              <div className="flex justify-end">
                <button
                  aria-label="Close flow"
                  className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100"
                  onClick={onClose}
                  type="button"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            )}
            {phase === "questions" ? (
              <div className="h-1 w-full rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-primary-container transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            ) : null}
          </header>

          {phase === "questions" && currentQuestion ? (
            <div className="p-3.5 sm:p-6">
              {stepIndex === 0 ? (
                <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[13px] font-semibold text-emerald-700 sm:gap-2 sm:px-3 sm:py-1.5 sm:text-sm">
                  <span className="material-symbols-outlined text-[16px]">description</span>
                  Takes 30 seconds. No documents required.
                </div>
              ) : null}
              <h1 className="mt-1 text-[28px] font-semibold leading-[1.15] tracking-tight text-slate-900 sm:text-[32px]">
                {currentQuestion.question}
              </h1>
              {currentQuestion.tipText ? (
                <p className="mt-3 text-sm text-slate-600">{currentQuestion.tipText}</p>
              ) : null}
              {currentQuestion.helpText ? (
                <p className="mt-2.5 text-[15px] leading-relaxed text-slate-500 sm:mt-3 sm:text-sm">{currentQuestion.helpText}</p>
              ) : null}

              <div className="mt-3.5 grid gap-2.5 sm:mt-4 sm:gap-3">
                {currentQuestion.options.map((opt) => {
                  const selected = selectedValue === opt.value;
                  return (
                    <button
                      key={opt.value}
                      className={`flex items-center justify-between rounded-xl border bg-white px-3 py-2.5 text-left transition sm:px-4 sm:py-3 ${
                        selected
                          ? "border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-100"
                          : "border-slate-200 hover:border-emerald-200"
                      }`}
                      onClick={() => onSelect(opt.value)}
                      type="button"
                    >
                      <span className="text-[16px] font-medium text-slate-700 sm:text-[18px]">{opt.label}</span>
                      <span
                        className={`h-5 w-5 rounded-full border-2 sm:h-6 sm:w-6 ${
                          selected ? "border-emerald-500 bg-emerald-500/10" : "border-slate-300"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {phase === "analysis" ? (
            <div className="p-8 text-center sm:p-12">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50">
                <span className="material-symbols-outlined animate-spin text-3xl text-emerald-600">
                  progress_activity
                </span>
              </div>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Analyzing your profile...
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base text-slate-600 sm:text-lg">
                Checking your responses against lender-facing eligibility signals.
              </p>
            </div>
          ) : null}

        </div>
      </section>

    </main>
  );
}
