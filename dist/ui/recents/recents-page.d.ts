import React from "react";
export interface RecentsPageProps {
    onSelectSession?: () => void;
    onNewConversation?: () => void;
    headerBackground?: string;
    emptyStateDescription?: string;
    renderEmptyState?: () => React.ReactNode;
}
export declare function RecentsPage({ onSelectSession, onNewConversation, headerBackground, emptyStateDescription, renderEmptyState, }: RecentsPageProps): React.JSX.Element;
//# sourceMappingURL=recents-page.d.ts.map