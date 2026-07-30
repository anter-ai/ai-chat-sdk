import React from "react";
import {
  ChatProvider,
  ChatStateProvider,
  ChatMessages,
  ChatComposer,
  useArtifacts,
  useSources,
  useChat,
  type ChatAdapter,
} from "@anter/ai-chat-sdk";

interface MinimalCustomChatExampleProps {
  adapter: ChatAdapter;
}

function MinimalChatInner() {
  const artifactsCtx = useArtifacts();
  const sourcesCtx = useSources();
  const { isStreaming, stopStreaming, sendMessage } = useChat();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      {/* Scrollable message stream at top */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <ChatMessages artifactsCtx={artifactsCtx} sourcesCtx={sourcesCtx} />
      </div>

      {/* Input composer pinned at bottom */}
      <ChatComposer
        isStreaming={isStreaming}
        onStop={stopStreaming}
        onSendMessage={(message, attachedFileIds, sessionId, extraContextVariables) => {
          void sendMessage(message, attachedFileIds, sessionId, extraContextVariables);
        }}
      />
    </div>
  );
}

/**
 * Option B: Ultra-Minimal Custom Composition (ChatMessages + ChatComposer)
 *
 * Use this pattern when you want complete control over your own custom layout
 * without any resizable side panels, headers, or sidebar chrome.
 */
export function MinimalCustomChatExample({ adapter }: MinimalCustomChatExampleProps) {
  return (
    <ChatProvider adapter={adapter}>
      <ChatStateProvider>
        <MinimalChatInner />
      </ChatStateProvider>
    </ChatProvider>
  );
}
