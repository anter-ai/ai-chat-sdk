"use client";

import { useCallback, useEffect, useState } from "react";
import { useChatContext } from "../context/chat-provider";
import type { ChatSessionFileRef } from "../types/adapter";

export interface UseSessionFilesReturn {
  files: ChatSessionFileRef[];
  isLoading: boolean;
  panelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  refresh: () => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  downloadFile: (file: ChatSessionFileRef) => Promise<void>;
}

/** Save a blob to disk via a transient anchor (browser only). */
function saveBlob(blob: Blob, fileName: string): void {
  if (typeof document === "undefined") return;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function useSessionFiles(): UseSessionFilesReturn {
  const { adapter, currentSession, config } = useChatContext();
  const [files, setFiles] = useState<ChatSessionFileRef[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  const sessionId = currentSession?.sessionId;

  const refresh = useCallback(async () => {
    if (!sessionId || !adapter.listSessionFiles || !config.enableFileUpload) return;
    setIsLoading(true);
    try {
      const result = await adapter.listSessionFiles(sessionId);
      setFiles(result);
    } catch {
      // Non-fatal — panel shows empty state
    } finally {
      setIsLoading(false);
    }
  }, [adapter, sessionId]);

  // Reset files when sessionId changes (including to undefined/new chat)
  useEffect(() => {
    setFiles([]);
  }, [sessionId]);

  // Single effect covers both cases: session change AND panel open.
  // Having two separate effects caused a double fetch when sessionId changed while panelOpen was true.
  useEffect(() => {
    if (sessionId && config.enableFileUpload) void refresh();
  }, [panelOpen, sessionId, refresh, config.enableFileUpload]);

  const openPanel = useCallback(() => setPanelOpen(true), []);
  const closePanel = useCallback(() => setPanelOpen(false), []);

  const deleteFile = useCallback(
    async (fileId: string) => {
      if (!sessionId || !adapter.deleteSessionFile) return;
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      await adapter.deleteSessionFile(sessionId, fileId).catch(() => {
        // Re-fetch to restore accurate state on failure
        void refresh();
      });
    },
    [adapter, sessionId, refresh],
  );

  const downloadFile = useCallback(
    async (file: ChatSessionFileRef) => {
      // Preferred: pull the bytes through the host backend (auth handled by the
      // adapter) and save them — no direct/presigned URL ever reaches the browser.
      if (sessionId && adapter.downloadFile) {
        try {
          const blob = await adapter.downloadFile(sessionId, file.id);
          saveBlob(blob, file.fileName);
          return;
        } catch (err) {
          // Do NOT silently fall back to a (possibly presigned) URL on failure —
          // that would defeat the purpose. Surface and stop.
          console.error("downloadFile failed", err);
          return;
        }
      }
      // Legacy fallback for hosts that have not implemented `downloadFile`: open the
      // host-provided URL in a new tab (cross-origin links ignore `download`).
      if (file.downloadUrl && typeof window !== "undefined") {
        window.open(file.downloadUrl, "_blank", "noopener,noreferrer");
      }
    },
    [adapter, sessionId],
  );

  return {
    files,
    isLoading,
    panelOpen,
    openPanel,
    closePanel,
    refresh,
    deleteFile,
    downloadFile,
  };
}
