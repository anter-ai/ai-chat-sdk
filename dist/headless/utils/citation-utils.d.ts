import type { MessageSource } from "../types/chat";
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
export declare function extractCitationsFromContent(content: string, sources: MessageSource[]): {
    cleanedContent: string;
    citations: MessageSource[];
};
//# sourceMappingURL=citation-utils.d.ts.map