interface SlashCommandMenuProps {
    query: string;
    activeIndex: number;
    onSelect: (value: string) => void;
    onActiveIndexChange: (index: number) => void;
    onItemsChange: (items: string[]) => void;
    onClose: () => void;
}
export declare function SlashCommandMenu({ query, activeIndex, onSelect, onActiveIndexChange, onItemsChange, onClose, }: SlashCommandMenuProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=slash-command-menu.d.ts.map