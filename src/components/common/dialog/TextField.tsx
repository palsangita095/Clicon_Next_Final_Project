"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DynamicFieldProps } from "@/types/interface/dialog.interface";

export function TextField<TFormValues = Record<string, unknown>>({
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
      <Label htmlFor={inputId}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <Input
        id={inputId}
        type={field.type === "phone" ? "tel" : field.type}
        placeholder={field.placeholder}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />

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
