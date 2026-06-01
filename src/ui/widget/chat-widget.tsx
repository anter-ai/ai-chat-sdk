"use client";

import React, { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { ExternalLink, MessageCircle, Sparkles, X, Plus, Paperclip } from "lucide-react";
import { ChatStateProvider, useChat } from "../../headless/hooks/use-chat";
import { useChatContext } from "../../headless/context/chat-provider";
import { ChatComposer } from "../composer/chat-composer";
import { ChatMessages } from "../messages/chat-messages";
import { useArtifacts } from "../../headless/hooks/use-artifacts";
import { useSources } from "../../headless/hooks/use-sources";
import { useSessionFiles } from "../../headless/hooks/use-session-files";
import { SourcesPanel } from "../sources-panel/sources-panel";
import { FilesPanel } from "../files-panel/files-panel";
import { ArtifactPanel } from "../artifact-panel/artifact-panel";

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
}

export function ChatWidget({
  position = "bottom-right",
  initialOpen = false,
  fullChatUrl,
  onNavigate,
  onExportArtifact,
  title,
  subtitle,
  emptyState,
}: ChatWidgetProps) {
  return (
    <ChatStateProvider>
      <ChatWidgetContent
        position={position}
        initialOpen={initialOpen}
        fullChatUrl={fullChatUrl}
        onNavigate={onNavigate}
        onExportArtifact={onExportArtifact}
        title={title}
        subtitle={subtitle}
        emptyState={emptyState}
      />
    </ChatStateProvider>
  );
}

function ChatWidgetContent({
  position = "bottom-right",
  initialOpen = false,
  fullChatUrl,
  onNavigate,
  onExportArtifact,
  title,
  subtitle,
  emptyState,
}: ChatWidgetProps) {
  const [open, setOpen] = useState(initialOpen);
  const { config, orgLabel } = useChatContext();
  const { sendMessage, isStreaming, currentSessionId, clearMessages, messages } = useChat();
  const artifactsCtx = useArtifacts();
  const sourcesCtx = useSources();
  const filesCtx = useSessionFiles();

  const hasMessages = messages.length > 0;
  const showSourcesPanel = sourcesCtx.panelState.isOpen;
  const showFilesPanel = config.enableFileUpload && filesCtx.panelOpen && !showSourcesPanel;
  const showArtifactPanel =
    config.enableArtifacts &&
    artifactsCtx.panelState.isOpen &&
    !showSourcesPanel &&
    !showFilesPanel;
  const isAnyPanelOpen = showSourcesPanel || showFilesPanel || showArtifactPanel;

  const widgetTitle = title ?? orgLabel ?? "AI Assistant";

  return (
    <div className={`ais-widget-root ${position}`}>
      <Popover.Root onOpenChange={setOpen} open={open}>
        <Popover.Trigger asChild>
          <button
            aria-label={open ? "Close AI widget" : "Open AI widget"}
            className="ais-widget-trigger"
            type="button"
          >
            <span aria-hidden="true" className="ais-widget-trigger-orbit" />
            <span className="ais-widget-trigger-icon-wrap">
              <MessageCircle size={19} />
            </span>
            <span aria-hidden="true" className="ais-widget-trigger-ping" />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className="ais-widget-popover"
            data-chat-provider="ai-chat-sdk"
            data-theme={config.theme}
            sideOffset={10}
          >
            <header className="ais-widget-header">
              <div className="ais-widget-brand">
                <span aria-hidden="true" className="ais-widget-brand-badge">
                  <Sparkles size={13} />
                </span>
                <div className="ais-widget-brand-text">
                  <strong className="ais-widget-title">{widgetTitle}</strong>
                  {subtitle && <span className="ais-widget-subtitle">{subtitle}</span>}
                </div>
              </div>
              <div className="ais-widget-header-actions">
                {config.enableFileUpload && (
                  <button
                    aria-label={filesCtx.panelOpen ? "Close files" : "Open files"}
                    title="Session files"
                    onClick={() =>
                      filesCtx.panelOpen ? filesCtx.closePanel() : filesCtx.openPanel()
                    }
                    type="button"
                    className={filesCtx.panelOpen ? "is-active" : ""}
                  >
                    <Paperclip size={14} />
                    {filesCtx.files.length > 0 && (
                      <span className="ais-widget-header-badge">{filesCtx.files.length}</span>
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
                <button
                  aria-label="Open full chat"
                  title="Open full chat"
                  onClick={() => onNavigate(fullChatUrl(currentSessionId ?? null))}
                  type="button"
                >
                  <ExternalLink size={14} />
                </button>
                <button
                  aria-label="Close chat widget"
                  title="Close chat widget"
                  onClick={() => setOpen(false)}
                  type="button"
                >
                  <X size={14} />
                </button>
              </div>
            </header>
            <div className="ais-widget-body">
              <ChatMessages
                artifactsCtx={artifactsCtx}
                sourcesCtx={sourcesCtx}
                emptyState={emptyState}
              />
              {isAnyPanelOpen && (
                <div className="ais-widget-drawer">
                  {showSourcesPanel && <SourcesPanel sourcesCtx={sourcesCtx} />}
                  {showFilesPanel && <FilesPanel filesCtx={filesCtx} />}
                  {showArtifactPanel && (
                    <ArtifactPanel
                      artifactsCtx={artifactsCtx}
                      onExportArtifact={onExportArtifact}
                    />
                  )}
                </div>
              )}
            </div>
            <ChatComposer
              isStreaming={isStreaming}
              onSendMessage={(message, attachedFileIds, sessionId, extraContextVariables) => {
                void sendMessage(message, attachedFileIds, sessionId, extraContextVariables);
              }}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
