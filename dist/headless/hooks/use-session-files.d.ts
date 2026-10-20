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
export declare function useSessionFiles(): UseSessionFilesReturn;
//# sourceMappingURL=use-session-files.d.ts.map