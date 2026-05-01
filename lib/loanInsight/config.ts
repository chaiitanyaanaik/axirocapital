import type {
  ClusterId,
  Gate1Key,
  QuestionId,
  RootCauseId,
  ScenarioId,
} from "@/lib/loanInsight/types";

type ScenarioRule = {
  id: ScenarioId;
  key: Gate1Key;
  equals: string;
  score: number;
};

export const GATE1_QUESTION_ORDER: Gate1Key[] = [
  "revenue_band",
  "business_age",
  "loan_status",
  "interest_band",
  "cashflow",
  "gst_trend",
  "recent_loan_experience",
];

export const MIN_GATE1_SIGNALS = 6;

export const SCENARIO_CLUSTER_MAP: Record<ScenarioId, ClusterId> = {
  S1: "pricing",
  S2: "credit_access",
  S4: "growth",
  S5: "pricing",
  S6: "cashflow",
  S7: "cashflow",
  S9: "credit_access",
  S12: "cashflow",
  S14: "informal",
  S19: "pricing",
  S23: "cashflow",
  S25: "informal",
};

export const CLUSTER_PRIORITY: ClusterId[] = [
  "credit_access",
  "pricing",
  "cashflow",
  "growth",
  "informal",
];

export const SCENARIO_PRIORITY: ScenarioId[] = [
  "S2",
  "S1",
  "S19",
  "S7",
  "S12",
  "S23",
  "S6",
  "S4",
  "S5",
  "S25",
  "S14",
  "S9",
];

export const CLUSTER_QUESTION_PRIORITY: Partial<Record<ClusterId, QuestionId[]>> = {
  pricing: ["Q1_collateral", "Q2_loan_usage", "Q5_financials"],
  cashflow: ["Q3_receivables", "Q2_loan_usage", "Q10_loan_size"],
  credit_access: ["Q5_financials", "Q7_informality"],
  growth: ["Q4_growth", "Q10_loan_size"],
  informal: ["Q7_informality", "Q5_financials"],
};

export const QUESTION_TEXT: Record<QuestionId, string> = {
  Q1_collateral: "Is your loan secured against any asset, or unsecured?",
  Q2_loan_usage: "Are you using this loan mainly for regular working capital or one-time needs?",
  Q3_receivables: "Do customers usually take longer than expected to pay you?",
  Q4_growth: "Has your business revenue grown recently enough to justify a higher loan limit?",
  Q5_financials: "Are your financials audited, or mostly self-prepared?",
  Q7_informality: "Do you still use informal borrowing or cash-heavy transactions at times?",
  Q10_loan_size: "Is your current loan size enough for your actual business need?",
};

export const ROOT_CAUSE_TO_GATE3_QUESTION: Record<RootCauseId, string> = {
  unsecured_loan: "Do you have any asset that can be considered for collateral?",
  working_capital_mismatch: "Do you need funds regularly during each month?",
  receivables_issue: "Is your average collection cycle more than 45 days?",
  financial_issue: "Can you provide cleaner audited statements for the last year?",
  informal_issue: "Have you explored formal credit options before taking informal credit?",
  growth_gap: "Have you asked your lender for a limit increase recently?",
  high_emi_pressure: "Would shifting tenure help reduce your monthly EMI pressure?",
  no_formal_credit_history: "Would you be open to starting with a small formal credit line?",
};

export const ROOT_CAUSE_ACTION_TEXT: Record<RootCauseId, string> = {
  unsecured_loan: "Evaluate moving to a secured structure to improve pricing eligibility.",
  working_capital_mismatch: "Shift to a working-capital-friendly product with flexible drawdown.",
  receivables_issue: "Align repayment terms with your collection cycle and customer payment behavior.",
  financial_issue: "Improve formal financial documentation before the next lender conversation.",
  informal_issue: "Reduce informal borrowing and increase formal transaction visibility.",
  growth_gap: "Request a credit limit revision backed by recent revenue evidence.",
  high_emi_pressure: "Restructure the loan to reduce monthly EMI pressure.",
  no_formal_credit_history: "Start formal credit history with a manageable first facility.",
};

export const MVP_SCORING_RULES: ScenarioRule[] = [
  { id: "S1", key: "interest_band", equals: "16-22%", score: 50 },
  { id: "S1", key: "gst_trend", equals: "stable", score: 20 },
  { id: "S2", key: "recent_loan_experience", equals: "rejected", score: 80 },
  { id: "S4", key: "revenue_band", equals: "1-5Cr", score: 35 },
  { id: "S4", key: "revenue_band", equals: "5Cr+", score: 45 },
  { id: "S5", key: "interest_band", equals: "12-16%", score: 25 },
  { id: "S5", key: "gst_trend", equals: "stable", score: 20 },
  { id: "S6", key: "loan_status", equals: "multiple", score: 80 },
  { id: "S7", key: "cashflow", equals: "frequently_tight", score: 70 },
  { id: "S7", key: "cashflow", equals: "sometimes_tight", score: 35 },
  { id: "S9", key: "business_age", equals: "<1yr", score: 80 },
  { id: "S12", key: "cashflow", equals: "frequently_tight", score: 55 },
  { id: "S14", key: "loan_status", equals: "no_loan", score: 25 },
  { id: "S19", key: "loan_status", equals: "nbfc", score: 80 },
  { id: "S23", key: "gst_trend", equals: "declining", score: 80 },
  { id: "S25", key: "loan_status", equals: "no_loan", score: 80 },
];
