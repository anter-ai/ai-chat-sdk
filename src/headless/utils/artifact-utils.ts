import type { Artifact } from "../types/artifact";

const ARTIFACT_TAG_RE = /<artifact\b([^>]*)>([\s\S]*?)<\/artifact>/g;

function extractAttr(attrs: string, name: string): string {
  const m = attrs.match(new RegExp(`\\b${name}="([^"]+)"`));
  return m?.[1] ?? "";
}

/**
 * Extracts <artifact> tags from content and returns cleaned content and extracted artifacts.
 */
export function extractArtifactsFromContent(
  content: string,
  idPrefix?: string,
): {
  cleanedContent: string;
  artifacts: Artifact[];
} {
  const artifacts: Artifact[] = [];
  ARTIFACT_TAG_RE.lastIndex = 0;

  let index = 0;
  const cleanedContent = content.replace(ARTIFACT_TAG_RE, (_full, attrs: string, body: string) => {
    const type = extractAttr(attrs, "type") || "markdown";
    const title = extractAttr(attrs, "title") || "Document";
    const artifactId = idPrefix
      ? `${idPrefix}-art-${index++}`
      : `frontend-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    artifacts.push({
      artifactId,
      type,
      title,
      content: body.trim(),
      exportFormats: ["markdown"],
    });
    return "";
  });

  return { cleanedContent: cleanedContent.trim(), artifacts };
}
