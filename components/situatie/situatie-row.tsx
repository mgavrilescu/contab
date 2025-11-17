"use client";
import * as React from "react";
import { Row } from "@tanstack/react-table";
import { TableRow, TableCell } from "@/components/ui/table";
import { flexRender } from "@tanstack/react-table";
import type { SituatieRow } from "@/actions/situatie";

export default function SituatieRowComponent<TData>({ row }: { row: Row<TData> }) {
  const s = row.original as unknown as SituatieRow;
  const stageCols = new Set([
    "avemActe",
    "introdusActe",
    "verificareLuna",
    "generatDeclaratii",
    "depusDeclaratii",
    "lunaPrintata",
  ]);

  return (
    <TableRow data-state={row.getIsSelected() && "selected"}>
      {row.getVisibleCells().map((cell) => {
        const colId = cell.column.id;
        let extra = "";
        if (stageCols.has(colId)) {
          let val = false;
          if (colId === "avemActe") val = s.avemActe;
          else if (colId === "introdusActe") val = s.introdusActe;
          else if (colId === "verificareLuna") val = s.verificareLuna;
          else if (colId === "generatDeclaratii") val = s.generatDeclaratii;
          else if (colId === "depusDeclaratii") val = s.depusDeclaratii;
          else if (colId === "lunaPrintata") val = s.lunaPrintata;
          extra = val ? " bg-green-100 hover:bg-green-50" : " bg-red-100 hover:bg-red-50";
        }
        return (
          <TableCell key={cell.id} className={`px-3 py-2 md:px-4 border-b align-middle${extra}`}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        );
      })}
    </TableRow>
  );
}
