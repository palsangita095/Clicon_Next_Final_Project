"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DynamicForm } from "./DynamicForm";
import { DialogFooter } from "./DialogFooter";
import type { DynamicDialogProps } from "@/types/interface/dialog.interface";
import { FieldValues } from "react-hook-form";

function getDefaultTitle(mode: "create" | "edit"): string {
  return mode === "create" ? "Add New" : "Edit Details";
}

const FORM_ID = "dynamic-dialog-form";

export function DynamicDialog<
  // TFormValues extends Record<string, unknown> = Record<string, unknown>,
  TFormValues extends FieldValues = FieldValues,
>({
  open,
  onOpenChange,
  mode,
  title,
  description,
  fields,
  defaultValues,
  loading = false,
  resolver,
  onSubmit,
  submitLabel,
  cancelLabel,
}: DynamicDialogProps<TFormValues>) {
  const resolvedTitle = title ?? getDefaultTitle(mode);

  return (
    <Dialog open={open} onOpenChange={loading ? undefined : onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto gap-6">
        <DialogHeader>
          <DialogTitle>{resolvedTitle}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <DynamicForm<TFormValues>
          id={FORM_ID}
          fields={fields}
          defaultValues={defaultValues}
          mode={mode}
          loading={loading}
          resolver={resolver}
          onSubmit={onSubmit}
        />

        <DialogFooter
          mode={mode}
          formId={FORM_ID}
          onCancel={() => onOpenChange(false)}
          loading={loading}
          submitLabel={submitLabel}
          cancelLabel={cancelLabel}
        />
      </DialogContent>
    </Dialog>
  );
}
