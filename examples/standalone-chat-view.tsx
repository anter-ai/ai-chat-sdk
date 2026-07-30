import React from "react";
import { ChatProvider, ChatView, type ChatAdapter } from "@anter/ai-chat-sdk";

interface StandaloneChatViewExampleProps {
  adapter: ChatAdapter;
}

/**
 * Option A: Standalone ChatView (No Shell / No Sidebar)
 *
 * Use this pattern when you want a clean chat interface with messages at the
 * top and composer at the bottom, without the shell chrome (sidebar navigation,
 * thread history drawer, header navigation bar, etc.).
 */
export function StandaloneChatViewExample({ adapter }: StandaloneChatViewExampleProps) {
  return (
    <ChatProvider adapter={adapter}>
      <div style={{ height: "100vh", width: "100%" }}>
        <ChatView />
      </div>
    </ChatProvider>
  );
}
