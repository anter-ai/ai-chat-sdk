"use client";

import React, { useEffect, useRef } from "react";
import { X, ExternalLink } from "lucide-react";

interface RecordPanelProps {
  subject: string;
  iframeSrc: string;
  externalHref?: string;
  onClose: () => void;
}

export function RecordPanel({ subject, iframeSrc, externalHref, onClose }: RecordPanelProps) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseRef.current();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <aside className="ais-record-panel" aria-label="Record panel" role="complementary">
      <header className="ais-rp-header">
        <span className="ais-rp-title">{subject.replace(/-/g, " ")}</span>
        <div className="ais-rp-actions">
          {externalHref && (
            <a
              href={externalHref}
              target="_blank"
              rel="noopener noreferrer"
              className="ais-rp-action-btn"
              aria-label="Open in new tab"
            >
              <ExternalLink size={14} />
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ais-rp-action-btn"
            aria-label="Close record panel"
          >
            <X size={16} />
          </button>
        </div>
      </header>
      <div className="ais-rp-body">
        <iframe
          key={iframeSrc}
          src={iframeSrc}
          className="ais-rp-iframe"
          title="Record viewer"
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      </div>
    </aside>
  );
}
