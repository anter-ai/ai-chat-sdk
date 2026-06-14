import type { RecordTag } from "../utils/record-utils";

export type { RecordTag };

export type MessageRole = "user" | "assistant" | "command";
export type AgentStepType = "reasoning" | "tool_call" | "tool_result" | "handoff" | "retrieval";
export type AgentStepStatus = "in_progress" | "done" | "error";

export interface AgentStepEvent {
  type: AgentStepType;
  label: string;
  detail?: string;
  status: AgentStepStatus;
  step_id: string;
  duration_ms?: number;
  tokens_used?: number;
}

export interface AgentPlanPhase {
  id: string;
  label: string;
}

export interface MessageSource {
  id: string;
  title: string;
  page?: number;
  section?: string;
  snippet?: string;
  content?: string;
  matchText?: string;
  verified?: boolean;
  metadata?: {
    score?: number;
    matchedSnippet?: string;
    verified?: boolean;
    invalidClaims?: string[];
  };
  type?: "document" | "database";
  url?: string;
  retrievalScore?: number;
}

export interface ContextRequiredChoice {
  label: string;
  value: string;
}

export interface ContextRequiredPayload {
  contextKey: string;
  questionIntro: string;
  choices: ContextRequiredChoice[];
}

export type ToolApprovalStatus = "pending" | "approved" | "denied" | "expired" | "canceled";

/**
 * A human-in-the-loop tool approval surfaced by the backend during a streamed
 * run (`tool_approval_request` / `tool_approval_resolved` stream events). The
 * run is paused server-side until the approval is resolved — either through
 * {@link ChatAdapter.resolveToolApproval} or an external channel (in which case
 * the resolution still arrives via the `tool_approval_resolved` event).
 */
export interface ToolApproval {
  approvalId: string;
  toolCallId: string;
  toolName: string;
  args?: unknown;
  /**
   * Backend-defined risk label (e.g. "read_only", "destructive"). Opaque to the
   * SDK — rendered humanized but uninterpreted.
   */
  riskCategory?: string;
  expiresAt?: string;
  status: ToolApprovalStatus;
  /** Deny reason — shown on resolved cards and sent back to the agent. */
  reason?: string | null;
  /** Backend routing context passed through to the adapter when resolving. */
  executionId?: string;
  /** Local resolution failure (adapter rejection); the card stays actionable. */
  error?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: Date;
  sources?: MessageSource[];
  isStreaming?: boolean;
  /** True when the user stopped this response mid-stream (renders a "Stopped" marker). */
  stoppedByUser?: boolean;
  error?: string;
  steps?: AgentStepEvent[];
  plan?: AgentPlanPhase[];
  startedAt?: number;
  elapsedMs?: number;
  artifactIds?: string[];
  suggestions?: string[];
  records?: RecordTag[];
  /** Set on context_required turns — renders as interactive choice chips in the UI. */
  contextRequired?: ContextRequiredPayload;
  /** Pending/resolved HITL tool approvals — render as interactive approval cards. */
  toolApprovals?: ToolApproval[];
}

export interface StreamingState {
  isStreaming: boolean;
  currentMessageId?: string;
  /** Backend execution id of the in-flight run, from the stream's `started` event. */
  executionId?: string;
  error?: string;
}

export interface ComposerAnnouncement {
  id: string;
  type: "info" | "warning" | "success" | "announcement";
  title: string;
  icon?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  position?: "top" | "bottom";
}
