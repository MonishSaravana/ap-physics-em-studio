import { BlockMath } from "react-katex";

type GraphMathCardProps = {
  formula: string;
  derivative: string;
  derivativeMeaning: string;
  integral: string;
  integralMeaning: string;
};

export function GraphMathCard({
  formula,
  derivative,
  derivativeMeaning,
  integral,
  integralMeaning,
}: GraphMathCardProps) {
  return (
    <div className="mt-2 rounded-xl border border-slate-700/70 bg-slate-900/50 p-3 text-xs text-slate-200">
      <p className="font-semibold text-slate-100">Formula</p>
      <div className="rounded-lg border border-slate-700/60 bg-slate-950/60 p-2 text-slate-100">
        <BlockMath math={formula} />
      </div>
      <p className="mt-2 font-semibold text-slate-100">Derivative</p>
      <div className="rounded-lg border border-slate-700/60 bg-slate-950/60 p-2 text-slate-100">
        <BlockMath math={derivative} />
      </div>
      <p className="text-slate-300">{derivativeMeaning}</p>
      <p className="mt-2 font-semibold text-slate-100">Integral</p>
      <div className="rounded-lg border border-slate-700/60 bg-slate-950/60 p-2 text-slate-100">
        <BlockMath math={integral} />
      </div>
      <p className="text-slate-300">{integralMeaning}</p>
    </div>
  );
}
