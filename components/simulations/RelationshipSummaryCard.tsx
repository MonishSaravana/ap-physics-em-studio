type RelationshipSummaryCardProps = {
  summary: string;
  constants: Array<{ label: string; value: string }>;
};

export function RelationshipSummaryCard({
  summary,
  constants,
}: RelationshipSummaryCardProps) {
  return (
    <section className="rounded-2xl border border-violet-400/20 bg-violet-950/20 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-violet-200">
        Relationship Summary
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-100">{summary}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {constants.map((constant) => (
          <span
            key={constant.label}
            className="rounded-full border border-violet-300/30 bg-violet-400/10 px-2.5 py-1 text-xs text-violet-100"
          >
            {constant.label}: {constant.value}
          </span>
        ))}
      </div>
    </section>
  );
}
