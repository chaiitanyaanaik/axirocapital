import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin/auth";

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (verifyAdminSessionToken(token)) {
    redirect("/admin/leads");
  }

  return (
    <main className="relative min-h-screen px-4 py-20">
      <div className="mesh-gradient" />
      <div className="relative z-10 mx-auto w-full max-w-md rounded-3xl border border-white/60 bg-white/85 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Login</h1>
        <p className="mt-2 text-sm text-slate-600">Sign in to view and manage eligibility leads.</p>
        <div className="mt-6">
          <AdminLoginForm />
        </div>
      </div>
    </main>
  );
}
