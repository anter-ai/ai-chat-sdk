import type { LucideIcon } from "lucide-react";
export type SidebarView = "chat" | "recents";
/**
 * A host-supplied navigation item appended to the sidebar rail. Keeps the SDK
 * agnostic: the consumer owns the label, icon, and click behaviour, so any
 * product can wire its own destinations (e.g. a "back to host app" link)
 * without the SDK encoding domain-specific navigation.
 */
export interface SidebarNavLink {
    /** Stable identifier, used as the React key. */
    id: string;
    /** Visible label and accessible name. */
    label: string;
    /** Icon component; defaults to a generic external-link glyph when omitted. */
    icon?: LucideIcon;
    /** Invoked when the item is clicked. */
    onClick: () => void;
}
interface ChatSidebarProps {
    onNewConversation?: () => void;
    isOpen?: boolean;
    onToggle?: () => void;
    className?: string;
    activeView?: SidebarView;
    onViewChange?: (view: SidebarView) => void;
    /** When this transitions from false → true (artifact panel just opened),
     *  the sidebar is automatically collapsed. The user can still re-open it
     *  afterwards — this is a one-time nudge, not a permanent lock. REQ-02/04 */
    artifactPanelOpen?: boolean;
    onToggleArtifacts?: () => void;
    /** Hide the built-in Artifacts nav item (e.g. when the host has no use for it). */
    hideArtifactsLink?: boolean;
    /** Custom nav items appended after the built-in items. */
    sidebarLinks?: SidebarNavLink[];
}
export declare function ChatSidebar({ onNewConversation, isOpen, onToggle, className, activeView, onViewChange, artifactPanelOpen, onToggleArtifacts, hideArtifactsLink, sidebarLinks, }: ChatSidebarProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=chat-sidebar.d.ts.map