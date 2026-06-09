import React from "react";
import Button from "@/shared/components/Button.tsx";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onCancel,
  onConfirm,
  isLoading,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDangerous = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        </div>

        {/* Message */}
        <div className="px-6 py-4">
          <div className="text-sm text-slate-600">{message}</div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>{cancelText}</Button>
          <Button variant={isDangerous ? "danger" : "primary"} onClick={onConfirm} loading={isLoading} loadingText="Processing...">
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}