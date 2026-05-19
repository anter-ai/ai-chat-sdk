"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, Globe } from "lucide-react";

interface ComposerToolsMenuProps {
  onClose: () => void;
}

export function ComposerToolsMenu({ onClose }: ComposerToolsMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div className="ais-composer-plus-menu ais-composer-tools-menu" ref={menuRef} role="menu">
      <button
        aria-checked={webSearchEnabled}
        aria-label="Web search — coming soon"
        className={`ais-composer-plus-menu-item ais-composer-tools-menu-item${webSearchEnabled ? " is-active" : ""} ais-composer-plus-menu-item--soon`}
        disabled
        role="menuitemcheckbox"
        title="Web search — coming soon"
        type="button"
      >
        <Globe size={16} />
        <span>Web search</span>
        <span className="ais-composer-tools-menu-end">
          {webSearchEnabled ? <Check size={14} strokeWidth={2.5} /> : null}
          <span className="ais-composer-plus-menu-badge">soon</span>
        </span>
      </button>
    </div>
  );
}
