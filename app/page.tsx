"use client";

import { useRef, useState } from "react";
import { ModuleId, moduleCards, ModuleRenderer } from "@/components/modules";

export default function Home() {
  const [activeModule, setActiveModule] = useState<ModuleId>("magnetic-flux");
  const moduleRef = useRef<HTMLDivElement | null>(null);

  const launchModule = (moduleId: ModuleId) => {
    setActiveModule(moduleId);
    requestAnimationFrame(() => {
      moduleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#030712] text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-[-9rem] h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute right-[-9rem] top-44 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.08),transparent_35%),radial-gradient(circle_at_80%_12%,rgba(59,130,246,0.08),transparent_38%),linear-gradient(rgba(2,6,23,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(2,6,23,0.15)_1px,transparent_1px)] bg-[size:100%_100%,100%_100%,32px_32px,32px_32px]" />
      </div>

      <main className="relative mx-auto w-full max-w-[1360px] px-4 pb-16 pt-10 md:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-700/70 bg-slate-900/45 p-6 shadow-2xl shadow-cyan-950/25 md:p-8">
          <div className="space-y-4">
            <p className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-100">
              Interactive Simulation Studio
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">e&amp;m studio</h1>
            <p className="max-w-3xl text-lg text-cyan-100/90">
              model, manipulate, and visualize ap physics c: electricity &amp; magnetism.
            </p>
            <p className="max-w-3xl text-sm leading-relaxed text-slate-300 md:text-base">
              change inputs, watch the fields and circuits respond, and connect formulas to graphs and physical
              behavior.
            </p>
            <p className="max-w-3xl text-sm text-slate-400">
              interactive ap physics c: e&amp;m simulations for flux, induction, inductors, and circuits
            </p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Simulation Modules</h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {moduleCards.map((module) => {
              const active = module.id === activeModule;
              return (
                <button
                  key={module.id}
                  type="button"
                  onClick={() => launchModule(module.id)}
                  className={`group rounded-2xl border p-4 text-left transition ${
                    active
                      ? "border-cyan-300/60 bg-cyan-500/15"
                      : "border-slate-700/70 bg-slate-900/50 hover:border-cyan-400/40 hover:bg-slate-900/80"
                  }`}
                >
                  <h3 className="text-base font-semibold text-white">{module.title}</h3>
                  <p className="mt-1 text-sm text-slate-300">{module.summary}</p>
                  <span className="mt-3 inline-flex text-xs uppercase tracking-wide text-cyan-200">
                    {active ? "Open" : "Launch Lab"}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          aligned to ap physics c: e&amp;m ced units 11-13, especially electromagnetic induction, inductance, lr
          circuits, and lc circuits.
        </section>

        <section ref={moduleRef} className="mt-8">
          <ModuleRenderer moduleId={activeModule} />
        </section>
      </main>
    </div>
  );
}
