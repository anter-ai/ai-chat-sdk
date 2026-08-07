import React from "react";
import type { ChatAdapter } from "../types/adapter";
import type { ChatConfig, ChatStrings, SlashCommandHandler } from "../types/config";
import type { ChatPlugins } from "../types/plugins";
import type { Session } from "../types/session";
import type { ComposerAnnouncement, ContextReference } from "../types/chat";
interface ChatContextValue {
    adapter: ChatAdapter;
    organizationId?: string;
    config: Required<ChatConfig>;
    strings: ChatStrings;
    plugins: ChatPlugins;
    onSlashCommand?: SlashCommandHandler;
    currentSession?: Session;
    setCurrentSession: (session?: Session) => void;
    orgLabel?: string;
    setOrgLabel: (label: string | undefined) => void;
    activeContextId?: string;
    activeContextLabel?: string;
    setActiveContext: (id: string | undefined, label?: string | undefined) => void;
    contextReferences: ContextReference[];
    setContextReferences: (refs: ContextReference[]) => void;
    addContextReference: (ref: ContextReference) => void;
    removeContextReference: (id: string) => void;
    topBanner: ComposerAnnouncement | null;
    setTopBanner: (announcement: ComposerAnnouncement | null) => void;
    bottomBanner: ComposerAnnouncement | null;
    setBottomBanner: (announcement: ComposerAnnouncement | null) => void;
    /** @deprecated Use bottomBanner/setBottomBanner */
    announcement: ComposerAnnouncement | null;
    /** @deprecated Use setBottomBanner */
    setAnnouncement: (announcement: ComposerAnnouncement | null) => void;
    persistentContextVariables: Record<string, string>;
    setPersistentContextVariable: (key: string, value: string | undefined) => void;
}
interface ChatProviderProps {
    children: React.ReactNode;
    adapter: ChatAdapter;
    organizationId?: string;
    config?: ChatConfig;
    strings?: Partial<ChatStrings>;
    plugins?: ChatPlugins;
    onSlashCommand?: SlashCommandHandler;
    "data-chat-provider"?: string;
}
export declare function ChatProvider({ children, adapter, organizationId, config, strings, plugins, onSlashCommand, }: ChatProviderProps): import("react/jsx-runtime").JSX.Element;
export declare function useChatContext(): ChatContextValue;
export {};
//# sourceMappingURL=chat-provider.d.ts.map