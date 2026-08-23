import type { Artifact, ArtifactPanelState, ArtifactTab, LinkedRecord } from "../types/artifact";
export interface UseArtifactsReturn {
    artifacts: Map<string, Artifact>;
    panelState: ArtifactPanelState;
    activeArtifact?: Artifact;
    openArtifact: (artifactId: string) => void;
    closePanel: () => void;
    setActiveTab: (tab: ArtifactTab) => void;
    registerArtifacts: (nextArtifacts: Artifact[]) => void;
    markSaved: (artifactId: string, record: LinkedRecord) => void;
    clearArtifacts: () => void;
}
export declare function useArtifacts(): UseArtifactsReturn;
//# sourceMappingURL=use-artifacts.d.ts.map