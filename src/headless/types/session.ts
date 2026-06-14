import type { ChatMessage } from "./chat";
import type { Artifact } from "./artifact";

export interface Session {
  sessionId: string;
  title: string;
  updatedAt: string;
  status?: "active" | "archived";
  contextId?: string;
  model?: string;
  activeExecutionId?: string | null;
}

export interface SessionWithMessages extends Session {
  messages: ChatMessage[];
  artifacts?: Artifact[];
}
