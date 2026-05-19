"use client";

import React from "react";
import { Database, ExternalLink } from "lucide-react";
import type { RecordTag } from "../../headless/utils/record-utils";

function formatSubjectLabel(subject: string): string {
  return subject.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface RecordChipProps {
  record: RecordTag;
  onClick?: (record: RecordTag) => void;
}

export function RecordChip({ record, onClick }: RecordChipProps) {
  const label = formatSubjectLabel(record.subject);
  const count = record.ids.length;

  return (
    <button className="ais-record-chip" onClick={() => onClick?.(record)} type="button">
      <span className="ais-record-chip-icon">
        <Database size={14} />
      </span>
      <span className="ais-record-chip-body">
        <span className="ais-record-chip-title">{label}</span>
        <span className="ais-record-chip-hint">
          {count === 1 ? "View record" : `${count} records`}
        </span>
      </span>
      <span className="ais-record-chip-action">
        <ExternalLink size={12} />
      </span>
    </button>
  );
}
