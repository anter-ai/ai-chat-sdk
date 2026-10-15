import type { MessageSource } from "../../headless/types/chat";
export interface CitationModalProps {
    source: MessageSource | null;
    onClose: () => void;
    className?: string;
    container?: HTMLElement | null;
}
export declare function CitationModal({ source, onClose, className, container }: CitationModalProps): import("react/jsx-runtime").JSX.Element | null;
//# sourceMappingURL=citation-modal.d.ts.map