import type {
  Gate1Key,
  Gate1Signals,
  QuestionId,
  ScenarioId,
} from "@/lib/loanInsight/types";

export type OptionItem = { value: string; label: string };

export const GATE1_LABELS: Record<Gate1Key, string> = {
  revenue_band: "What is your current yearly revenue range?",
  business_age: "How old is your business?",
  loan_status: "What is your current loan status?",
  interest_band: "What interest range are you currently paying?",
  cashflow: "How stable is your monthly cashflow?",
  gst_trend: "How has your GST trend been recently?",
  recent_loan_experience: "Any recent loan experience?",
};

export const GATE1_OPTIONS: Record<Gate1Key, string[]> = {
  revenue_band: ["<25L", "25L-1Cr", "1-5Cr", "5Cr+"],
  business_age: ["<1yr", "1-3yr", "3+yr"],
  loan_status: ["no_loan", "bank", "nbfc", "multiple"],
  interest_band: ["<12%", "12-16%", "16-22%", "not_sure"],
  cashflow: ["stable", "sometimes_tight", "frequently_tight"],
  gst_trend: ["stable", "seasonal", "declining"],
  recent_loan_experience: ["no", "approved", "rejected"],
};

const GATE1_OPTION_LABELS: Record<Gate1Key, Record<string, string>> = {
  revenue_band: {
    "<25L": "Under INR 25 Lakhs",
    "25L-1Cr": "INR 25 Lakhs to 1 Cr",
    "1-5Cr": "INR 1-5 Cr",
    "5Cr+": "INR 5 Cr+",
  },
  business_age: {
    "<1yr": "Less than 1 year",
    "1-3yr": "1-3 years",
    "3+yr": "3+ years",
  },
  loan_status: {
    no_loan: "No active loan",
    bank: "Loan from bank",
    nbfc: "Loan from NBFC / fintech",
    multiple: "Multiple loans",
  },
  interest_band: {
    "<12%": "Below 12%",
    "12-16%": "12-16%",
    "16-22%": "16-22%",
    not_sure: "Not sure",
  },
  cashflow: {
    stable: "Mostly comfortable",
    sometimes_tight: "Sometimes tight",
    frequently_tight: "Often tight",
  },
  gst_trend: {
    stable: "Fairly steady",
    seasonal: "Seasonal / fluctuating",
    declining: "Declining",
  },
  recent_loan_experience: {
    no: "No",
    approved: "Yes, got approved",
    rejected: "Yes, got rejected",
  },
};

export const getGate1OptionItems = (key: Gate1Key): OptionItem[] =>
  GATE1_OPTIONS[key].map((value) => ({
    value,
    label: GATE1_OPTION_LABELS[key][value] ?? value.replaceAll("_", " "),
  }));

const GATE2_OPTION_MAP: Record<QuestionId, string[]> = {
  Q1_collateral: ["secured", "unsecured", "not_sure"],
  Q2_loan_usage: ["working_capital", "one_time", "not_sure"],
  Q3_receivables: ["yes_long", "no_normal", "not_sure"],
  Q4_growth: ["yes", "no", "not_sure"],
  Q5_financials: ["audited", "self_prepared", "not_sure"],
  Q7_informality: ["yes", "no", "not_sure"],
  Q10_loan_size: ["enough", "too_small", "not_sure"],
};

export const getGate2Options = (questionId: QuestionId): string[] =>
  GATE2_OPTION_MAP[questionId] ?? ["not_sure"];

export const scenarioLabel = (scenario: ScenarioId): string =>
  ({
    S1: "High interest with stable GST",
    S2: "Loan rejected recently",
    S4: "Low credit limit vs revenue",
    S5: "Unsecured despite strong profile",
    S6: "Multiple small loans",
    S7: "Frequent cashflow dips",
    S9: "New business profile",
    S12: "High EMI pressure",
    S14: "Informal borrowing dependence",
    S19: "NBFC dependency",
    S23: "Recent GST drop",
    S25: "First-time borrower",
  })[scenario];

export const hasMinimumSignals = (signals: Gate1Signals): boolean =>
  Object.values(signals).filter(Boolean).length >= 6;
