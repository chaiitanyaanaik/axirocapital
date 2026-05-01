"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error ?? "Login failed.");
        return;
      }
      router.push("/admin/leads");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <input
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-400"
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Admin email"
        type="email"
        value={email}
      />
      <input
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-400"
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        type="password"
        value={password}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        className="w-full rounded-xl bg-primary-container px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        disabled={!email || !password || loading}
        type="submit"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
