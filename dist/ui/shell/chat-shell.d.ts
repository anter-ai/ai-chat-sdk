import React from "react";
import type { ChatMessage } from "../../headless/types/chat";
import type { ResumeState } from "../../headless/types/session";
import type { SidebarNavLink } from "../sidebar/chat-sidebar";
import type { SessionWithMessages } from "../../headless/types/session";
import type { ComposerAnnouncement } from "../../headless/types/chat";
import type { RecordTag } from "../../headless/utils/record-utils";
interface ChatShellProps {
    /** Called when the user triggers the "save artifact" action. When omitted, the button is hidden. */
    onExportArtifact?: (artifactId: string) => Promise<void>;
    onRecordClick?: (record: RecordTag) => void;
    renderMessageFooter?: (message: SessionWithMessages["messages"][number]) => React.ReactNode;
    recordPanel?: React.ReactNode;
    className?: string;
    /**
     * Inline styles merged onto the shell root. Hosts that provide a bounded
     * parent container should pass `{ height: "100%" }` so the shell fills the
     * parent instead of the viewport (see the height contract in the README).
     */
    style?: React.CSSProperties;
    /**
     * Pixels of host-app chrome (header and/or footer) rendered outside the
     * shell. Used to compute the available viewport height on mobile, where the
     * shell would otherwise overflow below the fold and clip the composer.
     * Equivalent to setting `--ais-chrome-offset-top/bottom` in CSS.
     */
    viewportOffset?: {
        top?: number;
        bottom?: number;
    };
    initialSessionId?: string;
    onSessionChange?: (sessionId?: string) => void;
    /** Consumer-supplied empty state rendered when the conversation has no messages. */
    emptyState?: React.ReactNode;
    /** Tip announcements shown randomly in the composer. Defaults to none. */
    tips?: ComposerAnnouncement[];
    /** Callback triggered when clicking the global Artifacts sidebar item. When provided, overrides local toggle. */
    onArtifactsClick?: () => void;
    /** Hide the built-in Artifacts sidebar item. */
    hideArtifactsLink?: boolean;
    /** Custom nav items appended to the sidebar rail. The host supplies each item's label, icon, and click handler. */
    sidebarLinks?: SidebarNavLink[];
    /** Whether to hide the default message actions (e.g. copy, retry). */
    hideMessageActions?: boolean;
    /**
     * Generic streaming-state callback. Fires from inside ChatStateProvider
     * whenever isStreaming or resumeState transitions (edge only, not per token).
     * Keeps the SDK agnostic — hosts can drive banners/notifications.
     */
    onStreamingChange?: (isStreaming: boolean, messages: ChatMessage[], resumeState: ResumeState, executionId?: string) => void;
}
export declare function ChatShell({ onExportArtifact, onRecordClick, renderMessageFooter, recordPanel, className, style, viewportOffset, initialSessionId, onSessionChange, emptyState, tips, onArtifactsClick, hideArtifactsLink, sidebarLinks, hideMessageActions, onStreamingChange, }: ChatShellProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=chat-shell.d.ts.map