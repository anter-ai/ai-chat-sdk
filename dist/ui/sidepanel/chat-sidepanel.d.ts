import React from "react";
export interface ChatSidepanelProps {
    /** Optional custom title in the side panel header. Defaults to orgLabel or "AI Assistant". */
    title?: string;
    /** Optional subtitle displayed under the main title. */
    subtitle?: string;
    /** Optional custom brand component/node to replace the entire brand area. */
    brand?: React.ReactNode;
    /** Optional custom brand icon/mascot to replace the default Sparkles icon. */
    brandIcon?: React.ReactNode;
    /** Invoked when the user clicks the close/minimize button. */
    onClose?: () => void;
    /**
     * Align with ChatWidget's established navigation API.
     * The icon is shown only when fullChatUrl resolves to a non-empty, non-"#" URL.
     */
    fullChatUrl?: (sessionId: string | null) => string;
    onNavigate?: (url: string) => void;
    /** Required if the artifacts drawer should show an export action, matching ChatWidget/ChatShell. */
    onExportArtifact?: (artifactId: string) => Promise<void>;
    /** Consumer-supplied empty state rendered when there are no messages in the conversation. */
    emptyState?: React.ReactNode;
    /** Optional classes for custom styling overrides. */
    className?: string;
}
export declare function ChatSidepanel(props: ChatSidepanelProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=chat-sidepanel.d.ts.map