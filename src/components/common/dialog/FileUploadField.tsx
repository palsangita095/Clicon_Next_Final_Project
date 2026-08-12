"use client";

import * as React from "react";
import { X, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { DynamicFieldProps } from "@/types/interface/dialog.interface";

const DEFAULT_ACCEPT = ".pdf,.doc,.docx,.png,.jpg,.jpeg";

export function FileUploadField<TFormValues = Record<string, unknown>>({
  field,
  value,
  onChange,
  error,
  disabled,
}: DynamicFieldProps<TFormValues>) {
  const inputId = `field-${field.name}`;
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const files: File[] = React.useMemo(() => {
    if (!value) return [];
    if (Array.isArray(value)) return value as File[];
    if (value instanceof File) return [value];
    return [];
  }, [value]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;
    const selectedFiles = Array.from(selected);
    onChange(selectedFiles.length > 1 ? selectedFiles : selectedFiles[0]);
    e.target.value = "";
  };

  const handleRemove = (index: number) => {
    if (files.length <= 1) {
      onChange(null);
      return;
    }
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className={field.className ?? "flex flex-col gap-1.5"}>
      <Label htmlFor={inputId}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className="w-fit"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4 mr-1" />
          {files.length > 0 ? "Add more" : "Choose file"}
        </Button>

        <input
          ref={fileInputRef}
          id={inputId}
          type="file"
          accept={DEFAULT_ACCEPT}
          className="hidden"
          disabled={disabled}
          onChange={handleFileSelect}
        />

        {files.length > 0 && (
          <ul className="flex flex-col gap-1.5">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-2 truncate text-foreground">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{file.name}</span>
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  disabled={disabled}
                  onClick={() => handleRemove(index)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {field.description && !error && (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
