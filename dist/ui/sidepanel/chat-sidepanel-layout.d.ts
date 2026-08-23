import React from "react";
export interface ChatSidepanelLayoutProps {
    /** Renders the main host application view on the left. */
    children: React.ReactNode;
    /** Renders the panel view on the right (typically <ChatSidepanel>). */
    sidepanel: React.ReactNode;
    /** Controls whether the side panel pane is expanded or collapsed. */
    isOpen: boolean;
    /** Callback called when the user collapses the panel (handle/close/backdrop). */
    onClose: () => void;
    /** Percentage-based default width of sidepanel (0-100). Defaults to 30. */
    defaultWidth?: number;
    /** Percentage-based minimum width of sidepanel (0-100). Defaults to 20. */
    minWidth?: number;
    /** Percentage-based maximum width of sidepanel (0-100). Defaults to 50. */
    maxWidth?: number;
    /** Key for persisting user-dragged widths in localStorage. */
    storageKey?: string;
    /** Optional classes for the outer wrapper. */
    className?: string;
    /** Optional accessibility label for the side panel. Defaults to "AI Assistant Panel". */
    ariaLabel?: string;
}
export declare function ChatSidepanelLayout({ children, sidepanel, isOpen, onClose, defaultWidth, minWidth, maxWidth, storageKey, className, ariaLabel, }: ChatSidepanelLayoutProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=chat-sidepanel-layout.d.ts.map