const SUGGESTIONS_TAG_RE = /<suggestions>([\s\S]*?)<\/suggestions>/g;

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
export function extractSuggestionsFromContent(content: string): {
  cleanedContent: string;
  suggestions: string[];
} {
  const suggestions: string[] = [];
  SUGGESTIONS_TAG_RE.lastIndex = 0;

  const cleanedContent = content.replace(SUGGESTIONS_TAG_RE, (_full, inner: string) => {
    try {
      const parsed = JSON.parse(inner.trim()) as unknown[];
      for (const item of parsed) {
        if (typeof item === "string") suggestions.push(item);
      }
    } catch {
      // Malformed JSON — suppress the tag from output but don't extract suggestions
    }
    return "";
  });

  return { cleanedContent: cleanedContent.trim(), suggestions };
}
