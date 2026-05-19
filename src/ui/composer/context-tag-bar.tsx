"use client";

import React from "react";
import * as Lucide from "lucide-react";
import { cn } from "../../lib/cn";
import type { ComposerAnnouncement } from "../../headless/types/chat";

export interface ContextTagBarProps {
  tags?: string[];
  onRemove?: (index: number) => void;
  announcement?: ComposerAnnouncement | null;
  className?: string;
  layout?: "chip" | "banner";
}

const resolveAnnouncementIcon = (type: string, iconName?: string) => {
  if (iconName) {
    const IconComp = (Lucide as any)[iconName];
    if (IconComp) {
      return <IconComp size={15} className="ais-composer-banner-icon-svg" />;
    }
  }
  switch (type) {
    case "warning":
      return <Lucide.AlertTriangle size={15} className="ais-composer-banner-icon-svg" />;
    case "success":
      return <Lucide.CheckCircle size={15} className="ais-composer-banner-icon-svg" />;
    case "info":
      return <Lucide.Info size={15} className="ais-composer-banner-icon-svg" />;
    default:
      return <Lucide.Volume2 size={15} className="ais-composer-banner-icon-svg" />;
  }
};

export function ContextTagBar({
  tags = [],
  onRemove,
  announcement,
  className,
  layout = "chip",
}: ContextTagBarProps) {
  if (layout === "banner" && announcement) {
    return (
      <div
        className={cn(
          "ais-composer-banner",
          `ais-composer-banner--${announcement.type}`,
          className,
        )}
      >
        <div className="ais-composer-banner-left">
          <div className="ais-composer-banner-icon">
            {resolveAnnouncementIcon(announcement.type, announcement.icon)}
          </div>
          <span className="ais-composer-banner-title">{announcement.title}</span>
        </div>
        {announcement.dismissible !== false && (
          <button
            className="ais-composer-banner-close"
            onClick={announcement.onDismiss}
            type="button"
            aria-label="Dismiss banner"
          >
            <Lucide.X size={14} />
          </button>
        )}
      </div>
    );
  }

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
              <Lucide.X size={12} />
            </button>
          )}
        </span>
      ))}
    </div>
  );
}
