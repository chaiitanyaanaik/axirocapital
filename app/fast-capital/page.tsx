import type { Metadata } from "next";

import { FastCapitalLandingPage } from "@/components/fast-capital/FastCapitalLandingPage";
import { pageMetaDescription, pageTitleTag } from "@/components/fast-capital/copy";

export const metadata: Metadata = {
  title: pageTitleTag,
  description: pageMetaDescription,
};

export const dynamic = "force-dynamic";

export default function FastCapitalPage() {
  return <FastCapitalLandingPage />;
}
