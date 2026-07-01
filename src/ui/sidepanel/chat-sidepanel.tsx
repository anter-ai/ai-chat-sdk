"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ExternalLink,
  Sparkles,
  X,
  Plus,
  Paperclip,
  MoreVertical,
  MessageSquare,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
import { useConversationHistory } from "../../headless/hooks/use-conversation-history";

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
  brand,
  brandIcon,
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
  const { adapter, config, orgLabel } = useChatContext();
  const {
    sendMessage,
    stopStreaming,
    isStreaming,
    currentSessionId,
    clearMessages,
    messages,
    resumeState,
    resumeRun,
    loadSession,
  } = useChat();

  const { sessions, isLoading: historyLoading, refresh: refreshHistory } = useConversationHistory();
  const [recentsMenuOpen, setRecentsMenuOpen] = useState(false);
  const [recentsView, setRecentsView] = useState<"main" | "more">("main");
  const recentsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!recentsMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (recentsMenuRef.current && !recentsMenuRef.current.contains(e.target as Node)) {
        setRecentsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [recentsMenuOpen]);

  const handleToggleRecents = () => {
    if (!recentsMenuOpen) {
      void refreshHistory();
      setRecentsView("main");
    }
    setRecentsMenuOpen((prev) => !prev);
  };

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

  const sidepanelTitle = title ?? orgLabel ?? "";

  return (
    <div className={`ais-sidepanel-root ${className}`}>
      <header className="ais-sidepanel-header">
        {brand ? (
          brand
        ) : (
          <div className="ais-sidepanel-brand">
            {brandIcon ? (
              brandIcon
            ) : (
              <span aria-hidden="true" className="ais-sidepanel-brand-badge">
                <Sparkles size={13} />
              </span>
            )}
            <div className="ais-sidepanel-brand-text">
              <strong className="ais-sidepanel-title">{sidepanelTitle}</strong>
              {subtitle && <span className="ais-sidepanel-subtitle">{subtitle}</span>}
            </div>
          </div>
        )}
        <div className="ais-sidepanel-header-actions">
          <div className="ais-sidepanel-recents-menu-wrapper" ref={recentsMenuRef}>
            <button
              aria-label="Recent chats"
              title="Recent chats"
              onClick={handleToggleRecents}
              type="button"
              className={recentsMenuOpen ? "is-active" : ""}
            >
              <MoreVertical size={14} />
            </button>

            {recentsMenuOpen && (
              <div className="ais-sidepanel-recents-dropdown">
                {recentsView === "main" ? (
                  <>
                    <div className="ais-sidepanel-recents-dropdown-header">Recent Chats</div>
                    <div className="ais-sidepanel-recents-dropdown-list">
                      {historyLoading && (
                        <div className="ais-sidepanel-recents-dropdown-loading">Loading...</div>
                      )}
                      {!historyLoading && sessions.length === 0 && (
                        <div className="ais-sidepanel-recents-dropdown-empty">No recent chats</div>
                      )}
                      {!historyLoading &&
                        sessions.slice(0, 5).map((session) => (
                          <button
                            key={session.sessionId}
                            className={`ais-sidepanel-recents-dropdown-item ${
                              session.sessionId === currentSessionId ? "is-active" : ""
                            }`}
                            onClick={async () => {
                              setRecentsMenuOpen(false);
                              try {
                                const full = await adapter.loadSession(session.sessionId);
                                loadSession(full);
                              } catch (err) {
                                console.error("Failed to load session:", err);
                              }
                            }}
                            type="button"
                          >
                            <MessageSquare size={13} className="ais-sidepanel-recents-item-icon" />
                            <span className="ais-sidepanel-recents-dropdown-item-title">
                              {session.title}
                            </span>
                          </button>
                        ))}
                      {!historyLoading && sessions.length > 5 && (
                        <button
                          className="ais-sidepanel-recents-dropdown-item is-more"
                          onClick={() => setRecentsView("more")}
                          type="button"
                        >
                          <MoreHorizontal size={13} className="ais-sidepanel-recents-item-icon" />
                          <span className="ais-sidepanel-recents-dropdown-item-title">More</span>
                          <ChevronRight size={13} className="ais-sidepanel-recents-item-arrow" />
                        </button>
                      )}
                    </div>
                    {fullChatHref && onNavigate && (
                      <>
                        <div className="ais-sidepanel-recents-dropdown-divider" />
                        <button
                          className="ais-sidepanel-recents-dropdown-item is-action"
                          onClick={() => {
                            setRecentsMenuOpen(false);
                            onNavigate(fullChatHref);
                          }}
                          type="button"
                        >
                          <ExternalLink size={13} className="ais-sidepanel-recents-item-icon" />
                          <span className="ais-sidepanel-recents-dropdown-item-title">
                            Continue Chat in New Tab
                          </span>
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      className="ais-sidepanel-recents-dropdown-back-btn"
                      onClick={() => setRecentsView("main")}
                      type="button"
                    >
                      <ChevronLeft size={14} />
                      <span>Back</span>
                    </button>
                    <div className="ais-sidepanel-recents-dropdown-list">
                      {sessions.slice(5).map((session) => (
                        <button
                          key={session.sessionId}
                          className={`ais-sidepanel-recents-dropdown-item ${
                            session.sessionId === currentSessionId ? "is-active" : ""
                          }`}
                          onClick={async () => {
                            setRecentsMenuOpen(false);
                            try {
                              const full = await adapter.loadSession(session.sessionId);
                              loadSession(full);
                            } catch (err) {
                              console.error("Failed to load session:", err);
                            }
                          }}
                          type="button"
                        >
                          <MessageSquare size={13} className="ais-sidepanel-recents-item-icon" />
                          <span className="ais-sidepanel-recents-dropdown-item-title">
                            {session.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
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

      {/* The body and composer share one flex column so the empty-state
          centering (`.ais-sidepanel-main:has(.ais-messages--empty)`) can group
          the greeting and composer together, while the header stays pinned
          above as a sibling — mirroring the full ChatShell layout. When a drawer
          (sources/files/artifacts) is open it overlays the body, so the body
          must fill the area; `ais-has-drawer` disables the empty-state collapse
          that would otherwise shrink the overlay to a small floating box. */}
      <div className={`ais-sidepanel-main ${isAnyPanelOpen ? "ais-has-drawer" : ""}`}>
        <div className="ais-sidepanel-body">
          <ChatMessages
            artifactsCtx={artifactsCtx}
            sourcesCtx={sourcesCtx}
            emptyState={emptyState}
          />
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
    </div>
  );
}
