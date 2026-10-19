import { describe, expect, it } from "@jest/globals";
import { parseScene, sessionIdForScene } from "./scenes";

describe("parseScene", () => {
  it("returns null when no scene is requested", () => {
    expect(parseScene("")).toBeNull();
    expect(parseScene("?")).toBeNull();
  });

  it("reads a known scene from the query string", () => {
    expect(parseScene("?scene=empty")).toBe("empty");
    expect(parseScene("?scene=sources")).toBe("sources");
    expect(parseScene("?scene=artifact")).toBe("artifact");
    expect(parseScene("?scene=approval")).toBe("approval");
  });

  it("returns null for an unknown scene so the page stays interactive", () => {
    expect(parseScene("?scene=nope")).toBeNull();
    expect(parseScene("?scene=")).toBeNull();
  });
});

describe("sessionIdForScene", () => {
  it("starts a new chat for interactive mode and the empty scene", () => {
    expect(sessionIdForScene(null)).toBeUndefined();
    expect(sessionIdForScene("empty")).toBeUndefined();
  });

  it("points finished scenes at a seeded session", () => {
    expect(sessionIdForScene("sources")).toBe("session-sources");
    expect(sessionIdForScene("artifact")).toBe("session-artifact");
    expect(sessionIdForScene("approval")).toBe("session-approval");
  });
});
