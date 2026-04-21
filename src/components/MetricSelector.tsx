"use client";

import { METRICS, type MetricKey } from "@/lib/types";

type Props = {
  value: MetricKey;
  onChange: (k: MetricKey) => void;
};

export default function MetricSelector({ value, onChange }: Props) {
  return (
    <div className="inline-flex flex-wrap gap-1 border border-line p-1">
      {METRICS.map((m) => (
        <button
          key={m.key}
          onClick={() => onChange(m.key)}
          className={
            "px-3 py-1.5 text-xs transition-colors " +
            (m.key === value
              ? "bg-fg text-bg"
              : "text-muted hover:text-fg")
          }
          title={m.help}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
