import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { ChatComposer } from "./chat-composer";
import { useChatContext } from "../../headless/context/chat-provider";
import { defaultStrings } from "../../headless/types/config";
import { registerSlashCommand } from "../../extensions/slash-command-registry";
import "@testing-library/jest-dom";

jest.mock("../../headless/context/chat-provider", () => ({
  useChatContext: jest.fn(),
}));

describe("ChatComposer", () => {
  const mockOnSendMessage = jest.fn();
  const mockOnStop = jest.fn();
  const mockConfig = { enableSlashCommands: true };

  beforeEach(() => {
    mockOnSendMessage.mockReset();
    mockOnStop.mockReset();
    (useChatContext as jest.Mock).mockReturnValue({
      config: mockConfig,
      strings: defaultStrings,
      currentSession: null,
      activeContextId: undefined,
      activeContextLabel: undefined,
      setActiveContext: jest.fn(),
      topBanner: null,
      setTopBanner: jest.fn(),
      bottomBanner: null,
      setBottomBanner: jest.fn(),
      announcement: null,
      setAnnouncement: jest.fn(),
      plugins: {},
      adapter: {
        uploadFile: undefined,
        deleteSessionFile: undefined,
        createSession: jest.fn(),
      },
      organizationId: "org-123",
      contextReferences: [],
    });
  });

  it("renders correctly with generic placeholder", () => {
    render(<ChatComposer onSendMessage={mockOnSendMessage} />);
    expect(screen.getByPlaceholderText(defaultStrings.composerPlaceholder)).toBeInTheDocument();
  });

  it("shows slash menu when typing / and enabled", () => {
    render(<ChatComposer onSendMessage={mockOnSendMessage} />);
    const textarea = screen.getByPlaceholderText(defaultStrings.composerPlaceholder);
    fireEvent.change(textarea, { target: { value: "/" } });
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("does not show slash menu when typing / and disabled", () => {
    (useChatContext as jest.Mock).mockReturnValue({
      config: { enableSlashCommands: false },
      strings: defaultStrings,
      currentSession: null,
      activeContextId: undefined,
      activeContextLabel: undefined,
      setActiveContext: jest.fn(),
      topBanner: null,
      setTopBanner: jest.fn(),
      bottomBanner: null,
      setBottomBanner: jest.fn(),
      announcement: null,
      setAnnouncement: jest.fn(),
      plugins: {},
      adapter: {
        uploadFile: undefined,
        deleteSessionFile: undefined,
        createSession: jest.fn(),
      },
      organizationId: "org-123",
      contextReferences: [],
    });
    render(<ChatComposer onSendMessage={mockOnSendMessage} />);
    const textarea = screen.getByPlaceholderText(defaultStrings.composerPlaceholder);
    fireEvent.change(textarea, { target: { value: "/" } });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("calls onSendMessage on enter", () => {
    render(<ChatComposer onSendMessage={mockOnSendMessage} />);
    const textarea = screen.getByPlaceholderText(defaultStrings.composerPlaceholder);
    fireEvent.change(textarea, { target: { value: "Hello" } });
    fireEvent.keyDown(textarea, { key: "Enter", code: "Enter" });
    expect(mockOnSendMessage).toHaveBeenCalledWith("Hello", undefined);
  });

  it("closes the menu when a priming-only command is selected, so the next Enter submits", () => {
    // A command whose onSelect only primes the input (no submit). Selecting it must close
    // the menu; otherwise the next Enter would re-select instead of submitting (Bug 2).
    registerSlashCommand({
      name: "/prime",
      description: "primes input only",
      slashCommandId: "prime",
      exampleUsage: "/prime",
      onSelect: ({ setValue }) => setValue("/prime"),
    });
    render(<ChatComposer onSendMessage={mockOnSendMessage} />);
    const textarea = screen.getByPlaceholderText(defaultStrings.composerPlaceholder);
    fireEvent.change(textarea, { target: { value: "/prime" } });
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    // First Enter selects the command: menu closes, input primed, nothing sent yet.
    fireEvent.keyDown(textarea, { key: "Enter", code: "Enter" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(mockOnSendMessage).not.toHaveBeenCalled();

    // Second Enter submits the primed command.
    fireEvent.keyDown(textarea, { key: "Enter", code: "Enter" });
    expect(mockOnSendMessage).toHaveBeenCalledWith("/prime", undefined);
  });

  it("accepts the highlighted slash command on Tab", () => {
    render(<ChatComposer onSendMessage={mockOnSendMessage} />);
    const textarea = screen.getByPlaceholderText(defaultStrings.composerPlaceholder);
    fireEvent.change(textarea, { target: { value: "/help" } });
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    // Tab accepts the highlighted `/help` command without submitting (sets the value
    // and keeps focus in the textarea).
    fireEvent.keyDown(textarea, { key: "Tab", code: "Tab" });
    expect(textarea).toHaveValue("/help");
    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it("closes slash menu on Escape", () => {
    render(<ChatComposer onSendMessage={mockOnSendMessage} />);
    const textarea = screen.getByPlaceholderText(defaultStrings.composerPlaceholder);
    fireEvent.change(textarea, { target: { value: "/" } });
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.keyDown(textarea, { key: "Escape", code: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("renders Stop button while streaming and calls onStop", () => {
    render(<ChatComposer onSendMessage={mockOnSendMessage} isStreaming onStop={mockOnStop} />);
    const stopButton = screen.getByRole("button", { name: "Stop response" });
    expect(stopButton).toBeInTheDocument();
    fireEvent.click(stopButton);
    expect(mockOnStop).toHaveBeenCalledTimes(1);
  });

  describe("tools and voice input controls", () => {
    it("renders Tools button by default", () => {
      render(<ChatComposer onSendMessage={mockOnSendMessage} />);
      expect(screen.getByRole("button", { name: "Tools" })).toBeInTheDocument();
    });

    it("does not render Tools button when enableTools is false in config", () => {
      (useChatContext as jest.Mock).mockReturnValueOnce({
        config: { ...mockConfig, enableTools: false },
        strings: defaultStrings,
        currentSession: null,
        activeContextId: undefined,
        activeContextLabel: undefined,
        setActiveContext: jest.fn(),
        topBanner: null,
        setTopBanner: jest.fn(),
        bottomBanner: null,
        setBottomBanner: jest.fn(),
        announcement: null,
        setAnnouncement: jest.fn(),
        plugins: {},
        adapter: { createSession: jest.fn() },
        organizationId: "org-123",
        contextReferences: [],
      });
      render(<ChatComposer onSendMessage={mockOnSendMessage} />);
      expect(screen.queryByRole("button", { name: "Tools" })).not.toBeInTheDocument();
    });

    it("does not render Tools button when enableTools={false} prop is passed", () => {
      render(<ChatComposer onSendMessage={mockOnSendMessage} enableTools={false} />);
      expect(screen.queryByRole("button", { name: "Tools" })).not.toBeInTheDocument();
    });

    it("renders Voice button by default when not streaming", () => {
      render(<ChatComposer onSendMessage={mockOnSendMessage} />);
      expect(screen.getByRole("button", { name: /Voice input/i })).toBeInTheDocument();
    });

    it("does not render Voice button when enableVoiceInput is false in config", () => {
      (useChatContext as jest.Mock).mockReturnValueOnce({
        config: { ...mockConfig, enableVoiceInput: false },
        strings: defaultStrings,
        currentSession: null,
        activeContextId: undefined,
        activeContextLabel: undefined,
        setActiveContext: jest.fn(),
        topBanner: null,
        setTopBanner: jest.fn(),
        bottomBanner: null,
        setBottomBanner: jest.fn(),
        announcement: null,
        setAnnouncement: jest.fn(),
        plugins: {},
        adapter: { createSession: jest.fn() },
        organizationId: "org-123",
        contextReferences: [],
      });
      render(<ChatComposer onSendMessage={mockOnSendMessage} />);
      expect(screen.queryByRole("button", { name: /Voice input/i })).not.toBeInTheDocument();
    });

    it("does not render Voice button when enableVoiceInput={false} prop is passed", () => {
      render(<ChatComposer onSendMessage={mockOnSendMessage} enableVoiceInput={false} />);
      expect(screen.queryByRole("button", { name: /Voice input/i })).not.toBeInTheDocument();
    });

    it("renders Stop button while streaming even if enableVoiceInput is false", () => {
      render(
        <ChatComposer
          onSendMessage={mockOnSendMessage}
          isStreaming
          onStop={mockOnStop}
          enableVoiceInput={false}
        />,
      );
      expect(screen.getByRole("button", { name: "Stop response" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Voice input/i })).not.toBeInTheDocument();
    });

    it("renders Send button by default when not streaming", () => {
      render(<ChatComposer onSendMessage={mockOnSendMessage} />);
      expect(screen.getByRole("button", { name: defaultStrings.sendMessage })).toBeInTheDocument();
    });

    it("Send button is disabled when input is empty", () => {
      render(<ChatComposer onSendMessage={mockOnSendMessage} />);
      const sendBtn = screen.getByRole("button", { name: defaultStrings.sendMessage });
      expect(sendBtn).toBeDisabled();
    });

    it("Send button is enabled when input has text", () => {
      render(<ChatComposer onSendMessage={mockOnSendMessage} />);
      const textarea = screen.getByPlaceholderText(defaultStrings.composerPlaceholder);
      fireEvent.change(textarea, { target: { value: "Hello Theo" } });
      const sendBtn = screen.getByRole("button", { name: defaultStrings.sendMessage });
      expect(sendBtn).not.toBeDisabled();
    });

    it("clicking Send button submits the message and clears input", () => {
      render(<ChatComposer onSendMessage={mockOnSendMessage} />);
      const textarea = screen.getByPlaceholderText(defaultStrings.composerPlaceholder);
      fireEvent.change(textarea, { target: { value: "Send this test" } });
      const sendBtn = screen.getByRole("button", { name: defaultStrings.sendMessage });
      fireEvent.click(sendBtn);
      expect(mockOnSendMessage).toHaveBeenCalledWith("Send this test", undefined);
      expect(textarea).toHaveValue("");
    });

    it("does not render Send button when enableSendButton is false in config", () => {
      (useChatContext as jest.Mock).mockReturnValueOnce({
        config: { ...mockConfig, enableSendButton: false },
        strings: defaultStrings,
        currentSession: null,
        activeContextId: undefined,
        activeContextLabel: undefined,
        setActiveContext: jest.fn(),
        topBanner: null,
        setTopBanner: jest.fn(),
        bottomBanner: null,
        setBottomBanner: jest.fn(),
        announcement: null,
        setAnnouncement: jest.fn(),
        plugins: {},
        adapter: { createSession: jest.fn() },
        organizationId: "org-123",
        contextReferences: [],
      });
      render(<ChatComposer onSendMessage={mockOnSendMessage} />);
      expect(screen.queryByRole("button", { name: defaultStrings.sendMessage })).not.toBeInTheDocument();
    });

    it("does not render Send button when enableSendButton={false} prop is passed", () => {
      render(<ChatComposer onSendMessage={mockOnSendMessage} enableSendButton={false} />);
      expect(screen.queryByRole("button", { name: defaultStrings.sendMessage })).not.toBeInTheDocument();
    });

    it("renders Stop button instead of Send button while streaming when onStop is provided", () => {
      render(
        <ChatComposer
          onSendMessage={mockOnSendMessage}
          isStreaming
          onStop={mockOnStop}
        />,
      );
      expect(screen.getByRole("button", { name: "Stop response" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: defaultStrings.sendMessage })).not.toBeInTheDocument();
    });

    it("Send button is disabled while files are actively uploading", async () => {
      let resolveUpload: any;
      const uploadPromise = new Promise((resolve) => {
        resolveUpload = resolve;
      });

      (useChatContext as jest.Mock).mockReturnValue({
        config: { ...mockConfig, enableFileUpload: true },
        strings: defaultStrings,
        currentSession: { sessionId: "session-1" },
        activeContextId: undefined,
        activeContextLabel: undefined,
        setActiveContext: jest.fn(),
        topBanner: null,
        setTopBanner: jest.fn(),
        bottomBanner: null,
        setBottomBanner: jest.fn(),
        announcement: null,
        setAnnouncement: jest.fn(),
        plugins: {},
        adapter: {
          createSession: jest.fn(),
          uploadFile: jest.fn(() => uploadPromise),
        },
        organizationId: "org-123",
        contextReferences: [],
      });

      const { container } = render(<ChatComposer onSendMessage={mockOnSendMessage} />);
      const textarea = screen.getByPlaceholderText(defaultStrings.composerPlaceholder);
      fireEvent.change(textarea, { target: { value: "Message with file" } });

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const testFile = new File(["dummy content"], "test.pdf", { type: "application/pdf" });

      fireEvent.change(fileInput, { target: { files: [testFile] } });

      const sendBtn = screen.getByRole("button", { name: defaultStrings.sendMessage });
      expect(sendBtn).toBeDisabled();

      // Hitting Enter should also not submit while uploading
      fireEvent.keyDown(textarea, { key: "Enter", code: "Enter" });
      expect(mockOnSendMessage).not.toHaveBeenCalled();
    });
  });
});
