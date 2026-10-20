interface ChatShellHeaderProps {
    sessionTitle: string;
    onOpenMenu: () => void;
    filesCount?: number;
    filesPanelOpen?: boolean;
    onToggleFiles?: () => void;
    artifactsCount?: number;
    artifactsPanelOpen?: boolean;
    onToggleArtifacts?: () => void;
    enableArtifacts?: boolean;
}
export declare function ChatShellHeader({ sessionTitle, onOpenMenu, filesCount, filesPanelOpen, onToggleFiles, artifactsCount, artifactsPanelOpen, onToggleArtifacts, enableArtifacts, }: ChatShellHeaderProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=chat-shell-header.d.ts.map