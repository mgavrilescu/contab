"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/data-table";
import TaskRowComponent from "@/components/tasks/task-row";
import type { TaskRow } from "@/actions/tasks";

export default function TasksTable({ rows }: { rows: TaskRow[] }) {
  const columns: ColumnDef<TaskRow>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Titlu",
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-indigo-700 underline">
            <Link href={`/taskuri/edit/${row.original.id}`}>{row.original.title}</Link>
          </span>
        ),
      },
      { accessorKey: "date", header: "Data", enableSorting: true },
      { accessorKey: "user", header: "User", enableSorting: true },
      { accessorKey: "client", header: "Client", enableSorting: true },
      { accessorKey: "objective", header: "Obiectiv", enableSorting: false },
      { accessorKey: "blocked", header: "Blocata", enableSorting: false },
      { accessorKey: "done", header: "Finalizat", enableSorting: true },
    ],
    []
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold">Taskuri</h1>
        <Button asChild variant="outline" size="sm" className="ml-auto">
          <Link href="/taskuri/edit/new">Task nou</Link>
        </Button>
      </div>
      <DataTable columns={columns} data={rows} pageSize={10} rowComponent={TaskRowComponent} stickyHeader />
    </div>
  );
}
