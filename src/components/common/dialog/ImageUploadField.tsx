"use client";

import * as React from "react";
import { X, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { DynamicFieldProps } from "@/types/interface/dialog.interface";

export function ImageUploadField<TFormValues = Record<string, unknown>>({
  field,
  value,
  onChange,
  error,
  disabled,
}: DynamicFieldProps<TFormValues>) {
  const inputId = `field-${field.name}`;
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const previewUrl = React.useMemo(() => {
    if (!value) return undefined;
    if (typeof value === "string") return value;
    if (value instanceof File) return URL.createObjectURL(value);
    return undefined;
  }, [value]);

  React.useEffect(() => {
    return () => {
      if (previewUrl && value instanceof File) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, value]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onChange(file);
    e.target.value = "";
  };

  return (
    <div className={field.className ?? "flex flex-col gap-1.5"}>
      <Label htmlFor={inputId}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 rounded-md">
          <AvatarImage
            src={previewUrl}
            alt={field.label}
            className="object-cover"
          />
          <AvatarFallback className="rounded-md bg-muted">
            <ImagePlus className="h-5 w-5 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
          >
            {previewUrl ? "Replace" : "Upload"}
          </Button>

          {previewUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => onChange(null)}
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          )}
        </div>

        <input
          ref={fileInputRef}
          id={inputId}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={disabled}
          onChange={handleFileSelect}
        />
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
