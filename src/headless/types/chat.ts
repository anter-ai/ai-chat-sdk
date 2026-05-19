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

export interface ChatMessage {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: Date;
  sources?: MessageSource[];
  isStreaming?: boolean;
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
}

export interface StreamingState {
  isStreaming: boolean;
  currentMessageId?: string;
  error?: string;
}

export interface ComposerAnnouncement {
  id: string;
  type: "info" | "warning" | "success" | "announcement";
  title: string;
  icon?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}
