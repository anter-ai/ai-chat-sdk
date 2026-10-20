import React from "react";
import type { UseArtifactsReturn } from "../../headless/hooks/use-artifacts";
import type { UseSourcesReturn } from "../../headless/hooks/use-sources";
import type { ChatMessage as ChatMessageType, MessageSource } from "../../headless/types/chat";
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
    /** Optional callback invoked when a citation marker or source pill is clicked. */
    onSourceClick?: (source: MessageSource) => void;
    /** Custom renderer for individual source pills below an assistant message. */
    renderSourcePill?: (source: MessageSource, index: number) => React.ReactNode;
    /** Custom modal/dialog renderer when viewing citation details. */
    renderCitationModal?: (source: MessageSource, onClose: () => void) => React.ReactNode;
}
export declare function ChatMessages({ artifactsCtx, sourcesCtx, onRecordClick, renderMessageFooter, emptyState, hideMessageActions, onSourceClick, renderSourcePill, renderCitationModal, }: ChatMessagesProps): React.JSX.Element;
export {};
//# sourceMappingURL=chat-messages.d.ts.map