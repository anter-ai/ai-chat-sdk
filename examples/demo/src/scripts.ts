import type { MessageSource } from "@anter/ai-chat-sdk";
import {
  APPROVAL_DENIED,
  APPROVAL_DONE,
  APPROVAL_INTRO,
  ARTIFACT_ANSWER,
  BRIEF_SOURCE,
  DEFAULT_ANSWER,
  NOTES_SOURCE,
  SOURCES_ANSWER,
} from "./fixtures";

export type ScriptKind = "default" | "sources" | "artifact" | "approval";

export interface SseFrame {
  event: string;
  data: Record<string, unknown>;
}

export function scriptForPrompt(message: string): ScriptKind {
  const text = message.toLowerCase();
  if (/\bapprov\w*\b|\btool action\b|\btool\b/.test(text)) return "approval";
  if (/\b(outline|draft|artifact)\b/.test(text)) return "artifact";
  if (/\b(sources|source|citations|citation|cite)\b/.test(text)) return "sources";
  return "default";
}

function chunkText(text: string): string[] {
  const words = text.split(" ");
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += 6) {
    const piece = words.slice(i, i + 6).join(" ");
    chunks.push(i + 6 < words.length ? `${piece} ` : piece);
  }
  return chunks.length > 0 ? chunks : [text];
}

function contentFrames(text: string): SseFrame[] {
  return chunkText(text).map((chunk) => ({ event: "content", data: { content: chunk } }));
}

function doneFrame(sources?: MessageSource[]): SseFrame {
  return {
    event: "done",
    data: {
      isComplete: true,
      ...(sources ? { sources } : {}),
    },
  };
}

export interface ScriptStream {
  before: SseFrame[];
  approvalId?: string;
  after: (decision: "approved" | "denied") => SseFrame[];
  assistantContent: (decision: "approved" | "denied" | "none") => string;
  sources?: MessageSource[];
}

export function buildScript(
  kind: ScriptKind,
  executionId: string,
  approvalId: string,
): ScriptStream {
  const started: SseFrame = { event: "started", data: { executionId } };

  if (kind === "sources") {
    const sources = [BRIEF_SOURCE, NOTES_SOURCE];
    return {
      before: [started, ...contentFrames(SOURCES_ANSWER), doneFrame(sources)],
      after: () => [],
      assistantContent: () => SOURCES_ANSWER,
      sources,
    };
  }

  if (kind === "artifact") {
    return {
      before: [started, ...contentFrames(ARTIFACT_ANSWER), doneFrame()],
      after: () => [],
      assistantContent: () => ARTIFACT_ANSWER,
    };
  }

  if (kind === "approval") {
    return {
      before: [
        started,
        ...contentFrames(APPROVAL_INTRO),
        {
          event: "tool_approval_request",
          data: {
            payload: {
              approvalId,
              toolCallId: "call-1",
              toolName: "publish_note",
              args: { title: "Weekly outline" },
              riskCategory: "write",
              executionId,
            },
          },
        },
      ],
      approvalId,
      after: (decision) => [
        {
          event: "tool_approval_resolved",
          data: { payload: { approvalId, decision } },
        },
        ...contentFrames(decision === "approved" ? APPROVAL_DONE : APPROVAL_DENIED),
        doneFrame(),
      ],
      assistantContent: (decision) =>
        `${APPROVAL_INTRO}\n\n${decision === "denied" ? APPROVAL_DENIED : APPROVAL_DONE}`,
    };
  }

  return {
    before: [started, ...contentFrames(DEFAULT_ANSWER), doneFrame()],
    after: () => [],
    assistantContent: () => DEFAULT_ANSWER,
  };
}
