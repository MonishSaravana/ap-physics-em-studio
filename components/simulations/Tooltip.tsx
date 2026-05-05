import { Info } from "lucide-react";

type TooltipProps = {
  text: string;
};

export function Tooltip({ text }: TooltipProps) {
  return (
    <span className="group relative inline-flex align-middle">
      <Info
        aria-label="Info"
        className="h-3.5 w-3.5 text-cyan-300/80 transition-colors group-hover:text-cyan-200"
      />
      <span className="pointer-events-none absolute left-1/2 top-[120%] z-30 w-64 -translate-x-1/2 rounded-xl border border-cyan-400/20 bg-slate-950/95 px-3 py-2 text-xs leading-relaxed text-slate-200 opacity-0 shadow-2xl transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
        {text}
      </span>
    </span>
  );
}
