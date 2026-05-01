import Link from "next/link";

const BOTTLENECK_ITEMS = [
  {
    icon: "receipt_long",
    title: "The GST Gap",
    copy: "Mismatch between GST returns and banking credits is the #1 reason for automated rejections. We sync your top-line reporting to institutional standards.",
  },
  {
    icon: "calculate",
    title: "The Ratio Trap",
    copy: "Profitability is secondary to DSCR (Debt Service Coverage Ratio). Banks look for specific liquidity multiples that standard accountants often overlook.",
  },
  {
    icon: "trending_down",
    title: "The Sector Bias",
    copy: "Lender appetites shift monthly. We map your profile to banks currently \"hungry\" for your specific industry to secure lower interest rates.",
  },
] as const;

const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Share a few details (2 mins)",
    copy: "Just basic info about your current loan",
  },
  {
    step: "02",
    title: "We take a quick look",
    copy: "We check what stands out in your setup",
  },
  {
    step: "03",
    title: "You get a clear view",
    copy: "What’s working, what’s not, and why",
  },
  {
    step: "04",
    title: "If it makes sense, we go deeper",
    copy: "We help you fix it-step by step",
  },
] as const;

export function HomePage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#f9fbfc] text-[#191c1d]">
      <div className="mesh-gradient" />
      <nav className="fixed left-1/2 top-4 z-50 flex h-16 w-[94%] max-w-[1280px] -translate-x-1/2 items-center justify-between rounded-full border border-slate-100 bg-white px-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)] sm:top-6 sm:px-10">
        <Link className="text-xl font-extrabold tracking-tight text-slate-900" href="/">
          Axiro Capital
        </Link>
        <Link
          className="rounded-full bg-primary-container px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-200 transition hover:bg-emerald-600"
          href="/eligibility"
        >
          Check Eligibility
        </Link>
      </nav>

      <section className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-10 px-4 pb-16 pt-28 sm:px-6 sm:pt-36 lg:grid-cols-12 lg:gap-16 lg:px-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-7 text-center lg:col-span-12">
          <div className="inline-flex max-w-full items-center justify-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 sm:w-fit sm:gap-2.5 sm:px-4">
            <span
              className="material-symbols-outlined text-[18px] text-emerald-600"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
            <span className="text-xs font-bold text-emerald-800 sm:text-sm">
              Trusted by growing businesses across India
            </span>
          </div>
          <h1 className="text-[2.15rem] font-extrabold leading-[1.05] tracking-tight text-slate-900 [text-wrap:balance] sm:text-6xl sm:leading-[1.02] lg:text-[74px] lg:tracking-[-0.03em]">
            <span className="block">Stop chasing lenders</span>
            <span className="block text-primary-container">
              Get to{" "}
              <span className="inline-block px-0.5 leading-none">Yes</span>{" "}
              faster
            </span>
          </h1>
          <p className="max-w-3xl text-base font-medium leading-relaxed text-slate-600 sm:text-lg">
            Most loans don’t fail because the business is weak. They fail because the case isn’t structured the
            way lenders evaluate risk.
          </p>
          <div className="flex w-full flex-col items-stretch justify-center gap-4 pt-2 sm:flex-row sm:items-stretch sm:gap-5">
            <Link
              className="w-full rounded-xl bg-primary-container px-8 py-4 text-center text-sm font-semibold uppercase tracking-[0.05em] text-white shadow-xl shadow-emerald-200/50 transition-all hover:-translate-y-0.5 hover:bg-emerald-600 sm:max-w-[360px]"
              href="/eligibility"
            >
              Check My Eligibility
            </Link>
            <Link
              className="w-full rounded-2xl border-2 border-slate-300 bg-white px-8 py-3 text-center text-slate-700 shadow-md shadow-slate-200/50 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-lg active:translate-y-0 sm:max-w-[360px]"
              href="https://calendly.com/chaiitanyaanaik/30min"
            >
              <span className="block text-sm font-semibold uppercase tracking-[0.05em]">REVIEW MY CASE</span>
              <span className="mt-1 block text-[11px] font-medium normal-case tracking-normal text-slate-500">
                For ₹30L+ loans or complex scenarios
              </span>
            </Link>
          </div>
          <p className="text-[14px] font-medium text-slate-400">No documents needed. No commitment required.</p>
        </div>
      </section>

      <section className="relative w-full bg-gradient-to-br from-emerald-50/70 via-white to-slate-50 px-4 pb-16 pt-4 sm:px-6 sm:pb-20 lg:px-8">
        <div className="pointer-events-none absolute left-0 top-0 h-48 w-48 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 rounded-full bg-sky-100/40 blur-3xl" />

        <div className="relative z-10 mx-auto w-full max-w-[1280px]">
          <div className="relative z-10">
            <p className="max-w-3xl text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Lenders don&apos;t meet you. They meet your data.
            </p>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
              If your numbers don&apos;t tell the right story, you&apos;re rejected before the first meeting.
            </p>

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {BOTTLENECK_ITEMS.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/80 bg-white/80 p-6 shadow-[0_8px_28px_rgba(15,23,42,0.05)] backdrop-blur-xl"
                >
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-600">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <h3 className="text-[30px] font-semibold leading-tight text-slate-900">{item.title}</h3>
                  <p className="mt-3 text-base leading-relaxed text-slate-600">{item.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-[1280px] px-4 pb-20 sm:px-6 lg:px-8">
        <div className="absolute left-1/4 top-20 -z-10 h-72 w-72 rounded-full bg-emerald-200/20 blur-3xl" />
        <div className="absolute bottom-16 right-1/4 -z-10 h-56 w-56 rounded-full bg-emerald-200/20 blur-3xl" />

        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-[48px]">How this works</h2>
          <p className="mt-3 text-lg text-slate-600 sm:text-[30px]">Simple. No pressure. No guesswork.</p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/50 bg-gradient-to-br from-emerald-50/55 via-white to-sky-50/45 p-6 shadow-[0_4px_32px_rgba(0,0,0,0.03)] backdrop-blur-xl sm:p-10">
          <div className="pointer-events-none absolute -left-16 -top-14 h-40 w-40 rounded-full bg-emerald-100/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -right-12 h-44 w-44 rounded-full bg-sky-100/35 blur-3xl" />
          <div className="absolute left-10 right-10 top-[62px] hidden h-px bg-slate-200/80 md:block" />
          <div className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-4 md:gap-8 lg:gap-10">
            {HOW_IT_WORKS_STEPS.map((item) => (
              <div key={item.step} className="text-left md:text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/50 bg-slate-100 text-sm font-semibold text-emerald-700 shadow-sm md:mx-auto">
                  {item.step}
                </div>
                <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2 text-center sm:mt-10">
          <p className="text-sm font-semibold text-slate-500">
            No documents upfront. No obligation to proceed.
          </p>
        </div>
      </section>

      <footer className="border-t border-slate-200 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-center text-center">
          <p className="text-sm font-bold text-slate-500">© 2026 Axiro Capital</p>
        </div>
      </footer>
    </main>
  );
}
