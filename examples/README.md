# Examples Index

This directory contains reference integration patterns for `@anter/ai-chat-sdk`.

## Available Patterns

| Example Pattern                   | Description                                                                      | Link                                                                                                      |
| --------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Option A: Standalone ChatView** | Full chat view with messages and composer without sidebar menu or shell chrome   | [`standalone-chat-view.tsx`](./standalone-chat-view.tsx)                                                  |
| **Option B: Minimal Custom Chat** | Direct composition of `ChatMessages` & `ChatComposer` for custom minimal layouts | [`minimal-custom-chat.tsx`](./minimal-custom-chat.tsx)                                                    |
| **Reference Adapter**             | Standard reference adapter implementation using Fetch & EventSource streams      | [`packages/anter-adapter`](../packages/anter-adapter/README.md)                                           |
| **Custom Styling & Theming**      | CSS variable overrides and Tailwind integration guide                            | [`README.md#whitelabeling--custom-theming`](../README.md#whitelabeling--custom-theming)                   |
| **Stateless Widget Mode**         | Embedding floating chat widget without full session persistence                  | [`README.md#chatwidget-stateless--public-site-mode`](../README.md#chatwidget-stateless--public-site-mode) |

---

## Detailed Integration Guide: Plain Chat Without Shell Baggages

When building an embedded chat interface into an existing web app dashboard, users often want a plain chat interface (messages at the top, composer input at the bottom) without the heavy application shell, sidebar navigation, or header drawers.

### Option A: Standalone `ChatView` Component (Recommended)

The `<ChatView />` component provides a clean message feed and input composer layout out of the box, without sidebar menus or shell headers.

```tsx
import { ChatProvider, ChatView } from "@anter/ai-chat-sdk";

export function StandaloneChatPage() {
  return (
    <ChatProvider adapter={myAdapter}>
      <div style={{ height: "100vh", width: "100%" }}>
        <ChatView />
      </div>
    </ChatProvider>
  );
}
```

- **Included**: Auto-scrolling `ChatMessages`, input `ChatComposer`, support for slide-over artifact/source panels when active.
- **Excluded**: Sidebar navigation menu, recents history drawer, top shell navigation header.

---

### Option B: Ultra-Minimal Custom Composition (`ChatMessages` + `ChatComposer`)

If you want complete control over your own DOM layout without resizable panels or optional slide-over panels, compose `<ChatMessages />` and `<ChatComposer />` directly within `<ChatProvider>`:

```tsx
import React from "react";
import {
  ChatProvider,
  ChatStateProvider,
  ChatMessages,
  ChatComposer,
  useArtifacts,
  useSources,
  useChat,
} from "@anter/ai-chat-sdk";

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
      {/* Scrollable chat messages at the top */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <ChatMessages artifactsCtx={artifactsCtx} sourcesCtx={sourcesCtx} />
      </div>

      {/* Composer input pinned at the bottom */}
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

export function MinimalChatPage() {
  return (
    <ChatProvider adapter={myAdapter}>
      <ChatStateProvider>
        <MinimalChatInner />
      </ChatStateProvider>
    </ChatProvider>
  );
}
```
