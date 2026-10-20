import React from "react";
import { type UseArtifactsReturn } from "../../headless/hooks/use-artifacts";
import { type UseSourcesReturn } from "../../headless/hooks/use-sources";
import { type UseSessionFilesReturn } from "../../headless/hooks/use-session-files";
import type { SessionWithMessages } from "../../headless/types/session";
import type { ComposerAnnouncement, MessageSource } from "../../headless/types/chat";
import type { RecordTag } from "../../headless/utils/record-utils";
export interface ChatViewProps {
    onExportArtifact?: (artifactId: string) => Promise<void>;
    onRecordClick?: (record: RecordTag) => void;
    renderMessageFooter?: (message: SessionWithMessages["messages"][number]) => React.ReactNode;
    recordPanel?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    initialSessionId?: string;
    onSessionChange?: (sessionId?: string) => void;
    emptyState?: React.ReactNode;
    tips?: ComposerAnnouncement[];
    hideMessageActions?: boolean;
    enableTools?: boolean;
    enableVoiceInput?: boolean;
    enableSendButton?: boolean;
    onSourceClick?: (source: MessageSource) => void;
    renderSourcePill?: (source: MessageSource, index: number) => React.ReactNode;
    renderCitationModal?: (source: MessageSource, onClose: () => void) => React.ReactNode;
}
export declare function ChatView({ onExportArtifact, onRecordClick, renderMessageFooter, recordPanel, className, style, initialSessionId, onSessionChange, emptyState, tips, hideMessageActions, enableTools, enableVoiceInput, enableSendButton, onSourceClick, renderSourcePill, renderCitationModal, }: ChatViewProps): React.JSX.Element;
export interface ChatViewContentProps extends ChatViewProps {
    artifactsCtx: UseArtifactsReturn;
    sourcesCtx: UseSourcesReturn;
    filesCtx: UseSessionFilesReturn;
    enableFileUpload: boolean;
}
//# sourceMappingURL=chat-view.d.ts.map