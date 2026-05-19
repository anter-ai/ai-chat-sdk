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
}
