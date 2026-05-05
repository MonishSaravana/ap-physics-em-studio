import type { CEDAlignment } from "@/data/ced";

type CEDAlignmentCardProps = {
  alignment: CEDAlignment;
};

export function CEDAlignmentCard({ alignment }: CEDAlignmentCardProps) {
  return (
    <section className="border border-emerald-400/25 bg-emerald-950/20 p-3">
      <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-200">
        {alignment.cedUrl ? (
          <a
            href={alignment.cedUrl}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-emerald-300/40 underline-offset-4 hover:decoration-emerald-200"
          >
            CED Alignment
          </a>
        ) : (
          "CED Alignment"
        )}
      </h3>
      {alignment.cedUrl ? (
        <a
          href={alignment.cedUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 block text-xs text-emerald-100/90 hover:underline"
        >
          {alignment.cedUnit}
        </a>
      ) : (
        <p className="mt-2 text-xs text-emerald-100/90">{alignment.cedUnit}</p>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        {alignment.cedTopics.map((topic) => (
          <span
            key={topic}
            className="border border-emerald-300/40 bg-emerald-400/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-emerald-100"
          >
            {topic}
          </span>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {alignment.sciencePracticeTags.map((tag) => (
          <span
            key={tag}
            className="border border-slate-500/40 bg-slate-800/70 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-slate-200"
          >
            {tag}
          </span>
        ))}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-300">{alignment.alignmentSummary}</p>
    </section>
  );
}
