"use client";

import React from "react";
import { File, FileSpreadsheet, FileText, Image } from "lucide-react";

export function fileIcon(mimeType: string, size = 14) {
  if (mimeType.startsWith("image/")) return <Image size={size} />;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType === "text/csv")
    return <FileSpreadsheet size={size} />;
  if (mimeType.includes("pdf") || mimeType.includes("word") || mimeType.includes("document"))
    return <FileText size={size} />;
  return <File size={size} />;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
