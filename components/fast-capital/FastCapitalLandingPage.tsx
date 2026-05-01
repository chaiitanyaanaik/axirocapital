import { FastCapitalPageClient } from "./FastCapitalPageClient";
import { getFundingDateLabel } from "./fundingDate";

export function FastCapitalLandingPage() {
  const fundingDateLabel = getFundingDateLabel();

  return <FastCapitalPageClient fundingDateLabel={fundingDateLabel} />;
}
