import { Suspense } from "react";

import { EligibilityResultPageClient } from "@/components/eligibility/EligibilityResultPageClient";
import { Navbar } from "@/components/layout/Navbar";

export default function EligibilityResultPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={null}>
        <EligibilityResultPageClient />
      </Suspense>
    </>
  );
}
