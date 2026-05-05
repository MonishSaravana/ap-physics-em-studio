type LiveValueCardProps = {
  label: string;
  value: string;
  unit?: string;
};

export function LiveValueCard({ label, value, unit }: LiveValueCardProps) {
  return (
    <div className="rounded-xl border border-slate-700/70 bg-slate-900/65 px-3 py-2">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 font-mono text-sm text-cyan-200">
        {value}
        {unit ? ` ${unit}` : ""}
      </p>
    </div>
  );
}
