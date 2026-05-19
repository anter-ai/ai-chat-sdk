import { describe, it, expect } from "@jest/globals";
import { extractCitationsFromContent } from "./citation-utils";
import type { MessageSource } from "../types/chat";

const makeSource = (id: string, overrides: Partial<MessageSource> = {}): MessageSource => ({
  id,
  title: `Source ${id}`,
  type: "document",
  ...overrides,
});

describe("extractCitationsFromContent", () => {
  it("strips a single <cite> tag and replaces it with [1]", () => {
    const sources = [makeSource("abc")];
    const content = '<cite source_id="abc">Vendors must pass an annual review.</cite>';

    const { cleanedContent, citations } = extractCitationsFromContent(content, sources);

    expect(cleanedContent).toBe("Vendors must pass an annual review.[1]");
    expect(citations).toHaveLength(1);
    expect(citations[0]?.id).toBe("abc");
  });

  it("assigns sequential numbers by order of first appearance", () => {
    const sources = [makeSource("id1"), makeSource("id2"), makeSource("id3")];
    const content = [
      '<cite source_id="id1">First claim.</cite>',
      " Some text. ",
      '<cite source_id="id3">Third-source claim.</cite>',
      " More text. ",
      '<cite source_id="id2">Second-source claim.</cite>',
    ].join("");

    const { cleanedContent, citations } = extractCitationsFromContent(content, sources);

    expect(cleanedContent).toBe(
      "First claim.[1] Some text. Third-source claim.[2] More text. Second-source claim.[3]",
    );
    expect(citations.map((c) => c.id)).toEqual(["id1", "id3", "id2"]);
  });

  it("silently drops unresolvable source IDs", () => {
    const sources = [makeSource("known")];
    const content = '<cite source_id="unknown,known">Claim text.</cite>';

    const { cleanedContent, citations } = extractCitationsFromContent(content, sources);

    expect(cleanedContent).toContain("[1]");
    expect(cleanedContent).not.toContain("[2]");
    expect(citations).toHaveLength(1);
    expect(citations[0]?.id).toBe("known");
  });

  it("handles multi-source tags with comma-separated IDs", () => {
    const sources = [makeSource("s1"), makeSource("s2")];
    const content = '<cite source_id="s1,s2">Claim backed by two sources.</cite>';

    const { cleanedContent, citations } = extractCitationsFromContent(content, sources);

    expect(cleanedContent).toBe("Claim backed by two sources.[1][2]");
    expect(citations).toHaveLength(2);
  });

  it("deduplicates the same source cited multiple times", () => {
    const sources = [makeSource("dup")];
    const content = [
      '<cite source_id="dup">First mention.</cite>',
      " Other text. ",
      '<cite source_id="dup">Second mention.</cite>',
    ].join("");

    const { cleanedContent, citations } = extractCitationsFromContent(content, sources);

    expect(cleanedContent).toBe("First mention.[1] Other text. Second mention.[1]");
    expect(citations).toHaveLength(1);
  });

  it("returns original content unchanged when no <cite> tags present", () => {
    const sources = [makeSource("abc")];
    const content = "Plain text with no citations.";

    const { cleanedContent, citations } = extractCitationsFromContent(content, sources);

    expect(cleanedContent).toBe(content);
    expect(citations).toHaveLength(0);
  });

  it("returns empty citations when sources array is empty", () => {
    const content = '<cite source_id="abc">Some claim.</cite>';

    const { cleanedContent, citations } = extractCitationsFromContent(content, []);

    expect(cleanedContent).toBe("Some claim.");
    expect(citations).toHaveLength(0);
  });

  it("caps citations at 10 even when more are present", () => {
    const sources = Array.from({ length: 12 }, (_, i) => makeSource(`id${i}`));
    const content = sources.map((s) => `<cite source_id="${s.id}">Claim ${s.id}.</cite>`).join(" ");

    const { citations } = extractCitationsFromContent(content, sources);

    expect(citations).toHaveLength(10);
  });

  it("handles all-unresolvable IDs gracefully", () => {
    const content = '<cite source_id="ghost1,ghost2">No real sources.</cite>';

    const { cleanedContent, citations } = extractCitationsFromContent(content, []);

    expect(cleanedContent).toBe("No real sources.");
    expect(citations).toHaveLength(0);
  });

  it("preserves content outside <cite> tags", () => {
    const sources = [makeSource("src1")];
    const content = 'Before. <cite source_id="src1">Cited.</cite> After.';

    const { cleanedContent } = extractCitationsFromContent(content, sources);

    expect(cleanedContent).toContain("Before.");
    expect(cleanedContent).toContain("After.");
  });
});
