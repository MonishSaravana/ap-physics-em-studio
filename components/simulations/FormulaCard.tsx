import { BlockMath, InlineMath } from "react-katex";

type FormulaDefinition = {
  symbol: string;
  meaning: string;
  unit: string;
};

type FormulaCardProps = {
  title: string;
  equation: string;
  definitions: FormulaDefinition[];
  physicalMeaning: string;
};

export function FormulaCard({
  title,
  equation,
  definitions,
  physicalMeaning,
}: FormulaCardProps) {
  return (
    <section className="rounded-2xl border border-cyan-400/20 bg-slate-900/70 p-4 shadow-lg shadow-cyan-950/25">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-cyan-200">
        {title}
      </h3>
      <div className="rounded-xl border border-slate-700/70 bg-slate-950/70 p-3 text-slate-100">
        <BlockMath math={equation} />
      </div>
      <ul className="mt-3 space-y-1.5 text-xs text-slate-300">
        {definitions.map((definition) => (
          <li key={`${title}-${definition.symbol}`}>
            <InlineMath math={definition.symbol} />: {definition.meaning} ({definition.unit})
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs leading-relaxed text-slate-300">
        <span className="font-semibold text-slate-100">Physical meaning:</span> {physicalMeaning}
      </p>
    </section>
  );
}
