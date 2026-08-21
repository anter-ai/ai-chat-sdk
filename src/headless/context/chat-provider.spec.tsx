import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ChatProvider, useChatContext } from "./chat-provider";
import type { ChatAdapter } from "../types/adapter";

const mockAdapter: ChatAdapter = {
  createSession: jest.fn(async () => "session-1"),
  updateSession: jest.fn(),
  sendMessage: jest.fn(),
  loadSession: jest.fn(),
  listSessions: jest.fn(async () => ({ sessions: [], total: 0, page: 1 })),
  deleteSession: jest.fn(),
};

function TestConsumer() {
  const ctx = useChatContext();
  return <div data-testid="consumer">{ctx.config.defaultModel}</div>;
}

describe("ChatProvider", () => {
  it("renders with data-chat-provider='ai-chat-sdk' and default theme", () => {
    const { container } = render(
      <ChatProvider adapter={mockAdapter}>
        <div>child content</div>
      </ChatProvider>,
    );

    const root = container.firstElementChild;
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute("data-chat-provider", "ai-chat-sdk");
    expect(root).toHaveAttribute("data-theme", "system");
  });

  it("forwards className, style, and standard HTML div attributes to wrapper element", () => {
    render(
      <ChatProvider
        adapter={mockAdapter}
        className="custom-flex-class flex-1"
        style={{ height: "100vh", minWidth: 0 }}
        data-testid="provider-root"
        id="chat-root-id"
      >
        <div>child content</div>
      </ChatProvider>,
    );

    const root = screen.getByTestId("provider-root");
    expect(root).toBeInTheDocument();
    expect(root).toHaveClass("custom-flex-class", "flex-1");
    expect(root).toHaveAttribute("id", "chat-root-id");
    expect(root).toHaveStyle({ height: "100vh" });
    expect((root as HTMLElement).style.minWidth).toBe("0");
  });

  it("provides chat context to descendant components", () => {
    render(
      <ChatProvider adapter={mockAdapter} config={{ defaultModel: "custom-model" }}>
        <TestConsumer />
      </ChatProvider>,
    );

    expect(screen.getByTestId("consumer")).toHaveTextContent("custom-model");
  });

  it("throws error when useChatContext is called outside ChatProvider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<TestConsumer />)).toThrow(
      "useChatContext must be used within ChatProvider",
    );

    spy.mockRestore();
  });
});
