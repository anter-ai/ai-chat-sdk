/** Phone cutoff. Matches the production bar: `< 768` is mobile, 768+ is desktop. */
export declare const MOBILE_BREAKPOINT_PX = 768;
/**
 * Viewport-surface mobile flag. Overlays, sheets, and chrome use this.
 * Do not key in-flow host pages off this hook when a docked side panel can
 * shrink the leftover pane — that decision belongs in the host.
 */
export declare function useIsMobile(breakpoint?: number): boolean;
//# sourceMappingURL=use-is-mobile.d.ts.map