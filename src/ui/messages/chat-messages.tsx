"use client";

import React, { useEffect } from "react";
import type { UseArtifactsReturn } from "../../headless/hooks/use-artifacts";
import type { UseSourcesReturn } from "../../headless/hooks/use-sources";
import { useChat } from "../../headless/hooks/use-chat";
import { useStickyBottom } from "../../headless/hooks/use-sticky-bottom";
import { ChatEmptyState } from "../empty-state/chat-empty-state";
import { ChatMessage } from "./chat-message";
import type { ChatMessage as ChatMessageType } from "../../headless/types/chat";
import type { RecordTag } from "../../headless/utils/record-utils";

interface ChatMessagesProps {
  artifactsCtx: UseArtifactsReturn;
  sourcesCtx: UseSourcesReturn;
  onRecordClick?: (record: RecordTag) => void;
  renderMessageFooter?: (message: ChatMessageType) => React.ReactNode;
  /** Consumer-supplied empty state. Falls back to a minimal generic empty state. */
  emptyState?: React.ReactNode;
}

export function ChatMessages({
  artifactsCtx,
  sourcesCtx,
  onRecordClick,
  renderMessageFooter,
  emptyState,
}: ChatMessagesProps) {
  const { messages, retryLastMessage, sendMessage, canResolveToolApprovals, resolveToolApproval } =
    useChat();
  const { anchorRef, isAtBottom, scrollToBottom } = useStickyBottom();

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom("auto");
    }
  }, [isAtBottom, messages.length, scrollToBottom]);

  if (messages.length === 0) {
    return (
      <div
        className="ais-messages ais-messages--empty"
        role="main"
        aria-label="Start a new conversation"
      >
        {emptyState ?? <ChatEmptyState onSendMessage={(msg) => void sendMessage(msg)} />}
      </div>
    );
  }

  return (
    <div className="ais-messages" role="log" aria-live="polite" aria-label="Conversation">
      <div className="ais-messages-blur-top" />
      <div className="ais-messages-inner">
        {messages.map((message, index) => {
          const isLastAssistant = index === messages.length - 1 && message.role === "assistant";
          return (
            <ChatMessage
              key={message.id}
              artifactsCtx={artifactsCtx}
              sourcesCtx={sourcesCtx}
              message={message}
              showSuggestions={isLastAssistant}
              onFollowUp={(value) => {
                void sendMessage(value);
              }}
              onRetry={() => {
                void retryLastMessage();
              }}
              onRecordClick={onRecordClick}
              renderMessageFooter={renderMessageFooter}
              canResolveToolApprovals={canResolveToolApprovals}
              onResolveToolApproval={resolveToolApproval}
            />
          );
        })}
        <div ref={anchorRef} />
      </div>
      <div className="ais-messages-blur-bottom" />
    </div>
  );
}
