import { describe, it, expect } from "@jest/globals";
import {
  extractContent,
  extractError,
  isRunnerCompletion,
  isRunnerControlEvent,
  resolveEventType,
  runnerEventToStep,
  runnerStepConsumesSeq,
  type StreamEventShape,
} from "./stream-event-utils";

describe("stream-event-utils", () => {
  it("uses payload.event when transport event is default message", () => {
    const eventType = resolveEventType("message", {
      payload: { event: "step" },
    });

    expect(eventType).toBe("step");
  });

  it("uses payload.event when transport event is missing", () => {
    const eventType = resolveEventType(undefined, {
      payload: { event: "plan" },
    });

    expect(eventType).toBe("plan");
  });

  it("extracts content from payload.text when top-level content is absent", () => {
    const content = extractContent({
      payload: { text: "streamed text chunk" },
    });

    expect(content).toBe("streamed text chunk");
  });

  it("prefers explicit transport event over payload.event", () => {
    const eventType = resolveEventType("done", {
      payload: { event: "step" },
    });

    expect(eventType).toBe("done");
  });
});

describe("extractError", () => {
  it("falls back to payload.message (single-agent runner error)", () => {
    expect(extractError({ type: "error", payload: { message: "boom" } })).toBe("boom");
  });

  it("falls back to top-level message (multi-agent transport error)", () => {
    expect(extractError({ message: "stream failed", payload: { executionId: "exec_1" } })).toBe(
      "stream failed",
    );
  });

  it("prefers explicit error fields over message", () => {
    expect(extractError({ error: "explicit", message: "fallback" })).toBe("explicit");
  });
});

describe("isRunnerControlEvent", () => {
  it.each([
    "thought",
    "tool_call",
    "tool_result",
    "status",
    "handoff",
    "agent_step_started",
    "delegation_return",
  ])("treats %s as a control event", (eventType) => {
    expect(isRunnerControlEvent(eventType)).toBe(true);
  });

  it.each(["content", "message", "done", "artifact", "step", "error"])(
    "does not treat %s as a control event",
    (eventType) => {
      expect(isRunnerControlEvent(eventType)).toBe(false);
    },
  );
});

describe("isRunnerCompletion", () => {
  it("is true only for status events in the completed state", () => {
    expect(isRunnerCompletion("status", { payload: { state: "completed" } })).toBe(true);
    expect(isRunnerCompletion("status", { payload: { state: "analyzing" } })).toBe(false);
    expect(isRunnerCompletion("content", { payload: { state: "completed" } })).toBe(false);
  });
});

describe("runnerEventToStep", () => {
  it("maps thought to a stable reasoning step (collapses repeated deltas)", () => {
    const a = runnerEventToStep(
      "thought",
      { type: "thought", payload: { text: "reasoning a" } },
      0,
    );
    const b = runnerEventToStep(
      "thought",
      { type: "thought", payload: { text: "reasoning b" } },
      3,
    );
    expect(a).toEqual({
      type: "reasoning",
      label: "Thinking…",
      status: "in_progress",
      step_id: "runner_reasoning",
    });
    // Stable id regardless of stepSeq so repeated reasoning deltas merge into one chip.
    expect(b?.step_id).toBe("runner_reasoning");
  });

  it("never surfaces the model's reasoning text as a step label/detail", () => {
    const step = runnerEventToStep(
      "thought",
      { type: "thought", payload: { text: "secret chain of thought" } },
      0,
    );
    expect(JSON.stringify(step)).not.toContain("secret chain of thought");
  });

  it("maps analyzing/acting status to a reasoning step, completed to none", () => {
    expect(
      runnerEventToStep("status", { payload: { state: "analyzing", status: "Thinking..." } }, 0),
    ).toMatchObject({ type: "reasoning", label: "Thinking...", step_id: "runner_reasoning" });
    expect(runnerEventToStep("status", { payload: { state: "completed" } }, 0)).toBeNull();
  });

  it("maps tool_call to a tool step with a per-occurrence id, skipping llm_chat", () => {
    expect(runnerEventToStep("tool_call", { payload: { name: "search" } }, 2)).toEqual({
      type: "tool_call",
      label: "Using search…",
      status: "in_progress",
      step_id: "runner_tool_call_2",
    });
    expect(runnerEventToStep("tool_call", { payload: { name: "llm_chat" } }, 2)).toBeNull();
  });

  it("maps tool_result to a done step with truncated detail", () => {
    const step = runnerEventToStep(
      "tool_result",
      { payload: { name: "search", output: "x".repeat(500) } },
      5,
    );
    expect(step).toMatchObject({ type: "tool_result", label: "search result", status: "done" });
    expect(step?.step_id).toBe("runner_tool_result_5");
    expect((step?.detail ?? "").length).toBeLessThanOrEqual(160);
  });

  it("maps a multi-agent handoff frame to a handoff step, preferring the alias label", () => {
    const step = runnerEventToStep(
      "handoff",
      {
        type: "delegation",
        fromSubAgentId: "triage",
        toSubAgentId: "sub_billing",
        toAlias: "Billing",
        step: 1,
      } as StreamEventShape,
      0,
    );
    expect(step).toEqual({
      type: "handoff",
      label: "Billing",
      detail: "delegation",
      status: "in_progress",
      step_id: "runner_handoff_0",
    });
  });

  it("falls back to the sub-agent id when no alias is present", () => {
    const step = runnerEventToStep(
      "handoff",
      { type: "transfer", toSubAgentId: "sub_billing", step: 1 } as StreamEventShape,
      0,
    );
    expect(step?.label).toBe("sub_billing");
  });

  it("returns null for bookkeeping events", () => {
    expect(
      runnerEventToStep("agent_step_started", { subAgentId: "a", step: 0 } as StreamEventShape, 0),
    ).toBeNull();
    expect(
      runnerEventToStep(
        "delegation_return",
        { toSubAgentId: "a", latencyMs: 5 } as StreamEventShape,
        0,
      ),
    ).toBeNull();
  });
});

describe("runnerStepConsumesSeq", () => {
  it("consumes the counter only for repeatable steps", () => {
    expect(runnerStepConsumesSeq("tool_call")).toBe(true);
    expect(runnerStepConsumesSeq("tool_result")).toBe(true);
    expect(runnerStepConsumesSeq("handoff")).toBe(true);
    expect(runnerStepConsumesSeq("thought")).toBe(false);
    expect(runnerStepConsumesSeq("status")).toBe(false);
  });
});
