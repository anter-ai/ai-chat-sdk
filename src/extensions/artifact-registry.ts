import type { ReactNode } from "react";

export interface ArtifactRendererConfig {
  detect: (content: string) => boolean;
  render: (content: string) => ReactNode;
  exportFormats?: string[];
}

const registry = new Map<string, ArtifactRendererConfig>();

export function registerArtifact(type: string, config: ArtifactRendererConfig): void {
  registry.set(type, config);
}

export function getArtifactRegistry(): Map<string, ArtifactRendererConfig> {
  return registry;
}
