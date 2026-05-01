import {
  CLUSTER_PRIORITY,
  CLUSTER_QUESTION_PRIORITY,
  GATE1_QUESTION_ORDER,
  MIN_GATE1_SIGNALS,
  MVP_SCORING_RULES,
  QUESTION_TEXT,
  ROOT_CAUSE_ACTION_TEXT,
  ROOT_CAUSE_TO_GATE3_QUESTION,
  SCENARIO_CLUSTER_MAP,
  SCENARIO_PRIORITY,
} from "@/lib/loanInsight/config";
import { enrichOutputHybrid } from "@/lib/loanInsight/ai";
import { withTemplatedNarrative } from "@/lib/loanInsight/templates";
import type {
  ClusterId,
  Gate1Key,
  Gate1Signals,
  Gate2Answer,
  InsightEvent,
  LoanInsightState,
  OutputPayload,
  QuestionAnswerCertainty,
  QuestionId,
  RootCauseId,
  ScenarioId,
} from "@/lib/loanInsight/types";

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const nowIso = (): string => new Date().toISOString();
const newId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const makeEvent = (
  sessionId: string,
  name: InsightEvent["name"],
  payload?: Record<string, unknown>,
  userId?: string,
): InsightEvent => ({
  event_id: newId(),
  session_id: sessionId,
  user_id: userId,
  name,
  ts: nowIso(),
  payload,
});

const shouldSkipGate1Question = (signals: Gate1Signals, key: Gate1Key): boolean =>
  key === "interest_band" && signals.loan_status === "no_loan";

const applyScoreRules = (signals: Gate1Signals): Partial<Record<ScenarioId, number>> => {
  const scores: Partial<Record<ScenarioId, number>> = {};
  for (const rule of MVP_SCORING_RULES) {
    if (signals[rule.key] === rule.equals) {
      scores[rule.id] = (scores[rule.id] ?? 0) + rule.score;
    }
  }
  return scores;
};

const scoreByCluster = (
  scores: Partial<Record<ScenarioId, number>>,
): Partial<Record<ClusterId, number>> => {
  const clusterScores: Partial<Record<ClusterId, number>> = {};
  for (const [scenario, score] of Object.entries(scores) as [ScenarioId, number][]) {
    const cluster = SCENARIO_CLUSTER_MAP[scenario];
    clusterScores[cluster] = (clusterScores[cluster] ?? 0) + score;
  }
  return clusterScores;
};

const pickPrimaryScenario = (scores: Partial<Record<ScenarioId, number>>): ScenarioId => {
  const ranked = Object.entries(scores)
    .filter((entry): entry is [ScenarioId, number] => typeof entry[1] === "number")
    .sort((a, b) => b[1] - a[1]);

  if (ranked.length === 0) {
    return "S25";
  }

  const topScore = ranked[0][1];
  const tied = ranked.filter(([, score]) => score === topScore).map(([id]) => id);
  if (tied.length === 1) {
    return tied[0];
  }

  // Tie-break 1: cluster priority by aggregate score of tied scenarios.
  const tiedClusterScores: Partial<Record<ClusterId, number>> = {};
  for (const scenario of tied) {
    const cluster = SCENARIO_CLUSTER_MAP[scenario];
    tiedClusterScores[cluster] = (tiedClusterScores[cluster] ?? 0) + (scores[scenario] ?? 0);
  }
  for (const cluster of CLUSTER_PRIORITY) {
    const clusterHasWinner = tied.some((scenario) => SCENARIO_CLUSTER_MAP[scenario] === cluster);
    if (!clusterHasWinner) continue;
    const bestInCluster = tied.filter((scenario) => SCENARIO_CLUSTER_MAP[scenario] === cluster);
    if (bestInCluster.length === 1) {
      return bestInCluster[0];
    }
    // Tie-break 2: scenario priority within cluster.
    for (const scenario of SCENARIO_PRIORITY) {
      if (bestInCluster.includes(scenario)) {
        return scenario;
      }
    }
  }

  return tied[0];
};

const confidenceFromScores = (
  scores: Partial<Record<ScenarioId, number>>,
  certainty: QuestionAnswerCertainty = "certain",
): number => {
  const ranked = Object.values(scores).sort((a, b) => b - a);
  const top = ranked[0] ?? 0;
  const second = ranked[1] ?? 0;
  const magnitude = clamp(top, 0, 100);
  const gap = clamp((top - second) * 0.6, 0, 30);
  const certaintyBoost = certainty === "certain" ? 12 : 0;
  return clamp(Math.round(magnitude * 0.58 + gap + certaintyBoost), 0, 100);
};

const questionForCluster = (cluster: ClusterId, asked: QuestionId[]): QuestionId => {
  const priorities = CLUSTER_QUESTION_PRIORITY[cluster] ?? ["Q2_loan_usage"];
  for (const candidate of priorities) {
    if (!asked.includes(candidate)) {
      return candidate;
    }
  }
  return "Q2_loan_usage";
};

const topScenarios = (
  scores: Partial<Record<ScenarioId, number>>,
  limit = 3,
): ScenarioId[] =>
  Object.entries(scores)
    .filter((entry): entry is [ScenarioId, number] => typeof entry[1] === "number")
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

const rootCauseFromGate2 = (
  questionId: QuestionId,
  answer: string,
  primaryScenario: ScenarioId,
): RootCauseId => {
  const normalized = answer.trim().toLowerCase();
  if (questionId === "Q1_collateral") {
    return normalized.includes("unsecured") ? "unsecured_loan" : "working_capital_mismatch";
  }
  if (questionId === "Q3_receivables") {
    return normalized.includes("yes") || normalized.includes("long")
      ? "receivables_issue"
      : "high_emi_pressure";
  }
  if (questionId === "Q5_financials") {
    return normalized.includes("audit") ? "growth_gap" : "financial_issue";
  }
  if (questionId === "Q7_informality") {
    return normalized.includes("yes") ? "informal_issue" : "no_formal_credit_history";
  }
  if (questionId === "Q4_growth") {
    return "growth_gap";
  }
  if (questionId === "Q10_loan_size") {
    return normalized.includes("not") || normalized.includes("small")
      ? "working_capital_mismatch"
      : "high_emi_pressure";
  }
  if (primaryScenario === "S25" || primaryScenario === "S14") {
    return "no_formal_credit_history";
  }
  return "working_capital_mismatch";
};

const gate3QuestionForContext = (rootCause: RootCauseId, cluster: ClusterId): string => {
  if (rootCause === "working_capital_mismatch" && cluster === "cashflow") {
    return "Do you need funds at multiple points in the month rather than one fixed cycle?";
  }
  if (rootCause === "growth_gap" && cluster === "growth") {
    return "Do you have recent growth proof ready to support a higher limit request?";
  }
  return ROOT_CAUSE_TO_GATE3_QUESTION[rootCause];
};

export const createLoanInsightSession = (sessionId: string): LoanInsightState => ({
  sessionId,
  state: "collecting_inputs",
  signals: {},
  scenarioScores: {},
  gate1Asked: [],
  questionsAsked: 0,
  confidence: 0,
  leadStatus: "unknown",
  highIntentSkipToCta: false,
  events: [makeEvent(sessionId, "session_started", { sessionId })],
});

export const getNextGate1Question = (state: LoanInsightState): Gate1Key | null => {
  for (const key of GATE1_QUESTION_ORDER) {
    if (state.gate1Asked.includes(key)) continue;
    if (shouldSkipGate1Question(state.signals, key)) continue;
    return key;
  }
  return null;
};

export const answerGate1Question = (
  state: LoanInsightState,
  key: Gate1Key,
  value: string,
): LoanInsightState => {
  const next: LoanInsightState = {
    ...state,
    signals: { ...state.signals, [key]: value },
    gate1Asked: state.gate1Asked.includes(key) ? state.gate1Asked : [...state.gate1Asked, key],
    events: [...state.events, makeEvent(state.sessionId, "gate1_answered", { key, value })],
  };
  return next;
};

export const canCompleteGate1 = (state: LoanInsightState): boolean =>
  state.gate1Asked.length >= MIN_GATE1_SIGNALS && getNextGate1Question(state) === null;

export const completeGate1 = (state: LoanInsightState): LoanInsightState => {
  const scenarioScores = applyScoreRules(state.signals);
  const primaryScenario = pickPrimaryScenario(scenarioScores);
  const cluster = SCENARIO_CLUSTER_MAP[primaryScenario];
  const confidence = confidenceFromScores(scenarioScores);
  const clusterScores = scoreByCluster(scenarioScores);
  const gate2Question = questionForCluster(cluster, []);

  return {
    ...state,
    scenarioScores,
    primaryScenario,
    cluster,
    confidence,
    gate2Question,
    state: "awaiting_gate2",
    questionsAsked: state.questionsAsked + 1,
    events: [
      ...state.events,
      makeEvent(state.sessionId, "gate1_completed", { scenarioScores, clusterScores }),
      makeEvent(state.sessionId, "insight_revealed", { primaryScenario, cluster }),
      makeEvent(state.sessionId, "gate2_question_served", {
        gate2Question,
        text: QUESTION_TEXT[gate2Question],
      }),
    ],
  };
};

export const answerGate2 = (
  state: LoanInsightState,
  answer: Gate2Answer,
): LoanInsightState => {
  if (!state.primaryScenario || !state.cluster || !state.gate2Question) {
    throw new Error("Gate 2 cannot be answered before Gate 1 completion.");
  }

  const rootCause = rootCauseFromGate2(state.gate2Question, answer.value, state.primaryScenario);
  const scoreWithCertainty = confidenceFromScores(state.scenarioScores, answer.certainty);
  const needsFollowUp = answer.certainty === "not_sure" && scoreWithCertainty < 75;
  const nextGate2Question = needsFollowUp
    ? questionForCluster(state.cluster, [state.gate2Question])
    : undefined;

  return {
    ...state,
    gate2Answer: answer,
    rootCause,
    confidence: scoreWithCertainty,
    gate2Question: nextGate2Question,
    state: "refining_insight",
    questionsAsked: needsFollowUp ? state.questionsAsked + 1 : state.questionsAsked,
    events: [
      ...state.events,
      makeEvent(state.sessionId, "gate2_answered", answer),
      ...(needsFollowUp && nextGate2Question
        ? [
            makeEvent(state.sessionId, "gate2_question_served", {
              gate2Question: nextGate2Question,
              text: QUESTION_TEXT[nextGate2Question],
              reason: "low_confidence_not_sure",
            }),
          ]
        : []),
    ],
  };
};

export const shouldShowLeadCapture = (state: LoanInsightState): boolean =>
  state.state === "refining_insight" &&
  state.leadStatus === "unknown" &&
  state.confidence >= 55 &&
  !state.highIntentSkipToCta;

export const markLeadCaptureShown = (state: LoanInsightState): LoanInsightState => ({
  ...state,
  state: "awaiting_lead_capture",
  events: [...state.events, makeEvent(state.sessionId, "lead_capture_shown")],
});

export type LeadSubmitFn = (payload: {
  phone: string;
  sessionId: string;
  meta: Record<string, unknown>;
}) => Promise<void>;

export const submitLeadWithRetry = async (
  state: LoanInsightState,
  phone: string,
  submitFn: LeadSubmitFn,
  retries = 2,
): Promise<LoanInsightState> => {
  let attempt = 0;
  while (attempt <= retries) {
    try {
      await submitFn({
        phone,
        sessionId: state.sessionId,
        meta: {
          primaryScenario: state.primaryScenario,
          rootCause: state.rootCause,
          confidence: state.confidence,
        },
      });
      return {
        ...state,
        leadStatus: "captured",
        state: "awaiting_gate3",
        events: [
          ...state.events,
          makeEvent(state.sessionId, "lead_submitted", { attempt: attempt + 1 }),
        ],
      };
    } catch {
      attempt += 1;
    }
  }

  return {
    ...state,
    state: "awaiting_gate3",
    events: [
      ...state.events,
      makeEvent(state.sessionId, "lead_submit_failed", { retries: retries + 1 }),
    ],
  };
};

export const skipLeadCapture = (
  state: LoanInsightState,
  highIntentSkipToCta = false,
): LoanInsightState => ({
  ...state,
  leadStatus: "skipped",
  highIntentSkipToCta,
  state: highIntentSkipToCta ? "final_output" : "awaiting_gate3",
  events: [
    ...state.events,
    makeEvent(state.sessionId, "lead_skipped", { highIntentSkipToCta }),
  ],
});

export const getGate3Question = (state: LoanInsightState): string => {
  if (!state.rootCause || !state.cluster) {
    throw new Error("Gate 3 question requires root cause and cluster.");
  }
  return gate3QuestionForContext(state.rootCause, state.cluster);
};

export const serveGate3Question = (state: LoanInsightState): LoanInsightState => {
  const question = getGate3Question(state);
  return {
    ...state,
    gate3Question: question,
    events: [...state.events, makeEvent(state.sessionId, "gate3_question_served", { question })],
  };
};

export const answerGate3 = (state: LoanInsightState, answer: string): LoanInsightState => ({
  ...state,
  gate3Question: state.gate3Question ?? getGate3Question(state),
  gate3Answer: answer,
  state: "final_output",
  events: [...state.events, makeEvent(state.sessionId, "gate3_answered", { answer })],
});

export const buildFinalOutput = (
  state: LoanInsightState,
  options?: { rawAiResponse?: string },
): LoanInsightState => {
  if (!state.primaryScenario || !state.cluster || !state.rootCause) {
    throw new Error("Cannot build output before scenario, cluster, and root cause are known.");
  }

  const deterministicOutput = buildDeterministicOutputPayload(state);
  const output = enrichOutputHybrid({
    state,
    output: deterministicOutput,
    rawAiResponse: options?.rawAiResponse,
  });

  return {
    ...state,
    output,
    events: [
      ...state.events,
      makeEvent(state.sessionId, "final_output_ready", output),
      makeEvent(state.sessionId, "insight_revealed", {
        ai_source: output.aiMeta?.source ?? "deterministic_fallback",
        ai_fallback_reason: output.aiMeta?.fallbackReason,
      }),
    ],
  };
};

export const buildDeterministicOutputPayload = (state: LoanInsightState): OutputPayload => {
  if (!state.primaryScenario || !state.cluster || !state.rootCause) {
    throw new Error("Cannot build output before scenario, cluster, and root cause are known.");
  }

  const outputBase: OutputPayload = {
    primaryScenario: state.primaryScenario,
    cluster: state.cluster,
    rootCause: state.rootCause,
    confidence: state.confidence,
    topScenarios: topScenarios(state.scenarioScores),
    insights: [],
    recommendedAction: ROOT_CAUSE_ACTION_TEXT[state.rootCause],
  };
  return withTemplatedNarrative(outputBase);
};

export const trackCtaClick = (state: LoanInsightState, cta: string): LoanInsightState => ({
  ...state,
  events: [...state.events, makeEvent(state.sessionId, "cta_clicked", { cta })],
});

export const getGate2QuestionText = (questionId: QuestionId): string => QUESTION_TEXT[questionId];
