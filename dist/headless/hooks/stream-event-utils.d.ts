import type { AgentStepEvent, ToolApproval, ToolApprovalStatus } from "../types/chat";
export interface StreamEventShape {
    content?: string;
    error?: string;
    message?: string;
    event?: string;
    type?: string;
    payload?: Record<string, unknown>;
}
export declare function resolveEventType(transportEvent: string | undefined, parsed: StreamEventShape): string;
export declare function extractContent(parsed: StreamEventShape): string;
export declare function extractError(parsed: StreamEventShape): string | undefined;
/**
 * The agent-runner stream emits "control" events distinct from text content:
 *   - single-agent (data.type): thought, tool_call, tool_result, status
 *   - multi-agent (transport event name): handoff, agent_step_started, delegation_return
 * These must never be accumulated as visible message content (notably `thought`,
 * whose payload.text is the model's reasoning). They are surfaced as step chips instead.
 */
export declare function isRunnerControlEvent(eventType: string): boolean;
/** True when a runner `status` event signals the run has completed. */
export declare function isRunnerCompletion(eventType: string, parsed: StreamEventShape): boolean;
/**
 * Translate a runner control event into a chat step chip, or null when the event
 * produces no visible step (status:completed, agent_step_started, delegation_return).
 *
 * `stepSeq` is a per-stream counter used to give repeatable events (tool calls,
 * handoffs) unique step ids. Reasoning ("Thinking…") uses a stable id so repeated
 * reasoning deltas collapse into a single step rather than flooding the timeline.
 */
export declare function runnerEventToStep(eventType: string, parsed: StreamEventShape, stepSeq: number): AgentStepEvent | null;
/** Whether a runner step type uses a stable id (collapses) vs. a per-occurrence id. */
export declare function runnerStepConsumesSeq(eventType: string): boolean;
/**
 * Parse a `tool_approval_request` frame into a pending {@link ToolApproval},
 * or null when the payload is malformed. The runner emits these as data-only
 * frames: `{ type: "tool_approval_request", payload: { approvalId, toolCallId,
 * toolName, args, riskCategory, expiresAt, executionId, … } }`.
 */
export declare function toolApprovalFromRequestEvent(parsed: StreamEventShape): ToolApproval | null;
export interface ToolApprovalResolution {
    approvalId: string;
    status: ToolApprovalStatus;
    reason: string | null;
}
/**
 * Parse a `tool_approval_resolved` frame (`payload.decision` carries the final
 * status, `payload.reason` an optional deny reason). A "timeout" decision maps
 * to "expired"; unknown decisions map to "canceled" so the card never sticks
 * in a pending state after resolution.
 */
export declare function toolApprovalResolutionFromEvent(parsed: StreamEventShape): ToolApprovalResolution | null;
//# sourceMappingURL=stream-event-utils.d.ts.map