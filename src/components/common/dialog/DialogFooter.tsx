"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DialogMode } from "@/types/interface/dialog.interface";

interface DynamicDialogFooterProps {
  mode: DialogMode;
  formId: string;
  onCancel: () => void;
  loading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
}

function getDefaultSubmitLabel(mode: DialogMode): string {
  return mode === "create" ? "Create" : "Update";
}

export function DialogFooter({
  mode,
  formId,
  onCancel,
  loading = false,
  submitLabel,
  cancelLabel = "Cancel",
}: DynamicDialogFooterProps) {
  const resolvedSubmitLabel = submitLabel ?? getDefaultSubmitLabel(mode);

  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button
        type="button"
        variant="outline"
        disabled={loading}
        onClick={onCancel}
        className="w-full sm:w-auto"
      >
        {cancelLabel}
      </Button>

      <Button
        type="submit"
        form={formId}
        disabled={loading}
        className="w-full sm:w-auto"
      >
        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {resolvedSubmitLabel}
      </Button>
    </div>
  );
}
