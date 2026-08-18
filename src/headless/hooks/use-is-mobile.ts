"use client";

import { useEffect, useState } from "react";

/** Phone cutoff. Matches the production bar: `< 768` is mobile, 768+ is desktop. */
export const MOBILE_BREAKPOINT_PX = 768;

/**
 * Viewport-surface mobile flag. Overlays, sheets, and chrome use this.
 * Do not key in-flow host pages off this hook when a docked side panel can
 * shrink the leftover pane — that decision belongs in the host.
 */
export function useIsMobile(breakpoint: number = MOBILE_BREAKPOINT_PX): boolean {
  const query = `(max-width: ${breakpoint - 1}px)`;
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia(query);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);

  return isMobile;
}
