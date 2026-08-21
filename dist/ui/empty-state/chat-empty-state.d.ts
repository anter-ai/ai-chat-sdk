import React from "react";
export interface StarterCard {
    /** A React node rendered as the card icon (e.g. a Lucide icon component). */
    icon: React.ReactNode;
    iconColor: string;
    title: string;
    description: string;
    prompt: string;
}
interface ChatEmptyStateProps {
    onSendMessage: (message: string) => void;
    starterCards?: StarterCard[];
    heading?: string;
    subheading?: string;
}
export declare function ChatEmptyState({ onSendMessage, starterCards, heading, subheading, }: ChatEmptyStateProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=chat-empty-state.d.ts.map