import { Tooltip } from "@/components/simulations/Tooltip";
import { formatNumber } from "@/lib/format";

type SliderControlProps = {
  id: string;
  label: string;
  tooltip?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  digits?: number;
  onChange: (value: number) => void;
};

export function SliderControl({
  id,
  label,
  tooltip,
  value,
  min,
  max,
  step = 0.1,
  unit,
  digits = 2,
  onChange,
}: SliderControlProps) {
  return (
    <label htmlFor={id} className="block space-y-2">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="inline-flex items-center gap-1.5 text-slate-200">
          {label}
          {tooltip ? <Tooltip text={tooltip} /> : null}
        </span>
        <span className="font-mono text-cyan-300">
          {formatNumber(value, digits)} {unit}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700/70 accent-cyan-400"
      />
    </label>
  );
}
