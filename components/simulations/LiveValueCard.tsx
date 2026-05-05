type LiveValueCardProps = {
  label: string;
  value: string;
  unit?: string;
};

export function LiveValueCard({ label, value, unit }: LiveValueCardProps) {
  return (
    <div className="border border-slate-700/70 bg-slate-950/45 px-2.5 py-2">
      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 font-mono text-sm text-cyan-200">
        {value}
        {unit ? ` ${unit}` : ""}
      </p>
    </div>
  );
}
