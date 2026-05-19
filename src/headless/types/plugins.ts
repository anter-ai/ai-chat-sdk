import type { ReactNode } from "react";

export interface ChatPlugins {
  /** Rendered after built-in composer action buttons (Plus, Tools). */
  composerActions?: ReactNode;
}
