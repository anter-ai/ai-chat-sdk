export interface ChatConfig {
  enableArtifacts?: boolean;
  enableModelSelector?: boolean;
  enableFileUpload?: boolean;
  enableSlashCommands?: boolean;
  enableCommandPalette?: boolean;
  enableSlashFocusShortcut?: boolean;
  defaultModel?: string;
  theme?: "light" | "dark" | "system";
}

export const defaultStrings = {
  newConversation: "New conversation",
  sendMessage: "Send message",
  retry: "Retry",
  thinking: "Thinking...",
  artifactPanelClose: "Close artifact panel",
  openFullChat: "Open full chat",
  cancel: "Cancel",
  composerPlaceholder: "Ask a question...",
  footerDisclaimer: "AI responses can contain mistakes.",
  exportArtifact: "Save to workspace",
  exportArtifactSub: "Attach to your workspace",
} as const;

export type ChatStrings = typeof defaultStrings;
