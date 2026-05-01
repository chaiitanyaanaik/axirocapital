import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AdminLeadsTable } from "@/components/admin/AdminLeadsTable";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin/auth";

export default async function AdminLeadsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifyAdminSessionToken(token)) {
    redirect("/admin/login");
  }

  return (
    <main className="relative min-h-screen px-4 py-10 sm:px-6">
      <div className="mesh-gradient" />
      <div className="relative z-10 mx-auto w-full max-w-[1280px] rounded-3xl border border-white/60 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
        <AdminLeadsTable />
      </div>
    </main>
  );
}
