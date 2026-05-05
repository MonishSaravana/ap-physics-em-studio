type ModelAssumptionsCardProps = {
  assumptions: string[];
};

export function ModelAssumptionsCard({ assumptions }: ModelAssumptionsCardProps) {
  return (
    <details className="sim-inline-panel p-3 text-sm text-slate-200">
      <summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-[0.14em] text-slate-100">
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
