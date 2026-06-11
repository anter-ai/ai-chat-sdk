export interface ChatTheme {
  bg?: string;
  sidebarBg?: string;
  artifactBg?: string;
  border?: string;
  accent?: string;
  accentHover?: string;
  accentForeground?: string;
  messageUserBg?: string;
  messageUserText?: string;
  messageAiBg?: string;
  messageAiText?: string;
  muted?: string;
  radiusSm?: string;
  radiusMd?: string;
  radiusLg?: string;
  sidebarWidth?: string;
  artifactWidth?: string;
}

export interface ChatThemeSpecification {
  light?: ChatTheme;
  dark?: ChatTheme;
}

export interface ChatConfig {
  enableArtifacts?: boolean;
  enableModelSelector?: boolean;
  enableFileUpload?: boolean;
  enableSlashCommands?: boolean;
  enableCommandPalette?: boolean;
  enableSlashFocusShortcut?: boolean;
  defaultModel?: string;
  theme?: "light" | "dark" | "system";
  themeOptions?: ChatThemeSpecification;
}

/**
 * Context handed to a slash-command interceptor so the host can surface output
 * back into the chat transcript without performing a backend round-trip.
 */
export interface SlashCommandContext {
  /** Appends an assistant-role markdown message to the transcript. */
  appendAssistantMessage(markdown: string): void;
}

/**
 * Host-provided interceptor for slash commands. Invoked before any backend send
 * whenever the composer submits a message beginning with `/<word>`.
 *
 * - `name` is the matched command (e.g. `"/agent"`).
 * - `args` is the trimmed remainder after the command (e.g. `"set my-agent"`).
 * - Return `true` (or a promise resolving to `true`) to mark the command handled,
 *   which renders the typed command plus any appended messages and skips the
 *   backend `sendMessage` call entirely.
 * - Return `false`/`undefined` to let the SDK fall through to its built-in
 *   handling (e.g. `/help`) or the normal backend send.
 */
export type SlashCommandHandler = (
  name: string,
  args: string,
  ctx: SlashCommandContext,
) => boolean | void | Promise<boolean | void>;

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
  approvalTitle: "Approval required",
  approvalApprove: "Approve",
  approvalDeny: "Deny",
  approvalConfirmDeny: "Confirm deny",
  approvalDenyReasonPlaceholder: "Optional reason — sent to the agent",
  approvalWaiting: "Waiting for approval through another channel…",
  approvalApproved: "Approved",
  approvalDenied: "Denied",
  approvalExpired: "Expired",
  approvalCanceled: "Canceled",
} as const;

export type ChatStrings = typeof defaultStrings;
