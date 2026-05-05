"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CEDAlignmentCard } from "@/components/simulations/CEDAlignmentCard";
import { CommonMistakeCard } from "@/components/simulations/CommonMistakeCard";
import { FormulaCard } from "@/components/simulations/FormulaCard";
import { GraphPanel } from "@/components/simulations/GraphPanel";
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

type LCState = {
  C: number;
  L: number;
  Qmax: number;
  animationSpeed: number;
  playing: boolean;
  showEnergyBars: boolean;
  showChargeSigns: boolean;
  showCurrentDirection: boolean;
  showPhaseMarkers: boolean;
  showGraphs: boolean;
};

const defaults: LCState = {
  C: 0.12,
  L: 2,
  Qmax: 2,
  animationSpeed: 1,
  playing: true,
  showEnergyBars: true,
  showChargeSigns: true,
  showCurrentDirection: true,
  showPhaseMarkers: true,
  showGraphs: true,
};

export function LCOscillatorLab() {
  const [state, setState] = useState<LCState>(defaults);
  const [time, setTime] = useState(0);
  const [lastChanged, setLastChanged] = useState<keyof LCState>("L");

  const omega = 1 / Math.sqrt(Math.max(1e-6, state.L * state.C));
  const period = (2 * Math.PI) / omega;

  useEffect(() => {
    if (!state.playing) {
      return;
    }

    let frameId = 0;
    let last: number | null = null;

    const step = (timestamp: number) => {
      if (last == null) {
        last = timestamp;
      }

      const dt = ((timestamp - last) / 1000) * state.animationSpeed;
      last = timestamp;
      setTime((previous) => previous + dt);

      frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frameId);
  }, [state.animationSpeed, state.playing]);

  const Q = state.Qmax * Math.cos(omega * time);
  const I = -omega * state.Qmax * Math.sin(omega * time);
  const Vc = Q / Math.max(1e-6, state.C);
  const Uc = (Q * Q) / (2 * Math.max(1e-6, state.C));
  const Ul = 0.5 * state.L * I * I;
  const Utotal = (state.Qmax * state.Qmax) / (2 * Math.max(1e-6, state.C));

  const cycleTime = period > 0 ? ((time % (2 * period)) + 2 * period) % (2 * period) : 0;

  const phaseLabel = useMemo(() => {
    const qNorm = Math.abs(Q) / Math.max(1e-6, Math.abs(state.Qmax));
    const iNorm = Math.abs(I) / Math.max(1e-6, omega * Math.abs(state.Qmax));

    if (qNorm > 0.92 && iNorm < 0.2) {
      return Q >= 0
        ? "Capacitor fully charged: max electric energy, zero current"
        : "Capacitor reversed: max electric energy, zero current";
    }

    if (qNorm < 0.15 && iNorm > 0.85) {
      return "Capacitor uncharged: max current, max magnetic energy";
    }

    return Q * I < 0
      ? "Capacitor discharging: current increasing"
      : "Capacitor charging with opposite polarity";
  }, [I, Q, omega, state.Qmax]);

  const graphData = useMemo(() => {
    const span = Math.max(0.4, 2 * period);
    return Array.from({ length: 200 }, (_, index) => {
      const t = (index / 199) * span;
      const q = state.Qmax * Math.cos(omega * t);
      const i = -omega * state.Qmax * Math.sin(omega * t);
      const uc = (q * q) / (2 * Math.max(1e-6, state.C));
      const ul = 0.5 * state.L * i * i;
      return { t, q, i, uc, ul, ut: uc + ul };
    });
  }, [omega, period, state.C, state.L, state.Qmax]);

  const update = (key: keyof LCState, value: number | boolean) => {
    setState((previous) => ({ ...previous, [key]: value }));
    setLastChanged(key);
  };

  const whatChanged =
    lastChanged === "L"
      ? "Increasing L increases period T = 2π√(LC), so oscillation slows down."
      : lastChanged === "C"
      ? "Increasing C also increases period because T scales with √C."
      : lastChanged === "Qmax"
      ? "Increasing initial charge increases voltage/current amplitudes and total stored energy."
      : "Display or animation controls changed the representation of the same LC oscillation model.";

  const relationshipSummary =
    "Charge and current are 90° out of phase: energy moves between capacitor electric field and inductor magnetic field while total energy stays constant in the ideal model.";

  const chargeStrength = Math.min(1, Math.abs(Q) / Math.max(1e-6, Math.abs(state.Qmax)));
  const currentStrength = Math.min(1, Math.abs(I) / Math.max(1e-6, omega * Math.abs(state.Qmax)));

  return (
    <SimulationLayout
      title="LC Oscillator Lab"
      description="Visualize oscillation frequency, phase, and energy exchange between capacitor and inductor in an ideal LC circuit."
      visual={
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
            <p className="inline-flex items-center gap-1.5">
              LC oscillator <Tooltip text="An ideal LC circuit transfers energy between capacitor electric energy and inductor magnetic energy." />
            </p>
            <p className="rounded-full border border-cyan-400/35 bg-cyan-500/10 px-3 py-1 text-cyan-100">
              {phaseLabel}
            </p>
          </div>

          <svg viewBox="0 0 620 330" className="h-[320px] w-full rounded-xl bg-slate-950/75">
            <defs>
              <marker
                id="lc-current-arrow"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <path d="M0,0 L8,4 L0,8 Z" fill="#f8fafc" />
              </marker>
            </defs>

            <line x1="110" y1="80" x2="510" y2="80" stroke="#e2e8f0" strokeWidth="3" />
            <line x1="110" y1="250" x2="510" y2="250" stroke="#e2e8f0" strokeWidth="3" />
            <line x1="110" y1="80" x2="110" y2="250" stroke="#e2e8f0" strokeWidth="3" />

            <line x1="510" y1="80" x2="510" y2="120" stroke="#e2e8f0" strokeWidth="3" />
            {Array.from({ length: 8 }, (_, index) => {
              const x = 510;
              const y = 120 + index * 14;
              return <path key={`lc-coil-${index}`} d={`M ${x} ${y} q 24 7 0 14`} fill="none" stroke="#93c5fd" strokeWidth="3" />;
            })}
            <line x1="510" y1="232" x2="510" y2="250" stroke="#e2e8f0" strokeWidth="3" />

            <line x1="215" y1="80" x2="215" y2="145" stroke="#e2e8f0" strokeWidth="3" />
            <line x1="242" y1="80" x2="242" y2="145" stroke="#e2e8f0" strokeWidth="3" />
            <line x1="215" y1="186" x2="215" y2="250" stroke="#e2e8f0" strokeWidth="3" />
            <line x1="242" y1="186" x2="242" y2="250" stroke="#e2e8f0" strokeWidth="3" />

            <rect
              x="188"
              y="145"
              width="82"
              height="41"
              fill={Q >= 0 ? "rgba(248, 250, 252, 0.1)" : "rgba(244, 114, 182, 0.08)"}
              stroke="#64748b"
              strokeWidth="1.4"
              opacity={0.5 + chargeStrength * 0.45}
            />

            {state.showChargeSigns ? (
              <>
                <text x="201" y="170" fill={Q >= 0 ? "#fde68a" : "#c4b5fd"} fontSize={16}>
                  {Q >= 0 ? "+" : "−"}
                </text>
                <text x="251" y="170" fill={Q >= 0 ? "#c4b5fd" : "#fde68a"} fontSize={16}>
                  {Q >= 0 ? "−" : "+"}
                </text>
              </>
            ) : null}

            {state.showCurrentDirection ? (
              <line
                x1="298"
                y1="63"
                x2={I >= 0 ? 370 : 230}
                y2="63"
                stroke="#f8fafc"
                strokeWidth="2"
                markerEnd="url(#lc-current-arrow)"
              />
            ) : null}
            <text x="300" y="50" textAnchor="middle" fill="#f8fafc" fontSize={12}>
              I(t) = {formatNumber(I, 3)} A
            </text>

            {Array.from({ length: 5 }, (_, index) => {
              const y = 110 + index * 18;
              return (
                <path
                  key={`lc-field-${index}`}
                  d={`M 465 ${y} q 42 -24 84 0`}
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth={1.2 + currentStrength * 2}
                  opacity={0.15 + currentStrength * 0.7}
                />
              );
            })}

            {state.showEnergyBars ? (
              <>
                <rect x="40" y="250" width="16" height={-120 * (Uc / Math.max(1e-6, Utotal))} fill="#f59e0b" />
                <rect x="64" y="250" width="16" height={-120 * (Ul / Math.max(1e-6, Utotal))} fill="#38bdf8" />
                <rect x="88" y="250" width="16" height={-120 * ((Uc + Ul) / Math.max(1e-6, Utotal))} fill="#34d399" />
                <text x="38" y="268" fill="#f8fafc" fontSize={10}>
                  Uc
                </text>
                <text x="64" y="268" fill="#f8fafc" fontSize={10}>
                  Ul
                </text>
                <text x="86" y="268" fill="#f8fafc" fontSize={10}>
                  Ut
                </text>
              </>
            ) : null}

            {state.showPhaseMarkers ? (
              <text x="308" y="305" textAnchor="middle" fill="#cbd5e1" fontSize={12}>
                Charge and current are 90° out of phase
              </text>
            ) : null}
          </svg>
        </div>
      }
      sidebar={
        <div className="space-y-3">
          <CEDAlignmentCard alignment={cedAlignments.lcOscillator} />

          <div className="grid grid-cols-2 gap-2">
            <LiveValueCard label="Angular Frequency ω" value={formatNumber(omega, 4)} unit="rad/s" />
            <LiveValueCard label="Period T" value={formatNumber(period, 4)} unit="s" />
            <LiveValueCard label="Charge Q(t)" value={formatNumber(Q, 4)} unit="C" />
            <LiveValueCard label="Current I(t)" value={formatNumber(I, 4)} unit="A" />
            <LiveValueCard label="Capacitor Voltage VC" value={formatNumber(Vc, 4)} unit="V" />
            <LiveValueCard label="Capacitor Energy UC" value={formatNumber(Uc, 4)} unit="J" />
            <LiveValueCard label="Inductor Energy UL" value={formatNumber(Ul, 4)} unit="J" />
            <LiveValueCard label="Total Energy" value={formatNumber(Uc + Ul, 4)} unit="J" />
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-700/70 bg-slate-900/60 p-3">
            <SliderControl
              id="lc-c"
              label="Capacitance C"
              value={state.C}
              min={0.001}
              max={1}
              step={0.001}
              unit="F"
              onChange={(value) => update("C", value)}
            />
            <SliderControl
              id="lc-l"
              label="Inductance L"
              value={state.L}
              min={0.1}
              max={10}
              step={0.05}
              unit="H"
              onChange={(value) => update("L", value)}
            />
            <SliderControl
              id="lc-qmax"
              label="Initial Charge Qmax"
              value={state.Qmax}
              min={0.01}
              max={5}
              step={0.01}
              unit="C"
              onChange={(value) => update("Qmax", value)}
            />
            <SliderControl
              id="lc-speed"
              label="Animation Speed"
              value={state.animationSpeed}
              min={0.2}
              max={4}
              step={0.1}
              unit="×"
              onChange={(value) => update("animationSpeed", value)}
            />

            <div className="grid gap-2">
              <ToggleControl
                id="lc-energy-bars"
                label="Show Energy Bars"
                checked={state.showEnergyBars}
                onChange={(checked) => update("showEnergyBars", checked)}
              />
              <ToggleControl
                id="lc-charge-signs"
                label="Show Capacitor Charge Signs"
                checked={state.showChargeSigns}
                onChange={(checked) => update("showChargeSigns", checked)}
              />
              <ToggleControl
                id="lc-current-dir"
                label="Show Current Direction"
                checked={state.showCurrentDirection}
                onChange={(checked) => update("showCurrentDirection", checked)}
              />
              <ToggleControl
                id="lc-phase"
                label="Show Phase Markers"
                checked={state.showPhaseMarkers}
                onChange={(checked) => update("showPhaseMarkers", checked)}
              />
              <ToggleControl
                id="lc-graphs"
                label="Show Graphs"
                checked={state.showGraphs}
                onChange={(checked) => update("showGraphs", checked)}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => update("playing", !state.playing)}
                className="rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-3 py-2 text-sm text-cyan-100"
              >
                {state.playing ? "Pause" : "Play"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTime(0);
                  update("playing", true);
                }}
                className="rounded-xl border border-slate-600 bg-slate-800/60 px-3 py-2 text-sm text-slate-100"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setTime(cycleTime + period / 4)}
                className="rounded-xl border border-slate-600 bg-slate-800/60 px-3 py-2 text-sm text-slate-100"
              >
                Shift Phase
              </button>
            </div>
          </div>

          <FormulaCard
            title="LC Frequency"
            equation={String.raw`\omega = \frac{1}{\sqrt{LC}},\quad T = 2\pi\sqrt{LC}`}
            definitions={[
              { symbol: String.raw`\omega`, meaning: "angular frequency", unit: "rad/s" },
              { symbol: String.raw`T`, meaning: "period", unit: "s" },
            ]}
            physicalMeaning="Larger L or C gives a slower oscillation and longer period."
          />

          <FormulaCard
            title="Charge and Current"
            equation={String.raw`Q(t)=Q_{\max}\cos(\omega t),\quad I(t)=-\omega Q_{\max}\sin(\omega t)`}
            definitions={[
              { symbol: String.raw`Q_{\max}`, meaning: "initial charge amplitude", unit: "C" },
              { symbol: String.raw`I`, meaning: "circuit current", unit: "A" },
            ]}
            physicalMeaning="Charge and current oscillate sinusoidally and are out of phase by 90°."
          />

          <FormulaCard
            title="Energy Exchange"
            equation={String.raw`U_C=\frac{Q^2}{2C},\quad U_L=\frac{1}{2}LI^2`}
            definitions={[
              { symbol: String.raw`U_C`, meaning: "capacitor electric energy", unit: "J" },
              { symbol: String.raw`U_L`, meaning: "inductor magnetic energy", unit: "J" },
            ]}
            physicalMeaning="Energy transfers between capacitor and inductor while ideal total energy remains constant."
          />

          <WhatChangedCard text={whatChanged} />
          <RelationshipSummaryCard
            summary={relationshipSummary}
            constants={[
              { label: "L", value: `${formatNumber(state.L, 2)} H` },
              { label: "C", value: `${formatNumber(state.C, 3)} F` },
              { label: "ω", value: `${formatNumber(omega, 3)} rad/s` },
              { label: "T", value: `${formatNumber(period, 3)} s` },
            ]}
          />
          <CommonMistakeCard text="Common mistake: when capacitor charge is zero, energy has not disappeared. It is stored in the inductor's magnetic field." />
          <ModelAssumptionsCard assumptions={defaultModelAssumptions} />
        </div>
      }
      bottom={
        state.showGraphs ? (
          <div className="grid gap-4 xl:grid-cols-2">
            <GraphPanel title="Charge vs Time">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graphData} margin={{ top: 8, right: 12, left: 8, bottom: 10 }}>
                  <CartesianGrid stroke="#334155" strokeDasharray="4 4" />
                  <XAxis
                    dataKey="t"
                    type="number"
                    domain={[0, Math.max(0.4, 2 * period)]}
                    stroke="#94a3b8"
                    tick={{ fill: "#cbd5e1", fontSize: 12 }}
                    label={{ value: "t (s)", fill: "#e2e8f0", position: "insideBottom", offset: -2 }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fill: "#cbd5e1", fontSize: 12 }}
                    label={{ value: "Q (C)", fill: "#e2e8f0", angle: -90, position: "insideLeft" }}
                  />
                  <RechartsTooltip
                    formatter={(value) => [`${formatNumber(Number(value), 3)} C`, "Charge"]}
                    labelFormatter={(label) => `t = ${formatNumber(Number(label), 3)} s`}
                    contentStyle={{
                      background: "#020617",
                      border: "1px solid #334155",
                      borderRadius: 10,
                      color: "#e2e8f0",
                    }}
                  />
                  <ReferenceLine x={cycleTime} stroke="#e2e8f0" strokeDasharray="4 4" />
                  <Line dataKey="q" type="monotone" stroke="#facc15" dot={false} strokeWidth={2.2} />
                </LineChart>
              </ResponsiveContainer>
            </GraphPanel>

            <GraphPanel title="Current vs Time">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graphData} margin={{ top: 8, right: 12, left: 8, bottom: 10 }}>
                  <CartesianGrid stroke="#334155" strokeDasharray="4 4" />
                  <XAxis
                    dataKey="t"
                    type="number"
                    domain={[0, Math.max(0.4, 2 * period)]}
                    stroke="#94a3b8"
                    tick={{ fill: "#cbd5e1", fontSize: 12 }}
                    label={{ value: "t (s)", fill: "#e2e8f0", position: "insideBottom", offset: -2 }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fill: "#cbd5e1", fontSize: 12 }}
                    label={{ value: "I (A)", fill: "#e2e8f0", angle: -90, position: "insideLeft" }}
                  />
                  <RechartsTooltip
                    formatter={(value) => [`${formatNumber(Number(value), 3)} A`, "Current"]}
                    labelFormatter={(label) => `t = ${formatNumber(Number(label), 3)} s`}
                    contentStyle={{
                      background: "#020617",
                      border: "1px solid #334155",
                      borderRadius: 10,
                      color: "#e2e8f0",
                    }}
                  />
                  <ReferenceLine y={0} stroke="#64748b" strokeDasharray="4 4" />
                  <ReferenceLine x={cycleTime} stroke="#e2e8f0" strokeDasharray="4 4" />
                  <Line dataKey="i" type="monotone" stroke="#22d3ee" dot={false} strokeWidth={2.2} />
                </LineChart>
              </ResponsiveContainer>
            </GraphPanel>

            <div className="xl:col-span-2">
              <GraphPanel title="Energy vs Time">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={graphData} margin={{ top: 8, right: 12, left: 8, bottom: 10 }}>
                    <CartesianGrid stroke="#334155" strokeDasharray="4 4" />
                    <XAxis
                      dataKey="t"
                      type="number"
                      domain={[0, Math.max(0.4, 2 * period)]}
                      stroke="#94a3b8"
                      tick={{ fill: "#cbd5e1", fontSize: 12 }}
                      label={{ value: "t (s)", fill: "#e2e8f0", position: "insideBottom", offset: -2 }}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      tick={{ fill: "#cbd5e1", fontSize: 12 }}
                      label={{ value: "Energy (J)", fill: "#e2e8f0", angle: -90, position: "insideLeft" }}
                    />
                    <RechartsTooltip
                      formatter={(value, name) => [`${formatNumber(Number(value), 3)} J`, name]}
                      labelFormatter={(label) => `t = ${formatNumber(Number(label), 3)} s`}
                      contentStyle={{
                        background: "#020617",
                        border: "1px solid #334155",
                        borderRadius: 10,
                        color: "#e2e8f0",
                      }}
                    />
                    <ReferenceLine x={cycleTime} stroke="#e2e8f0" strokeDasharray="4 4" />
                    <Line dataKey="uc" name="UC" type="monotone" stroke="#f59e0b" dot={false} strokeWidth={2.2} />
                    <Line dataKey="ul" name="UL" type="monotone" stroke="#38bdf8" dot={false} strokeWidth={2.2} />
                    <Line dataKey="ut" name="Utotal" type="monotone" stroke="#34d399" dot={false} strokeWidth={2.2} />
                  </LineChart>
                </ResponsiveContainer>
              </GraphPanel>
            </div>
          </div>
        ) : null
      }
    />
  );
}
