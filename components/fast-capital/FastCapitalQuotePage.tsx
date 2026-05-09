import Link from "next/link";

import { FastCapitalLeadFlow } from "./FastCapitalLeadFlow";
import { heroBankHeadlinePrefix, heroTagline } from "./copy";
import { getFundingDateLabel } from "./fundingDate";

export function FastCapitalQuotePage() {
  const fundingDateLabel = getFundingDateLabel();

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#f9fbfc] pb-10 text-[#191c1d]">
      <div className="mesh-gradient" />

      <nav className="fixed left-1/2 top-4 z-50 flex h-16 w-[94%] max-w-[1280px] -translate-x-1/2 items-center justify-between rounded-full border border-slate-100 bg-white px-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)] sm:top-6 sm:px-10">
        <Link className="text-xl font-extrabold tracking-tight text-slate-900" href="/">
          Axiro Capital
        </Link>
        <Link className="text-sm font-semibold text-slate-600 hover:text-primary-container" href="/">
          Home
        </Link>
      </nav>

      <section className="relative z-10 overflow-hidden bg-gradient-to-br from-emerald-50/85 via-white to-sky-50/80 px-4 pb-8 pt-24 text-center sm:px-6 sm:pt-32">
        <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-16 h-56 w-56 rounded-full bg-sky-100/40 blur-3xl" />
        <div className="mx-auto max-w-4xl">
          <div className="mx-auto mb-5 inline-flex max-w-full items-center justify-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/90 px-3 py-1.5 text-xs font-semibold text-emerald-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:mb-6 sm:px-4 sm:py-2 sm:text-sm">
            <span
              className="material-symbols-outlined text-[18px] text-emerald-600"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
            <span>For GST business with ₹1 CR+ annual turnover</span>
          </div>
          <h1 className="text-[2.15rem] font-extrabold leading-[1.05] tracking-tight text-slate-900 [text-wrap:balance] sm:text-5xl sm:leading-[1.08] lg:text-[56px] lg:tracking-[-0.02em]">
            {heroBankHeadlinePrefix}
          </h1>
          <p className="mt-3 text-[1.85rem] font-extrabold leading-[1.1] tracking-tight text-primary-container [text-wrap:balance] sm:mt-4 sm:text-5xl sm:leading-[1.05] lg:mt-5 lg:text-[64px]">
            {fundingDateLabel}
          </p>
          <p className="mx-auto mt-5 max-w-xl text-lg font-medium leading-relaxed text-slate-600 sm:mt-6 sm:text-[22px]">
            {heroTagline}
          </p>

          <div className="relative z-10 mx-auto mt-8 max-w-lg text-left sm:mt-10">
            <FastCapitalLeadFlow />
          </div>
        </div>
      </section>
    </main>
  );
}
