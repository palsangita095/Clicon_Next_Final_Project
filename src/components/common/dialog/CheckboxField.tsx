"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { DynamicFieldProps } from "@/types/interface/dialog.interface";

export function CheckboxField<TFormValues = Record<string, unknown>>({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled,
}: DynamicFieldProps<TFormValues>) {
  const inputId = `field-${field.name}`;

  return (
    <div className={field.className ?? "flex flex-col gap-1.5"}>
      <div className="flex items-start gap-3">
        <Checkbox
          id={inputId}
          checked={Boolean(value)}
          onCheckedChange={(checked) => onChange(Boolean(checked))}
          onBlur={onBlur}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
        <div className="flex flex-col gap-0.5 leading-none">
          <Label htmlFor={inputId} className="cursor-pointer">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {field.description && !error && (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          )}
        </div>
      </div>

      {error && (
        <p id={`${inputId}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
