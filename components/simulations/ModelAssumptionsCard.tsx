type ModelAssumptionsCardProps = {
  assumptions: string[];
};

export function ModelAssumptionsCard({ assumptions }: ModelAssumptionsCardProps) {
  return (
    <details className="rounded-2xl border border-slate-700/70 bg-slate-900/55 p-4 text-sm text-slate-200">
      <summary className="cursor-pointer list-none text-sm font-semibold uppercase tracking-wide text-slate-100">
        Model Assumptions
      </summary>
      <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-slate-300">
        {assumptions.map((assumption) => (
          <li key={assumption}>• {assumption}</li>
        ))}
      </ul>
    </details>
  );
}
