"use client";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

export function ContactPage() {
  useRevealOnScroll();

  return (
    <>
      <Navbar />
      <main className="relative overflow-x-hidden pt-20">
        <div className="mesh-gradient" />
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:px-8">
          <div className="reveal mb-16 space-y-6 text-center">
            <span className="inline-block rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Institutional Advisory
            </span>
            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-display-xl">
              Get your free <br />
              <span className="text-primary-container">advisory check.</span>
            </h1>
            <p className="mx-auto max-w-2xl text-on-surface-variant sm:text-body-lg">
              Precision-driven financial auditing for MSMEs. Evaluate your
              eligibility for credit facilities starting from ₹50L with zero impact
              on your credit score.
            </p>
          </div>

          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
            <div className="reveal lg:col-span-8">
              <div className="glass-card rounded-[2rem] border-white/60 p-8 sm:p-10 lg:p-12">
                <form action="#" className="space-y-10" method="POST">
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-tighter text-slate-500">
                        Business Name
                      </label>
                      <input
                        className="w-full rounded-xl border border-black/5 bg-white/60 px-5 py-4 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                        placeholder="Legal entity name"
                        type="text"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-tighter text-slate-500">
                        Industry Sector
                      </label>
                      <select className="w-full appearance-none rounded-xl border border-black/5 bg-white/60 px-5 py-4 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10">
                        <option>Select sector</option>
                        <option>Manufacturing</option>
                        <option>Services</option>
                        <option>Infrastructure</option>
                        <option>Trading</option>
                        <option>Technology</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-tighter text-slate-500">
                        Annual Turnover (min ₹50L)
                      </label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 font-medium text-slate-400">
                          ₹
                        </span>
                        <input
                          className="w-full rounded-xl border border-black/5 bg-white/60 py-4 pl-10 pr-5 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                          min="5000000"
                          placeholder="50,00,000"
                          type="number"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-tighter text-slate-500">
                        Loan Requirement
                      </label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 font-medium text-slate-400">
                          ₹
                        </span>
                        <input
                          className="w-full rounded-xl border border-black/5 bg-white/60 py-4 pl-10 pr-5 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                          placeholder="Requirement amount"
                          type="number"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-8 border-t border-slate-100 pt-10 md:grid-cols-2 md:gap-10">
                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-tighter text-slate-500">
                        Email Address
                      </label>
                      <input
                        className="w-full rounded-xl border border-black/5 bg-white/60 px-5 py-4 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                        placeholder="corporate@company.com"
                        type="email"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 pt-2">
                    <input
                      className="h-5 w-5 rounded border-slate-200 text-primary-container focus:ring-emerald-500/20"
                      type="checkbox"
                    />
                    <p className="text-sm text-on-surface-variant">
                      I agree to the{" "}
                      <a className="font-semibold text-primary-container hover:underline" href="#">
                        Terms of Advisory
                      </a>{" "}
                      and Privacy Policy.
                    </p>
                  </div>

                  <button
                    className="w-full rounded-2xl bg-primary-container py-5 text-xl font-bold text-white transition-all hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98]"
                    type="submit"
                  >
                    Request Advisory Report
                  </button>
                </form>
              </div>
            </div>

            <div className="space-y-8 lg:col-span-4">
              <div className="glass-card reveal rounded-[2rem] border-white/60 p-8 lg:p-10">
                <h3 className="mb-8 text-2xl font-bold text-slate-900">Trust Protocol</h3>
                <div className="space-y-6">
                  {[
                    [
                      "lock",
                      "Privacy Guaranteed",
                      "Military-grade encryption for all corporate financial data submitted.",
                    ],
                    [
                      "verified_user",
                      "No CIBIL Impact",
                      "Soft audit technology that evaluates eligibility without credit score hits.",
                    ],
                    [
                      "analytics",
                      "Professional Audit",
                      "Reports generated by SEBI registered investment advisors.",
                    ],
                  ].map(([icon, title, copy]) => (
                    <div key={title} className="group flex gap-5">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-sm transition-colors group-hover:border-emerald-200">
                        <span className="material-symbols-outlined text-primary-container">{icon}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{title}</h4>
                        <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
                          {copy}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card reveal reveal-delay-1 rounded-[2rem] border-white/60 p-8 lg:p-10">
                <h3 className="mb-4 text-2xl font-bold text-slate-900">Contact Us</h3>
                <div className="space-y-5">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="material-symbols-outlined text-xl text-primary-container">
                      mail
                    </span>
                    <span className="text-on-surface">advisory@axirocapital.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
