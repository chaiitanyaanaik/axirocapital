"use client";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

const expertiseItems = [
  {
    icon: "account_balance",
    title: "Structured Finance",
    copy: "Complex debt structuring and hybrid capital solutions.",
  },
  {
    icon: "monitoring",
    title: "Market Strategy",
    copy: "Data-driven growth blueprints and market positioning.",
  },
  {
    icon: "gavel",
    title: "Regulatory Compliance",
    copy: "SEBI-aligned advisory ensuring institutional trust.",
  },
  {
    icon: "hub",
    title: "Lender Ecosystem",
    copy: "Access to 50+ institutional lenders and private investors.",
  },
];

export function AboutPage() {
  useRevealOnScroll();

  return (
    <>
      <Navbar />
      <main className="relative overflow-x-hidden pt-16 sm:pt-20">
        <div className="mesh-gradient" />
        <section className="mx-auto mb-12 w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 md:mb-14 md:py-12 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-8 text-center">
            <span className="inline-block rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-600">
              Axiro Capital
            </span>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-display-xl">
              Our Story - <br />
              <span className="text-glow text-primary-container">Precision</span>{" "}
              in Capital.
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-600 sm:text-body-lg">
              Axiro Capital was founded on a singular realization: MSMEs are the
              engine of progress, yet they are often underserved by
              institutional advisory. We bridge this gap with consulting-grade
              precision and a partnership-first mindset.
            </p>
            <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
              <button className="rounded-xl bg-primary-container px-8 py-4 text-sm font-semibold uppercase tracking-[0.05em] text-white transition-all hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95">
                Partner With Us
              </button>
              <button className="glass-surface rounded-xl border border-emerald-500/20 px-8 py-4 text-sm font-semibold uppercase tracking-[0.05em] text-emerald-600 transition-all hover:bg-white/50 active:scale-95">
                View Case Studies
              </button>
            </div>
          </div>
        </section>

        <section className="mx-auto mb-24 w-full max-w-7xl px-4 sm:px-6 md:mb-32 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="glass-surface reveal rounded-[2rem] border-white/60 p-8 transition-all duration-500 hover:shadow-xl sm:rounded-[3rem] sm:p-12">
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50/70 shadow-sm">
                <span className="material-symbols-outlined text-3xl text-emerald-600">
                  target
                </span>
              </div>
              <h2 className="mb-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-headline-lg">
                Our Mission
              </h2>
              <p className="mb-8 text-base leading-relaxed text-slate-600 sm:text-body-lg">
                To democratize high-end financial advisory for MSMEs through our{" "}
                <span className="font-semibold text-emerald-600">
                  No Upfront Fee
                </span>{" "}
                model. We align our success entirely with the growth of our
                partners.
              </p>
              <ul className="space-y-4">
                {[
                  "Aligned Performance-based Incentives",
                  "Institutional Quality Documentation",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-700">
                    <span className="material-symbols-outlined text-xl text-emerald-500">
                      task_alt
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-surface reveal reveal-delay-1 rounded-[2rem] border-white/60 p-8 transition-all duration-500 hover:shadow-xl sm:rounded-[3rem] sm:p-12">
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-pink-100 bg-pink-50/70 shadow-sm">
                <span className="material-symbols-outlined text-3xl text-[#a43073]">
                  visibility
                </span>
              </div>
              <h2 className="mb-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-headline-lg">
                Our Vision
              </h2>
              <p className="mb-8 text-base leading-relaxed text-slate-600 sm:text-body-lg">
                Becoming the cornerstone of the Indian MSME ecosystem. We
                envision a future where every ambitious business has access to{" "}
                <span className="font-semibold text-[#a43073]">
                  Advisory-first
                </span>{" "}
                capital structures.
              </p>
              <ul className="space-y-4">
                {[
                  "Transparent Capital Access",
                  "Scalable Financial Infrastructure",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-700">
                    <span className="material-symbols-outlined text-xl text-[#a43073]">
                      workspace_premium
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto mb-24 w-full max-w-7xl px-4 sm:px-6 md:mb-32 lg:px-8">
          <div className="reveal mb-16 space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-headline-lg">
              Consulting-Grade Expertise
            </h2>
            <p className="mx-auto max-w-2xl text-on-surface-variant">
              Our team brings decades of experience from global investment
              banks and tier-1 consulting firms.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {expertiseItems.map((item, idx) => (
              <div
                key={item.title}
                className={`glass-surface reveal rounded-[2rem] border-white/60 p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
                  idx > 0 ? `reveal-delay-${idx}` : ""
                }`}
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-100 bg-white shadow-sm">
                  <span className="material-symbols-outlined text-2xl text-primary-container">
                    {item.icon}
                  </span>
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-800">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{item.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="dark-mesh-gradient reveal relative overflow-hidden py-24">
          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-400/80">
                Previous Experience
              </h2>
            </div>
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-12 text-center md:grid-cols-2">
              <div className="reveal reveal-delay-1">
                <div className="mb-3 text-5xl font-extrabold text-emerald-400 lg:text-6xl">
                  20+ Years
                </div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Of Combined Experience
                </div>
              </div>
              <div className="reveal reveal-delay-2">
                <div className="mb-3 text-5xl font-extrabold text-emerald-400 lg:text-6xl">
                  ₹500Cr+
                </div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Capital Facilitated
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="reveal px-4 py-24 sm:px-6 md:py-32 lg:px-8">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white to-slate-50 px-4 py-16 text-center shadow-xl sm:rounded-[3rem] sm:px-8 sm:py-20">
            <div className="absolute -translate-x-1/2 -translate-y-1/2 h-64 w-64 bg-emerald-100 opacity-40 blur-[100px]" />
            <div className="absolute bottom-0 right-0 h-64 w-64 translate-x-1/2 translate-y-1/2 bg-emerald-50 opacity-40 blur-[100px]" />
            <div className="relative z-10 mx-auto max-w-2xl space-y-8">
              <h2 className="text-4xl font-extrabold leading-none tracking-tight text-slate-900 sm:text-[48px]">
                Ready to scale your ambition?
              </h2>
              <p className="text-slate-500 sm:text-body-lg">
                Connect with our experts today for a confidential,
                obligation-free assessment of your capital requirements.
              </p>
              <div className="flex justify-center">
                <button className="flex items-center gap-3 rounded-2xl bg-primary-container px-10 py-5 text-base font-semibold uppercase tracking-[0.05em] text-white transition-all hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95 sm:text-lg">
                  Meet our advisors
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Join 400+ Scalable Enterprises
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
