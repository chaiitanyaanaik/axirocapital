"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type LeadRow = {
  id: string;
  created_at: string;
  session_id: string;
  phone: string;
  name: string | null;
  email: string | null;
  company_name: string | null;
  tier: number | null;
  score: number | null;
  turnover_bucket: number | null;
  vintage_bucket: number | null;
  gst_bucket: number | null;
  emi_bucket: number | null;
  credit_bucket: number | null;
};

const RESPONSE_LABELS = {
  turnover: {
    1: "Below INR 50 Lakh",
    2: "INR 50 Lakh - 1 Cr",
    3: "INR 1 - 5 Crore",
    4: "INR 5 - 10 Crore",
    5: "Above INR 10 Crore",
  },
  vintage: {
    1: "Less than 1 year",
    2: "1 - 2 years",
    3: "2 - 3 years",
    4: "3 - 5 years",
    5: "More than 5 years",
  },
  gst: {
    1: "Filing on time, every month",
    2: "Mostly regular, occasional delays",
    3: "Multiple delays / pending returns",
    4: "Not GST registered",
  },
  emi: {
    1: "No existing loans",
    2: "Less than 10%",
    3: "10 - 25%",
    4: "25 - 40%",
    5: "More than 40%",
  },
  credit: {
    1: "Both clean (personal + business)",
    2: "Good personal, no business loans yet",
    3: "No credit history",
    4: "Past defaults / missed payments",
  },
} as const;

const labelForBucket = (
  group: keyof typeof RESPONSE_LABELS,
  value: number | null,
): string => {
  if (!value) return "-";
  return RESPONSE_LABELS[group][value as keyof (typeof RESPONSE_LABELS)[typeof group]] ?? "-";
};

export function AdminLeadsTable() {
  const router = useRouter();
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      setError(null);
      setLoading(true);
      try {
        const response = await fetch("/api/admin/leads", { method: "GET" });
        if (!response.ok) {
          const payload = (await response.json()) as { error?: string };
          setError(payload.error ?? "Failed to fetch leads.");
          return;
        }
        const payload = (await response.json()) as { leads: LeadRow[] };
        setRows(payload.leads ?? []);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((row) =>
      [row.name, row.phone, row.email, row.company_name, row.session_id]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [query, rows]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Eligibility Leads</h1>
        <div className="flex w-full gap-2 sm:w-auto">
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-400 sm:w-72"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone, email"
            value={query}
          />
          <button
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={async () => {
              await fetch("/api/admin/logout", { method: "POST" });
              router.push("/admin/login");
              router.refresh();
            }}
            type="button"
          >
            Logout
          </button>
        </div>
      </div>

      {loading ? <p className="text-sm text-slate-500">Loading leads...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {!loading && !error ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr className="text-slate-600">
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Company</th>
                <th className="px-4 py-3 font-semibold">Tier</th>
                <th className="px-4 py-3 font-semibold">Score</th>
                <th className="px-4 py-3 font-semibold">Responses</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 text-slate-700">
                  <td className="px-4 py-3">{new Date(row.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{row.name ?? "-"}</div>
                    <div className="text-xs text-slate-500">{row.email ?? "-"}</div>
                  </td>
                  <td className="px-4 py-3 font-medium">{row.phone}</td>
                  <td className="px-4 py-3">{row.company_name ?? "-"}</td>
                  <td className="px-4 py-3">{row.tier ?? "-"}</td>
                  <td className="px-4 py-3">{row.score ?? "-"}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    <div className="space-y-1">
                      <p>
                        <span className="font-semibold text-slate-700">Turnover:</span>{" "}
                        {labelForBucket("turnover", row.turnover_bucket)}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-700">Vintage:</span>{" "}
                        {labelForBucket("vintage", row.vintage_bucket)}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-700">GST:</span>{" "}
                        {labelForBucket("gst", row.gst_bucket)}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-700">EMI:</span>{" "}
                        {labelForBucket("emi", row.emi_bucket)}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-700">Credit:</span>{" "}
                        {labelForBucket("credit", row.credit_bucket)}
                      </p>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={7}>
                    No leads found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
