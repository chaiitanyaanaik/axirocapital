import type { AiEnrichmentPayload, AiRecommendation, LoanInsightState, OutputPayload } from "@/lib/loanInsight/types";
import { buildDeterministicReportSections } from "@/lib/loanInsight/templates";

const ALLOWED_RECOMMENDATION_CATALOG = new Set<string>([
  "Compare secured and unsecured structures across lender classes before refinancing.",
  "Align repayment design to business cash conversion cycle before taking additional debt.",
  "Strengthen documentation and lender-ready packaging before next application.",
  "Request a limit revision backed by recent verified growth signals.",
  "Shift transaction behavior toward formal channels to improve credit visibility.",
]);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const asObject = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;

const clampScore = (value: number): number => Math.max(0, Math.min(100, Math.round(value)));

const buildConfidenceNarrative = (confidence: number): string => {
  if (confidence >= 80) return "Confidence is high because multiple signals align to the same diagnosis.";
  if (confidence >= 60) return "Confidence is moderate with a clear leading pattern and some uncertainty.";
  return "Confidence is still developing; more signal quality would improve certainty.";
};

export const getAiRuntimeConfig = (): { apiKey: string; model: string } => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing.");
  }
  return {
    apiKey,
    model: process.env.AI_MODEL ?? "gpt-4o-mini",
  };
};

export const buildAiPrompt = (state: LoanInsightState, output: OutputPayload): string =>
  [
    "You are an MSME lending advisor. Return strict JSON only.",
    "Do not change scenario, cluster, root cause, or confidence.",
    "",
    `primaryScenario: ${output.primaryScenario}`,
    `cluster: ${output.cluster}`,
    `rootCause: ${output.rootCause}`,
    `confidence: ${output.confidence}`,
    `topScenarios: ${output.topScenarios.join(", ")}`,
    `recommendedAction: ${output.recommendedAction}`,
    `signals: ${JSON.stringify(state.signals)}`,
    "",
    "Return JSON with keys:",
    "- aiNarrative (string, <= 2 sentences)",
    "- confidenceNarrative (string)",
    "- evidenceBullets (string[], 3-5 items)",
    "- riskSignals (string[], 2-4 items)",
    "- recommendations (array of { action, impactScore, feasibilityScore, aiPriorityScore, optional })",
    "- next90DayPlan (string[], 3 items)",
    "- reportSections ({ executiveSummary, diagnosis, actionPlan, riskWatchouts })",
  ].join("\n");

export const parseAiEnrichment = (raw: string): { value?: AiEnrichmentPayload; error?: string } => {
  try {
    const parsed = JSON.parse(raw) as unknown;
    const obj = asObject(parsed);
    if (!obj) return { error: "AI output is not an object." };

    const report = asObject(obj.reportSections);
    const recommendations = Array.isArray(obj.recommendations) ? obj.recommendations : null;
    if (
      typeof obj.aiNarrative !== "string" ||
      typeof obj.confidenceNarrative !== "string" ||
      !isStringArray(obj.evidenceBullets) ||
      !isStringArray(obj.riskSignals) ||
      !isStringArray(obj.next90DayPlan) ||
      !report ||
      typeof report.executiveSummary !== "string" ||
      !isStringArray(report.diagnosis) ||
      !isStringArray(report.actionPlan) ||
      !isStringArray(report.riskWatchouts) ||
      !recommendations
    ) {
      return { error: "AI output failed schema checks." };
    }

    const normalizedRecommendations: AiRecommendation[] = [];
    for (const rec of recommendations) {
      const item = asObject(rec);
      if (!item || typeof item.action !== "string") {
        return { error: "Invalid recommendation payload." };
      }
      const impact = Number(item.impactScore);
      const feasibility = Number(item.feasibilityScore);
      const aiPriority = item.aiPriorityScore === undefined ? undefined : Number(item.aiPriorityScore);
      normalizedRecommendations.push({
        action: item.action,
        impactScore: Number.isFinite(impact) ? clampScore(impact) : 50,
        feasibilityScore: Number.isFinite(feasibility) ? clampScore(feasibility) : 50,
        aiPriorityScore:
          aiPriority !== undefined && Number.isFinite(aiPriority) ? clampScore(aiPriority) : undefined,
        optional: Boolean(item.optional),
      });
    }

    return {
      value: {
        aiNarrative: obj.aiNarrative,
        confidenceNarrative: obj.confidenceNarrative,
        evidenceBullets: obj.evidenceBullets,
        riskSignals: obj.riskSignals,
        recommendations: normalizedRecommendations,
        next90DayPlan: obj.next90DayPlan,
        reportSections: {
          executiveSummary: report.executiveSummary,
          diagnosis: report.diagnosis,
          actionPlan: report.actionPlan,
          riskWatchouts: report.riskWatchouts,
        },
      },
    };
  } catch {
    return { error: "AI output is not valid JSON." };
  }
};

export const applyHybridRecommendationRanking = (
  recommendations: AiRecommendation[],
  deterministicAction: string,
  confidence: number,
): AiRecommendation[] => {
  const scored = recommendations.map((rec) => {
    const ai = rec.aiPriorityScore ?? 50;
    const blended = ai * 0.45 + rec.impactScore * 0.35 + rec.feasibilityScore * 0.2 + confidence * 0.1;
    return { ...rec, aiPriorityScore: clampScore(blended) };
  });

  // Always keep deterministic action as top non-optional recommendation.
  const hasDeterministic = scored.some((rec) => rec.action === deterministicAction);
  if (!hasDeterministic) {
    scored.push({
      action: deterministicAction,
      impactScore: 80,
      feasibilityScore: 70,
      aiPriorityScore: clampScore(75 + confidence * 0.1),
      optional: false,
    });
  }

  return scored.sort((a, b) => (b.aiPriorityScore ?? 0) - (a.aiPriorityScore ?? 0));
};

const enforceGuardrails = (
  enrichment: AiEnrichmentPayload,
  deterministic: OutputPayload,
): { safe?: AiEnrichmentPayload; error?: string } => {
  const safeRecommendations: AiRecommendation[] = [];
  for (const rec of enrichment.recommendations) {
    const isAllowed = ALLOWED_RECOMMENDATION_CATALOG.has(rec.action);
    if (!isAllowed && !rec.optional) {
      return { error: "Recommendation outside approved catalog." };
    }
    safeRecommendations.push(rec);
  }

  const mentionsKnownSignals = enrichment.evidenceBullets.some((item) =>
    /(cashflow|gst|interest|loan|revenue|financial|collection|borrow)/i.test(item),
  );
  if (!mentionsKnownSignals) {
    return { error: "Evidence bullets are not tied to known lending signals." };
  }

  return {
    safe: {
      ...enrichment,
      recommendations: applyHybridRecommendationRanking(
        safeRecommendations,
        deterministic.recommendedAction,
        deterministic.confidence,
      ),
    },
  };
};

export const buildDeterministicEnrichmentFallback = (
  _state: LoanInsightState,
  output: OutputPayload,
  reason?: string,
): OutputPayload => {
  const primaryInsight = output.insights[0] ?? "Your profile shows a clear lending pattern.";
  const rootInsight = output.insights[1] ?? "A root cause has been identified from your responses.";
  const evidence = [
    `Primary scenario selected: ${output.primaryScenario}.`,
    `Cluster focus: ${output.cluster}.`,
    `Root cause identified: ${output.rootCause}.`,
  ];
  const riskSignals = [
    "Repayment stress if structure remains unchanged.",
    "Potential pricing inefficiency if current setup persists.",
  ];
  const plan = [
    "Weeks 1-2: gather lender-ready documents and current repayment snapshot.",
    "Weeks 3-6: evaluate one to two alternative structures with your lender.",
    "Weeks 7-12: execute the chosen restructuring or limit-revision path.",
  ];

  return {
    ...output,
    aiNarrative: `${primaryInsight} ${rootInsight}`,
    confidenceNarrative: buildConfidenceNarrative(output.confidence),
    evidenceBullets: evidence,
    riskSignals,
    next90DayPlan: plan,
    aiRecommendations: [output.recommendedAction],
    reportSections: {
      ...buildDeterministicReportSections(output),
      diagnosis: [primaryInsight, rootInsight],
      actionPlan: [output.recommendedAction, ...plan],
      riskWatchouts: riskSignals,
    },
    aiMeta: {
      source: "deterministic_fallback",
      fallbackReason: reason ?? "No AI enrichment response available.",
    },
  };
};

export const enrichOutputHybrid = (args: {
  state: LoanInsightState;
  output: OutputPayload;
  rawAiResponse?: string;
}): OutputPayload => {
  const { state, output, rawAiResponse } = args;
  if (!rawAiResponse) {
    return buildDeterministicEnrichmentFallback(state, output);
  }

  const parsed = parseAiEnrichment(rawAiResponse);
  if (!parsed.value) {
    return buildDeterministicEnrichmentFallback(state, output, parsed.error);
  }

  const guard = enforceGuardrails(parsed.value, output);
  if (!guard.safe) {
    return buildDeterministicEnrichmentFallback(state, output, guard.error);
  }

  const topAction = guard.safe.recommendations[0]?.action ?? output.recommendedAction;
  return {
    ...output,
    recommendedAction: topAction,
    aiRecommendations: guard.safe.recommendations.map((rec) => rec.action),
    aiNarrative: guard.safe.aiNarrative,
    confidenceNarrative: guard.safe.confidenceNarrative,
    evidenceBullets: guard.safe.evidenceBullets,
    riskSignals: guard.safe.riskSignals,
    next90DayPlan: guard.safe.next90DayPlan,
    reportSections: guard.safe.reportSections,
    aiMeta: { source: "ai_enriched" },
  };
};

export const fetchAiEnrichmentResponse = async (prompt: string): Promise<string> => {
  const { apiKey, model } = getAiRuntimeConfig();
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      input: prompt,
    }),
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`AI provider request failed (${response.status}): ${payload}`);
  }

  const payload = (await response.json()) as {
    output_text?: string;
  };
  if (!payload.output_text) {
    throw new Error("AI provider returned empty output_text.");
  }
  return payload.output_text;
};
