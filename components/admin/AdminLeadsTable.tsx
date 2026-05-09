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

type FunnelEventRow = {
  id: string;
  created_at: string;
  event_name: string;
  session_id: string;
  env: string;
  payload: Record<string, unknown> | null;
};

type AdminTab = "leads" | "funnel";

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

const str = (v: unknown): string => (typeof v === "string" ? v : v == null ? "—" : String(v));

const EnvBadge = ({ env }: { env: string | null }) => {
  if (!env) return null;
  const tone =
    env === "production"
      ? "bg-emerald-50 text-emerald-900 border-emerald-200"
      : env === "preview"
        ? "bg-amber-50 text-amber-900 border-amber-200"
        : "bg-slate-100 text-slate-800 border-slate-200";
  return (
    <span className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${tone}`}>
      Env: {env}
    </span>
  );
};

export function AdminLeadsTable() {
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>("leads");
  const [deploymentEnv, setDeploymentEnv] = useState<string | null>(null);

  const [leadRows, setLeadRows] = useState<LeadRow[]>([]);
  const [leadLoading, setLeadLoading] = useState(true);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [leadQuery, setLeadQuery] = useState("");

  const [funnelRows, setFunnelRows] = useState<FunnelEventRow[]>([]);
  const [funnelLoading, setFunnelLoading] = useState(false);
  const [funnelError, setFunnelError] = useState<string | null>(null);
  const [funnelQuery, setFunnelQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      setLeadError(null);
      setLeadLoading(true);
      try {
        const response = await fetch("/api/admin/leads", { method: "GET" });
        if (!response.ok) {
          const payload = (await response.json()) as { error?: string };
          setLeadError(payload.error ?? "Failed to fetch leads.");
          return;
        }
        const payload = (await response.json()) as {
          leads: LeadRow[];
          deployment_env?: string;
        };
        setLeadRows(payload.leads ?? []);
        if (payload.deployment_env) setDeploymentEnv(payload.deployment_env);
      } finally {
        setLeadLoading(false);
      }
    };
    void load();
  }, []);

  useEffect(() => {
    if (tab !== "funnel") return;
    const load = async () => {
      setFunnelError(null);
      setFunnelLoading(true);
      try {
        const response = await fetch("/api/admin/funnel-events", { method: "GET" });
        if (!response.ok) {
          const payload = (await response.json()) as { error?: string };
          setFunnelError(payload.error ?? "Failed to fetch funnel events.");
          return;
        }
        const payload = (await response.json()) as {
          events: FunnelEventRow[];
          deployment_env?: string;
        };
        setFunnelRows(payload.events ?? []);
        if (payload.deployment_env) setDeploymentEnv(payload.deployment_env);
      } finally {
        setFunnelLoading(false);
      }
    };
    void load();
  }, [tab]);

  const filteredLeads = useMemo(() => {
    if (!leadQuery.trim()) return leadRows;
    const q = leadQuery.toLowerCase();
    return leadRows.filter((row) =>
      [row.name, row.phone, row.email, row.company_name, row.session_id]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [leadQuery, leadRows]);

  const filteredFunnel = useMemo(() => {
    if (!funnelQuery.trim()) return funnelRows;
    const q = funnelQuery.toLowerCase();
    return funnelRows.filter((row) => {
      const path = str(row.payload?.page_path).toLowerCase();
      return (
        row.session_id.toLowerCase().includes(q) ||
        row.event_name.toLowerCase().includes(q) ||
        path.includes(q)
      );
    });
  }, [funnelQuery, funnelRows]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin</h1>
          <div className="flex flex-wrap items-center gap-2">
            <nav className="flex rounded-xl border border-slate-200 bg-slate-50/80 p-1">
              <button
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  tab === "leads"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                onClick={() => setTab("leads")}
                type="button"
              >
                Completed leads
              </button>
              <button
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  tab === "funnel"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                onClick={() => setTab("funnel")}
                type="button"
              >
                Funnel (partial)
              </button>
            </nav>
            <EnvBadge env={deploymentEnv} />
          </div>
          <p className="text-sm text-slate-600">
            {tab === "leads"
              ? "Saved eligibility leads for this deployment environment only."
              : "Fast Capital progress and abandons. Payload may include contact fields (PII)—handle per your privacy policy."}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          {tab === "leads" ? (
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-400 sm:w-72"
              onChange={(e) => setLeadQuery(e.target.value)}
              placeholder="Search name, phone, email"
              value={leadQuery}
            />
          ) : (
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-400 sm:w-72"
              onChange={(e) => setFunnelQuery(e.target.value)}
              placeholder="Search session, event, page path"
              value={funnelQuery}
            />
          )}
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

      {tab === "leads" ? (
        <>
          {leadLoading ? <p className="text-sm text-slate-500">Loading leads...</p> : null}
          {leadError ? <p className="text-sm text-red-600">{leadError}</p> : null}
          {!leadLoading && !leadError ? (
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
                  {filteredLeads.map((row) => (
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
                  {filteredLeads.length === 0 ? (
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
        </>
      ) : (
        <>
          {funnelLoading ? <p className="text-sm text-slate-500">Loading funnel events...</p> : null}
          {funnelError ? <p className="text-sm text-red-600">{funnelError}</p> : null}
          {!funnelLoading && !funnelError ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-slate-600">
                    <th className="px-4 py-3 font-semibold">Created</th>
                    <th className="px-4 py-3 font-semibold">Event</th>
                    <th className="px-4 py-3 font-semibold">Session</th>
                    <th className="px-4 py-3 font-semibold">Page</th>
                    <th className="px-4 py-3 font-semibold">Progress</th>
                    <th className="px-4 py-3 font-semibold min-w-[220px]">Payload</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFunnel.map((row) => {
                    const p = row.payload ?? {};
                    const phase = str(p.phase);
                    const lastPhase = str(p.last_phase);
                    const summary = [
                      p.fields_started_count != null ? `fields: ${String(p.fields_started_count)}` : null,
                      p.step1_complete === true ? "step1 ✓" : null,
                      p.step2_complete === true ? "step2 ✓" : null,
                      p.turnover_key ? `turnover:${str(p.turnover_key)}` : null,
                      p.vintage_key ? `vintage:${str(p.vintage_key)}` : null,
                      p.emi_key ? `emi:${str(p.emi_key)}` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ");
                    return (
                      <tr key={row.id} className="border-t border-slate-100 align-top text-slate-700">
                        <td className="whitespace-nowrap px-4 py-3">
                          {new Date(row.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs">
                            {row.event_name}
                          </span>
                        </td>
                        <td className="max-w-[140px] truncate px-4 py-3 font-mono text-xs" title={row.session_id}>
                          {row.session_id}
                        </td>
                        <td className="max-w-[120px] truncate px-4 py-3 text-xs" title={str(p.page_path)}>
                          {str(p.page_path)}
                        </td>
                        <td className="max-w-[280px] px-4 py-3 text-xs text-slate-600">
                          <div>
                            <span className="font-semibold text-slate-700">phase:</span> {phase}
                          </div>
                          {row.event_name === "fast_capital_abandon" ? (
                            <div>
                              <span className="font-semibold text-slate-700">last:</span> {lastPhase}
                            </div>
                          ) : null}
                          <div className="mt-1 text-slate-600">{summary || "—"}</div>
                        </td>
                        <td className="px-4 py-3">
                          <pre className="max-h-40 max-w-md overflow-auto rounded-lg bg-slate-50 p-2 text-[11px] leading-snug text-slate-800">
                            {JSON.stringify(row.payload, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredFunnel.length === 0 ? (
                    <tr>
                      <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={6}>
                        No funnel events for this environment (payload must include{" "}
                        <code className="rounded bg-slate-100 px-1">app_env</code> matching the badge above).
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
