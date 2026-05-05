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

type ComparisonMode = "rc" | "lr" | "side-by-side";

type RCvsLRState = {
  mode: ComparisonMode;
  V: number;
  R: number;
  C: number;
  L: number;
  animationSpeed: number;
  playing: boolean;
  showBehaviorTable: boolean;
};

const defaults: RCvsLRState = {
  mode: "side-by-side",
  V: 12,
  R: 12,
  C: 0.12,
  L: 2.4,
  animationSpeed: 1,
  playing: true,
  showBehaviorTable: true,
};

export function RCvsLRComparison() {
  const [state, setState] = useState<RCvsLRState>(defaults);
  const [time, setTime] = useState(0);
  const [lastChanged, setLastChanged] = useState<keyof RCvsLRState>("R");

  const tauRC = Math.max(1e-6, state.R * state.C);
  const tauLR = Math.max(1e-6, state.L / Math.max(1e-6, state.R));
  const span = Math.max(0.6, 6 * Math.max(tauRC, tauLR));

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

      setTime((previous) => {
        const next = previous + dt;
        if (next > span) {
          return 0;
        }
        return next;
      });

      frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [span, state.animationSpeed, state.playing]);

  const rcValues = {
    Vc: state.V * (1 - Math.exp(-time / tauRC)),
    Irc: (state.V / Math.max(1e-6, state.R)) * Math.exp(-time / tauRC),
  };

  const lrValues = {
    Ilr: (state.V / Math.max(1e-6, state.R)) * (1 - Math.exp(-time / tauLR)),
    Vlr: state.V * Math.exp(-time / tauLR),
  };

  const data = useMemo(() => {
    return Array.from({ length: 180 }, (_, index) => {
      const t = (index / 179) * span;
      const vc = state.V * (1 - Math.exp(-t / tauRC));
      const irc = (state.V / Math.max(1e-6, state.R)) * Math.exp(-t / tauRC);
      const ilr = (state.V / Math.max(1e-6, state.R)) * (1 - Math.exp(-t / tauLR));
      const vlr = state.V * Math.exp(-t / tauLR);
      return { t, vc, irc, ilr, vlr };
    });
  }, [span, state.R, state.V, tauRC, tauLR]);

  const update = (key: keyof RCvsLRState, value: number | boolean | ComparisonMode) => {
    setState((previous) => ({ ...previous, [key]: value }));
    setLastChanged(key);
  };

  const whatChanged =
    lastChanged === "R"
      ? "Increasing R increases τRC = RC but decreases τLR = L/R. RC slows while LR speeds up (with smaller final LR current)."
      : lastChanged === "C"
      ? "Increasing C increases τRC, so capacitor charging becomes slower."
      : lastChanged === "L"
      ? "Increasing L increases τLR, so inductor current rises more slowly."
      : lastChanged === "mode"
      ? "Mode filter changed which transient model is emphasized in visuals and graphs."
      : "Animation controls changed how quickly you see the same exponential relationships.";

  const relationshipSummary =
    "Capacitors resist sudden voltage change; inductors resist sudden current change. RC and LR both show exponentials, but τ responds differently to resistance.";

  return (
    <SimulationLayout
      title="RC vs LR Comparison"
      description="Compare RC and LR transient behavior side-by-side to highlight analogies, contrasts, and time-constant dependence."
      visual={
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
            <p className="inline-flex items-center gap-1.5">
              Transient comparison <Tooltip text="RC and LR both use exponential responses but differ in what cannot change instantly." />
            </p>
            <p className="rounded-full border border-cyan-400/35 bg-cyan-500/10 px-3 py-1 text-cyan-100">
              Mode: {state.mode}
            </p>
          </div>

          <svg viewBox="0 0 620 320" className="h-[310px] w-full rounded-xl bg-slate-950/75">
            <rect x="40" y="42" width="250" height="236" rx="14" fill="rgba(30,41,59,0.55)" stroke="#334155" />
            <rect x="330" y="42" width="250" height="236" rx="14" fill="rgba(30,41,59,0.55)" stroke="#334155" />

            <text x="165" y="68" textAnchor="middle" fill="#f8fafc" fontSize={14}>
              RC Circuit
            </text>
            <text x="455" y="68" textAnchor="middle" fill="#f8fafc" fontSize={14}>
              LR Circuit
            </text>

            <text x="62" y="97" fill="#f8fafc" fontSize={12}>
              τRC = {formatNumber(tauRC, 3)} s
            </text>
            <text x="352" y="97" fill="#f8fafc" fontSize={12}>
              τLR = {formatNumber(tauLR, 3)} s
            </text>

            <text x="62" y="126" fill="#facc15" fontSize={12}>
              Vc(t) = {formatNumber(rcValues.Vc, 3)} V
            </text>
            <text x="62" y="148" fill="#22d3ee" fontSize={12}>
              Irc(t) = {formatNumber(rcValues.Irc, 3)} A
            </text>

            <text x="352" y="126" fill="#22d3ee" fontSize={12}>
              Ilr(t) = {formatNumber(lrValues.Ilr, 3)} A
            </text>
            <text x="352" y="148" fill="#93c5fd" fontSize={12}>
              Vl(t) = {formatNumber(lrValues.Vlr, 3)} V
            </text>

            <line x1="74" y1="178" x2="256" y2="178" stroke="#f8fafc" strokeWidth="2.5" />
            <line x1="116" y1="178" x2="116" y2="222" stroke="#f8fafc" strokeWidth="2.5" />
            <line x1="132" y1="178" x2="132" y2="222" stroke="#f8fafc" strokeWidth="2.5" />
            <line x1="74" y1="222" x2="256" y2="222" stroke="#f8fafc" strokeWidth="2.5" />

            <line x1="364" y1="178" x2="546" y2="178" stroke="#f8fafc" strokeWidth="2.5" />
            <rect x="418" y="163" width="45" height="30" rx="4" fill="#7c2d12" opacity="0.55" />
            {Array.from({ length: 5 }, (_, index) => {
              const x = 480 + index * 13;
              return <path key={x} d={`M ${x} 178 q 6 -18 12 0`} fill="none" stroke="#93c5fd" strokeWidth="2.5" />;
            })}
            <line x1="364" y1="222" x2="546" y2="222" stroke="#f8fafc" strokeWidth="2.5" />

            {state.showBehaviorTable ? (
              <>
                <text x="44" y="258" fill="#cbd5e1" fontSize={11}>
                  RC: capacitor voltage cannot jump instantly.
                </text>
                <text x="334" y="258" fill="#cbd5e1" fontSize={11}>
                  LR: inductor current cannot jump instantly.
                </text>
              </>
            ) : null}
          </svg>
        </div>
      }
      sidebar={
        <div className="space-y-3">
          <CEDAlignmentCard alignment={cedAlignments.rcVsLr} />

          <div className="grid grid-cols-2 gap-2">
            <LiveValueCard label="τRC" value={formatNumber(tauRC, 4)} unit="s" />
            <LiveValueCard label="τLR" value={formatNumber(tauLR, 4)} unit="s" />
            <LiveValueCard label="Vc(t)" value={formatNumber(rcValues.Vc, 4)} unit="V" />
            <LiveValueCard label="Irc(t)" value={formatNumber(rcValues.Irc, 4)} unit="A" />
            <LiveValueCard label="Ilr(t)" value={formatNumber(lrValues.Ilr, 4)} unit="A" />
            <LiveValueCard label="Vl(t)" value={formatNumber(lrValues.Vlr, 4)} unit="V" />
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-700/70 bg-slate-900/60 p-3">
            <label className="flex items-center justify-between gap-2 rounded-xl border border-slate-700/70 bg-slate-900/55 px-3 py-2 text-sm text-slate-200">
              <span>Mode</span>
              <select
                value={state.mode}
                onChange={(event) => update("mode", event.target.value as ComparisonMode)}
                className="rounded-lg border border-slate-600 bg-slate-950 px-2 py-1 text-xs"
              >
                <option value="rc">RC Only</option>
                <option value="lr">LR Only</option>
                <option value="side-by-side">Side-by-Side</option>
              </select>
            </label>

            <SliderControl
              id="compare-v"
              label="Battery Voltage"
              value={state.V}
              min={0}
              max={24}
              step={0.1}
              unit="V"
              onChange={(value) => update("V", value)}
            />
            <SliderControl
              id="compare-r"
              label="Resistance"
              value={state.R}
              min={1}
              max={100}
              step={0.5}
              unit="Ω"
              onChange={(value) => update("R", value)}
            />
            <SliderControl
              id="compare-c"
              label="Capacitance C"
              value={state.C}
              min={0.001}
              max={1}
              step={0.001}
              unit="F"
              onChange={(value) => update("C", value)}
            />
            <SliderControl
              id="compare-l"
              label="Inductance L"
              value={state.L}
              min={0.1}
              max={10}
              step={0.05}
              unit="H"
              onChange={(value) => update("L", value)}
            />
            <SliderControl
              id="compare-speed"
              label="Animation Speed"
              value={state.animationSpeed}
              min={0.2}
              max={4}
              step={0.1}
              unit="×"
              onChange={(value) => update("animationSpeed", value)}
            />

            <ToggleControl
              id="compare-table"
              label="Show Immediate vs Long-Time Table"
              checked={state.showBehaviorTable}
              onChange={(checked) => update("showBehaviorTable", checked)}
            />

            <div className="grid grid-cols-2 gap-2">
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
            </div>
          </div>

          <FormulaCard
            title="RC Charging"
            equation={String.raw`\tau_{RC}=RC,\quad V_C(t)=V\left(1-e^{-t/RC}\right)`}
            definitions={[
              { symbol: String.raw`\tau_{RC}`, meaning: "RC time constant", unit: "s" },
              { symbol: String.raw`V_C`, meaning: "capacitor voltage", unit: "V" },
            ]}
            physicalMeaning="RC charging slows down when either resistance or capacitance increases."
          />

          <FormulaCard
            title="LR Rise"
            equation={String.raw`\tau_{LR}=\frac{L}{R},\quad I(t)=\frac{V}{R}\left(1-e^{-Rt/L}\right)`}
            definitions={[
              { symbol: String.raw`\tau_{LR}`, meaning: "LR time constant", unit: "s" },
              { symbol: String.raw`I`, meaning: "inductor current", unit: "A" },
            ]}
            physicalMeaning="LR current rises more slowly when L increases, but increasing R speeds transient approach while lowering final current."
          />

          <WhatChangedCard text={whatChanged} />
          <RelationshipSummaryCard
            summary={relationshipSummary}
            constants={[
              { label: "R", value: `${formatNumber(state.R, 2)} Ω` },
              { label: "C", value: `${formatNumber(state.C, 3)} F` },
              { label: "L", value: `${formatNumber(state.L, 2)} H` },
              { label: "τRC", value: `${formatNumber(tauRC, 3)} s` },
              { label: "τLR", value: `${formatNumber(tauLR, 3)} s` },
            ]}
          />
          <CommonMistakeCard text="Common mistake: RC and LR circuits both have exponential behavior, but their time constants respond differently to resistance." />
          <ModelAssumptionsCard assumptions={defaultModelAssumptions} />
        </div>
      }
      bottom={
        <div className="grid gap-4 xl:grid-cols-2">
          {(state.mode === "rc" || state.mode === "side-by-side") && (
            <GraphPanel title="RC Capacitor Voltage vs Time">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 8, right: 12, left: 8, bottom: 10 }}>
                  <CartesianGrid stroke="#334155" strokeDasharray="4 4" />
                  <XAxis
                    dataKey="t"
                    type="number"
                    domain={[0, span]}
                    stroke="#94a3b8"
                    tick={{ fill: "#cbd5e1", fontSize: 12 }}
                    label={{ value: "t (s)", fill: "#e2e8f0", position: "insideBottom", offset: -2 }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fill: "#cbd5e1", fontSize: 12 }}
                    label={{ value: "Vc (V)", fill: "#e2e8f0", angle: -90, position: "insideLeft" }}
                  />
                  <RechartsTooltip
                    formatter={(value) => [`${formatNumber(Number(value), 3)} V`, "Vc"]}
                    labelFormatter={(label) => `t = ${formatNumber(Number(label), 3)} s`}
                    contentStyle={{ background: "#020617", border: "1px solid #334155", borderRadius: 10, color: "#e2e8f0" }}
                  />
                  <ReferenceLine x={time} stroke="#e2e8f0" strokeDasharray="4 4" />
                  <Line dataKey="vc" type="monotone" stroke="#facc15" dot={false} strokeWidth={2.3} />
                </LineChart>
              </ResponsiveContainer>
            </GraphPanel>
          )}

          {(state.mode === "rc" || state.mode === "side-by-side") && (
            <GraphPanel title="RC Current vs Time">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 8, right: 12, left: 8, bottom: 10 }}>
                  <CartesianGrid stroke="#334155" strokeDasharray="4 4" />
                  <XAxis
                    dataKey="t"
                    type="number"
                    domain={[0, span]}
                    stroke="#94a3b8"
                    tick={{ fill: "#cbd5e1", fontSize: 12 }}
                    label={{ value: "t (s)", fill: "#e2e8f0", position: "insideBottom", offset: -2 }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fill: "#cbd5e1", fontSize: 12 }}
                    label={{ value: "Irc (A)", fill: "#e2e8f0", angle: -90, position: "insideLeft" }}
                  />
                  <RechartsTooltip
                    formatter={(value) => [`${formatNumber(Number(value), 3)} A`, "Irc"]}
                    labelFormatter={(label) => `t = ${formatNumber(Number(label), 3)} s`}
                    contentStyle={{ background: "#020617", border: "1px solid #334155", borderRadius: 10, color: "#e2e8f0" }}
                  />
                  <ReferenceLine x={time} stroke="#e2e8f0" strokeDasharray="4 4" />
                  <Line dataKey="irc" type="monotone" stroke="#22d3ee" dot={false} strokeWidth={2.3} />
                </LineChart>
              </ResponsiveContainer>
            </GraphPanel>
          )}

          {(state.mode === "lr" || state.mode === "side-by-side") && (
            <GraphPanel title="LR Current vs Time">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 8, right: 12, left: 8, bottom: 10 }}>
                  <CartesianGrid stroke="#334155" strokeDasharray="4 4" />
                  <XAxis
                    dataKey="t"
                    type="number"
                    domain={[0, span]}
                    stroke="#94a3b8"
                    tick={{ fill: "#cbd5e1", fontSize: 12 }}
                    label={{ value: "t (s)", fill: "#e2e8f0", position: "insideBottom", offset: -2 }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fill: "#cbd5e1", fontSize: 12 }}
                    label={{ value: "Ilr (A)", fill: "#e2e8f0", angle: -90, position: "insideLeft" }}
                  />
                  <RechartsTooltip
                    formatter={(value) => [`${formatNumber(Number(value), 3)} A`, "Ilr"]}
                    labelFormatter={(label) => `t = ${formatNumber(Number(label), 3)} s`}
                    contentStyle={{ background: "#020617", border: "1px solid #334155", borderRadius: 10, color: "#e2e8f0" }}
                  />
                  <ReferenceLine x={time} stroke="#e2e8f0" strokeDasharray="4 4" />
                  <Line dataKey="ilr" type="monotone" stroke="#38bdf8" dot={false} strokeWidth={2.3} />
                </LineChart>
              </ResponsiveContainer>
            </GraphPanel>
          )}

          {(state.mode === "lr" || state.mode === "side-by-side") && (
            <GraphPanel title="LR Inductor Voltage vs Time">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 8, right: 12, left: 8, bottom: 10 }}>
                  <CartesianGrid stroke="#334155" strokeDasharray="4 4" />
                  <XAxis
                    dataKey="t"
                    type="number"
                    domain={[0, span]}
                    stroke="#94a3b8"
                    tick={{ fill: "#cbd5e1", fontSize: 12 }}
                    label={{ value: "t (s)", fill: "#e2e8f0", position: "insideBottom", offset: -2 }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fill: "#cbd5e1", fontSize: 12 }}
                    label={{ value: "Vl (V)", fill: "#e2e8f0", angle: -90, position: "insideLeft" }}
                  />
                  <RechartsTooltip
                    formatter={(value) => [`${formatNumber(Number(value), 3)} V`, "Vl"]}
                    labelFormatter={(label) => `t = ${formatNumber(Number(label), 3)} s`}
                    contentStyle={{ background: "#020617", border: "1px solid #334155", borderRadius: 10, color: "#e2e8f0" }}
                  />
                  <ReferenceLine x={time} stroke="#e2e8f0" strokeDasharray="4 4" />
                  <Line dataKey="vlr" type="monotone" stroke="#93c5fd" dot={false} strokeWidth={2.3} />
                </LineChart>
              </ResponsiveContainer>
            </GraphPanel>
          )}
        </div>
      }
    />
  );
}
