"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { CALENDLY_URL } from "./copy";
import { deriveIndicativeTerms, type EligibilityBucketRequest, type EligibilityResult } from "@/lib/eligibility/scoring";

type StoredFastCapitalResult = {
  sessionId: string;
  buckets: EligibilityBucketRequest;
  result: EligibilityResult;
  createdAt: string;
  leadSubmitted?: boolean;
  leadError?: string | null;
};

export function FastCapitalResultPageClient() {
  const searchParams = useSearchParams();
  const sid = searchParams.get("sid") ?? "";

  const stored = useMemo<StoredFastCapitalResult | null>(() => {
    if (!sid || typeof window === "undefined") return null;
    const raw = window.sessionStorage.getItem(`axiro-fc-result-${sid}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredFastCapitalResult;
    } catch {
      return null;
    }
  }, [sid]);

  const indicativeTerms = useMemo(
    () => (stored ? deriveIndicativeTerms(stored.buckets, stored.result) : null),
    [stored],
  );

  if (!stored) {
    return (
      <main className="relative min-h-screen bg-surface pt-24 sm:pt-24">
        <div className="mesh-gradient" />
        <section className="mx-auto w-full max-w-3xl px-3 pb-4 sm:px-6 sm:pb-8">
          <div className="relative z-10 rounded-3xl border border-slate-200/70 bg-white p-8 text-center shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
            <h1 className="text-2xl font-bold text-slate-900">Result not found</h1>
            <p className="mt-2 text-sm text-slate-600">Please complete the loan quote flow to view your analysis.</p>
            <Link className="mt-5 inline-block rounded-lg bg-primary-container px-5 py-2.5 text-sm font-bold text-white" href="/loan-quote">
              Get my loan quote
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-surface pt-24 sm:pt-24">
      <div className="mesh-gradient" />
      <section className="mx-auto w-full max-w-3xl px-3 pb-6 sm:px-6 sm:pb-10">
        <div className="relative z-10 rounded-3xl border border-slate-200/70 bg-white p-3 shadow-[0_18px_40px_rgba(15,23,42,0.05)] sm:p-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <span className="material-symbols-outlined text-[22px]">check</span>
            </div>
            <h2 className="mt-3 text-center text-2xl font-extrabold text-slate-900">Thank you!</h2>
            <p className="mt-1 text-center text-sm text-slate-600">Here are your indicative loan terms from Axiro.</p>

            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/60 p-3 sm:p-4">
              <dl className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-600">Loan amount</dt>
                  <dd className="text-right font-bold text-slate-900">{indicativeTerms?.loanAmount}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-600">Interest rate</dt>
                  <dd className="text-right font-bold text-slate-900">{indicativeTerms?.interestRate}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-600">Disbursal</dt>
                  <dd className="text-right font-bold text-slate-900">{indicativeTerms?.disbursal}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-600">Eligibility tier</dt>
                  <dd className="text-right font-bold text-slate-900">{stored.result.tier_label}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 sm:p-4">
              <p className="text-sm font-bold text-slate-900">Book a meeting</p>
              <p className="mt-1 text-sm text-slate-600">
                Schedule a call with an Axiro advisor to finalize your best lending option.
              </p>
              <a
                className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-primary-container px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-600"
                href={CALENDLY_URL}
                rel="noreferrer"
                target="_blank"
              >
                Book a meeting slot
              </a>
              <p className="mt-2 text-xs text-slate-600">Need a different time? Our team will call you shortly.</p>
            </div>

            <div className="mt-5">
              <h3 className="text-lg font-bold text-slate-900">What happens next?</h3>
              <p className="mt-1 text-sm text-slate-600">An Axiro advisor will review and contact you shortly.</p>
              <p className="mt-2 text-sm text-slate-600">To speed up approval, keep these documents ready:</p>
            </div>

            <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50/60 p-3 sm:p-4">
              <p className="text-sm font-bold text-slate-900">Required documents</p>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                <li>PAN card of company and directors</li>
                <li>GST certificate</li>
                <li>Last 12 months bank statement</li>
                <li>Latest ITR with computation</li>
              </ul>
            </div>

            <Link className="mt-3 inline-block w-full text-center text-sm font-semibold text-primary-container hover:underline" href="/">
              Back to home
            </Link>

            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              This is an indicative snapshot based on turnover, vintage, and EMI responses. GST and credit data were
              defaulted, so final lender terms may vary.
            </p>
          </div>

          {stored.leadSubmitted ? (
            <p className="mt-4 text-center text-sm font-medium text-emerald-700">Thanks. Our team will reach out shortly.</p>
          ) : null}
          {stored.leadError ? (
            <p className="mt-4 text-center text-sm font-medium text-red-600">{stored.leadError}</p>
          ) : null}

          <Link className="mt-4 inline-block w-full text-center text-sm font-semibold text-slate-600 hover:text-primary-container" href="/fast-capital">
            Go Back
          </Link>
        </div>
      </section>
    </main>
  );
}
