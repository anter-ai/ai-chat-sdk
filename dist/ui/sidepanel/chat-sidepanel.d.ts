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
    /**
     * Whether to show the Tools button in the composer footer.
     * Overrides `config.enableTools` if provided. Defaults to true.
     */
    enableTools?: boolean;
    /**
     * Whether to show the voice input (microphone) button in the composer footer.
     * Overrides `config.enableVoiceInput` if provided. Defaults to true.
     */
    enableVoiceInput?: boolean;
    /**
     * Overrides `config.enableSendButton` if provided. Defaults to true.
     */
    enableSendButton?: boolean;
}
export declare function ChatSidepanel(props: ChatSidepanelProps): React.JSX.Element;
//# sourceMappingURL=chat-sidepanel.d.ts.map