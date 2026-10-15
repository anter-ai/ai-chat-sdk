import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RecentsPage } from "./recents-page";

let mockSessions: any[] = [
  {
    sessionId: "s1",
    title: "Produce a short daily briefing on the AI / tech...",
    updatedAt: new Date().toISOString(),
  },
];

let mockStrings: any = {
  recentsTitle: "Chats",
  searchChats: "Search chats...",
  noConversationsYet: "No conversations yet",
  recentsEmptyDescription: "Conversations you start will appear here.",
};

jest.mock("../../headless/context/chat-provider", () => ({
  useChatContext: () => ({ adapter: { loadSession: jest.fn() }, strings: mockStrings }),
}));

jest.mock("../../headless/hooks/use-conversation-history", () => ({
  useConversationHistory: () => ({
    sessions: mockSessions,
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
  beforeEach(() => {
    mockSessions = [
      {
        sessionId: "s1",
        title: "Produce a short daily briefing on the AI / tech...",
        updatedAt: new Date().toISOString(),
      },
    ];
  });

  it("renders the Chats heading, search field, and sessions", () => {
    render(<RecentsPage />);
    expect(screen.getByRole("heading", { name: "Chats" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: /search chats/i })).toBeInTheDocument();
    expect(
      screen.getByText("Produce a short daily briefing on the AI / tech..."),
    ).toBeInTheDocument();
  });

  it("applies custom headerBackground style when provided", () => {
    const { container } = render(<RecentsPage headerBackground="rgb(240, 240, 240)" />);
    const header = container.querySelector(".ais-recents-header");
    expect(header).toHaveStyle({ background: "rgb(240, 240, 240)" });
  });

  it("renders secondary empty state description when sessions list is empty", () => {
    mockSessions = [];
    render(<RecentsPage />);
    expect(screen.getByText("No conversations yet")).toBeInTheDocument();
    expect(screen.getByText("Conversations you start will appear here.")).toBeInTheDocument();
  });

  it("renders custom emptyStateDescription prop when provided", () => {
    mockSessions = [];
    render(<RecentsPage emptyStateDescription="Your past chats will be saved right here." />);
    expect(screen.getByText("Your past chats will be saved right here.")).toBeInTheDocument();
  });

  it("renders custom renderEmptyState when provided", () => {
    mockSessions = [];
    render(
      <RecentsPage
        renderEmptyState={() => <div data-testid="custom-empty">Custom Empty State</div>}
      />,
    );
    expect(screen.getByTestId("custom-empty")).toBeInTheDocument();
    expect(screen.getByText("Custom Empty State")).toBeInTheDocument();
  });
});
