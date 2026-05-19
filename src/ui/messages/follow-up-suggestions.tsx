"use client";

import React from "react";
import { CornerDownRight } from "lucide-react";

interface FollowUpSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export function FollowUpSuggestions({ suggestions, onSelect }: FollowUpSuggestionsProps) {
  if (!suggestions.length) return null;

  return (
    <div
      className="ais-follow-ups-container"
      role="group"
      aria-label="Suggested follow-up questions"
    >
      <h3 className="ais-follow-ups-title">Follow-ups</h3>
      <div className="ais-follow-ups-list">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            className="ais-follow-up-item"
            onClick={() => onSelect(suggestion)}
            type="button"
            title={suggestion}
          >
            <CornerDownRight size={15} className="ais-follow-up-item-icon" aria-hidden="true" />
            <span className="ais-follow-up-item-text">{suggestion}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
