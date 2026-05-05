import type { CEDAlignment } from "@/data/ced";

type CEDAlignmentCardProps = {
  alignment: CEDAlignment;
};

export function CEDAlignmentCard({ alignment }: CEDAlignmentCardProps) {
  return (
    <section className="rounded-2xl border border-emerald-400/20 bg-emerald-950/25 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-200">
        CED Alignment
      </h3>
      <p className="mt-2 text-xs text-emerald-100/90">{alignment.cedUnit}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {alignment.cedTopics.map((topic) => (
          <span
            key={topic}
            className="rounded-full border border-emerald-300/40 bg-emerald-400/10 px-2.5 py-1 text-[11px] text-emerald-100"
          >
            {topic}
          </span>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {alignment.sciencePracticeTags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-slate-500/40 bg-slate-800/70 px-2 py-1 text-[11px] text-slate-200"
          >
            {tag}
          </span>
        ))}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-300">{alignment.alignmentSummary}</p>
    </section>
  );
}
