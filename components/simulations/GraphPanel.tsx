import { ReactNode } from "react";

type GraphPanelProps = {
  title: string;
  children: ReactNode;
};

export function GraphPanel({ title, children }: GraphPanelProps) {
  return (
    <section className="sim-inline-panel min-w-[320px] p-3">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-cyan-100">{title}</h3>
      <div className="h-52 w-full md:h-56">{children}</div>
    </section>
  );
}
