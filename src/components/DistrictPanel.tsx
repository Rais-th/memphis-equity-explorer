import Link from "next/link";
import type { District } from "@/lib/types";
import { formatNumber, formatPercent } from "@/lib/format";

export default function DistrictPanel({ d }: { d: District | null }) {
  if (!d) {
    return (
      <div className="border border-line p-5 bg-tile text-sm text-muted">
        Click a district on the map to inspect its metrics.
      </div>
    );
  }
  const m = d.metrics;
  const row = (label: string, value: string) => (
    <div className="flex items-baseline justify-between py-2 border-b border-line last:border-none">
      <span className="text-xs text-muted">{label}</span>
      <span className="tnum text-sm font-medium">{value}</span>
    </div>
  );
  return (
    <div className="border border-line p-5 bg-tile">
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted">Council</div>
          <div className="text-2xl font-medium">{d.name}</div>
        </div>
        <Link href={`/neighborhood/${d.id}`} className="text-xs text-muted hover:text-fg underline underline-offset-4">
          Permalink
        </Link>
      </div>
      <div>
        {row("Population (est.)", formatNumber(m.population))}
        {row("Traffic stops, last 12 mo", formatNumber(m.trafficStops12m))}
        {row("Stops per 1,000 residents", formatNumber(m.trafficStopsPer1k, 1))}
        {row("NIBRS incidents, last 12 mo", formatNumber(m.incidents12m))}
        {row("Incidents per 1,000 residents", formatNumber(m.incidentsPer1k, 1))}
        {row("Moving citations (citywide)", formatPercent(m.citationMovingPct))}
        {row("Non-moving citations (citywide)", formatPercent(m.citationNonMovingPct))}
      </div>
    </div>
  );
}
