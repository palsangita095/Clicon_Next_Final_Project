"use client";

import React, { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

// Props

interface DynamicLoadingProps {
  rowCount?: number;
  columnCount: number;
  hasActions?: boolean;
  hasSerialNumber?: boolean;
}

//  SkeletonRow

const SkeletonRow = memo(function SkeletonRow({
  columnCount,
  hasActions,
  hasSerialNumber,
  rowIndex,
}: {
  columnCount: number;
  hasActions: boolean;
  hasSerialNumber: boolean;
  rowIndex: number;
}) {
  const staggerStyle: React.CSSProperties = { opacity: 1 - rowIndex * 0.08 };

  return (
    <TableRow
      className="border-border hover:bg-transparent"
      style={staggerStyle}
      aria-hidden="true"
    >
      {hasSerialNumber && (
        <TableCell className="w-12 py-3">
          <Skeleton className="h-4 w-6 rounded-md" />
        </TableCell>
      )}

      {Array.from({ length: columnCount }).map((_, colIdx) => (
        <TableCell key={colIdx} className="py-3">
          <div className="flex items-center gap-2">
            {colIdx === 0 && (
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
            )}
            <Skeleton
              className="h-4 rounded-md"
              style={{ width: `${[65, 80, 55, 70, 60, 75][colIdx % 6]}%` }}
            />
          </div>
        </TableCell>
      ))}

      {hasActions && (
        <TableCell className="py-3 text-right">
          <div className="flex items-center justify-end gap-1.5">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </TableCell>
      )}
    </TableRow>
  );
});

// DynamicLoading

const DynamicLoading = memo(function DynamicLoading({
  rowCount = 5,
  columnCount,
  hasActions = false,
  hasSerialNumber = false,
}: DynamicLoadingProps) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, rowIdx) => (
        <SkeletonRow
          key={rowIdx}
          rowIndex={rowIdx}
          columnCount={columnCount}
          hasActions={hasActions}
          hasSerialNumber={hasSerialNumber}
        />
      ))}
    </>
  );
});

DynamicLoading.displayName = "DynamicLoading";

export default DynamicLoading;
