import { ReactNode } from "react";

type CollapsibleSectionProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function CollapsibleSection({ title, children, defaultOpen = false }: CollapsibleSectionProps) {
  return (
    <details open={defaultOpen} className="sim-inline-panel">
      <summary className="cursor-pointer select-none border-l-2 border-cyan-400/70 px-3 py-2 text-xs font-medium uppercase tracking-[0.11em] text-slate-100">
        {title}
      </summary>
      <div className="space-y-3 border-t border-slate-700/60 px-3 py-3">{children}</div>
    </details>
  );
}
