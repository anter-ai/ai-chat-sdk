import { type ReactNode } from "react";
import type { ChatMessage, StreamingState, ToolApproval } from "../types/chat";
import type { ResumeState, SessionWithMessages } from "../types/session";
import type { ChatAdapter } from "../types/adapter";
import type { Artifact } from "../types/artifact";
export interface UseChatReturn {
    messages: ChatMessage[];
    streamingState: StreamingState;
    isStreaming: boolean;
    isLoading: boolean;
    error?: string;
    currentSessionId?: string;
    currentSessionTitle?: string;
    adapter: ChatAdapter;
    sendMessage: (message: string, attachedFileIds?: string[], sessionId?: string, extraContextVariables?: Record<string, string>) => Promise<void>;
    /**
     * Stop the in-flight response (Stop button). Cancels the run server-side via
     * the adapter's optional `cancelRun`, then aborts the local stream and marks
     * the streaming message as stopped by the user.
     */
    stopStreaming: () => void;
    clearMessages: () => void;
    retryLastMessage: () => Promise<void>;
    /**
     * Retry from a specific user message. Removes that message and everything
     * after it (the assistant response, any subsequent turns), then re-sends
     * the same content — so the message doesn't duplicate.
     */
    retryMessage: (messageId: string) => Promise<void>;
    /**
     * Resume affordance for the last crashed run, from the loaded session's backend hint:
     * `resumable` → Resume (continue from checkpoint), `retry` → Retry (re-send last turn),
     * `live`/`null` → no manual control. Cleared when any new run starts.
     */
    resumeState: ResumeState;
    /** Run the Resume/Retry action (resume-from-checkpoint, with a retry fallback). */
    resumeRun: () => Promise<void>;
    loadSession: (session: SessionWithMessages) => void;
    /** Whether the adapter can resolve tool approvals (drives card actionability). */
    canResolveToolApprovals: boolean;
    /**
     * Resolve a pending tool approval via the adapter. Optimistically marks the
     * card; an adapter rejection re-opens it with the error message. The server's
     * `tool_approval_resolved` event remains authoritative.
     */
    resolveToolApproval: (approval: ToolApproval, decision: "approved" | "denied", reason?: string) => Promise<void>;
}
export declare function ChatStateProvider({ children, onArtifactsReady, }: {
    children: ReactNode;
    onArtifactsReady?: (artifacts: Artifact[]) => void;
}): import("react").FunctionComponentElement<import("react").ProviderProps<UseChatReturn | null>>;
export declare function useChat(): UseChatReturn;
//# sourceMappingURL=use-chat.d.ts.map