import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const ALGO = "aes-256-gcm";

const getKey = (): Buffer | null => {
  const value = process.env.LEADS_ENCRYPTION_KEY;
  if (!value) return null;
  const key = Buffer.from(value, "base64");
  if (key.length !== 32) return null;
  return key;
};

export const hasEncryptionKey = (): boolean => getKey() !== null;

export const encryptPhone = (phone: string): string => {
  const key = getKey();
  if (!key) return phone;

  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(phone, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
};

export const decryptPhone = (encryptedPhone: string): string => {
  const key = getKey();
  if (!key) return encryptedPhone;
  const [ivB64, tagB64, dataB64] = encryptedPhone.split(":");
  if (!ivB64 || !tagB64 || !dataB64) return encryptedPhone;

  try {
    const iv = Buffer.from(ivB64, "base64");
    const tag = Buffer.from(tagB64, "base64");
    const encrypted = Buffer.from(dataB64, "base64");
    const decipher = createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString("utf8");
  } catch {
    return encryptedPhone;
  }
};

export const hashForIdempotency = (sessionId: string, phoneHash: string): string =>
  createHash("sha256").update(`${sessionId}:${phoneHash}`).digest("hex");
