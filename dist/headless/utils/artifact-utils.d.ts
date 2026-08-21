import type { Artifact } from "../types/artifact";
/**
 * Extracts <artifact> tags from content and returns cleaned content and extracted artifacts.
 */
export declare function extractArtifactsFromContent(content: string, idPrefix?: string): {
    cleanedContent: string;
    artifacts: Artifact[];
};
//# sourceMappingURL=artifact-utils.d.ts.map