import type { Artifact } from "../../headless/types/artifact";
interface ArtifactPreviewProps {
    artifact: Artifact;
    /** Dispatch a follow-up user turn into the conversation (host action affordances). */
    onSendMessage?: (text: string) => void;
    /** True while a response is streaming — passed to custom renderers. */
    isStreaming?: boolean;
}
export declare function ArtifactPreview({ artifact, onSendMessage, isStreaming }: ArtifactPreviewProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=artifact-preview.d.ts.map