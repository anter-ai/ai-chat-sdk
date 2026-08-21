import type { ComposerAnnouncement } from "../../headless/types/chat";
export interface ContextTagBarProps {
    tags?: string[];
    onRemove?: (index: number) => void;
    /** @deprecated unused — banners render via `ComposerBanner`, not `ContextTagBar`. */
    announcement?: ComposerAnnouncement | null;
    className?: string;
    /** @deprecated unused — banners render via `ComposerBanner`, not `ContextTagBar`. */
    layout?: "chip" | "banner";
}
export declare function ContextTagBar({ tags, onRemove, className }: ContextTagBarProps): import("react/jsx-runtime").JSX.Element | null;
//# sourceMappingURL=context-tag-bar.d.ts.map