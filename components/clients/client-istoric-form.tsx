"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { $Enums } from "@/lib/generated/prisma-client";

export type IstoricFormValues = {
  anul: number;
  cifraAfaceri: number;
  inventar: boolean;
  bilantSemIun: $Enums.DaNuNuECazul;
  bilantAnual: $Enums.DaNuNuECazul;
};

type Props = {
  initial?: Partial<IstoricFormValues>;
  onSubmit: (formData: FormData) => Promise<IstoricFormValues | void>;
  submitLabel?: string;
};

export default function ClientIstoricForm({ initial, onSubmit, submitLabel = "Save" }: Props) {
  const [busy, setBusy] = useState(false);
  const [anul, setAnul] = useState<number>(initial?.anul ?? new Date().getFullYear());
  const [cifraAfaceri, setCifraAfaceri] = useState<number>(initial?.cifraAfaceri ?? 0);
  const [inventar, setInventar] = useState<boolean>(initial?.inventar ?? false);
  const [bilantSemIun, setBilantSemIun] = useState<$Enums.DaNuNuECazul>(initial?.bilantSemIun ?? "NU_E_CAZUL");
  const [bilantAnual, setBilantAnual] = useState<$Enums.DaNuNuECazul>(initial?.bilantAnual ?? "NU_E_CAZUL");

  // Resync from server-provided fresh props on any remount
  useEffect(() => {
    setAnul(initial?.anul ?? new Date().getFullYear());
    setCifraAfaceri(initial?.cifraAfaceri ?? 0);
    setInventar(initial?.inventar ?? false);
    setBilantSemIun((initial?.bilantSemIun as $Enums.DaNuNuECazul) ?? "NU_E_CAZUL");
    setBilantAnual((initial?.bilantAnual as $Enums.DaNuNuECazul) ?? "NU_E_CAZUL");
  }, [initial]);

  async function handleAction(fd: FormData) {
    setBusy(true);
    try {
      const saved = await onSubmit(fd);
      if (saved) {
        setAnul(saved.anul);
        setCifraAfaceri(saved.cifraAfaceri);
        setInventar(saved.inventar);
        setBilantSemIun(saved.bilantSemIun);
        setBilantAnual(saved.bilantAnual);
      }
      toast.success("Istoric salvat");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form action={handleAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label className="mb-2 text-purple-800">Anul</Label>
        <Input type="number" name="anul" value={anul} onChange={(e) => setAnul(parseInt(e.target.value || "0", 10) || 0)} required />
      </div>
      <div>
        <Label className="mb-2 text-purple-800">Cifra de afaceri</Label>
        <Input type="number" step="0.01" name="cifraAfaceri" value={cifraAfaceri} onChange={(e) => setCifraAfaceri(parseFloat(e.target.value || "0") || 0)} />
      </div>

      <div>
        <Label className="mb-2 text-purple-800">Bilant semestrial iunie</Label>
        <input type="hidden" name="bilantSemIun" value={bilantSemIun} />
        <Select value={bilantSemIun} onValueChange={(v: $Enums.DaNuNuECazul) => setBilantSemIun(v)}>
          <SelectTrigger><SelectValue placeholder="Alege" /></SelectTrigger>
          <SelectContent>
            {(["DA","NU","NU_E_CAZUL"] as $Enums.DaNuNuECazul[]).map(v => (
              <SelectItem key={v} value={v}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-2 text-purple-800">Bilant anual</Label>
        <input type="hidden" name="bilantAnual" value={bilantAnual} />
        <Select value={bilantAnual} onValueChange={(v: $Enums.DaNuNuECazul) => setBilantAnual(v)}>
          <SelectTrigger><SelectValue placeholder="Alege" /></SelectTrigger>
          <SelectContent>
            {(["DA","NU","NU_E_CAZUL"] as $Enums.DaNuNuECazul[]).map(v => (
              <SelectItem key={v} value={v}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Checkbox at the bottom */}
      <div className="md:col-span-2 mt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input type="hidden" name="inventar" value={inventar ? "true" : "false"} />
          <label className="inline-flex items-center gap-2 text-purple-800"><Checkbox checked={inventar} onCheckedChange={(v) => setInventar(!!v)} /><span>Inventar</span></label>
        </div>
      </div>

      <div className="md:col-span-2 flex justify-end gap-2 mt-4">
        <Button type="submit" disabled={busy}>{submitLabel}</Button>
      </div>
    </form>
  );
}
