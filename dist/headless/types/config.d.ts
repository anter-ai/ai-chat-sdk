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
    /**
     * Show the composer Resume/Retry control when the loaded session's `resumeState`
     * indicates the last run crashed (`resumable` → Resume, `retry` → Retry). Requires
     * the host adapter to surface `resumeState`/`resumableExecutionId` from `loadSession`
     * and (for Resume) implement `resumeExecution`. Defaults to true.
     */
    enableResumeRetry?: boolean;
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
export type SlashCommandHandler = (name: string, args: string, ctx: SlashCommandContext) => boolean | void | Promise<boolean | void>;
export declare const defaultStrings: {
    readonly newConversation: "New conversation";
    readonly sendMessage: "Send message";
    readonly retry: "Retry";
    readonly thinking: "Thinking...";
    readonly artifactPanelClose: "Close artifact panel";
    readonly openFullChat: "Open full chat";
    readonly cancel: "Cancel";
    readonly composerPlaceholder: "Ask a question...";
    readonly footerDisclaimer: "AI responses can contain mistakes.";
    readonly exportArtifact: "Save to workspace";
    readonly exportArtifactSub: "Attach to your workspace";
    readonly approvalTitle: "Approval required";
    readonly approvalApprove: "Approve";
    readonly approvalDeny: "Deny";
    readonly approvalConfirmDeny: "Confirm deny";
    readonly approvalDenyReasonPlaceholder: "Optional reason — sent to the agent";
    readonly approvalWaiting: "Waiting for approval through another channel…";
    readonly approvalApproved: "Approved";
    readonly approvalDenied: "Denied";
    readonly approvalExpired: "Expired";
    readonly approvalCanceled: "Canceled";
};
export type ChatStrings = typeof defaultStrings;
//# sourceMappingURL=config.d.ts.map