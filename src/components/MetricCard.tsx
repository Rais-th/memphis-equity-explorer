type Props = {
  label: string;
  value: string;
  hint?: string;
};

export default function MetricCard({ label, value, hint }: Props) {
  return (
    <div className="border border-line p-5 bg-tile">
      <div className="text-xs uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-2 text-3xl font-medium tnum">{value}</div>
      {hint ? <div className="mt-1 text-xs text-muted">{hint}</div> : null}
    </div>
  );
}
