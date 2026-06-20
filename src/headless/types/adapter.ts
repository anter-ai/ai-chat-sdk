import type { ToolApproval } from "./chat";
import type { Session, SessionWithMessages } from "./session";

export interface SessionConfig {
  organizationId: string;
  contextId?: string;
  model?: string;
  title?: string;
}

export interface SessionPatch {
  title?: string;
  status?: "active" | "archived";
}

export interface ListParams {
  page?: number;
  limit?: number;
}

export interface SessionList {
  sessions: Session[];
  total: number;
  page: number;
}

export interface MessagePayload {
  organizationId: string;
  sessionId: string;
  message: string;
  attachedFileIds?: string[];
  contextVariables?: Record<string, string>;
}

export interface ChatSessionFileRef {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  status: "uploaded" | "processed" | "error";
  /**
   * Legacy direct download URL (e.g. a presigned link). A direct URL is a bearer
   * link — anyone with it can open the file outside the authenticated app for its
   * lifetime. Prefer implementing {@link ChatAdapter.downloadFile} and leaving this
   * empty (`""`); the UI uses the adapter method when available and only falls back
   * to this URL otherwise.
   */
  downloadUrl: string;
  createdAt?: string;
}

export interface UploadFileOptions {
  parseAsQuestionnaire?: boolean;
}

export interface SendMessageOptions {
  /**
   * Abort signal for the streaming request. Hosts should pass it to their
   * fetch call so the Stop button can actually terminate the network stream.
   */
  signal?: AbortSignal;
}

export interface CancelRunInput {
  sessionId: string;
  /** Backend execution id, captured from the stream's `started` event. */
  executionId: string;
}

export interface ResolveToolApprovalInput {
  sessionId: string;
  /** The approval being resolved — carries the backend routing context (executionId, toolCallId). */
  approval: ToolApproval;
  decision: "approved" | "denied";
  /** Optional deny reason, fed back to the agent as part of the tool result. */
  reason?: string;
}

export interface ChatAdapter {
  createSession(config: SessionConfig): Promise<string>;
  loadSession(sessionId: string): Promise<SessionWithMessages>;
  listSessions(params?: ListParams): Promise<SessionList>;
  updateSession(sessionId: string, patch: SessionPatch): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
  sendMessage(
    payload: MessagePayload,
    options?: SendMessageOptions,
  ): Promise<ReadableStream<Uint8Array>>;
  loadSlashCommands?(): Promise<void>;
  uploadFile?(
    sessionId: string,
    file: File,
    options?: UploadFileOptions,
  ): Promise<ChatSessionFileRef>;
  listSessionFiles?(sessionId: string): Promise<ChatSessionFileRef[]>;
  deleteSessionFile?(sessionId: string, fileId: string): Promise<void>;
  /**
   * Fetch the raw bytes of a session file through the host backend, authenticated
   * however the host authenticates. When implemented, the UI uses this instead of
   * {@link ChatSessionFileRef.downloadUrl}, so the host never has to hand the browser
   * a directly fetchable/presigned URL. Returns the file as a `Blob`.
   */
  downloadFile?(sessionId: string, fileId: string): Promise<Blob>;
  /**
   * Resolve a pending HITL tool approval (`tool_approval_request` stream event)
   * against the host backend. When implemented, approval cards render
   * Approve/Deny actions; when absent, the cards are passive ("waiting for
   * approval") and resolution must happen through another channel. Rejections
   * are surfaced on the card and the approval stays actionable.
   */
  resolveToolApproval?(input: ResolveToolApprovalInput): Promise<void>;
  /**
   * Cancel the running execution on the backend (the Stop button). When
   * implemented, stopping a response cancels the server-side run — sub-agents
   * halt and the execution is recorded as `canceled`. When absent, stopping
   * only aborts the client stream; the server notices the disconnect and
   * cancels on its own.
   */
  cancelRun?(input: CancelRunInput): Promise<void>;
  getExecutionStream?(
    executionId: string,
    resumeFrom?: number,
    options?: SendMessageOptions,
  ): Promise<ReadableStream<Uint8Array>>;
  /**
   * Continue a crashed run from its last server-side checkpoint (the "Resume" button),
   * streaming the remainder. Distinct from {@link getExecutionStream}, which only
   * replays/reconnects to a run whose state still exists in-process. When the run turns
   * out not to be resumable the host backend answers non-2xx (e.g. a 409 telling the
   * client to retry); the adapter MUST reject so the UI can fall back to a fresh retry.
   */
  resumeExecution?(
    executionId: string,
    options?: SendMessageOptions,
  ): Promise<ReadableStream<Uint8Array>>;
}
