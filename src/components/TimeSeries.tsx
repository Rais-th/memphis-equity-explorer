"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { CitywidePoint } from "@/lib/types";
import { formatMonth } from "@/lib/format";

type Key = "answerTime15sPct" | "emsResponse540sPct" | "fireResponse320sPct" | "e911Calls";

type Props = {
  data: CitywidePoint[];
  field: Key;
  label: string;
  unit: "%" | "count";
};

export default function TimeSeries({ data, field, label, unit }: Props) {
  const rows = data
    .filter((r) => r[field] !== null && r[field] !== undefined)
    .map((r) => ({ ...r, value: r[field] as number }));
  if (!rows.length) {
    return (
      <div className="border border-line p-5 bg-tile h-64 flex items-center justify-center text-sm text-muted">
        not available
      </div>
    );
  }
  return (
    <div className="border border-line p-5 bg-tile">
      <div className="text-xs uppercase tracking-wider text-muted mb-3">{label}</div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="var(--color-line)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => formatMonth(String(v))}
              stroke="var(--color-muted)"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "var(--color-line)" }}
            />
            <YAxis
              stroke="var(--color-muted)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={unit === "%" ? [0, 100] : ["auto", "auto"]}
              tickFormatter={(v) => (unit === "%" ? `${v}%` : Number(v).toLocaleString("en-US"))}
              width={48}
            />
            <Tooltip
              contentStyle={{
                background: "var(--color-bg)",
                border: "1px solid var(--color-line)",
                fontSize: 12,
              }}
              labelFormatter={(v) => formatMonth(String(v))}
              formatter={(v) => {
                const n = Number(v);
                return [unit === "%" ? `${n.toFixed(1)}%` : n.toLocaleString("en-US"), label];
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--color-accent)"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
