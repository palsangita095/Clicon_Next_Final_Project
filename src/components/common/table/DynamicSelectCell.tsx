"use client";

import React, { memo, useCallback, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DropdownConfig } from "@/types/type/table.type";



interface DynamicSelectCellProps<TData> {
  row: TData;
  value: string;
  dropdown: DropdownConfig<TData, Record<string, unknown>>;
}



function DynamicSelectCell<TData>({
  row,
  value,
  dropdown,
}: DynamicSelectCellProps<TData>) {
  const { options, valueKey, labelKey, onChange } = dropdown;

  const [localValue, setLocalValue] = useState<string>(value ?? "");

  const selectedLabel = useMemo(() => {
    const match = options.find(
      (option) => String(option[valueKey]) === localValue,
    );
    return match ? String(match[labelKey]) : undefined;
  }, [options, valueKey, labelKey, localValue]);

  const handleChange = useCallback(
    (selected: string) => {
      setLocalValue(selected);
      onChange?.(row, selected);
    },
    [row, onChange],
  );

  return (
    <Select value={localValue} onValueChange={handleChange}>
      <SelectTrigger
        className="h-8 min-w-30 max-w-45 border-border bg-background text-xs
                   focus:ring-2 focus:ring-ring focus:ring-offset-0
                  data-placeholder:text-muted-foreground"
        aria-label="Change value"
      >
        <SelectValue placeholder="Select…">{selectedLabel}</SelectValue>
      </SelectTrigger>

      <SelectContent className="text-xs">
        {options.map((option) => {
          const optionValue = String(option[valueKey]);
          const optionLabel = String(option[labelKey]);

          return (
            <SelectItem
              key={optionValue}
              value={optionValue}
              className="cursor-pointer text-xs"
            >
              {optionLabel}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

export default memo(DynamicSelectCell) as typeof DynamicSelectCell;
