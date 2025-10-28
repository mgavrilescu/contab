"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DataTable, type ColumnDef } from "@/components/data-table";
import ClientRow from "@/components/clients/client-row";

type Row = {
  name: string;
  tip: string;
  deLa?: string;
  panaLa?: string;
  tarifConta?: number;
  tarifBilant?: number;
  contractGen?: string;
  contractSemnat?: string;
  probleme?: string[];
};

const rows: Row[] = [
  {
    name: "Alexandru Olteanu",
    tip: "PFA",
    deLa: "2017-07-01",
    tarifConta: 150,
    tarifBilant: 100,
    contractGen: "14 din 01/08/2009",
    probleme: ["Registru UC", "Manual pol. contabile"],
  },
  {
    name: "Atolpi",
    tip: "SRL",
    deLa: "2017-07-01",
    tarifConta: 150,
    tarifBilant: 100,
    contractGen: "15 din 01/08/2011",
    contractSemnat: "un fisier.pdf",
  },
  {
    name: "FIA Integra",
    tip: "SRL",
    deLa: "2017-07-01",
    tarifConta: 150,
    tarifBilant: 100,
    contractGen: "16 din 01/08/2011",
    contractSemnat: "fia.pdf",
  },
  {
    name: "Zara",
    tip: "SRL",
    deLa: "2017-07-01",
    panaLa: "2017-07-01",
    tarifConta: 150,
    tarifBilant: 100,
  },
];

export default function ClientsPage() {
  const [showFormer, setShowFormer] = useState(true);
  const [openCabinet, setOpenCabinet] = useState(false);
  const data = useMemo(() => (showFormer ? rows : rows.filter((r) => !r.panaLa)), [showFormer]);

  const columns: ColumnDef<Row>[] = [
    {
      accessorKey: "name",
      header: "Firma",
      cell: ({ row }) => (
        <span className="text-blue-700 underline">
          <Link href="#">{row.original.name}</Link>
        </span>
      ),
    },
    { accessorKey: "tip", header: "Tip" },
    {
      accessorKey: "deLa",
      header: "De la",
      cell: ({ row }) => (
        <Input type="date" defaultValue={row.original.deLa} className="h-8 px-2 py-1" />
      ),
    },
    {
      accessorKey: "panaLa",
      header: "Pana la",
      cell: ({ row }) =>
        row.original.panaLa ? (
          <Input type="date" defaultValue={row.original.panaLa} className="h-8 px-2 py-1" />
        ) : (
          <Button variant="destructive" size="sm">incheie</Button>
        ),
    },
    {
      accessorKey: "tarifConta",
      header: "Tarif servicii conta",
      cell: ({ row }) => (
        <Input type="number" defaultValue={row.original.tarifConta} className="h-8 px-2 py-1 w-24" />
      ),
    },
    {
      accessorKey: "tarifBilant",
      header: "Tarif bilant",
      cell: ({ row }) => (
        <Input type="number" defaultValue={row.original.tarifBilant} className="h-8 px-2 py-1 w-24" />
      ),
    },
    {
      accessorKey: "contractGen",
      header: "Contract generat",
      cell: ({ row }) =>
        row.original.contractGen ? (
          <span className="text-blue-700 underline">
            <Link href="#">{row.original.contractGen}</Link>
          </span>
        ) : (
          <Button variant="outline" size="sm">gen.</Button>
        ),
    },
    {
      accessorKey: "contractSemnat",
      header: "Contract semnat",
      cell: ({ row }) =>
        row.original.contractSemnat ? (
          <span className="text-blue-700 underline">
            <Link href="#">{row.original.contractSemnat}</Link>
          </span>
        ) : (
          <Button variant="destructive" size="sm">incarca</Button>
        ),
    },
    {
      id: "probleme",
      header: "Probleme",
      cell: ({ row }) =>
        row.original.probleme ? (
          <ul className="list-disc pl-4 space-y-1">
            {row.original.probleme.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        ) : null,
    },
    
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav (simplified) */}
      <nav className="bg-gray-900 text-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-2xl font-semibold tracking-tight">ConTask</span>
            <div className="hidden md:flex items-center gap-4 text-sm">
              <Link href="#" className="hover:underline">Situatie</Link>
              <Link href="#" className="hover:underline">Taskuri</Link>
              <Link href="#" className="underline">Clienti</Link>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <span className="text-gray-300">Welcome, ElenaO</span>
            <Link href="/signin" className="hover:underline">Logout</Link>
          </div>
        </div>
      </nav>

      {/* Controls */}
      <div className="bg-gray-100 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm">
              <Checkbox
                checked={showFormer}
                onCheckedChange={(v) => setShowFormer(Boolean(v))}
              />
              Afiseaza fostii clienti
            </label>
            <Button variant="outline" size="sm">
              <span className="i-plus">+</span> client nou
            </Button>
            <Button variant="outline" size="sm" onClick={() => setOpenCabinet(true)}>
              <span className="i-edit">✎</span> date cabinet
            </Button>
          </div>
        </div>
      </div>

      {/* Table with @tanstack/react-table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <DataTable
          columns={columns}
          data={data}
          pageSize={10}
          rowComponent={ClientRow}
        />
      </div>

      {/* Cabinet modal */}
      <Dialog open={openCabinet} onOpenChange={setOpenCabinet}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editeaza datele cabinetului de contabilitate</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1 block">Denumire</Label>
              <Input defaultValue="Voitto Tethys SRL" />
            </div>
            <div>
              <Label className="mb-1 block">Reprezentant</Label>
              <Input defaultValue="Rosescu Elena" />
            </div>
            <div>
              <Label className="mb-1 block">CUI</Label>
              <Input defaultValue="RO12345678" />
            </div>
            <div>
              <Label className="mb-1 block">Nr Reg Com</Label>
              <Input defaultValue="J40/1234/2009" />
            </div>
            <div>
              <Label className="mb-1 block">Nr Autorizatie</Label>
              <Input defaultValue="0011108/2016" />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-1 block">Adresa</Label>
              <Input defaultValue="Str. Dumitru Ruse nr 17, sector 5, Bucuresti" />
            </div>
            <div>
              <Label className="mb-1 block">Banca</Label>
              <Input defaultValue="ING" />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-1 block">IBAN</Label>
              <Input defaultValue="RO33INGB0000999912345678" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCabinet(false)}>Cancel</Button>
            <Button onClick={() => setOpenCabinet(false)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

