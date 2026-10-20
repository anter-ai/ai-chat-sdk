import type { MessageSource } from "../types/chat";
export interface ParsedSourceBlock {
    name: string;
    tags?: string;
    classification?: string;
    citation?: string;
    page?: number;
    section?: string;
}
/**
 * Parses all [source: ...], [cite: ...], and 【...】 citation blocks from text content.
 * Extracts structured MessageSource objects with title, snippets, tags, and classification.
 */
export declare function parseSources(content: string): MessageSource[];
/**
 * Strips all [source: ...], [cite: ...], and 【...】 citation blocks from message content for clean rendering.
 * Also cleans up trailing partial citation blocks and cleans up extra whitespace.
 */
export declare function stripSources(content: string): string;
/**
 * Filter streaming delta chunks to suppress [source:...], [cite:...], and 【...】 blocks
 * in real time while collecting complete blocks for downstream citation rendering.
 */
export declare class StreamingSourceStripper {
    private buffer;
    private inBracketSource;
    private inFullwidthSource;
    private currentSourceContent;
    private collectedSourceBlocks;
    /**
     * Process an incoming stream delta chunk.
     * Returns only safe, visible content with citation blocks and partial citation syntax stripped.
     */
    process(delta: string): string;
    /**
     * Flushes any remaining buffer at the end of the stream.
     * Ensures unfinished/partial citation tags are suppressed from output and collected.
     */
    flush(): string;
    /**
     * Returns structured MessageSource objects parsed from all collected citation blocks.
     */
    getCollectedSources(): MessageSource[];
}
//# sourceMappingURL=streaming-source-stripper.d.ts.map