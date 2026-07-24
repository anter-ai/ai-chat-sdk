"use client";

import React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";
import type { ComposerAnnouncement } from "../../headless/types/chat";

export interface ContextTagBarProps {
  tags?: string[];
  onRemove?: (index: number) => void;
  /** @deprecated unused — banners render via `ComposerBanner`, not `ContextTagBar`. */
  announcement?: ComposerAnnouncement | null;
  className?: string;
  /** @deprecated unused — banners render via `ComposerBanner`, not `ContextTagBar`. */
  layout?: "chip" | "banner";
}

export function ContextTagBar({ tags = [], onRemove, className }: ContextTagBarProps) {
  if (!tags.length) return null;

  return (
    <div className={cn("ais-context-tag-bar", className)}>
      {tags.map((tag, i) => (
        <span className="ais-context-tag" key={`${tag}-${i}`}>
          {tag}
          {onRemove && (
            <button
              className="ais-context-tag-remove"
              onClick={() => onRemove(i)}
              type="button"
              aria-label={`Remove ${tag}`}
            >
              <X size={12} />
            </button>
          )}
        </span>
      ))}
    </div>
  );
}
