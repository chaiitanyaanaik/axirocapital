export type EligibilityQuestionId = "turnover" | "vintage" | "gst" | "emi" | "credit";

export type EligibilityOption = {
  value: string;
  label: string;
  icon: string;
};

export type EligibilityQuestion = {
  id: EligibilityQuestionId;
  stepLabel: string;
  question: string;
  helpText?: string;
  tipText?: string;
  options: EligibilityOption[];
};

export const ELIGIBILITY_QUESTIONS: EligibilityQuestion[] = [
  {
    id: "turnover",
    stepLabel: "Scale",
    question: "What's your annual turnover/sales?",
    helpText: "Last completed financial year revenue (as per ITR or GST returns).",
    options: [
      { value: "below_50_lakh", label: "Below INR 50 Lakh", icon: "trending_down" },
      { value: "50_lakh_1_cr", label: "INR 50 Lakh - 1 Cr", icon: "trending_flat" },
      { value: "1_5_cr", label: "INR 1 - 5 Crore", icon: "trending_up" },
      { value: "5_10_cr", label: "INR 5 - 10 Crore", icon: "query_stats" },
      { value: "above_10_cr", label: "Above INR 10 Crore", icon: "monitoring" },
    ],
  },
  {
    id: "vintage",
    stepLabel: "Vintage",
    question: "How long has your business been operational?",
    helpText: "Actual operating years, not just date of incorporation.",
    options: [
      { value: "lt_1_year", label: "Less than 1 year", icon: "event" },
      { value: "1_2_years", label: "1 - 2 years", icon: "date_range" },
      { value: "2_3_years", label: "2 - 3 years", icon: "history" },
      { value: "3_5_years", label: "3 - 5 years", icon: "calendar_month" },
      { value: "gt_5_years", label: "More than 5 years", icon: "workspace_premium" },
    ],
  },
  {
    id: "gst",
    stepLabel: "Compliance",
    question: "How regular is your GST filing?",
    helpText: "Most lenders check GSTR-3B filing history for the last 12 months.",
    options: [
      { value: "regular", label: "Filing on time, every month", icon: "fact_check" },
      {
        value: "mostly_regular",
        label: "Mostly regular, occasional 1-2 month delays",
        icon: "check_circle",
      },
      { value: "multiple_delays", label: "Multiple delays / pending returns", icon: "warning" },
      { value: "not_registered", label: "Not GST registered", icon: "report_problem" },
    ],
  },
  {
    id: "emi",
    stepLabel: "Obligations",
    question: "Total existing loan EMIs as % of your monthly turnover/sales?",
    helpText: "Sum of all EMIs (business + personal). Lenders use this for FOIR.",
    options: [
      { value: "none", label: "No existing loans", icon: "check_circle" },
      { value: "lt_10", label: "Less than 10%", icon: "arrow_downward" },
      { value: "10_25", label: "10 - 25%", icon: "remove" },
      { value: "25_40", label: "25 - 40%", icon: "arrow_upward" },
      { value: "gt_40", label: "More than 40%", icon: "priority_high" },
    ],
  },
  {
    id: "credit",
    stepLabel: "Credit Health",
    question: "What's your personal and business credit history?",
    helpText:
      "Lenders check both your personal CIBIL and your business CIBIL/CRIF (CMR). Pick what matches your situation.",
    options: [
      {
        value: "both_clean",
        label: "Both clean - good personal and business credit history",
        icon: "verified",
      },
      {
        value: "personal_good_no_business",
        label: "Good personal credit, but no business loans yet",
        icon: "person",
      },
      {
        value: "no_credit_history",
        label: "No credit history - never taken any loan or credit card",
        icon: "help",
      },
      {
        value: "past_defaults",
        label: "Had past defaults, missed payments, or settlements",
        icon: "gpp_bad",
      },
    ],
  },
];

export type EligibilityAnswers = Partial<Record<EligibilityQuestionId, string>>;
