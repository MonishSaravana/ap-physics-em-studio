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
    <details className="math-drawer p-3">
      <summary className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200">{title}</summary>
      <div className="mt-2 border border-slate-700/70 bg-slate-950/70 p-2.5 text-slate-100">
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
        <span className="font-semibold text-slate-100">Physical Meaning:</span> {physicalMeaning}
      </p>
    </details>
  );
}
