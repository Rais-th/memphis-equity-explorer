import { SOURCES } from "./sources";
import type { CitywideFile, CitywidePoint, District, DistrictsFile, MetaFile } from "./types";

export type IngestResult = {
  districtsFile: DistrictsFile;
  citywideFile: CitywideFile;
  metaFile: MetaFile;
  citationsFile: {
    generatedAt: string;
    citationMix: { moving: number; nonMoving: number; other: number; total: number };
    citationsByRace: Record<string, number>;
  };
  boundaries: GeoJSON.FeatureCollection;
  log: string[];
};

const COVERAGE_MONTHS = 12;
const TIME_SERIES_MONTHS = 24;
const MEMPHIS_POP_2023_EST = 628127;
const COUNCIL_DISTRICTS = 7;
const POP_PER_DISTRICT = Math.round(MEMPHIS_POP_2023_EST / COUNCIL_DISTRICTS);

type EsriStats = {
  features: Array<{ attributes: Record<string, number | string | null> }>;
  error?: { message: string };
};

async function esriQuery(url: string, params: Record<string, string>): Promise<EsriStats> {
  const q = new URLSearchParams({ f: "json", ...params });
  const res = await fetch(`${url}/query?${q}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  const json = (await res.json()) as EsriStats;
  if (json.error) throw new Error(`${url}: ${json.error.message}`);
  return json;
}

async function esriGeojson(url: string, params: Record<string, string>): Promise<GeoJSON.FeatureCollection> {
  const q = new URLSearchParams({ f: "geojson", ...params });
  const res = await fetch(`${url}/query?${q}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return (await res.json()) as GeoJSON.FeatureCollection;
}

function monthStartUtc(offsetMonths: number): Date {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCMonth(d.getUTCMonth() + offsetMonths);
  return d;
}

function centroidOf(geom: GeoJSON.Geometry): [number, number] {
  const coords: Array<[number, number]> = [];
  const walk = (g: GeoJSON.Geometry) => {
    if (g.type === "Polygon") for (const ring of g.coordinates) for (const c of ring) coords.push([c[0], c[1]]);
    else if (g.type === "MultiPolygon")
      for (const poly of g.coordinates) for (const ring of poly) for (const c of ring) coords.push([c[0], c[1]]);
  };
  walk(geom);
  if (!coords.length) return [-90.05, 35.15];
  const sx = coords.reduce((a, c) => a + c[0], 0);
  const sy = coords.reduce((a, c) => a + c[1], 0);
  return [sx / coords.length, sy / coords.length];
}

function geometryToRings(g: GeoJSON.Geometry): number[][][] | null {
  if (g.type === "Polygon") return g.coordinates as number[][][];
  if (g.type === "MultiPolygon") return (g.coordinates as number[][][][]).flat();
  return null;
}

async function countInPolygon(url: string, sinceIso: string, dateField: string, geometry: GeoJSON.Geometry): Promise<number> {
  const rings = geometryToRings(geometry);
  if (!rings) throw new Error("no rings");
  const body = new URLSearchParams({
    f: "json",
    where: `${dateField} >= TIMESTAMP '${sinceIso}'`,
    geometry: JSON.stringify({ rings, spatialReference: { wkid: 4326 } }),
    geometryType: "esriGeometryPolygon",
    spatialRel: "esriSpatialRelIntersects",
    inSR: "4326",
    returnCountOnly: "true",
  });
  const res = await fetch(`${url}/query`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as { count?: number; error?: { message: string; details?: string[] } };
  if (json.error) throw new Error(json.error.message);
  return json.count ?? 0;
}

async function countByDistrict(url: string, sinceIso: string, dateField: string, idField: string) {
  const json = await esriQuery(url, {
    where: `${dateField} >= TIMESTAMP '${sinceIso}'`,
    groupByFieldsForStatistics: "Council_District",
    outStatistics: JSON.stringify([{ statisticType: "count", onStatisticField: idField, outStatisticFieldName: "cnt" }]),
    outFields: "*",
  });
  const out = new Map<number, number>();
  for (const f of json.features) {
    const cd = Number(f.attributes["Council_District"]);
    const cnt = Number(f.attributes["cnt"]);
    if (Number.isFinite(cd) && cd >= 1 && cd <= 7) out.set(cd, cnt);
  }
  return out;
}

async function citywideCitationMix(sinceIso: string) {
  const json = await esriQuery(SOURCES.trafficCitations.url, {
    where: `Issue_Date >= TIMESTAMP '${sinceIso}'`,
    groupByFieldsForStatistics: "Citation_Type",
    outStatistics: JSON.stringify([{ statisticType: "count", onStatisticField: "ObjectId", outStatisticFieldName: "cnt" }]),
    outFields: "*",
  });
  let moving = 0, nonMoving = 0, other = 0;
  for (const f of json.features) {
    const type = String(f.attributes["Citation_Type"] ?? "").trim().toLowerCase();
    const cnt = Number(f.attributes["cnt"]);
    if (type.includes("non")) nonMoving += cnt;
    else if (type.includes("moving")) moving += cnt;
    else other += cnt;
  }
  return { moving, nonMoving, other, total: moving + nonMoving + other };
}

async function citywideCitationsByRace(sinceIso: string) {
  const json = await esriQuery(SOURCES.trafficCitations.url, {
    where: `Issue_Date >= TIMESTAMP '${sinceIso}'`,
    groupByFieldsForStatistics: "Driver_Race",
    outStatistics: JSON.stringify([{ statisticType: "count", onStatisticField: "ObjectId", outStatisticFieldName: "cnt" }]),
    outFields: "*",
  });
  const byRace: Record<string, number> = {};
  for (const f of json.features) {
    const race = String(f.attributes["Driver_Race"] ?? "unknown").trim() || "unknown";
    byRace[race] = (byRace[race] ?? 0) + Number(f.attributes["cnt"]);
  }
  return byRace;
}

async function citywideTimeSeries(months: number): Promise<CitywidePoint[]> {
  const since = monthStartUtc(-months);
  const json = await esriQuery(SOURCES.fireServices.url, {
    where: `Date >= TIMESTAMP '${since.toISOString().slice(0, 10)} 00:00:00'`,
    outFields: "*",
    orderByFields: "Date ASC",
    resultRecordCount: "200",
  });
  return json.features.map((f) => {
    const raw = f.attributes["Date"];
    const iso = typeof raw === "number" ? new Date(raw).toISOString().slice(0, 10) : String(raw);
    const pick = (k: string) => {
      const v = f.attributes[k];
      return v === null || v === undefined || v === "" ? null : Number(v);
    };
    return {
      date: iso,
      e911Calls: pick("e911_Calls"),
      answerTime15sPct: pick("F911_answer_time_15_sec"),
      fireResponse320sPct: pick("Fire_response_320_sec"),
      emsResponse540sPct: pick("EMS_ALS_response_540_sec"),
      emergentIncidents: pick("Emergent_Incidents"),
    };
  });
}

export async function runIngest(): Promise<IngestResult> {
  const log: string[] = [];
  const add = (s: string) => { log.push(s); console.log(s); };
  const nowIso = new Date().toISOString();
  const sinceDist = monthStartUtc(-COVERAGE_MONTHS).toISOString().slice(0, 19).replace("T", " ");

  add("Fetching council district boundaries.");
  const boundaries = await esriGeojson(SOURCES.councilDistricts.url, {
    where: "1=1",
    outFields: "CD",
    returnGeometry: "true",
    outSR: "4326",
  });
  boundaries.features.sort((a, b) => Number(a.properties?.CD ?? 0) - Number(b.properties?.CD ?? 0));

  add("Fetching traffic stops by district.");
  const stops = await countByDistrict(SOURCES.trafficStops.url, sinceDist, "Reported_Datetime", "OBJECTID");

  add("Fetching incidents per district (spatial).");
  const incidents = new Map<number, number>();
  for (const feat of boundaries.features) {
    const cd = Number(feat.properties?.CD);
    if (!Number.isFinite(cd) || cd < 1 || cd > 7) continue;
    try {
      const n = await countInPolygon(SOURCES.incidents.url, sinceDist, "Reported_Datetime", feat.geometry as GeoJSON.Geometry);
      incidents.set(cd, n);
      add(`  district ${cd}: ${n}`);
    } catch (e) {
      add(`  district ${cd} failed: ${(e as Error).message}`);
    }
  }

  add("Fetching citation mix citywide.");
  let citationMix = { moving: 0, nonMoving: 0, other: 0, total: 0 };
  try { citationMix = await citywideCitationMix(sinceDist); } catch (e) { add(`citation mix failed: ${(e as Error).message}`); }

  add("Fetching citations by driver race citywide.");
  let citationsByRace: Record<string, number> = {};
  try { citationsByRace = await citywideCitationsByRace(sinceDist); } catch (e) { add(`race breakdown failed: ${(e as Error).message}`); }

  add("Fetching citywide time series.");
  let citywide: CitywidePoint[] = [];
  try { citywide = await citywideTimeSeries(TIME_SERIES_MONTHS); } catch (e) { add(`time series failed: ${(e as Error).message}`); }

  const movingPct = citationMix.total ? (citationMix.moving / citationMix.total) * 100 : null;
  const nonMovingPct = citationMix.total ? (citationMix.nonMoving / citationMix.total) * 100 : null;

  const districts: District[] = [];
  for (const feat of boundaries.features) {
    const cd = Number(feat.properties?.CD);
    if (!Number.isFinite(cd) || cd < 1 || cd > 7) continue;
    const stopCount = stops.get(cd) ?? null;
    const incCount = incidents.get(cd) ?? null;
    const pop = POP_PER_DISTRICT;
    districts.push({
      id: String(cd),
      name: `District ${cd}`,
      centroid: centroidOf(feat.geometry as GeoJSON.Geometry),
      metrics: {
        trafficStops12m: stopCount,
        incidents12m: incCount,
        citationsTotal12m: null,
        citationMovingPct: movingPct,
        citationNonMovingPct: nonMovingPct,
        trafficStopsPer1k: stopCount !== null ? (stopCount / pop) * 1000 : null,
        incidentsPer1k: incCount !== null ? (incCount / pop) * 1000 : null,
        population: pop,
      },
    });
  }
  districts.sort((a, b) => Number(a.id) - Number(b.id));

  const districtsFile: DistrictsFile = { generatedAt: nowIso, coverageMonths: COVERAGE_MONTHS, districts };
  const citywideFile: CitywideFile = { generatedAt: nowIso, months: citywide };
  const totalStops = districts.reduce((a, d) => a + (d.metrics.trafficStops12m ?? 0), 0);
  const totalInc = districts.reduce((a, d) => a + (d.metrics.incidents12m ?? 0), 0);
  const metaFile: MetaFile = {
    generatedAt: nowIso,
    sources: Object.values(SOURCES).map((s) => ({ name: s.name, owner: s.owner, url: s.url })),
    totals: {
      trafficStops12m: totalStops || null,
      incidents12m: totalInc || null,
      citations12m: citationMix.total || null,
      population: MEMPHIS_POP_2023_EST,
    },
    note:
      "Per-1,000 rates use an equal-weighted district population estimate (total Memphis population / 7). Citywide metrics (911 answer time, EMS response, citation mix, driver-race breakdown) are reported at the city level because the underlying datasets do not carry council-district keys.",
  };
  const citationsFile = { generatedAt: nowIso, citationMix, citationsByRace };
  add(`Done: ${districts.length} districts · ${citywide.length} months · stops ${totalStops} · incidents ${totalInc} · citations ${citationMix.total}`);
  return { districtsFile, citywideFile, metaFile, citationsFile, boundaries, log };
}
