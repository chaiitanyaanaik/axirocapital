import type { EligibilityAnswers } from "@/lib/eligibility/questionnaire";

export type EligibilityBucketRequest = {
  turnover_bucket: number;
  vintage_bucket: number;
  gst_bucket: number;
  emi_bucket: number;
  credit_bucket: number;
};

export type EligibilityResult = {
  tier: 1 | 2 | 3 | 4;
  tier_label: string;
  headline: string;
  score: number;
  color: "green" | "amber" | "red";
};

export type IndicativeTerms = {
  loanAmount: string;
  interestRate: string;
  disbursal: string;
};

const TURNOVER_MAP: Record<string, number> = {
  below_50_lakh: 1,
  "50_lakh_1_cr": 2,
  "1_5_cr": 3,
  "5_10_cr": 4,
  above_10_cr: 5,
};

const VINTAGE_MAP: Record<string, number> = {
  lt_1_year: 1,
  "1_2_years": 2,
  "2_3_years": 3,
  "3_5_years": 4,
  gt_5_years: 5,
};

const GST_MAP: Record<string, number> = {
  regular: 1,
  mostly_regular: 2,
  multiple_delays: 3,
  not_registered: 4,
};

const EMI_MAP: Record<string, number> = {
  none: 1,
  lt_10: 2,
  "10_25": 3,
  "25_40": 4,
  gt_40: 5,
};

const CREDIT_MAP: Record<string, number> = {
  both_clean: 1,
  personal_good_no_business: 2,
  no_credit_history: 3,
  past_defaults: 4,
};

export const mapAnswersToEligibilityBuckets = (
  answers: EligibilityAnswers,
): EligibilityBucketRequest | null => {
  const turnover = answers.turnover ? TURNOVER_MAP[answers.turnover] : undefined;
  const vintage = answers.vintage ? VINTAGE_MAP[answers.vintage] : undefined;
  const gst = answers.gst ? GST_MAP[answers.gst] : undefined;
  const emi = answers.emi ? EMI_MAP[answers.emi] : undefined;
  const credit = answers.credit ? CREDIT_MAP[answers.credit] : undefined;

  if (!turnover || !vintage || !gst || !emi || !credit) return null;

  return {
    turnover_bucket: turnover,
    vintage_bucket: vintage,
    gst_bucket: gst,
    emi_bucket: emi,
    credit_bucket: credit,
  };
};

/**
 * /fast-capital lead-first flow only collects turnover, vintage, and EMI.
 * GST and credit are not asked; use conservative defaults so scores are not inflated.
 * Defaults: mostly_regular GST (bucket 2), no_credit_history (bucket 3).
 */
export const mapFastCapitalAnswersToBuckets = (
  answers: Pick<EligibilityAnswers, "turnover" | "vintage" | "emi">,
): EligibilityBucketRequest | null => {
  const turnover = answers.turnover ? TURNOVER_MAP[answers.turnover] : undefined;
  const vintage = answers.vintage ? VINTAGE_MAP[answers.vintage] : undefined;
  const emi = answers.emi ? EMI_MAP[answers.emi] : undefined;
  if (!turnover || !vintage || !emi) return null;
  return {
    turnover_bucket: turnover,
    vintage_bucket: vintage,
    gst_bucket: 2,
    emi_bucket: emi,
    credit_bucket: 3,
  };
};

export const calculateEligibilityResult = (input: EligibilityBucketRequest): EligibilityResult => {
  const TURNOVER_SCORE = [4, 10, 18, 23, 25];
  const VINTAGE_SCORE = [0, 8, 14, 18, 20];
  const GST_SCORE = [15, 11, 5, 6];
  const EMI_SCORE = [15, 13, 9, 4, 1];
  const CREDIT_SCORE = [25, 20, 10, 4];

  let score =
    TURNOVER_SCORE[input.turnover_bucket - 1] +
    VINTAGE_SCORE[input.vintage_bucket - 1] +
    GST_SCORE[input.gst_bucket - 1] +
    EMI_SCORE[input.emi_bucket - 1] +
    CREDIT_SCORE[input.credit_bucket - 1];

  let tier: 1 | 2 | 3 | 4;

  if (input.vintage_bucket === 1) {
    score = 0;
    tier = 4;
  } else if (score >= 80) {
    tier = 1;
  } else if (score >= 60) {
    tier = 2;
  } else if (score >= 40) {
    tier = 3;
  } else {
    tier = 4;
  }

  const TIER_LABELS = [
    "Very High Eligibility",
    "High Eligibility",
    "Medium Eligibility",
    "Low Eligibility",
  ] as const;
  const TIER_HEADLINES = [
    "You're in the top tier.",
    "You qualify well.",
    "Eligibility with conditions.",
    "Build readiness first.",
  ] as const;
  const TIER_COLORS: Array<"green" | "amber" | "red"> = ["green", "green", "amber", "red"];

  return {
    tier,
    tier_label: TIER_LABELS[tier - 1],
    headline: TIER_HEADLINES[tier - 1],
    score,
    color: TIER_COLORS[tier - 1],
  };
};

const TURNOVER_ESTIMATE_LAKH = [40, 75, 300, 750, 1200] as const;
const TIER_CAP_LAKH = [500, 200, 75, 25] as const;
const TIER_TURNOVER_FRACTION = [0.4, 0.3, 0.2, 0.12] as const;
const BASE_RATE_BY_TIER = [12, 14, 16, 18] as const;

function roundToStep(value: number, step: number): number {
  return Math.max(step, Math.round(value / step) * step);
}

function formatLakhToRupeesBand(valueInLakh: number): string {
  if (valueInLakh >= 100) {
    const inCr = valueInLakh / 100;
    const pretty = Number.isInteger(inCr) ? String(inCr) : inCr.toFixed(1).replace(/\.0$/, "");
    return `Up to Rs ${pretty} Cr`;
  }
  return `Up to Rs ${valueInLakh} L`;
}

export const deriveIndicativeTerms = (
  buckets: EligibilityBucketRequest,
  result: Pick<EligibilityResult, "tier">,
): IndicativeTerms => {
  const tierIndex = result.tier - 1;
  const turnoverEstimateLakh = TURNOVER_ESTIMATE_LAKH[buckets.turnover_bucket - 1];
  const tierCapLakh = TIER_CAP_LAKH[tierIndex];
  const baseFraction = TIER_TURNOVER_FRACTION[tierIndex];

  const vintageFactor = buckets.vintage_bucket >= 4 ? 1.1 : buckets.vintage_bucket <= 2 ? 0.9 : 1;
  const gstFactor = buckets.gst_bucket === 1 ? 1.05 : buckets.gst_bucket >= 3 ? 0.9 : 1;
  const emiFactor = buckets.emi_bucket === 1 ? 1.05 : buckets.emi_bucket >= 4 ? 0.85 : 1;
  const creditFactor = buckets.credit_bucket === 1 ? 1.05 : buckets.credit_bucket === 4 ? 0.8 : 1;

  const rawLoanLakh = turnoverEstimateLakh * baseFraction * vintageFactor * gstFactor * emiFactor * creditFactor;
  const boundedLoanLakh = Math.min(tierCapLakh, Math.max(8, rawLoanLakh));
  const roundedLoanLakh =
    boundedLoanLakh >= 100 ? roundToStep(boundedLoanLakh, 25) : boundedLoanLakh >= 25 ? roundToStep(boundedLoanLakh, 5) : roundToStep(boundedLoanLakh, 1);

  const baseRate = BASE_RATE_BY_TIER[tierIndex];
  const rateAdjustment =
    (buckets.gst_bucket >= 3 ? 1 : buckets.gst_bucket === 1 ? -0.5 : 0) +
    (buckets.emi_bucket >= 4 ? 1 : buckets.emi_bucket === 1 ? -0.5 : 0) +
    (buckets.credit_bucket === 4 ? 1.5 : buckets.credit_bucket === 3 ? 0.5 : buckets.credit_bucket === 1 ? -0.5 : 0);
  const rate = Math.max(baseRate - 1, Math.min(baseRate + 4, Math.round((baseRate + rateAdjustment) * 2) / 2));

  const baseDisbursalDays = result.tier <= 2 ? 7 : result.tier === 3 ? 9 : 12;
  const disbursalDays =
    baseDisbursalDays + (buckets.gst_bucket >= 3 ? 2 : 0) + (buckets.credit_bucket === 4 ? 2 : 0) + (buckets.emi_bucket >= 4 ? 1 : 0);

  return {
    loanAmount: formatLakhToRupeesBand(roundedLoanLakh),
    interestRate: `Starting at ${rate}% p.a.`,
    disbursal: `As fast as ${Math.max(7, Math.min(16, disbursalDays))} days`,
  };
};
