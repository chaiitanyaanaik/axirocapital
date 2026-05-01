"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { CALENDLY_URL } from "@/components/fast-capital/copy";
import { deriveIndicativeTerms, type EligibilityBucketRequest, type EligibilityResult } from "@/lib/eligibility/scoring";

type StoredEligibilityResult = {
  sessionId: string;
  buckets: EligibilityBucketRequest;
  result: EligibilityResult;
  createdAt: string;
};

export function EligibilityResultPageClient() {
  const searchParams = useSearchParams();
  const sid = searchParams.get("sid") ?? "";
  const [contact, setContact] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const stored = useMemo<StoredEligibilityResult | null>(() => {
    if (!sid || typeof window === "undefined") return null;
    const raw = window.sessionStorage.getItem(`axiro-eligibility-result-${sid}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredEligibilityResult;
    } catch {
      return null;
    }
  }, [sid]);

  const normalizedName = contact.name.trim();
  const normalizedPhone = contact.phone.replace(/\D/g, "");
  const normalizedEmail = contact.email.trim();
  const isNameValid = normalizedName.length >= 2;
  const isPhoneValid = /^[6-9]\d{9}$/.test(normalizedPhone);
  const isEmailValid =
    normalizedEmail.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
  const canSubmit = !!stored && isNameValid && isPhoneValid && !isSubmitting;
  const indicativeTerms = useMemo(
    () => (stored ? deriveIndicativeTerms(stored.buckets, stored.result) : null),
    [stored],
  );

  const onSubmitSupport = async () => {
    if (!stored || !canSubmit) return;
    if (!isEmailValid) {
      setSubmitError("Enter a valid email address or leave it blank.");
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/eligibility/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: stored.sessionId,
          ...stored.buckets,
          tier: stored.result.tier,
          score: stored.result.score,
          lead_metadata: {
            name: normalizedName,
            phone: normalizedPhone,
            email: normalizedEmail || undefined,
            company_name: contact.company.trim() || undefined,
          },
        }),
      });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string; detail?: string };
        const detail = payload.detail ? ` (${payload.detail})` : "";
        setSubmitError(`${payload.error ?? "Unable to save details right now."}${detail}`);
        return;
      }
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!stored) {
    return (
      <main className="relative min-h-screen bg-surface pt-24 sm:pt-24">
        <div className="mesh-gradient" />
        <section className="mx-auto w-full max-w-3xl px-3 pb-4 sm:px-6 sm:pb-8">
          <div className="relative z-10 rounded-3xl border border-slate-200/70 bg-white p-8 text-center shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
            <h1 className="text-2xl font-bold text-slate-900">Result not found</h1>
            <p className="mt-2 text-sm text-slate-600">Please complete the eligibility flow to view your analysis.</p>
            <Link className="mt-5 inline-block rounded-lg bg-primary-container px-5 py-2.5 text-sm font-bold text-white" href="/eligibility">
              Check eligibility
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

            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              This is an indicative snapshot based on your 5 responses. Final eligibility may vary after detailed
              backend verification.
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-2xl font-semibold tracking-tight text-slate-900">Proceed with loan support</h3>
            <p className="mt-2 text-sm text-slate-600">Share your details and an expert will help you with next steps.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <input
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400"
                onChange={(e) => setContact((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Full name"
                value={contact.name}
              />
              <input
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400"
                inputMode="numeric"
                maxLength={10}
                onChange={(e) => setContact((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="Phone number (10 digits)"
                value={contact.phone}
              />
              <input
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 sm:col-span-2"
                onChange={(e) => setContact((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Email (optional)"
                type="email"
                value={contact.email}
              />
              <input
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 sm:col-span-2"
                onChange={(e) => setContact((prev) => ({ ...prev, company: e.target.value }))}
                placeholder="Company name (optional)"
                value={contact.company}
              />
            </div>
            <button
              className="mt-4 w-full rounded-xl bg-primary-container px-5 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={!canSubmit}
              onClick={onSubmitSupport}
              type="button"
            >
              {submitted ? "Submitted" : isSubmitting ? "Submitting..." : "Request Support"}
            </button>
            {!isPhoneValid && contact.phone.trim().length > 0 ? (
              <p className="mt-2 text-center text-xs font-medium text-red-600">
                Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.
              </p>
            ) : null}
            {!isEmailValid && normalizedEmail.length > 0 ? (
              <p className="mt-2 text-center text-xs font-medium text-red-600">
                Enter a valid email address or leave it blank.
              </p>
            ) : null}
            {submitted ? (
              <p className="mt-3 text-center text-sm font-medium text-emerald-700">Thanks. Our team will reach out shortly.</p>
            ) : null}
            {submitError ? <p className="mt-3 text-center text-sm font-medium text-red-600">{submitError}</p> : null}
          </div>

          <Link className="mt-4 inline-block w-full text-center text-sm font-semibold text-primary-container hover:underline" href="/">
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
