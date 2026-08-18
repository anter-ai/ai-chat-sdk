import React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CommandPalette } from "./command-palette";

jest.mock("../../headless/context/chat-provider", () => ({
  useChatContext: () => ({
    adapter: { loadSession: jest.fn() },
    config: { enableCommandPalette: true, theme: "dark" },
  }),
}));

jest.mock("../../headless/hooks/use-conversation-history", () => ({
  useConversationHistory: () => ({
    sessions: [
      { sessionId: "s1", title: "Produce a short daily briefing on the AI / tech..." },
      { sessionId: "s2", title: "give me list of dca plans using live mode" },
    ],
    isLoading: false,
  }),
}));

jest.mock("../../headless/hooks/use-chat", () => ({
  useChat: () => ({ loadSession: jest.fn() }),
}));

jest.mock("../../extensions/command-registry", () => ({
  getCommandRegistry: () => [],
}));

function stubMatchMedia(matches: boolean) {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
}

function stubVisualViewport(height: number, offsetTop = 0) {
  Object.defineProperty(window, "visualViewport", {
    value: {
      height,
      offsetTop,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    configurable: true,
  });
}

function openPalette() {
  act(() => {
    window.dispatchEvent(new Event("ais-open-command-palette"));
  });
}

describe("CommandPalette", () => {
  const originalMatchMedia = window.matchMedia;
  const originalViewport = Object.getOwnPropertyDescriptor(window, "visualViewport");
  const originalInnerHeight = window.innerHeight;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    if (originalViewport) Object.defineProperty(window, "visualViewport", originalViewport);
    else Reflect.deleteProperty(window, "visualViewport");
    Object.defineProperty(window, "innerHeight", {
      value: originalInnerHeight,
      configurable: true,
    });
    cleanup();
  });

  it("opens from the Search event and lists recent chats", () => {
    stubMatchMedia(false);
    render(<CommandPalette />);
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();

    openPalette();

    expect(screen.getByRole("combobox", { name: "Search commands and chats" })).toBeInTheDocument();
    expect(screen.getByText("give me list of dca plans using live mode")).toBeInTheDocument();
    expect(screen.getByText("Esc")).toBeInTheDocument();
  });

  it("pins the mobile sheet to visualViewport and hides shortcut chrome", () => {
    stubMatchMedia(true);
    stubVisualViewport(420, 12);
    Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });

    render(<CommandPalette />);
    openPalette();

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveClass("is-mobile");
    expect(dialog).toHaveClass("is-keyboard-open");
    expect(dialog).toHaveStyle({ top: "12px", height: "420px", transform: "none" });
    expect(screen.queryByText("Esc")).not.toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("portals out of the chat shell so overflow:hidden cannot trap the sheet", () => {
    stubMatchMedia(true);
    stubVisualViewport(700, 0);
    render(
      <div className="ais-chat-shell" style={{ overflow: "hidden" }}>
        <CommandPalette />
      </div>,
    );
    openPalette();

    const dialog = screen.getByRole("dialog");
    expect(dialog.closest(".ais-chat-shell")).toBeNull();
  });

  it("closes from the close button", () => {
    stubMatchMedia(true);
    stubVisualViewport(700, 0);
    render(<CommandPalette />);
    openPalette();
    fireEvent.click(screen.getByRole("button", { name: "Close command palette" }));
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });
});
