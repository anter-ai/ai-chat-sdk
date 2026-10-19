import type {
  ChatAdapter,
  ChatSessionFileRef,
  ListParams,
  MessagePayload,
  ResolveToolApprovalInput,
  SendMessageOptions,
  Session,
  SessionPatch,
  SessionWithMessages,
} from "@anter/ai-chat-sdk";
import type { ChatMessage, ToolApproval } from "@anter/ai-chat-sdk";
import { seededSessions } from "./fixtures";
import { buildScript, scriptForPrompt, type SseFrame } from "./scripts";

export interface DemoAdapterOptions {
  /** Pause between SSE frames. Tests pass 0. Defaults to a short visible delay. */
  delayMs?: number;
}

interface StoredSession {
  session: Session;
  messages: ChatMessage[];
  files: ChatSessionFileRef[];
}

const encoder = new TextEncoder();

function encodeFrame(frame: SseFrame): Uint8Array {
  return encoder.encode(`event: ${frame.event}\ndata: ${JSON.stringify(frame.data)}\n\n`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function cloneSession(stored: StoredSession): SessionWithMessages {
  return {
    ...stored.session,
    messages: stored.messages.map((message) => ({
      ...message,
      timestamp: new Date(message.timestamp),
      sources: message.sources?.map((source) => ({ ...source })),
      toolApprovals: message.toolApprovals?.map((approval) => ({ ...approval })),
    })),
  };
}

export function createDemoAdapter(options: DemoAdapterOptions = {}): ChatAdapter {
  const delayMs = options.delayMs ?? 18;
  const sessions = new Map<string, StoredSession>();
  let sessionSeq = 0;
  let messageSeq = 0;
  let fileSeq = 0;
  let approvalSeq = 0;

  for (const seeded of seededSessions()) {
    sessions.set(seeded.sessionId, {
      session: {
        sessionId: seeded.sessionId,
        title: seeded.title,
        updatedAt: seeded.updatedAt,
        status: seeded.status,
      },
      messages: seeded.messages.map((message) => ({ ...message })),
      files: [],
    });
  }

  const approvals = new Map<string, (decision: "approved" | "denied") => void>();

  function requireSession(sessionId: string): StoredSession {
    const stored = sessions.get(sessionId);
    if (!stored) {
      throw new Error(`Unknown session: ${sessionId}`);
    }
    return stored;
  }

  const adapter: ChatAdapter = {
    async createSession(config) {
      sessionSeq += 1;
      const sessionId = `session-live-${sessionSeq}`;
      const session: Session = {
        sessionId,
        title: config.title?.trim() || "New conversation",
        updatedAt: new Date().toISOString(),
        status: "active",
        ...(config.model ? { model: config.model } : {}),
        ...(config.contextId ? { contextId: config.contextId } : {}),
      };
      sessions.set(sessionId, { session, messages: [], files: [] });
      return sessionId;
    },

    async loadSession(sessionId) {
      return cloneSession(requireSession(sessionId));
    },

    async listSessions(params?: ListParams) {
      const all = [...sessions.values()]
        .map((stored) => ({ ...stored.session }))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      const page = params?.page ?? 1;
      const limit = params?.limit ?? all.length;
      const start = (page - 1) * limit;
      return { sessions: all.slice(start, start + limit), total: all.length, page };
    },

    async updateSession(sessionId, patch: SessionPatch) {
      const stored = requireSession(sessionId);
      stored.session = {
        ...stored.session,
        ...patch,
        updatedAt: new Date().toISOString(),
      };
    },

    async deleteSession(sessionId) {
      sessions.delete(sessionId);
    },

    async sendMessage(payload: MessagePayload, sendOptions?: SendMessageOptions) {
      const stored = requireSession(payload.sessionId);
      const prompt = payload.message.trim();
      messageSeq += 1;
      stored.messages.push({
        id: `user-${messageSeq}`,
        role: "user",
        content: prompt,
        timestamp: new Date(),
      });
      if (!stored.session.title || stored.session.title === "New conversation") {
        stored.session.title = prompt;
      }
      stored.session.updatedAt = new Date().toISOString();

      const kind = scriptForPrompt(prompt);
      approvalSeq += 1;
      const approvalId = `apr-${approvalSeq}`;
      const executionId = `exec-${payload.sessionId}-${approvalSeq}`;
      const script = buildScript(kind, executionId, approvalId);
      const signal = sendOptions?.signal;

      let decision: "approved" | "denied" | "none" = "none";
      let persisted = false;

      const persist = () => {
        if (persisted) return;
        persisted = true;
        messageSeq += 1;
        const toolApprovals: ToolApproval[] | undefined = script.approvalId
          ? [
              {
                approvalId: script.approvalId,
                toolCallId: "call-1",
                toolName: "publish_note",
                args: { title: "Weekly outline" },
                riskCategory: "write",
                executionId,
                status: decision === "denied" ? "denied" : "approved",
              },
            ]
          : undefined;
        stored.messages.push({
          id: `assistant-${messageSeq}`,
          role: "assistant",
          content: script.assistantContent(decision),
          timestamp: new Date(),
          ...(script.sources ? { sources: script.sources.map((source) => ({ ...source })) } : {}),
          ...(toolApprovals ? { toolApprovals } : {}),
        });
        stored.session.updatedAt = new Date().toISOString();
      };

      const before = [...script.before];
      let beforeIndex = 0;
      let after: SseFrame[] = [];
      let afterIndex = 0;
      let phase: "before" | "wait" | "after" = "before";

      return new ReadableStream<Uint8Array>({
        async pull(controller) {
          if (signal?.aborted) {
            controller.close();
            return;
          }

          if (phase === "before") {
            const frame = before[beforeIndex];
            if (frame) {
              beforeIndex += 1;
              controller.enqueue(encodeFrame(frame));
              if (delayMs > 0) await sleep(delayMs);
              return;
            }
            phase = script.approvalId ? "wait" : "after";
          }

          if (phase === "wait" && script.approvalId) {
            const approvalIdForTurn = script.approvalId;
            decision = await new Promise<"approved" | "denied">((resolve) => {
              approvals.set(approvalIdForTurn, resolve);
              signal?.addEventListener(
                "abort",
                () => {
                  approvals.delete(approvalIdForTurn);
                  resolve("denied");
                },
                { once: true },
              );
            });
            if (signal?.aborted) {
              controller.close();
              return;
            }
            after = script.after(decision);
            phase = "after";
          }

          const frame = after[afterIndex];
          if (frame) {
            afterIndex += 1;
            controller.enqueue(encodeFrame(frame));
            if (delayMs > 0) await sleep(delayMs);
            return;
          }

          persist();
          controller.close();
        },
      });
    },

    async uploadFile(sessionId, file) {
      const stored = requireSession(sessionId);
      fileSeq += 1;
      const ref: ChatSessionFileRef = {
        id: `file-${fileSeq}`,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        status: "uploaded",
        downloadUrl: "",
        createdAt: new Date().toISOString(),
      };
      stored.files.push(ref);
      return { ...ref };
    },

    async listSessionFiles(sessionId) {
      return requireSession(sessionId).files.map((file) => ({ ...file }));
    },

    async deleteSessionFile(sessionId, fileId) {
      const stored = requireSession(sessionId);
      stored.files = stored.files.filter((file) => file.id !== fileId);
    },

    async downloadFile(_sessionId, fileId) {
      return new Blob([`Demo file ${fileId}`], { type: "text/plain" });
    },

    async resolveToolApproval(input: ResolveToolApprovalInput) {
      const resolve = approvals.get(input.approval.approvalId);
      if (!resolve) return;
      approvals.delete(input.approval.approvalId);
      resolve(input.decision === "denied" ? "denied" : "approved");
    },

    async cancelRun() {
      for (const [approvalId, resolve] of approvals) {
        approvals.delete(approvalId);
        resolve("denied");
      }
    },
  };

  return adapter;
}
