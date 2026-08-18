import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RecentsPage } from "./recents-page";

jest.mock("../../headless/context/chat-provider", () => ({
  useChatContext: () => ({ adapter: { loadSession: jest.fn() } }),
}));

jest.mock("../../headless/hooks/use-conversation-history", () => ({
  useConversationHistory: () => ({
    sessions: [
      {
        sessionId: "s1",
        title: "Produce a short daily briefing on the AI / tech...",
        updatedAt: new Date().toISOString(),
      },
    ],
    isLoading: false,
    deleteSession: jest.fn(),
  }),
}));

jest.mock("../../headless/hooks/use-chat", () => ({
  useChat: () => ({
    loadSession: jest.fn(),
    currentSessionId: undefined,
    clearMessages: jest.fn(),
  }),
}));

describe("RecentsPage", () => {
  it("renders the Chats heading, search field, and sessions", () => {
    render(<RecentsPage />);
    expect(screen.getByRole("heading", { name: "Chats" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Search chats" })).toBeInTheDocument();
    expect(
      screen.getByText("Produce a short daily briefing on the AI / tech..."),
    ).toBeInTheDocument();
  });
});
