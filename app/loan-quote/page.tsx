import type { Metadata } from "next";

import { FastCapitalQuotePage } from "@/components/fast-capital/FastCapitalQuotePage";
import { pageMetaDescription, pageTitleTag } from "@/components/fast-capital/copy";

export const metadata: Metadata = {
  title: `Loan Quote | ${pageTitleTag}`,
  description: pageMetaDescription,
};

export default function LoanQuotePage() {
  return <FastCapitalQuotePage />;
}
