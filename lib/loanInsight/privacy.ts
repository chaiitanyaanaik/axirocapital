import { createHash } from "node:crypto";

export const maskPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, "");
  if (digits.length <= 4) return digits;
  return `${"*".repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
};

export const hashPhone = (phone: string): string =>
  createHash("sha256").update(phone.trim()).digest("hex");
