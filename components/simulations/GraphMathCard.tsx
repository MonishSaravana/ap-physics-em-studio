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
      <p>
        <span className="font-semibold text-slate-100">Formula:</span> {formula}
      </p>
      <p className="mt-1">
        <span className="font-semibold text-slate-100">Derivative:</span> {derivative}
      </p>
      <p className="text-slate-300">{derivativeMeaning}</p>
      <p className="mt-1">
        <span className="font-semibold text-slate-100">Integral:</span> {integral}
      </p>
      <p className="text-slate-300">{integralMeaning}</p>
    </div>
  );
}
