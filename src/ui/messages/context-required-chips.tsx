"use client";

import React from "react";
import type { ContextRequiredPayload } from "../../headless/types/chat";

interface ContextRequiredChipsProps {
  contextRequired: ContextRequiredPayload;
  onSelect: (label: string) => void;
}

export function ContextRequiredChips({ contextRequired, onSelect }: ContextRequiredChipsProps) {
  return (
    <div className="ais-context-required-chips" role="group" aria-label="Select an option">
      {contextRequired.choices.map((choice) => (
        <button
          key={choice.value}
          type="button"
          className="ais-context-required-chip"
          onClick={() => onSelect(choice.label)}
        >
          {choice.label}
        </button>
      ))}
    </div>
  );
}
