"use client";

import React, { useEffect, useRef } from "react";
import { Paperclip, Sparkles } from "lucide-react";

interface ComposerPlusMenuProps {
  onClose: () => void;
  onUploadFiles: () => void;
}

export function ComposerPlusMenu({ onClose, onUploadFiles }: ComposerPlusMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

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
    <div className="ais-composer-plus-menu" ref={menuRef} role="menu">
      <button
        className="ais-composer-plus-menu-item"
        onClick={() => {
          onUploadFiles();
          onClose();
        }}
        role="menuitem"
        type="button"
      >
        <Paperclip size={16} />
        <span>Upload files or photos</span>
      </button>

      <button
        aria-label="Skill — coming soon"
        className="ais-composer-plus-menu-item ais-composer-plus-menu-item--soon"
        disabled
        role="menuitem"
        title="Skills — coming soon"
        type="button"
      >
        <Sparkles size={16} />
        <span>Skill</span>
        <span className="ais-composer-plus-menu-badge">soon</span>
      </button>
    </div>
  );
}
