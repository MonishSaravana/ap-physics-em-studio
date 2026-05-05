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
    <section className="sim-shell">
      <div className="sim-head">
        <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">{title}</h2>
        <p className="mt-1 text-sm text-slate-300">{description}</p>
      </div>
      <div className="sim-main-grid mt-3">
        <div className="sim-viewport">
          {visual}
          {bottom ? <div className="sim-bottom-strip">{bottom}</div> : null}
        </div>
        <aside className="sim-sidebar space-y-3">{sidebar}</aside>
      </div>
    </section>
  );
}
