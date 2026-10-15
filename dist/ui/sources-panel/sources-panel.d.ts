import React from "react";
import type { UseSourcesReturn } from "../../headless/hooks/use-sources";
import type { MessageSource } from "../../headless/types/chat";
export interface SourcesPanelProps {
    sourcesCtx: UseSourcesReturn;
    className?: string;
    onSourceClick?: (source: MessageSource) => void;
    renderCitationModal?: (source: MessageSource, onClose: () => void) => React.ReactNode;
}
export declare function SourcesPanel({ sourcesCtx, className, onSourceClick, renderCitationModal, }: SourcesPanelProps): import("react/jsx-runtime").JSX.Element | null;
//# sourceMappingURL=sources-panel.d.ts.map