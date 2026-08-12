"use client";

import React, { memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pencil, Trash2 } from "lucide-react";
import type { TableActions } from "@/types/type/table.type";



interface ActionButtonProps {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
  variant?: "edit" | "delete";
}

const ActionButton = memo(function ActionButton({
  label,
  onClick,
  icon,
  variant = "edit",
}: ActionButtonProps) {
  const isDelete = variant === "delete";

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClick}
            aria-label={label}
            className={[
              "h-8 w-8 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-ring",
              isDelete
                ? "text-destructive hover:bg-destructive/10 hover:text-destructive"
                : "text-muted-foreground hover:bg-accent/10 hover:text-accent",
            ].join(" ")}
          >
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

ActionButton.displayName = "ActionButton";



interface DynamicActionCellProps<TData> {
  row: TData;
  actions: TableActions<TData>;
}

function DynamicActionCell<TData>({
  row,
  actions,
}: DynamicActionCellProps<TData>) {
  const showEdit = actions.edit?.show ?? false;
  const showDelete = actions.delete?.show ?? false;

  if (!showEdit && !showDelete) return null;

  return (
    <div
      className="flex items-center justify-end gap-1"
      role="group"
      aria-label="Row actions"
    >
      {showEdit && actions.edit?.onClick && (
        <ActionButton
          label={actions.edit.label ?? "Edit"}
          variant="edit"
          icon={<Pencil className="h-3.5 w-3.5" />}
          onClick={() => actions.edit!.onClick!(row)}
        />
      )}
      {showDelete && actions.delete?.onClick && (
        <ActionButton
          label={actions.delete.label ?? "Delete"}
          variant="delete"
          icon={<Trash2 className="h-3.5 w-3.5" />}
          onClick={() => actions.delete!.onClick!(row)}
        />
      )}
    </div>
  );
}

export default memo(DynamicActionCell) as typeof DynamicActionCell;
