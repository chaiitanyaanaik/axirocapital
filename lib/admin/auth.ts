import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "axiro_admin_session";

type SessionPayload = {
  email: string;
  exp: number;
};

const base64urlEncode = (value: string): string =>
  Buffer.from(value, "utf8").toString("base64url");

const base64urlDecode = (value: string): string =>
  Buffer.from(value, "base64url").toString("utf8");

const getSecret = (): string | null => process.env.ADMIN_SESSION_SECRET ?? null;

const sign = (payloadEncoded: string): string => {
  const secret = getSecret();
  if (!secret) return "";
  return createHmac("sha256", secret).update(payloadEncoded).digest("base64url");
};

export const isAdminConfigured = (): boolean =>
  Boolean(
    process.env.ADMIN_EMAIL &&
      process.env.ADMIN_PASSWORD &&
      process.env.ADMIN_SESSION_SECRET,
  );

const safeEqual = (a: string, b: string): boolean => {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
};

export const validateAdminCredentials = (email: string, password: string): boolean => {
  if (!isAdminConfigured()) return false;
  const expectedEmail = process.env.ADMIN_EMAIL ?? "";
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "";
  return safeEqual(email.trim().toLowerCase(), expectedEmail.trim().toLowerCase()) &&
    safeEqual(password, expectedPassword);
};

export const createAdminSessionToken = (email: string, ttlSeconds = 60 * 60 * 12): string => {
  const payload: SessionPayload = {
    email,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const encoded = base64urlEncode(JSON.stringify(payload));
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
};

export const verifyAdminSessionToken = (token: string | undefined): SessionPayload | null => {
  if (!token || !isAdminConfigured()) return null;
  const [encoded, providedSig] = token.split(".");
  if (!encoded || !providedSig) return null;
  const expectedSig = sign(encoded);
  if (!expectedSig || !safeEqual(providedSig, expectedSig)) return null;

  try {
    const payload = JSON.parse(base64urlDecode(encoded)) as SessionPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (!payload.email) return null;
    return payload;
  } catch {
    return null;
  }
};
