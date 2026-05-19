const RECORD_TAG_RE = /<record\b([^>]*?)(?:\s*\/>|\s*><\/record>)/g;
const SUBJECT_RE = /\bsubject="([^"]+)"/;
const SUBJECT_ID_RE = /\bsubjectId="([^"]+)"/;

export interface RecordTag {
  subject: string; // kebab-case identifier (e.g. "evidence-task", "control")
  subjectId: string; // raw comma-separated string from the attribute
  ids: string[]; // parsed individual IDs
}

export function extractRecordTagsFromContent(content: string): {
  cleanedContent: string;
  records: RecordTag[];
} {
  const records: RecordTag[] = [];
  RECORD_TAG_RE.lastIndex = 0;
  const cleanedContent = content.replace(RECORD_TAG_RE, (_full, attrs: string) => {
    const subject = (attrs.match(SUBJECT_RE)?.[1] ?? "").replace(/_/g, "-");
    const subjectId = attrs.match(SUBJECT_ID_RE)?.[1] ?? "";
    if (subject && subjectId) {
      records.push({
        subject,
        subjectId,
        ids: subjectId
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
    }
    return "";
  });
  return { cleanedContent: cleanedContent.trim(), records };
}
