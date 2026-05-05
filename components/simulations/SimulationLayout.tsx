import { ReactNode } from "react";

type SimulationLayoutProps = {
  title: string;
  description: string;
  visual: ReactNode;
  sidebar: ReactNode;
  bottom?: ReactNode;
};

export function SimulationLayout({
  title,
  description,
  visual,
  sidebar,
  bottom,
}: SimulationLayoutProps) {
  return (
    <section className="space-y-4 rounded-3xl border border-slate-700/70 bg-slate-900/40 p-4 md:p-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-300">{description}</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4 rounded-2xl border border-slate-700/60 bg-slate-950/65 p-3">
          {visual}
          {bottom ? <div className="space-y-4">{bottom}</div> : null}
        </div>
        <aside className="space-y-3">{sidebar}</aside>
      </div>
    </section>
  );
}
