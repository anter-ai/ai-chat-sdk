"use client";

import { useEffect, type RefObject } from "react";

/** True when the browser understands dynamic viewport units (dvh). */
export function supportsDvh(): boolean {
  return (
    typeof CSS !== "undefined" &&
    typeof CSS.supports === "function" &&
    CSS.supports("height", "100dvh")
  );
}

/**
 * Fallback for browsers without `dvh` support: tracks `window.visualViewport`
 * and writes the measured height to the `--ais-viewport-height` CSS custom
 * property on the given element, so `--ais-available-height` (and everything
 * sized from it, like the chat shell) reflects the *visible* viewport even as
 * mobile browser chrome (address bar / bottom nav) shows and hides.
 *
 * No-op when `dvh` is supported (CSS handles it) or `visualViewport` is
 * unavailable (desktop browsers without it don't have dynamic chrome).
 */
export function useViewportHeightFallback(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (supportsDvh()) return;
    const viewport = window.visualViewport;
    const el = ref.current;
    if (!viewport || !el) return;

    const update = () => {
      el.style.setProperty("--ais-viewport-height", `${Math.round(viewport.height)}px`);
    };
    update();
    viewport.addEventListener("resize", update);
    return () => {
      viewport.removeEventListener("resize", update);
      el.style.removeProperty("--ais-viewport-height");
    };
  }, [ref]);
}
