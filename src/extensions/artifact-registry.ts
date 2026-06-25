import type { ReactNode } from "react";

/** Panel tab a host renderer can expose (chrome only — content comes from `render`). */
export interface ArtifactTabConfig {
  value: "preview" | "source" | "export";
  label: string;
}

/**
 * Context handed to a host artifact renderer at render time. Lets a custom
 * artifact stay interactive — know its own identity and dispatch a follow-up
 * turn back into the conversation — without the SDK knowing the artifact's
 * domain. Generic by design: any artifact type can use it (a document offering
 * "refine", a chart offering "redo with a log scale", etc.).
 */
export interface ArtifactRenderContext {
  /** Stable id of the artifact being rendered (survives content updates). */
  artifactId: string;
  /** The type key the artifact was registered under. */
  type: string;
  /**
   * Dispatch a new user turn into the current conversation. Use for "act on
   * this artifact" affordances (e.g. ask the agent to revise it). No-op-safe:
   * if the host shell did not wire a sender, this does nothing.
   */
  sendMessage: (text: string) => void;
  /** True while a response is actively streaming — disable send affordances. */
  isStreaming: boolean;
}

export interface ArtifactRendererConfig {
  detect: (content: string) => boolean;
  /**
   * Render the artifact. The second argument is optional for callers — existing
   * one-argument renderers remain valid (extra args are ignored).
   */
  render: (content: string, ctx: ArtifactRenderContext) => ReactNode;
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
