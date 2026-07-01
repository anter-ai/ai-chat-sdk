import type { ReactNode } from "react";
import type { ComposerAnnouncement, MentionTarget } from "./chat";

export interface ChatPlugins {
  /** Rendered after built-in composer action buttons (Plus, Tools). */
  composerActions?: ReactNode;
  /** Banner shown above the composer input. */
  composerTopBanner?: ComposerAnnouncement | null;
  /** Banner shown below the composer input. */
  composerBottomBanner?: ComposerAnnouncement | null;
  /** Provider for @-mention menu options. */
  mentionProvider?: (query: string) => MentionTarget[] | Promise<MentionTarget[]>;
}
