"use client";

import { MoreVertical, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { Session } from "../../headless/types/session";

interface RecentSessionItemProps {
  session: Session;
  isActive?: boolean;
  onClick: () => void;
  onDelete?: (sessionId: string) => void;
  formatDate: (date: string) => string;
  variant?: "list" | "sidebar";
}

export function RecentSessionItem({
  session,
  isActive,
  onClick,
  onDelete,
  formatDate,
  variant = "list",
}: RecentSessionItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(session.sessionId);
    setMenuOpen(false);
  };

  if (variant === "sidebar") {
    return (
      <div
        className={`ais-recent-session-wrapper ${isActive ? "is-active" : ""} ${menuOpen ? "is-menu-open" : ""}`}
      >
        <button
          role="listitem"
          className={`ais-recent-session ${isActive ? "is-active" : ""}`}
          onClick={onClick}
          type="button"
          title={session.title}
        >
          <span className="ais-recent-title">{session.title}</span>
        </button>

        <div className="ais-recent-actions" ref={menuRef}>
          <button
            className={`ais-recent-more-btn ${menuOpen ? "is-open" : ""}`}
            onClick={toggleMenu}
            type="button"
            aria-label="More options"
          >
            <MoreVertical size={14} />
          </button>

          {menuOpen && (
            <div className="ais-recent-menu">
              <button
                className="ais-recent-menu-item is-danger"
                onClick={handleDelete}
                type="button"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`ais-recents-item-wrapper ${isActive ? "is-active" : ""} ${menuOpen ? "is-menu-open" : ""}`}
    >
      <button
        className={`ais-recents-item ${isActive ? "is-active" : ""}`}
        onClick={onClick}
        type="button"
      >
        <span className="ais-recents-item-title">{session.title}</span>
        <span className="ais-recents-item-date">{formatDate(session.updatedAt)}</span>
      </button>

      <div className="ais-recent-actions" ref={menuRef}>
        <button
          className={`ais-recent-more-btn ${menuOpen ? "is-open" : ""}`}
          onClick={toggleMenu}
          type="button"
          aria-label="More options"
        >
          <MoreVertical size={16} />
        </button>

        {menuOpen && (
          <div className="ais-recent-menu">
            <button className="ais-recent-menu-item is-danger" onClick={handleDelete} type="button">
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
