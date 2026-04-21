export type MetricKey =
  | "trafficStopsPer1k"
  | "incidentsPer1k"
  | "citationMoving"
  | "citationNonMoving"
  | "emsResponse540s"
  | "answerTime15s";

export type MetricDef = {
  key: MetricKey;
  label: string;
  unit: string;
  help: string;
  scale: "district" | "citywide";
  higherIsBetter: boolean;
};

export const METRICS: MetricDef[] = [
  {
    key: "trafficStopsPer1k",
    label: "Traffic stops per 1,000 residents",
    unit: "per 1k",
    help: "MPD traffic-stop events in the last 12 months, normalized by district population.",
    scale: "district",
    higherIsBetter: false,
  },
  {
    key: "incidentsPer1k",
    label: "NIBRS incidents per 1,000 residents",
    unit: "per 1k",
    help: "Reported public-safety incidents (NIBRS Group A + B) in the last 12 months, normalized by district population.",
    scale: "district",
    higherIsBetter: false,
  },
  {
    key: "citationMoving",
    label: "Moving citations share",
    unit: "%",
    help: "Share of citations issued for moving violations, last 12 months.",
    scale: "district",
    higherIsBetter: true,
  },
  {
    key: "citationNonMoving",
    label: "Non-moving citations share",
    unit: "%",
    help: "Share of citations issued for non-moving violations (equipment, registration, etc.), last 12 months.",
    scale: "district",
    higherIsBetter: false,
  },
  {
    key: "emsResponse540s",
    label: "EMS ALS response within 9 min",
    unit: "%",
    help: "Citywide share of Advanced Life Support dispatches arriving within 540 seconds. Reported monthly by MFD.",
    scale: "citywide",
    higherIsBetter: true,
  },
  {
    key: "answerTime15s",
    label: "911 answered within 15 sec",
    unit: "%",
    help: "Citywide share of 911 calls answered within 15 seconds. Reported monthly by MFD.",
    scale: "citywide",
    higherIsBetter: true,
  },
];

export type DistrictMetrics = {
  trafficStops12m: number | null;
  incidents12m: number | null;
  citationMovingPct: number | null;
  citationNonMovingPct: number | null;
  citationsTotal12m: number | null;
  trafficStopsPer1k: number | null;
  incidentsPer1k: number | null;
  population: number | null;
};

export type District = {
  id: string;
  name: string;
  centroid: [number, number];
  metrics: DistrictMetrics;
};

export type DistrictsFile = {
  generatedAt: string;
  coverageMonths: number;
  districts: District[];
};

export type CitywidePoint = {
  date: string;
  e911Calls: number | null;
  answerTime15sPct: number | null;
  fireResponse320sPct: number | null;
  emsResponse540sPct: number | null;
  emergentIncidents: number | null;
};

export type CitywideFile = {
  generatedAt: string;
  months: CitywidePoint[];
};

export type MetaFile = {
  generatedAt: string;
  sources: Array<{ name: string; owner: string; url: string }>;
  totals: {
    trafficStops12m: number | null;
    incidents12m: number | null;
    citations12m: number | null;
    population: number | null;
  };
  note?: string;
};
