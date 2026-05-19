import type { ChatMessage } from "./chat";
import type { Artifact } from "./artifact";

export interface Session {
  sessionId: string;
  title: string;
  updatedAt: string;
  status?: "active" | "archived";
  contextId?: string;
  model?: string;
}

export interface SessionWithMessages extends Session {
  messages: ChatMessage[];
  artifacts?: Artifact[];
}
