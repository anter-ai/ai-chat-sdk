"use client";

import { useEffect, useState } from "react";

export interface VisualViewportRect {
  height: number;
  offsetTop: number;
}

/**
 * Tracks `window.visualViewport`. CSS `dvh`/`vh` do not shrink with the iOS
 * keyboard (Safari's default `interactive-widget=resizes-visual` leaves the
 * layout viewport alone). A `position: fixed` overlay sized with `inset: 0` /
 * `100dvh` then gets dragged off-screen when Safari scrolls the focused field
 * into view.
 *
 * Returns `null` when `visualViewport` is missing (SSR, older browsers).
 */
export function useVisualViewport(): VisualViewportRect | null {
  const [rect, setRect] = useState<VisualViewportRect | null>(() => {
    if (typeof window === "undefined" || !window.visualViewport) return null;
    return {
      height: window.visualViewport.height,
      offsetTop: window.visualViewport.offsetTop,
    };
  });

  useEffect(() => {
    const vv = typeof window === "undefined" ? undefined : window.visualViewport;
    if (!vv) return;
    const update = () => setRect({ height: vv.height, offsetTop: vv.offsetTop });
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return rect;
}

/** True when the visual viewport is shorter than the layout viewport by ~a keyboard. */
export function isKeyboardOpen(rect: VisualViewportRect | null): boolean {
  if (!rect || typeof window === "undefined") return false;
  return rect.height + rect.offsetTop < window.innerHeight - 80;
}

/**
 * Height for a `position: fixed` overlay pinned to `visualViewport`.
 * Extend by the home-indicator inset when the keyboard is closed (VV often
 * stops above it). When the keyboard is open, VV already sits above the keys.
 */
export function overlayHeight(rect: VisualViewportRect | null): string | number {
  if (!rect) return "100dvh";
  return isKeyboardOpen(rect)
    ? rect.height
    : `calc(${rect.height}px + env(safe-area-inset-bottom, 0px))`;
}
