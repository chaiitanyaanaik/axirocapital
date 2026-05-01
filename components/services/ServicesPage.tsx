"use client";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

const productCards = [
  {
    icon: "sync",
    title: "Working Capital",
    copy: "Optimize cash flow for daily operations.",
  },
  {
    icon: "verified_user",
    title: "Unsecured Loans",
    copy: "Collateral-free credit for high-growth firms.",
  },
  {
    icon: "lock",
    title: "Secured Loans",
    copy: "Asset-backed funding with prime rates.",
  },
  {
    icon: "calendar_today",
    title: "Term Loans",
    copy: "Structured repayment for capital expansion.",
  },
  {
    icon: "home_work",
    title: "LAP",
    copy: "Unlock the value of your real estate assets.",
  },
  {
    icon: "receipt_long",
    title: "Invoice Discounting",
    copy: "Convert unpaid invoices into instant capital.",
  },
];

const industries = [
  "Manufacturing",
  "Trading & Distribution",
  "Information Technology",
  "Healthcare",
  "Logistics",
  "Auto Ancillaries",
  "Hospitality",
];

export function ServicesPage() {
  useRevealOnScroll();

  return (
    <>
      <Navbar />
      <main className="relative overflow-x-hidden pt-20">
        <div className="mesh-gradient" />
        <div className="mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <header className="reveal mx-auto mb-24 max-w-3xl space-y-6 text-center">
          <span className="inline-block rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-600">
            Institutional Precision
          </span>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-display-xl">
            Strategic <span className="text-primary-container">Capital Services</span>
          </h1>
          <p className="mx-auto max-w-2xl text-slate-500 sm:text-body-lg">
            Empowering MSMEs with sophisticated financial engineering and structural
            capital solutions. We bridge the gap between institutional lenders and
            visionary enterprises.
          </p>
        </header>

        <section className="mb-32 grid grid-cols-1 gap-8 md:grid-cols-12">
          <div className="glass-card reveal reveal-delay-1 group relative overflow-hidden rounded-[2.5rem] p-8 sm:p-12 md:col-span-7">
            <div className="relative z-10">
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-primary-container">
                <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
              </div>
              <h3 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-headline-md">
                Credit Advisory
              </h3>
              <p className="mb-8 max-w-md leading-relaxed text-slate-500">
                Deep dive into financial structuring. Our experts analyze your
                balance sheet to create a credit narrative that resonates with
                institutional risk frameworks.
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  "Financial Health Audits",
                  "CMA Report Preparation",
                  "Rating Advisory",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                    <span className="material-symbols-outlined text-[20px] text-primary-container">
                      check_circle
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-0 right-8 flex h-32 w-48 items-end gap-1.5 opacity-20 transition-opacity group-hover:opacity-40">
              {[30, 50, 75, 40, 90].map((height, index) => (
                <div
                  key={`${height}-${index}`}
                  className={`bar-anim flex-1 ${
                    index === 0
                      ? "bg-primary-container/60"
                      : index === 1
                        ? "bg-primary-container/70"
                        : index === 2
                          ? "bg-primary-container/80"
                          : index === 3
                            ? "bg-primary-container/90"
                            : "bg-primary-container"
                  }`}
                  style={{
                    animationDelay: `${[0.1, 0.3, 0.5, 0.2, 0.4][index]}s`,
                    height: `${height}%`,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="reveal reveal-delay-2 relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-xl sm:p-12 md:col-span-5">
            <div className="absolute inset-0 -z-10 bg-gradient-to-bl from-emerald-500/5 to-transparent" />
            <div>
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600">
                <span className="material-symbols-outlined text-3xl">handshake</span>
              </div>
              <h3 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-headline-md">
                Loan Facilitation
              </h3>
              <p className="mb-8 leading-relaxed text-slate-500">
                End-to-end follow-ups and lender matching. We manage the entire
                lifecycle with 40+ banking partners.
              </p>
            </div>
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-end justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Lender Network
                </span>
                <span className="text-sm font-semibold text-emerald-600">
                  40+ Institutions
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="progress-anim relative h-full bg-emerald-500"
                  style={{ "--final-width": "85%" } as React.CSSProperties}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card reveal reveal-delay-3 flex flex-col rounded-[2.5rem] p-8 sm:p-12 md:col-span-5">
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-primary-container">
              <span className="material-symbols-outlined text-3xl">query_stats</span>
            </div>
            <h3 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-headline-md">
              Credit Optimization
            </h3>
            <p className="mb-10 leading-relaxed text-slate-500">
              Precision reduction of interest costs through restructuring existing debt profiles.
            </p>
            <div className="mt-auto rounded-3xl border border-slate-200 bg-slate-50 p-8">
              <div className="flex h-32 items-end justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-[95%] rounded-t-xl bg-slate-300" />
                  <div className="text-center text-[10px] font-bold text-slate-500">12.5%</div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="progress-anim h-[65%] rounded-t-xl bg-emerald-500/80" style={{ "--final-width": "100%" } as React.CSSProperties} />
                  <div className="text-center text-[10px] font-bold text-emerald-600">8.5%</div>
                </div>
                <div className="ml-4 flex h-full flex-[1.5] flex-col items-center justify-center border-l border-slate-200">
                  <span className="text-3xl font-extrabold text-emerald-600">₹14.2L</span>
                  <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Est. Savings
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card reveal reveal-delay-3 flex flex-col items-center gap-12 rounded-[2.5rem] p-8 sm:p-12 md:col-span-7 md:flex-row">
            <div className="relative hidden h-56 w-56 flex-shrink-0 items-center justify-center overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 p-6 lg:flex">
              <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path
                  className="svg-path-anim"
                  d="M0,80 Q25,70 50,40 T100,20"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                />
                <circle className="animate-pulse" cx="100" cy="20" r="4" fill="#10b981" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent" />
            </div>
            <div>
              <h3 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-headline-md">
                Ongoing Capital Strategy
              </h3>
              <p className="mb-8 leading-relaxed text-slate-500">
                We do not just facilitate loans; we build long-term capital runways.
                Quarterly reviews ensure your debt structure evolves with your growth.
              </p>
              <button className="group flex items-center gap-3 text-sm font-bold tracking-tight text-emerald-600">
                EXPLORE STRATEGY
                <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        </section>

        <section className="reveal mb-32">
          <div className="mb-16">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-headline-lg">
              Specialized Loan Products
            </h2>
            <p className="max-w-xl text-slate-500">
              Curated capital solutions tailored to specific business requirements and
              cash flow cycles.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-3">
            {productCards.map((card) => (
              <div
                key={card.title}
                className="glass-card group cursor-pointer rounded-[2rem] border-slate-200 p-6 transition-all hover:bg-emerald-50/30 hover:shadow-xl sm:p-10"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-2xl text-primary-container">
                    {card.icon}
                  </span>
                </div>
                <h4 className="mb-2 text-lg font-bold text-slate-900">{card.title}</h4>
                <p className="text-sm leading-relaxed text-slate-500">{card.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card reveal mb-32 rounded-[3rem] border-slate-200 p-8 sm:p-16">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-headline-lg">
            Industries We Serve
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {industries.map((industry) => (
              <span
                key={industry}
                className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-8 py-3 text-xs font-bold tracking-wide text-emerald-600"
              >
                {industry}
              </span>
            ))}
          </div>
        </section>

        <section className="reveal">
          <div className="relative overflow-hidden rounded-[3rem] border border-slate-200 bg-white px-8 py-24 text-center shadow-2xl">
            <div className="absolute -translate-x-1/2 -translate-y-1/2 h-80 w-80 bg-emerald-500/5 opacity-40 blur-[120px]" />
            <div className="absolute bottom-0 right-0 h-80 w-80 translate-x-1/2 translate-y-1/2 bg-emerald-500/5 opacity-30 blur-[120px]" />
            <div className="relative z-10 mx-auto max-w-3xl space-y-8">
              <h2 className="text-4xl font-extrabold leading-tight text-slate-900 sm:text-[48px]">
                Ready to scale your capital?
              </h2>
              <p className="mb-10 text-slate-500 sm:text-body-lg">
                Get a complimentary credit assessment and discover your business&apos;s true borrowing potential. Join 400+ scalable enterprises.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button className="rounded-2xl bg-primary-container px-12 py-5 text-lg font-bold text-white transition-all hover:shadow-xl hover:shadow-emerald-500/30 active:scale-95">
                  Check your eligibility
                </button>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                No credit pull required for initial assessment
              </div>
            </div>
          </div>
        </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
