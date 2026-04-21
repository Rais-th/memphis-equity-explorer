import { loadDistricts, loadMeta } from "@/lib/data";
import CsvButton from "@/components/CsvButton";

export const metadata = {
  title: "Data · Memphis Equity Explorer",
  description: "Download the underlying CSV and JSON files.",
};

export default async function Page() {
  const [districts, meta] = await Promise.all([loadDistricts(), loadMeta()]);

  return (
    <div className="mx-auto max-w-3xl px-6 pt-10 pb-16">
      <h1 className="text-3xl md:text-4xl font-medium tracking-tight">Data</h1>
      <p className="mt-3 text-muted">
        Every number on this site is generated from the JSON files below. Feel free to mirror,
        re-analyze, or repost. Attribution to Memphis Data Hub (CC BY 4.0) appreciated.
      </p>

      <section className="mt-10">
        <h2 className="text-sm uppercase tracking-wider text-muted">Downloads</h2>
        <div className="mt-3 grid gap-3">
          <DownloadRow name="Per-district metrics (CSV)" node={<CsvButton districts={districts} />} />
          <DownloadRow
            name="Per-district metrics (JSON)"
            href="/data/districts.json"
          />
          <DownloadRow name="Citywide monthly time series (JSON)" href="/data/citywide.json" />
          <DownloadRow name="Citywide citation mix + driver race (JSON)" href="/data/citations-citywide.json" />
          <DownloadRow name="Council district boundaries (GeoJSON)" href="/data/council-districts.geojson" />
          <DownloadRow name="Meta / source manifest (JSON)" href="/data/meta.json" />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm uppercase tracking-wider text-muted">Snapshot</h2>
        <div className="mt-3 text-sm text-muted">
          <p>Last refresh: <span className="tnum">{meta ? new Date(meta.generatedAt).toLocaleString("en-US") : "—"}</span></p>
          <p className="mt-1">Coverage: last <span className="tnum">{districts?.coverageMonths ?? "—"}</span> months.</p>
        </div>
      </section>
    </div>
  );
}

function DownloadRow({ name, href, node }: { name: string; href?: string; node?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border border-line px-4 py-3 bg-tile">
      <span className="text-sm">{name}</span>
      {href ? (
        <a
          href={href}
          download
          className="text-xs underline underline-offset-4 hover:text-accent"
        >
          Download
        </a>
      ) : (
        node
      )}
    </div>
  );
}
