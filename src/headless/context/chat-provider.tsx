"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ChatAdapter } from "../types/adapter";
import type { ChatConfig, ChatStrings } from "../types/config";
import type { ChatPlugins } from "../types/plugins";
import type { Session } from "../types/session";
import type { ComposerAnnouncement } from "../types/chat";
import { defaultStrings } from "../types/config";

interface ChatContextValue {
  adapter: ChatAdapter;
  organizationId: string;
  config: Required<ChatConfig>;
  strings: ChatStrings;
  plugins: ChatPlugins;
  currentSession?: Session;
  setCurrentSession: (session?: Session) => void;
  orgLabel?: string;
  setOrgLabel: (label: string | undefined) => void;
  activeContextId?: string;
  activeContextLabel?: string;
  setActiveContext: (id: string | undefined, label?: string | undefined) => void;
  announcement: ComposerAnnouncement | null;
  setAnnouncement: (announcement: ComposerAnnouncement | null) => void;
  persistentContextVariables: Record<string, string>;
  setPersistentContextVariable: (key: string, value: string | undefined) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

interface ChatProviderProps {
  children: React.ReactNode;
  adapter: ChatAdapter;
  organizationId: string;
  config?: ChatConfig;
  strings?: Partial<ChatStrings>;
  plugins?: ChatPlugins;
  "data-chat-provider"?: string;
}

export function ChatProvider({
  children,
  adapter,
  organizationId,
  config = {},
  strings = {},
  plugins = {},
}: ChatProviderProps) {
  const [currentSession, setCurrentSession] = useState<Session | undefined>(undefined);
  const [orgLabel, setOrgLabel] = useState<string | undefined>(undefined);
  const [activeContextId, setActiveContextId] = useState<string | undefined>(undefined);
  const [activeContextLabel, setActiveContextLabel] = useState<string | undefined>(undefined);
  const [announcement, setAnnouncement] = useState<ComposerAnnouncement | null>(null);
  const [persistentContextVariables, setPersistentContextVariablesState] = useState<
    Record<string, string>
  >({});

  const setActiveContext = useCallback((id: string | undefined, label?: string | undefined) => {
    setActiveContextId(id);
    setActiveContextLabel(label);
  }, []);

  const setPersistentContextVariable = useCallback((key: string, value: string | undefined) => {
    setPersistentContextVariablesState((prev) => {
      if (value === undefined) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: value };
    });
  }, []);

  const mergedConfig: Required<ChatConfig> = {
    enableArtifacts: config.enableArtifacts ?? true,
    enableModelSelector: config.enableModelSelector ?? true,
    enableFileUpload: config.enableFileUpload ?? false,
    enableSlashCommands: config.enableSlashCommands ?? true,
    enableCommandPalette: config.enableCommandPalette ?? true,
    enableSlashFocusShortcut: config.enableSlashFocusShortcut ?? true,
    defaultModel: config.defaultModel ?? "claude-sonnet-4-6",
    theme: config.theme ?? "system",
  };

  const mergedStrings = useMemo(() => ({ ...defaultStrings, ...strings }), [strings]);

  const value = useMemo<ChatContextValue>(
    () => ({
      adapter,
      organizationId,
      config: mergedConfig,
      strings: mergedStrings,
      plugins,
      currentSession,
      setCurrentSession,
      orgLabel,
      setOrgLabel,
      activeContextId,
      activeContextLabel,
      setActiveContext,
      announcement,
      setAnnouncement,
      persistentContextVariables,
      setPersistentContextVariable,
    }),
    [
      adapter,
      organizationId,
      mergedConfig,
      mergedStrings,
      plugins,
      currentSession,
      orgLabel,
      activeContextId,
      activeContextLabel,
      setActiveContext,
      announcement,
      persistentContextVariables,
      setPersistentContextVariable,
    ],
  );

  return (
    <div data-chat-provider="ai-chat-sdk" data-theme={mergedConfig.theme}>
      <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
    </div>
  );
}

export function useChatContext(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChatContext must be used within ChatProvider");
  }

  return ctx;
}
