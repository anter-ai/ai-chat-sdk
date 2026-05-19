"use client";

import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  isDanger?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  isDanger = false,
}: ConfirmDialogProps) {
  const [portalContainer, setPortalContainer] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    const host = document.querySelector<HTMLElement>('[data-chat-provider="ai-chat-sdk"]');
    setPortalContainer(host);
  }, []);

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal container={portalContainer ?? undefined}>
        <DialogPrimitive.Overlay className="ais-confirm-overlay" />
        <DialogPrimitive.Content className="ais-confirm-content">
          <div className="ais-confirm-header">
            <DialogPrimitive.Title className="ais-confirm-title">{title}</DialogPrimitive.Title>
            <DialogPrimitive.Description className="ais-confirm-description">
              {description}
            </DialogPrimitive.Description>
          </div>

          <div className="ais-confirm-footer">
            <DialogPrimitive.Close asChild>
              <button className="ais-confirm-btn ais-cancel" type="button">
                {cancelLabel}
              </button>
            </DialogPrimitive.Close>
            <button
              className={`ais-confirm-btn ${isDanger ? "ais-danger" : "ais-primary"}`}
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
              type="button"
            >
              {confirmLabel}
            </button>
          </div>

          <DialogPrimitive.Close asChild>
            <button className="ais-confirm-close" aria-label="Close" type="button">
              <X size={16} />
            </button>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
