import { APPROVAL_SESSION_ID, ARTIFACT_SESSION_ID, SOURCES_SESSION_ID } from "./fixtures";

export const DEMO_SCENES = ["empty", "sources", "artifact", "approval"] as const;

export type DemoScene = (typeof DEMO_SCENES)[number];

export function parseScene(search: string): DemoScene | null {
  const query = search.startsWith("?") ? search.slice(1) : search;
  const value = new URLSearchParams(query).get("scene");
  if (value === "empty" || value === "sources" || value === "artifact" || value === "approval") {
    return value;
  }
  return null;
}

export function sessionIdForScene(scene: DemoScene | null): string | undefined {
  if (scene === "sources") return SOURCES_SESSION_ID;
  if (scene === "artifact") return ARTIFACT_SESSION_ID;
  if (scene === "approval") return APPROVAL_SESSION_ID;
  return undefined;
}
