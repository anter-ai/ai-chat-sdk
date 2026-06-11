"use client";

import React from "react";
import type { ToolApproval } from "../../headless/types/chat";
import { defaultStrings, type ChatStrings } from "../../headless/types/config";

type ApprovalStrings = Pick<
  ChatStrings,
  | "approvalTitle"
  | "approvalApprove"
  | "approvalDeny"
  | "approvalConfirmDeny"
  | "approvalDenyReasonPlaceholder"
  | "approvalWaiting"
  | "approvalApproved"
  | "approvalDenied"
  | "approvalExpired"
  | "approvalCanceled"
  | "cancel"
>;

interface ToolApprovalCardProps {
  approval: ToolApproval;
  /** False when the adapter has no resolveToolApproval — renders a passive card. */
  canResolve: boolean;
  onResolve: (
    approval: ToolApproval,
    decision: "approved" | "denied",
    reason?: string,
  ) => void | Promise<void>;
  strings?: Partial<ApprovalStrings>;
}

/** Backend risk labels are opaque snake_case strings — display them humanized. */
function humanizeRisk(riskCategory: string): string {
  return riskCategory.replace(/_/g, " ");
}

function formatArgs(args: unknown): string | null {
  if (args === undefined || args === null) return null;
  try {
    return typeof args === "string" ? args : JSON.stringify(args, null, 2);
  } catch {
    return null;
  }
}

export function ToolApprovalCard({
  approval,
  canResolve,
  onResolve,
  strings = {},
}: ToolApprovalCardProps) {
  const t: ApprovalStrings = { ...defaultStrings, ...strings };
  const [denying, setDenying] = React.useState(false);
  const [denyReason, setDenyReason] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const isPending = approval.status === "pending";
  const argsText = formatArgs(approval.args);

  const submit = async (decision: "approved" | "denied", reason?: string) => {
    setSubmitting(true);
    try {
      await onResolve(approval, decision, reason);
    } finally {
      setSubmitting(false);
      setDenying(false);
      setDenyReason("");
    }
  };

  const statusLabel: Record<ToolApproval["status"], string> = {
    pending: t.approvalTitle,
    approved: t.approvalApproved,
    denied: t.approvalDenied,
    expired: t.approvalExpired,
    canceled: t.approvalCanceled,
  };

  return (
    <div
      className={`ais-tool-approval-card ais-tool-approval--${approval.status}`}
      role="group"
      aria-label={`${t.approvalTitle}: ${approval.toolName}`}
      data-testid={`tool-approval-${approval.approvalId}`}
    >
      <div className="ais-tool-approval-header">
        <span className="ais-tool-approval-status">{statusLabel[approval.status]}</span>
        <code className="ais-tool-approval-tool">{approval.toolName}</code>
        {approval.riskCategory ? (
          <span className="ais-tool-approval-risk">{humanizeRisk(approval.riskCategory)}</span>
        ) : null}
      </div>

      {argsText ? <pre className="ais-tool-approval-args">{argsText}</pre> : null}

      {!isPending && approval.status === "denied" && approval.reason ? (
        <p className="ais-tool-approval-reason">“{approval.reason}”</p>
      ) : null}

      {isPending && approval.error ? (
        <p className="ais-tool-approval-error">{approval.error}</p>
      ) : null}

      {isPending && !canResolve ? (
        <p className="ais-tool-approval-waiting">{t.approvalWaiting}</p>
      ) : null}

      {isPending && canResolve && !denying ? (
        <div className="ais-tool-approval-actions">
          <button
            type="button"
            className="ais-tool-approval-btn ais-tool-approval-btn--approve"
            disabled={submitting}
            onClick={() => void submit("approved")}
          >
            {t.approvalApprove}
          </button>
          <button
            type="button"
            className="ais-tool-approval-btn ais-tool-approval-btn--deny"
            disabled={submitting}
            onClick={() => setDenying(true)}
          >
            {t.approvalDeny}
          </button>
        </div>
      ) : null}

      {isPending && canResolve && denying ? (
        <div className="ais-tool-approval-deny-form">
          <textarea
            className="ais-tool-approval-reason-input"
            placeholder={t.approvalDenyReasonPlaceholder}
            value={denyReason}
            rows={2}
            maxLength={512}
            disabled={submitting}
            onChange={(e) => setDenyReason(e.target.value)}
          />
          <div className="ais-tool-approval-actions">
            <button
              type="button"
              className="ais-tool-approval-btn ais-tool-approval-btn--deny"
              disabled={submitting}
              onClick={() => void submit("denied", denyReason.trim() || undefined)}
            >
              {t.approvalConfirmDeny}
            </button>
            <button
              type="button"
              className="ais-tool-approval-btn"
              disabled={submitting}
              onClick={() => {
                setDenying(false);
                setDenyReason("");
              }}
            >
              {t.cancel}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
