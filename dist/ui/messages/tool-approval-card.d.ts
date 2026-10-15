import type { ToolApproval } from "../../headless/types/chat";
import { type ChatStrings } from "../../headless/types/config";
type ApprovalStrings = Pick<ChatStrings, "approvalTitle" | "approvalApprove" | "approvalDeny" | "approvalConfirmDeny" | "approvalDenyReasonPlaceholder" | "approvalWaiting" | "approvalApproved" | "approvalDenied" | "approvalExpired" | "approvalCanceled" | "cancel">;
interface ToolApprovalCardProps {
    approval: ToolApproval;
    /** False when the adapter has no resolveToolApproval — renders a passive card. */
    canResolve: boolean;
    onResolve: (approval: ToolApproval, decision: "approved" | "denied", reason?: string) => void | Promise<void>;
    strings?: Partial<ApprovalStrings>;
}
export declare function ToolApprovalCard({ approval, canResolve, onResolve, strings, }: ToolApprovalCardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=tool-approval-card.d.ts.map