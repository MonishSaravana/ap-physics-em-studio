type RelationshipSummaryCardProps = {
  summary: string;
  constants: Array<{ label: string; value: string }>;
};

export function RelationshipSummaryCard({
  summary,
  constants,
}: RelationshipSummaryCardProps) {
  return (
    <section className="sim-inline-panel border-violet-400/30 bg-violet-950/20 p-3">
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-200">
        Relationship Summary
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-100">{summary}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {constants.map((constant) => (
          <span
            key={constant.label}
            className="border border-violet-300/30 bg-violet-400/10 px-2 py-0.5 text-[11px] text-violet-100"
          >
            {constant.label}: {constant.value}
          </span>
        ))}
      </div>
    </section>
  );
}
