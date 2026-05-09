export type IndianMobileValidation = {
  raw: string;
  digits: string;
  normalized10: string;
  hasInvalidChars: boolean;
  isValid: boolean;
  error: string | null;
};

const allowedCharsRe = /^[0-9+\-()\s]*$/;

export const normalizeIndianMobileDigits = (input: string): string => input.replace(/\D/g, "");

export const normalizeToIndianMobile10 = (input: string): string => {
  const digits = normalizeIndianMobileDigits(input);
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
};

export const isValidIndianMobile10 = (digits10: string): boolean => /^[6-9]\d{9}$/.test(digits10);

export const validateIndianMobile = (input: string): IndianMobileValidation => {
  const raw = input ?? "";
  const hasInvalidChars = raw.trim().length > 0 && !allowedCharsRe.test(raw);
  const digits = normalizeIndianMobileDigits(raw);
  const normalized10 = normalizeToIndianMobile10(raw);
  const isValid = isValidIndianMobile10(normalized10);

  let error: string | null = null;
  if (raw.trim().length === 0) {
    error = null;
  } else if (hasInvalidChars) {
    error = "Enter a valid mobile number (digits only).";
  } else if (digits.length > 0 && normalized10.length < 10) {
    error = "Enter a 10-digit mobile number.";
  } else if (!isValid) {
    error = "Enter a valid 10-digit Indian mobile number starting with 6–9.";
  }

  return { raw, digits, normalized10, hasInvalidChars, isValid, error };
};

export const isValidIndianMobile = (input: string): boolean =>
  validateIndianMobile(input).isValid;

