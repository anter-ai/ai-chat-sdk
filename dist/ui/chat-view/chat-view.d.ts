import React from "react";
import { type UseArtifactsReturn } from "../../headless/hooks/use-artifacts";
import { type UseSourcesReturn } from "../../headless/hooks/use-sources";
import { type UseSessionFilesReturn } from "../../headless/hooks/use-session-files";
import type { SessionWithMessages } from "../../headless/types/session";
import type { ComposerAnnouncement } from "../../headless/types/chat";
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
}
export declare function ChatView({ onExportArtifact, onRecordClick, renderMessageFooter, recordPanel, className, style, initialSessionId, onSessionChange, emptyState, tips, hideMessageActions, }: ChatViewProps): import("react/jsx-runtime").JSX.Element;
export interface ChatViewContentProps extends ChatViewProps {
    artifactsCtx: UseArtifactsReturn;
    sourcesCtx: UseSourcesReturn;
    filesCtx: UseSessionFilesReturn;
    enableFileUpload: boolean;
}
//# sourceMappingURL=chat-view.d.ts.map