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
export declare function useVisualViewport(enabled?: boolean): VisualViewportRect | null;
/**
 * True when the focused element is something a soft keyboard opens for.
 *
 * This is the load-bearing half of {@link isKeyboardOpen}: a viewport-height
 * heuristic on its own cannot tell a keyboard apart from browser chrome, so
 * without a focus check there is nothing stopping chrome from reading as a
 * keyboard.
 */
export declare function isEditableFocused(): boolean;
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
export declare function isKeyboardOpen(rect: VisualViewportRect | null): boolean;
/**
 * Height for a `position: fixed` overlay pinned to `visualViewport`.
 * Extend by the home-indicator inset when the keyboard is closed (VV often
 * stops above it). When the keyboard is open, VV already sits above the keys.
 */
export declare function overlayHeight(rect: VisualViewportRect | null): string | number;
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
export declare function useKeyboardOpen(enabled?: boolean): boolean;
//# sourceMappingURL=use-visual-viewport.d.ts.map