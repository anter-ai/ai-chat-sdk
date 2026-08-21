import React from "react";
import type { UseArtifactsReturn } from "../../headless/hooks/use-artifacts";
import type { UseSourcesReturn } from "../../headless/hooks/use-sources";
import type { ChatMessage as ChatMessageType, ToolApproval } from "../../headless/types/chat";
import type { RecordTag } from "../../headless/utils/record-utils";
interface ChatMessageProps {
    message: ChatMessageType;
    onRetry: () => void;
    onRetryMessage?: (messageId: string) => void;
    onFollowUp: (value: string) => void;
    artifactsCtx: UseArtifactsReturn;
    sourcesCtx: UseSourcesReturn;
    onRecordClick?: (record: RecordTag) => void;
    renderMessageFooter?: (message: ChatMessageType) => React.ReactNode;
    showSuggestions?: boolean;
    isPinned?: boolean;
    hideMessageActions?: boolean;
    /** True when the adapter implements resolveToolApproval (cards become actionable). */
    canResolveToolApprovals?: boolean;
    onResolveToolApproval?: (approval: ToolApproval, decision: "approved" | "denied", reason?: string) => void | Promise<void>;
}
export declare function ChatMessage({ message, onRetry, onRetryMessage, onFollowUp, artifactsCtx, sourcesCtx, onRecordClick, renderMessageFooter, showSuggestions, isPinned, hideMessageActions, canResolveToolApprovals, onResolveToolApproval, }: ChatMessageProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=chat-message.d.ts.map