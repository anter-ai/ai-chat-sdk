import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ChatSidebar } from "./chat-sidebar";

let mockConfig: any = {
  enableArtifacts: true,
  enableSearch: true,
  enableCommandPalette: true,
};

jest.mock("../../headless/context/chat-provider", () => ({
  useChatContext: () => ({
    adapter: { loadSession: jest.fn() },
    organizationId: "org-1",
    currentSession: undefined,
    setCurrentSession: jest.fn(),
    config: mockConfig,
  }),
}));

jest.mock("../../headless/hooks/use-conversation-history", () => ({
  useConversationHistory: () => ({
    sessions: [
      {
        sessionId: "session-123",
        title: "Test session",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      },
    ],
    isLoading: false,
    refresh: jest.fn(),
    deleteSession: jest.fn(),
  }),
}));

jest.mock("../../headless/hooks/use-chat", () => ({
  useChat: () => ({
    loadSession: jest.fn(),
    currentSessionId: undefined,
    isStreaming: false,
    clearMessages: jest.fn(),
  }),
}));

describe("ChatSidebar custom links", () => {
  beforeEach(() => {
    mockConfig = {
      enableArtifacts: true,
      enableSearch: true,
      enableCommandPalette: true,
    };
  });

  it("renders the built-in Artifacts item by default", () => {
    render(<ChatSidebar />);
    expect(screen.getByRole("button", { name: "Artifacts" })).toBeInTheDocument();
  });

  it("hides the Artifacts item when hideArtifactsLink is set", () => {
    render(<ChatSidebar hideArtifactsLink />);
    expect(screen.queryByRole("button", { name: "Artifacts" })).not.toBeInTheDocument();
  });

  it("unmounts the Artifacts item when config.enableArtifacts is false", () => {
    mockConfig = { enableArtifacts: false, enableSearch: true, enableCommandPalette: true };
    render(<ChatSidebar />);
    expect(screen.queryByRole("button", { name: "Artifacts" })).not.toBeInTheDocument();
  });

  it("renders Search item by default and unmounts when enableSearch is false", () => {
    const { unmount } = render(<ChatSidebar />);
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
    unmount();

    mockConfig = { enableArtifacts: true, enableSearch: false, enableCommandPalette: true };
    render(<ChatSidebar />);
    expect(screen.queryByRole("button", { name: "Search" })).not.toBeInTheDocument();
  });

  it("unmounts Search item when enableCommandPalette is false", () => {
    mockConfig = { enableArtifacts: true, enableSearch: true, enableCommandPalette: false };
    render(<ChatSidebar />);
    expect(screen.queryByRole("button", { name: "Search" })).not.toBeInTheDocument();
  });

  it("renders host-supplied sidebar links and fires their onClick", () => {
    const onClick = jest.fn();
    render(
      <ChatSidebar
        hideArtifactsLink
        sidebarLinks={[{ id: "back-to-host", label: "Platform", onClick }]}
      />,
    );

    const link = screen.getByRole("button", { name: "Platform" });
    expect(link).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Artifacts" })).not.toBeInTheDocument();

    fireEvent.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
  it("switches activeView back to chat when a recent session is clicked", async () => {
    const onViewChange = jest.fn();
    render(<ChatSidebar isOpen onViewChange={onViewChange} activeView="recents" />);

    const sessionItem = screen.getByText("Test session");
    expect(sessionItem).toBeInTheDocument();

    fireEvent.click(sessionItem);

    await waitFor(() => {
      expect(onViewChange).toHaveBeenCalledWith("chat");
    });
  });

  it("invokes onClose when a rail button is clicked while open on mobile", () => {
    const onClose = jest.fn();
    render(<ChatSidebar isOpen={true} onClose={onClose} />);
    const newChatBtn = screen.getByRole("button", { name: "New Chat" });
    fireEvent.click(newChatBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
