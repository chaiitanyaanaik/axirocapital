"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  answerGate1Question,
  answerGate2,
  answerGate3,
  buildFinalOutput,
  canCompleteGate1,
  completeGate1,
  createLoanInsightSession,
  getGate2QuestionText,
  getGate3Question,
  getNextGate1Question,
  markLeadCaptureShown,
  shouldShowLeadCapture,
  skipLeadCapture,
  submitLeadWithRetry,
  trackCtaClick,
  type LeadSubmitFn,
  type LoanInsightState,
} from "@/lib/loanInsight";
import {
  GATE1_LABELS,
  getGate1OptionItems,
  getGate2Options,
  scenarioLabel,
} from "@/lib/loanInsight/questionnaire";
import { trackEvent } from "@/lib/gtag";
import { validateIndianMobile } from "@/lib/validation/mobile";

const sessionId =
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `sess-${Date.now()}`;

const toLabel = (value: string): string => value.replaceAll("_", " ");

const topScenarios = (state: LoanInsightState): string[] =>
  Object.entries(state.scenarioScores)
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
    .slice(0, 3)
    .map(([id]) => id);

export function LoanInsightFlow() {
  const [engineState, setEngineState] = useState<LoanInsightState>(() =>
    createLoanInsightSession(sessionId),
  );
  const [showGate2, setShowGate2] = useState(false);
  const [phone, setPhone] = useState("");
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [leadDone, setLeadDone] = useState(false);
  const [finalReady, setFinalReady] = useState(false);
  const [gate2AskedCount, setGate2AskedCount] = useState(0);
  const [selectedGate1Option, setSelectedGate1Option] = useState<string | null>(null);
  const [selectedGate2Option, setSelectedGate2Option] = useState<string | null>(null);
  const [selectedGate3Option, setSelectedGate3Option] = useState<string | null>(null);
  const [analyzingUntil, setAnalyzingUntil] = useState<number>(0);
  const trackedCount = useRef(0);

  const phoneValidation = useMemo(() => validateIndianMobile(phone), [phone]);
  const normalizedPhone = phoneValidation.normalized10;
  const isPhoneValid = phoneValidation.isValid;

  const gate1Question = useMemo(() => getNextGate1Question(engineState), [engineState]);
  const gate1OptionItems = useMemo(
    () => (gate1Question ? getGate1OptionItems(gate1Question) : []),
    [gate1Question],
  );

  useEffect(() => {
    const newEvents = engineState.events.slice(trackedCount.current);
    if (newEvents.length > 0) {
      for (const event of newEvents) {
        trackEvent(`loan_insight_${event.name}`, {
          event_id: event.event_id,
          session_id: event.session_id,
          user_id: event.user_id ?? null,
          ...(event.payload ?? {}),
        });
      }
      trackedCount.current = engineState.events.length;
    }
  }, [engineState.events]);

  const onGate1Answer = (value: string) => {
    if (!gate1Question) return;
    setEngineState((prev) => {
      let next = answerGate1Question(prev, gate1Question, value);
      if (canCompleteGate1(next)) {
        next = completeGate1(next);
        const endAt = Date.now() + 1800;
        setAnalyzingUntil(endAt);
        window.setTimeout(() => {
          setAnalyzingUntil((current) => (current === endAt ? 0 : current));
        }, 1800);
      }
      return next;
    });
    setSelectedGate1Option(null);
  };

  const onGate2Answer = (value: string) => {
    const currentQuestion = engineState.gate2Question;
    if (!currentQuestion) return;

    const certainty = value === "not_sure" ? "not_sure" : "certain";
    setEngineState((prev) => {
      let next = answerGate2(prev, {
        questionId: currentQuestion,
        value,
        certainty,
      });
      if (shouldShowLeadCapture(next)) {
        next = markLeadCaptureShown(next);
      } else if (next.state === "refining_insight" && !next.gate2Question) {
        next = skipLeadCapture(next, false);
        if (next.state === "awaiting_gate3" && !next.gate3Question) {
          next = {
            ...next,
            gate3Question: getGate3Question(next),
          };
        }
      }
      return next;
    });
    setGate2AskedCount((v) => v + 1);
    setSelectedGate2Option(null);
  };

  const submitLead: LeadSubmitFn = async ({ phone: rawPhone, sessionId: sid, meta }) => {
    const phoneHashSource = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(rawPhone.trim()),
    );
    const hashHex = Array.from(new Uint8Array(phoneHashSource))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const idempotencyKey = `${sid}:${hashHex}`;

    const response = await fetch("/api/loan-insight/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: rawPhone,
        sessionId: sid,
        userId: sid,
        idempotencyKey,
        source: "loan_insight",
        leadStage: "gate2",
        topScenarios: topScenarios(engineState),
        cluster: engineState.cluster,
        meta,
      }),
    });

    if (!response.ok) {
      throw new Error("Lead submit failed");
    }
  };

  const onLeadSubmit = async () => {
    setLeadError(null);
    setIsSubmittingLead(true);
    try {
      let next = await submitLeadWithRetry(engineState, normalizedPhone, submitLead, 2);
      const latestEvent = next.events[next.events.length - 1];
      const leadFailed = latestEvent?.name === "lead_submit_failed";
      if (next.state === "awaiting_gate3" && !next.gate3Question) {
        next = {
          ...next,
          gate3Question: getGate3Question(next),
        };
      }
      setEngineState(next);
      setLeadDone(!leadFailed);
      if (leadFailed) {
        setLeadError("Unable to save right now, please try again. You can continue the flow.");
      }
    } catch {
      setLeadError("Could not submit right now. You can continue and try again later.");
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const onSkipLead = (highIntent: boolean) => {
    setEngineState((prev) => {
      let next = skipLeadCapture(prev, highIntent);
      if (next.state === "awaiting_gate3" && !next.gate3Question) {
        next = {
          ...next,
          gate3Question: getGate3Question(next),
        };
      }
      return next;
    });
    if (highIntent) {
      setFinalReady(true);
    }
  };

  const onGate3Answer = (value: string) => {
    setEngineState((prev) => answerGate3(prev, value));
    setSelectedGate3Option(null);
  };

  const forceAdvanceToGate3 = () => {
    setEngineState((prev) => {
      let next = prev;
      if (next.state === "refining_insight") {
        next = skipLeadCapture(next, false);
      }
      if (next.state === "awaiting_gate3" && !next.gate3Question) {
        next = {
          ...next,
          gate3Question: getGate3Question(next),
        };
      }
      return next;
    });
  };

  const onGenerateFinal = async () => {
    let rawAiResponse: string | undefined;
    try {
      const response = await fetch("/api/loan-insight/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: engineState }),
      });
      if (response.ok) {
        const payload = (await response.json()) as { rawAiResponse?: string };
        rawAiResponse = payload.rawAiResponse;
      }
    } catch {
      // Deterministic fallback path in buildFinalOutput handles provider/route failures.
    }

    setEngineState((prev) => buildFinalOutput(prev, { rawAiResponse }));
    setFinalReady(true);
  };

  const onCtaClick = (cta: string) => {
    setEngineState((prev) => trackCtaClick(prev, cta));
    trackEvent("loan_insight_cta_clicked", { session_id: engineState.sessionId, cta });
  };

  const showSecondGate2 =
    engineState.state === "refining_insight" &&
    Boolean(engineState.gate2Question) &&
    gate2AskedCount === 1;

  const gate1TotalQuestions = engineState.signals.loan_status === "no_loan" ? 6 : 7;
  const gate1CurrentQuestion = Math.min(engineState.gate1Asked.length + 1, gate1TotalQuestions);
  const showAnalyzing = engineState.state === "awaiting_gate2" && !showGate2 && analyzingUntil > 0;
  const topBarTitle = showAnalyzing ? "Institutional Core" : undefined;
  const currentStep = engineState.state === "collecting_inputs" ? 1 : engineState.state === "awaiting_gate2" || showSecondGate2 || engineState.state === "refining_insight" || engineState.state === "awaiting_lead_capture" ? 2 : engineState.state === "awaiting_gate3" ? 3 : 4;
  const totalSteps = 4;
  const progressPct =
    engineState.state === "collecting_inputs"
      ? Math.round((engineState.gate1Asked.length / gate1TotalQuestions) * 55)
      : engineState.state === "awaiting_gate2" || showSecondGate2 || engineState.state === "refining_insight"
        ? 72
        : engineState.state === "awaiting_lead_capture"
          ? 80
          : engineState.state === "awaiting_gate3"
            ? 90
            : 100;

  return (
    <main className="mesh-gradient min-h-screen">
      <header className="fixed top-0 z-50 w-full border-b border-white/20 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <button className="rounded-full p-2 text-emerald-500 hover:bg-emerald-50" type="button">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="text-center">
            {topBarTitle ? (
              <p className="text-2xl font-bold tracking-tight text-emerald-700">{topBarTitle}</p>
            ) : (
              <p className="text-sm font-semibold text-slate-500">
                {engineState.state === "collecting_inputs"
                  ? `Gate 1 • Question ${gate1CurrentQuestion} of ${gate1TotalQuestions}`
                  : `Step ${currentStep} of ${totalSteps}`}
              </p>
            )}
          </div>
          <button className="rounded-full p-2 text-slate-400 hover:bg-emerald-50" type="button">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="h-1 w-full bg-slate-200">
          <div className="h-full bg-primary-container transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>
      </header>

      <section className="mx-auto w-full max-w-3xl px-4 pb-36 pt-24 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-6 sm:p-8">
          {engineState.state === "collecting_inputs" && gate1Question ? (
            <>
              <h2 className="text-2xl font-semibold text-slate-900">{GATE1_LABELS[gate1Question]}</h2>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                <span className="material-symbols-outlined text-sm">speed</span>
                Takes 30 seconds. No documents required.
              </div>
              <div className="mt-5 grid gap-3">
                {gate1OptionItems.map((option) => (
                  <button
                    key={option.value}
                    className={`rounded-xl border px-4 py-4 text-left text-sm font-semibold transition ${
                      selectedGate1Option === option.value
                        ? "border-emerald-500 bg-emerald-50 text-slate-900 ring-4 ring-emerald-100"
                        : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
                    }`}
                    onClick={() => setSelectedGate1Option(option.value)}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          ) : null}

          {engineState.state === "awaiting_gate2" && !showGate2 && !showAnalyzing ? (
            <>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold tracking-wide text-white">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Gate 1 Complete
              </div>
              <h2 className="text-center text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl">
                We noticed something about your loan
              </h2>
              <p className="mx-auto mt-4 max-w-md text-center text-[2.05rem] font-semibold leading-[1.07] tracking-[-0.02em] text-slate-900">
                {engineState.primaryScenario
                  ? scenarioLabel(engineState.primaryScenario)
                  : "Your current repayment structure might be more rigid than your business needs."}
              </p>
              <p className="mx-auto mt-4 max-w-md text-center text-base leading-relaxed text-slate-500">
                This usually leads to higher effective cost during growth cycles, reducing your flexibility when opportunities arise.
              </p>
              <div className="mx-auto mt-8 max-w-sm rounded-2xl border border-emerald-100 bg-white/70 p-4">
                <div className="mb-2 text-center text-[11px] text-emerald-600">Optimized</div>
                <div className="mb-3 flex h-20 items-end justify-center gap-2">
                  <div className="h-11 w-5 rounded-t-md bg-slate-300/60" />
                  <div className="h-8 w-5 rounded-t-md bg-slate-300/60" />
                  <div className="h-16 w-5 rounded-t-md bg-emerald-600" />
                  <div className="h-10 w-5 rounded-t-md bg-slate-300/60" />
                  <div className="h-9 w-5 rounded-t-md bg-slate-300/60" />
                </div>
                <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  Efficiency Gap Analysis
                </p>
              </div>
              <button
                className="mx-auto mt-8 block rounded-full bg-primary-container px-10 py-3 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(16,185,129,0.28)]"
                onClick={() => setShowGate2(true)}
                type="button"
              >
                Tell me more
              </button>
              <p className="mt-4 text-center text-sm text-slate-400">
                Takes less than 2 minutes to review
              </p>
            </>
          ) : null}

          {engineState.state === "awaiting_gate2" && showAnalyzing ? (
            <div className="py-6 text-center">
              <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full border border-emerald-100 bg-white/70 shadow-sm">
                <div className="relative flex h-24 w-24 items-center justify-center">
                  <div className="absolute h-24 w-24 animate-spin rounded-full border-[3px] border-emerald-100 border-t-emerald-500" />
                  <span
                    className="material-symbols-outlined text-3xl text-emerald-600"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    insights
                  </span>
                </div>
              </div>
              <h2 className="text-5xl font-semibold leading-tight tracking-tight text-slate-900">
                Analyzing your responses...
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-[2rem] leading-[1.3] tracking-[-0.02em] text-slate-600">
                Comparing with current institutional benchmarks to generate your personalized trajectory.
              </p>
              <div className="mx-auto mt-8 grid max-w-lg gap-4">
                <div className="rounded-2xl border border-white/60 bg-white/70 p-4 text-left">
                  <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">Activity</p>
                  <p className="mt-1 text-2xl font-medium text-slate-700">Data Normalization</p>
                </div>
                <div className="rounded-2xl border border-white/60 bg-white/70 p-4 text-left">
                  <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">Metric</p>
                  <p className="mt-1 text-2xl font-medium text-slate-700">Institutional Fitment</p>
                </div>
              </div>
              <div className="mx-auto mt-10 w-full max-w-lg">
                <div className="h-[2px] w-full rounded-full bg-slate-300/70">
                  <div className="h-full w-2/3 animate-pulse rounded-full bg-emerald-600" />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                  <span>Processing Node: LDN-04</span>
                  <span>Est. 4s remaining</span>
                </div>
              </div>
            </div>
          ) : null}

          {((engineState.state === "awaiting_gate2" && showGate2) || showSecondGate2) &&
          engineState.gate2Question ? (
            <>
              <p className="text-sm font-medium text-slate-500">Gate 2</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">
                {getGate2QuestionText(engineState.gate2Question)}
              </h2>
              <div className="mt-5 grid gap-3">
                {getGate2Options(engineState.gate2Question).map((option) => (
                  <button
                    key={option}
                    className={`rounded-xl border px-4 py-4 text-left text-sm font-semibold transition ${
                      selectedGate2Option === option
                        ? "border-emerald-500 bg-emerald-50 text-slate-900 ring-4 ring-emerald-100"
                        : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
                    }`}
                    onClick={() => setSelectedGate2Option(option)}
                    type="button"
                  >
                    {toLabel(option)}
                  </button>
                ))}
              </div>
            </>
          ) : null}

          {engineState.state === "awaiting_lead_capture" ? (
            <>
              <p className="text-sm font-medium text-slate-500">Get full analysis</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Get your detailed loan analysis</h2>
              <p className="mt-2 text-sm text-slate-600">
                Based on your inputs, there may be ways to improve your loan structure and terms.
              </p>
              <input
                className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                inputMode="numeric"
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                value={phone}
              />
              {!isPhoneValid && phone.trim().length > 0 ? (
                <p className="mt-2 text-sm text-red-600">{phoneValidation.error ?? "Enter a valid mobile number."}</p>
              ) : null}
              {leadError ? <p className="mt-2 text-sm text-red-600">{leadError}</p> : null}
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  className="rounded-xl bg-primary-container px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                  disabled={!isPhoneValid || isSubmittingLead}
                  onClick={onLeadSubmit}
                  type="button"
                >
                  {isSubmittingLead ? "Submitting..." : "Send my report"}
                </button>
                <button
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
                  onClick={() => onSkipLead(false)}
                  type="button"
                >
                  Skip for now
                </button>
                <button
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700"
                  onClick={() => onSkipLead(true)}
                  type="button"
                >
                  Skip to CTA
                </button>
              </div>
            </>
          ) : null}

          {engineState.state === "refining_insight" && !engineState.gate2Question ? (
            <div className="text-center">
              <h2 className="text-xl font-semibold text-slate-900">Got it. One last thing to check.</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                We have enough context to move from diagnosis to action readiness.
              </p>
              <button
                className="mx-auto mt-5 rounded-xl bg-primary-container px-5 py-3 text-sm font-semibold text-white"
                onClick={forceAdvanceToGate3}
                type="button"
              >
                Continue to final check
              </button>
            </div>
          ) : null}

          {engineState.state === "awaiting_gate3" && engineState.gate3Question ? (
            <>
              <p className="text-sm font-medium text-slate-500">Gate 3</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">{engineState.gate3Question}</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {["yes", "no", "not_sure"].map((value) => (
                  <button
                    key={value}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
                    onClick={() => onGate3Answer(value)}
                    type="button"
                  >
                    {toLabel(value)}
                  </button>
                ))}
              </div>
            </>
          ) : null}

          {engineState.state === "final_output" && !finalReady ? (
            <button
              className="rounded-xl bg-primary-container px-5 py-3 text-sm font-semibold text-white"
              onClick={onGenerateFinal}
              type="button"
            >
              Show final insight
            </button>
          ) : null}

          {finalReady && engineState.output ? (
            <>
              <p className="text-sm font-medium text-slate-500">Final Insight</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">
                Confidence: {engineState.output.confidence}%
              </h2>
              {engineState.output.confidenceNarrative ? (
                <p className="mt-2 text-sm text-slate-600">{engineState.output.confidenceNarrative}</p>
              ) : null}
              {engineState.output.aiNarrative ? (
                <p className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                  {engineState.output.aiNarrative}
                </p>
              ) : null}
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {engineState.output.insights.map((insight) => (
                  <li key={insight} className="rounded-xl bg-white px-4 py-3">
                    {insight}
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                Recommended action: {engineState.output.recommendedAction}
              </p>
              {engineState.output.aiRecommendations && engineState.output.aiRecommendations.length > 0 ? (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-slate-800">Priority recommendations</h3>
                  <ul className="mt-2 space-y-2 text-sm text-slate-700">
                    {engineState.output.aiRecommendations.slice(0, 3).map((item) => (
                      <li key={item} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {engineState.output.evidenceBullets && engineState.output.evidenceBullets.length > 0 ? (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-slate-800">Why this was suggested</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                    {engineState.output.evidenceBullets.slice(0, 4).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {engineState.output.riskSignals && engineState.output.riskSignals.length > 0 ? (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-slate-800">Risk watchouts</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                    {engineState.output.riskSignals.slice(0, 3).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {engineState.output.next90DayPlan && engineState.output.next90DayPlan.length > 0 ? (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-slate-800">Next 90-day plan</h3>
                  <ul className="mt-2 space-y-2 text-sm text-slate-700">
                    {engineState.output.next90DayPlan.map((item) => (
                      <li key={item} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <p className="mt-3 text-xs text-slate-500">
                Top scenarios: {engineState.output.topScenarios.join(", ")}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  className="rounded-xl bg-primary-container px-5 py-3 text-sm font-semibold text-white"
                  onClick={() => onCtaClick("talk_to_expert")}
                  type="button"
                >
                  Talk to an expert
                </button>
                <button
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
                  onClick={() => onCtaClick("get_full_analysis")}
                  type="button"
                >
                  Get full analysis
                </button>
              </div>
            </>
          ) : null}
        </div>
      </section>

      {(engineState.state === "collecting_inputs" && gate1Question) ||
      ((engineState.state === "awaiting_gate2" && showGate2) || showSecondGate2) ||
      (engineState.state === "awaiting_gate3" && engineState.gate3Question) ? (
        <div className="fixed bottom-0 w-full bg-gradient-to-t from-white via-white/95 to-transparent px-4 pb-8 pt-10 sm:px-6">
          <div className="mx-auto w-full max-w-3xl">
            {engineState.state === "collecting_inputs" && gate1Question ? (
              <button
                className="w-full rounded-xl bg-primary-container px-5 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={!selectedGate1Option}
                onClick={() => selectedGate1Option && onGate1Answer(selectedGate1Option)}
                type="button"
              >
                Continue
              </button>
            ) : null}

            {(((engineState.state === "awaiting_gate2" && showGate2) || showSecondGate2) &&
              engineState.gate2Question) ? (
              <button
                className="w-full rounded-xl bg-primary-container px-5 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={!selectedGate2Option}
                onClick={() => selectedGate2Option && onGate2Answer(selectedGate2Option)}
                type="button"
              >
                Continue
              </button>
            ) : null}

            {engineState.state === "awaiting_gate3" && engineState.gate3Question ? (
              <>
                <div className="mb-3 grid gap-3 sm:grid-cols-3">
                  {["yes", "no", "not_sure"].map((value) => (
                    <button
                      key={value}
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                        selectedGate3Option === value
                          ? "border-emerald-500 bg-emerald-50 text-slate-900"
                          : "border-slate-200 bg-white text-slate-700"
                      }`}
                      onClick={() => setSelectedGate3Option(value)}
                      type="button"
                    >
                      {toLabel(value)}
                    </button>
                  ))}
                </div>
                <button
                  className="w-full rounded-xl bg-primary-container px-5 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                  disabled={!selectedGate3Option}
                  onClick={() => selectedGate3Option && onGate3Answer(selectedGate3Option)}
                  type="button"
                >
                  Continue
                </button>
              </>
            ) : null}

            <p className="mt-3 text-center text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Protected by 256-bit AES encryption
            </p>
          </div>
        </div>
      ) : null}

      {engineState.state !== "awaiting_gate3" && (
        <div className="pointer-events-none fixed -top-16 -right-16 h-56 w-56 rounded-full bg-emerald-500/10 blur-[80px]" />
      )}
    </main>
  );
}
