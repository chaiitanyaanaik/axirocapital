import type { ClusterId, OutputPayload, RootCauseId, ScenarioId } from "@/lib/loanInsight/types";

const SCENARIO_TEMPLATES: Partial<Record<ScenarioId, string>> = {
  S1: "Your loan pricing appears high compared with your business stability signals.",
  S2: "Recent rejection signals suggest eligibility or packaging friction, not only demand-side issues.",
  S4: "Your growth trend may not yet be reflected in the credit limit currently available.",
  S5: "Your profile may support stronger terms than what you are currently receiving.",
  S6: "Multiple active loans may be creating repayment inefficiency and fragmentation.",
  S7: "Frequent cashflow tightness is likely influencing loan stress and repayment comfort.",
  S9: "New business vintage may be affecting lender confidence and structure options.",
  S12: "Current repayment burden may be too high relative to your operating cashflow rhythm.",
  S14: "Informal borrowing patterns may be reducing formal lender confidence.",
  S19: "NBFC-heavy dependency may be limiting access to lower-cost structured options.",
  S23: "Recent GST decline may be impacting lender risk perception and terms.",
  S25: "First-time borrower status may require a staged formal credit entry approach.",
};

const ROOT_CAUSE_TEMPLATES: Record<RootCauseId, string> = {
  unsecured_loan: "Because the facility is unsecured, lenders are likely pricing in extra risk.",
  working_capital_mismatch: "The loan structure appears mismatched to recurring working-capital usage.",
  receivables_issue: "Long collections are likely creating repayment timing pressure.",
  financial_issue: "Financial documentation quality may be limiting credit clarity for lenders.",
  informal_issue: "Informal credit behavior may be diluting formal credit signals.",
  growth_gap: "Recent growth may not yet be translated into revised lender limits.",
  high_emi_pressure: "Monthly repayment pressure appears to be a key stress point.",
  no_formal_credit_history: "Limited formal borrowing history may be restricting initial lender confidence.",
};

const ACTION_BY_CLUSTER: Record<ClusterId, string> = {
  pricing: "Compare secured and unsecured structures across lender classes before refinancing.",
  cashflow: "Align repayment design to business cash conversion cycle before taking additional debt.",
  credit_access: "Strengthen documentation and lender-ready packaging before next application.",
  growth: "Request a limit revision backed by recent verified growth signals.",
  informal: "Shift transaction behavior toward formal channels to improve credit visibility.",
};

export const buildDeterministicInsights = (args: {
  primaryScenario: ScenarioId;
  rootCause: RootCauseId;
  cluster: ClusterId;
}): { insights: string[]; recommendedAction: string } => ({
  insights: [
    SCENARIO_TEMPLATES[args.primaryScenario] ?? "A clear lending pattern is visible from your inputs.",
    ROOT_CAUSE_TEMPLATES[args.rootCause],
  ],
  recommendedAction: ACTION_BY_CLUSTER[args.cluster],
});

export const withTemplatedNarrative = (output: OutputPayload): OutputPayload => {
  const narrative = buildDeterministicInsights({
    primaryScenario: output.primaryScenario,
    rootCause: output.rootCause,
    cluster: output.cluster,
  });
  return {
    ...output,
    insights: narrative.insights,
    recommendedAction: narrative.recommendedAction,
  };
};

export const buildDeterministicReportSections = (output: OutputPayload): NonNullable<
  OutputPayload["reportSections"]
> => ({
  executiveSummary: output.insights[0] ?? "A clear lending pattern is visible from your inputs.",
  diagnosis: output.insights,
  actionPlan: [output.recommendedAction],
  riskWatchouts: [
    "Monitor repayment pressure monthly to avoid unexpected stress.",
    "Keep documentation and transaction quality consistent before lender discussions.",
  ],
});
