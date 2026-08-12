import type { ReactNode } from "react";
import {
  DefaultValues,
  FieldValues,
  Resolver,
  SubmitHandler,
} from "react-hook-form";



export type DialogMode = "create" | "edit";



export type DynamicFieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "phone"
  | "textarea"
  | "select"
  | "checkbox"
  | "switch"
  | "image"
  | "file"
  | "date"
  | "time"
  | "custom";


export interface DynamicFieldConfig<TFormValues = Record<string, unknown>> {
  name: keyof TFormValues & string;
  label: string;
  type: DynamicFieldType;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  defaultValue?: unknown;
  description?: string;
  className?: string;
  options?: Record<string, unknown>[];
  valueKey?: string;
  labelKey?: string;
  render?: () => ReactNode;
}


export interface DynamicFieldProps<TFormValues = Record<string, unknown>> {
  field: DynamicFieldConfig<TFormValues>;
  value: unknown;
  onChange: (value: unknown) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  loading?: boolean;
}


export interface DynamicFormProps<
  TFormValues extends FieldValues = FieldValues,
> {
  id?: string;
  fields: DynamicFieldConfig<TFormValues>[];
  defaultValues?: Partial<TFormValues>;
  mode: DialogMode;
  loading?: boolean;
  onSubmit: (values: TFormValues) => void;
  
  resolver?: any;
  className?: string;
}



export interface DynamicDialogProps<
  TFormValues extends FieldValues = FieldValues,
> {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  mode: "create" | "edit";

  fields: DynamicFieldConfig<TFormValues>[];

  defaultValues?: DefaultValues<TFormValues>;

  resolver?: Resolver<TFormValues>;

  onSubmit: SubmitHandler<TFormValues>;
  error?: Error | null;

  loading?: boolean;

  title?: string;
  description?: string;

  submitLabel?: string;
  cancelLabel?: string;
}
