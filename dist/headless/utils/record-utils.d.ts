export interface RecordTag {
    subject: string;
    subjectId: string;
    ids: string[];
}
export declare function extractRecordTagsFromContent(content: string): {
    cleanedContent: string;
    records: RecordTag[];
};
//# sourceMappingURL=record-utils.d.ts.map