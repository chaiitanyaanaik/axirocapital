import { NextResponse } from "next/server";

import { buildAiPrompt, fetchAiEnrichmentResponse } from "@/lib/loanInsight/ai";
import { buildDeterministicOutputPayload } from "@/lib/loanInsight/engine";
import type { LoanInsightState } from "@/lib/loanInsight/types";

type EnrichRequest = {
  state?: LoanInsightState;
};

const isStateReadyForFinal = (state?: LoanInsightState): state is LoanInsightState =>
  Boolean(state?.primaryScenario && state.cluster && state.rootCause);

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as EnrichRequest;
    if (!isStateReadyForFinal(body.state)) {
      return NextResponse.json(
        { ok: false, error: "State is missing finalization prerequisites." },
        { status: 400 },
      );
    }

    const deterministicOutput = buildDeterministicOutputPayload(body.state);
    const prompt = buildAiPrompt(body.state, deterministicOutput);
    const rawAiResponse = await fetchAiEnrichmentResponse(prompt);

    return NextResponse.json({ ok: true, rawAiResponse });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown enrichment error." },
      { status: 500 },
    );
  }
}
