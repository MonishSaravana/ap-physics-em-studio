"use client";

import { useMemo, useState } from "react";
import { CEDAlignmentCard } from "@/components/simulations/CEDAlignmentCard";
import { CommonMistakeCard } from "@/components/simulations/CommonMistakeCard";
import { FormulaCard } from "@/components/simulations/FormulaCard";
import { LiveValueCard } from "@/components/simulations/LiveValueCard";
import { ModelAssumptionsCard } from "@/components/simulations/ModelAssumptionsCard";
import { RelationshipSummaryCard } from "@/components/simulations/RelationshipSummaryCard";
import { SimulationLayout } from "@/components/simulations/SimulationLayout";
import { SliderControl } from "@/components/simulations/SliderControl";
import { ToggleControl } from "@/components/simulations/ToggleControl";
import { Tooltip } from "@/components/simulations/Tooltip";
import { WhatChangedCard } from "@/components/simulations/WhatChangedCard";
import { cedAlignments, defaultModelAssumptions } from "@/data/ced";
import { formatNumber } from "@/lib/format";

type InductanceState = {
  L: number;
  I: number;
  dIdt: number;
  N: number;
  area: number;
  length: number;
  muR: number;
  showFieldLines: boolean;
  showInducedDirection: boolean;
  showGeometryCalculation: boolean;
};

const mu0 = 4 * Math.PI * 1e-7;
const didtEpsilon = 1e-6;

const defaults: InductanceState = {
  L: 1.8,
  I: 1.6,
  dIdt: 2.2,
  N: 180,
  area: 0.02,
  length: 0.35,
  muR: 250,
  showFieldLines: true,
  showInducedDirection: true,
  showGeometryCalculation: true,
};

export function InductanceVisualizer() {
  const [state, setState] = useState<InductanceState>(defaults);
  const [lastChanged, setLastChanged] = useState<keyof InductanceState>("dIdt");

  const geometryL = useMemo(
    () => (mu0 * state.muR * state.N * state.N * state.area) / Math.max(0.01, state.length),
    [state.N, state.area, state.length, state.muR]
  );

  const effectiveL = state.showGeometryCalculation ? geometryL : state.L;

  // Induced emf from inductor law: inductor opposes current changes.
  const inducedEmf = -effectiveL * state.dIdt;
  const storedEnergy = 0.5 * effectiveL * state.I * state.I;
  const hasInducedDirection = Math.abs(state.dIdt) > didtEpsilon;

  const update = (key: keyof InductanceState, value: number | boolean) => {
    setState((previous) => ({ ...previous, [key]: value }));
    setLastChanged(key);
  };

  const whatChanged =
    lastChanged === "L"
      ? "Increasing L increases |induced emf| for the same dI/dt."
      : lastChanged === "I"
      ? "Stored magnetic energy increases with I², so doubling current quadruples energy."
      : lastChanged === "dIdt"
      ? "Faster current change creates larger induced emf that opposes that change."
      : lastChanged === "N"
      ? "Increasing turns strongly raises inductance because L is proportional to N² for a solenoid model."
      : lastChanged === "length"
      ? "Increasing solenoid length decreases inductance because L is inversely proportional to length."
      : lastChanged === "area"
      ? "Increasing cross-sectional area increases inductance and magnetic energy capacity."
      : lastChanged === "muR"
      ? "Higher core permeability increases inductance by strengthening magnetic coupling."
      : "Display toggles changed representations while preserving the same governing equations.";

  const relationshipSummary =
    "Inductors oppose changes in current: ℰL scales with dI/dt and L, while stored magnetic energy scales with I².";

  const coilTurns = Math.max(8, Math.min(24, Math.round(state.N / 20)));
  const fieldStrength = Math.min(1, Math.abs(state.I) / 5);

  return (
    <SimulationLayout
      title="Inductance Visualizer"
      description="Inspect how inductance, changing current, solenoid geometry, and permeability shape induced emf and magnetic energy storage."
      visual={
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
            <p className="inline-flex items-center gap-1.5">
              Inductance model <Tooltip text="Inductance measures how strongly a conductor opposes changes in current." />
            </p>
            <p className="rounded-full border border-violet-400/35 bg-violet-500/10 px-3 py-1 text-violet-100">
              {!hasInducedDirection ? "No change in current" : state.dIdt > 0 ? "Opposes increase" : "Opposes decrease"}
            </p>
          </div>

          <svg viewBox="0 0 600 320" className="h-[310px] w-full rounded-xl bg-slate-950/75">
            <defs>
              <marker
                id="inductor-arrow"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <path d="M0,0 L8,4 L0,8 Z" fill="#f8fafc" />
              </marker>
            </defs>

            <line x1="60" y1="160" x2="120" y2="160" stroke="#e2e8f0" strokeWidth="3" />
            <line x1="480" y1="160" x2="540" y2="160" stroke="#e2e8f0" strokeWidth="3" />

            {Array.from({ length: coilTurns }, (_, index) => {
              const x = 120 + (index * 360) / coilTurns;
              return (
                <path
                  key={`coil-${index}`}
                  d={`M ${x} 160 q 7 -28 14 0`}
                  fill="none"
                  stroke="#93c5fd"
                  strokeWidth="3"
                />
              );
            })}

            {state.showFieldLines
              ? Array.from({ length: 8 }, (_, index) => {
                  const y = 106 + index * 16;
                  return (
                    <line
                      key={`field-${index}`}
                      x1="145"
                      y1={y}
                      x2="455"
                      y2={y}
                      stroke="#38bdf8"
                      strokeWidth={1 + fieldStrength * 2.5}
                      opacity={0.2 + fieldStrength * 0.8}
                    />
                  );
                })
              : null}

            <line
              x1="90"
              y1="135"
              x2={state.I >= 0 ? 170 : 40}
              y2="135"
              stroke="#f8fafc"
              strokeWidth="2"
              markerEnd="url(#inductor-arrow)"
            />
            <text x="76" y="124" fill="#f8fafc" fontSize={13}>
              I = {formatNumber(state.I, 2)} A
            </text>

            {state.showInducedDirection && hasInducedDirection ? (
              <>
                <line
                  x1="510"
                  y1="195"
                  x2={state.dIdt > 0 ? 440 : 560}
                  y2="195"
                  stroke="#f472b6"
                  strokeWidth="2.2"
                  markerEnd="url(#inductor-arrow)"
                />
                <text x="390" y="205" fill="#f9a8d4" fontSize={13}>
                  Induced emf direction opposes dI/dt
                </text>
              </>
            ) : state.showInducedDirection ? (
              <text x="386" y="205" fill="#cbd5e1" fontSize={13}>
                dI/dt = 0, so induced emf is zero
              </text>
            ) : null}

            <text x="34" y="33" fill="#cbd5e1" fontSize={13}>
              Solenoid model: L = μN²A/ℓ
            </text>
            <text x="34" y="287" fill="#7dd3fc" fontSize={13}>
              {state.showGeometryCalculation
                ? `Using geometry-derived L = ${formatNumber(geometryL, 4)} H`
                : `Using manual L slider = ${formatNumber(state.L, 3)} H`}
            </text>
          </svg>
        </div>
      }
      sidebar={
        <div className="space-y-3">
          <CEDAlignmentCard alignment={cedAlignments.inductance} />

          <div className="grid grid-cols-2 gap-2">
            <LiveValueCard label="Current I" value={formatNumber(state.I, 3)} unit="A" />
            <LiveValueCard label="Rate dI/dt" value={formatNumber(state.dIdt, 3)} unit="A/s" />
            <LiveValueCard label="Effective L" value={formatNumber(effectiveL, 4)} unit="H" />
            <LiveValueCard label="Induced emf ℰL" value={formatNumber(inducedEmf, 4)} unit="V" />
            <LiveValueCard label="Stored Energy UL" value={formatNumber(storedEnergy, 4)} unit="J" />
            <LiveValueCard label="Geometry L" value={formatNumber(geometryL, 4)} unit="H" />
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-700/70 bg-slate-900/60 p-3">
            <SliderControl
              id="inductance-l"
              label="Inductance L"
              value={state.L}
              min={0.1}
              max={10}
              step={0.05}
              unit="H"
              onChange={(value) => update("L", value)}
            />
            <SliderControl
              id="inductance-i"
              label="Current I"
              value={state.I}
              min={-5}
              max={5}
              step={0.05}
              unit="A"
              onChange={(value) => update("I", value)}
            />
            <SliderControl
              id="inductance-didt"
              label="Rate dI/dt"
              value={state.dIdt}
              min={-10}
              max={10}
              step={0.1}
              unit="A/s"
              onChange={(value) => update("dIdt", value)}
            />
            <SliderControl
              id="inductance-n"
              label="Turns N"
              value={state.N}
              min={10}
              max={500}
              step={1}
              digits={0}
              unit="turns"
              onChange={(value) => update("N", value)}
            />
            <SliderControl
              id="inductance-area"
              label="Solenoid Area A"
              value={state.area}
              min={0.001}
              max={0.1}
              step={0.001}
              unit="m²"
              onChange={(value) => update("area", value)}
            />
            <SliderControl
              id="inductance-length"
              label="Solenoid Length ℓ"
              value={state.length}
              min={0.05}
              max={2}
              step={0.01}
              unit="m"
              onChange={(value) => update("length", value)}
            />
            <SliderControl
              id="inductance-mur"
              label="Permeability μr"
              value={state.muR}
              min={1}
              max={1000}
              step={1}
              digits={0}
              unit="×"
              onChange={(value) => update("muR", value)}
            />

            <div className="grid gap-2">
              <ToggleControl
                id="inductance-field"
                label="Show Magnetic Field Lines"
                checked={state.showFieldLines}
                onChange={(checked) => update("showFieldLines", checked)}
              />
              <ToggleControl
                id="inductance-emf-dir"
                label="Show Induced emf Direction"
                checked={state.showInducedDirection}
                onChange={(checked) => update("showInducedDirection", checked)}
              />
              <ToggleControl
                id="inductance-geometry"
                label="Use Solenoid Geometry Calculation"
                checked={state.showGeometryCalculation}
                onChange={(checked) => update("showGeometryCalculation", checked)}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setState(defaults);
                setLastChanged("dIdt");
              }}
              className="w-full rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-3 py-2 text-sm text-cyan-100"
            >
              Reset Module
            </button>
          </div>

          <FormulaCard
            title="Inductor emf"
            equation={String.raw`\mathcal{E}_L = -L\frac{dI}{dt}`}
            definitions={[
              { symbol: String.raw`\mathcal{E}_L`, meaning: "induced emf", unit: "V" },
              { symbol: String.raw`L`, meaning: "inductance", unit: "H" },
              { symbol: String.raw`dI/dt`, meaning: "rate of current change", unit: "A/s" },
            ]}
            physicalMeaning="The inductor creates an emf that opposes current changes."
          />

          <FormulaCard
            title="Magnetic Energy"
            equation={String.raw`U_L = \frac{1}{2}LI^2`}
            definitions={[
              { symbol: String.raw`U_L`, meaning: "stored magnetic energy", unit: "J" },
              { symbol: String.raw`I`, meaning: "current", unit: "A" },
            ]}
            physicalMeaning="An inductor stores energy in its magnetic field and that energy scales with current squared."
          />

          <FormulaCard
            title="Solenoid Inductance"
            equation={String.raw`L = \frac{\mu N^2A}{\ell}`}
            definitions={[
              { symbol: String.raw`\mu`, meaning: "magnetic permeability", unit: "H/m" },
              { symbol: String.raw`N`, meaning: "turn count", unit: "turns" },
              { symbol: String.raw`A`, meaning: "cross-sectional area", unit: "m²" },
              { symbol: String.raw`\ell`, meaning: "solenoid length", unit: "m" },
            ]}
            physicalMeaning="Solenoid geometry and core material strongly influence inductance."
          />

          <WhatChangedCard text={whatChanged} />
          <RelationshipSummaryCard
            summary={relationshipSummary}
            constants={[
              { label: "L used", value: `${formatNumber(effectiveL, 4)} H` },
              { label: "I", value: `${formatNumber(state.I, 2)} A` },
              { label: "dI/dt", value: `${formatNumber(state.dIdt, 2)} A/s` },
            ]}
          />
          <CommonMistakeCard text="Common mistake: an inductor does not always block current. It opposes changes in current. Once current is constant, an ideal inductor acts like a wire." />
          <ModelAssumptionsCard assumptions={defaultModelAssumptions} />
        </div>
      }
    />
  );
}
