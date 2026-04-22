"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { geoPath, geoMercator } from "d3-geo";
import { scaleSequential } from "d3-scale";
import { interpolateRgb } from "d3-interpolate";
import type { District } from "@/lib/types";

type Props = {
  boundaries: GeoJSON.FeatureCollection;
  districts: District[];
  valueFor: (d: District) => number | null;
  format: (v: number) => string;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

const COLOR_LO = "#f5f5f5";
const COLOR_HI = "#d83a3a";

export default function Choropleth({
  boundaries,
  districts,
  valueFor,
  format,
  selectedId,
  onSelect,
}: Props) {
  const router = useRouter();
  const [hover, setHover] = useState<string | null>(null);

  const width = 720;
  const height = 520;

  const projection = useMemo(
    () => geoMercator().fitSize([width, height], boundaries),
    [boundaries],
  );
  const path = useMemo(() => geoPath(projection), [projection]);

  const valueById = useMemo(() => {
    const m = new Map<string, number | null>();
    for (const d of districts) m.set(d.id, valueFor(d));
    return m;
  }, [districts, valueFor]);

  const extent = useMemo(() => {
    const vals = Array.from(valueById.values()).filter((v): v is number => v !== null);
    if (!vals.length) return [0, 1] as [number, number];
    return [Math.min(...vals), Math.max(...vals)] as [number, number];
  }, [valueById]);

  const color = useMemo(
    () => scaleSequential<string>().domain(extent).interpolator(interpolateRgb(COLOR_LO, COLOR_HI)),
    [extent],
  );

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        role="img"
        aria-label="Choropleth of Memphis council districts"
      >
        {boundaries.features.map((feat, i) => {
          const id = String(feat.properties?.CD ?? i);
          const v = valueById.get(id) ?? null;
          const fill = v === null ? "#eeeeee" : color(v);
          const isSel = selectedId === id;
          const isHover = hover === id;
          const d = path(feat as GeoJSON.Feature) ?? "";
          return (
            <path
              key={id}
              d={d}
              fill={fill}
              stroke={isSel ? "#0a0a0a" : isHover ? "#404040" : "#ffffff"}
              strokeWidth={isSel ? 2 : 1}
              className="cursor-pointer transition-opacity duration-150"
              style={{ opacity: hover && !isHover ? 0.85 : 1 }}
              onMouseEnter={() => setHover(id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onSelect(id)}
              onDoubleClick={() => router.push(`/neighborhood/${id}`)}
              aria-label={`District ${id}`}
            />
          );
        })}
        {boundaries.features.map((feat, i) => {
          const id = String(feat.properties?.CD ?? i);
          const c = path.centroid(feat as GeoJSON.Feature);
          if (!isFinite(c[0])) return null;
          const cx = Math.round(c[0] * 10) / 10;
          const cy = Math.round(c[1] * 10) / 10;
          return (
            <text
              key={`t-${id}`}
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="middle"
              className="pointer-events-none tnum"
              fontSize={12}
              fill="#0a0a0a"
              style={{ mixBlendMode: "multiply" }}
            >
              {id}
            </text>
          );
        })}
      </svg>
      {hover && (
        <div className="absolute top-3 right-3 bg-bg border border-line px-3 py-2 text-xs tnum pointer-events-none">
          <div className="text-muted">District {hover}</div>
          <div className="text-base font-medium">
            {(() => {
              const v = valueById.get(hover);
              return v === null || v === undefined ? "not available" : format(v);
            })()}
          </div>
        </div>
      )}
      <Legend min={extent[0]} max={extent[1]} format={format} />
    </div>
  );
}

function Legend({ min, max, format }: { min: number; max: number; format: (v: number) => string }) {
  const steps = 6;
  const arr = Array.from({ length: steps }, (_, i) => min + (i / (steps - 1)) * (max - min));
  return (
    <div className="mt-3 flex items-center gap-2 text-xs tnum text-muted">
      <span>{format(min)}</span>
      <div className="flex-1 h-2 border border-line" style={{ background: `linear-gradient(to right, ${COLOR_LO}, ${COLOR_HI})` }}>
        <div className="sr-only">{arr.length} steps</div>
      </div>
      <span>{format(max)}</span>
    </div>
  );
}
