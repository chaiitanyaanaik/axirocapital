export const MARKET_TIMEZONE = "Asia/Kolkata";

/** Calendar date in India + 7 days, formatted like “Wednesday, May 6”. */
export function getFundingDateLabel(from: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: MARKET_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(from);
  const y = Number(parts.find((p) => p.type === "year")!.value);
  const m = Number(parts.find((p) => p.type === "month")!.value);
  const d = Number(parts.find((p) => p.type === "day")!.value);
  const future = new Date(Date.UTC(y, m - 1, d + 7));
  return new Intl.DateTimeFormat("en-US", {
    timeZone: MARKET_TIMEZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(future);
}
