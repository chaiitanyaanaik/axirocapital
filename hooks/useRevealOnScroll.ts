"use client";

import { useEffect } from "react";

export function useRevealOnScroll() {
  useEffect(() => {
    const observerOptions: IntersectionObserverInit = {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px",
    };

    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    }, observerOptions);

    reveals.forEach((el) => observer.observe(el));

    reveals.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        el.classList.add("active");
      }
    });

    // Safari/trackpad can emit a tiny first downward wheel delta on Home.
    // Apply a one-time assist, then keep native scrolling.
    const isTargetRoute = window.location.pathname === "/";
    let lastAssistAt = 0;
    let assistedOnce = false;
    const onWheelAssist = (event: WheelEvent) => {
      if (!isTargetRoute) return;
      if (assistedOnce) return;
      if (!event.cancelable) return;
      if (event.ctrlKey || event.metaKey) return;

      if (event.deltaY <= 0) return;
      const absDelta = Math.abs(event.deltaY);
      if (absDelta === 0 || absDelta > 2.5) return;
      if (window.scrollY > 8) return;

      const now = Date.now();
      if (now - lastAssistAt < 120) return;
      lastAssistAt = now;
      assistedOnce = true;

      event.preventDefault();
      const nudgedDelta = Math.min(14, Math.max(8, absDelta * 4));
      window.scrollBy({
        top: nudgedDelta,
        left: 0,
        behavior: "auto",
      });
    };
    window.addEventListener("wheel", onWheelAssist, { passive: false });

    return () => {
      observer.disconnect();
      window.removeEventListener("wheel", onWheelAssist);
    };
  }, []);
}
