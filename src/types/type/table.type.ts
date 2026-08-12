import React from "react";

export type ColumnType = "text" | "image" | "badge" | "dropdown" | "custom";

export type ColumnAlign = "left" | "center" | "right";

export interface DropdownConfig<TRow, TOption extends Record<string, unknown>> {
  options: TOption[];
  valueKey: keyof TOption;
  labelKey: keyof TOption;
  onChange: (row: TRow, newValue: string) => void;
}

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export interface BadgeConfig<TRow> {
  getVariant?: (row: TRow) => BadgeVariant;
  getLabel?: (row: TRow) => string;
}

export interface ImageConfig<TRow> {
  getFallback?: (row: TRow) => string;
  getAlt?: (row: TRow) => string;
  avatarClassName?: string;
}

interface BaseColumnDef<TRow> {
  key: keyof TRow | string;
  header: string;
  visible?: boolean;
  align?: ColumnAlign;
  sortable?: boolean;
  render?: (value: unknown, row: TRow) => React.ReactNode;
}

export interface TextColumnDef<TRow> extends BaseColumnDef<TRow> {
  type: "text";
}

export interface ImageColumnDef<TRow> extends BaseColumnDef<TRow> {
  type: "image";
  image?: ImageConfig<TRow>;
}

export interface BadgeColumnDef<TRow> extends BaseColumnDef<TRow> {
  type: "badge";
  badge?: BadgeConfig<TRow>;
}

export interface DropdownColumnDef<
  TRow,
  TOption extends Record<string, unknown> = Record<string, unknown>,
> extends BaseColumnDef<TRow> {
  type: "dropdown";
  dropdown: DropdownConfig<TRow, TOption>;
}

export interface CustomColumnDef<TRow> extends BaseColumnDef<TRow> {
  type: "custom";
  render: (value: unknown, row: TRow) => React.ReactNode;
}

export type ColumnDef<
  TRow,
  TOption extends Record<string, unknown> = Record<string, unknown>,
> =
  | TextColumnDef<TRow>
  | ImageColumnDef<TRow>
  | BadgeColumnDef<TRow>
  | DropdownColumnDef<TRow, TOption>
  | CustomColumnDef<TRow>;

export interface ActionConfig<TRow> {
  show: boolean;
  onClick: (row: TRow) => void;
  label?: string;
}

export interface ActionsConfig<TRow> {
  edit?: ActionConfig<TRow>;
  delete?: ActionConfig<TRow>;
}

export type TableActions<TRow> = ActionsConfig<TRow>;

export interface PaginationConfig {
  enabled: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export interface EmptyStateConfig {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export interface LoadingConfig {
  skeletonRows?: number;
}

export type RowKey<TRow> = keyof TRow | ((row: TRow) => string | number);

export interface SerialNumberConfig {
  header?: string;
  align?: ColumnAlign;
}

export interface DynamicTableProps<
  TRow,
  TOption extends Record<string, unknown> = Record<string, unknown>,
> {
  columns: ColumnDef<TRow, TOption>[];
  data: TRow[];
  rowKey: RowKey<TRow>;
  loading?: boolean;
  emptyState?: EmptyStateConfig;
  serialNumber?: boolean | SerialNumberConfig;
  actions?: ActionsConfig<TRow>;
  pagination?: PaginationConfig;
  loadingConfig?: LoadingConfig;
  className?: string;
}

export interface DynamicActionCellProps<TRow> {
  row: TRow;
  actions: ActionsConfig<TRow>;
}

export interface DynamicSelectCellProps<
  TRow,
  TOption extends Record<string, unknown>,
> {
  row: TRow;
  currentValue: string;
  config: DropdownConfig<TRow, TOption>;
}

export type DynamicPaginationProps = PaginationConfig;

export type DynamicEmptyStateProps = EmptyStateConfig & { columnCount: number };

export interface DynamicLoadingProps {
  columnCount: number;
  skeletonRows?: number;
}
