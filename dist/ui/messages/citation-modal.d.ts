import React from "react";
import type { MessageSource } from "../../headless/types/chat";
export interface CitationModalProps {
    source: MessageSource | null;
    onClose: () => void;
    className?: string;
    container?: HTMLElement | null;
}
export declare function CitationModal({ source, onClose, className, container }: CitationModalProps): React.JSX.Element | null;
//# sourceMappingURL=citation-modal.d.ts.map