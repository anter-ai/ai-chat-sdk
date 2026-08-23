import type { Session } from "../types/session";
export declare function useConversationHistory(): {
    sessions: Session[];
    isLoading: boolean;
    refresh: () => Promise<void>;
    deleteSession: (sessionId: string) => Promise<void>;
};
//# sourceMappingURL=use-conversation-history.d.ts.map