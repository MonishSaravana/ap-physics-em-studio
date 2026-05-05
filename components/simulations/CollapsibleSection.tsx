import { ReactNode } from "react";

type CollapsibleSectionProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function CollapsibleSection({ title, children, defaultOpen = false }: CollapsibleSectionProps) {
  return (
    <details
      open={defaultOpen}
      className="rounded-xl border border-slate-700/70 bg-slate-900/55"
    >
      <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium text-slate-100">
        {title}
      </summary>
      <div className="space-y-3 border-t border-slate-700/60 px-3 py-3">{children}</div>
    </details>
  );
}
