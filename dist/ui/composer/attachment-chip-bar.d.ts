import React from "react";
import type { ChatSessionFileRef } from "../../headless/types/adapter";
interface AttachmentChipBarProps {
    files: Array<ChatSessionFileRef | UploadingFile>;
    onRemove: (id: string) => void;
}
export interface UploadingFile {
    id: string;
    fileName: string;
    mimeType: string;
    size: number;
    status: "uploading";
    downloadUrl: string;
}
export declare function AttachmentChipBar({ files, onRemove }: AttachmentChipBarProps): React.JSX.Element | null;
export {};
//# sourceMappingURL=attachment-chip-bar.d.ts.map