"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/data-table";
import TaskRowComponent from "@/components/tasks/task-row";
import type { TaskRow } from "@/actions/tasks";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type UserOpt = { id: number; label: string };

export default function TasksTable({ rows, users }: { rows: TaskRow[]; users: UserOpt[] }) {
  const [userFilter, setUserFilter] = useState<string>("all");

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
      {
        accessorKey: "date",
        header: "Data",
        enableSorting: true,
        sortingFn: (a, b) => {
          const at = (a.original as TaskRow).dateTs ?? 0;
          const bt = (b.original as TaskRow).dateTs ?? 0;
          return at === bt ? 0 : at < bt ? -1 : 1;
        },
      },
      { accessorKey: "user", header: "User", enableSorting: true },
      { accessorKey: "client", header: "Client", enableSorting: true },
      { accessorKey: "objective", header: "Obiectiv", enableSorting: false },
      { accessorKey: "blocked", header: "Blocata", enableSorting: false },
      { accessorKey: "done", header: "Finalizat", enableSorting: true },
    ],
    []
  );

  const filtered = useMemo(() => {
    if (userFilter === "all") return rows;
    const uid = Number(userFilter);
    return rows.filter((r) => r.userId === uid);
  }, [rows, userFilter]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold">Taskuri</h1>
        <Button asChild variant="outline" size="sm" className="ml-auto">
          <Link href="/taskuri/edit/new">Task nou</Link>
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={filtered}
        pageSize={10}
        rowComponent={TaskRowComponent}
        stickyHeader
        leftFilters={
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">User</span>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-56 h-8">
                <SelectValue placeholder="Filtreaza dupa user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toti</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={String(u.id)}>
                    {u.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />
    </div>
  );
}
