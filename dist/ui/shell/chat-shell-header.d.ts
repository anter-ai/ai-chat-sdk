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
export declare function ChatShellHeader({ sessionTitle, onOpenMenu, filesCount, filesPanelOpen, onToggleFiles, artifactsCount, artifactsPanelOpen, onToggleArtifacts, }: ChatShellHeaderProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=chat-shell-header.d.ts.map