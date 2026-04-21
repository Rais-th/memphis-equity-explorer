"use client";

import type { DistrictsFile } from "@/lib/types";

type Props = { districts: DistrictsFile | null };

export default function CsvButton({ districts }: Props) {
  const onClick = () => {
    if (!districts) return;
    const header = [
      "district_id",
      "district_name",
      "population_est",
      "traffic_stops_12m",
      "stops_per_1k",
      "incidents_12m",
      "incidents_per_1k",
      "citation_moving_pct_citywide",
      "citation_non_moving_pct_citywide",
    ];
    const rows = districts.districts.map((d) => [
      d.id,
      d.name,
      d.metrics.population,
      d.metrics.trafficStops12m,
      d.metrics.trafficStopsPer1k?.toFixed(2) ?? "",
      d.metrics.incidents12m,
      d.metrics.incidentsPer1k?.toFixed(2) ?? "",
      d.metrics.citationMovingPct?.toFixed(2) ?? "",
      d.metrics.citationNonMovingPct?.toFixed(2) ?? "",
    ]);
    const csv = [header, ...rows].map((r) => r.map((v) => (v === null ? "" : v)).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `memphis-districts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button onClick={onClick} className="text-xs underline underline-offset-4 hover:text-accent">
      Download
    </button>
  );
}
