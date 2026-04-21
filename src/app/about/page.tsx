import { SOURCES, SOURCE_PORTAL } from "@/lib/sources";
import { loadMeta } from "@/lib/data";

export const metadata = {
  title: "About · Memphis Equity Explorer",
  description: "Data sources, methodology, and limitations.",
};

export default async function Page() {
  const meta = await loadMeta();
  return (
    <div className="mx-auto max-w-3xl px-6 pt-10 pb-16 prose prose-neutral dark:prose-invert">
      <h1 className="text-3xl md:text-4xl font-medium tracking-tight">About</h1>

      <h2 className="mt-10 text-lg font-medium">What this is</h2>
      <p className="text-muted mt-2">
        A public, read-only view of 911, EMS, and traffic-enforcement performance in the City of
        Memphis. The site aggregates datasets published by the City of Memphis and its
        departments, normalizes them to the seven City Council districts where possible, and
        publishes them as a static dashboard. There are no user accounts, no forms, and no
        private data.
      </p>

      <h2 className="mt-10 text-lg font-medium">Why it exists</h2>
      <ul className="mt-2 text-muted list-disc pl-5 space-y-1">
        <li>
          The U.S. Department of Justice concluded in December 2024 that MPD engaged in a pattern
          or practice of conduct that deprives people of their rights.
        </li>
        <li>
          Decarcerate Memphis&apos; 2024 People&apos;s Report documented sharp racial disparities in
          traffic citations.
        </li>
        <li>
          Memphis Fire Department and Innovate Memphis have long estimated a roughly $20M/year
          cost to EMS from 911 overuse.
        </li>
        <li>
          Mayor Young&apos;s first-100-days address and District Attorney Mulroy&apos;s open-data
          initiatives both called for public dashboards.
        </li>
      </ul>

      <h2 className="mt-10 text-lg font-medium">Data sources</h2>
      <ul className="mt-2 space-y-2 text-sm">
        {Object.values(SOURCES).map((s) => (
          <li key={s.url}>
            <div className="font-medium">{s.name}</div>
            <div className="text-muted text-xs">{s.owner}</div>
            <a
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs underline underline-offset-4 hover:text-fg break-all"
            >
              {s.url}
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">
        All data is sourced through{" "}
        <a href={SOURCE_PORTAL} className="underline underline-offset-4">the Memphis Data Hub</a>{" "}
        (City of Memphis Office of Performance Management). Boundaries and rates apply to the 2023
        City Council redistricting.
      </p>

      <h2 className="mt-10 text-lg font-medium">Methodology</h2>
      <ol className="mt-2 text-sm text-muted list-decimal pl-5 space-y-2">
        <li>
          Each night, a build script queries the listed ArcGIS Feature Services and aggregates
          rows by council district.
        </li>
        <li>
          Traffic stops are grouped using the dataset&apos;s own <code>Council_District</code>{" "}
          field (the city publishes that join).
        </li>
        <li>
          NIBRS incidents are grouped via a spatial-intersect query against each council
          district&apos;s 2023 polygon.
        </li>
        <li>
          Citations (moving vs non-moving, driver race) are published only with a ZIP key, which
          does not cleanly map to council districts, so those breakdowns are shown citywide.
        </li>
        <li>
          911 answer time, EMS ALS response, fire response, and 911 call volume come from the
          monthly Fire Services Metrics dataset, which is citywide.
        </li>
        <li>
          Per-1,000-resident rates use an equal-weighted district population estimate
          (Memphis total <span className="tnum">628,127</span> / 7 districts ={" "}
          <span className="tnum">89,732</span> per district). Council districts are drawn to
          equalize population, so this is a fair first-order rate. A precise per-district 2020
          Census reconciliation is on the roadmap.
        </li>
      </ol>

      <h2 className="mt-10 text-lg font-medium">Limitations</h2>
      <ul className="mt-2 text-sm text-muted list-disc pl-5 space-y-1">
        <li>Datasets lag reality. Expect roughly a one- to two-week delay on stops and incidents.</li>
        <li>Citations do not carry a district key in the source, so the per-district mix is citywide.</li>
        <li>911 and EMS response are only published citywide. Sub-city dispatch metrics are not public.</li>
        <li>This site publishes numbers. It does not draw editorial conclusions.</li>
      </ul>

      <h2 className="mt-10 text-lg font-medium">Contact</h2>
      <p className="mt-2 text-sm text-muted">
        Questions, corrections, or dataset tips: <a className="underline underline-offset-4" href="mailto:rthelemuka@gmail.com">rthelemuka@gmail.com</a>.{" "}
        Source and issue tracker:{" "}
        <a className="underline underline-offset-4" href="https://github.com/Rais-th/memphis-equity-explorer">github.com/Rais-th/memphis-equity-explorer</a>.
      </p>

      <p className="mt-10 text-xs text-muted">
        Built and maintained by Popuzar LLC. Code: MIT. Data: CC BY 4.0 attribution to Memphis
        Data Hub. Last data refresh{" "}
        <span className="tnum">
          {meta ? new Date(meta.generatedAt).toLocaleString("en-US") : "—"}
        </span>.
      </p>
    </div>
  );
}
