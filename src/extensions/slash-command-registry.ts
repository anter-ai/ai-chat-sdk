export interface RegisteredSlashCommand {
  name: string;
  description: string;
  slashCommandId: string;
  exampleUsage?: string;
  onSelect: (composerApi: { setValue: (v: string) => void; submit: (v?: string) => void }) => void;
}

const builtins: RegisteredSlashCommand[] = [
  {
    name: "/help",
    description: "Show available commands",
    slashCommandId: "help",
    exampleUsage: "/help",
    onSelect: ({ setValue, submit }) => {
      setValue("/help");
      submit("/help");
    },
  },
];

const registry: RegisteredSlashCommand[] = [...builtins];

export function registerSlashCommand(command: RegisteredSlashCommand): void {
  if (!registry.find((r) => r.name === command.name)) {
    registry.push(command);
  }
}

export function getSlashCommandRegistry(): RegisteredSlashCommand[] {
  return registry;
}
