import assert from "node:assert/strict";
import test from "node:test";

import { enrichOutputHybrid, parseAiEnrichment } from "@/lib/loanInsight/ai";
import type { LoanInsightState, OutputPayload } from "@/lib/loanInsight/types";

const baseState: LoanInsightState = {
  sessionId: "test-session",
  state: "final_output",
  signals: { loan_status: "nbfc", cashflow: "frequently_tight", gst_trend: "declining" },
  scenarioScores: { S19: 80, S23: 80, S7: 70 },
  primaryScenario: "S19",
  cluster: "pricing",
  gate1Asked: [
    "revenue_band",
    "business_age",
    "loan_status",
    "interest_band",
    "cashflow",
    "gst_trend",
  ],
  questionsAsked: 2,
  rootCause: "unsecured_loan",
  confidence: 78,
  leadStatus: "captured",
  highIntentSkipToCta: false,
  events: [],
};

const baseOutput: OutputPayload = {
  primaryScenario: "S19",
  cluster: "pricing",
  rootCause: "unsecured_loan",
  confidence: 78,
  topScenarios: ["S19", "S23", "S7"],
  insights: ["Pricing appears elevated for your current profile.", "Unsecured structure drives risk premium."],
  recommendedAction: "Compare secured and unsecured structures across lender classes before refinancing.",
};

test("parseAiEnrichment rejects malformed payload", () => {
  const parsed = parseAiEnrichment("{\"foo\": true}");
  assert.equal(Boolean(parsed.value), false);
  assert.equal(typeof parsed.error, "string");
});

test("enrichOutputHybrid falls back for out-of-catalog mandatory recommendation", () => {
  const raw = JSON.stringify({
    aiNarrative: "You can improve terms by adjusting structure.",
    confidenceNarrative: "Confidence is high.",
    evidenceBullets: ["Loan pricing is elevated.", "Cashflow stress appears periodic.", "GST trend weakened."],
    riskSignals: ["High pricing risk", "EMI pressure risk"],
    recommendations: [
      {
        action: "Use an unapproved recommendation string",
        impactScore: 90,
        feasibilityScore: 70,
        aiPriorityScore: 88,
        optional: false,
      },
    ],
    next90DayPlan: ["Collect documents", "Discuss alternatives", "Execute refinancing"],
    reportSections: {
      executiveSummary: "Profile suggests expensive structure.",
      diagnosis: ["Pricing stress", "Unsecured risk"],
      actionPlan: ["Run lender comparison"],
      riskWatchouts: ["Watch repayment pressure"],
    },
  });

  const output = enrichOutputHybrid({ state: baseState, output: baseOutput, rawAiResponse: raw });
  assert.equal(output.aiMeta?.source, "deterministic_fallback");
  assert.equal(
    output.recommendedAction,
    "Compare secured and unsecured structures across lender classes before refinancing.",
  );
});

test("enrichOutputHybrid accepts valid payload and preserves deterministic guardrails", () => {
  const raw = JSON.stringify({
    aiNarrative: "Your pricing can improve with a secured structure and cleaner lender packaging.",
    confidenceNarrative: "Confidence is moderate-high because multiple risk signals align.",
    evidenceBullets: [
      "Current loan pattern indicates pricing pressure.",
      "Loan structure appears unsecured and costly.",
      "Cashflow volatility can amplify repayment stress.",
    ],
    riskSignals: ["Pricing inefficiency", "Repayment stress risk"],
    recommendations: [
      {
        action: "Strengthen documentation and lender-ready packaging before next application.",
        impactScore: 78,
        feasibilityScore: 82,
        aiPriorityScore: 80,
        optional: false,
      },
      {
        action: "Compare secured and unsecured structures across lender classes before refinancing.",
        impactScore: 88,
        feasibilityScore: 74,
        aiPriorityScore: 86,
        optional: false,
      },
    ],
    next90DayPlan: ["Prepare profile pack", "Run lender comparisons", "Refinance with better terms"],
    reportSections: {
      executiveSummary: "Primary issue is pricing inefficiency from current structure.",
      diagnosis: ["High pricing scenario", "Root cause is unsecured risk"],
      actionPlan: ["Compare structures", "Re-negotiate with evidence"],
      riskWatchouts: ["Avoid EMI overhang"],
    },
  });

  const output = enrichOutputHybrid({ state: baseState, output: baseOutput, rawAiResponse: raw });
  assert.equal(output.aiMeta?.source, "ai_enriched");
  assert.equal(output.primaryScenario, "S19");
  assert.equal(output.rootCause, "unsecured_loan");
  assert.equal(typeof output.aiNarrative, "string");
  assert.equal(Array.isArray(output.evidenceBullets), true);
});
