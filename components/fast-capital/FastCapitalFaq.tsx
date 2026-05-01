"use client";

import { useState } from "react";

const faqTabs = [
  {
    id: "eligibility",
    label: "Eligibility",
    items: [
      {
        q: "How long does the check take?",
        a: "About a minute for the short form. Your snapshot uses the answers you provide plus standard assumptions where we do not ask every lender question up front.",
      },
      {
        q: "Is this a final loan approval?",
        a: "No. You get a preliminary eligibility-style read. Final terms and approvals are always decided by lenders after their diligence.",
      },
    ],
  },
  {
    id: "process",
    label: "Process",
    items: [
      {
        q: "What happens after I submit?",
        a: "You see your tier and summary. Our team can follow up using the contact details you shared.",
      },
    ],
  },
] as const;

type FaqTabId = (typeof faqTabs)[number]["id"];

export function FastCapitalFaq() {
  const [openTab, setOpenTab] = useState<FaqTabId>(faqTabs[0]?.id ?? "eligibility");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const active = faqTabs.find((t) => t.id === openTab) ?? faqTabs[0];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-[0_8px_28px_rgba(15,23,42,0.05)] backdrop-blur-sm sm:p-8">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Common questions</h2>
      <p className="mt-2 text-slate-600">Straight answers before you start.</p>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {faqTabs.map((tab) => (
          <button
            key={tab.id}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              openTab === tab.id
                ? "bg-primary-container text-white shadow-md shadow-emerald-200/40"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            onClick={() => {
              setOpenTab(tab.id);
              setOpenIndex(0);
            }}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ul className="mt-4 divide-y divide-slate-100">
        {active?.items.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <li key={item.q} className="py-3">
              <button
                className="flex w-full items-start justify-between gap-3 text-left"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                type="button"
              >
                <span className="font-semibold text-slate-900">{item.q}</span>
                <span className="material-symbols-outlined shrink-0 text-slate-400">
                  {isOpen ? "expand_less" : "expand_more"}
                </span>
              </button>
              {isOpen ? <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.a}</p> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
