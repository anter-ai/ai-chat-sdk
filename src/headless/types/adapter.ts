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

export interface ChatAdapter {
  createSession(config: SessionConfig): Promise<string>;
  loadSession(sessionId: string): Promise<SessionWithMessages>;
  listSessions(params?: ListParams): Promise<SessionList>;
  updateSession(sessionId: string, patch: SessionPatch): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
  sendMessage(payload: MessagePayload): Promise<ReadableStream<Uint8Array>>;
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
}
