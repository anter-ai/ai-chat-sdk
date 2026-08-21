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
 * Pass `enabled: false` when the consumer has nothing pinned to the visual
 * viewport (panel closed, desktop layout). visualViewport `scroll` fires on
 * every frame of an iOS momentum scroll, so an always-on subscription inside a
 * component that wraps the host application re-renders that tree continuously.
 * Subscribing only while something is actually pinned keeps the cost
 * proportional to the need.
 *
 * Returns `null` when `visualViewport` is missing (SSR, older browsers) or
 * when disabled.
 */
export function useVisualViewport(enabled = true): VisualViewportRect | null {
  const [rect, setRect] = useState<VisualViewportRect | null>(() => {
    if (typeof window === "undefined" || !window.visualViewport) return null;
    return {
      height: window.visualViewport.height,
      offsetTop: window.visualViewport.offsetTop,
    };
  });

  useEffect(() => {
    if (!enabled) return;
    const vv = typeof window === "undefined" ? undefined : window.visualViewport;
    if (!vv) return;

    // visualViewport `scroll` fires once per animation frame during an iOS
    // momentum scroll. Coalesce to a single state write per frame so a fast
    // scroll costs one render rather than one render per event.
    let frame: number | null = null;
    const apply = () => {
      frame = null;
      setRect((prev) => {
        if (
          prev &&
          Math.abs(prev.height - vv.height) < 1 &&
          Math.abs(prev.offsetTop - vv.offsetTop) < 1
        ) {
          return prev;
        }
        return { height: vv.height, offsetTop: vv.offsetTop };
      });
    };
    // `resize` is low frequency and is what a keyboard appearing looks like, so
    // it applies immediately — coalescing it would add a frame of lag to the
    // pin. `scroll` is the per-frame stream, so that one is coalesced.
    const onScroll = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(apply);
    };

    apply();
    vv.addEventListener("resize", apply);
    vv.addEventListener("scroll", onScroll);
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      vv.removeEventListener("resize", apply);
      vv.removeEventListener("scroll", onScroll);
    };
  }, [enabled]);

  return enabled ? rect : null;
}

const EDITABLE_SELECTOR =
  'input:not([type="button"]):not([type="submit"]):not([type="reset"])' +
  ':not([type="checkbox"]):not([type="radio"]):not([type="file"])' +
  ":not([readonly]):not([disabled])" +
  ", textarea:not([readonly]):not([disabled])" +
  ', [contenteditable=""], [contenteditable="true"]';

/**
 * True when the focused element is something a soft keyboard opens for.
 *
 * This is the load-bearing half of {@link isKeyboardOpen}: a viewport-height
 * heuristic on its own cannot tell a keyboard apart from browser chrome, so
 * without a focus check there is nothing stopping chrome from reading as a
 * keyboard.
 */
export function isEditableFocused(): boolean {
  if (typeof document === "undefined") return false;
  const el = document.activeElement;
  if (!el || typeof el.matches !== "function") return false;
  try {
    return el.matches(EDITABLE_SELECTOR);
  } catch {
    return false;
  }
}

/**
 * True when a soft keyboard is covering part of the viewport.
 *
 * Requires BOTH a focused text-entry element and a materially shorter visual
 * viewport. The height test alone is not sufficient and must never be used on
 * its own: on iOS Safari `window.innerHeight` is the *large* viewport (sized as
 * if the toolbars were hidden), so with the toolbars shown `visualViewport` is
 * already ~100-150px shorter than `innerHeight` with no keyboard present. A
 * bare height test therefore reports "keyboard open" at rest, and flips back
 * and forth as the toolbars collapse and expand during a scroll — which makes
 * anything pinned to the result (a `position: fixed` drawer's `top`/`height`)
 * visibly snap open and shut.
 *
 * The threshold has to clear browser chrome by a wide margin, because the
 * focus gate does not help in the one case that matters most here: a chat
 * composer autofocuses, so "a field is focused" is the resting state. iOS
 * toolbars occlude ~100-150px; a soft keyboard occludes ~300-400px. A quarter
 * of the viewport (floor 150px) sits between the two on every phone size, and
 * scales rather than being a fixed pixel count.
 */
export function isKeyboardOpen(rect: VisualViewportRect | null): boolean {
  if (!rect || typeof window === "undefined") return false;
  if (!isEditableFocused()) return false;
  // Occlusion is how much SHORTER the visual viewport is, i.e.
  // `innerHeight - height`. `offsetTop` says where the visual viewport sits,
  // not how much of it the keyboard covers, and including it here is a bug:
  // when iOS scrolls a focused field into view it pans the visual viewport
  // down, so `offsetTop` grows by roughly the amount `height` shrank and the
  // two cancel. The measured occlusion then collapses toward zero exactly when
  // the keyboard is most open and the pan is largest — detection fails, the
  // overlay never gets pinned, and the panned-away header ends up above the
  // visible area. `offsetTop` belongs in the pin (`top: offsetTop`), which is
  // where it is already used, and nowhere else.
  const occluded = window.innerHeight - rect.height;
  return occluded > Math.max(150, window.innerHeight * 0.25);
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

/**
 * The single source of truth for "is a soft keyboard covering the viewport".
 *
 * {@link isKeyboardOpen} answers the question, but it reads two live sources —
 * the visual viewport and the focused element — and only one of them (the
 * viewport) produces React state on its own. Focus moving in or out of a text
 * field changes the answer without changing any state, so a component that
 * called `isKeyboardOpen` at render time would keep showing a stale answer
 * until something else happened to re-render it. On a real device a VV resize
 * usually follows focus closely enough to hide that, which is exactly the kind
 * of accidental correctness that breaks later.
 *
 * This hook subscribes to both sources, so the returned boolean is always
 * derived from current facts. Prefer it over calling `isKeyboardOpen` directly.
 *
 * Pass `enabled: false` when nothing is pinned to the keyboard; both
 * subscriptions are then skipped entirely.
 */
export function useKeyboardOpen(enabled = true): boolean {
  const viewport = useVisualViewport(enabled);
  const [editableFocused, setEditableFocused] = useState(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const sync = () =>
      setEditableFocused((prev) => {
        const next = isEditableFocused();
        return prev === next ? prev : next;
      });
    // Runs after commit, so an autofocused composer is already focused here.
    sync();
    window.addEventListener("focusin", sync);
    window.addEventListener("focusout", sync);
    return () => {
      window.removeEventListener("focusin", sync);
      window.removeEventListener("focusout", sync);
    };
  }, [enabled]);

  if (!enabled || !editableFocused) return false;
  return isKeyboardOpen(viewport);
}
