import type { MentionTarget } from "../../headless/types/chat";
interface MentionMenuProps {
    query: string;
    activeIndex: number;
    provider?: (query: string) => MentionTarget[] | Promise<MentionTarget[]>;
    onSelect: (target: MentionTarget) => void;
    onActiveIndexChange: (index: number) => void;
    onItemsChange: (items: MentionTarget[]) => void;
    onClose: () => void;
}
export declare function MentionMenu({ query, activeIndex, provider, onSelect, onActiveIndexChange, onItemsChange, onClose, }: MentionMenuProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=mention-menu.d.ts.map