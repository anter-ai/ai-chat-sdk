import React from "react";
import { render, screen } from "@testing-library/react";
import { ChatMessage } from "./chat-message";
import "@testing-library/jest-dom";

jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <div>{children}</div>,
}));

jest.mock("remark-gfm", () => ({
  __esModule: true,
  default: {},
}));

// ChatMessage reads `config` from context; provide a minimal stub so it can render
// in isolation (artifacts/sources contexts are passed in as props).
jest.mock("../../headless/context/chat-provider", () => ({
  useChatContext: () => ({ config: { enableArtifacts: true } }),
}));

describe("ChatMessage", () => {
  const mockOnRetry = jest.fn();
  const mockOnFollowUp = jest.fn();
  const mockArtifactsCtx = {
    artifacts: new Map(),
    openArtifact: jest.fn(),
    registerArtifacts: jest.fn(),
  } as any;

  const mockSourcesCtx = {
    activeSources: [],
    activeMessageId: undefined,
    panelState: { isOpen: false },
    openSources: jest.fn(),
    closeSources: jest.fn(),
  } as any;

  it("renders a user message correctly", () => {
    const message = {
      id: "1",
      role: "user",
      content: "Hello",
      timestamp: new Date(),
    } as any;
    render(
      <ChatMessage
        message={message}
        onRetry={mockOnRetry}
        onFollowUp={mockOnFollowUp}
        artifactsCtx={mockArtifactsCtx}
        sourcesCtx={mockSourcesCtx}
      />,
    );
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("renders a command message as a pill", () => {
    const message = {
      id: "2",
      role: "command",
      content: "/gap",
      timestamp: new Date(),
    } as any;
    render(
      <ChatMessage
        message={message}
        onRetry={mockOnRetry}
        onFollowUp={mockOnFollowUp}
        artifactsCtx={mockArtifactsCtx}
        sourcesCtx={mockSourcesCtx}
      />,
    );
    const pill = screen.getByTestId("command-message-2");
    expect(pill).toBeInTheDocument();
    expect(pill).toHaveTextContent("/gap");
  });

  it("renders an assistant message with markdown", () => {
    const message = {
      id: "3",
      role: "assistant",
      content: "**bold text**",
      timestamp: new Date(),
    } as any;
    render(
      <ChatMessage
        message={message}
        onRetry={mockOnRetry}
        onFollowUp={mockOnFollowUp}
        artifactsCtx={mockArtifactsCtx}
        sourcesCtx={mockSourcesCtx}
      />,
    );
    const boldText = screen.getByText("**bold text**");
    expect(boldText).toBeInTheDocument();
  });

  it("renders error message and retry button", () => {
    const message = {
      id: "4",
      role: "assistant",
      content: "",
      error: "Something went wrong",
      timestamp: new Date(),
    } as any;
    render(
      <ChatMessage
        message={message}
        onRetry={mockOnRetry}
        onFollowUp={mockOnFollowUp}
        artifactsCtx={mockArtifactsCtx}
        sourcesCtx={mockSourcesCtx}
      />,
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("extracts and renders artifacts from content even in non-streaming messages", () => {
    const contentWithArtifact =
      'Here is the plan: <artifact type="markdown" title="Action Plan">Do step 1</artifact>';
    const message = {
      id: "5",
      role: "assistant",
      content: contentWithArtifact,
      timestamp: new Date(),
    } as any;

    render(
      <ChatMessage
        message={message}
        onRetry={mockOnRetry}
        onFollowUp={mockOnFollowUp}
        artifactsCtx={mockArtifactsCtx}
        sourcesCtx={mockSourcesCtx}
      />,
    );

    // Should NOT show the raw artifact tag in the main content
    expect(screen.queryByText(/<artifact/)).not.toBeInTheDocument();

    // It should render an ArtifactChip (we check for the title)
    expect(screen.getByText("Action Plan")).toBeInTheDocument();
  });
});
