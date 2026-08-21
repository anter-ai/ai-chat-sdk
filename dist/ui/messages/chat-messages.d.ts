import React from "react";
import type { UseArtifactsReturn } from "../../headless/hooks/use-artifacts";
import type { UseSourcesReturn } from "../../headless/hooks/use-sources";
import type { ChatMessage as ChatMessageType } from "../../headless/types/chat";
import type { RecordTag } from "../../headless/utils/record-utils";
interface ChatMessagesProps {
    artifactsCtx: UseArtifactsReturn;
    sourcesCtx: UseSourcesReturn;
    onRecordClick?: (record: RecordTag) => void;
    renderMessageFooter?: (message: ChatMessageType) => React.ReactNode;
    /** Consumer-supplied empty state. Falls back to a minimal generic empty state. */
    emptyState?: React.ReactNode;
    /** Whether to hide the default message actions (e.g. copy, retry). */
    hideMessageActions?: boolean;
}
export declare function ChatMessages({ artifactsCtx, sourcesCtx, onRecordClick, renderMessageFooter, emptyState, hideMessageActions, }: ChatMessagesProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=chat-messages.d.ts.map