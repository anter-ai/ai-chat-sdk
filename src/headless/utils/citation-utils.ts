import type { MessageSource } from "../types/chat";

const CITE_TAG_RE = /<cite\s+source_id="([^"]+)">([\s\S]*?)<\/cite>/g;
const MAX_CITATIONS = 10;

/**
 * Strips <cite source_id="...">...</cite> tags from content, replaces them with [N]
 * superscript markers, and builds an ordered MessageSource[] from the cited IDs.
 *
 * Rules:
 * - Sequential numbering by order of first appearance.
 * - Unresolvable IDs (not in sources) are silently dropped.
 * - Multi-source tags (comma-separated IDs) assign a marker per valid ID.
 * - Capped at 10 citations.
 */
export function extractCitationsFromContent(
  content: string,
  sources: MessageSource[],
): { cleanedContent: string; citations: MessageSource[] } {
  const sourceMap = new Map(sources.map((s) => [s.id, s]));
  const citationOrder: string[] = [];
  const seenIds = new Set<string>();

  CITE_TAG_RE.lastIndex = 0;

  const cleanedContent = content.replace(CITE_TAG_RE, (_full, rawIds: string, text: string) => {
    const idList = rawIds
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    for (const id of idList) {
      if (!seenIds.has(id) && sourceMap.has(id) && citationOrder.length < MAX_CITATIONS) {
        seenIds.add(id);
        citationOrder.push(id);
      }
    }

    const markers = idList
      .filter((id) => seenIds.has(id))
      .map((id) => `[${citationOrder.indexOf(id) + 1}]`)
      .join("");

    const cleanText = text.trim();
    return markers ? `${cleanText}${markers}` : cleanText;
  });

  const citations = citationOrder.map((id) => sourceMap.get(id)!);

  return { cleanedContent: cleanedContent.trim(), citations };
}
