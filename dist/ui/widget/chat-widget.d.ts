import React from "react";
interface ChatWidgetProps {
    position?: "bottom-right" | "bottom-left";
    initialOpen?: boolean;
    fullChatUrl: (sessionId: string | null) => string;
    onNavigate: (url: string) => void;
    /** Optional callback to save an artifact to an external system. When provided, an export button is shown. */
    onExportArtifact?: (artifactId: string) => Promise<void>;
    /** Widget header title. Defaults to the orgLabel from ChatProvider or "AI Assistant". */
    title?: string;
    /** Widget header subtitle. Optional. */
    subtitle?: string;
    /** Consumer-supplied empty state shown when there are no messages. */
    emptyState?: React.ReactNode;
    /** Custom trigger element. When provided, replaces the default floating bubble button. */
    trigger?: React.ReactNode | ((props: {
        open: boolean;
    }) => React.ReactNode);
    /** Optional custom brand component/node to replace the entire brand area. */
    brand?: React.ReactNode;
    /** Optional custom brand icon/mascot to replace the default Sparkles icon. */
    brandIcon?: React.ReactNode;
}
export declare function ChatWidget({ position, initialOpen, fullChatUrl, onNavigate, onExportArtifact, title, subtitle, emptyState, trigger, brand, brandIcon, }: ChatWidgetProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=chat-widget.d.ts.map