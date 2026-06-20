import type { ChatMessage } from "./chat";
import type { Artifact } from "./artifact";

/**
 * Resume affordance hint computed by the host backend for the most recent run of a
 * session. Drives the composer's Resume/Retry control:
 *  - `live`      — a run is in flight; reconnect via `activeExecutionId`.
 *  - `resumable` — the latest run crashed but can be continued from a checkpoint
 *                  (`resumableExecutionId` → `adapter.resumeExecution`).
 *  - `retry`     — the latest run crashed with nothing to resume; re-send the last turn.
 *  - `null`      — nothing to resume (completed/canceled/none).
 */
export type ResumeState = "live" | "resumable" | "retry" | null;

export interface Session {
  sessionId: string;
  title: string;
  updatedAt: string;
  status?: "active" | "archived";
  contextId?: string;
  model?: string;
  activeExecutionId?: string | null;
  resumeState?: ResumeState;
  resumableExecutionId?: string | null;
}

export interface SessionWithMessages extends Session {
  messages: ChatMessage[];
  artifacts?: Artifact[];
}
