import { describe, it, expect } from "@jest/globals";
import { extractContent, resolveEventType } from "./stream-event-utils";

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
