export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;

type GtagConfigParams = {
  page_path?: string;
};

declare global {
  interface Window {
    gtag: (
      command: "config" | "event",
      targetId: string,
      config?: GtagConfigParams | Record<string, unknown>,
    ) => void;
  }
}

export const pageview = (url: string) => {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined" || !window.gtag) {
    return;
  }

  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

export const trackEvent = (
  eventName: string,
  params: Record<string, unknown> = {},
) => {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined" || !window.gtag) {
    return;
  }

  window.gtag("event", eventName, params);
};
