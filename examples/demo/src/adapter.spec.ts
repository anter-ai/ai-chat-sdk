import { describe, expect, it } from "@jest/globals";
import { createDemoAdapter } from "./adapter";
import { scriptForPrompt } from "./scripts";

async function readStream(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) text += decoder.decode(value);
  }
  return text;
}

describe("scriptForPrompt", () => {
  it("picks a script from the prompt", () => {
    expect(scriptForPrompt("Explain a tradeoff")).toBe("default");
    expect(scriptForPrompt("Summarize a note and cite the sources")).toBe("sources");
    expect(scriptForPrompt("Draft an outline")).toBe("artifact");
    expect(scriptForPrompt("Approve the tool action")).toBe("approval");
  });
});

describe("createDemoAdapter", () => {
  it("lists the seeded chats", async () => {
    const adapter = createDemoAdapter({ delayMs: 0 });
    const list = await adapter.listSessions();
    const ids = list.sessions.map((session) => session.sessionId);
    expect(ids).toEqual(
      expect.arrayContaining(["session-sources", "session-artifact", "session-approval"]),
    );
  });

  it("loads a seeded sources thread with citation markers", async () => {
    const adapter = createDemoAdapter({ delayMs: 0 });
    const session = await adapter.loadSession("session-sources");
    const assistant = session.messages.find((message) => message.role === "assistant");
    expect(assistant?.sources?.map((source) => source.id)).toEqual(
      expect.arrayContaining(["src-brief"]),
    );
    expect(assistant?.content).toContain("<cite");
  });

  it("streams a short answer and stores the turn", async () => {
    const adapter = createDemoAdapter({ delayMs: 0 });
    const sessionId = await adapter.createSession({});
    const stream = await adapter.sendMessage({
      sessionId,
      message: "Explain a tradeoff",
    });
    const body = await readStream(stream);
    expect(body).toContain("event: content");
    expect(body).toContain("event: done");

    const session = await adapter.loadSession(sessionId);
    expect(session.messages.map((message) => message.role)).toEqual(["user", "assistant"]);
    expect(session.messages[1]?.content.length).toBeGreaterThan(0);
    expect(session.title).toBe("Explain a tradeoff");
  });

  it("attaches sources when the prompt asks for them", async () => {
    const adapter = createDemoAdapter({ delayMs: 0 });
    const sessionId = await adapter.createSession({});
    const stream = await adapter.sendMessage({
      sessionId,
      message: "Summarize a note and cite the sources",
    });
    const body = await readStream(stream);
    expect(body).toContain("src-brief");
    expect(body).toContain("<cite");
  });

  it("embeds an artifact tag when the prompt asks for an outline", async () => {
    const adapter = createDemoAdapter({ delayMs: 0 });
    const sessionId = await adapter.createSession({});
    const stream = await adapter.sendMessage({
      sessionId,
      message: "Draft an outline",
    });
    const body = await readStream(stream);
    expect(body).toContain("<artifact");
    expect(body).toContain("Project outline");
  });

  it("waits for tool approval before finishing the answer", async () => {
    const adapter = createDemoAdapter({ delayMs: 0 });
    const sessionId = await adapter.createSession({});
    const stream = await adapter.sendMessage({
      sessionId,
      message: "Approve the tool action",
    });
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let body = "";
    while (!body.includes("tool_approval_request")) {
      const { done, value } = await reader.read();
      if (done) throw new Error("stream ended before the approval request");
      if (value) body += decoder.decode(value);
    }
    expect(body).not.toContain("event: done");

    const approvalId = body.match(/"approvalId":"([^"]+)"/)?.[1];
    expect(approvalId).toBeTruthy();
    await adapter.resolveToolApproval?.({
      sessionId,
      approval: {
        approvalId: approvalId ?? "",
        toolCallId: "call-1",
        toolName: "publish_note",
        status: "pending",
      },
      decision: "approved",
    });

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) body += decoder.decode(value);
    }
    expect(body).toContain("event: done");
    expect(body).toContain("tool_approval_resolved");
  });

  it("stores an uploaded file on the session", async () => {
    const adapter = createDemoAdapter({ delayMs: 0 });
    const sessionId = await adapter.createSession({});
    const file = new File(["hello"], "notes.txt", { type: "text/plain" });
    const stored = await adapter.uploadFile?.(sessionId, file);
    expect(stored?.fileName).toBe("notes.txt");
    const files = await adapter.listSessionFiles?.(sessionId);
    expect(files?.map((item) => item.id)).toContain(stored?.id);
  });

  it("removes a session", async () => {
    const adapter = createDemoAdapter({ delayMs: 0 });
    await adapter.deleteSession("session-sources");
    await expect(adapter.loadSession("session-sources")).rejects.toThrow(/session-sources/);
  });
});
