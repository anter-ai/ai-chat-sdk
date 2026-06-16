import type { ReactNode } from "react";

/** Panel tab a host renderer can expose (chrome only — content comes from `render`). */
export interface ArtifactTabConfig {
  value: "preview" | "source" | "export";
  label: string;
}

export interface ArtifactRendererConfig {
  detect: (content: string) => boolean;
  render: (content: string) => ReactNode;
  exportFormats?: string[];
  /**
   * Optional artifact-panel display overrides for this type. Lets a host fully
   * configure a custom artifact's chrome from `registerArtifact` instead of
   * editing the panel's built-in type tables:
   *  - `label` / `color`: the type badge (use a CSS var token for `color`).
   *  - `tabs`: which tabs to show (e.g. `[{ value: "preview", label: "Spec" }]`).
   */
  label?: string;
  color?: string;
  tabs?: ArtifactTabConfig[];
}

const registry = new Map<string, ArtifactRendererConfig>();

export function registerArtifact(type: string, config: ArtifactRendererConfig): void {
  registry.set(type, config);
}

export function getArtifactRegistry(): Map<string, ArtifactRendererConfig> {
  return registry;
}
