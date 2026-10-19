import type { ChatMessage, MessageSource, ToolApproval } from "@anter/ai-chat-sdk";
import type { SessionWithMessages } from "@anter/ai-chat-sdk";

export const SOURCES_SESSION_ID = "session-sources";
export const ARTIFACT_SESSION_ID = "session-artifact";
export const APPROVAL_SESSION_ID = "session-approval";

export const BRIEF_SOURCE: MessageSource = {
  id: "src-brief",
  title: "Project brief",
  snippet: "Ship a one-page summary of the goals and the open questions.",
  type: "document",
};

export const NOTES_SOURCE: MessageSource = {
  id: "src-notes",
  title: "Meeting notes",
  snippet: "Keep the first version short enough to read in one sitting.",
  type: "document",
};

export const DEFAULT_ANSWER =
  "A useful tradeoff is speed against clarity. A shorter pass ships sooner, and a longer pass is easier for the next person to follow. Start with the short pass, then expand the parts people ask about.";

export const SOURCES_ANSWER =
  'The brief asks for a one-page summary <cite source_id="src-brief">of the goals</cite>. The notes add that the first version should stay short <cite source_id="src-notes">enough to read in one sitting</cite>.';

export const OUTLINE_BODY = `# Project outline

## Goal
A short written overview.

## Steps
1. Gather the notes.
2. Draft the outline.
3. Share it for comments.`;

export const ARTIFACT_ANSWER = `Here is a short outline you can edit.

<artifact type="markdown" title="Project outline">
${OUTLINE_BODY}
</artifact>`;

export const APPROVAL_INTRO =
  "Publishing this note shares it with the workspace. Approve the action to continue.";

export const APPROVAL_DONE = "Published the note to the workspace.";

export const APPROVAL_DENIED = "Left the note unpublished.";

export const SEEDED_APPROVAL: ToolApproval = {
  approvalId: "apr-seed",
  toolCallId: "call-seed",
  toolName: "publish_note",
  args: { title: "Weekly outline" },
  riskCategory: "write",
  status: "pending",
};

function message(
  id: string,
  role: ChatMessage["role"],
  content: string,
  timestamp: string,
  extra?: Pick<ChatMessage, "sources" | "toolApprovals">,
): ChatMessage {
  return {
    id,
    role,
    content,
    timestamp: new Date(timestamp),
    ...extra,
  };
}

export function seededSessions(): SessionWithMessages[] {
  return [
    {
      sessionId: SOURCES_SESSION_ID,
      title: "Project brief",
      updatedAt: "2026-04-03T15:00:00.000Z",
      status: "active",
      messages: [
        message(
          "sources-user",
          "user",
          "Summarize a note and cite the sources",
          "2026-04-03T14:59:00.000Z",
        ),
        message("sources-assistant", "assistant", SOURCES_ANSWER, "2026-04-03T15:00:00.000Z", {
          sources: [BRIEF_SOURCE, NOTES_SOURCE],
        }),
      ],
    },
    {
      sessionId: ARTIFACT_SESSION_ID,
      title: "Project outline",
      updatedAt: "2026-04-02T15:00:00.000Z",
      status: "active",
      messages: [
        message("artifact-user", "user", "Draft an outline", "2026-04-02T14:59:00.000Z"),
        message("artifact-assistant", "assistant", ARTIFACT_ANSWER, "2026-04-02T15:00:00.000Z"),
      ],
    },
    {
      sessionId: APPROVAL_SESSION_ID,
      title: "Publish a note",
      updatedAt: "2026-04-01T15:00:00.000Z",
      status: "active",
      messages: [
        message("approval-user", "user", "Approve the tool action", "2026-04-01T14:59:00.000Z"),
        message("approval-assistant", "assistant", APPROVAL_INTRO, "2026-04-01T15:00:00.000Z", {
          toolApprovals: [{ ...SEEDED_APPROVAL }],
        }),
      ],
    },
  ];
}
