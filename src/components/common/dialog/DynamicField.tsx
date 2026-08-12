"use client";

import * as React from "react";
import { TextField } from "./TextField";
import { TextAreaField } from "./TextAreaField";
import { SelectField } from "./SelectField";
import { ImageUploadField } from "./ImageUploadField";
import { FileUploadField } from "./FileUploadField";
import { CheckboxField } from "./CheckboxField";
import { SwitchField } from "./SwitchField";
import type { DynamicFieldProps } from "@/types/interface/dialog.interface";

export function DynamicField<TFormValues = Record<string, unknown>>(
  props: DynamicFieldProps<TFormValues>,
) {
  const { field } = props;

  switch (field.type) {
    case "text":
    case "email":
    case "password":
    case "number":
    case "phone":
    case "date":
    case "time":
      return <TextField {...props} />;

    case "textarea":
      return <TextAreaField {...props} />;

    case "select":
      return <SelectField {...props} />;

    case "image":
      return <ImageUploadField {...props} />;

    case "file":
      return <FileUploadField {...props} />;

    case "checkbox":
      return <CheckboxField {...props} />;

    case "switch":
      return <SwitchField {...props} />;

    case "custom":
      return field.render ? <>{field.render()}</> : null;

    default:
      return (
        <p className="text-xs text-destructive">
          Unsupported field type: &quot;{field.type}&quot;
        </p>
      );
  }
}
