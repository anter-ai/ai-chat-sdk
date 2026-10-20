import React from "react";
import type { ContextRequiredPayload } from "../../headless/types/chat";
interface ContextRequiredChipsProps {
    contextRequired: ContextRequiredPayload;
    onSelect: (label: string) => void;
}
export declare function ContextRequiredChips({ contextRequired, onSelect }: ContextRequiredChipsProps): React.JSX.Element;
export {};
//# sourceMappingURL=context-required-chips.d.ts.map