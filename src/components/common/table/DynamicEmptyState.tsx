"use client";

import React, { memo } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { PackageOpen } from "lucide-react";



interface DynamicEmptyStateProps {
  columnCount: number;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}



const DynamicEmptyState = memo(function DynamicEmptyState({
  columnCount,
  title = "No Data",
  description = "Nothing to display here yet.",
  action,
}: DynamicEmptyStateProps) {
  return (
    <>
      <TableRow className="hover:bg-transparent border-0">
        <TableCell colSpan={columnCount} className="p-0">
          <div
            className="flex w-full flex-col items-center justify-center gap-3 px-4 py-12 sm:py-16"
            role="status"
            aria-live="polite"
            aria-label={title}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground sm:h-14 sm:w-14"
              aria-hidden="true"
            >
              <PackageOpen
                className="h-6 w-6 sm:h-7 sm:w-7"
                strokeWidth={1.5}
              />
            </div>

            <div className="flex flex-col items-center gap-1">
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="max-w-xs text-center text-xs leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>

            {action && <div className="mt-1">{action}</div>}
          </div>
        </TableCell>
      </TableRow>
    </>
  );
});

DynamicEmptyState.displayName = "DynamicEmptyState";

export default DynamicEmptyState;
