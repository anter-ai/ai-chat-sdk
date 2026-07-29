# Quickstart Guide (`@anter/ai-chat-sdk`)

Get an embeddable AI Chat UI up and running in under 5 minutes.

---

## 1. Installation

Install `@anter/ai-chat-sdk` alongside React peer dependencies:

```bash
pnpm add @anter/ai-chat-sdk react react-dom
```

---

## 2. Import Styles

Import the SDK stylesheet at your application root:

```typescript
import "@anter/ai-chat-sdk/styles.css";
```

---

## 3. Implement a Basic Adapter

The SDK communicates with your backend via a simple `ChatAdapter` interface:

```typescript
import type { ChatAdapter, SendMessageInput, ChatMessage } from "@anter/ai-chat-sdk/types";

export class MyBackendAdapter implements ChatAdapter {
  async *sendMessage(input: SendMessageInput): AsyncGenerator<Partial<ChatMessage>> {
    // Stream response tokens from your backend SSE endpoint:
    yield { content: "Hello! How can I help you today?" };
  }
}
```

---

## 4. Render `ChatProvider` & `ChatShell`

Wrap your layout with `ChatProvider` and render `ChatShell`:

```tsx
import React, { useMemo } from "react";
import { ChatProvider, ChatShell } from "@anter/ai-chat-sdk";
import { MyBackendAdapter } from "./my-adapter";

export function App() {
  const adapter = useMemo(() => new MyBackendAdapter(), []);

  return (
    <ChatProvider adapter={adapter}>
      <div style={{ height: "100vh", width: "100vw" }}>
        <ChatShell />
      </div>
    </ChatProvider>
  );
}
```

---

## Next Steps

- Explore [Architecture Documentation](ARCHITECTURE.md) to understand state management and headless hooks.
- Read [Development Guide](DEVELOPMENT.md) for local dev setup, testing, and contribution instructions.
