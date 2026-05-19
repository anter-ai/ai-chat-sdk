import { getSlashCommandRegistry, registerSlashCommand } from "./slash-command-registry";

describe("SlashCommandRegistry", () => {
  it("should return /help builtin by default", () => {
    const registry = getSlashCommandRegistry();
    expect(registry.some((r) => r.name === "/help")).toBe(true);
  });

  it("should not include domain-specific builtins", () => {
    const registry = getSlashCommandRegistry();
    expect(registry.some((r) => r.name === "/gap")).toBe(false);
    expect(registry.some((r) => r.name === "/risk")).toBe(false);
  });

  it("should register a new command", () => {
    const newCommand = {
      name: "/test-unique",
      description: "Test command",
      slashCommandId: "test-unique",
      onSelect: jest.fn(),
    };
    registerSlashCommand(newCommand);
    const registry = getSlashCommandRegistry();
    expect(registry.some((r) => r.name === "/test-unique")).toBe(true);
  });

  it("should not register duplicate commands", () => {
    const initialCount = getSlashCommandRegistry().length;
    registerSlashCommand({
      name: "/help",
      description: "Duplicate help",
      slashCommandId: "help",
      onSelect: jest.fn(),
    });
    expect(getSlashCommandRegistry().length).toBe(initialCount);
  });
});
