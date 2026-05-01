import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  isAdminConfigured,
  validateAdminCredentials,
} from "@/lib/admin/auth";

type LoginPayload = {
  email: string;
  password: string;
};

export async function POST(req: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Admin credentials are not configured." },
      { status: 500 },
    );
  }

  const body = (await req.json()) as Partial<LoginPayload>;
  if (!body.email || !body.password) {
    return NextResponse.json({ ok: false, error: "Email and password are required." }, { status: 400 });
  }

  if (!validateAdminCredentials(body.email, body.password)) {
    return NextResponse.json({ ok: false, error: "Invalid credentials." }, { status: 401 });
  }

  const token = createAdminSessionToken(body.email);
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}
