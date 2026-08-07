export interface RegisteredSlashCommand {
    name: string;
    description: string;
    slashCommandId: string;
    exampleUsage?: string;
    onSelect: (composerApi: {
        setValue: (v: string) => void;
        submit: (v?: string) => void;
    }) => void;
}
export declare function registerSlashCommand(command: RegisteredSlashCommand): void;
export declare function getSlashCommandRegistry(): RegisteredSlashCommand[];
//# sourceMappingURL=slash-command-registry.d.ts.map