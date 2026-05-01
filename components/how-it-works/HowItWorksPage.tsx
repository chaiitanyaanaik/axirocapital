"use client";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

const phaseOne = [
  {
    title: "Understand capital needs",
    copy: "Precise quantification of liquidity requirements.",
  },
  {
    title: "Evaluate financial readiness",
    copy: "Deep dive into balance sheets and projections.",
  },
  {
    title: "Review existing loans",
    copy: "Optimization of current debt structures.",
  },
  {
    title: "No CIBIL impact",
    copy: "Soft-pull assessments that protect your credit score.",
  },
];

const phaseTwo = [
  {
    title: "Financial structuring",
    copy: "Custom architecture for complex capital needs.",
  },
  {
    title: "Credit memo creation",
    copy: "High-fidelity dossiers for immediate approval.",
  },
  {
    title: "Lender matching",
    copy: "Connecting your profile to the right risk-appetite.",
  },
  {
    title: "End-to-end follow-ups",
    copy: "Aggressive timeline management with stakeholders.",
  },
];

const phaseThree = [
  {
    title: "Top-ups",
    copy: "Incremental funding as milestones are reached.",
  },
  {
    title: "Better rates",
    copy: "Continuous monitoring for refinancing opportunities.",
  },
  {
    title: "Higher limits",
    copy: "Pre-emptive limit expansion based on performance.",
  },
];

export function HowItWorksPage() {
  useRevealOnScroll();

  return (
    <>
      <Navbar />
      <main className="relative overflow-x-hidden pt-20">
        <div className="mesh-gradient" />
        <div className="mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-6 sm:pt-16 lg:px-8">
          <header className="reveal mx-auto mb-24 max-w-3xl text-center">
            <span className="mb-6 inline-block rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-700">
              Execution Strategy
            </span>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Precision in Capital Deployment
            </h1>
            <p className="text-lg leading-relaxed text-slate-500">
              Our structured approach ensures your institutional funding journey
              is transparent, predictable, and optimized for maximum liquidity
              at minimum cost.
            </p>
          </header>

          <div className="space-y-28 lg:space-y-40">
            <section className="reveal grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-5">
                <div className="mb-8 flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#064e3b] text-lg font-bold text-white">
                    1
                  </span>
                  <h2 className="text-3xl font-bold text-slate-900">Before You Apply</h2>
                </div>
                <p className="mb-10 text-lg text-slate-500">
                  Strategic alignment begins before a single document is signed.
                  We focus on readiness to ensure 100% success rates.
                </p>
                <div className="space-y-6">
                  {phaseOne.map((item) => (
                    <div key={item.title} className="flex items-start gap-4">
                      <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50">
                        <span className="material-symbols-outlined text-[14px] text-primary-container">
                          check
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{item.title}</h4>
                        <p className="text-sm text-slate-500">{item.copy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="glass-card relative overflow-hidden rounded-3xl border-slate-100 p-8 shadow-sm sm:p-10">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6">
                      <span className="material-symbols-outlined mb-4 text-primary-container">
                        analytics
                      </span>
                      <div className="mb-1 text-3xl font-bold text-slate-900">98%</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Initial Fit Accuracy
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6">
                      <span className="material-symbols-outlined mb-4 text-primary-container">
                        timer
                      </span>
                      <div className="mb-1 text-3xl font-bold text-slate-900">24h</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Discovery Window
                      </div>
                    </div>
                    <div className="col-span-2 rounded-2xl border border-slate-100 bg-slate-50/50 p-8">
                      <div className="flex h-32 w-full items-end gap-3 px-4">
                        <div className="h-12 flex-1 rounded-lg bg-slate-200" />
                        <div className="h-24 flex-1 rounded-lg bg-slate-200" />
                        <div className="h-32 flex-1 rounded-lg bg-primary-container" />
                        <div className="h-20 flex-1 rounded-lg bg-slate-200" />
                      </div>
                      <div className="mt-6 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Optimized Readiness Benchmarking
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="reveal grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
              <div className="order-2 lg:order-1 lg:col-span-7">
                <div className="glass-card relative rounded-3xl border-slate-100 p-8 shadow-sm sm:p-10">
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                        Lender Matching Algorithm
                      </div>
                      <div className="text-[10px] font-medium text-slate-400">v2.4 Live</div>
                    </div>
                    <div className="space-y-6">
                      {[
                        ["Bank A", "75%", "w-3/4", "account_balance"],
                        ["Institutional B", "100%", "w-full", "corporate_fare"],
                        ["Fund C", "50%", "w-1/2", "foundation"],
                      ].map(([name, match, width, icon]) => (
                        <div key={name} className="space-y-2">
                          <div className="flex justify-between px-1 text-xs font-bold text-slate-600">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px]">{icon}</span>
                              {name}
                            </div>
                            <span>{match}</span>
                          </div>
                          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                            <div className={`h-full bg-emerald-500 ${width}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-center text-[10px] italic text-slate-400">
                      Visualization: Algorithmic Selection of Primary Institutional
                      Partners
                    </p>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2 lg:col-span-5">
                <div className="mb-8 flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#064e3b] text-lg font-bold text-white">
                    2
                  </span>
                  <h2 className="text-3xl font-bold text-slate-900">During the Process</h2>
                </div>
                <p className="mb-10 text-lg text-slate-500">
                  We manage the complexity of institutional paperwork and lender
                  negotiation, acting as your outsourced treasury desk.
                </p>
                <div className="space-y-6">
                  {phaseTwo.map((item) => (
                    <div key={item.title} className="flex items-start gap-4">
                      <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50">
                        <span className="material-symbols-outlined text-[14px] text-primary-container">
                          check
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{item.title}</h4>
                        <p className="text-sm text-slate-500">{item.copy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="reveal grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-5">
                <div className="mb-8 flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#064e3b] text-lg font-bold text-white">
                    3
                  </span>
                  <h2 className="text-3xl font-bold text-slate-900">After Disbursement</h2>
                </div>
                <p className="mb-10 text-lg text-slate-500">
                  Our relationship scales with your growth. Axiro Capital remains
                  your strategic partner for lifelong capital optimization.
                </p>
                <div className="space-y-6">
                  {phaseThree.map((item) => (
                    <div key={item.title} className="flex items-start gap-4">
                      <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50">
                        <span className="material-symbols-outlined text-[14px] text-primary-container">
                          check
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{item.title}</h4>
                        <p className="text-sm text-slate-500">{item.copy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-7">
                <div className="glass-card relative overflow-hidden rounded-3xl border-slate-100 p-8 shadow-sm sm:p-10">
                  <h3 className="mb-12 text-center text-xl font-bold text-slate-900">
                    Capital Growth Lifecycle
                  </h3>
                  <div className="mb-6 flex h-40 items-end justify-between gap-6">
                    <div className="flex h-16 flex-1 flex-col items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50">
                      <span className="text-[10px] font-bold text-emerald-700">Year 1</span>
                      <span className="text-[10px] text-emerald-600/70">₹10Cr</span>
                    </div>
                    <div className="flex h-24 flex-1 flex-col items-center justify-center rounded-xl border border-emerald-100 bg-emerald-100/50">
                      <span className="text-[10px] font-bold text-emerald-800">Year 2</span>
                      <span className="text-[10px] text-emerald-700/70">₹25Cr</span>
                    </div>
                    <div className="flex h-36 flex-1 flex-col items-center justify-center rounded-xl bg-emerald-500">
                      <span className="text-[10px] font-bold text-white">Year 3</span>
                      <span className="text-[10px] text-white/80">₹60Cr+</span>
                    </div>
                  </div>
                  <p className="text-center text-[10px] font-medium text-slate-400">
                    Client Growth Averaging: 140% Y-o-Y Capital Expansion
                  </p>
                </div>
              </div>
            </section>
          </div>

          <section className="reveal relative mt-28 overflow-hidden rounded-[40px] border border-slate-100 bg-slate-50/50 p-8 sm:mt-40 sm:p-12 lg:p-20">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <h2 className="mb-6 text-4xl font-bold text-slate-900">The Axiro Advantage</h2>
                <p className="mb-12 text-lg text-slate-500">
                  Comparing industry-standard approval rates against the Axiro Capital
                  execution model.
                </p>
                <div className="space-y-10">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-bold uppercase tracking-wider text-slate-400">
                      <span>Industry Standard</span>
                      <span>42%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full w-[42%] bg-slate-400" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-bold uppercase tracking-wider text-primary-container">
                      <span>Axiro Capital Execution</span>
                      <span>94%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-emerald-100">
                      <div className="h-full w-[94%] bg-emerald-500" />
                    </div>
                  </div>
                </div>
                <div className="mt-16 flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {["SM", "AJ", "RK"].map((name, idx) => (
                      <div
                        key={name}
                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[8px] font-bold ${
                          idx === 0 ? "bg-slate-200" : idx === 1 ? "bg-slate-300" : "bg-slate-400"
                        }`}
                      >
                        {name}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Trusted by 500+ High-Growth Enterprises
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-10 rounded-full bg-emerald-50 opacity-50 blur-3xl" />
                <div className="glass-card relative rounded-3xl border-slate-100 p-8 shadow-sm sm:p-10">
                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary-container">
                        trending_up
                      </span>
                      <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                        Approval Velocity
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="rounded-2xl bg-slate-50/50 p-6">
                        <div className="mb-1 text-3xl font-bold text-slate-900">11 Days</div>
                        <div className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">
                          Avg. Disbursement
                        </div>
                      </div>
                      <div className="rounded-2xl bg-slate-50/50 p-6">
                        <div className="mb-1 text-3xl font-bold text-slate-900">₹500Cr+</div>
                        <div className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">
                          Liquidity Access
                        </div>
                      </div>
                    </div>
                    <div className="relative overflow-hidden rounded-2xl bg-[#064e3b] p-8 text-white">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">
                          Final Assessment
                        </span>
                        <span className="material-symbols-outlined text-emerald-300">
                          verified_user
                        </span>
                      </div>
                      <div className="mb-2 text-2xl font-bold">Institutional Ready</div>
                      <p className="text-xs leading-relaxed text-emerald-100/70">
                        Your profile meets the risk parameters of 12+ tier-1 lenders.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="reveal mt-24 text-center sm:mt-40">
            <h2 className="mb-10 text-4xl font-bold text-slate-900">Ready for Execution?</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="rounded-xl bg-primary-container px-10 py-4 text-lg font-bold text-white transition-all hover:bg-emerald-600 active:scale-95">
                Apply for Funding
              </button>
              <button className="rounded-xl border border-slate-200 bg-white px-10 py-4 text-lg font-bold text-slate-900 transition-all hover:bg-slate-50 active:scale-95">
                Schedule Advisory
              </button>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
