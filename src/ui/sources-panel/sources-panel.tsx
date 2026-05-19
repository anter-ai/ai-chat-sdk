"use client";

import React, { useEffect, useRef } from "react";
import { X, FileText, Database, ExternalLink, Library, Search } from "lucide-react";
import type { UseSourcesReturn } from "../../headless/hooks/use-sources";
import type { MessageSource } from "../../headless/types/chat";

interface SourcesPanelProps {
  sourcesCtx: UseSourcesReturn;
  className?: string;
}

interface SourceCardProps {
  source: MessageSource;
  index: number;
  cardRef?: React.RefCallback<HTMLDivElement>;
}

function getSourceLabel(source: MessageSource) {
  if (source.url) {
    try {
      const url = new URL(source.url);
      const domain = url.hostname.replace(/^www\./, "");
      return domain;
    } catch {
      return "External Link";
    }
  }

  if (source.type === "database") return "Database Record";

  // Try to get extension from title
  const title = source.title || "";
  const lastDotIndex = title.lastIndexOf(".");
  if (lastDotIndex !== -1 && lastDotIndex > title.length - 6) {
    const ext = title.substring(lastDotIndex + 1).toUpperCase();
    if (["PDF", "DOCX", "TXT", "MD", "CSV", "XLSX"].includes(ext)) {
      return `${ext} Document`;
    }
  }

  return "Knowledge Base";
}

function SourceCard({ source, index, cardRef }: SourceCardProps) {
  const isDatabase = source.type === "database";
  const accentColor = isDatabase ? "#7C3AED" : "#2563EB";
  const label = getSourceLabel(source);

  const content = (
    <div
      ref={cardRef}
      className="ais-sp-card"
      style={{ "--sp-accent": accentColor } as React.CSSProperties}
      id={`ais-cite-card-${index + 1}`}
    >
      <div className="ais-sp-card-header">
        <div className="ais-sp-card-meta">
          <span className="ais-sp-card-icon">
            {isDatabase ? <Database size={12} /> : <FileText size={12} />}
          </span>
          <span className="ais-sp-card-label">{label}</span>
          {source.page != null && <span className="ais-sp-card-page">Page {source.page}</span>}
        </div>
        {source.url && <ExternalLink size={12} className="ais-sp-card-external" />}
      </div>

      <h4 className="ais-sp-card-title">{source.title}</h4>

      {source.snippet ? (
        <div className="ais-sp-card-body">{source.snippet}</div>
      ) : (
        !isDatabase && (
          <div className="ais-sp-card-body" style={{ opacity: 0.5, fontStyle: "italic" }}>
            No preview available
          </div>
        )
      )}

      {source.retrievalScore != null && (
        <div className="ais-sp-card-footer">
          <div className="ais-sp-card-relevance">
            <div className="ais-sp-card-relevance-bar-bg">
              <div
                className="ais-sp-card-relevance-bar-fill"
                style={{ width: `${Math.round(source.retrievalScore * 100)}%` }}
              />
            </div>
            <span>{Math.round(source.retrievalScore * 100)}% relevance</span>
          </div>
        </div>
      )}
    </div>
  );

  if (source.url) {
    return (
      <a href={source.url} target="_blank" rel="noopener noreferrer" className="ais-sp-card-anchor">
        {content}
      </a>
    );
  }

  return content;
}

export function SourcesPanel({ sourcesCtx, className }: SourcesPanelProps) {
  const { activeSources, panelState, closeSources } = sourcesCtx;
  const panelRef = useRef<HTMLElement>(null);

  // Keyboard: close on Escape
  useEffect(() => {
    if (!panelState.isOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeSources();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [panelState.isOpen, closeSources]);

  // Focus trap: move focus into panel when it opens
  useEffect(() => {
    if (panelState.isOpen) {
      panelRef.current?.focus();
    }
  }, [panelState.isOpen]);

  const cardRefMap = useRef<Map<number, HTMLDivElement>>(new Map());

  const setCardRef = React.useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      if (el) {
        cardRefMap.current.set(index, el);
      } else {
        cardRefMap.current.delete(index);
      }
    },
    [],
  );

  // Scroll to the requested card when scrollToIndex changes
  useEffect(() => {
    if (!panelState.isOpen || panelState.scrollToIndex == null) return;
    const el = cardRefMap.current.get(panelState.scrollToIndex);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [panelState.isOpen, panelState.scrollToIndex]);

  if (!panelState.isOpen) return null;

  return (
    <aside
      ref={panelRef}
      className={`ais-sources-panel ais-animate-sources-panel-in ${className ?? ""}`}
      role="complementary"
      aria-label="Sources panel"
      tabIndex={-1}
    >
      <header className="ais-sp-header">
        <h3 className="ais-sp-title">Sources</h3>
        <button
          aria-label="Close sources panel"
          className="ais-sp-close"
          onClick={closeSources}
          type="button"
        >
          <X size={20} />
        </button>
      </header>

      <div className="ais-sp-body">
        {activeSources.length === 0 ? (
          <div className="ais-sp-empty">
            <Search size={24} style={{ marginBottom: 12, opacity: 0.2 }} />
            <p>No cited sources found for this message.</p>
          </div>
        ) : (
          <div className="ais-sp-cards">
            {activeSources.map((source, i) => (
              <SourceCard key={source.id} source={source} index={i} cardRef={setCardRef(i)} />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
