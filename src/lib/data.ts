import fs from "node:fs/promises";
import path from "node:path";
import type { CitywideFile, DistrictsFile, MetaFile } from "./types";

const DATA_DIR = path.join(process.cwd(), "public", "data");

async function readJson<T>(file: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, file), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function loadDistricts(): Promise<DistrictsFile | null> {
  return readJson<DistrictsFile>("districts.json");
}

export async function loadCitywide(): Promise<CitywideFile | null> {
  return readJson<CitywideFile>("citywide.json");
}

export async function loadMeta(): Promise<MetaFile | null> {
  return readJson<MetaFile>("meta.json");
}

export async function loadBoundaries(): Promise<GeoJSON.FeatureCollection | null> {
  return readJson<GeoJSON.FeatureCollection>("council-districts.geojson");
}
