import type { UseArtifactsReturn } from "../../headless/hooks/use-artifacts";
interface ArtifactPanelProps {
    artifactsCtx: UseArtifactsReturn;
    /** Optional callback to save the artifact to an external system. When provided, an export button is shown. */
    onExportArtifact?: (artifactId: string) => Promise<void>;
    /** Dispatch a follow-up user turn into the conversation — handed to custom artifact renderers. */
    onSendMessage?: (text: string) => void;
    /** True while a response is streaming — handed to custom artifact renderers. */
    isStreaming?: boolean;
    className?: string;
}
export declare function ArtifactPanel({ artifactsCtx, onExportArtifact, onSendMessage, isStreaming, className, }: ArtifactPanelProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=artifact-panel.d.ts.map