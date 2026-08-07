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
export declare function ConfirmDialog({ isOpen, onOpenChange, title, description, confirmLabel, cancelLabel, onConfirm, isDanger, }: ConfirmDialogProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=confirm-dialog.d.ts.map