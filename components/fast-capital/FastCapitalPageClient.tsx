"use client";

import Link from "next/link";

import {
  financingTypesSection,
  formCopy,
  heroBankHeadlinePrefix,
  heroTagline,
  sectorsSection,
} from "./copy";
import { FastCapitalLeadFlow } from "./FastCapitalLeadFlow";

export function FastCapitalPageClient({ fundingDateLabel }: { fundingDateLabel: string }) {
  return (
    <>
      <main className="relative min-h-screen overflow-x-hidden bg-[#f9fbfc] pb-28 text-[#191c1d] md:pb-10">
        <div className="mesh-gradient" />

        <nav className="fixed left-1/2 top-4 z-50 flex h-16 w-[94%] max-w-[1280px] -translate-x-1/2 items-center justify-between rounded-full border border-slate-100 bg-white px-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)] sm:top-6 sm:px-10">
          <Link className="text-xl font-extrabold tracking-tight text-slate-900" href="/">
            Axiro Capital
          </Link>
        </nav>

        <section className="relative z-10 overflow-hidden bg-gradient-to-br from-emerald-50/85 via-white to-sky-50/80 px-4 pb-10 pt-24 text-center sm:px-6 sm:pb-12 sm:pt-32">
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

        <section className="relative z-10 mx-auto max-w-[1280px] px-4 pb-20 pt-10 sm:px-6 sm:pb-24 sm:pt-12">
          <div className="mx-auto mb-7 max-w-3xl text-center sm:mb-8">
            <h2 className="text-[2.05rem] font-extrabold leading-[1.12] tracking-tight text-slate-900 sm:text-3xl">
              {financingTypesSection.title}
            </h2>
            <p className="mx-auto mt-1.5 max-w-2xl text-[1.02rem] leading-[1.35] text-slate-600 sm:mt-2 sm:text-lg">
              {financingTypesSection.subtitle}
            </p>
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-5">
            {financingTypesSection.items.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[#e7eef8] bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.05)] sm:p-6"
              >
                <h3 className="text-lg font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-xl">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-[0.82rem] leading-[1.35] text-slate-500 sm:mt-2 sm:text-base">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="relative z-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-transparent via-emerald-50/40 to-sky-50/50" />
          <section className="mx-auto max-w-[1280px] px-4 pb-20 pt-14 sm:px-6 sm:pb-24 sm:pt-16">
          <div className="mx-auto mb-7 max-w-3xl text-center sm:mb-8">
            <h2 className="text-[2.05rem] font-extrabold leading-[1.12] tracking-tight text-slate-900 sm:text-3xl">
              {sectorsSection.title}
            </h2>
            <p className="mx-auto mt-1.5 max-w-2xl text-[1.02rem] leading-[1.35] text-slate-600 sm:mt-2 sm:text-lg">
              {sectorsSection.subtitle}
            </p>
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
            {sectorsSection.items.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[#e7eef8] bg-white p-4 text-left shadow-[0_1px_3px_rgba(15,23,42,0.05)] sm:p-6"
              >
                <h3 className="text-[1.02rem] font-extrabold leading-[1.2] tracking-tight text-slate-900 sm:text-xl">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-[0.85rem] leading-[1.35] text-slate-500 sm:mt-2 sm:text-[0.95rem]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
          </section>
        </div>

        <footer className="relative z-10 mt-4 border-t border-slate-200 px-4 py-10 text-center sm:mt-6 sm:px-6 sm:py-12">
          <p className="text-sm font-semibold text-slate-500">© 2026 Axiro Capital</p>
        </footer>
      </main>

      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="pointer-events-auto border-t border-slate-200 bg-white/95 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-sm">
          <Link
            className="inline-flex w-full items-center justify-center rounded-xl bg-primary-container py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-200/50 transition hover:bg-emerald-600 active:scale-[0.99]"
            href="/loan-quote"
          >
            {formCopy.stickyCta}
          </Link>
        </div>
      </div>
    </>
  );
}
