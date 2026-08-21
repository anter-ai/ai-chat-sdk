import type { MessageSource } from "../types/chat";
export interface SourcesPanelState {
    isOpen: boolean;
    scrollToIndex?: number;
}
export interface UseSourcesReturn {
    activeSources: MessageSource[];
    activeMessageId?: string;
    panelState: SourcesPanelState;
    openSources: (messageId: string, sources: MessageSource[], scrollToIndex?: number) => void;
    closeSources: () => void;
}
export declare function useSources(): UseSourcesReturn;
//# sourceMappingURL=use-sources.d.ts.map