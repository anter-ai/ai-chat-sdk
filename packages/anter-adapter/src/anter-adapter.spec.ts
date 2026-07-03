/**
 * @jest-environment node
 */
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

// The adapter's only runtime import from the SDK; mocked so the test never
// loads the built ESM dist.
jest.mock("@anter/ai-chat-sdk", () => ({ registerSlashCommand: jest.fn() }));

import { AnterAdapter } from "./anter-adapter";

type FetchMock = jest.Mock<typeof fetch>;

function sseResponse(overrides: Partial<Response> = {}): Response {
  return {
    ok: true,
    status: 200,
    body: { fake: "stream" } as unknown as ReadableStream<Uint8Array>,
    text: async () => "",
    json: async () => ({}),
    ...overrides,
  } as unknown as Response;
}

describe("AnterAdapter", () => {
  let fetchMock: FetchMock;
  let adapter: AnterAdapter;

  beforeEach(() => {
    fetchMock = jest.fn<typeof fetch>();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    adapter = new AnterAdapter({
      baseUrl: "https://app.example.test/api/chat",
      organizationId: "org-1",
      getAuthHeaders: async () => ({ Authorization: "Bearer token-1" }),
    });
  });

  describe("getExecutionStream", () => {
    it("GETs the agent-runner replay endpoint with resumeFrom and returns the SSE body", async () => {
      const response = sseResponse();
      fetchMock.mockResolvedValue(response);

      const stream = await adapter.getExecutionStream("exec-1", 42);

      expect(fetchMock).toHaveBeenCalledWith(
        "https://app.example.test/api/chat/v1/external/agent-runner/executions/exec-1/stream?resumeFrom=42",
        expect.objectContaining({
          method: "GET",
          credentials: "include",
          headers: expect.objectContaining({
            Accept: "text/event-stream",
            Authorization: "Bearer token-1",
          }),
        }),
      );
      expect(stream).toBe(response.body);
    });

    it("defaults resumeFrom to 0 and URL-encodes the execution id", async () => {
      fetchMock.mockResolvedValue(sseResponse());

      await adapter.getExecutionStream("exec/1");

      const url = fetchMock.mock.calls[0]?.[0];
      expect(url).toBe(
        "https://app.example.test/api/chat/v1/external/agent-runner/executions/exec%2F1/stream?resumeFrom=0",
      );
    });

    it("forwards the abort signal to fetch", async () => {
      fetchMock.mockResolvedValue(sseResponse());
      const controller = new AbortController();

      await adapter.getExecutionStream("exec-1", 0, { signal: controller.signal });

      const init = fetchMock.mock.calls[0]?.[1];
      expect(init?.signal).toBe(controller.signal);
    });

    it("rejects when the backend answers non-2xx", async () => {
      fetchMock.mockResolvedValue(
        sseResponse({ ok: false, status: 404, text: async () => "execution not found" }),
      );

      await expect(adapter.getExecutionStream("exec-gone")).rejects.toThrow("execution not found");
    });

    it("rejects when the SSE body is missing", async () => {
      fetchMock.mockResolvedValue(sseResponse({ body: null }));

      await expect(adapter.getExecutionStream("exec-1")).rejects.toThrow(
        "SSE response body is missing",
      );
    });
  });

  describe("cancelRun", () => {
    it("POSTs the agent-runner cancel endpoint for the execution", async () => {
      fetchMock.mockResolvedValue(sseResponse());

      await adapter.cancelRun({ sessionId: "session-1", executionId: "exec-1" });

      expect(fetchMock).toHaveBeenCalledWith(
        "https://app.example.test/api/chat/v1/external/agent-runner/executions/exec-1/cancel",
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("rejects when the backend answers non-2xx", async () => {
      fetchMock.mockResolvedValue(
        sseResponse({ ok: false, status: 500, text: async () => "cancel failed" }),
      );

      await expect(
        adapter.cancelRun({ sessionId: "session-1", executionId: "exec-1" }),
      ).rejects.toThrow("cancel failed");
    });
  });

  describe("sendMessage", () => {
    it("POSTs run-anter on the org path and forwards the abort signal", async () => {
      const response = sseResponse();
      fetchMock.mockResolvedValue(response);
      const controller = new AbortController();

      const stream = await adapter.sendMessage(
        { organizationId: "org-1", sessionId: "session-1", message: "hello" },
        { signal: controller.signal },
      );

      const [url, init] = fetchMock.mock.calls[0] ?? [];
      expect(url).toBe(
        "https://app.example.test/api/chat/v1/organizations/org-1/agent-builder/run-anter",
      );
      expect(init?.method).toBe("POST");
      expect(init?.signal).toBe(controller.signal);
      expect(stream).toBe(response.body);
    });

    it("POSTs run-stream when projectId and agentId are configured", async () => {
      fetchMock.mockResolvedValue(sseResponse());
      const projectAdapter = new AnterAdapter({
        baseUrl: "https://app.example.test/api/chat",
        organizationId: "org-1",
        projectId: "proj-1",
        agentId: "agent-1",
        getAuthHeaders: async () => ({}),
      });

      await projectAdapter.sendMessage({
        organizationId: "org-1",
        sessionId: "session-1",
        message: "hello",
      });

      expect(fetchMock.mock.calls[0]?.[0]).toBe(
        "https://app.example.test/api/chat/v1/external/projects/proj-1/agents/agent-1/run-stream",
      );
    });
  });
});
