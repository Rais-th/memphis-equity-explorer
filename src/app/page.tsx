import { notFound } from "next/navigation";
import Dashboard from "@/components/Dashboard";
import { loadBoundaries, loadCitywide, loadDistricts, loadMeta } from "@/lib/data";
import fs from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-static";
export const revalidate = 3600;

async function loadCitations(): Promise<{
  citationMix: { moving: number; nonMoving: number; other: number; total: number };
  citationsByRace: Record<string, number>;
} | null> {
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), "public", "data", "citations-citywide.json"),
      "utf8",
    );
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default async function Page() {
  const [boundaries, districts, citywide, meta, citations] = await Promise.all([
    loadBoundaries(),
    loadDistricts(),
    loadCitywide(),
    loadMeta(),
    loadCitations(),
  ]);
  if (!boundaries || !districts || !citywide || !meta) {
    notFound();
  }
  return (
    <Dashboard
      boundaries={boundaries}
      districtsFile={districts}
      citywide={citywide}
      meta={meta}
      citations={citations}
    />
  );
}
