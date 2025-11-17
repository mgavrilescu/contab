"use server";

import { PrismaClient } from "@/lib/generated/prisma-client";
import type { Prisma } from "@/lib/generated/prisma-client";
import { getSession } from "@/lib/auth";
import { unstable_noStore as noStore } from "next/cache";

const prisma = new PrismaClient();

export type SituatieRow = {
  clientId: number;
  firma: string;
  tip: string;
  data: string; // dd/mm/yyyy (first day of month)
  dateTs: number; // timestamp for sorting
  avemActe: boolean;
  avemActeUser?: string;
  introdusActe: boolean;
  introdusActeUser?: string;
  verificareLuna: boolean;
  verificareLunaUser?: string;
  generatDeclaratii: boolean;
  generatDeclaratiiUser?: string;
  depusDeclaratii: boolean;
  depusDeclaratiiUser?: string;
  lunaPrintata: boolean;
  lunaPrintataUser?: string;
};

const toDMY = (d: Date) => {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}/${mm}/${yy}`;
};

type StageKey = "avemActe" | "introdusActe" | "verificareLuna" | "generatDeclaratii" | "depusDeclaratii" | "lunaPrintata";
const STAGE_PATTERNS: Record<StageKey, string[]> = {
  avemActe: ["avem acte"],
  introdusActe: ["introdus acte", "introdusacte", "introducere acte"],
  verificareLuna: ["verificare luna", "verificat luna", "verificare acte", "verificat acte"],
  generatDeclaratii: ["generat declaratii", "generare declaratii", "generare declara"],
  depusDeclaratii: ["depus declaratii", "depunere declaratii", "depunere declara"],
  lunaPrintata: ["luna printata", "printat luna", "printare luna"],
};

function matchStage(title: string): StageKey[] {
  const t = title.toLowerCase();
  const hits: (keyof typeof STAGE_PATTERNS)[] = [];
  (Object.keys(STAGE_PATTERNS) as (keyof typeof STAGE_PATTERNS)[]).forEach((k) => {
    if (STAGE_PATTERNS[k].some((p) => t.includes(p))) hits.push(k);
  });
  return hits;
}

export async function getSituatieRows(): Promise<SituatieRow[]> {
  noStore();
  const session = await getSession();
  const role = (session?.user as unknown as { role?: string })?.role;
  const currentUserId = (session?.user as unknown as { id?: string })?.id;

  // Build task-level permission where (consistent with tasks list)
  const taskPermission: Prisma.TaskWhereInput =
    role === "ADMIN" || role === "MANAGER"
      ? {}
      : currentUserId
      ? { userId: Number(currentUserId) }
      : { id: -1 };

  // Fetch all tasks (permission-filtered), across all dates
  const tasks = await prisma.task.findMany({
    where: {
      ...taskPermission,
    },
    include: { client: { select: { id: true, denumire: true, tip: true } }, user: { select: { name: true, email: true } } },
    orderBy: [{ clientId: "asc" }, { date: "asc" }],
  });

  // Group by (clientId, year, month)
  type Key = string; // `${clientId}-${yyyy}-${mm}`
  const byClientMonth = new Map<Key, SituatieRow>();
  for (const t of tasks) {
    if (!t.date) continue;
    const d = new Date(t.date);
    const yyyy = d.getFullYear();
    const mm = d.getMonth(); // 0-based
    const monthStart = new Date(yyyy, mm, 1, 0, 0, 0, 0);
    const key = `${t.clientId}-${yyyy}-${mm}`;
    const existing = byClientMonth.get(key);
    const base: SituatieRow =
      existing ?? {
        clientId: t.clientId,
        firma: t.client?.denumire ?? `Client ${t.clientId}`,
        tip: String(t.client?.tip ?? ""),
        data: toDMY(monthStart),
        dateTs: monthStart.getTime(),
        avemActe: false,
        avemActeUser: undefined,
        introdusActe: false,
        introdusActeUser: undefined,
        verificareLuna: false,
        verificareLunaUser: undefined,
        generatDeclaratii: false,
        generatDeclaratiiUser: undefined,
        depusDeclaratii: false,
        depusDeclaratiiUser: undefined,
        lunaPrintata: false,
        lunaPrintataUser: undefined,
      };
    if (!existing) byClientMonth.set(key, base);

    if (t.title) {
      const label = t.user?.name || t.user?.email || undefined;
      const stages = matchStage(t.title);
      for (const s of stages) {
        if (s === "avemActe") {
          if (t.done) base.avemActe = true;
          base.avemActeUser = label ?? base.avemActeUser;
        } else if (s === "introdusActe") {
          if (t.done) base.introdusActe = true;
          base.introdusActeUser = label ?? base.introdusActeUser;
        } else if (s === "verificareLuna") {
          if (t.done) base.verificareLuna = true;
          base.verificareLunaUser = label ?? base.verificareLunaUser;
        } else if (s === "generatDeclaratii") {
          if (t.done) base.generatDeclaratii = true;
          base.generatDeclaratiiUser = label ?? base.generatDeclaratiiUser;
        } else if (s === "depusDeclaratii") {
          if (t.done) base.depusDeclaratii = true;
          base.depusDeclaratiiUser = label ?? base.depusDeclaratiiUser;
        } else if (s === "lunaPrintata") {
          if (t.done) base.lunaPrintata = true;
          base.lunaPrintataUser = label ?? base.lunaPrintataUser;
        }
      }
    }
  }

  // Sort by firma then date descending
  return Array.from(byClientMonth.values()).sort((a, b) => {
    const nf = a.firma.localeCompare(b.firma, "ro");
    if (nf !== 0) return nf;
    return b.dateTs - a.dateTs;
  });
}
