"use client";

import React from "react";
import type { ComposerAnnouncement } from "../../headless/types/chat";
import { cn } from "../../lib/cn";

interface ComposerBannerProps {
  banner: ComposerAnnouncement;
  onDismiss?: () => void;
  position?: "top" | "bottom";
  className?: string;
}

export function ComposerBanner({ banner, onDismiss, position, className }: ComposerBannerProps) {
  const resolvedPosition = position ?? banner.position ?? "bottom";

  const handleDismiss = () => {
    banner.onDismiss?.();
    onDismiss?.();
  };

  return (
    <div
      className={cn(
        "ais-composer-banner",
        `ais-composer-banner--${banner.type}`,
        `ais-composer-banner--${resolvedPosition}`,
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span className="ais-composer-banner__title-wrap">
        {banner.icon ? (
          <span className="ais-composer-banner__icon" aria-hidden="true">
            {banner.icon}
          </span>
        ) : null}
        <span className="ais-composer-banner__title">{banner.title}</span>
      </span>

      <div className="ais-composer-banner__actions">
        {banner.action ? (
          <button
            type="button"
            className="ais-composer-banner__action-btn"
            onClick={banner.action.onClick}
          >
            {banner.action.label}
          </button>
        ) : null}
        {banner.dismissible !== false ? (
          <button
            type="button"
            className="ais-composer-banner__dismiss"
            onClick={handleDismiss}
            aria-label="Dismiss banner"
          >
            ×
          </button>
        ) : null}
      </div>
    </div>
  );
}
