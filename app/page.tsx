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
    <div className="instrument-shell min-h-screen overflow-x-hidden text-slate-100">
      <header className="instrument-header">
        <div className="mx-auto flex w-full max-w-[1480px] flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6 lg:px-8">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">E&amp;M Studio</p>
          <nav className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            <a
              href="https://github.com/MonishSaravana"
              target="_blank"
              rel="noreferrer"
              className="instrument-link"
            >
              Monish Saravana
            </a>
            <a
              href="https://monishsaravana.com"
              target="_blank"
              rel="noreferrer"
              className="instrument-link"
            >
              monishsaravana.com
            </a>
            <a
              href="https://github.com/MonishSaravana/ap-physics-em-studio"
              target="_blank"
              rel="noreferrer"
              className="instrument-link"
            >
              Source Code
            </a>
          </nav>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-[1480px] px-4 pb-16 pt-8 md:px-6 lg:px-8">
        <section className="instrument-hero">
          <h1 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">e&amp;m studio</h1>
          <p className="mt-2 text-sm uppercase tracking-[0.22em] text-cyan-200">Monish Saravana</p>
          <p className="mt-5 max-w-4xl text-base leading-relaxed text-slate-200 md:text-lg">
            Model, manipulate, and visualize AP Physics C: Electricity and Magnetism. Adjust inputs, watch fields and
            circuits respond, and connect formulas directly to graphs and physical behavior.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["CED Unit 11", "CED Unit 12", "CED Unit 13", "Electromagnetic Induction", "LR and LC Circuits"].map(
              (pill) => (
                <span key={pill} className="ced-pill">
                  {pill}
                </span>
              ),
            )}
          </div>
        </section>

        <section className="mt-6">
          <details open className="instrument-module-dropdown">
            <summary className="instrument-module-summary">Simulation Modules</summary>
            <div className="mt-3 space-y-2">
              {moduleCards.map((module) => {
                const active = module.id === activeModule;
                return (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => launchModule(module.id)}
                    className={`instrument-module-item w-full text-left ${active ? "is-active" : ""}`}
                  >
                    <span className="block text-base font-semibold text-white">{module.title}</span>
                    <span className="mt-1 block text-sm text-slate-300">{module.summary}</span>
                  </button>
                );
              })}
            </div>
          </details>
        </section>

        <section className="mt-5 border-l-2 border-emerald-300/60 pl-4 text-sm text-emerald-100/90">
          Aligned to AP Physics C: E&amp;M CED Units 11–13, especially electromagnetic induction, inductance, LR
          circuits, and LC circuits.
        </section>

        <section ref={moduleRef} className="mt-6">
          <ModuleRenderer moduleId={activeModule} />
        </section>
      </main>

      <footer className="instrument-footer">
        <div className="mx-auto flex w-full max-w-[1480px] flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs text-slate-300 md:px-6 lg:px-8 sm:text-sm">
          <p>E&amp;M Studio by Monish Saravana</p>
          <div className="flex flex-wrap items-center gap-2">
            <a href="https://github.com/MonishSaravana" target="_blank" rel="noreferrer" className="instrument-link">
              Monish Saravana
            </a>
            <a href="https://monishsaravana.com" target="_blank" rel="noreferrer" className="instrument-link">
              monishsaravana.com
            </a>
            <a
              href="https://github.com/MonishSaravana/ap-physics-em-studio"
              target="_blank"
              rel="noreferrer"
              className="instrument-link"
            >
              Source Code
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
