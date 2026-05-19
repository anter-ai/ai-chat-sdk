export type ArtifactType = "markdown" | "html" | "code" | "table" | string;

export interface Citation {
  referenceId: string;
  sourceCategory: string;
  displayText: string;
}

/** A record in an external system that an artifact has been saved to. */
export interface LinkedRecord {
  entityType: string;
  entityId: string;
  entityUrl: string;
  savedAt: string;
}

export interface Artifact {
  artifactId: string;
  type: ArtifactType;
  title: string;
  content: string;
  /** Optional derived preview payload for binary artifacts (e.g. DOCX). */
  previewType?: ArtifactType;
  previewContent?: string;
  language?: string;
  exportFormats: string[];
  citations?: Citation[];
  savedRecord?: LinkedRecord;
  /** V3: presigned S3 URL for server-generated files (DOCX). When present the browser follows this URL directly instead of converting content client-side. */
  downloadUrl?: string;
}

export type ArtifactTab = "preview" | "source" | "export";

export interface ArtifactPanelState {
  isOpen: boolean;
  activeArtifactId?: string;
  activeTab: ArtifactTab;
}
