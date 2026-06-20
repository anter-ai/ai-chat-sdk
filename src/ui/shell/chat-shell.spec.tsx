import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ChatProvider } from "../../headless/context/chat-provider";
import { ChatShell } from "./chat-shell";

jest.mock("../../headless/hooks/use-chat", () => ({
  ChatStateProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useChat: () => ({
    sendMessage: jest.fn(),
    isStreaming: false,
    clearMessages: jest.fn(),
    loadSession: jest.fn(),
    adapter: { loadSession: jest.fn() },
    currentSessionId: undefined,
    currentSessionTitle: "New session",
  }),
}));

jest.mock("../../headless/hooks/use-artifacts", () => ({
  useArtifacts: () => ({
    // The real hook always returns `artifacts` as a Map; ChatShellContent reads
    // `artifacts.size` for the header count, so the mock must include it.
    artifacts: new Map(),
    registerArtifacts: jest.fn(),
    panelState: { isOpen: false },
  }),
}));

jest.mock("../../headless/hooks/use-sources", () => ({
  useSources: () => ({
    panelState: { isOpen: false },
  }),
}));

jest.mock("../../headless/hooks/use-session-files", () => ({
  useSessionFiles: () => ({
    files: [],
    panelOpen: false,
    openPanel: jest.fn(),
    closePanel: jest.fn(),
  }),
}));

jest.mock("../artifact-panel/artifact-panel", () => ({
  ArtifactPanel: () => null,
}));

jest.mock("../sources-panel/sources-panel", () => ({
  SourcesPanel: () => null,
}));

jest.mock("../files-panel/files-panel", () => ({
  FilesPanel: () => null,
}));

jest.mock("./chat-shell-header", () => ({
  ChatShellHeader: () => null,
}));

jest.mock("../command-palette/command-palette", () => ({
  CommandPalette: () => null,
}));

jest.mock("../messages/chat-messages", () => ({
  ChatMessages: () => <div data-testid="chat-messages" />,
}));

jest.mock("../sidebar/chat-sidebar", () => ({
  ChatSidebar: () => null,
}));

jest.mock("../recents/recents-page", () => ({
  RecentsPage: () => null,
}));

jest.mock("../primitives/resizable-handle", () => ({
  ResizablePanelGroup: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ResizablePanel: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ResizableHandle: () => null,
}));

describe("ChatShell banner slots", () => {
  it("renders host-provided composerTopBanner", () => {
    render(
      <ChatProvider
        adapter={
          {
            createSession: jest.fn(),
            listSessions: jest.fn().mockResolvedValue([]),
            loadSession: jest.fn(),
            sendMessage: jest.fn(),
          } as any
        }
        organizationId="org-1"
        plugins={{
          composerTopBanner: {
            id: "notify-banner",
            type: "announcement",
            title: "Want to be notified when the AI responds?",
            dismissible: true,
          },
        }}
        config={{ enableFileUpload: false, enableCommandPalette: false }}
      >
        <ChatShell />
      </ChatProvider>,
    );

    expect(screen.getByText("Want to be notified when the AI responds?")).toBeInTheDocument();
  });
});
