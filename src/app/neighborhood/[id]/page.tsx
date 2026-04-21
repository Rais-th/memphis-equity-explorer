import { notFound } from "next/navigation";
import Link from "next/link";
import { loadCitywide, loadDistricts } from "@/lib/data";
import { formatNumber, formatPercent } from "@/lib/format";
import TimeSeries from "@/components/TimeSeries";

export async function generateStaticParams() {
  const districts = await loadDistricts();
  return (districts?.districts ?? []).map((d) => ({ id: d.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: `District ${id} · Memphis Equity Explorer`,
    description: `Public-safety metrics for Memphis City Council District ${id}.`,
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [districts, citywide] = await Promise.all([loadDistricts(), loadCitywide()]);
  const d = districts?.districts.find((x) => x.id === id);
  if (!d || !districts || !citywide) notFound();

  const m = d.metrics;
  const citywideRank = (field: "trafficStopsPer1k" | "incidentsPer1k") => {
    const sorted = districts.districts
      .map((x) => ({ id: x.id, v: x.metrics[field] ?? -1 }))
      .sort((a, b) => b.v - a.v);
    const rank = sorted.findIndex((x) => x.id === d.id) + 1;
    return `${rank} of ${sorted.length}`;
  };

  return (
    <div className="mx-auto max-w-4xl px-6 pt-10 pb-16">
      <div className="text-sm text-muted mb-4">
        <Link href="/" className="hover:text-fg underline underline-offset-4">← Dashboard</Link>
      </div>
      <h1 className="text-3xl md:text-4xl font-medium tracking-tight">{d.name}</h1>
      <p className="mt-2 text-muted">
        Memphis City Council · Population (est.){" "}
        <span className="tnum">{formatNumber(m.population)}</span> · Coverage{" "}
        <span className="tnum">{districts.coverageMonths}</span> months.
      </p>

      <section className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-8">
        <Card label="Traffic stops · 12 mo" value={formatNumber(m.trafficStops12m)} hint={`${formatNumber(m.trafficStopsPer1k, 1)} per 1,000`} />
        <Card label="Stops rank (high → low)" value={citywideRank("trafficStopsPer1k")} />
        <Card label="NIBRS incidents · 12 mo" value={formatNumber(m.incidents12m)} hint={`${formatNumber(m.incidentsPer1k, 1)} per 1,000`} />
        <Card label="Incidents rank (high → low)" value={citywideRank("incidentsPer1k")} />
        <Card label="Moving citations (citywide)" value={formatPercent(m.citationMovingPct)} />
        <Card label="Non-moving citations (citywide)" value={formatPercent(m.citationNonMovingPct)} />
      </section>

      <section className="grid md:grid-cols-2 gap-6 mt-10">
        <TimeSeries data={citywide.months} field="answerTime15sPct" label="911 answered within 15 sec · citywide" unit="%" />
        <TimeSeries data={citywide.months} field="emsResponse540sPct" label="EMS ALS response within 9 min · citywide" unit="%" />
      </section>

      <p className="mt-10 text-xs text-muted max-w-2xl">
        District-level 911 answer time and EMS response times are not published at sub-city
        granularity, so those series are shown citywide for context. Stops and incidents are
        district-specific. See the About page for methodology.
      </p>
    </div>
  );
}

function Card({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border border-line p-5 bg-tile">
      <div className="text-xs uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-2 text-2xl font-medium tnum">{value}</div>
      {hint ? <div className="mt-1 text-xs text-muted tnum">{hint}</div> : null}
    </div>
  );
}
