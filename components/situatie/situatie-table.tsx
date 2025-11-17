"use client";
import * as React from "react";
import { DataTable, type ColumnDef } from "@/components/data-table";
import type { SituatieRow } from "@/actions/situatie";
import { Checkbox } from "@/components/ui/checkbox";
import MonthPicker from "@/components/month-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SituatieRowComponent from "@/components/situatie/situatie-row";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function SituatieTable({ rows }: { rows: SituatieRow[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialMonth = searchParams.get("month") ?? "";
  const initialFirma = searchParams.get("firma") ?? "";
  const [month, setMonth] = React.useState<string>(initialMonth); // format YYYY-MM
  const columns = React.useMemo<ColumnDef<SituatieRow>[]>(
    () => [
      { accessorKey: "firma", header: "Firma", enableSorting: true },
      {
        accessorKey: "data",
        header: "Data",
        enableSorting: true,
        sortingFn: (a, b) => {
          const at = (a.original as SituatieRow).dateTs ?? 0;
          const bt = (b.original as SituatieRow).dateTs ?? 0;
          return at === bt ? 0 : at < bt ? -1 : 1;
        },
      },
      { accessorKey: "tip", header: "Tip", enableSorting: true },
      {
        accessorKey: "avemActe",
        header: "Avem acte",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Checkbox checked={row.original.avemActe} disabled aria-label="Avem acte" />
            <span className="text-xs text-muted-foreground truncate" title={row.original.avemActeUser ?? ""}>
              {row.original.avemActeUser ?? ""}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "introdusActe",
        header: "Introdus acte",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Checkbox checked={row.original.introdusActe} disabled aria-label="Introdus acte" />
            <span className="text-xs text-muted-foreground truncate" title={row.original.introdusActeUser ?? ""}>
              {row.original.introdusActeUser ?? ""}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "verificareLuna",
        header: "Verificat acte",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Checkbox checked={row.original.verificareLuna} disabled aria-label="Verificat acte" />
            <span className="text-xs text-muted-foreground truncate" title={row.original.verificareLunaUser ?? ""}>
              {row.original.verificareLunaUser ?? ""}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "generatDeclaratii",
        header: "Generat declaratii",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Checkbox checked={row.original.generatDeclaratii} disabled aria-label="Generat declaratii" />
            <span className="text-xs text-muted-foreground truncate" title={row.original.generatDeclaratiiUser ?? ""}>
              {row.original.generatDeclaratiiUser ?? ""}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "depusDeclaratii",
        header: "Depus declaratii",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Checkbox checked={row.original.depusDeclaratii} disabled aria-label="Depus declaratii" />
            <span className="text-xs text-muted-foreground truncate" title={row.original.depusDeclaratiiUser ?? ""}>
              {row.original.depusDeclaratiiUser ?? ""}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "lunaPrintata",
        header: "Luna printata",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Checkbox checked={row.original.lunaPrintata} disabled aria-label="Luna printata" />
            <span className="text-xs text-muted-foreground truncate" title={row.original.lunaPrintataUser ?? ""}>
              {row.original.lunaPrintataUser ?? ""}
            </span>
          </div>
        ),
      },
    ],
    []
  );

  const [firma, setFirma] = React.useState<string>(initialFirma);
  // Sync URL when month or firma changes
  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (!month) params.delete("month"); else params.set("month", month);
    if (!firma) params.delete("firma"); else params.set("firma", firma);
    const qs = params.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    router.replace(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, firma]);
  // Restore state when URL changes via navigation
  React.useEffect(() => {
    const m = searchParams.get("month") ?? "";
    if (m !== month) setMonth(m);
    const f = searchParams.get("firma") ?? "";
    if (f !== firma) setFirma(f);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  const filtered = React.useMemo(() => {
    let out = rows;
    if (month) {
      const [yy, mm] = month.split("-");
      const y = Number(yy);
      const m = Number(mm) - 1; // 0-based
      if (!Number.isNaN(y) && !Number.isNaN(m)) {
        const start = new Date(y, m, 1).getTime();
        const end = new Date(y, m + 1, 1).getTime();
        out = out.filter((r) => r.dateTs >= start && r.dateTs < end);
      }
    }
    if (firma) {
      out = out.filter((r) => r.firma === firma);
    }
    return out;
  }, [rows, month, firma]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Situatie</h1>
      <DataTable
        columns={columns}
        data={filtered}
        pageSize={20}
        stickyHeader
        searchParamKey="q"
        rowComponent={SituatieRowComponent}
        primaryControl={
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Firma</label>
            <Select value={firma || undefined} onValueChange={(v) => setFirma(v === "__all__" ? "" : v)}>
              <SelectTrigger className="w-64 h-8">
                <SelectValue placeholder="Toate firmele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Toate firmele</SelectItem>
                {Array.from(new Set(rows.map((r) => r.firma))).sort((a, b) => a.localeCompare(b, "ro")).map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {firma && (
              <button
                type="button"
                onClick={() => setFirma("")}
                className="h-8 px-3 rounded border text-sm hover:bg-muted"
              >
                Reset
              </button>
            )}
          </div>
        }
        leftFilters={
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Luna</label>
            <MonthPicker value={month || undefined} onChange={(val) => setMonth(val ?? "")} buttonClassName="h-8" />
            {month && (
              <button
                type="button"
                onClick={() => setMonth("")}
                className="h-8 px-3 rounded border text-sm hover:bg-muted"
              >
                Reset
              </button>
            )}
          </div>
        }
      />
    </div>
  );
}
