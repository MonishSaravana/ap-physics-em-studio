import { ReactNode } from "react";

type GraphPanelProps = {
  title: string;
  children: ReactNode;
};

export function GraphPanel({ title, children }: GraphPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-700/70 bg-slate-900/65 p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-200">{title}</h3>
      <div className="h-64 w-full">{children}</div>
    </section>
  );
}
