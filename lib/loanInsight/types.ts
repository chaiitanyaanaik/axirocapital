export type RevenueBand = "<25L" | "25L-1Cr" | "1-5Cr" | "5Cr+";
export type BusinessAge = "<1yr" | "1-3yr" | "3+yr";
export type LoanStatus = "no_loan" | "bank" | "nbfc" | "multiple";
export type InterestBand = "<12%" | "12-16%" | "16-22%" | "not_sure";
export type Cashflow = "stable" | "sometimes_tight" | "frequently_tight";
export type GstTrend = "stable" | "seasonal" | "declining";
export type RecentLoanExperience = "no" | "approved" | "rejected";

export type Gate1Key =
  | "revenue_band"
  | "business_age"
  | "loan_status"
  | "interest_band"
  | "cashflow"
  | "gst_trend"
  | "recent_loan_experience";

export type Gate1Signals = {
  revenue_band?: RevenueBand;
  business_age?: BusinessAge;
  loan_status?: LoanStatus;
  interest_band?: InterestBand;
  cashflow?: Cashflow;
  gst_trend?: GstTrend;
  recent_loan_experience?: RecentLoanExperience;
};

export type ScenarioId =
  | "S1"
  | "S2"
  | "S4"
  | "S5"
  | "S6"
  | "S7"
  | "S9"
  | "S12"
  | "S14"
  | "S19"
  | "S23"
  | "S25";

export type ClusterId =
  | "pricing"
  | "cashflow"
  | "credit_access"
  | "growth"
  | "informal";

export type QuestionId =
  | "Q1_collateral"
  | "Q2_loan_usage"
  | "Q3_receivables"
  | "Q4_growth"
  | "Q5_financials"
  | "Q7_informality"
  | "Q10_loan_size";

export type QuestionAnswerCertainty = "certain" | "not_sure";

export type Gate2Answer = {
  questionId: QuestionId;
  value: string;
  certainty: QuestionAnswerCertainty;
};

export type RootCauseId =
  | "unsecured_loan"
  | "working_capital_mismatch"
  | "receivables_issue"
  | "financial_issue"
  | "informal_issue"
  | "growth_gap"
  | "high_emi_pressure"
  | "no_formal_credit_history";

export type InsightEventName =
  | "session_started"
  | "gate1_answered"
  | "gate1_completed"
  | "insight_revealed"
  | "gate2_question_served"
  | "gate2_answered"
  | "lead_capture_shown"
  | "lead_submitted"
  | "lead_submit_failed"
  | "lead_skipped"
  | "gate3_question_served"
  | "gate3_answered"
  | "final_output_ready"
  | "cta_clicked";

export type InsightEvent = {
  event_id: string;
  session_id: string;
  user_id?: string;
  name: InsightEventName;
  ts: string;
  payload?: Record<string, unknown>;
};

export type LeadStatus = "unknown" | "captured" | "skipped";

export type EngineStateName =
  | "collecting_inputs"
  | "insight_ready"
  | "awaiting_gate2"
  | "refining_insight"
  | "awaiting_lead_capture"
  | "awaiting_gate3"
  | "final_output";

export type OutputPayload = {
  primaryScenario: ScenarioId;
  cluster: ClusterId;
  rootCause: RootCauseId;
  confidence: number;
  topScenarios: ScenarioId[];
  insights: string[];
  recommendedAction: string;
  aiNarrative?: string;
  confidenceNarrative?: string;
  evidenceBullets?: string[];
  riskSignals?: string[];
  next90DayPlan?: string[];
  aiRecommendations?: string[];
  reportSections?: {
    executiveSummary: string;
    diagnosis: string[];
    actionPlan: string[];
    riskWatchouts: string[];
  };
  aiMeta?: {
    source: "ai_enriched" | "deterministic_fallback";
    fallbackReason?: string;
  };
};

export type AiRecommendation = {
  action: string;
  impactScore: number;
  feasibilityScore: number;
  aiPriorityScore?: number;
  optional?: boolean;
};

export type AiEnrichmentPayload = {
  aiNarrative: string;
  confidenceNarrative: string;
  evidenceBullets: string[];
  riskSignals: string[];
  recommendations: AiRecommendation[];
  next90DayPlan: string[];
  reportSections: {
    executiveSummary: string;
    diagnosis: string[];
    actionPlan: string[];
    riskWatchouts: string[];
  };
};

export type LoanInsightState = {
  sessionId: string;
  state: EngineStateName;
  signals: Gate1Signals;
  scenarioScores: Partial<Record<ScenarioId, number>>;
  primaryScenario?: ScenarioId;
  cluster?: ClusterId;
  gate1Asked: Gate1Key[];
  gate2Question?: QuestionId;
  gate2Answer?: Gate2Answer;
  gate3Question?: string;
  gate3Answer?: string;
  questionsAsked: number;
  rootCause?: RootCauseId;
  confidence: number;
  leadStatus: LeadStatus;
  highIntentSkipToCta: boolean;
  output?: OutputPayload;
  events: InsightEvent[];
};
