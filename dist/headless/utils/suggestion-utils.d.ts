/**
 * Strips <suggestions>[...]</suggestions> tags from content and parses the
 * suggestions array.
 *
 * Used as a safety net on the client side: if the backend parser sends the tag
 * through as raw text (e.g. due to a missed chunk boundary), this ensures it is
 * never rendered as markdown and the suggestions array is still recoverable.
 *
 * On the happy path the backend strips the tag before sending content to the
 * client, so this function becomes a no-op (no tags found, cleanedContent ===
 * content, suggestions === []).
 */
export declare function extractSuggestionsFromContent(content: string): {
    cleanedContent: string;
    suggestions: string[];
};
//# sourceMappingURL=suggestion-utils.d.ts.map