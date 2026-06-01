"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { UseArtifactsReturn } from "../../headless/hooks/use-artifacts";
import type { UseSourcesReturn } from "../../headless/hooks/use-sources";
import { useChatContext } from "../../headless/context/chat-provider";
import type { ChatMessage as ChatMessageType } from "../../headless/types/chat";
import { ArtifactChip } from "./artifact-chip";
import { RecordChip } from "./record-chip";
import { FollowUpSuggestions } from "./follow-up-suggestions";
import { ContextRequiredChips } from "./context-required-chips";
import { ReasoningBlock } from "./reasoning-block";
import { extractArtifactsFromContent } from "../../headless/utils/artifact-utils";
import { extractSuggestionsFromContent } from "../../headless/utils/suggestion-utils";
import type { RecordTag } from "../../headless/utils/record-utils";

// Remark plugin: converts [N] citation markers inside text into span nodes
// that react-markdown renders as clickable <sup> elements.
function remarkInlineCitations() {
  return function transformer(tree: any) {
    function walk(node: any) {
      if (node.type === "code" || node.type === "inlineCode") return;
      if (!Array.isArray(node.children)) return;

      const newChildren: any[] = [];
      for (const child of node.children) {
        if (child.type === "code" || child.type === "inlineCode") {
          newChildren.push(child);
          continue;
        }
        if (child.type !== "text") {
          walk(child);
          newChildren.push(child);
          continue;
        }

        const parts: string[] = child.value.split(/(\[\d+\])/);
        if (parts.length === 1) {
          newChildren.push(child);
          continue;
        }

        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          if (!part) continue;
          if (i % 2 === 0) {
            newChildren.push({ type: "text", value: part });
          } else {
            const n = part.slice(1, -1);
            newChildren.push({
              type: "citeRef",
              data: {
                hName: "span",
                hProperties: { className: `ais-cite-ref-${n}` },
              },
              children: [{ type: "text", value: n }],
            });
          }
        }
      }
      node.children = newChildren;
    }
    walk(tree);
  };
}

const REMARK_PLUGINS = [remarkGfm, remarkInlineCitations];

interface ChatMessageProps {
  message: ChatMessageType;
  onRetry: () => void;
  onFollowUp: (value: string) => void;
  artifactsCtx: UseArtifactsReturn;
  sourcesCtx: UseSourcesReturn;
  onRecordClick?: (record: RecordTag) => void;
  showSuggestions?: boolean;
}

export function ChatMessage({
  message,
  onRetry,
  onFollowUp,
  artifactsCtx,
  sourcesCtx,
  onRecordClick,
  showSuggestions,
}: ChatMessageProps) {
  const { config } = useChatContext();
  const enableArtifacts = config?.enableArtifacts ?? true;

  const { cleanedContent, extractedArtifacts } = React.useMemo(() => {
    if (message.role !== "assistant" || !message.content) {
      return { cleanedContent: message.content, extractedArtifacts: [] };
    }
    if (!enableArtifacts) {
      const { cleanedContent: afterSuggestions } = extractSuggestionsFromContent(message.content);
      return {
        cleanedContent: afterSuggestions,
        extractedArtifacts: [],
      };
    }
    const result = extractArtifactsFromContent(message.content, message.id);
    // Strip any <suggestions> tags that slipped into the content string.
    const { cleanedContent: afterSuggestions } = extractSuggestionsFromContent(
      result.cleanedContent,
    );
    return {
      cleanedContent: afterSuggestions,
      extractedArtifacts: result.artifacts,
    };
  }, [message.content, message.role, message.id, enableArtifacts]);

  const { registerArtifacts } = artifactsCtx;

  React.useEffect(() => {
    if (enableArtifacts && extractedArtifacts.length > 0) {
      registerArtifacts(extractedArtifacts);
    }
  }, [extractedArtifacts, registerArtifacts, enableArtifacts]);

  const handleCiteClick = React.useCallback(
    (scrollToIndex?: number) => {
      if (message.sources?.length) {
        sourcesCtx.openSources(message.id, message.sources, scrollToIndex);
      }
    },
    [message.id, message.sources, sourcesCtx],
  );

  // Build the components map inside the component so handleCiteClick is in scope.
  const markdownComponents = React.useMemo(
    () => ({
      span({ node, children, className, ...props }: any) {
        const cls: string = className ?? "";
        if (/^ais-cite-ref-\d+$/.test(cls)) {
          const n = parseInt(cls.replace("ais-cite-ref-", ""), 10);
          return (
            <button
              type="button"
              className="ais-cite-marker"
              aria-label={`View source ${n}`}
              onClick={() => handleCiteClick(n - 1)}
            >
              <sup>{n}</sup>
            </button>
          );
        }
        return (
          <span className={className} {...props}>
            {children}
          </span>
        );
      },
    }),
    [handleCiteClick],
  );

  if (message.role === "command") {
    return (
      <div className="ais-command-pill-row">
        <span
          className="ais-command-pill"
          role="status"
          aria-label={`Slash command: ${message.content}`}
          data-testid={`command-message-${message.id}`}
        >
          <span aria-hidden="true">/</span>
          {message.content.replace("/", "")}
        </span>
      </div>
    );
  }

  const isUser = message.role === "user";
  const allArtifactIds = Array.from(
    new Set([...(message.artifactIds ?? []), ...extractedArtifacts.map((a) => a.artifactId)]),
  );
  const hasSources = !isUser && !message.isStreaming && (message.sources?.length ?? 0) > 0;

  return (
    <div className={`ais-message-row ${isUser ? "ais-user" : "ais-assistant"}`}>
      <div className="ais-message-bubble">
        {!isUser ? (
          <ReasoningBlock
            elapsedMs={message.elapsedMs}
            isStreaming={Boolean(message.isStreaming)}
            plan={message.plan}
            steps={message.steps ?? []}
          />
        ) : null}
        {cleanedContent || message.isStreaming ? (
          <div className="ais-message-content">
            <ReactMarkdown remarkPlugins={REMARK_PLUGINS} components={markdownComponents}>
              {cleanedContent}
            </ReactMarkdown>
          </div>
        ) : null}
        {message.error ? <p className="ais-message-error">{message.error}</p> : null}
        {!isUser && !message.isStreaming && message.error ? (
          <button type="button" onClick={onRetry}>
            Retry
          </button>
        ) : null}
        {!isUser && !message.isStreaming && enableArtifacts && allArtifactIds.length
          ? allArtifactIds.map((id) => {
              const artifact =
                artifactsCtx.artifacts.get(id) ||
                extractedArtifacts.find((a) => a.artifactId === id);
              return (
                <ArtifactChip
                  key={id}
                  artifact={artifact}
                  isSaved={Boolean(artifact?.savedRecord)}
                  onClick={() => artifactsCtx.openArtifact(id)}
                />
              );
            })
          : null}
        {!isUser && !message.isStreaming && message.records?.length
          ? message.records.map((record, i) => (
              <RecordChip key={i} record={record} onClick={onRecordClick} />
            ))
          : null}
        {hasSources ? (
          <button
            type="button"
            className="ais-sources-pill"
            aria-label={`View ${message.sources!.length} sources`}
            onClick={() => handleCiteClick(undefined)}
          >
            🔗 {message.sources!.length} {message.sources!.length === 1 ? "Source" : "Sources"}
          </button>
        ) : null}
        {!isUser && !message.isStreaming && message.contextRequired ? (
          <ContextRequiredChips contextRequired={message.contextRequired} onSelect={onFollowUp} />
        ) : null}
        {!isUser && !message.isStreaming && showSuggestions && message.suggestions?.length ? (
          <FollowUpSuggestions onSelect={onFollowUp} suggestions={message.suggestions} />
        ) : null}
      </div>
    </div>
  );
}
