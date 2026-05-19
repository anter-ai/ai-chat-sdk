"use client";

import React from "react";
import { FileText, CheckCircle2, ExternalLink } from "lucide-react";
import type { Artifact } from "../../headless/types/artifact";

interface ArtifactChipProps {
  artifact?: Artifact;
  isSaved: boolean;
  onClick: () => void;
}

export function ArtifactChip({ artifact, isSaved, onClick }: ArtifactChipProps) {
  if (!artifact) return null;

  return (
    <button
      className={`ais-artifact-chip ${isSaved ? "is-saved" : ""}`}
      onClick={onClick}
      type="button"
    >
      <span className="ais-artifact-chip-icon">
        {isSaved ? <CheckCircle2 size={14} /> : <FileText size={14} />}
      </span>
      <span className="ais-artifact-chip-body">
        <span className="ais-artifact-chip-title">{artifact.title}</span>
        <span className="ais-artifact-chip-hint">{isSaved ? "Saved to GRC" : "View document"}</span>
      </span>
      <span className="ais-artifact-chip-action">
        <ExternalLink size={12} />
      </span>
    </button>
  );
}
