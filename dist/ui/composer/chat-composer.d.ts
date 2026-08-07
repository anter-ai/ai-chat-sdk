import type { ResumeState } from "../../headless/types/session";
interface ChatComposerProps {
    onSendMessage: (message: string, attachedFileIds?: string[], sessionId?: string, extraContextVariables?: Record<string, string>) => void;
    isStreaming?: boolean;
    /** Stops the in-flight response; renders the Stop button while streaming. */
    onStop?: () => void;
    /**
     * Resume affordance for the last crashed run (from the session's backend hint).
     * `resumable` renders a "Resume" button, `retry` a "Retry" button; both invoke
     * `onResume`. Hidden while streaming, when `config.enableResumeRetry` is false, or
     * when `onResume` is absent.
     */
    resumeState?: ResumeState;
    onResume?: () => void;
    className?: string;
}
export declare function ChatComposer({ onSendMessage, isStreaming, onStop, resumeState, onResume, className, }: ChatComposerProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=chat-composer.d.ts.map