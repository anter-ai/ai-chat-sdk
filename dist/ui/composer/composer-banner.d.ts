import type { ComposerAnnouncement } from "../../headless/types/chat";
interface ComposerBannerProps {
    banner: ComposerAnnouncement;
    onDismiss?: () => void;
    position?: "top" | "bottom";
    className?: string;
}
export declare function ComposerBanner({ banner, onDismiss, position, className }: ComposerBannerProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=composer-banner.d.ts.map