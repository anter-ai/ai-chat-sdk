"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Artifact } from "../../headless/types/artifact";
import { getArtifactRegistry } from "../../extensions/artifact-registry";

interface ArtifactPreviewProps {
  artifact: Artifact;
  /** Dispatch a follow-up user turn into the conversation (host action affordances). */
  onSendMessage?: (text: string) => void;
  /** True while a response is streaming — passed to custom renderers. */
  isStreaming?: boolean;
}

export function ArtifactPreview({ artifact, onSendMessage, isStreaming }: ArtifactPreviewProps) {
  const effectiveType = artifact.previewType ?? artifact.type;
  const effectiveContent = artifact.previewContent ?? artifact.content;

  const registry = getArtifactRegistry();
  const customRenderer = registry.get(effectiveType);

  if (customRenderer && customRenderer.detect(effectiveContent)) {
    return (
      <>
        {customRenderer.render(effectiveContent, {
          artifactId: artifact.artifactId,
          type: effectiveType,
          sendMessage: onSendMessage ?? (() => {}),
          isStreaming: isStreaming ?? false,
        })}
      </>
    );
  }

  if (effectiveType === "table") {
    return <TableRenderer content={effectiveContent} />;
  }

  if (effectiveType === "html") {
    return <div dangerouslySetInnerHTML={{ __html: effectiveContent }} />;
  }

  if (effectiveType === "code") {
    return <pre>{effectiveContent}</pre>;
  }

  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{effectiveContent}</ReactMarkdown>;
}

function TableRenderer({ content }: { content: string }) {
  const lines = content
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) =>
      line
        .split("|")
        .map((cell) => cell.trim())
        .filter(Boolean),
    );

  if (lines.length < 2) return <pre>{content}</pre>;

  const [header, , ...rows] = lines;

  return (
    <table className="ais-table-preview">
      <thead>
        <tr>
          {header?.map((cell) => (
            <th key={cell}>{cell}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={idx}>
            {row.map((cell, cellIdx) => (
              <td key={`${idx}-${cellIdx}`}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
