import { File, Info, Menu } from "lucide-react";

interface ChatShellHeaderProps {
  sessionTitle: string;
  onOpenMenu: () => void;
  filesCount?: number;
  filesPanelOpen?: boolean;
  onToggleFiles?: () => void;
  artifactsCount?: number;
  artifactsPanelOpen?: boolean;
  onToggleArtifacts?: () => void;
}

export function ChatShellHeader({
  sessionTitle,
  onOpenMenu,
  filesCount = 0,
  filesPanelOpen = false,
  onToggleFiles,
  artifactsCount = 0,
  artifactsPanelOpen = false,
  onToggleArtifacts,
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
      {(onToggleArtifacts || onToggleFiles) && (
        <div className="ais-shell-header-actions">
          {onToggleArtifacts && artifactsCount > 0 && (
            <button
              aria-label={artifactsPanelOpen ? "Close artifacts panel" : "Open artifacts panel"}
              aria-pressed={artifactsPanelOpen}
              className={`ais-shell-header-artifacts-btn ais-shell-header-action-btn${artifactsPanelOpen ? " is-active" : ""}`}
              onClick={onToggleArtifacts}
              type="button"
              title="Artifacts"
            >
              <Info size={15} />
              <span className="ais-shell-header-files-count">{artifactsCount}</span>
            </button>
          )}
          {onToggleFiles && (
            <button
              aria-label={filesPanelOpen ? "Close files panel" : "Open files panel"}
              aria-pressed={filesPanelOpen}
              className={`ais-shell-header-files-btn ais-shell-header-action-btn${filesPanelOpen ? " is-active" : ""}`}
              onClick={onToggleFiles}
              type="button"
              title="Session files"
            >
              <File size={15} />
              {filesCount > 0 && <span className="ais-shell-header-files-count">{filesCount}</span>}
            </button>
          )}
        </div>
      )}
    </header>
  );
}
