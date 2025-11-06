"use server"

import { PrismaClient } from "@/lib/generated/prisma-client";
import type { $Enums } from "@/lib/generated/prisma-client";
import { unstable_noStore as noStore, revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export type IstoricValues = {
  anul: number;
  cifraAfaceri: number;
  inventar: boolean;
  bilantSemIun: $Enums.DaNuNuECazul;
  bilantAnual: $Enums.DaNuNuECazul;
};

function bool(v: FormDataEntryValue | null): boolean {
  return v === "on" || v === "true" || v === "1";
}

function int(v: FormDataEntryValue | null, d = 0): number {
  if (typeof v !== "string") return d;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : d;
}

function num(v: FormDataEntryValue | null, d = 0): number {
  if (typeof v !== "string") return d;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : d;
}

export async function getClientIstoric(clientId: number): Promise<IstoricValues | null> {
  noStore();
  const i = await prisma.istoric.findUnique({ where: { clientId } });
  if (!i) return null;
  return {
    anul: i.anul,
    cifraAfaceri: i.cifraAfaceri,
    inventar: i.inventar,
    bilantSemIun: i.bilantSemIun,
    bilantAnual: i.bilantAnual,
  };
}

export async function upsertClientIstoric(clientId: number, formData: FormData): Promise<IstoricValues> {
  "use server";
  const anul = int(formData.get("anul"));
  const cifraAfaceri = num(formData.get("cifraAfaceri"));
  const inventar = bool(formData.get("inventar"));
  const bilantSemIun = (formData.get("bilantSemIun") as $Enums.DaNuNuECazul | null) ?? "NU_E_CAZUL";
  const bilantAnual = (formData.get("bilantAnual") as $Enums.DaNuNuECazul | null) ?? "NU_E_CAZUL";

  if (!anul) throw new Error("Anul este obligatoriu");

  const saved = await prisma.istoric.upsert({
    where: { clientId },
    create: { clientId, anul, cifraAfaceri, inventar, bilantSemIun, bilantAnual },
    update: { anul, cifraAfaceri, inventar, bilantSemIun, bilantAnual },
  });

  // Ensure the edit page gets fresh data on any server re-render/remount
  revalidatePath(`/clients/edit/${clientId}`);

  return {
    anul: saved.anul,
    cifraAfaceri: saved.cifraAfaceri,
    inventar: saved.inventar,
    bilantSemIun: saved.bilantSemIun,
    bilantAnual: saved.bilantAnual,
  };
}
