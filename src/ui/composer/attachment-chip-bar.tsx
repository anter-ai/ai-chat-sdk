"use client";

import React from "react";
import { X } from "lucide-react";
import type { ChatSessionFileRef } from "../../headless/types/adapter";
import { fileIcon, formatBytes } from "../shared/file-utils";

interface AttachmentChipBarProps {
  files: Array<ChatSessionFileRef | UploadingFile>;
  onRemove: (id: string) => void;
}

export interface UploadingFile {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  status: "uploading";
  downloadUrl: string;
}

function truncateName(name: string, max = 28): string {
  if (name.length <= max) return name;
  const ext = name.lastIndexOf(".");
  if (ext > 0) {
    const extStr = name.slice(ext);
    return `${name.slice(0, max - extStr.length - 1)}…${extStr}`;
  }
  return `${name.slice(0, max - 1)}…`;
}

export function AttachmentChipBar({ files, onRemove }: AttachmentChipBarProps) {
  if (!files.length) return null;

  return (
    <div className="ais-attachment-chip-bar" role="list" aria-label="Attached files">
      {files.map((f) => (
        <div
          key={f.id}
          className={`ais-attachment-chip${f.status === "uploading" ? " ais-attachment-chip--uploading" : ""}`}
          role="listitem"
        >
          <span className="ais-attachment-chip-icon" aria-hidden="true">
            {f.status === "uploading" ? (
              <span className="ais-attachment-chip-spinner" />
            ) : (
              fileIcon(f.mimeType, 13)
            )}
          </span>
          <span className="ais-attachment-chip-name" title={f.fileName}>
            {truncateName(f.fileName)}
          </span>
          <span className="ais-attachment-chip-size">{formatBytes(f.size)}</span>
          <button
            className="ais-attachment-chip-remove"
            onClick={() => onRemove(f.id)}
            type="button"
            aria-label={`Remove ${f.fileName}`}
            disabled={f.status === "uploading"}
          >
            <X size={11} />
          </button>
        </div>
      ))}
    </div>
  );
}
