import { type RefObject } from "react";
/** True when the browser understands dynamic viewport units (dvh). */
export declare function supportsDvh(): boolean;
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
export declare function useViewportHeightFallback(ref: RefObject<HTMLElement | null>): void;
//# sourceMappingURL=use-viewport-height.d.ts.map