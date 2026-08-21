import type { Session } from "../../headless/types/session";
interface RecentSessionItemProps {
    session: Session;
    isActive?: boolean;
    onClick: () => void;
    onDelete?: (sessionId: string) => void;
    formatDate: (date: string) => string;
    variant?: "list" | "sidebar";
}
export declare function RecentSessionItem({ session, isActive, onClick, onDelete, formatDate, variant, }: RecentSessionItemProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=recent-session-item.d.ts.map