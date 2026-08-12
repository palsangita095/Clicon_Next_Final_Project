"use client";

import React, { memo, useCallback } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { PaginationConfig } from "@/types/type/table.type";

//  Props
interface DynamicPaginationProps {
  pagination: PaginationConfig;
}

//  Helpers
function buildPageRange(
  current: number,
  total: number,
): (number | "ellipsis-start" | "ellipsis-end")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [];
  const showLeftEllipsis = current > 4;
  const showRightEllipsis = current < total - 3;

  pages.push(1);

  if (showLeftEllipsis) {
    pages.push("ellipsis-start");
  } else {
    for (let i = 2; i <= Math.min(4, total - 1); i++) pages.push(i);
  }

  if (showLeftEllipsis && showRightEllipsis) {
    for (let i = current - 1; i <= current + 1; i++) pages.push(i);
  }

  if (showRightEllipsis) {
    pages.push("ellipsis-end");
  } else {
    for (let i = Math.max(total - 3, 2); i <= total - 1; i++) pages.push(i);
  }

  pages.push(total);

  return pages;
}

//  DynamicPagination
const DynamicPagination = memo(function DynamicPagination({
  pagination,
}: DynamicPaginationProps) {
  const { page, pageSize, total, onPageChange } = pagination;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  const rangeStart = Math.min((page - 1) * pageSize + 1, total);
  const rangeEnd = Math.min(page * pageSize, total);

  const pageRange = buildPageRange(page, totalPages);

  const handlePage = useCallback(
    (target: number) => {
      if (target === page || target < 1 || target > totalPages) return;
      onPageChange(target);
    },
    [page, totalPages, onPageChange],
  );

  if (total === 0) return null;

  return (
    <div
      className="flex flex-col items-center justify-between gap-3 px-2 py-3 sm:flex-row sm:gap-0"
      aria-label="Table pagination"
    >
      {/* Results summary */}
      <p className="order-2 text-xs text-muted-foreground sm:order-1">
        Showing{" "}
        <span className="font-medium text-foreground">{rangeStart}</span>
        {" – "}
        <span className="font-medium text-foreground">{rangeEnd}</span>
        {" of "}
        <span className="font-medium text-foreground">{total}</span>
        {" results"}
      </p>

      {/* Pagination controls */}
      <div className="order-1 sm:order-2">
        <Pagination>
          <PaginationContent className="gap-0.5">
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePage(page - 1);
                }}
                aria-disabled={isFirstPage}
                tabIndex={isFirstPage ? -1 : 0}
                className={[
                  "h-8 gap-1 px-2.5 text-xs",
                  isFirstPage
                    ? "pointer-events-none opacity-40"
                    : "hover:bg-accent/10 hover:text-accent",
                ].join(" ")}
              />
            </PaginationItem>

            {pageRange.map((item, idx) => {
              if (item === "ellipsis-start" || item === "ellipsis-end") {
                return (
                  <PaginationItem key={item}>
                    <PaginationEllipsis className="h-8 w-8" />
                  </PaginationItem>
                );
              }

              const isActive = item === page;

              return (
                <PaginationItem key={`page-${item}-${idx}`}>
                  <PaginationLink
                    href="#"
                    isActive={isActive}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePage(item);
                    }}
                    aria-current={isActive ? "page" : undefined}
                    aria-label={`Go to page ${item}`}
                    className={[
                      "h-8 w-8 text-xs",
                      isActive
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 pointer-events-none"
                        : "hover:bg-accent/10 hover:text-accent",
                    ].join(" ")}
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePage(page + 1);
                }}
                aria-disabled={isLastPage}
                tabIndex={isLastPage ? -1 : 0}
                className={[
                  "h-8 gap-1 px-2.5 text-xs",
                  isLastPage
                    ? "pointer-events-none opacity-40"
                    : "hover:bg-accent/10 hover:text-accent",
                ].join(" ")}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
});

DynamicPagination.displayName = "DynamicPagination";

export default DynamicPagination;
