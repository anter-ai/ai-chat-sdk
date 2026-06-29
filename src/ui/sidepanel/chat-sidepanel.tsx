"use client";

import React from "react";
import { ExternalLink, Sparkles, X, Plus, Paperclip } from "lucide-react";
import { ChatStateProvider, useChat } from "../../headless/hooks/use-chat";
import { useChatContext } from "../../headless/context/chat-provider";
import { ChatComposer } from "../composer/chat-composer";
import { ChatMessages } from "../messages/chat-messages";
import { useArtifacts, type UseArtifactsReturn } from "../../headless/hooks/use-artifacts";
import { useSources, type UseSourcesReturn } from "../../headless/hooks/use-sources";
import {
  useSessionFiles,
  type UseSessionFilesReturn,
} from "../../headless/hooks/use-session-files";
import { SourcesPanel } from "../sources-panel/sources-panel";
import { FilesPanel } from "../files-panel/files-panel";
import { ArtifactPanel } from "../artifact-panel/artifact-panel";

export interface ChatSidepanelProps {
  /** Optional custom title in the side panel header. Defaults to orgLabel or "AI Assistant". */
  title?: string;
  /** Optional subtitle displayed under the main title. */
  subtitle?: string;
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

function resolveFullChatUrl(
  fullChatUrl?: (sessionId: string | null) => string,
  sessionId?: string | null,
): string | null {
  if (!fullChatUrl) return null;
  const url = fullChatUrl(sessionId ?? null).trim();
  if (!url || url === "#") {
    return null;
  }
  return url;
}

export function ChatSidepanel(props: ChatSidepanelProps) {
  const artifactsCtx = useArtifacts();
  const sourcesCtx = useSources();
  const filesCtx = useSessionFiles();

  return (
    <ChatStateProvider onArtifactsReady={artifactsCtx.registerArtifacts}>
      <ChatSidepanelContent
        artifactsCtx={artifactsCtx}
        sourcesCtx={sourcesCtx}
        filesCtx={filesCtx}
        {...props}
      />
    </ChatStateProvider>
  );
}

interface ChatSidepanelContentProps extends ChatSidepanelProps {
  artifactsCtx: UseArtifactsReturn;
  sourcesCtx: UseSourcesReturn;
  filesCtx: UseSessionFilesReturn;
}

function ChatSidepanelContent({
  title,
  subtitle,
  onClose,
  fullChatUrl,
  onNavigate,
  onExportArtifact,
  emptyState,
  className = "",
  artifactsCtx,
  sourcesCtx,
  filesCtx,
}: ChatSidepanelContentProps) {
  const { config, orgLabel } = useChatContext();
  const {
    sendMessage,
    stopStreaming,
    isStreaming,
    currentSessionId,
    clearMessages,
    messages,
    resumeState,
    resumeRun,
  } = useChat();

  const hasMessages = messages.length > 0;
  const fullChatHref = resolveFullChatUrl(fullChatUrl, currentSessionId);
  const showSourcesPanel = sourcesCtx.panelState.isOpen;
  const showFilesPanel = config.enableFileUpload && filesCtx.panelOpen && !showSourcesPanel;
  const showArtifactPanel =
    config.enableArtifacts &&
    artifactsCtx.panelState.isOpen &&
    !showSourcesPanel &&
    !showFilesPanel;
  const isAnyPanelOpen = showSourcesPanel || showFilesPanel || showArtifactPanel;

  const sidepanelTitle = title ?? orgLabel ?? "AI Assistant";

  return (
    <div className={`ais-sidepanel-root ${className}`}>
      <header className="ais-sidepanel-header">
        <div className="ais-sidepanel-brand">
          <span aria-hidden="true" className="ais-sidepanel-brand-badge">
            <Sparkles size={13} />
          </span>
          <div className="ais-sidepanel-brand-text">
            <strong className="ais-sidepanel-title">{sidepanelTitle}</strong>
            {subtitle && <span className="ais-sidepanel-subtitle">{subtitle}</span>}
          </div>
        </div>
        <div className="ais-sidepanel-header-actions">
          {config.enableFileUpload && (
            <button
              aria-label={filesCtx.panelOpen ? "Close files" : "Open files"}
              title="Session files"
              onClick={() => (filesCtx.panelOpen ? filesCtx.closePanel() : filesCtx.openPanel())}
              type="button"
              className={filesCtx.panelOpen ? "is-active" : ""}
            >
              <Paperclip size={14} />
              {filesCtx.files.length > 0 && (
                <span className="ais-sidepanel-header-badge">{filesCtx.files.length}</span>
              )}
            </button>
          )}
          <button
            aria-label="New chat"
            title="New chat"
            onClick={clearMessages}
            type="button"
            disabled={!hasMessages}
            className={!hasMessages ? "is-disabled" : ""}
          >
            <Plus size={14} />
          </button>
          {fullChatHref && onNavigate && (
            <button
              aria-label="Open full chat"
              title="Open full chat"
              onClick={() => onNavigate(fullChatHref)}
              type="button"
            >
              <ExternalLink size={14} />
            </button>
          )}
          {onClose && (
            <button
              aria-label="Close side panel"
              title="Close side panel"
              onClick={onClose}
              type="button"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </header>

      <div className="ais-sidepanel-body">
        <ChatMessages artifactsCtx={artifactsCtx} sourcesCtx={sourcesCtx} emptyState={emptyState} />
        {isAnyPanelOpen && (
          <div className="ais-sidepanel-drawer">
            {showSourcesPanel && <SourcesPanel sourcesCtx={sourcesCtx} />}
            {showFilesPanel && <FilesPanel filesCtx={filesCtx} />}
            {showArtifactPanel && (
              <ArtifactPanel
                artifactsCtx={artifactsCtx}
                onExportArtifact={onExportArtifact}
                onSendMessage={(text) => void sendMessage(text)}
                isStreaming={isStreaming}
              />
            )}
          </div>
        )}
      </div>

      <ChatComposer
        isStreaming={isStreaming}
        onStop={stopStreaming}
        resumeState={resumeState}
        onResume={() => void resumeRun()}
        onSendMessage={(message, attachedFileIds, sessionId, extraContextVariables) => {
          void sendMessage(message, attachedFileIds, sessionId, extraContextVariables);
        }}
      />
    </div>
  );
}
