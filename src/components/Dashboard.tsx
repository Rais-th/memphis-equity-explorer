"use client";

import { useMemo, useState } from "react";
import Choropleth from "./Choropleth";
import DistrictPanel from "./DistrictPanel";
import MetricCard from "./MetricCard";
import MetricSelector from "./MetricSelector";
import TimeSeries from "./TimeSeries";
import { METRICS, type CitywideFile, type DistrictsFile, type MetricKey } from "@/lib/types";
import { formatCompact, formatNumber, formatPercent } from "@/lib/format";

type Props = {
  boundaries: GeoJSON.FeatureCollection;
  districtsFile: DistrictsFile;
  citywide: CitywideFile;
  meta: {
    totals: {
      trafficStops12m: number | null;
      incidents12m: number | null;
      citations12m: number | null;
      population: number | null;
    };
    generatedAt: string;
  };
  citations: {
    citationMix: { moving: number; nonMoving: number; other: number; total: number };
    citationsByRace: Record<string, number>;
  } | null;
};

const METRIC_EXTRACTORS: Record<MetricKey, (d: (typeof dummy)[number]) => number | null> = {
  trafficStopsPer1k: (d) => d.metrics.trafficStopsPer1k,
  incidentsPer1k: (d) => d.metrics.incidentsPer1k,
  citationMoving: (d) => d.metrics.citationMovingPct,
  citationNonMoving: (d) => d.metrics.citationNonMovingPct,
  emsResponse540s: () => null,
  answerTime15s: () => null,
};

const dummy = [{ metrics: {} as DistrictsFile["districts"][number]["metrics"] }];

export default function Dashboard({ boundaries, districtsFile, citywide, meta, citations }: Props) {
  const [metric, setMetric] = useState<MetricKey>("trafficStopsPer1k");
  const [selected, setSelected] = useState<string | null>(null);

  const metricDef = METRICS.find((m) => m.key === metric)!;
  const extractor = METRIC_EXTRACTORS[metric];

  const selectedDistrict = useMemo(
    () => districtsFile.districts.find((d) => d.id === selected) ?? null,
    [selected, districtsFile.districts],
  );

  const formatValue = (v: number) => {
    if (metricDef.unit === "%") return formatPercent(v);
    return formatNumber(v, 1);
  };

  const latestCitywide = citywide.months[citywide.months.length - 1];

  const citationTotal = citations?.citationMix.total ?? 0;
  const blackShare =
    citations && citationTotal
      ? ((citations.citationsByRace["Black"] ?? 0) / citationTotal) * 100
      : null;

  const chartField: "answerTime15sPct" | "emsResponse540sPct" =
    metric === "answerTime15s" ? "answerTime15sPct" : "emsResponse540sPct";

  return (
    <div className="mx-auto max-w-6xl px-6 pt-10 pb-16">
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-medium tracking-tight max-w-3xl">
          How public-safety services reach Memphis neighborhoods.
        </h1>
        <p className="mt-3 text-muted max-w-2xl">
          Aggregate counts and rates for each of the seven Memphis city-council districts, drawn
          directly from the city&apos;s open-data feeds. Refreshed nightly. Last generated{" "}
          <span className="tnum">{new Date(meta.generatedAt).toLocaleDateString("en-US", { dateStyle: "medium" })}</span>.
        </p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <MetricCard
          label="Traffic stops · 12 mo"
          value={formatCompact(meta.totals.trafficStops12m)}
          hint="citywide"
        />
        <MetricCard
          label="Incidents · 12 mo"
          value={formatCompact(meta.totals.incidents12m)}
          hint="NIBRS groups A+B"
        />
        <MetricCard
          label="Citations · 12 mo"
          value={formatCompact(meta.totals.citations12m)}
          hint={blackShare !== null ? `${blackShare.toFixed(0)}% to Black drivers` : "citywide"}
        />
        <MetricCard
          label="911 answered ≤15s"
          value={formatPercent(latestCitywide?.answerTime15sPct, 1)}
          hint={latestCitywide ? new Date(latestCitywide.date).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }) : undefined}
        />
      </section>

      <section className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-sm uppercase tracking-wider text-muted">Map</h2>
          <p className="mt-1 text-sm text-muted max-w-lg">{metricDef.help}</p>
        </div>
        <MetricSelector value={metric} onChange={setMetric} />
      </section>

      <section className="grid md:grid-cols-[1fr_320px] gap-6 mb-12">
        <div className="border border-line p-5 bg-tile">
          {metricDef.scale === "district" ? (
            <Choropleth
              boundaries={boundaries}
              districts={districtsFile.districts}
              valueFor={(d) => extractor({ metrics: d.metrics })}
              format={formatValue}
              selectedId={selected}
              onSelect={setSelected}
            />
          ) : (
            <div className="h-[520px] flex items-center justify-center text-sm text-muted text-center px-6">
              This metric is reported citywide only. See the time-series chart below for trend.
            </div>
          )}
        </div>
        <DistrictPanel d={selectedDistrict} />
      </section>

      <section className="grid md:grid-cols-2 gap-6 mb-12">
        <TimeSeries data={citywide.months} field="answerTime15sPct" label="911 answered within 15 sec · citywide" unit="%" />
        <TimeSeries data={citywide.months} field="emsResponse540sPct" label="EMS ALS response within 9 min · citywide" unit="%" />
        <TimeSeries data={citywide.months} field="fireResponse320sPct" label="Fire response within 320 sec · citywide" unit="%" />
        <TimeSeries data={citywide.months} field="e911Calls" label="911 call volume · citywide" unit="count" />
      </section>

      {citations && (
        <section className="border border-line p-6 bg-tile">
          <div className="text-xs uppercase tracking-wider text-muted">Citations by driver race · last 12 months</div>
          <div className="mt-4 space-y-2">
            {Object.entries(citations.citationsByRace)
              .sort(([, a], [, b]) => b - a)
              .map(([race, count]) => {
                const pct = citationTotal ? (count / citationTotal) * 100 : 0;
                return (
                  <div key={race} className="flex items-center gap-3">
                    <div className="w-48 text-xs">{race}</div>
                    <div className="flex-1 h-6 bg-bg border border-line relative">
                      <div
                        className="absolute inset-y-0 left-0 bg-accent/80"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="w-28 text-right tnum text-sm">
                      {formatNumber(count)} · {pct.toFixed(1)}%
                    </div>
                  </div>
                );
              })}
          </div>
          <p className="mt-4 text-xs text-muted max-w-2xl">
            The citations dataset carries driver-race on every row, but not a council-district key,
            so this breakdown is citywide. See Methodology for how this compares to citywide
            demographics.
          </p>
        </section>
      )}
    </div>
  );
}
