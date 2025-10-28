"use client";
import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  Row as TanstackRow,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageSize?: number;
  rowComponent?: React.ComponentType<{ row: TanstackRow<TData> }>; // optional custom row renderer
};

export function DataTable<TData, TValue>({ columns, data, pageSize = 10, rowComponent: RowComponent }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [query, setQuery] = React.useState("");
  const [globalFilter, setGlobalFilter] = React.useState<string>("");

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize } },
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Input
          placeholder="Search..."
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            // Use a true global filter (OR across columns) instead of AND-ing column filters
            setGlobalFilter(val);
          }}
          className="w-64"
        />
        <div className="text-xs text-muted-foreground">
          {table.getFilteredRowModel().rows.length} results
        </div>
      </div>
      <div className="overflow-x-auto bg-white border rounded-md">
        <Table className="text-sm">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="px-4 py-2 border-b">
                      {header.isPlaceholder ? null : (
                        <div
                          className={header.column.getCanSort() ? "cursor-pointer select-none" : undefined}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{ asc: " ▲", desc: " ▼" }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                RowComponent ? (
                  <RowComponent key={row.id} row={row} />
                ) : (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="odd:bg-white even:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-2 border-b">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end gap-2">
        <div className="text-xs text-muted-foreground mr-auto">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  );
}

export type { ColumnDef };
