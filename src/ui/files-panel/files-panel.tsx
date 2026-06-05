"use client";

import React, { useEffect } from "react";
import { Download, Trash2, X } from "lucide-react";
import type { UseSessionFilesReturn } from "../../headless/hooks/use-session-files";
import type { ChatSessionFileRef } from "../../headless/types/adapter";
import { fileIcon, formatBytes } from "../shared/file-utils";

interface FilesPanelProps {
  filesCtx: UseSessionFilesReturn;
  className?: string;
}

function StatusBadge({ status }: { status: ChatSessionFileRef["status"] }) {
  if (status === "uploaded") return null;
  const label = status === "processed" ? "analyzed" : "error";
  return <span className={`ais-fp-file-badge ais-fp-file-badge--${status}`}>{label}</span>;
}

function FileRow({
  file,
  onDelete,
  onDownload,
}: {
  file: ChatSessionFileRef;
  onDelete: (id: string) => void;
  onDownload: (file: ChatSessionFileRef) => void;
}) {
  return (
    <div className="ais-fp-file-row">
      <span className="ais-fp-file-icon" aria-hidden="true">
        {fileIcon(file.mimeType, 15)}
      </span>
      <div className="ais-fp-file-info">
        <span className="ais-fp-file-name" title={file.fileName}>
          {file.fileName}
        </span>
        <div className="ais-fp-file-meta">
          <span className="ais-fp-file-size">{formatBytes(file.size)}</span>
          <StatusBadge status={file.status} />
        </div>
      </div>
      <div className="ais-fp-file-actions">
        <button
          className="ais-fp-file-action-btn"
          onClick={() => onDownload(file)}
          type="button"
          title="Download"
          aria-label={`Download ${file.fileName}`}
        >
          <Download size={14} />
        </button>
        <button
          className="ais-fp-file-action-btn ais-fp-file-action-btn--danger"
          onClick={() => onDelete(file.id)}
          type="button"
          title="Remove"
          aria-label={`Remove ${file.fileName}`}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export function FilesPanel({ filesCtx, className }: FilesPanelProps) {
  const { files, isLoading, panelOpen, closePanel, deleteFile, downloadFile } = filesCtx;

  useEffect(() => {
    if (!panelOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closePanel();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [panelOpen, closePanel]);

  if (!panelOpen) return null;

  return (
    <aside
      className={`ais-files-panel ais-animate-sources-panel-in ${className ?? ""}`}
      role="complementary"
      aria-label="Session files"
      tabIndex={-1}
    >
      <header className="ais-sp-header">
        <h3 className="ais-sp-title">
          Files
          {files.length > 0 && <span className="ais-fp-count">{files.length}</span>}
        </h3>
        <button
          aria-label="Close files panel"
          className="ais-sp-close"
          onClick={closePanel}
          type="button"
        >
          <X size={20} />
        </button>
      </header>

      <div className="ais-sp-body">
        {isLoading ? (
          <div className="ais-sp-empty">
            <div className="ais-fp-loading-row" />
            <div className="ais-fp-loading-row" style={{ width: "70%" }} />
            <div className="ais-fp-loading-row" style={{ width: "85%" }} />
          </div>
        ) : files.length === 0 ? (
          <div className="ais-sp-empty">
            <p>No files attached to this session.</p>
            <p style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>
              Use the + button in the composer to upload files.
            </p>
          </div>
        ) : (
          <div className="ais-fp-file-list">
            {files.map((f) => (
              <FileRow key={f.id} file={f} onDelete={deleteFile} onDownload={downloadFile} />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
