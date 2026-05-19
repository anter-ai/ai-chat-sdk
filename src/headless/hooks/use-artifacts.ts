"use client";

import { useCallback, useMemo, useState } from "react";
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
}

export function useArtifacts(): UseArtifactsReturn {
  const [artifacts, setArtifacts] = useState<Map<string, Artifact>>(new Map());
  const [panelState, setPanelState] = useState<ArtifactPanelState>({
    isOpen: false,
    activeArtifactId: undefined,
    activeTab: "preview",
  });

  const activeArtifact = useMemo(() => {
    if (!panelState.activeArtifactId) return undefined;
    return artifacts.get(panelState.activeArtifactId);
  }, [artifacts, panelState.activeArtifactId]);

  const openArtifact = useCallback((artifactId: string) => {
    setPanelState((prev) => ({
      ...prev,
      isOpen: true,
      activeArtifactId: artifactId,
    }));
  }, []);

  const closePanel = useCallback(() => {
    setPanelState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const setActiveTab = useCallback((tab: ArtifactTab) => {
    setPanelState((prev) => ({ ...prev, activeTab: tab }));
  }, []);

  const registerArtifacts = useCallback((nextArtifacts: Artifact[]) => {
    if (!nextArtifacts.length) return;

    setArtifacts((prev) => {
      let hasChanges = false;
      for (const art of nextArtifacts) {
        const existing = prev.get(art.artifactId);
        if (!existing || existing.content !== art.content || existing.title !== art.title) {
          hasChanges = true;
          break;
        }
      }

      if (!hasChanges) return prev;

      const map = new Map(prev);
      for (const artifact of nextArtifacts) {
        map.set(artifact.artifactId, artifact);
      }
      return map;
    });
  }, []);

  const markSaved = useCallback((artifactId: string, record: LinkedRecord) => {
    setArtifacts((prev) => {
      const map = new Map(prev);
      const current = map.get(artifactId);
      if (!current) return prev;
      map.set(artifactId, { ...current, savedRecord: record });
      return map;
    });
  }, []);

  return useMemo(
    () => ({
      artifacts,
      panelState,
      activeArtifact,
      openArtifact,
      closePanel,
      setActiveTab,
      registerArtifacts,
      markSaved,
    }),
    [
      artifacts,
      panelState,
      activeArtifact,
      openArtifact,
      closePanel,
      setActiveTab,
      registerArtifacts,
      markSaved,
    ],
  );
}
