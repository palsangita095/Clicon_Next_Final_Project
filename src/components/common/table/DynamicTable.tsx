"use client";

import React, { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import DynamicSelectCell from "./DynamicSelectCell";
import DynamicActionCell from "./DynamicActionCell";
import DynamicLoading from "./DynamicLoading";
import DynamicEmptyState from "./DynamicEmptyState";
import DynamicPagination from "./DynamicPagination";

import type {
  DynamicTableProps,
  ColumnDef,
  SerialNumberConfig,
  ColumnAlign,
  DropdownColumnDef,
  BadgeColumnDef,
  ImageColumnDef,
} from "@/types/type/table.type";



function resolveRowKey<TRow>(
  row: TRow,
  rowKey: DynamicTableProps<TRow>["rowKey"],
): string | number {
  if (typeof rowKey === "function") return rowKey(row);
  const val = row[rowKey as keyof TRow];
  return val as string | number;
}

function getCellValue<TRow>(row: TRow, key: keyof TRow | string): unknown {
  return row[key as keyof TRow];
}

const ALIGN_CLASS: Record<ColumnAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

function alignClass(align?: ColumnAlign): string {
  return ALIGN_CLASS[align ?? "left"];
}

function shouldShowActionsColumn<TRow>(
  actions: DynamicTableProps<TRow>["actions"],
): boolean {
  if (!actions) return false;
  return !!(actions.edit?.show === true || actions.delete?.show === true);
}

function resolveSerialConfig(
  serialNumber: DynamicTableProps<unknown>["serialNumber"],
): SerialNumberConfig | null {
  if (!serialNumber) return null;
  if (serialNumber === true) return { header: "#", align: "center" };
  return { header: "#", align: "center", ...serialNumber };
}

function serialOffset(
  pagination: DynamicTableProps<unknown>["pagination"],
): number {
  if (!pagination?.enabled) return 0;
  return (pagination.page - 1) * pagination.pageSize;
}

// Cell Renderers

function renderTextCell(value: unknown): React.ReactNode {
  const text = value == null ? "—" : String(value);
  return (
    <span className="text-sm text-foreground truncate max-w-50 block">
      {text}
    </span>
  );
}

function renderImageCell<TRow>(
  value: unknown,
  row: TRow,
  col: ImageColumnDef<TRow>,
): React.ReactNode {
  const src = typeof value === "string" ? value : "";
  const fallback = col.image?.getFallback
    ? col.image.getFallback(row)
    : src
      ? src.charAt(0).toUpperCase()
      : "?";
  const alt = col.image?.getAlt ? col.image.getAlt(row) : src || "avatar";

  return (
    <Avatar className={cn("h-8 w-8", col.image?.avatarClassName)}>
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
        {fallback}
      </AvatarFallback>
    </Avatar>
  );
}

function renderBadgeCell<TRow>(
  value: unknown,
  row: TRow,
  col: BadgeColumnDef<TRow>,
): React.ReactNode {
  const label = col.badge?.getLabel
    ? col.badge.getLabel(row)
    : value == null
      ? "—"
      : String(value);
  const variant = col.badge?.getVariant
    ? col.badge.getVariant(row)
    : "secondary";

  return (
    <Badge variant={variant} className="text-xs font-medium">
      {label}
    </Badge>
  );
}



interface DynamicTableRowProps<TRow, TOption extends Record<string, unknown>> {
  row: TRow;
  rowIndex: number;
  visibleColumns: ColumnDef<TRow, TOption>[];
  serialConfig: SerialNumberConfig | null;
  serialOffsetValue: number;
  showActions: boolean;
  actions: DynamicTableProps<TRow, TOption>["actions"];
}

const DynamicTableRow = memo(function DynamicTableRow<
  TRow,
  TOption extends Record<string, unknown>,
>({
  row,
  rowIndex,
  visibleColumns,
  serialConfig,
  serialOffsetValue,
  showActions,
  actions,
}: DynamicTableRowProps<TRow, TOption>) {
  return (
    <TableRow className="hover:bg-muted/50 transition-colors border-b border-border">
      {serialConfig && (
        <TableCell
          className={cn(
            "w-12 text-muted-foreground text-sm font-mono select-none",
            alignClass(serialConfig.align),
          )}
        >
          {serialOffsetValue + rowIndex + 1}
        </TableCell>
      )}

      {visibleColumns.map((col) => {
        const value = getCellValue(row, col.key);
        const cellAlign = alignClass(col.align);

        if (col.render) {
          return (
            <TableCell
              key={String(col.key)}
              className={cn("py-3 px-4", cellAlign)}
            >
              {col.render(value, row)}
            </TableCell>
          );
        }

        let cellContent: React.ReactNode;

        switch (col.type) {
          case "text":
            cellContent = renderTextCell(value);
            break;

          case "image":
            cellContent = renderImageCell(
              value,
              row,
              col as ImageColumnDef<TRow>,
            );
            break;

          case "badge":
            cellContent = renderBadgeCell(
              value,
              row,
              col as BadgeColumnDef<TRow>,
            );
            break;

          case "dropdown": {
            const dropCol = col as DropdownColumnDef<TRow, TOption>;
            cellContent = (
              <DynamicSelectCell<TRow>
                row={row}
                value={value == null ? "" : String(value)}
                dropdown={dropCol.dropdown as never}
              />
            );
            break;
          }

          default:
            cellContent = renderTextCell(value);
        }

        return (
          <TableCell
            key={String(col.key)}
            className={cn("py-3 px-4", cellAlign)}
          >
            {cellContent}
          </TableCell>
        );
      })}

      {showActions && actions && (
        <TableCell className="py-3 px-4 text-right">
          <DynamicActionCell<TRow> row={row} actions={actions} />
        </TableCell>
      )}
    </TableRow>
  );
}) as <TRow, TOption extends Record<string, unknown>>(
  props: DynamicTableRowProps<TRow, TOption>,
) => React.ReactElement;



function DynamicTableInner<
  TRow,
  TOption extends Record<string, unknown> = Record<string, unknown>,
>({
  columns,
  data,
  rowKey,
  loading = false,
  emptyState,
  serialNumber,
  actions,
  pagination,
  loadingConfig,
  className,
}: DynamicTableProps<TRow, TOption>) {
  const visibleColumns = useMemo(
    () => columns.filter((col) => col.visible !== false),
    [columns],
  );

  const showActions = useMemo(
    () => shouldShowActionsColumn(actions),
    [actions],
  );

  const serialConfig = useMemo(
    () =>
      resolveSerialConfig(
        serialNumber as DynamicTableProps<unknown>["serialNumber"],
      ),
    [serialNumber],
  );

  const totalColumnCount = useMemo(
    () =>
      visibleColumns.length + (serialConfig ? 1 : 0) + (showActions ? 1 : 0),
    [visibleColumns.length, serialConfig, showActions],
  );

  const serialOffsetValue = useMemo(
    () => serialOffset(pagination as DynamicTableProps<unknown>["pagination"]),
    [pagination],
  );

  return (
    <div className={cn("flex flex-col gap-4 w-full", className)}>
      <div
        className="w-full overflow-x-auto rounded-lg border border-border bg-card"
        role="region"
        aria-label="Data table"
      >
        <Table className="w-full min-w-150">
          <TableHeader>
            <TableRow className="bg-muted/60 hover:bg-muted/60 border-b border-border">
              {serialConfig && (
                <TableHead
                  className={cn(
                    "w-12 text-muted-foreground text-xs font-semibold uppercase tracking-wider py-3 px-4",
                    alignClass(serialConfig.align),
                  )}
                  scope="col"
                >
                  {serialConfig.header ?? "#"}
                </TableHead>
              )}

              {visibleColumns.map((col) => (
                <TableHead
                  key={String(col.key)}
                  className={cn(
                    "text-muted-foreground text-xs font-semibold uppercase tracking-wider py-3 px-4 whitespace-nowrap",
                    alignClass(col.align),
                  )}
                  scope="col"
                  aria-sort={col.sortable ? "none" : undefined}
                >
                  <span className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <svg
                        aria-hidden="true"
                        className="w-3 h-3 text-muted-foreground/50 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 9l4-4 4 4M16 15l-4 4-4-4"
                        />
                      </svg>
                    )}
                  </span>
                </TableHead>
              ))}

              {showActions && (
                <TableHead
                  className="text-muted-foreground text-xs font-semibold uppercase tracking-wider py-3 px-4 text-right whitespace-nowrap"
                  scope="col"
                >
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading && (
              <DynamicLoading
                columnCount={visibleColumns.length}
                rowCount={loadingConfig?.skeletonRows}
                hasActions={showActions}
                hasSerialNumber={!!serialConfig}
              />
            )}

            {!loading && data.length === 0 && emptyState && (
              <DynamicEmptyState
                title={emptyState.title}
                description={emptyState.description}
                action={emptyState.action}
                columnCount={totalColumnCount}
              />
            )}

            {!loading &&
              data.map((row, rowIndex) => {
                const key = resolveRowKey(row, rowKey);
                return (
                  <DynamicTableRow<TRow, TOption>
                    key={key}
                    row={row}
                    rowIndex={rowIndex}
                    visibleColumns={visibleColumns}
                    serialConfig={serialConfig}
                    serialOffsetValue={serialOffsetValue}
                    showActions={showActions}
                    actions={actions}
                  />
                );
              })}
          </TableBody>
        </Table>
      </div>

      {pagination?.enabled && <DynamicPagination pagination={pagination} />}
    </div>
  );
}

export const DynamicTable = memo(
  DynamicTableInner,
) as typeof DynamicTableInner & {
  displayName?: string;
};

DynamicTable.displayName = "DynamicTable";
