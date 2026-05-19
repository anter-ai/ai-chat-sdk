import { File, Menu } from "lucide-react";

interface ChatShellHeaderProps {
  sessionTitle: string;
  onOpenMenu: () => void;
  filesCount?: number;
  filesPanelOpen?: boolean;
  onToggleFiles?: () => void;
}

export function ChatShellHeader({
  sessionTitle,
  onOpenMenu,
  filesCount = 0,
  filesPanelOpen = false,
  onToggleFiles,
}: ChatShellHeaderProps) {
  return (
    <header className="ais-shell-header">
      <button
        aria-label="Open menu"
        className="ais-shell-menu-toggle"
        onClick={onOpenMenu}
        type="button"
      >
        <Menu size={18} />
      </button>
      <div className="ais-shell-header-title" title={sessionTitle}>
        {sessionTitle}
      </div>
      {onToggleFiles && (
        <button
          aria-label={filesPanelOpen ? "Close files panel" : "Open files panel"}
          aria-pressed={filesPanelOpen}
          className={`ais-shell-header-files-btn${filesPanelOpen ? " is-active" : ""}`}
          onClick={onToggleFiles}
          type="button"
          title="Session files"
        >
          <File size={15} />
          {filesCount > 0 && <span className="ais-shell-header-files-count">{filesCount}</span>}
        </button>
      )}
    </header>
  );
}
