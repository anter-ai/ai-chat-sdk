import type { Artifact } from "../../headless/types/artifact";
interface ArtifactChipProps {
    artifact?: Artifact;
    isSaved: boolean;
    onClick: () => void;
}
export declare function ArtifactChip({ artifact, isSaved, onClick }: ArtifactChipProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=artifact-chip.d.ts.map