"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { DynamicFieldProps } from "@/types/interface/dialog.interface";

export function SelectField<TFormValues = Record<string, unknown>>({
  field,
  value,
  onChange,
  error,
  disabled,
}: DynamicFieldProps<TFormValues>) {
  const inputId = `field-${field.name}`;
  const options = field.options ?? [];
  const valueKey = field.valueKey ?? "value";
  const labelKey = field.labelKey ?? "label";
  const stringValue = value != null ? String(value) : "";

  const selectedLabel = React.useMemo(() => {
    const match = options.find((opt) => String(opt[valueKey]) === stringValue);
    return match ? String(match[labelKey]) : undefined;
  }, [options, valueKey, labelKey, stringValue]);

  return (
    <div className={field.className ?? "flex flex-col gap-1.5"}>
      <Label htmlFor={inputId}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <Select value={stringValue} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
        >
          <SelectValue placeholder={field.placeholder ?? "Select…"}>
            {selectedLabel}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          {options.map((opt) => {
            const optVal = String(opt[valueKey]);
            const optLabel = String(opt[labelKey]);
            return (
              <SelectItem key={optVal} value={optVal}>
                {optLabel}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

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
