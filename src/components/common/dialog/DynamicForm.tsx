"use client";

import * as React from "react";
import { useForm, Controller, FieldValues } from "react-hook-form";
import { DynamicField } from "./DynamicField";
import type {
  DynamicFieldConfig,
  DynamicFormProps,
} from "@/types/interface/dialog.interface";

export function DynamicForm<TFormValues extends FieldValues = FieldValues>({
  id,
  fields,
  defaultValues,
  loading = false,
  onSubmit,
  resolver,
  className,
}: DynamicFormProps<TFormValues>) {
  const generatedId = React.useId();
  const formId = id ?? generatedId;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TFormValues>({
    
    defaultValues: defaultValues as any,
    resolver,
    mode: "onSubmit",
  });

  const visibleFields = React.useMemo(
    () =>
      fields.filter((field: DynamicFieldConfig<TFormValues>) => !field.hidden),
    [fields],
  );

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      className={className ?? "flex flex-col gap-4"}
      noValidate
    >
      {visibleFields.map((field: DynamicFieldConfig<TFormValues>) => (
        <Controller
          key={field.name}
          
          name={field.name as any}
          control={control}
          render={({ field: rhfField }) => (
            <DynamicField<TFormValues>
              field={field}
              value={rhfField.value}
              onChange={rhfField.onChange}
              onBlur={rhfField.onBlur}
              error={errors[field.name]?.message as string | undefined}
              disabled={field.disabled || loading}
              loading={loading}
            />
          )}
        />
      ))}
    </form>
  );
}
