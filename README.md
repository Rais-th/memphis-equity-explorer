# Memphis 911 & Enforcement Equity Explorer

Public, read-only dashboard of Memphis 911 performance, EMS response, and MPD
enforcement, normalized to the seven City Council districts.

Live site: _pending_  
Source: this repo  
Contact: rthelemuka@gmail.com

## What it does

Pulls four City of Memphis ArcGIS feature services nightly, aggregates them
to council-district-level counts and rates, and publishes:

- A choropleth of the seven districts across six metrics
- Citywide monthly time-series (911 answer time, EMS ALS response, fire
  response, e911 call volume) from the MFD Fire Services Metrics dataset
- A citywide citation mix (moving vs non-moving) and a driver-race
  breakdown of traffic citations
- Per-district permalinks, CSV, JSON, and GeoJSON downloads

Everything is aggregate. No individual identifiers are published.

## Data sources

- MPD Traffic Stops (`Council_District`, `Reported_Datetime`)
- MPD Traffic Citations (`Citation_Type`, `Driver_Race`, `Issue_Date`)
- MPD Public Safety Incidents (NIBRS)
- MFD Fire Services Metrics (monthly 911/EMS/fire KPIs)
- Memphis City Council Districts 2023 (boundaries)

All fetched via the ArcGIS Feature Service REST API. No API keys required.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS (no UI library)
- D3 (`d3-geo`, `d3-scale`, `d3-interpolate`) for the choropleth
- Recharts for time-series
- Static JSON in `/public/data/` — no database
- Nightly refresh: GitHub Action that runs `npm run refresh` and commits updated JSON

## Local dev

```bash
npm install --legacy-peer-deps
npm run refresh      # fetches live data, writes /public/data/*.json
npm run dev          # http://localhost:3000
npm run build
```

## Deploy

Push to GitHub, import into Vercel. The nightly GitHub Action (`.github/workflows/refresh.yml`)
runs at 08:00 UTC each day, refreshes the JSON, and commits back to `main` —
Vercel re-deploys automatically.

Optional: set `CRON_SECRET` and hit `/api/cron/refresh` with a bearer token to
verify the ingestion pipeline inline (returns JSON, does not persist — Vercel's
serverless filesystem is read-only).

## Methodology

- Traffic stops are grouped using the dataset's own `Council_District` field.
- NIBRS incidents are grouped via spatial-intersect against each district polygon.
- Citations do not carry a district key, so the mix + driver-race breakdown
  are citywide only.
- 911 answer time, EMS ALS response, fire response, and 911 call volume are
  published monthly by MFD and are citywide only.
- Per-1,000-resident rates use an equal-weighted district population estimate
  (total Memphis ÷ 7). Council districts are drawn to equalize population, so
  this is a defensible first-order rate.

## License

Code: MIT  
Data: CC BY 4.0 attribution to the Memphis Data Hub (City of Memphis OPM)

## Author

Popuzar LLC
